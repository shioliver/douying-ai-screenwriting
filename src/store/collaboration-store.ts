'use client'

import { create } from 'zustand'
import { CollaborationService, Collaborator } from '@/lib/collaboration'

interface CollaborationState {
  service: CollaborationService | null
  collaborators: Collaborator[]
  isConnected: boolean
  isCollaborating: boolean
  currentScriptId: string | null

  startCollaboration: (scriptId: string, userId: string, userName: string, wsUrl?: string) => void
  stopCollaboration: () => void
  updateCollaborators: (collaborators: Collaborator[]) => void
  sendCursorChange: (position: number) => void
  sendTyping: (isTyping: boolean) => void
  sendContentChange: (content: string) => void
}

export const useCollaborationStore = create<CollaborationState>((set, get) => ({
  service: null,
  collaborators: [],
  isConnected: false,
  isCollaborating: false,
  currentScriptId: null,

  startCollaboration: (scriptId, userId, userName, wsUrl) => {
    const { service: existingService } = get()
    if (existingService) {
      existingService.disconnect()
    }

    const finalUrl = wsUrl ?? process.env.NEXT_PUBLIC_WS_URL
    if (!finalUrl) {
      // 未配置协作服务器，跳过
      return
    }

    const service = new CollaborationService(userId, userName)

    service.onCollaboratorsUpdate((collaborators) => {
      set({ collaborators, isConnected: true })
    })

    service.connect(scriptId, finalUrl)

    set({
      service,
      isCollaborating: true,
      currentScriptId: scriptId,
    })
  },

  stopCollaboration: () => {
    const { service } = get()
    if (service) {
      service.disconnect()
    }
    set({
      service: null,
      collaborators: [],
      isConnected: false,
      isCollaborating: false,
      currentScriptId: null,
    })
  },

  updateCollaborators: (collaborators) => {
    set({ collaborators })
  },

  sendCursorChange: (position) => {
    const { service } = get()
    if (service) {
      service.sendCursorChange(position)
    }
  },

  sendTyping: (isTyping) => {
    const { service } = get()
    if (service) {
      service.sendTyping(isTyping)
    }
  },

  sendContentChange: (content) => {
    const { service } = get()
    if (service) {
      service.sendContentChange(content)
    }
  },
}))
