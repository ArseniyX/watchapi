import { createTRPCReact } from '@trpc/react-query'
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '../server/app'

export const trpc = createTRPCReact<AppRouter>()

function getBaseUrl() {
  if (typeof window !== 'undefined') return '' // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}` // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}` // dev SSR should use localhost
}

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      headers() {
        const token = localStorage.getItem('accessToken')
        return {
          authorization: token ? `Bearer ${token}` : undefined,
        }
      },
    }),
  ],
})

// Vanilla tRPC client for non-React code (e.g., store actions)
export const vanillaTrpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      headers() {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('accessToken')
          return {
            authorization: token ? `Bearer ${token}` : undefined,
          }
        }
        return {}
      },
    }),
  ],
})