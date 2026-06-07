import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { isRateLimited } from '@/lib/rate-limit'
import { captureApiError } from '@/lib/sentry-server'
import { z } from 'zod'

const messageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(0).max(50000),
})

const deepseekPostSchema = z.object({
  messages: z.array(messageSchema).min(1).max(50),
  // 推荐使用 system 选项（避免 prompt injection 风险）
  system: z.string().max(50000).optional(),
})

export async function POST(request: Request) {
  // 速率限制：每分钟最多 10 次 AI 请求
  if (isRateLimited(request, { windowMs: 60000, maxRequests: 10 })) {
    return new Response(
      JSON.stringify({ error: '请求过于频繁，请稍后再试' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const userApiKey = request.headers.get('X-User-Api-Key')
  const userBaseUrl = request.headers.get('X-User-Base-Url')
  const userModel = request.headers.get('X-User-Model')
  const userProvider = request.headers.get('X-User-Provider') || 'deepseek'

  const apiKey = userApiKey || process.env.DEEPSEEK_API_KEY

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'DeepSeek API Key 未配置，请在 AI 设置中配置你的 API Key' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // 根据供应商设置默认值
  const defaultBaseUrls: Record<string, string> = {
    deepseek: 'https://api.deepseek.com/v1',
    openai: 'https://api.openai.com/v1',
    claude: 'https://api.anthropic.com/v1',
  }
  const defaultModels: Record<string, string> = {
    deepseek: 'deepseek-chat',
    openai: 'gpt-4o-mini',
    claude: 'claude-3-5-sonnet-20241022',
  }

  const baseUrl = userBaseUrl || defaultBaseUrls[userProvider] || defaultBaseUrls.deepseek
  const model = userModel || defaultModels[userProvider] || defaultModels.deepseek

  // 使用 AI SDK 的 createOpenAI 兼容层（支持所有 OpenAI 兼容 API）
  // 使用 .chat() 强制走 /v1/chat/completions 端点（兼容 DeepSeek 等第三方 API）
  const provider = createOpenAI({
    baseURL: baseUrl,
    apiKey,
  })

  try {
    const body = await request.json()

    // zod 校验
    const parsed = deepseekPostSchema.safeParse(body)
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]
      return new Response(
        JSON.stringify({ error: firstError?.message || '请求参数无效' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { messages, system } = parsed.data

    console.log('[api/deepseek] start streamText', { provider: userProvider, baseUrl, model, messagesCount: messages.length, hasSystem: !!system })

    // 1) 同步检测：先试探一下上游 API（用一个简单 request）确认 key 有效
    //    这样能在流式开始前就返回 401 等错误
    let authValid = true
    let authError: { status: number; body: string } | null = null
    try {
      const probeRes = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'OK' }],
          max_tokens: 1,
          stream: false,
        }),
      })
      if (!probeRes.ok) {
        const text = await probeRes.text().catch(() => '')
        authValid = false
        authError = { status: probeRes.status, body: text }
      }
    } catch (e) {
      // 网络错误也视为鉴权失败
      authValid = false
      authError = { status: 502, body: String(e) }
    }

    if (!authValid && authError) {
      console.error('[api/deepseek] auth probe failed', authError)
      return new Response(
        JSON.stringify({
          error: 'DeepSeek API Key 无效或网络错误',
          status: authError.status,
          detail: authError.body,
        }),
        { status: authError.status === 401 ? 401 : 502, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 2) 鉴权通过，开始流式
    const result = streamText({
      model: provider.chat(model),
      // 使用 system 选项而非 messages 中的 system role，避免 prompt injection 风险
      ...(system ? { system } : {}),
      messages,
      onError: ({ error }) => {
        console.error('[api/deepseek] streamText async error', error)
      },
    })

    const response = result.toTextStreamResponse()
    console.log('[api/deepseek] returning response, headers', Object.fromEntries(response.headers.entries()))
    return response
  } catch (error) {
    console.error('[api/deepseek] catch error', error)
    captureApiError(error, { endpoint: 'POST /api/deepseek', provider: userProvider })
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : '服务器错误' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
