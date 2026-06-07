'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PendingSave {
  scriptId: string
  content: string
  title?: string
  timestamp: number
}

interface OfflineState {
  isOnline: boolean
  pendingSaves: PendingSave[]
  setOnline: (online: boolean) => void
  addPendingSave: (save: PendingSave) => void
  removePendingSave: (scriptId: string) => void
  clearPendingSaves: () => void
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set) => ({
      isOnline: true, // 默认在线，由 NetworkStatus 组件通过事件动态更新
      pendingSaves: [],

      setOnline: (online) => set({ isOnline: online }),

      addPendingSave: (save) =>
        set((state) => {
          // 同一剧本只保留最新的保存
          const filtered = state.pendingSaves.filter((s) => s.scriptId !== save.scriptId)
          return { pendingSaves: [...filtered, save] }
        }),

      removePendingSave: (scriptId) =>
        set((state) => ({
          pendingSaves: state.pendingSaves.filter((s) => s.scriptId !== scriptId),
        })),

      clearPendingSaves: () => set({ pendingSaves: [] }),
    }),
    {
      name: 'offline-saves',
      version: 1,
      partialize: (state) => ({ pendingSaves: state.pendingSaves }),
      migrate: (persisted, version) => {
        if (version < 1) return { pendingSaves: [] } as any
        return persisted
      },
    }
  )
)
