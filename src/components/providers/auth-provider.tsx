"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import {
  AuthContext,
  getStoredToken,
  setStoredToken,
  removeStoredToken,
} from "../../lib/auth";
import { trpc } from "../../lib/trpc";

interface User {
  id: string;
  email: string;
  name?: string | null;
  role: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const loginMutation = trpc.auth.login.useMutation();
  const registerMutation = trpc.auth.register.useMutation();
  const refreshTokenMutation = trpc.auth.refreshToken.useMutation();

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getStoredToken();

      if (!token) {
        setIsLoading(false);
        setIsInitialized(true);
        return;
      }

      try {
        // Try to verify the current token
        const response = await fetch(
          "/api/trpc/auth.verifyToken?input=" +
            encodeURIComponent(JSON.stringify({ token })),
        );
        const data = await response.json();

        if (data.result?.data) {
          setUser(data.result.data);
        } else {
          // Token is invalid, try to refresh
          const refreshToken = localStorage.getItem("refreshToken");
          if (refreshToken) {
            try {
              const newTokens = await refreshTokenMutation.mutateAsync({
                refreshToken,
              });
              setStoredToken(newTokens.accessToken);
              localStorage.setItem("refreshToken", newTokens.refreshToken);

              // Verify new token
              const newResponse = await fetch(
                "/api/trpc/auth.verifyToken?input=" +
                  encodeURIComponent(
                    JSON.stringify({ token: newTokens.accessToken }),
                  ),
              );
              const newData = await newResponse.json();

              if (newData.result?.data) {
                setUser(newData.result.data);
              } else {
                removeStoredToken();
              }
            } catch (error) {
              removeStoredToken();
            }
          } else {
            removeStoredToken();
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        removeStoredToken();
      }

      setIsLoading(false);
      setIsInitialized(true);
    };

    if (!isInitialized) {
      initAuth();
    }
  }, [isInitialized, refreshTokenMutation]);

  const login = async (email: string, password: string) => {
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      setStoredToken(result.tokens.accessToken);
      localStorage.setItem("refreshToken", result.tokens.refreshToken);
      setUser(result.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      const result = await registerMutation.mutateAsync({
        email,
        password,
        name,
      });
      setStoredToken(result.tokens.accessToken);
      localStorage.setItem("refreshToken", result.tokens.refreshToken);
      setUser(result.user);
    } catch (error) {
      throw error;
    }
  };

  const loginWithOAuth = (provider: "github" | "google") => {
    // Store the provider in session storage to handle callback
    sessionStorage.setItem("oauth_provider", provider);

    // Redirect to OAuth provider
    const baseUrl = window.location.origin;
    const redirectUri = `${baseUrl}/api/auth/callback/${provider}`;

    if (provider === "github") {
      const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
      window.location.href = githubAuthUrl;
    } else if (provider === "google") {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email profile`;
      window.location.href = googleAuthUrl;
    }
  };

  const logout = () => {
    removeStoredToken();
    setUser(null);
  };

  // Periodic token refresh (every 6 days)
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(
      async () => {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          try {
            const newTokens = await refreshTokenMutation.mutateAsync({
              refreshToken,
            });
            setStoredToken(newTokens.accessToken);
            localStorage.setItem("refreshToken", newTokens.refreshToken);
          } catch (error) {
            console.error("Token refresh failed:", error);
            logout();
          }
        }
      },
      6 * 24 * 60 * 60 * 1000,
    ); // 6 days

    return () => clearInterval(refreshInterval);
  }, [user, refreshTokenMutation]);

  // Handle page visibility - refresh token when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible" && user) {
        const token = getStoredToken();
        if (token) {
          try {
            const response = await fetch(
              "/api/trpc/auth.verifyToken?input=" +
                encodeURIComponent(JSON.stringify({ token })),
            );
            const data = await response.json();

            if (!data.result?.data) {
              // Token expired, try refresh
              const refreshToken = localStorage.getItem("refreshToken");
              if (refreshToken) {
                const newTokens = await refreshTokenMutation.mutateAsync({
                  refreshToken,
                });
                setStoredToken(newTokens.accessToken);
                localStorage.setItem("refreshToken", newTokens.refreshToken);
              } else {
                logout();
              }
            }
          } catch (error) {
            console.error("Token verification failed:", error);
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [user, refreshTokenMutation]);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        loginWithOAuth,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
