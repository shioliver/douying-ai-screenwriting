'use client'

import { useState } from 'react'
import { X, Clock, RotateCcw, Trash2 } from 'lucide-react'
import { useVersionsStore } from '@/store/versions-store'
import { useUpdateScript } from '@/hooks/use-scripts-query'

interface VersionHistoryPanelProps {
  scriptId?: string
  onRestore?: (content: string) => void
}

export function VersionHistoryPanel({ scriptId, onRestore }: VersionHistoryPanelProps) {
  const { getVersions } = useVersionsStore()
  const updateScriptMutation = useUpdateScript()
  const [showPanel, setShowPanel] = useState(false)
  const [viewVersion, setViewVersion] = useState<any>(null)

  const versions = scriptId ? getVersions(scriptId) : []

  const handleRestore = () => {
    if (!viewVersion || !scriptId) return
    if (confirm('确定要恢复到此版本吗？当前内容将被覆盖。')) {
      updateScriptMutation.mutate({ scriptId, content: viewVersion.content })
      onRestore?.(viewVersion.content)
      setViewVersion(null)
    }
  }

  const handleDelete = (versionId: string) => {
    if (confirm('确定要删除此版本吗？')) {
      setViewVersion(null)
    }
  }

  return (
    <>
      {!showPanel && (
        <button
          onClick={() => setShowPanel(true)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 rounded transition-colors"
          title="版本历史"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>版本历史</span>
        </button>
      )}

      {showPanel && (
        <div className="fixed inset-0 bg-zinc-50/80 backdrop-blur-sm z-50">
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white border-l border-zinc-200 shadow-lg flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
              <h3 className="text-sm font-semibold text-zinc-900">版本历史</h3>
              <button
                onClick={() => setShowPanel(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {versions.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-sm text-zinc-400">暂无版本记录</p>
                </div>
              )}
              {versions.map((version) => (
                <div
                  key={version.versionId}
                  onClick={() => setViewVersion(version)}
                  className={`px-4 py-3 bg-zinc-50 border rounded-lg cursor-pointer hover:bg-zinc-100 transition-colors ${
                    viewVersion?.versionId === version.versionId ? 'border-blue-400 bg-blue-50' : 'border-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900">{version.title}</p>
                      <p className="text-xs text-zinc-400">{version.createdAt} - {version.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {viewVersion && (
              <div className="border-t border-zinc-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-zinc-900">预览版本</span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleRestore}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>恢复</span>
                    </button>
                    <button
                      onClick={() => handleDelete(viewVersion.versionId)}
                      className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto text-xs text-zinc-600 bg-zinc-50 rounded p-3 whitespace-pre-wrap">
                  {viewVersion.content.replace(/<[^>]*>/g, '').slice(0, 500)}
                  {viewVersion.content.replace(/<[^>]*>/g, '').length > 500 && '...'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
