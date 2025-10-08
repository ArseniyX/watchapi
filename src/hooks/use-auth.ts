"use client";

import { useEffect, useCallback } from "react";
import { useAuthStore, getStoredToken, setStoredToken, removeStoredToken } from "@/stores/auth-store";
import { trpc } from "@/lib/trpc";

export function useAuth() {
  const { user, isLoading, isInitialized, setUser, setIsLoading, setIsInitialized, logout } = useAuthStore();

  const loginMutation = trpc.auth.login.useMutation();
  const registerMutation = trpc.auth.register.useMutation();
  const refreshTokenMutation = trpc.auth.refreshToken.useMutation();

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginMutation.mutateAsync({ email, password });
    setStoredToken(result.tokens.accessToken);
    localStorage.setItem("refreshToken", result.tokens.refreshToken);
    setUser(result.user);
  }, [loginMutation, setUser]);

  const register = useCallback(async (
    email: string,
    password: string,
    name?: string,
    invitationToken?: string,
  ) => {
    const result = await registerMutation.mutateAsync({
      email,
      password,
      name,
      invitationToken,
    });
    setStoredToken(result.tokens.accessToken);
    localStorage.setItem("refreshToken", result.tokens.refreshToken);
    setUser(result.user);
  }, [registerMutation, setUser]);

  const loginWithOAuth = useCallback((
    provider: "github" | "google",
    invitationToken?: string,
  ) => {
    sessionStorage.setItem("oauth_provider", provider);

    if (invitationToken) {
      document.cookie = `oauth_invitation_token=${invitationToken}; path=/; max-age=600`;
    }

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
  }, []);

  const verifyAndRefreshToken = useCallback(async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(
        "/api/trpc/auth.verifyToken?input=" +
          encodeURIComponent(JSON.stringify({ token })),
      );
      const data = await response.json();

      if (data.result?.data) {
        setUser(data.result.data);
        return true;
      }

      // Token invalid, try refresh
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        const newTokens = await refreshTokenMutation.mutateAsync({ refreshToken });
        setStoredToken(newTokens.accessToken);
        localStorage.setItem("refreshToken", newTokens.refreshToken);

        // Verify new token
        const newResponse = await fetch(
          "/api/trpc/auth.verifyToken?input=" +
            encodeURIComponent(JSON.stringify({ token: newTokens.accessToken })),
        );
        const newData = await newResponse.json();

        if (newData.result?.data) {
          setUser(newData.result.data);
          return true;
        }
      }

      removeStoredToken();
      return false;
    } catch (error) {
      console.error("Token verification error:", error);
      removeStoredToken();
      return false;
    }
  }, [refreshTokenMutation, setUser]);

  return {
    user,
    isLoading,
    isInitialized,
    login,
    register,
    loginWithOAuth,
    logout,
    verifyAndRefreshToken,
  };
}
