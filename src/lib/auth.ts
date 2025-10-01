import { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  name?: string | null
  role: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  loginWithOAuth: (provider: 'github' | 'google') => void
  logout: () => void
  isLoading: boolean
}

export const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const getStoredToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('accessToken')
}

export const setStoredToken = (token: string) => {
  if (typeof window === 'undefined') return
  localStorage.setItem('accessToken', token)
}

export const removeStoredToken = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}