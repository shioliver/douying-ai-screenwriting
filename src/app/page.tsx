'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Plus,
  Clock,
  Users,
  Trash2,
  FileText,
  Settings,
  Globe,
  Sun,
  LogOut,
  MessageSquare,
  FileClock,
  ChevronRight,
  Zap,
  Package as PackageIcon,
  ArrowUp,
  Sparkles,
} from 'lucide-react'
import { useScripts, useCreateScript, useUpdateScript, useDeleteScript, useDeleteScripts } from '@/hooks/use-scripts-query'
import { useAIStore } from '@/store/ai-store'
import { useAuthStore } from '@/store/auth-store'
import { User as UserIcon } from 'lucide-react'
import { AISettingsDialog } from '@/components/ai-settings-dialog'

function getTimeAgo(dateStr: string) {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  if (diffHours < 1) return '刚刚'
  if (diffHours < 24) return `${diffHours}小时前`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}天前`
  return dateStr
}

function getPreview(content: string) {
  const plain = content.replace(/<[^>]*>/g, '')
  return plain.slice(0, 60) || '开始你的创作之旅...'
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

  const displayName = user?.name || '用户'
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

function ScriptCard({
  id,
  title,
  content,
  updatedAt,
  onOpen,
}: {
  id: string
  title: string
  content: string
  updatedAt: string
  onOpen: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(title)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { data: scripts = [] } = useScripts()
  const updateScriptMutation = useUpdateScript()
  const deleteScriptsMutation = useDeleteScripts()
  const renameScript = (id: string, title: string) => updateScriptMutation.mutate({ scriptId: id, title })
  const deleteScriptsLocal = (ids: string[]) => deleteScriptsMutation.mutate(ids)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  useEffect(() => {
    setEditTitle(title)
  }, [title])

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditTitle(title)
    setEditing(true)
  }

  const handleConfirm = () => {
    if (editTitle.trim()) {
      renameScript(id, editTitle.trim())
    }
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirm()
    if (e.key === 'Escape') {
      setEditTitle(title)
      setEditing(false)
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    if (!editing) {
      onOpen(id)
    }
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    const idsToDelete = scripts
      .filter((s) => s.title === title)
      .map((s) => s.id)
    deleteScriptsLocal(idsToDelete)
    setShowDeleteConfirm(false)
  }

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteConfirm(false)
  }

  return (
    <div
      onClick={handleClick}
      className="w-44 h-56 flex flex-col bg-white border border-zinc-200 rounded-xl shadow-sm hover:shadow-md hover:border-zinc-300 transition-all text-left overflow-hidden cursor-pointer"
    >
      <div className="flex-1 p-4 overflow-hidden">
        {editing ? (
          <input
            ref={inputRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleConfirm}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="text-sm font-semibold text-zinc-900 w-full bg-transparent border-b-2 border-blue-500 focus:outline-none"
          />
        ) : (
          <p
            onDoubleClick={handleDoubleClick}
            className="text-sm font-semibold text-zinc-900 truncate hover:text-blue-600 transition-colors"
            title="双击重命名"
          >
            {title}
          </p>
        )}
        <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed line-clamp-4">
          {getPreview(content)}
        </p>
      </div>
      <div className="relative px-4 py-2 border-t border-zinc-100">
        <p className="text-[10px] text-zinc-400">最近编辑 {getTimeAgo(updatedAt)}</p>
        {showDeleteConfirm ? (
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            <button
              onClick={handleConfirmDelete}
              className="px-1.5 py-0.5 text-[10px] text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
            >
              确认
            </button>
            <button
              onClick={handleCancelDelete}
              className="px-1.5 py-0.5 text-[10px] text-zinc-600 bg-zinc-100 rounded hover:bg-zinc-200 transition-colors"
            >
              取消
            </button>
          </div>
        ) : (
          <button
            onClick={handleDeleteClick}
            className="absolute bottom-2 right-2 p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            title="删除所有同名剧本"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

function ScriptRow({
  id,
  title,
  updatedAt,
  onOpen,
  selected,
  onSelect,
  onDelete,
  isSelectionMode,
}: {
  id: string
  title: string
  updatedAt: string
  onOpen: (id: string) => void
  selected: boolean
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  isSelectionMode: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(title)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const updateScriptMutation = useUpdateScript()
  const renameScript = (id: string, t: string) => updateScriptMutation.mutate({ scriptId: id, title: t })

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditTitle(title)
    setEditing(true)
  }

  const handleConfirm = () => {
    if (editTitle.trim()) {
      renameScript(id, editTitle.trim())
    }
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirm()
    if (e.key === 'Escape') {
      setEditTitle(title)
      setEditing(false)
    }
  }

  const handleRowClick = (e: React.MouseEvent) => {
    if (isSelectionMode) {
      e.stopPropagation()
      onSelect(id)
    } else {
      onOpen(id)
    }
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onDelete(id)
    setShowDeleteConfirm(false)
  }

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setShowDeleteConfirm(false)
  }

  return (
    <div
      onClick={handleRowClick}
      className={`w-full flex items-center gap-3 px-4 py-3 bg-white border rounded-lg transition-all text-left cursor-pointer ${
        selected
          ? 'border-blue-400 bg-blue-50/50 shadow-sm'
          : 'border-zinc-200 hover:border-zinc-300 hover:shadow-sm'
      }`}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onSelect(id)}
        onClick={(e) => e.stopPropagation()}
        className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
      />
      <FileText className="w-4 h-4 text-zinc-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            ref={inputRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleConfirm}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="text-sm font-medium text-zinc-900 w-full bg-transparent border-b-2 border-blue-500 focus:outline-none"
          />
        ) : (
          <p
            onDoubleClick={handleDoubleClick}
            className="text-sm font-medium text-zinc-900 truncate hover:text-blue-600 transition-colors"
            title="双击重命名"
          >
            {title}
          </p>
        )}
        <p className="text-xs text-zinc-400">{updatedAt}</p>
      </div>
      {!isSelectionMode && (
        <div
          className="relative flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {showDeleteConfirm ? (
            <div className="flex items-center gap-1">
              <button
                onClick={handleConfirmDelete}
                className="px-2 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
              >
                确认
              </button>
              <button
                onClick={handleCancelDelete}
                className="px-2 py-1 text-xs text-zinc-600 bg-zinc-100 rounded hover:bg-zinc-200 transition-colors"
              >
                取消
              </button>
            </div>
          ) : (
            <button
              onClick={handleDeleteClick}
              className="p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
              title="删除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
      {isSelectionMode && <ChevronRight className="w-4 h-4 text-zinc-300 flex-shrink-0" />}
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const { data: scripts = [], isLoading: scriptsLoading } = useScripts()
  const createScriptMutation = useCreateScript()
  const updateScriptMutation = useUpdateScript()
  const deleteScriptMutation = useDeleteScript()
  const deleteScriptsMutation = useDeleteScripts()
  const { setTopic, sendToAPIStream, clearMessages, streamingContent } = useAIStore()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [topicInput, setTopicInput] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [activeNav, setActiveNav] = useState('home')
  const [showPopup, setShowPopup] = useState(false)
  const [showAISettings, setShowAISettings] = useState(false)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleOpenAISettings = () => setShowAISettings(true)
    window.addEventListener('open-ai-settings', handleOpenAISettings)
    return () => window.removeEventListener('open-ai-settings', handleOpenAISettings)
  }, [])

  const handleNewScript = async () => {
    const id = String(Date.now())
    try {
      await createScriptMutation.mutateAsync({ scriptId: id, title: '未命名剧本' })
    } catch {
      // 未登录或 API 失败时，仍然跳转到编辑器（编辑器会本地处理）
    }
    router.push(`/editor?id=${id}`)
  }

  const handleAICreate = async () => {
    if (!topicInput.trim() || isCreating) return
    setIsCreating(true)
    clearMessages()
    setTopic(topicInput.trim())

    const id = String(Date.now())
    try {
      await createScriptMutation.mutateAsync({ scriptId: id, title: '未命名剧本' })
    } catch {
      // 未登录或 API 失败时，仍然继续（编辑器会本地处理）
    }

    const updateContent = (content: string) =>
      updateScriptMutation.mutate({ scriptId: id, content })

    const prompt = `请根据以下主题创作一个剧本大纲和开场：${topicInput.trim()}
请按照标准剧本格式输出，包含：
1. Logline（一句话故事梗概）
2. Synopsis（故事概要）
3. Act I - Setup（第一幕：铺垫）
4. 场景描述和角色对话`

    // Start streaming in background
    sendToAPIStream(prompt)

    // Poll streaming content and update script in real-time
    const pollInterval = setInterval(() => {
      const { streamingContent: current } = useAIStore.getState()
      if (current) {
        updateContent(current)
      }
    }, 200)

    // Wait for streaming to finish (max 60s)
    const waitForDone = async () => {
      const maxWait = 60000
      const start = Date.now()
      while (useAIStore.getState().isLoading && Date.now() - start < maxWait) {
        await new Promise((r) => setTimeout(r, 100))
      }
    }
    await waitForDone()
    clearInterval(pollInterval)

    // Final update with complete content
    const { messages } = useAIStore.getState()
    const aiResponse = messages.find((m) => m.role === 'assistant')?.content || ''
    updateContent(aiResponse)

    setIsCreating(false)
    setTopicInput('')
    router.push(`/editor?id=${id}`)
  }

  const handleOpenScript = (id: string) => {
    router.push(`/editor?id=${id}`)
  }

  const handleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSelectAll = () => {
    if (selectedIds.size === scripts.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(scripts.map((s) => s.id)))
    }
  }

  const handleBatchDelete = () => {
    if (selectedIds.size > 0) {
      deleteScriptsMutation.mutate(Array.from(selectedIds))
      setSelectedIds(new Set())
      setSelectionMode(false)
    }
  }

  const handleSingleDelete = (id: string) => {
    deleteScriptMutation.mutate({ scriptId: id })
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const toggleSelectionMode = () => {
    if (selectionMode) {
      setSelectionMode(false)
      setSelectedIds(new Set())
    } else {
      setSelectionMode(true)
    }
  }

  const navItems = [
    { id: 'recent', label: '项目', icon: Clock },
    { id: 'creative-space', label: '创意空间', icon: Sparkles },
    { id: 'community', label: '社区', icon: Users },
    { id: 'trash', label: '回收站', icon: Trash2 },
  ]

  return (
    <div className="flex h-screen bg-zinc-50">
      <aside className="w-56 flex-shrink-0 bg-white border-r border-zinc-200/50 flex flex-col">
        <div className="p-4 border-b border-zinc-100/50">
          <h1 className="text-lg font-bold text-zinc-900">抖影</h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeNav === item.id
            const isExternal = item.id === 'creative-space'
            const content = (
              <>
                <Icon className="w-4 h-4" />
                <span className="flex-1 text-left">{item.label}</span>
              </>
            )
            return isExternal ? (
              <Link
                key={item.id}
                href="/creative-space"
                prefetch={false}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-zinc-100 text-zinc-900 font-medium'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                {content}
              </Link>
            ) : (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-zinc-100 text-zinc-900 font-medium'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                {content}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-zinc-100/50">
          <div className="relative">
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
                <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 flex-shrink-0">
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
      </aside>

      <main className="flex-1 flex flex-col">
        {activeNav === 'recent' ? (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setActiveNav('home')}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                <span>首页</span>
              </button>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-zinc-400" />
                <h2 className="text-xs font-semibold text-zinc-600">项目</h2>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleNewScript}
                className="w-44 h-56 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-zinc-300 rounded-xl hover:border-zinc-400 hover:bg-zinc-50 transition-all cursor-pointer"
              >
                <Plus className="w-6 h-6 text-zinc-400" />
                <div className="text-center">
                  <p className="text-sm font-medium text-zinc-700">新剧本</p>
                  <p className="text-xs text-zinc-400 mt-0.5">最好的剧本编辑器</p>
                </div>
              </button>

              {scripts.map((script) => (
                <ScriptCard
                  key={script.id}
                  id={script.id}
                  title={script.title}
                  content={script.content}
                  updatedAt={script.updatedAt}
                  onOpen={handleOpenScript}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center px-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                <span className="inline-block w-6 h-6 bg-gradient-to-br from-green-500 to-red-500 rounded-sm"></span>
                抖影
              </h1>
            </div>

            <div className="w-full max-w-xl">
              <div className="relative">
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && topicInput.trim()) {
                      handleAICreate()
                    }
                  }}
                  placeholder="从任何灵感或手头的文件开始..."
                  className="w-full px-4 py-3 pr-12 bg-white border border-zinc-200 rounded-xl text-sm text-[#171717] placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 focus:border-zinc-300 transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button
                    onClick={handleAICreate}
                    disabled={!topicInput.trim() || isCreating}
                    className="p-1.5 bg-zinc-900 rounded-full hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowUp className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {scripts.length > 0 && (
              <div className="w-full max-w-xl mt-8">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-medium text-zinc-500">最近剧本</h2>
                  <div className="flex items-center gap-2">
                    {selectionMode && selectedIds.size > 0 && (
                      <button
                        onClick={handleBatchDelete}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>删除选中 ({selectedIds.size})</span>
                      </button>
                    )}
                    <button
                      onClick={toggleSelectionMode}
                      className={`px-2 py-1 text-xs rounded-md transition-colors ${
                        selectionMode
                          ? 'text-zinc-600 bg-zinc-100 hover:bg-zinc-200'
                          : 'text-zinc-500 hover:bg-zinc-100'
                      }`}
                    >
                      {selectionMode ? '取消' : '管理'}
                    </button>
                  </div>
                </div>
                {selectionMode && (
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === scripts.length && scripts.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs text-zinc-500">
                      已选 {selectedIds.size} / {scripts.length}
                    </span>
                  </div>
                )}
                <div className="space-y-2">
                  {scripts.map((script) => (
                    <ScriptRow
                      key={script.id}
                      id={script.id}
                      title={script.title}
                      updatedAt={script.updatedAt}
                      onOpen={handleOpenScript}
                      selected={selectedIds.has(script.id)}
                      onSelect={handleSelect}
                      onDelete={handleSingleDelete}
                      isSelectionMode={selectionMode}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <AISettingsDialog open={showAISettings} onClose={() => setShowAISettings(false)} />
    </div>
  )
}
