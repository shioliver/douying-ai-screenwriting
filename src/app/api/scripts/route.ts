import { NextRequest, NextResponse } from 'next/server'
import { listScripts, createScript, updateScript, deleteScript, type ScriptRecord } from '@/lib/dynamodb'
import { getAuthenticatedUserId } from '@/lib/auth'
import { isRateLimited } from '@/lib/rate-limit'
import { captureApiError } from '@/lib/sentry-server'
import { z } from 'zod'

const createActionSchema = z.object({
  action: z.literal('create'),
  scriptId: z.string().min(1).optional(),
  title: z.string().min(1).max(200).optional(),
  content: z.string().max(500000).optional(),
})

const updateActionSchema = z.object({
  action: z.literal('update'),
  scriptId: z.string().min(1),
  title: z.string().min(1).max(200).optional(),
  content: z.string().max(500000).optional(),
})

const deleteActionSchema = z.object({
  action: z.literal('delete'),
  scriptId: z.string().min(1),
})

const scriptsPostSchema = z.discriminatedUnion('action', [
  createActionSchema,
  updateActionSchema,
  deleteActionSchema,
])

export async function GET(request: NextRequest) {
  if (isRateLimited(request, { windowMs: 60000, maxRequests: 60 })) {
    return NextResponse.json({ error: '请求过于频繁' }, { status: 429 })
  }

  const userId = await getAuthenticatedUserId(request)
  if (!userId) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  try {
    const scripts = await listScripts(userId)
    return NextResponse.json({ success: true, scripts })
  } catch (error: any) {
    captureApiError(error, { endpoint: 'GET /api/scripts', userId })
    return NextResponse.json({ success: false, error: error.message || '服务器错误' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (isRateLimited(request, { windowMs: 60000, maxRequests: 60 })) {
    return NextResponse.json({ error: '请求过于频繁' }, { status: 429 })
  }

  const userId = await getAuthenticatedUserId(request)
  if (!userId) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  try {
    const body = await request.json()

    // zod 校验
    const parsed = scriptsPostSchema.safeParse(body)
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]
      return NextResponse.json(
        { success: false, error: firstError?.message || '请求参数无效' },
        { status: 400 }
      )
    }

    const { action } = parsed.data

    if (action === 'create') {
      const { scriptId, title, content } = parsed.data
      const now = new Date().toISOString()
      const record: ScriptRecord = {
        userId,
        scriptId: scriptId || crypto.randomUUID(),
        title: title || '未命名剧本',
        content: content || '',
        createdAt: now,
        updatedAt: now,
      }
      await createScript(record)
      return NextResponse.json({ success: true, script: record })
    }

    if (action === 'update') {
      const { scriptId, title, content } = parsed.data
      const updates: Partial<ScriptRecord> = {}
      if (title !== undefined) updates.title = title
      if (content !== undefined) updates.content = content
      updates.updatedAt = new Date().toISOString()
      await updateScript(userId, scriptId, updates)
      return NextResponse.json({ success: true })
    }

    if (action === 'delete') {
      const { scriptId } = parsed.data
      await deleteScript(userId, scriptId)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: '未知操作' }, { status: 400 })
  } catch (error: any) {
    captureApiError(error, { endpoint: 'POST /api/scripts', userId })
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
