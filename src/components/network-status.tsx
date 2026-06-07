'use client'

import { useEffect } from 'react'
import { useOfflineStore } from '@/store/offline-store'
import { useUpdateScript } from '@/hooks/use-scripts-query'
import { WifiOff, Wifi, CloudOff } from 'lucide-react'

export function NetworkStatus() {
  const { isOnline, pendingSaves, setOnline, removePendingSave, clearPendingSaves } = useOfflineStore()
  const updateScriptMutation = useUpdateScript()

  useEffect(() => {
    // 初始化时同步真实网络状态
    setOnline(navigator.onLine)

    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOnline])

  // 网络恢复时，自动同步待保存的内容
  useEffect(() => {
    if (isOnline && pendingSaves.length > 0) {
      const syncPending = async () => {
        for (const save of pendingSaves) {
          try {
            await updateScriptMutation.mutateAsync({
              scriptId: save.scriptId,
              content: save.content,
              ...(save.title ? { title: save.title } : {}),
            })
            removePendingSave(save.scriptId)
          } catch {
            // 同步失败，保留在队列中下次重试
            break
          }
        }
      }
      syncPending()
    }
  }, [isOnline, pendingSaves])

  // 离线时不显示，在线且无待同步也不显示
  if (isOnline && pendingSaves.length === 0) return null

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg text-sm transition-all ${
        isOnline
          ? 'bg-blue-50 text-blue-700 border border-blue-200'
          : 'bg-amber-50 text-amber-700 border border-amber-200'
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4" />
          <span>正在同步 {pendingSaves.length} 条待保存内容...</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span>网络已断开，内容将本地保存</span>
          {pendingSaves.length > 0 && (
            <span className="flex items-center gap-1 ml-1">
              <CloudOff className="w-3 h-3" />
              {pendingSaves.length} 条待同步
            </span>
          )}
        </>
      )}
    </div>
  )
}
