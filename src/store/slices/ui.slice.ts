import { StateCreator } from 'zustand'

export interface UISlice {
  selectedItemId: string | null
  expandedItems: Record<string, boolean>
  setSelectedItem: (itemId: string | null) => void
  toggleExpanded: (itemId: string) => void
  setExpandedItems: (items: Record<string, boolean>) => void
}

export const createUISlice: StateCreator<UISlice> = (set) => ({
  selectedItemId: null,
  expandedItems: {},

  setSelectedItem: (itemId) => set({ selectedItemId: itemId }),

  toggleExpanded: (itemId) =>
    set((state) => ({
      expandedItems: {
        ...state.expandedItems,
        [itemId]: !state.expandedItems[itemId],
      },
    })),

  setExpandedItems: (items) => set({ expandedItems: items }),
})