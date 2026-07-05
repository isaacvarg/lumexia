import { User, getUser } from "@/actions/users/getUser"
import { getUserConfig } from "@/actions/users/getUserConfig"
import { create } from "zustand"

export type Language = 'en' | 'es'

type State = {
  user: User | null
  language: Language
  isSidebarCollapsed: boolean
  // Controls the off-canvas sidebar drawer on mobile (< md). Desktop ignores this.
  isMobileSidebarOpen: boolean

}

type Actions = {
  actions: {
    getUser: () => void;
    getLanguage: () => void;
    toggleSidebarCollapse: () => void;
    toggleMobileSidebar: () => void;
    closeMobileSidebar: () => void;
  }
}

export const useAppSelection = create<State & Actions>((set, get) => ({
  user: null,
  language: 'en' as Language,
  isSidebarCollapsed: false,
  isMobileSidebarOpen: false,

  actions: {
    getUser: async () => {
      try {
        const user = await getUser();
        set(() => ({ user, }))
      } catch (error) {
        console.error(error);
      }

    },

    getLanguage: async () => {

      try {
        const lang = await getUserConfig('language')
        if (!lang) {
          set(() => ({ language: 'en' }))
        } else {
          set(() => ({ language: lang.value as Language }))
        }
      } catch (error) {
        console.error(error)
      }
    },

    toggleSidebarCollapse: () => {
      set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed }))
    },

    toggleMobileSidebar: () => {
      set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen }))
    },

    closeMobileSidebar: () => {
      set(() => ({ isMobileSidebarOpen: false }))
    }

  },



}))

export const useAppActions = () => useAppSelection((state) => state.actions)
