import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SidebarState = {
  expandedSections: Record<string, boolean>;
  expandSection: (sectionTitle: string) => void;
  collapseSection: (sectionTitle: string) => void;
  toggleSection: (sectionTitle: string) => void;
  setSectionState: (sectionTitle: string, isExpanded: boolean) => void;
};

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      expandedSections: {},
      expandSection: (sectionTitle) =>
        set((state) => ({
          expandedSections: { ...state.expandedSections, [sectionTitle]: true },
        })),
      collapseSection: (sectionTitle) =>
        set((state) => ({
          expandedSections: { ...state.expandedSections, [sectionTitle]: false },
        })),
      toggleSection: (sectionTitle) =>
        set((state) => ({
          expandedSections: {
            ...state.expandedSections,
            [sectionTitle]: !state.expandedSections[sectionTitle],
          },
        })),
      setSectionState: (sectionTitle, isExpanded) =>
        set((state) => ({
          expandedSections: { ...state.expandedSections, [sectionTitle]: isExpanded },
        })),
    }),
    {
      name: 'sidebar-storage',
    }
  )
); 