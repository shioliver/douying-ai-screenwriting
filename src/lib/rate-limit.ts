/**
 * 轻量级内存速率限制器
 * 基于 IP + 用户标识的滑动窗口限流
 */

interface RateLimitEntry {
  timestamps: number[]
}

const store = new Map<string, RateLimitEntry>()

// 每 60 秒清理一次过期记录
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < 60000)
    if (entry.timestamps.length === 0) {
      store.delete(key)
    }
  }
}, 60000)

export interface RateLimitOptions {
  /** 时间窗口（毫秒），默认 60000（1 分钟） */
  windowMs?: number
  /** 窗口内最大请求数，默认 10 */
  maxRequests?: number
}

/**
 * 检查请求是否超过速率限制
 * @returns true 表示被限流，false 表示允许
 */
export function isRateLimited(
  request: Request,
  options: RateLimitOptions = {}
): boolean {
  const { windowMs = 60000, maxRequests = 10 } = options

  // 用 IP + 用户标识作为限流 key
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'
  const authHeader = request.headers.get('Authorization') || ''
  const key = `${ip}:${authHeader.slice(0, 20)}`

  const now = Date.now()
  let entry = store.get(key)

  if (!entry) {
    entry = { timestamps: [] }
    store.set(key, entry)
  }

  // 清理过期记录
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs)

  if (entry.timestamps.length >= maxRequests) {
    return true // 被限流
  }

  entry.timestamps.push(now)
  return false // 允许
}
