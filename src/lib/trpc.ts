import { createTRPCReact } from "@trpc/react-query";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../server/app";
import { useOrganizationStore } from "@/stores/organization-store";
import { setStoredToken, removeStoredToken } from "@/stores/auth-store";

export const trpc = createTRPCReact<AppRouter>();

function getBaseUrl() {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
}

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        removeStoredToken();
        return null;
      }

      const response = await fetch(`${getBaseUrl()}/api/trpc/auth.refreshToken`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken,
        }),
      });

      if (!response.ok) {
        removeStoredToken();
        return null;
      }

      const data = await response.json();
      const result = data.result?.data;

      if (result?.accessToken) {
        setStoredToken(result.accessToken);
        localStorage.setItem("refreshToken", result.refreshToken);
        return result.accessToken;
      }

      removeStoredToken();
      return null;
    } catch (error) {
      console.error("Token refresh failed:", error);
      removeStoredToken();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      headers() {
        const token = localStorage.getItem("accessToken");
        // Get orgId from Zustand store's persisted state
        const orgId = useOrganizationStore.getState().selectedOrgId;
        return {
          authorization: token ? `Bearer ${token}` : undefined,
          "x-organization-id": orgId || undefined,
        };
      },
      async fetch(url, options) {
        const response = await fetch(url, options);

        // Check for 401 Unauthorized
        if (response.status === 401) {
          console.log("Received 401, attempting token refresh...");
          const newToken = await refreshAccessToken();

          if (newToken) {
            // Retry the request with new token
            const retryOptions = {
              ...options,
              headers: {
                ...options?.headers,
                authorization: `Bearer ${newToken}`,
              },
            };
            return fetch(url, retryOptions);
          } else {
            // Refresh failed, redirect to login
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
          }
        }

        return response;
      },
    }),
  ],
});

// Vanilla tRPC client for non-React code (e.g., store actions)
export const vanillaTrpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      headers() {
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("accessToken");
          // Get orgId from Zustand store's persisted state
          const orgId = useOrganizationStore.getState().selectedOrgId;
          return {
            authorization: token ? `Bearer ${token}` : undefined,
            "x-organization-id": orgId || undefined,
          };
        }
        return {};
      },
      async fetch(url, options) {
        const response = await fetch(url, options);

        // Check for 401 Unauthorized
        if (response.status === 401 && typeof window !== "undefined") {
          console.log("Received 401, attempting token refresh...");
          const newToken = await refreshAccessToken();

          if (newToken) {
            // Retry the request with new token
            const retryOptions = {
              ...options,
              headers: {
                ...options?.headers,
                authorization: `Bearer ${newToken}`,
              },
            };
            return fetch(url, retryOptions);
          } else {
            // Refresh failed, redirect to login
            window.location.href = "/login";
          }
        }

        return response;
      },
    }),
  ],
});
