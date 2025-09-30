import { StateCreator } from 'zustand'

// Don't store server data in Zustand - tRPC/React Query handles that
// Zustand is only for UI state that's not tied to server data