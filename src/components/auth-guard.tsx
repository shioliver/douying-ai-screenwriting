'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'

// 公开路径：仅首页和登录页允许未登录访问
// 编辑器、版本管理、付费功能等都需要登录
const publicPaths = ['/', '/login']

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!publicPaths.includes(pathname) && !isAuthenticated) {
      // 未登录访问受保护页面 → 引导到登录页
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [isAuthenticated, pathname, router])

  if (!publicPaths.includes(pathname) && !isAuthenticated) {
    // 渲染登录引导界面（避免空白）
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-900 flex items-center justify-center">
            <span className="text-2xl text-white">🔒</span>
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 mb-2">需要登录</h2>
          <p className="text-sm text-zinc-700 mb-6">
            请先登录后才能使用编剧平台
          </p>
          <button
            onClick={() => router.push(`/login?redirect=${encodeURIComponent(pathname)}`)}
            className="px-6 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-full hover:bg-zinc-800 transition-colors"
          >
            前往登录
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
