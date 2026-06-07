'use client'

import { useRouter } from 'next/navigation'
import { Home } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@/store/auth-store'

// 开发模式：使用 AIYOU 的 dev server (localhost:5173)
// 生产模式：使用构建后的静态文件 (/aiyou/index.html)
const isDev = process.env.NODE_ENV === 'development'
const AIYOU_URL = isDev ? 'http://localhost:5173' : '/aiyou/index.html'

export default function CreativeSpacePage() {
  const router = useRouter()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNav, setShowNav] = useState(false)
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { accessToken } = useAuthStore()

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'AIYOU_READY') {
        setIsLoading(false)
        setError(null)
        // 发送 writer 的 access token 给 AIYOU
        if (accessToken) {
          iframeRef.current?.contentWindow?.postMessage(
            { type: 'AUTH_INFO', payload: accessToken },
            '*'
          )
        }
      }
      // 接收 AIYOU 保存的剧本数据
      if (e.data?.type === 'SAVE_SCRIPT') {
        const { scriptId, title, content } = e.data.payload || {}
        if (scriptId) {
          const existing = localStorage.getItem('creative-space-scripts')
          const scripts = existing ? JSON.parse(existing) : []
          scripts.push({ id: scriptId, title, content, createdAt: Date.now() })
          localStorage.setItem('creative-space-scripts', JSON.stringify(scripts))
        }
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [accessToken])

  // 超时检测（开发模式下 10 秒未收到 AIYOU_READY 则提示）
  useEffect(() => {
    if (!isDev) return
    const timer = setTimeout(() => {
      if (isLoading) {
        setError('无法连接到 AIYOU dev server，请确保已启动：cd ../3/AIYOU_open-ai-video-drama-generator && npm run dev')
      }
    }, 10000)
    return () => clearTimeout(timer)
  }, [isLoading])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.clientY < 40) {
      setShowNav(true)
      if (navTimerRef.current) clearTimeout(navTimerRef.current)
    } else if (e.clientY > 80) {
      if (navTimerRef.current) clearTimeout(navTimerRef.current)
      navTimerRef.current = setTimeout(() => setShowNav(false), 300)
    }
  }

  const handleMouseLeave = () => {
    if (navTimerRef.current) clearTimeout(navTimerRef.current)
    navTimerRef.current = setTimeout(() => setShowNav(false), 300)
  }

  return (
    <div
      className="relative h-screen bg-black"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 顶部导航栏 - 悬浮显示 */}
      <div
        className={`absolute top-0 left-0 right-0 z-20 transition-all duration-300 ease-out ${
          showNav
            ? 'translate-y-0 opacity-100'
            : '-translate-y-full opacity-0'
        }`}
      >
        <div className="flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-sm border-b border-zinc-200/50 shadow-sm">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>首页</span>
          </button>
          <div className="w-px h-4 bg-zinc-200" />
          <span className="text-sm font-medium text-zinc-900">创意空间</span>
        </div>
      </div>

      {/* AIYOU 嵌入区域 */}
      <div className="w-full h-full relative">
        {isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 z-10">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-zinc-600 border-t-white rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-zinc-400">创意空间加载中...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 z-10">
            <div className="text-center max-w-md px-6">
              <p className="text-sm text-red-400 mb-2">{error}</p>
              <button
                onClick={() => { setIsLoading(true); setError(null); }}
                className="text-xs text-zinc-400 hover:text-zinc-200 underline"
              >
                重试
              </button>
            </div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={AIYOU_URL}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </div>
  )
}
