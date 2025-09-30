import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAppStore } from '@/store'

/**
 * Syncs active tab with URL query parameter
 * URL format: ?tab=request-id
 */
export function useTabSync() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTabId = useAppStore((state) => state.activeTabId)
  const tabs = useAppStore((state) => state.tabs)
  const setActiveTab = useAppStore((state) => state.setActiveTab)

  // Track if we're updating to prevent circular updates
  const isUpdatingRef = useRef(false)

  // Sync URL to store on mount/URL change
  useEffect(() => {
    if (isUpdatingRef.current) return

    const tabIdFromUrl = searchParams.get('tab')
    if (tabIdFromUrl && tabIdFromUrl !== activeTabId) {
      // Check if tab exists in store
      const tabExists = tabs.find((t) => t.id === tabIdFromUrl)
      if (tabExists) {
        isUpdatingRef.current = true
        setActiveTab(tabIdFromUrl)
        setTimeout(() => {
          isUpdatingRef.current = false
        }, 0)
      }
    }
  }, [searchParams])

  // Sync store to URL when active tab changes
  useEffect(() => {
    if (isUpdatingRef.current) return

    const currentTabId = searchParams.get('tab')
    if (activeTabId && activeTabId !== currentTabId) {
      // Update URL without navigation
      isUpdatingRef.current = true
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', activeTabId)
      router.push(`?${params.toString()}`, { scroll: false })
      setTimeout(() => {
        isUpdatingRef.current = false
      }, 0)
    } else if (!activeTabId && currentTabId) {
      // Remove tab param if no active tab
      const params = new URLSearchParams(searchParams.toString())
      params.delete('tab')
      router.push(`?${params.toString()}`, { scroll: false })
    }
  }, [activeTabId])
}