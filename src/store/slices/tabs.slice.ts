import { StateCreator } from "zustand";

export interface Tab {
  id: string;
  type: "request" | "collection";
  name: string;
  collectionId?: string;
  isDirty?: boolean;
  method?: string;
}

export interface TabsSlice {
  tabs: Tab[];
  activeTabId: string | null;

  // Actions
  addTab: (tab: Tab) => void;
  removeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTab: (tabId: string, updates: Partial<Tab>) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (tabId: string) => void;
}

export const createTabsSlice: StateCreator<TabsSlice> = (set, get) => ({
  tabs: [],
  activeTabId: null,

  addTab: (tab) =>
    set((state) => {
      // Check if tab already exists
      const existingTab = state.tabs.find((t) => t.id === tab.id);
      if (existingTab) {
        // Just set it as active
        return { activeTabId: tab.id };
      }
      // Add new tab and set as active
      return {
        tabs: [...state.tabs, tab],
        activeTabId: tab.id,
      };
    }),

  removeTab: (tabId) =>
    set((state) => {
      const newTabs = state.tabs.filter((t) => t.id !== tabId);
      let newActiveTabId = state.activeTabId;

      // If removing active tab, switch to adjacent tab
      if (state.activeTabId === tabId) {
        const currentIndex = state.tabs.findIndex((t) => t.id === tabId);
        if (newTabs.length > 0) {
          // Try next tab, otherwise previous
          const nextIndex = Math.min(currentIndex, newTabs.length - 1);
          newActiveTabId = newTabs[nextIndex]?.id || null;
        } else {
          newActiveTabId = null;
        }
      }

      return {
        tabs: newTabs,
        activeTabId: newActiveTabId,
      };
    }),

  setActiveTab: (tabId) => set({ activeTabId: tabId }),

  updateTab: (tabId, updates) =>
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId ? { ...tab, ...updates } : tab,
      ),
    })),

  closeAllTabs: () => set({ tabs: [], activeTabId: null }),

  closeOtherTabs: (tabId) =>
    set((state) => ({
      tabs: state.tabs.filter((t) => t.id === tabId),
      activeTabId: tabId,
    })),
});
