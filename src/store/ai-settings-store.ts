'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AIProviderConfig {
  provider: 'deepseek' | 'openai' | 'claude' | 'custom'
  baseUrl: string
  apiKey: string
  model: string
}

interface AISettingsState {
  config: AIProviderConfig
  setProvider: (provider: AIProviderConfig['provider']) => void
  setBaseUrl: (url: string) => void
  setApiKey: (key: string) => void
  setModel: (model: string) => void
  reset: () => void
  testConnection: () => Promise<{ success: boolean; error?: string }>
}

const PRESETS: Record<AIProviderConfig['provider'], Partial<AIProviderConfig>> = {
  deepseek: {
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
  },
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
  },
  claude: {
    baseUrl: 'https://api.anthropic.com/v1',
    model: 'claude-3-5-sonnet-20241022',
  },
  custom: {
    baseUrl: '',
    model: '',
  },
}

const DEFAULT_CONFIG: AIProviderConfig = {
  provider: 'deepseek',
  baseUrl: PRESETS.deepseek.baseUrl!,
  apiKey: '',
  model: PRESETS.deepseek.model!,
}

export const useAISettingsStore = create<AISettingsState>()(
  persist(
    (set, get) => ({
      config: DEFAULT_CONFIG,

      setProvider: (provider) => {
        const preset = PRESETS[provider]
        set((state) => ({
          config: {
            ...state.config,
            provider,
            baseUrl: preset.baseUrl ?? state.config.baseUrl,
            model: preset.model ?? state.config.model,
          },
        }))
      },

      setBaseUrl: (url) => {
        set((state) => ({ config: { ...state.config, baseUrl: url } }))
      },

      setApiKey: (key) => {
        set((state) => ({ config: { ...state.config, apiKey: key } }))
      },

      setModel: (model) => {
        set((state) => ({ config: { ...state.config, model } }))
      },

      reset: () => {
        set({ config: DEFAULT_CONFIG })
      },

      testConnection: async () => {
        const { config } = get()
        if (!config.apiKey) {
          return { success: false, error: '请先填写 API Key' }
        }
        try {
          // 通过 AI SDK 路由发送一个简短请求来验证 API Key
          const response = await fetch('/api/deepseek', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-User-Api-Key': config.apiKey,
              'X-User-Base-Url': config.baseUrl,
              'X-User-Model': config.model,
              'X-User-Provider': config.provider,
            },
            body: JSON.stringify({
              messages: [{ role: 'user', content: '回复 OK' }],
              maxTokens: 5,
            }),
          })
          if (!response.ok) {
            const data = await response.json().catch(() => ({}))
            return { success: false, error: data.error || '测试失败' }
          }
          // 用超时方式让请求自然结束，避免 cancel 触发 ERR_ABORTED
          // 只读取前几个 chunk 确认流式已建立即可
          const reader = response.body?.getReader()
          if (!reader) {
            return { success: true }
          }
          const readWithTimeout = (p: Promise<any>, ms: number) =>
            Promise.race([p, new Promise((resolve) => setTimeout(() => resolve({ timeout: true }), ms))])
          const first = await readWithTimeout(reader.read(), 2000)
          // 关闭读取但等响应自然结束（不显式 cancel）
          try { reader.releaseLock() } catch {}
          if (first && !first.timeout && first.value) {
            return { success: true }
          }
          if (first && first.timeout) {
            // 2s 内已建立响应即视为成功
            return { success: true }
          }
          return { success: true }
        } catch (e) {
          if (e instanceof DOMException && e.name === 'AbortError') {
            return { success: true } // 测试场景下忽略中止
          }
          return { success: false, error: e instanceof Error ? e.message : '网络错误' }
        }
      },
    }),
    {
      name: 'ai-settings',
      version: 1,
      migrate: (persisted, version) => {
        if (version < 1) return undefined as any
        return persisted
      },
    }
  )
)
