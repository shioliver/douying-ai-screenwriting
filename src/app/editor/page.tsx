'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { EditorLayout } from '@/components/editor/editor-layout'
import { AuthGuard } from '@/components/auth-guard'
import { useAuthStore } from '@/store/auth-store'
import { useScripts } from '@/hooks/use-scripts-query'

function EditorPageContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const { isAuthenticated } = useAuthStore()
  // TanStack Query 自动管理加载和缓存，登录后自动请求
  useScripts()

  return <EditorLayout scriptId={id} />
}

export default function EditorPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="flex h-screen items-center justify-center text-zinc-400 text-sm">加载中...</div>}>
        <EditorPageContent />
      </Suspense>
    </AuthGuard>
  )
}
