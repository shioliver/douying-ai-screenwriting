'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, Eye, EyeOff, Sparkles, Shield } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'

type Mode = 'login' | 'register' | 'verify'

export default function LoginPage() {
  const router = useRouter()
  const { login, register, isLoading } = useAuthStore()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (mode === 'verify') {
      if (!code.trim()) {
        setError('请输入验证码')
        return
      }
      const result = await register(email.trim(), password, name.trim(), code.trim())
      if (result.success) {
        router.push('/')
      } else {
        setError(result.error || '验证失败，请重试')
      }
      return
    }

    if (!email.trim() || !password.trim()) {
      setError('请填写所有必填项')
      return
    }

    if (mode === 'register' && !name.trim()) {
      setError('请输入用户名')
      return
    }

    if (password.length < 8) {
      setError('密码至少需要 8 位')
      return
    }

    if (mode === 'register') {
      if (!/[A-Z]/.test(password)) {
        setError('密码需包含至少一个大写字母')
        return
      }
      if (!/[a-z]/.test(password)) {
        setError('密码需包含至少一个小写字母')
        return
      }
      if (!/[0-9]/.test(password)) {
        setError('密码需包含至少一个数字')
        return
      }
    }

    let result: { success: boolean; error?: string }

    if (mode === 'login') {
      result = await login(email.trim(), password)
    } else {
      result = await register(email.trim(), password, name.trim())
    }

    if (result.success) {
      if (mode === 'register') {
        setMode('verify')
        setError('')
      } else {
        router.push('/')
      }
    } else {
      setError(result.error || '操作失败，请重试')
    }
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setError('')
  }

  const goToLogin = () => {
    setMode('login')
    setError('')
  }

  if (mode === 'verify') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden">
            <div className="px-8 pt-8 pb-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-orange-400 mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-zinc-900">验证邮箱</h1>
              <p className="text-sm text-zinc-500 mt-1">
                验证码已发送至 <span className="text-zinc-700 font-medium">{email}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  验证码
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="请输入 6 位验证码"
                    maxLength={6}
                    className="w-full pl-10 pr-4 py-2.5 text-sm text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-zinc-400"
                  />
                </div>
              </div>

              {error && (
                <div className="px-3 py-2 text-xs text-red-600 bg-red-50 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl hover:from-purple-700 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? '验证中...' : '验证'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={goToLogin}
                  className="text-xs text-zinc-500 hover:text-purple-600 transition-colors"
                >
                  返回登录
                </button>
              </div>
            </form>
          </div>

          <p className="text-center text-xs text-zinc-400 mt-6">
            未收到验证码？请检查垃圾邮件文件夹
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden">
          <div className="px-8 pt-8 pb-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-orange-400 mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-zinc-900">
              {mode === 'login' ? '欢迎回来' : '创建账号'}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              {mode === 'login' ? '登录以继续你的创作' : '开始你的剧本创作之旅'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  用户名
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="请输入用户名"
                    className="w-full pl-10 pr-4 py-2.5 text-sm text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-zinc-400"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                邮箱
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入邮箱"
                  className="w-full pl-10 pr-4 py-2.5 text-sm text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-zinc-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full pl-10 pr-10 py-2.5 text-sm text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-zinc-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {mode === 'register' && (
                <p className="mt-1.5 text-xs text-zinc-400">
                  密码需至少 8 位，包含大写字母、小写字母和数字
                </p>
              )}
            </div>

            {error && (
              <div className="px-3 py-2 text-xs text-red-600 bg-red-50 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl hover:from-purple-700 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading
                ? '处理中...'
                : mode === 'login'
                  ? '登录'
                  : '注册'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={switchMode}
                className="text-xs text-zinc-500 hover:text-purple-600 transition-colors"
              >
                {mode === 'login' ? '还没有账号？立即注册' : '已有账号？返回登录'}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-400 mt-6">
          登录即表示你同意我们的服务条款和隐私政策
        </p>
      </div>
    </div>
  )
}
