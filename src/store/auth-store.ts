'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { cognitoLogin, cognitoSignUp, cognitoConfirmSignUp } from '@/lib/cognito'

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  plan: 'free' | 'pro' | 'enterprise'
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name: string, code?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

const USE_MOCK = !process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID

// 管理员账号（mock 模式下的"我"）
const ADMIN_EMAIL = 'admin@writer.app'
const ADMIN_PASSWORD = 'Admin123456'

const MOCK_USERS: Record<string, { password: string; user: User }> = {
  [ADMIN_EMAIL]: {
    password: ADMIN_PASSWORD,
    user: {
      id: 'admin-001',
      email: ADMIN_EMAIL,
      name: '创作者',
      avatar: 'C',
      plan: 'enterprise',
    },
  },
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })

        if (USE_MOCK) {
          await new Promise((resolve) => setTimeout(resolve, 800))

          const stored = MOCK_USERS[email]
          if (!stored || stored.password !== password) {
            set({ isLoading: false })
            return { success: false, error: '邮箱或密码错误' }
          }

          set({
            user: stored.user,
            accessToken: `mock-${stored.user.id}`,
            isAuthenticated: true,
            isLoading: false,
          })
          return { success: true }
        }

        const result = await cognitoLogin(email, password)
        if (!result.success) {
          set({ isLoading: false })
          return { success: false, error: result.error || '登录失败' }
        }

        // 从 ID Token 中解析用户信息
        let username = email.split('@')[0]
        let userId = ''
        if (result.idToken) {
          try {
            const payload = JSON.parse(atob(result.idToken.split('.')[1]))
            if (payload['cognito:username']) {
              username = payload['cognito:username']
            }
            // Cognito 用户唯一标识是 sub 字段
            if (payload['sub']) {
              userId = payload['sub']
            }
          } catch {
            // 解析失败时使用邮箱前缀
          }
        }

        const initials = username.slice(0, 2).toUpperCase()
        const user: User = {
          id: userId || result.accessToken || crypto.randomUUID(),
          email,
          name: username,
          avatar: initials,
          plan: 'free',
        }

        set({
          user,
          accessToken: result.accessToken || null,
          isAuthenticated: true,
          isLoading: false,
        })
        return { success: true }
      },

      register: async (email: string, password: string, name: string, code?: string) => {
        set({ isLoading: true })

        if (USE_MOCK) {
          await new Promise((resolve) => setTimeout(resolve, 800))

          if (MOCK_USERS[email]) {
            set({ isLoading: false })
            return { success: false, error: '该邮箱已被注册' }
          }

          const initials = name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)

          const user: User = {
            id: crypto.randomUUID(),
            email,
            name,
            avatar: initials,
            plan: 'free',
          }

          MOCK_USERS[email] = { password, user }
          set({
            user,
            accessToken: `mock-${user.id}`,
            isAuthenticated: true,
            isLoading: false,
          })
          return { success: true }
        }

        if (code) {
          const result = await cognitoConfirmSignUp(email, name, code)
          if (!result.success) {
            set({ isLoading: false })
            return { success: false, error: result.error || '验证失败' }
          }

          // 确认注册后需要重新登录获取 token，这里先设置用户信息
          const initials = name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)

          const user: User = {
            id: crypto.randomUUID(),
            email,
            name,
            avatar: initials,
            plan: 'free',
          }

          set({ user, isAuthenticated: true, isLoading: false })
          return { success: true }
        }

        const result = await cognitoSignUp(email, password, name)
        if (!result.success) {
          set({ isLoading: false })
          return { success: false, error: result.error || '注册失败' }
        }

        set({ isLoading: false })
        return { success: true }
      },

      logout: () => {
        set({ user: null, accessToken: null, isAuthenticated: false })
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage')
        }
      },

      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }))
      },
    }),
    {
      name: 'auth-storage',
      version: 4,
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      migrate: (persisted, version) => {
        if (version < 4) return { user: null, accessToken: null, isAuthenticated: false } as any
        return persisted
      },
    }
  )
)
