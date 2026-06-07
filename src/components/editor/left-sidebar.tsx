'use client'

import { useEditorStore } from '@/store/editor-store'
import { useAuthStore } from '@/store/auth-store'
import { useRouter } from 'next/navigation'
import {
  FileText,
  Users,
  Package,
  MapPin,
  Camera,
  Clapperboard,
  Folder,
  PanelLeftClose,
  PanelLeft,
  Settings,
  Globe,
  Sun,
  LogOut,
  MessageSquare,
  FileClock,
  ChevronRight,
  Zap,
  Package as PackageIcon,
  User as UserIcon,
} from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'

const iconMap: Record<string, typeof FileText> = {
  'file-text': FileText,
  'users': Users,
  'package': Package,
  'map-pin': MapPin,
  'camera': Camera,
  'clapperboard': Clapperboard,
  'folder': Folder,
}

function UserPopup({ onClose, anchorRef }: { onClose: () => void; anchorRef: React.RefObject<HTMLButtonElement | null> }) {
  const popupRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const updatePosition = useCallback(() => {
    if (!anchorRef.current) return
    const rect = anchorRef.current.getBoundingClientRect()
    const popupWidth = 220
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    const wouldOverflowRight = rect.left + popupWidth > viewportWidth - 16
    const popupHeight = 380
    const wouldOverflowBottom = rect.bottom + popupHeight + 8 > viewportHeight - 16

    setPosition({
      top: wouldOverflowBottom ? viewportHeight - popupHeight - 16 : rect.bottom + 8,
      left: wouldOverflowRight ? viewportWidth - popupWidth - 16 : rect.left,
    })
  }, [anchorRef])

  useEffect(() => {
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [updatePosition])

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setVisible(true)
      })
    })
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleLogout = () => {
    logout()
    onClose()
    router.push('/login')
  }

  const displayName = user?.name || '游客'
  const displayEmail = user?.email || ''
  const initials = user?.avatar || displayName.slice(0, 2).toUpperCase()
  const planLabel = user?.plan === 'pro' ? '专业版' : user?.plan === 'enterprise' ? '企业版' : '免费版'

  return createPortal(
    <div
      ref={popupRef}
      className={`fixed w-[220px] max-h-[80vh] overflow-y-auto bg-white rounded-lg shadow-lg border border-zinc-200/80 z-[100] transition-all duration-200 ease-out ${
        visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'
      }`}
      style={{ top: position.top, left: position.left }}
    >
      <div className="p-3 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-orange-400 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-zinc-900 truncate">{displayName}</p>
            <p className="text-[10px] text-zinc-500 truncate">{displayEmail}</p>
          </div>
          <button className="px-2 py-1 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-[10px] font-medium rounded-md hover:from-emerald-700 hover:to-emerald-600 transition-all flex-shrink-0">
            升级
          </button>
        </div>
      </div>

      <div className="py-1">
        <div className="flex items-center justify-between px-3 py-1.5">
          <div className="flex items-center gap-1.5 text-xs text-zinc-600">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>积分</span>
          </div>
          <span className="text-xs font-semibold text-zinc-900">140</span>
        </div>
        <div className="flex items-center justify-between px-3 py-1.5">
          <div className="flex items-center gap-1.5 text-xs text-zinc-600">
            <PackageIcon className="w-3.5 h-3.5 text-blue-500" />
            <span>套餐</span>
          </div>
          <span className="text-[10px] text-zinc-400">{planLabel}</span>
        </div>
      </div>

      <div className="border-t border-zinc-100 py-1">
        <button className="w-full flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50 transition-colors">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>反馈</span>
        </button>
        <button className="w-full flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50 transition-colors">
          <FileClock className="w-3.5 h-3.5" />
          <span>更新日志</span>
        </button>
      </div>

      <div className="border-t border-zinc-100 py-1">
        <button className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50 transition-colors">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            <span>简体中文</span>
          </div>
          <Globe className="w-3.5 h-3.5 text-zinc-400" />
        </button>
        <button className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50 transition-colors">
          <div className="flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5" />
            <span>白天</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        </button>
        <button className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50 transition-colors">
          <div className="flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5" />
            <span>设置</span>
          </div>
          <Settings className="w-3.5 h-3.5 text-zinc-400" />
        </button>
      </div>

      <div className="border-t border-zinc-100 py-1">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>退出登录</span>
        </button>
      </div>
    </div>,
    document.body
  )
}

export function LeftSidebar() {
  const { tags, activeTag, setActiveTag, leftSidebarOpen, toggleLeftSidebar } = useEditorStore()
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [isAnimating, setIsAnimating] = useState(false)
  const [shouldRender, setShouldRender] = useState(leftSidebarOpen)
  const [showPopup, setShowPopup] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (leftSidebarOpen) {
      setShouldRender(true)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true)
        })
      })
    } else {
      setIsAnimating(false)
      setShowPopup(false)
      const timer = setTimeout(() => setShouldRender(false), 400)
      return () => clearTimeout(timer)
    }
  }, [leftSidebarOpen])

  if (!shouldRender) {
    return (
      <div
        className="group relative w-0 flex-shrink-0"
        onMouseEnter={toggleLeftSidebar}
      >
        <div className="absolute left-0 top-0 bottom-0 w-3 cursor-pointer z-10" />
      </div>
    )
  }

  return (
    <aside
      className={`relative flex-shrink-0 overflow-hidden transition-all duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${
        isAnimating ? 'w-56 opacity-100' : 'w-0 opacity-0'
      }`}
    >
      <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-r border-zinc-200/50">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-zinc-100/50">
            <h2 className="text-sm font-semibold text-zinc-900">抖影</h2>
            <button
              onClick={toggleLeftSidebar}
              className="p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100/50 rounded transition-colors"
              title="收起左侧栏"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto py-2">
            {tags.map((tag, index) => {
              const Icon = iconMap[tag.icon] || FileText
              const isActive = activeTag === tag.id
              return (
                <button
                  key={tag.id}
                  onClick={() => setActiveTag(tag.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-300 ${
                    isAnimating ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                  } ${
                    isActive
                      ? 'bg-zinc-100/80 text-zinc-900 font-medium'
                      : 'text-zinc-600 hover:bg-zinc-50/80 hover:text-zinc-900'
                  }`}
                  style={{ transitionDelay: isAnimating ? `${index * 40 + 100}ms` : '0ms' }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="flex-1 text-left">{tag.label}</span>
                </button>
              )
            })}
          </nav>
          <div
            className={`p-4 border-t border-zinc-100/50 transition-all duration-300 delay-300 ${
              isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            {showPopup && <UserPopup onClose={() => setShowPopup(false)} anchorRef={triggerRef} />}
            {isAuthenticated && user ? (
              <button
                ref={triggerRef}
                onClick={() => setShowPopup(!showPopup)}
                className="flex items-center gap-2 w-full hover:bg-zinc-50 rounded-lg p-1 -m-1 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-orange-400 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                  {(user.avatar || user.name || 'U').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-zinc-900 truncate">{user.name}</p>
                  <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                </div>
                <Settings className="w-4 h-4 text-zinc-400 flex-shrink-0" />
              </button>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="flex items-center gap-2 w-full hover:bg-zinc-50 rounded-lg p-1 -m-1 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 text-xs font-medium flex-shrink-0">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-zinc-900">请登录</p>
                  <p className="text-xs text-zinc-500">登录以同步数据</p>
                </div>
                <Settings className="w-4 h-4 text-zinc-400 flex-shrink-0" />
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
