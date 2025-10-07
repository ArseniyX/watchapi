import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OrganizationStore {
  selectedOrgId: string | null;
  setSelectedOrgId: (orgId: string | null) => void;
}

export const useOrganizationStore = create<OrganizationStore>()(
  persist(
    (set) => ({
      selectedOrgId: null,
      setSelectedOrgId: (orgId) => set({ selectedOrgId: orgId }),
    }),
    {
      name: "organization-storage",
    }
  )
);
