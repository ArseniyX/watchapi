/**
 * JWT utility functions for client-side token management
 */

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  type: string;
  iss: string;
  aud: string;
  iat: number;
  exp: number;
  jti: string;
}

/**
 * Decode JWT without verification (client-side only for expiry check)
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

/**
 * Check if token is expired or will expire soon
 * @param token JWT token
 * @param bufferSeconds Number of seconds before expiry to consider token as expiring (default: 60s)
 * @returns true if token is expired or expiring soon
 */
export function isTokenExpiring(
  token: string,
  bufferSeconds: number = 60,
): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return true;

  const expiryTime = payload.exp * 1000; // Convert to milliseconds
  const now = Date.now();
  const bufferMs = bufferSeconds * 1000;

  return expiryTime - now < bufferMs;
}

/**
 * Get time until token expires in seconds
 */
export function getTimeUntilExpiry(token: string): number | null {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return null;

  const expiryTime = payload.exp * 1000;
  const now = Date.now();
  const timeLeft = expiryTime - now;

  return Math.max(0, Math.floor(timeLeft / 1000));
}
