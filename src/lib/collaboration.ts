'use client'

export interface Collaborator {
  userId: string
  userName: string
  color: string
  cursorPosition?: number
  isTyping: boolean
}

export interface CollaborationMessage {
  type: 'join' | 'leave' | 'cursor' | 'content' | 'typing' | 'user-list'
  userId: string
  userName?: string
  scriptId: string
  payload?: any
}

const COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#F97316',
]

export class CollaborationService {
  private ws: WebSocket | null = null
  private collaborators: Map<string, Collaborator> = new Map()
  private onCollaboratorsChange?: (collaborators: Collaborator[]) => void
  private onContentChange?: (content: string) => void
  private reconnectTimer: NodeJS.Timeout | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 3
  private userId: string
  private userName: string
  private scriptId: string | null = null
  private color: string

  constructor(userId: string, userName: string) {
    this.userId = userId
    this.userName = userName
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)]
  }

  connect(scriptId: string, wsUrl?: string) {
    const url = wsUrl ?? process.env.NEXT_PUBLIC_WS_URL

    if (!url) {
      console.warn('WebSocket URL not configured, collaboration disabled')
      return
    }

    this.scriptId = scriptId

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.disconnect()
    }

    this.ws = new WebSocket(url)

    this.ws.onopen = () => {
      this.reconnectAttempts = 0
      this.send({
        type: 'join',
        userId: this.userId,
        userName: this.userName,
        scriptId,
      })
    }

    this.ws.onmessage = (event) => {
      try {
        const message: CollaborationMessage = JSON.parse(event.data)
        this.handleMessage(message)
      } catch (e) {
        console.error('Failed to parse collaboration message:', e)
      }
    }

    this.ws.onclose = () => {
      this.scheduleReconnect(scriptId, url)
    }

    this.ws.onerror = () => {
      // 静默处理，避免在 WS 服务器未部署时刷屏
    }
  }

  disconnect() {
    if (this.scriptId) {
      this.send({
        type: 'leave',
        userId: this.userId,
        scriptId: this.scriptId,
      })
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  sendCursorChange(position: number) {
    if (this.scriptId) {
      this.send({
        type: 'cursor',
        userId: this.userId,
        scriptId: this.scriptId,
        payload: { position },
      })
    }
  }

  sendTyping(isTyping: boolean) {
    if (this.scriptId) {
      this.send({
        type: 'typing',
        userId: this.userId,
        scriptId: this.scriptId,
        payload: { isTyping },
      })
    }
  }

  sendContentChange(content: string) {
    if (this.scriptId) {
      this.send({
        type: 'content',
        userId: this.userId,
        scriptId: this.scriptId,
        payload: { content },
      })
    }
  }

  onCollaboratorsUpdate(callback: (collaborators: Collaborator[]) => void) {
    this.onCollaboratorsChange = callback
  }

  onRemoteContentChange(callback: (content: string) => void) {
    this.onContentChange = callback
  }

  getCollaborators(): Collaborator[] {
    return Array.from(this.collaborators.values())
  }

  private handleMessage(message: CollaborationMessage) {
    if (message.userId === this.userId) return

    switch (message.type) {
      case 'join':
      case 'user-list':
        if (message.userName) {
          this.collaborators.set(message.userId, {
            userId: message.userId,
            userName: message.userName,
            color: COLORS[message.userId.charCodeAt(0) % COLORS.length],
            isTyping: false,
          })
        }
        this.notifyCollaboratorsChange()
        break

      case 'leave':
        this.collaborators.delete(message.userId)
        this.notifyCollaboratorsChange()
        break

      case 'cursor':
        const collaborator = this.collaborators.get(message.userId)
        if (collaborator && message.payload?.position !== undefined) {
          collaborator.cursorPosition = message.payload.position
        }
        break

      case 'typing':
        const typingCollaborator = this.collaborators.get(message.userId)
        if (typingCollaborator && message.payload?.isTyping !== undefined) {
          typingCollaborator.isTyping = message.payload.isTyping
        }
        break

      case 'content':
        if (message.payload?.content) {
          this.onContentChange?.(message.payload.content)
        }
        break
    }
  }

  private notifyCollaboratorsChange() {
    this.onCollaboratorsChange?.(this.getCollaborators())
  }

  private scheduleReconnect(scriptId: string, wsUrl: string) {
    if (this.reconnectTimer) return
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('Collaboration: max reconnect attempts reached, giving up')
      return
    }
    this.reconnectAttempts++
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect(scriptId, wsUrl)
    }, 3000)
  }

  private send(message: Omit<CollaborationMessage, 'payload'> & { payload?: any }) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    }
  }
}
