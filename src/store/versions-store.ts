'use client'

import { create } from 'zustand'

interface ScriptVersion {
  versionId: string
  scriptId: string
  title: string
  content: string
  createdAt: string
  label: string
}

interface VersionsState {
  versions: Record<string, ScriptVersion[]>
  createVersion: (scriptId: string, title: string, content: string, label?: string) => void
  getVersions: (scriptId: string) => ScriptVersion[]
  clearVersions: (scriptId: string) => void
}

export const useVersionsStore = create<VersionsState>((set, get) => ({
  versions: {},

  createVersion: (scriptId, title, content, label = '手动保存') => {
    set((state) => {
      const versionId = Date.now().toString()
      const version: ScriptVersion = {
        versionId,
        scriptId,
        title,
        content,
        createdAt: new Date().toISOString().split('T')[0],
        label,
      }
      const previousVersions = state.versions[scriptId] || []
      return {
        versions: {
          ...state.versions,
          [scriptId]: [version, ...previousVersions].slice(0, 20),
        },
      }
    })
  },

  getVersions: (scriptId) => {
    return get().versions[scriptId] || []
  },

  clearVersions: (scriptId) => {
    set((state) => {
      const { [scriptId]: _, ...rest } = state.versions
      return { versions: rest }
    })
  },
}))
