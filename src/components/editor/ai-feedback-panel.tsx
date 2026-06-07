'use client'

import { useState, useRef, useEffect } from 'react'
import { Rnd } from 'react-rnd'
import { Send, Sparkles, Maximize2, Minimize2, Settings, Loader2, Check, FileText, ListTree } from 'lucide-react'
import { useAIStore } from '@/store/ai-store'
import { AISettingsDialog } from '../ai-settings-dialog'

const MINIMIZED_WIDTH = 160
const MINIMIZED_HEIGHT = 48

const PANEL_WIDTH_RATIO = 0.28
const PANEL_HEIGHT_RATIO = 0.5
const PANEL_MARGIN = 24

export function AIFeedbackPanel() {
  const { messages, isLoading, currentStep, sendToAPIStream, clearMessages, outline, script, dialogue } = useAIStore()
  // 当前问题（用于动态 placeholder）
  const currentQuestion = dialogue?.active ? dialogue.fields[dialogue.currentIndex] : null
  const [input, setInput] = useState('')
  const [isExpanded, setIsExpanded] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [size, setSize] = useState({ width: 360, height: 480 })
  const [windowSize, setWindowSize] = useState({ width: 1920, height: 1080 })
  const [showSettings, setShowSettings] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setMounted(true)
    const w = window.innerWidth
    const h = window.innerHeight
    setWindowSize({ width: w, height: h })

    const panelWidth = Math.max(300, Math.round(w * PANEL_WIDTH_RATIO))
    const panelHeight = Math.max(400, Math.round(h * PANEL_HEIGHT_RATIO))
    setSize({ width: panelWidth, height: panelHeight })
    setPosition({
      x: w - panelWidth - PANEL_MARGIN,
      y: h - panelHeight - PANEL_MARGIN,
    })

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }
    const handleOpenAISettings = () => setShowSettings(true)
    window.addEventListener('resize', handleResize)
    window.addEventListener('open-ai-settings', handleOpenAISettings)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('open-ai-settings', handleOpenAISettings)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    const text = input.trim()
    setInput('')
    await sendToAPIStream(text)
  }

  const handleOptionClick = async (value: string) => {
    if (isLoading) return
    setInput('')
    await sendToAPIStream(value)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!mounted) {
    return <AISettingsDialog open={showSettings} onClose={() => setShowSettings(false)} />
  }

  if (!isExpanded) {
    return (
      <>
        <Rnd
          default={{
            x: windowSize.width - MINIMIZED_WIDTH - 24,
            y: windowSize.height - MINIMIZED_HEIGHT - 24,
            width: MINIMIZED_WIDTH,
            height: MINIMIZED_HEIGHT,
          }}
          bounds="window"
          className="z-50"
        >
          <div className="w-full h-full bg-white border border-zinc-200 rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-move">
            <Sparkles className="w-4 h-4 text-zinc-500" />
            <span className="text-sm text-zinc-600">AI 助手</span>
            <button
              onClick={() => setIsExpanded(true)}
              className="p-1 text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </Rnd>
        <AISettingsDialog open={showSettings} onClose={() => setShowSettings(false)} />
      </>
    )
  }

  return (
    <>
      <Rnd
        default={{ x: position.x, y: position.y, width: size.width, height: size.height }}
        minWidth={300}
        minHeight={400}
        bounds="window"
        onDragStop={(_e, d) => setPosition({ x: d.x, y: d.y })}
        onResizeStop={(_e, _dir, ref) => {
          setSize({
            width: parseInt(ref.style.width),
            height: parseInt(ref.style.height),
          })
        }}
        className="z-50"
      >
        <div className="w-full h-full bg-white border border-zinc-200 rounded-xl shadow-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-100 bg-white cursor-move">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-zinc-500" />
              <span className="text-sm font-medium text-zinc-900">新对话</span>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setShowSettings(true)}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded transition-colors"
                title="AI 设置"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={clearMessages}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded transition-colors"
                title="清空对话"
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded transition-colors"
                title="最小化"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages - 只显示关键节点 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Sparkles className="w-8 h-8 text-zinc-300 mb-2" />
                <p className="text-sm text-zinc-600 mb-1">AI 创作助手</p>
                <p className="text-xs text-zinc-400 max-w-[200px]">
                  描述你的创意，AI 将分步生成大纲与剧本，结果实时同步到编辑器
                </p>
              </div>
            )}

            {/* 关键节点 - 用户输入 */}
            {messages.filter(m => m.type === 'user').map((msg, i) => (
              <div key={i} className="flex justify-end">
                <div className="max-w-[85%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap rounded-2xl rounded-br-md bg-zinc-900 text-white">
                  {msg.content}
                </div>
              </div>
            ))}

            {/* 关键节点 - 多轮对话问题（带选项）*/}
            {messages.filter(m => m.type === 'question').map((msg, i) => (
              <div key={`q-${i}`} className="flex justify-start">
                <div className="max-w-[90%] space-y-2">
                  <div className="px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap rounded-2xl rounded-bl-md bg-zinc-100 text-zinc-900">
                    {msg.content}
                  </div>
                  {/* 选项按钮 */}
                  {msg.options && msg.options.length > 0 && (
                    <div className="flex flex-wrap gap-2 pl-1">
                      {msg.options.map((opt, j) => (
                        <button
                          key={j}
                          onClick={() => handleOptionClick(opt.value)}
                          className="px-3 py-1.5 text-xs text-zinc-900 font-medium bg-white border border-zinc-300 rounded-full hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-colors cursor-pointer"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* 关键节点 - 生成步骤 */}
            {(currentStep === 'outline' || outline) && (
              <StepNode
                icon={ListTree}
                title="生成大纲"
                status={currentStep === 'outline' ? 'loading' : 'done'}
                hint={outline ? `已生成 ${outline.length} 字符，点击编辑器"大纲"标签查看` : '思考故事结构...'}
              />
            )}

            {(currentStep === 'script' || script) && (
              <StepNode
                icon={FileText}
                title="创作剧本"
                status={currentStep === 'script' ? 'loading' : script ? 'done' : 'pending'}
                hint={script ? `已生成 ${script.length} 字符，点击编辑器"剧本"标签查看` : '基于大纲创作完整剧本...'}
              />
            )}

            {/* 错误消息 */}
            {messages.filter(m => m.type === 'error').map((msg, i) => (
              <div key={`err-${i}`} className="flex justify-start">
                <div className="max-w-[85%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap rounded-2xl rounded-bl-md bg-red-50 text-red-700 border border-red-200">
                  {msg.content}
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-zinc-100">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isLoading
                    ? 'AI 正在创作中...'
                    : currentQuestion
                    ? currentQuestion.placeholder || `第 ${(dialogue?.currentIndex || 0) + 1} 轮：${currentQuestion.question}`
                    : '描述你的创意，Enter 发送，Shift+Enter 换行'
                }
                rows={2}
                disabled={isLoading}
                className="flex-1 px-3 py-2 text-sm text-zinc-900 bg-zinc-100 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-zinc-200 placeholder-zinc-700 disabled:opacity-100"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-2 bg-zinc-900 text-white rounded-full hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </Rnd>
      <AISettingsDialog open={showSettings} onClose={() => setShowSettings(false)} />
    </>
  )
}

function StepNode({
  icon: Icon,
  title,
  status,
  hint,
}: {
  icon: React.ElementType
  title: string
  status: 'pending' | 'loading' | 'done'
  hint?: string
}) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] flex items-start gap-2.5 px-4 py-2.5 rounded-2xl rounded-bl-md bg-zinc-50 border border-zinc-200">
        {status === 'loading' ? (
          <Loader2 className="w-4 h-4 mt-0.5 text-zinc-900 animate-spin flex-shrink-0" />
        ) : status === 'done' ? (
          <Check className="w-4 h-4 mt-0.5 text-green-700 flex-shrink-0" />
        ) : (
          <div className="w-4 h-4 mt-0.5 rounded-full border border-zinc-900 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Icon className="w-3.5 h-3.5 text-zinc-900" />
            <span className={`text-sm font-medium ${status === 'pending' ? 'text-zinc-700' : 'text-zinc-900'}`}>
              {title}
            </span>
          </div>
          {hint && (
            <p className="text-xs text-zinc-900 mt-0.5">{hint}</p>
          )}
        </div>
      </div>
    </div>
  )
}
