'use client'

import { useState } from 'react'
import { X, Eye, EyeOff, Loader2, Check } from 'lucide-react'
import { useAISettingsStore, AIProviderConfig } from '@/store/ai-settings-store'

interface AISettingsDialogProps {
  open: boolean
  onClose: () => void
}

const PROVIDER_OPTIONS: { value: AIProviderConfig['provider']; label: string; defaultModel: string; baseUrl: string }[] = [
  { value: 'deepseek', label: 'DeepSeek', defaultModel: 'deepseek-chat', baseUrl: 'https://api.deepseek.com/v1' },
  { value: 'openai', label: 'OpenAI', defaultModel: 'gpt-4o-mini', baseUrl: 'https://api.openai.com/v1' },
  { value: 'claude', label: 'Claude', defaultModel: 'claude-3-5-sonnet-20241022', baseUrl: 'https://api.anthropic.com/v1' },
  { value: 'custom', label: '自定义', defaultModel: '', baseUrl: '' },
]

export function AISettingsDialog({ open, onClose }: AISettingsDialogProps) {
  const { config, setProvider, setBaseUrl, setApiKey, setModel, testConnection } = useAISettingsStore()
  const [showKey, setShowKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  if (!open) return null

  const handleProviderChange = (provider: AIProviderConfig['provider']) => {
    setProvider(provider)
    setTestResult(null)
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    const result = await testConnection()
    setTestResult({
      success: result.success,
      message: result.success ? '连接成功' : (result.error || '连接失败'),
    })
    setTesting(false)
  }

  const currentProviderInfo = PROVIDER_OPTIONS.find((p) => p.value === config.provider)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-50/80 backdrop-blur-sm">
      <div className="w-[480px] max-w-[90vw] bg-white border border-zinc-200 rounded-lg shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <h3 className="text-base font-semibold text-zinc-900">AI 设置</h3>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">
              大模型名称
            </label>
            <div className="flex gap-2">
              <select
                value={config.provider}
                onChange={(e) => handleProviderChange(e.target.value as AIProviderConfig['provider'])}
                className="flex-1 px-3 py-2 text-sm text-zinc-900 border border-zinc-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {PROVIDER_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={config.model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="模型名称"
                className="flex-1 px-3 py-2 text-sm text-zinc-900 border border-zinc-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {currentProviderInfo && currentProviderInfo.value !== 'custom' && (
              <p className="mt-1 text-xs text-zinc-400">
                默认模型：{currentProviderInfo.defaultModel}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">
              Base URL
            </label>
            <input
              type="text"
              value={config.baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder={currentProviderInfo?.baseUrl || 'https://api.example.com/v1'}
              className="w-full px-3 py-2 text-sm text-zinc-900 border border-zinc-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">
              API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={config.apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 pr-10 text-sm text-zinc-900 border border-zinc-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              你的 API Key 仅存储在本地浏览器，不会上传到服务器
            </p>
          </div>

          {testResult && (
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs ${
                testResult.success
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {testResult.success ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t border-zinc-100 bg-zinc-50">
          <button
            onClick={handleTest}
            disabled={testing || !config.apiKey}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-700 bg-white border border-zinc-200 rounded-md hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            {testing ? '测试中...' : '测试连接'}
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-zinc-700 bg-white border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
            >
              确定
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
