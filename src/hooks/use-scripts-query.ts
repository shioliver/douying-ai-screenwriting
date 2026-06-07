import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// ---- API 层 ----

export interface Script {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

/** 从 auth-store 获取 access token */
function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem('auth-storage')
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    return parsed.state?.accessToken || null
  } catch {
    return null
  }
}

/** 构建带认证的 headers */
function authHeaders(): Record<string, string> {
  const token = getAccessToken()
  const headers: Record<string, string> = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

/** 处理 401 响应：token 过期时清除认证状态 */
function handleUnauthorized(res: Response) {
  if (res.status === 401) {
    localStorage.removeItem('auth-storage')
    // 仅在受保护页面跳转到登录页，首页不需要跳转
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname
      if (pathname !== '/' && pathname !== '/login') {
        window.location.href = '/login'
      }
    }
  }
}

async function fetchScripts(): Promise<Script[]> {
  // 未登录时不发请求，返回空列表
  if (!getAccessToken()) return []

  const res = await fetch('/api/scripts', { headers: authHeaders() })
  handleUnauthorized(res)
  const data = await res.json()
  if (!data.success) throw new Error(data.error || '加载失败')
  return (data.scripts || []).map((s: any) => ({
    id: s.scriptId,
    title: s.title,
    content: s.content,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  }))
}

async function apiCall(action: string, body: Record<string, unknown>) {
  // 未登录时不发请求，静默返回成功
  if (!getAccessToken()) {
    return { success: true }
  }

  const res = await fetch('/api/scripts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ action, ...body }),
  })
  handleUnauthorized(res)
  const data = await res.json()
  if (!data.success) throw new Error(data.error || '操作失败')
  return data
}

// ---- Query Keys ----

export const scriptKeys = {
  all: ['scripts'] as const,
  list: () => [...scriptKeys.all, 'list'] as const,
  detail: (id: string) => [...scriptKeys.all, 'detail', id] as const,
}

// ---- Hooks ----

/** 获取剧本列表 */
export function useScripts() {
  return useQuery({
    queryKey: scriptKeys.list(),
    queryFn: fetchScripts,
    enabled: !!getAccessToken(),
  })
}

/** 创建剧本 */
export function useCreateScript() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: { scriptId: string; title: string; content?: string }) =>
      apiCall('create', params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scriptKeys.list() })
    },
  })
}

/** 更新剧本 */
export function useUpdateScript() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: { scriptId: string; title?: string; content?: string }) =>
      apiCall('update', params),
    onMutate: async (params) => {
      await queryClient.cancelQueries({ queryKey: scriptKeys.list() })
      const previous = queryClient.getQueryData<Script[]>(scriptKeys.list())

      if (previous) {
        queryClient.setQueryData<Script[]>(
          scriptKeys.list(),
          previous.map((s) =>
            s.id === params.scriptId
              ? { ...s, ...params, updatedAt: new Date().toISOString().split('T')[0] }
              : s
          )
        )
      }

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(scriptKeys.list(), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: scriptKeys.list() })
    },
  })
}

/** 删除剧本 */
export function useDeleteScript() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: { scriptId: string }) =>
      apiCall('delete', params),
    onMutate: async (params) => {
      await queryClient.cancelQueries({ queryKey: scriptKeys.list() })
      const previous = queryClient.getQueryData<Script[]>(scriptKeys.list())

      if (previous) {
        queryClient.setQueryData<Script[]>(
          scriptKeys.list(),
          previous.filter((s) => s.id !== params.scriptId)
        )
      }

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(scriptKeys.list(), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: scriptKeys.list() })
    },
  })
}

/** 批量删除剧本 */
export function useDeleteScripts() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => apiCall('delete', { scriptId: id })))
    },
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: scriptKeys.list() })
      const previous = queryClient.getQueryData<Script[]>(scriptKeys.list())

      if (previous) {
        const idSet = new Set(ids)
        queryClient.setQueryData<Script[]>(
          scriptKeys.list(),
          previous.filter((s) => !idSet.has(s.id))
        )
      }

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(scriptKeys.list(), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: scriptKeys.list() })
    },
  })
}
