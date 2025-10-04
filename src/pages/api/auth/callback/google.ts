import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { code } = req.query;

  if (!code) {
    return res.redirect("/login?error=no_code");
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_DOMAIN || `http://localhost:3000`}/api/auth/callback/google`,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error("Google token exchange failed:", tokenData);
      return res.redirect(
        `/login?error=google_auth_failed&details=${encodeURIComponent(tokenData.error_description || tokenData.error || "unknown")}`,
      );
    }

    // Get user info from Google
    const userResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      },
    );

    const googleUser = await userResponse.json();

    if (!googleUser.email) {
      return res.redirect("/login?error=no_email");
    }

    // Prepare OAuth profile data
    const profile = {
      id: googleUser.id,
      email: googleUser.email,
      name: googleUser.name,
      avatar: googleUser.picture,
    };

    // Call tRPC mutation to authenticate
    const authResponse = await fetch(
      `${process.env.NEXT_PUBLIC_DOMAIN || `http://localhost:3000`}/api/trpc/auth.oauthCallback`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: "google",
          profile,
        }),
      },
    );

    const authData = await authResponse.json();

    if (authData.result?.data) {
      const { tokens } = authData.result.data;

      // Redirect with tokens in URL (will be handled by client)
      return res.redirect(
        `/login?oauth_success=true&access_token=${encodeURIComponent(tokens.accessToken)}&refresh_token=${encodeURIComponent(tokens.refreshToken)}`,
      );
    }

    return res.redirect("/login?error=auth_failed");
  } catch (error) {
    console.error("Google OAuth error:", error);
    return res.redirect("/login?error=server_error");
  }
}
