'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Home } from 'lucide-react'
import { LeftSidebar } from './left-sidebar'
import { RightSidebar } from './right-sidebar'
import { AIFeedbackPanel } from './ai-feedback-panel'
import { useEditorStore } from '@/store/editor-store'

const EditorArea = dynamic(() => import('./editor-area').then(mod => ({ default: mod.EditorArea })), {
  ssr: false,
  loading: () => (
    <main className="flex-1 flex flex-col h-full bg-zinc-50">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-zinc-400 text-sm">加载中...</div>
      </div>
    </main>
  ),
})

interface EditorLayoutProps {
  scriptId: string | null
}

export function EditorLayout({ scriptId }: EditorLayoutProps) {
  const router = useRouter()
  const { leftSidebarOpen, rightSidebarOpen } = useEditorStore()

  return (
    <div className="flex flex-col h-screen w-full bg-white">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-100 bg-white flex-shrink-0">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>首页</span>
        </button>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
        {leftSidebarOpen && <div className="w-2 bg-zinc-100 flex-shrink-0" />}
        <EditorArea scriptId={scriptId} />
        {rightSidebarOpen && <div className="w-2 bg-zinc-100 flex-shrink-0" />}
        <RightSidebar />
      </div>
      <AIFeedbackPanel />
    </div>
  )
}
