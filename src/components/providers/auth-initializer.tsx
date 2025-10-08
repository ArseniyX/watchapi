"use client";

import { useEffect, useRef } from "react";
import { useAuthStore, getStoredToken } from "@/stores/auth-store";
import { useAuth } from "@/hooks/use-auth";

export function AuthInitializer() {
  const { isInitialized, setIsLoading, setIsInitialized } = useAuthStore();
  const { verifyAndRefreshToken } = useAuth();
  const initRef = useRef(false);

  // Initialize auth state once on mount
  useEffect(() => {
    if (initRef.current || isInitialized) return;
    initRef.current = true;

    const initAuth = async () => {
      const token = getStoredToken();

      if (!token) {
        setIsLoading(false);
        setIsInitialized(true);
        return;
      }

      await verifyAndRefreshToken(token);
      setIsLoading(false);
      setIsInitialized(true);
    };

    initAuth();
  }, []); // Empty deps - only run once

  // Periodic token refresh (every 6 days)
  useEffect(() => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const refreshInterval = setInterval(
      async () => {
        const token = getStoredToken();
        if (token) {
          await verifyAndRefreshToken(token);
        }
      },
      6 * 24 * 60 * 60 * 1000, // 6 days
    );

    return () => clearInterval(refreshInterval);
  }, []); // Empty deps - set up once

  // Handle page visibility - refresh token when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        const { user } = useAuthStore.getState();
        if (user) {
          const token = getStoredToken();
          if (token) {
            await verifyAndRefreshToken(token);
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []); // Empty deps - set up once

  return null;
}
