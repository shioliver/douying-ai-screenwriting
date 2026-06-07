'use client'

import { useEffect } from 'react'

/**
 * 全局错误日志过滤器
 * 静默处理正常的"用户主动取消"场景，避免污染控制台：
 * 1. Next.js RSC fetch 被导航取消（net::ERR_ABORTED with _rsc=）
 * 2. LLM 流式请求被面板关闭/页面切换取消
 * 3. 图片懒加载取消
 */
export function ErrorFilter() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // 需要忽略的错误特征
    const IGNORE_PATTERNS = [
      /net::ERR_ABORTED/i, // 用户主动取消的 fetch
      /_rsc=/i, // Next.js RSC 请求
      /AbortError/i, // DOMException AbortError
      /The user aborted a request/i, // 浏览器 abort 提示
      /Failed to fetch.*abort/i, // fetch 失败因为 abort
    ]

    const shouldIgnore = (message: string | undefined | null): boolean => {
      if (!message) return false
      return IGNORE_PATTERNS.some((p) => p.test(message))
    }

    // 拦截 console.error
    const originalError = console.error
    console.error = (...args: any[]) => {
      const firstArg = args[0]
      const message = typeof firstArg === 'string' ? firstArg : String(firstArg ?? '')
      if (shouldIgnore(message)) {
        // 静默，不打印
        return
      }
      // 检查 stack 形式
      if (args.length === 1 && firstArg && typeof firstArg === 'object' && 'message' in firstArg) {
        if (shouldIgnore(String(firstArg.message))) return
      }
      originalError.apply(console, args)
    }

    // 拦截 unhandledrejection
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      const message = reason?.message || String(reason || '')
      if (shouldIgnore(message)) {
        event.preventDefault()
        return
      }
    }
    window.addEventListener('unhandledrejection', handleRejection)

    return () => {
      console.error = originalError
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [])

  return null
}
