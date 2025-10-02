import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { code } = req.query

  if (!code) {
    return res.redirect('/login?error=no_code')
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GH_CLIENT_ID,
        client_secret: process.env.GH_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_DOMAIN || `http://localhost:3000`}/api/auth/callback/github`,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenData.access_token) {
      console.error('GitHub token exchange failed:', tokenData)
      return res.redirect(`/login?error=github_auth_failed&details=${encodeURIComponent(tokenData.error_description || tokenData.error || 'unknown')}`)
    }

    // Get user info from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const githubUser = await userResponse.json()

    // Get user email if not public
    let email = githubUser.email
    if (!email) {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      })
      const emails = await emailResponse.json()
      const primaryEmail = emails.find((e: any) => e.primary)
      email = primaryEmail?.email || emails[0]?.email
    }

    if (!email) {
      return res.redirect('/login?error=no_email')
    }

    // Prepare OAuth profile data
    const profile = {
      id: String(githubUser.id),
      email,
      name: githubUser.name || githubUser.login,
      avatar: githubUser.avatar_url,
    }

    // Call tRPC mutation to authenticate
    const authResponse = await fetch(
      `${process.env.NEXT_PUBLIC_DOMAIN || `http://localhost:3000`}/api/trpc/auth.oauthCallback`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'github',
          profile,
        }),
      }
    )

    const authData = await authResponse.json()

    if (authData.result?.data) {
      const { tokens } = authData.result.data

      // Redirect with tokens in URL (will be handled by client)
      return res.redirect(
        `/login?oauth_success=true&access_token=${encodeURIComponent(tokens.accessToken)}&refresh_token=${encodeURIComponent(tokens.refreshToken)}`
      )
    }

    return res.redirect('/login?error=auth_failed')
  } catch (error) {
    console.error('GitHub OAuth error:', error)
    return res.redirect('/login?error=server_error')
  }
}
