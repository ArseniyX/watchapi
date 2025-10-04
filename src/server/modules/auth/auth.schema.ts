import { z } from "zod";

// Authentication schemas
export const registerSchema = z.object({
  email: z.string().email("Invalid email format").min(1, "Email is required"),
  name: z.string().min(1, "Name cannot be empty").optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

// OAuth schemas
export const oauthProviderSchema = z.enum(["google", "github"]);

export const oauthProfileSchema = z.object({
  id: z.string().min(1, "Profile ID is required"),
  email: z.string().email("Invalid email format"),
  name: z.string().optional(),
  avatar: z.string().url("Invalid avatar URL").optional(),
});

export const oauthCallbackSchema = z.object({
  provider: oauthProviderSchema,
  profile: oauthProfileSchema,
});

// Token schemas
export const verifyTokenSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

// Response schemas (for type safety)
export const authTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

// Infer types from schemas
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OAuthProvider = z.infer<typeof oauthProviderSchema>;
export type OAuthProfile = z.infer<typeof oauthProfileSchema> & {
  provider: OAuthProvider;
};
export type OAuthCallbackInput = z.infer<typeof oauthCallbackSchema>;
export type VerifyTokenInput = z.infer<typeof verifyTokenSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type AuthTokens = z.infer<typeof authTokensSchema>;
