import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { UISlice, createUISlice } from "./slices/ui.slice";
import { TabsSlice, createTabsSlice } from "./slices/tabs.slice";

// Zustand stores ONLY UI state, not server data
// Server data is managed by tRPC/React Query
export type AppStore = UISlice & TabsSlice;

export const useAppStore = create<AppStore>()(
  devtools(
    (...a) => ({
      ...createUISlice(...a),
      ...createTabsSlice(...a),
    }),
    { name: "AppStore" },
  ),
);

// Re-export types
export type { Tab } from "./slices/tabs.slice";
