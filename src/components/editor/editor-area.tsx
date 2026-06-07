'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { useEditorStore } from '@/store/editor-store'
import { useScripts, useUpdateScript } from '@/hooks/use-scripts-query'
import { useOfflineStore } from '@/store/offline-store'
import { markdownToHtml } from '@/lib/markdown-to-html'
import { useEffect, useRef, useState, useCallback } from 'react'
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Download,
  Save,
  FileText,
  ListTree,
  ImageIcon,
} from 'lucide-react'
import { exportScriptToPDF } from '@/lib/export-pdf'
import { VersionHistoryPanel } from './version-history'
import { useVersionsStore } from '@/store/versions-store'
import { CollaboratorsBar } from './collaborators-bar'
import { useCollaborationStore } from '@/store/collaboration-store'
import { useAuthStore } from '@/store/auth-store'

interface ToolbarButtonProps {
  onClick: () => void
  active?: boolean
  children: React.ReactNode
  title?: string
}

function ToolbarButton({ onClick, active, children, title }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-zinc-200 text-zinc-900'
          : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700'
      }`}
    >
      {children}
    </button>
  )
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-zinc-200 mx-1" />
}

type ContentTab = 'script' | 'outline' | 'cover'

interface ScriptContent {
  script: string
  outline: string
  cover: string
}

/** 把 Markdown 文本转成 HTML 写入 TipTap */
// markdownToHtml 已迁移到 @/lib/markdown-to-html（支持粗体/斜体/代码/列表/引用）

function EditorInstance({ scriptId }: { scriptId: string | null }) {
  const { updateCounts, updateScriptData } = useEditorStore()
  const { data: scripts = [] } = useScripts()
  const updateScriptMutation = useUpdateScript()
  const script = scripts.find((s) => s.id === scriptId)
  const { createVersion } = useVersionsStore()
  const { startCollaboration, stopCollaboration } = useCollaborationStore()
  const { user } = useAuthStore()
  const { isOnline, addPendingSave } = useOfflineStore()
  const scriptRef = useRef(scriptId)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 当前激活的标签
  const [activeTab, setActiveTab] = useState<ContentTab>('script')

  // 三个标签的内容（独立保存）
  const [contents, setContents] = useState<ScriptContent>({
    script: '',
    outline: '',
    cover: '',
  })

  // 已保存的内容（用于判断是否有改动）
  const [savedContents, setSavedContents] = useState<ScriptContent>({
    script: '',
    outline: '',
    cover: '',
  })

  // 初始化：加载 script.content（兼容旧数据）
  useEffect(() => {
    if (script) {
      try {
        const parsed = JSON.parse(script.content || '{}')
        if (typeof parsed === 'object' && parsed !== null && (parsed.script || parsed.outline || parsed.cover)) {
          setContents({
            script: parsed.script || '',
            outline: parsed.outline || '',
            cover: parsed.cover || '',
          })
          setSavedContents({
            script: parsed.script || '',
            outline: parsed.outline || '',
            cover: parsed.cover || '',
          })
        } else {
          // 旧数据：直接当作文本内容（剧本）
          const text = typeof parsed === 'string' ? parsed : script.content
          setContents({ script: text || '', outline: '', cover: '' })
          setSavedContents({ script: text || '', outline: '', cover: '' })
        }
      } catch {
        // 不是 JSON，直接当字符串
        setContents({ script: script.content || '', outline: '', cover: '' })
        setSavedContents({ script: script.content || '', outline: '', cover: '' })
      }
    }
  }, [script?.id, script?.content])

  const updateScriptContent = useCallback((id: string, content: string) => {
    updateScriptMutation.mutate({ scriptId: id, content })
  }, [updateScriptMutation])

  // 防抖自动保存
  const debouncedSave = useCallback((id: string, newContents: ScriptContent) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }
    saveTimerRef.current = setTimeout(() => {
      const contentStr = JSON.stringify(newContents)
      if (isOnline) {
        updateScriptContent(id, contentStr)
      } else {
        addPendingSave({ scriptId: id, content: contentStr, timestamp: Date.now() })
      }
      setSavedContents(newContents)
    }, 1500)
  }, [isOnline, updateScriptContent, addPendingSave])

  // 切换标签时立即保存当前标签内容
  const handleTabChange = (tab: ContentTab) => {
    if (activeTab === tab) return
    if (scriptId && contents[activeTab] !== savedContents[activeTab]) {
      const newContents = { ...contents }
      debouncedSave(scriptId, newContents)
    }
    setActiveTab(tab)
  }

  // 监听 AI 事件：流式输出与完成
  useEffect(() => {
    // Throttle：AI 流式事件频繁，避免每个 chunk 都触发 React 更新
    const pendingUpdates: { type: 'outline' | 'script'; content: string } = { type: 'outline', content: '' }
    let scheduled = false
    let lastFlush = 0
    const THROTTLE_MS = 100 // 最多 10 次/秒

    const flush = () => {
      scheduled = false
      const { type, content } = pendingUpdates
      if (!content) return
      // 流式过程不触发 debouncedSave，避免反复写入
      setContents((prev) => {
        return prev[type] === content ? prev : { ...prev, [type]: content }
      })
      setActiveTab(type)
    }

    const schedule = (type: 'outline' | 'script', content: string) => {
      pendingUpdates.type = type
      pendingUpdates.content = content
      const now = Date.now()
      const elapsed = now - lastFlush
      if (!scheduled && elapsed >= THROTTLE_MS) {
        lastFlush = now
        scheduled = true
        setTimeout(flush, THROTTLE_MS)
      } else if (!scheduled) {
        scheduled = true
        setTimeout(() => {
          lastFlush = Date.now()
          flush()
        }, THROTTLE_MS - elapsed)
      }
    }

    const handleStreaming = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (!detail) return
      const { type, content } = detail
      if (type === 'outline' || type === 'script') {
        schedule(type, content)
      }
    }
    const handleOutlineUpdate = (e: Event) => {
      const content = (e as CustomEvent).detail?.content
      if (content) {
        setContents((prev) => {
          const next = { ...prev, outline: content }
          if (scriptId) debouncedSave(scriptId, next)
          return next
        })
        setActiveTab('outline')
      }
    }
    const handleScriptUpdate = (e: Event) => {
      const content = (e as CustomEvent).detail?.content
      if (content) {
        setContents((prev) => {
          const next = { ...prev, script: content }
          if (scriptId) debouncedSave(scriptId, next)
          return next
        })
        setActiveTab('script')
      }
    }
    window.addEventListener('ai-streaming', handleStreaming)
    window.addEventListener('ai-outline-update', handleOutlineUpdate)
    window.addEventListener('ai-script-update', handleScriptUpdate)
    return () => {
      window.removeEventListener('ai-streaming', handleStreaming)
      window.removeEventListener('ai-outline-update', handleOutlineUpdate)
      window.removeEventListener('ai-script-update', handleScriptUpdate)
    }
  }, [scriptId, debouncedSave])

  useEffect(() => {
    scriptRef.current = scriptId
  }, [scriptId])

  useEffect(() => {
    if (scriptId && user) {
      startCollaboration(scriptId, user.id, user.name || user.email || '用户')
    }
    return () => {
      stopCollaboration()
    }
  }, [scriptId, user])

  // 协作同步
  const lastBroadcastRef = useRef('')
  useEffect(() => {
    const current = contents[activeTab]
    if (current !== lastBroadcastRef.current) {
      lastBroadcastRef.current = current
    }
  }, [contents, activeTab])

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-zinc max-w-none focus:outline-none',
      },
    },
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: activeTab === 'script' ? '开始创作你的剧本...' :
                     activeTab === 'outline' ? '写下故事大纲...' :
                     '为你的剧本设计一个封面...',
      }),
      CharacterCount.configure({
        limit: 50000,
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const words = editor.storage.characterCount.words()
      const chars = editor.storage.characterCount.characters()
      updateCounts(words, chars)
      if (activeTab === 'script') {
        analyzeScriptData(html)
      }
      setContents((prev) => {
        if (prev[activeTab] === html) return prev
        const next = { ...prev, [activeTab]: html }
        if (scriptId) debouncedSave(scriptId, next)
        return next
      })
    },
  })

  // 当激活标签或对应内容变化时，同步到编辑器（使用 emitUpdate: false 避免死循环）
  useEffect(() => {
    if (!editor) return
    const html = markdownToHtml(contents[activeTab])
    const currentHtml = editor.getHTML()
    if (html !== currentHtml) {
      editor.commands.setContent(html || '', { emitUpdate: false })
    }
  }, [contents, activeTab, editor])

  useEffect(() => {
    if (editor) {
      const words = editor.storage.characterCount.words()
      const chars = editor.storage.characterCount.characters()
      updateCounts(words, chars)
      if (activeTab === 'script') {
        analyzeScriptData(editor.getHTML())
      }
    }
  }, [editor, updateCounts, updateScriptData, activeTab])

  const analyzeScriptData = (content: string) => {
    const sceneMatches = content.match(/(?:EXT|INT|INT\.?\/EXT|EXT\.?\/INT)\s/gi)
    const sceneCount = sceneMatches ? sceneMatches.length : 0

    const characterPattern = /(?:^|\n)\s*([A-Z][A-Z\s]{2,})\s*(?:\(|$)/gm
    const characterMatches = new Set<string>()
    let match
    while ((match = characterPattern.exec(content)) !== null) {
      const name = match[1].trim()
      if (name.length > 2 && name.length < 30) {
        characterMatches.add(name)
      }
    }

    const locationPattern = /(?:EXT|INT|INT\.?\/EXT|EXT\.?\/INT)\s+([^.·]+?)(?:\s*[·-]\s*|\s*-)/gi
    const locationMatches = new Set<string>()
    while ((match = locationPattern.exec(content)) !== null) {
      locationMatches.add(match[1].trim())
    }

    const shotPattern = /(?:航拍|推入|拉出|摇|移|跟|升|降|俯冲|特写|近景|中景|全景|远景|过肩|主观|客观|蒙太奇|闪回|慢动作|快进)/g
    const shotCount = (content.match(shotPattern) || []).length

    updateScriptData({
      sceneCount,
      characterCount: characterMatches.size,
      locationCount: locationMatches.size,
      shotCount,
      characterRelationCount: 0,
    })
  }

  const [editingTitle, setEditingTitle] = useState(false)
  const [editTitle, setEditTitle] = useState(script?.title || '')
  const titleInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [editingTitle])

  useEffect(() => {
    setEditTitle(script?.title || '')
  }, [script?.title])

  const handleTitleDoubleClick = () => {
    setEditTitle(script?.title || '')
    setEditingTitle(true)
  }

  const handleTitleConfirm = () => {
    if (editTitle.trim() && scriptId) {
      updateScriptMutation.mutate({ scriptId, title: editTitle.trim() })
    }
    setEditingTitle(false)
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleTitleConfirm()
    if (e.key === 'Escape') {
      setEditTitle(script?.title || '')
      setEditingTitle(false)
    }
  }

  if (!editor) return null

  const tabs: { key: ContentTab; label: string; icon: React.ElementType }[] = [
    { key: 'script', label: '剧本', icon: FileText },
    { key: 'outline', label: '大纲', icon: ListTree },
    { key: 'cover', label: '封面', icon: ImageIcon },
  ]

  return (
    <>
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200 bg-white">
        <div className="flex items-center gap-2">
          {editingTitle ? (
            <input
              ref={titleInputRef}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleConfirm}
              onKeyDown={handleTitleKeyDown}
              className="text-sm font-medium text-zinc-900 bg-transparent border-b-2 border-blue-500 focus:outline-none w-48"
            />
          ) : (
            <span
              onDoubleClick={handleTitleDoubleClick}
              className="text-sm font-medium text-zinc-900 cursor-pointer hover:text-blue-600 transition-colors"
              title="双击重命名"
            >
              {script?.title || '剧本'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 bg-zinc-100 rounded-lg p-0.5">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const hasContent = !!contents[tab.key].trim()
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {hasContent && activeTab !== tab.key && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                )}
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              if (scriptId && script) {
                createVersion(scriptId, script.title, JSON.stringify(contents), '手动保存')
              }
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 rounded transition-colors"
            title="保存版本"
          >
            <Save className="w-3.5 h-3.5" />
            <span>保存版本</span>
          </button>
          <button
            onClick={() => {
              if (script) {
                const title = `${script.title || '剧本'}_${tabs.find(t => t.key === activeTab)?.label || '内容'}`
                exportScriptToPDF(title, contents[activeTab])
              }
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 rounded transition-colors"
            title="导出 PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出 PDF</span>
          </button>
          <VersionHistoryPanel scriptId={scriptId || undefined} />
          <CollaboratorsBar />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto py-8 px-12">
          <div className="mb-6 p-3 bg-zinc-100 rounded-lg text-xs text-zinc-500 space-y-1">
            <p><span className="font-mono font-medium text-zinc-700">Tab</span> 不断按下 Tab，在格式之间循环切换</p>
            <p><span className="font-mono font-medium text-zinc-700">Enter</span> 在选择器中创建人物、地点等剧本中的实体</p>
            <p><span className="font-mono font-medium text-zinc-700">@</span> 在剧本中 @ 人物以关联人物，让别人更容易阅读剧本</p>
          </div>

          <div className="prose prose-zinc max-w-none">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-200 bg-white">
        <div className="flex items-center gap-1">
          <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="撤销">
            <Undo className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="重做">
            <Redo className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="粗体">
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="斜体">
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="删除线">
            <Strikethrough className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="标题1">
            <Heading1 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="标题2">
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="标题3">
            <Heading3 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarDivider />
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="无序列表">
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="有序列表">
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="引用">
            <Quote className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="代码块">
            <Code className="w-4 h-4" />
          </ToolbarButton>
        </div>
        <div className="text-xs text-zinc-400">
          {editor.storage.characterCount.words()} 字
        </div>
      </div>
    </>
  )
}

export function EditorArea({ scriptId }: { scriptId: string | null }) {
  return (
    <main className="flex-1 flex flex-col h-full bg-zinc-50">
      <EditorInstance scriptId={scriptId} />
    </main>
  )
}
