/**
 * 轻量 Markdown -> HTML 转换器
 * 用于 AI 流式输出（markdown 文本）到 TipTap 编辑器
 */

import { formatContent, FORMAT_SYSTEM_PROMPT, detectContentType, type ContentType } from './format-formatter'

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function inlineFormat(s: string): string {
  // 先转义
  let out = escapeHtml(s)
  // 行内代码 `code`
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>')
  // 粗体 **text**
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  // 斜体 *text*（避免吞掉粗体）
  out = out.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
  return out
}

/**
 * 将 markdown 文本转换为简化 HTML
 * 支持：# 标题、**粗体**、*斜体*、`代码`、- 列表、> 引用、段落、换行
 *
 * 流程：原始 markdown → 格式清洗（format-formatter）→ HTML
 */
export function markdownToHtml(md: string, options?: { skipFormat?: boolean }): string {
  if (!md) return ''

  // 1. 格式清洗：自动修正滥用 | 、对白格式、场景标题等
  const cleaned = options?.skipFormat
    ? { content: md, changes: [] as string[] }
    : formatContent(md)

  // 2. 智能检测内容类型（剧本 / 大纲 / 未知）
  const contentType: ContentType = detectContentType(cleaned.content)
  // 给场景段落额外加 class 便于 CSS 排版
  const isScript = contentType === 'script'

  const lines = cleaned.content.split('\n')
  const out: string[] = []
  let inList = false
  let inOrderedList = false
  let paragraph: string[] = []

  const flushParagraph = () => {
    if (paragraph.length === 0) return
    const text = paragraph.join(' ').trim()
    if (text) {
      out.push(`<p>${inlineFormat(text)}</p>`)
    }
    paragraph = []
  }
  const closeList = () => {
    if (inList) { out.push('</ul>'); inList = false }
    if (inOrderedList) { out.push('</ol>'); inOrderedList = false }
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd()
    if (line.trim() === '') {
      flushParagraph()
      closeList()
      continue
    }

    // 标题
    const hMatch = line.match(/^(#{1,6})\s+(.*)$/)
    if (hMatch) {
      flushParagraph()
      closeList()
      const level = hMatch[1].length
      // 场景标题额外加 class
      const isScene = isScript && level === 2 && /^场景\s+\d+/.test(hMatch[2].trim())
      const cls = isScene ? ' class="script-scene-title"' : ''
      out.push(`<h${level}${cls}>${inlineFormat(hMatch[2])}</h${level}>`)
      continue
    }

    // 分隔线 ---
    if (/^---+$/.test(line.trim())) {
      flushParagraph()
      closeList()
      out.push('<hr/>')
      continue
    }

    // 无序列表
    const ulMatch = line.match(/^[\s]*[-*+]\s+(.*)$/)
    if (ulMatch) {
      flushParagraph()
      if (inOrderedList) { out.push('</ol>'); inOrderedList = false }
      if (!inList) { out.push('<ul>'); inList = true }
      out.push(`<li>${inlineFormat(ulMatch[1])}</li>`)
      continue
    }

    // 有序列表
    const olMatch = line.match(/^[\s]*\d+\.\s+(.*)$/)
    if (olMatch) {
      flushParagraph()
      if (inList) { out.push('</ul>'); inList = false }
      if (!inOrderedList) { out.push('<ol>'); inOrderedList = true }
      out.push(`<li>${inlineFormat(olMatch[1])}</li>`)
      continue
    }

    // 引用
    const qMatch = line.match(/^>\s*(.*)$/)
    if (qMatch) {
      flushParagraph()
      closeList()
      out.push(`<blockquote><p>${inlineFormat(qMatch[1])}</p></blockquote>`)
      continue
    }

    // 普通段落行
    closeList()
    paragraph.push(line)
  }

  flushParagraph()
  closeList()

  // 调试日志：输出格式修正记录
  if (cleaned.changes.length > 0 && typeof console !== 'undefined') {
    console.log('[format-formatter] 已自动修正：', cleaned.changes)
  }

  return out.join('')
}

/**
 * 导出：供 LLM 调用方使用的格式规范 prompt
 */
export { FORMAT_SYSTEM_PROMPT }
