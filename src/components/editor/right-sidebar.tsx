'use client'

import { PanelRightClose, PanelRight } from 'lucide-react'
import { useEditorStore } from '@/store/editor-store'
import { useState, useEffect } from 'react'

export function RightSidebar() {
  const { rightSidebarOpen, toggleRightSidebar, scriptData } = useEditorStore()
  const [isAnimating, setIsAnimating] = useState(false)
  const [shouldRender, setShouldRender] = useState(rightSidebarOpen)

  useEffect(() => {
    if (rightSidebarOpen) {
      setShouldRender(true)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true)
        })
      })
    } else {
      setIsAnimating(false)
      const timer = setTimeout(() => setShouldRender(false), 400)
      return () => clearTimeout(timer)
    }
  }, [rightSidebarOpen])

  if (!shouldRender) {
    return (
      <div
        className="group relative w-0 flex-shrink-0"
        onMouseEnter={toggleRightSidebar}
      >
        <div className="absolute right-0 top-0 bottom-0 w-3 cursor-pointer z-10" />
      </div>
    )
  }

  const dataItems = [
    { label: '场景数', value: scriptData.sceneCount },
    { label: '角色数', value: scriptData.characterCount },
    { label: '地点数', value: scriptData.locationCount },
    { label: '分镜数', value: scriptData.shotCount },
    { label: '角色关系', value: scriptData.characterRelationCount },
  ]

  return (
    <aside
      className={`relative flex-shrink-0 overflow-hidden transition-all duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${
        isAnimating ? 'w-[230px] opacity-100' : 'w-0 opacity-0'
      }`}
    >
      <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-l border-zinc-200/50">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-zinc-100/50">
            <h3 className="text-sm font-semibold text-zinc-900">写作</h3>
            <button
              onClick={toggleRightSidebar}
              className="p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100/50 rounded transition-colors"
              title="收起右侧栏"
            >
              <PanelRightClose className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 p-4">
            <div className="space-y-3">
              <h3
                className={`text-xs font-medium text-zinc-500 uppercase tracking-wide transition-all duration-300 ${
                  isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                }`}
                style={{ transitionDelay: isAnimating ? '100ms' : '0ms' }}
              >
                剧本数据
              </h3>
              <div className="space-y-2">
                {dataItems.map((item, index) => (
                  <div
                    key={item.label}
                    className={`flex items-center justify-between text-sm transition-all duration-300 ${
                      isAnimating ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                    }`}
                    style={{ transitionDelay: isAnimating ? `${index * 50 + 150}ms` : '0ms' }}
                  >
                    <span className="text-zinc-600">{item.label}</span>
                    <span className="font-medium text-zinc-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
