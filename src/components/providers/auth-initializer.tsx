"use client";

import { useEffect, useRef } from "react";
import { useAuthStore, getStoredToken } from "@/stores/auth-store";
import { useAuth } from "@/hooks/use-auth";
import { isTokenExpiring } from "@/lib/jwt-utils";

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

  // Proactive token refresh - check every 2 minutes and refresh if expiring soon
  useEffect(() => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const checkAndRefreshToken = async () => {
      const token = getStoredToken();
      if (!token) return;

      // Refresh if token expires in less than 3 minutes
      if (isTokenExpiring(token, 180)) {
        console.log("Token expiring soon, refreshing...");
        await verifyAndRefreshToken(token);
      }
    };

    // Check immediately
    checkAndRefreshToken();

    // Then check every 2 minutes
    const refreshInterval = setInterval(checkAndRefreshToken, 2 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, []); // Empty deps - set up once

  // Handle page visibility - refresh token when page becomes visible if expiring
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        const { user } = useAuthStore.getState();
        if (user) {
          const token = getStoredToken();
          if (token && isTokenExpiring(token, 180)) {
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
