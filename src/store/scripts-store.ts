import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ScriptsState {
  activeScriptId: string | null
  setActiveScript: (id: string | null) => void
}

export const useScriptsStore = create<ScriptsState>()(
  persist(
    (set) => ({
      activeScriptId: null,

      setActiveScript: (id) => {
        set({ activeScriptId: id })
      },
    }),
    {
      name: 'scripts-storage',
      version: 1,
      partialize: (state) => ({ activeScriptId: state.activeScriptId }),
      migrate: (persisted, version) => {
        if (version < 1) return { activeScriptId: null } as any
        return persisted
      },
    }
  )
)
