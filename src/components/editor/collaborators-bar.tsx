'use client'

import { useCollaborationStore } from '@/store/collaboration-store'
import { Users } from 'lucide-react'

export function CollaboratorsBar() {
  const { collaborators, isCollaborating, isConnected } = useCollaborationStore()

  if (!isCollaborating) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-500">
        <Users className="w-3.5 h-3.5" />
        <span>{collaborators.length + 1} 在线</span>
        {isConnected && (
          <span className="w-2 h-2 bg-green-500 rounded-full ml-1" title="已连接" />
        )}
        {!isConnected && (
          <span className="w-2 h-2 bg-yellow-500 rounded-full ml-1 animate-pulse" title="连接中..." />
        )}
      </div>
      <div className="flex -space-x-2">
        {collaborators.map((c) => (
          <div
            key={c.userId}
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-white font-medium border-2 border-white"
            style={{ backgroundColor: c.color }}
            title={`${c.userName}${c.isTyping ? ' (正在输入...)' : ''}`}
          >
            {c.userName.charAt(0).toUpperCase()}
          </div>
        ))}
      </div>
      {collaborators.some((c) => c.isTyping) && (
        <span className="text-xs text-zinc-400 animate-pulse">
          {collaborators.filter((c) => c.isTyping).map((c) => c.userName).join(', ')} 正在输入...
        </span>
      )}
    </div>
  )
}
