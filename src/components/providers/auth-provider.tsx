'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { AuthContext, getStoredToken, setStoredToken, removeStoredToken } from '../../lib/auth'
import { trpc } from '../../lib/trpc'

interface User {
  id: string
  email: string
  name?: string | null
  role: string
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loginMutation = trpc.auth.login.useMutation()
  const registerMutation = trpc.auth.register.useMutation()
  const verifyTokenQuery = trpc.auth.verifyToken.useQuery(
    { token: getStoredToken() || '' },
    {
      enabled: !!getStoredToken(),
      retry: false,
      refetchOnWindowFocus: false,
    }
  )

  useEffect(() => {
    const initAuth = async () => {
      const token = getStoredToken()

      if (!token) {
        setIsLoading(false)
        return
      }

      // Wait for the query to complete
      if (verifyTokenQuery.data) {
        setUser(verifyTokenQuery.data)
      } else if (verifyTokenQuery.error) {
        // Token is invalid, remove it
        removeStoredToken()
        setUser(null)
      }

      if (!verifyTokenQuery.isLoading) {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [verifyTokenQuery.data, verifyTokenQuery.error, verifyTokenQuery.isLoading])

  const login = async (email: string, password: string) => {
    try {
      const result = await loginMutation.mutateAsync({ email, password })
      setStoredToken(result.tokens.accessToken)
      localStorage.setItem('refreshToken', result.tokens.refreshToken)
      setUser(result.user)
    } catch (error) {
      throw error
    }
  }

  const register = async (email: string, password: string, name?: string) => {
    try {
      const result = await registerMutation.mutateAsync({ email, password, name })
      setStoredToken(result.tokens.accessToken)
      localStorage.setItem('refreshToken', result.tokens.refreshToken)
      setUser(result.user)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    removeStoredToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}