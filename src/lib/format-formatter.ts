/**
 * 短剧/大纲格式处理 Skill
 *
 * 自动将 LLM 输出的脏 Markdown 清洗为符合 FORMAT_SPEC.md 规范的格式。
 * 在 markdown→HTML 渲染前调用，确保最终展示效果符合专业编剧标准。
 *
 * 主要功能：
 * 1. 检测并修正滥用 `|` 符号（拆分为段落）
 * 2. 修正单行挤在一起的内容（按 | 拆分并换行）
 * 3. 规范集/场景标题格式
 * 4. 修正对白格式
 * 5. 补充场景间分隔 `---`
 */

export interface FormatResult {
  content: string
  changes: string[]
  warnings: string[]
}

// ─────────────────────────────────────────────
// 1. 滥用 | 符号检测与拆分
// ─────────────────────────────────────────────

/**
 * 检测一行内是否有过多 `|` 符号
 * 触发条件：单行 ≥ 4 个 `|` 且非表格行（非以 | 开头/结尾的标准表格行）
 */
function isAbusedPipes(line: string): boolean {
  const trimmed = line.trim()
  // 标准表格行（前缀 | 或纯表头分隔）跳过
  if (/^\|.*\|$/.test(trimmed) && /^\|[\s\-:|]+\|$/.test(trimmed)) return false
  if (/^\|.*\|$/.test(trimmed) && trimmed.split('|').length <= 6) {
    // 可能是合规表格，不动
    return false
  }
  const pipeCount = (line.match(/\|/g) || []).length
  return pipeCount >= 4
}

/**
 * 将滥用 | 的内容按 | 拆分并格式化
 * 例：`| 时间 | 0-5s | 落花飘入溪水 | 旁白：大历年间 |`
 *   → `- **时间**：0-5s\n- **画面**：落花飘入溪水\n- **旁白**：大历年间`
 */
function splitAbusedPipes(line: string, changes: string[]): string {
  // 去掉首尾的 |
  const stripped = line.replace(/^\s*\||\|\s*$/g, '').trim()
  const parts = stripped.split('|').map((p) => p.trim()).filter(Boolean)
  if (parts.length < 2) return line

  // 智能识别字段名（中文 2-6 字 + ：）
  const lines: string[] = []
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    // 形如 "时间 | 0-5s" 的成对
    const next = parts[i + 1]
    if (next && /^\d+[-~]\d+[s秒]?$/.test(next)) {
      lines.push(`- **${part}**：${next}`)
      i++ // 跳过 next
    } else if (next && next.length < 10 && /^[a-zA-Z\u4e00-\u9fa5]{1,8}$/.test(next)) {
      lines.push(`- **${part}**：${next}`)
      i++
    } else {
      // 没有匹配成对 → 单独成段
      lines.push(`  ${part}`)
    }
  }
  changes.push(`拆分滥用 | 符号：${parts.length} 段`)
  return lines.join('\n')
}

// ─────────────────────────────────────────────
// 2. 场景标题规范化
// ─────────────────────────────────────────────

/**
 * 修正场景标题格式
 * 例：`## 场景1 浣花溪畔` → `## 场景 1 | 浣花溪畔 | 日 | 内景`
 */
function normalizeSceneTitle(line: string, changes: string[]): string | null {
  const m = line.match(/^#{2,}\s*场景\s*(\d+)[\s,，]+(.+)$/)
  if (!m) return null
  const num = m[1]
  const rest = m[2].trim()
  // 已经有 | 分隔就不动
  if (rest.includes('|')) {
    // 但确保数字和"场景"间有空格
    return line.replace(/^#{2,}\s*场景(\d+)/, (_m, n) => `## 场景 ${n}`)
  }
  changes.push(`规范化场景标题：场景 ${num}`)
  return `## 场景 ${num} | ${rest} | 日 | 内景`
}

// ─────────────────────────────────────────────
// 3. 对白格式修正
// ─────────────────────────────────────────────

/**
 * 检测并修正对白
 * 例：`薛涛：诗在我在` → `**薛涛**（平静）："诗在我在"`
 * 例：`**薛涛**："诗在我在"` → `**薛涛**（平静）："诗在我在"`
 */
function normalizeDialogue(line: string, changes: string[]): string | null {
  // 已经是规范格式： **角色**（情绪）："对白"
  if (/^\*\*[^*]+\*\*[（(][^）)]*[）)]：\s*"[^"]+"/.test(line.trim())) {
    return null
  }
  // 修正 **角色**："对白"（缺情绪）
  const m1 = line.match(/^(\*\*[^*]+\*\*)\s*[：:]\s*"([^"]+)"\s*$/)
  if (m1) {
    changes.push(`补充对白情绪描述`)
    return `${m1[1]}（平静）："${m1[2]}"`
  }
  // 修正 角色："对白"（缺加粗 + 情绪）
  const m2 = line.match(/^([\u4e00-\u9fa5]{1,8})\s*[：:]\s*"([^"]+)"\s*$/)
  if (m2) {
    changes.push(`加粗对白角色名 + 补充情绪`)
    return `**${m2[1]}**（平静）："${m2[2]}"`
  }
  return null
}

// ─────────────────────────────────────────────
// 4. 动作/旁白检测
// ─────────────────────────────────────────────

/**
 * 检测把动作/描述加引号的错误并修正
 * 例：`"薛涛提笔写字"` → `薛涛提笔写字。`
 */
function normalizeActionQuote(line: string, changes: string[]): string | null {
  const m = line.match(/^[""]([^""]+)[""]\s*$/)
  if (!m) return null
  const content = m[1]
  // 含对白特征词（说/道/问/答/喊/叫）→ 真的是对白，不动
  if (/[说道问答喊叫]/.test(content)) return null
  // 是动作/描述 → 去除引号，补句号
  changes.push(`去除动作描述的错误引号`)
  return content.endsWith('。') ? content : `${content}。`
}

// ─────────────────────────────────────────────
// 5. 场景间分隔
// ─────────────────────────────────────────────

/**
 * 在场景标题之前插入 `---` 分隔（除第一个场景外）
 */
function ensureSceneSeparator(lines: string[], changes: string[]): string[] {
  const result: string[] = []
  let lastWasScene = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const isScene = /^##\s+场景\s+\d+/.test(line.trim())
    if (isScene && lastWasScene) {
      // 两个场景标题相邻 → 不需要 ---
    } else if (isScene && i > 0 && result.length > 0) {
      // 场景标题前需要 ---
      const prev = result[result.length - 1].trim()
      if (prev && prev !== '---' && !/^#/.test(prev)) {
        result.push('')
        result.push('---')
        result.push('')
        changes.push(`在场景前插入分隔 ---`)
      }
    }
    result.push(line)
    lastWasScene = isScene
  }
  return result
}

// ─────────────────────────────────────────────
// 6. 主函数：formatContent
// ─────────────────────────────────────────────

export function formatContent(raw: string): FormatResult {
  if (!raw || typeof raw !== 'string') {
    return { content: raw, changes: [], warnings: [] }
  }

  const changes: string[] = []
  const warnings: string[] = []

  // 0) 预处理：去除 <br> 标签（替换为换行）
  let preprocessed = raw
  if (/<br\s*\/?>/i.test(preprocessed)) {
    const before = (preprocessed.match(/<br\s*\/?>/gi) || []).length
    preprocessed = preprocessed.replace(/<br\s*\/?>/gi, '\n')
    changes.push(`去除 ${before} 个 <br> 标签 → 换行`)
  }

  const lines = preprocessed.split('\n')
  const processed: string[] = []

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]

    // 跳过空行
    if (!line.trim()) {
      processed.push(line)
      continue
    }

    // 1) 滥用 | 检测
    if (isAbusedPipes(line)) {
      const split = splitAbusedPipes(line, changes)
      processed.push(split)
      continue
    }

    // 2) 场景标题规范化
    const sceneFixed = normalizeSceneTitle(line, changes)
    if (sceneFixed) {
      processed.push(sceneFixed)
      continue
    }

    // 3) 对白规范化
    const dialogueFixed = normalizeDialogue(line, changes)
    if (dialogueFixed) {
      processed.push(dialogueFixed)
      continue
    }

    // 4) 动作加引号修正
    const actionFixed = normalizeActionQuote(line, changes)
    if (actionFixed) {
      processed.push(actionFixed)
      continue
    }

    processed.push(line)
  }

  // 5) 场景间分隔
  const final = ensureSceneSeparator(processed, changes)

  return {
    content: final.join('\n'),
    changes: Array.from(new Set(changes)),
    warnings,
  }
}

// ─────────────────────────────────────────────
// 7. 检测内容类型（剧本 vs 大纲）
// ─────────────────────────────────────────────

export type ContentType = 'script' | 'outline' | 'unknown'

export function detectContentType(content: string): ContentType {
  const trimmed = content.trim()
  // 场景标题 → 剧本
  if (/^#{1,2}\s*场景\s*\d+/.test(trimmed)) return 'script'
  // 时间戳格式 → 剧本
  if (/\d+s\s*[|｜]/.test(trimmed)) return 'script'
  // "故事线" / "立意" / "主要人物" → 大纲
  if (/(故事立意|主要人物|故事线|核心冲突)/.test(trimmed)) return 'outline'
  return 'unknown'
}

// ─────────────────────────────────────────────
// 8. LLM System Prompt 增强器
// ─────────────────────────────────────────────

export const FORMAT_SYSTEM_PROMPT = `

# 📐 输出格式铁律（必须严格遵守）

## 🚨 硬性禁令（最高优先级）
- **禁止输出任何 HTML 标签**，包括但不限于：\`<br>\`、\`<br/>\`、\`<p>\`、\`<div>\`、\`&nbsp;\`
- 需要换行就用 **真正的换行符**（Markdown 的空行或段落分隔）
- 输出会被自动清洗：发现 \`<br>\` 会强制转换为换行，但**会留下清洗记录**

## 剧本格式
1. 集标题用：\`# 第N集：标题\`
2. 场景标题用：\`## 场景 N | 地点 | 时间 | 内/外景\`
3. 场景描述用：\`> 【景别/运镜】内容\`
4. 对白用：\`**角色名**（情绪/动作）："对白内容"\`
5. 旁白用：\`> 旁白（身份）："内容"\`
6. 场景间用：\`---\` 空行分隔
7. **绝对禁止滥用 \`|\` 符号** —— 管道符只用于"场次信息密集表达"或"标准 Markdown 表格"

## 大纲格式
1. 顶层：\`# 《片名》大纲\`
2. 主要板块（故事立意/主要人物/故事线）：\`##\`
3. 幕/节拍：\`###\`
4. 列表项：\`- **字段名**：内容\`

## 🚫 错误示例（绝对不要这样写）
❌ \`<br>\`、\`<br/>\`、\`<br />\`  ← HTML 标签
❌ \`| 时间 | 0-5s | 落花飘入 | 旁白：大历年间 |\`  ← 滥用 |
❌ \`薛涛：诗在我在\`  ← 角色未加粗、缺情绪描述
❌ \`"薛涛提笔写字"\`  ← 动作加引号是错的
❌ 整段内容挤在一行  ← 段间必须换行

## ✅ 正确示例
✅ \`## 场景 1 | 浣花溪畔 | 黄昏 | 外景\`
✅ \`**薛涛**（抬头，目光坚定）："诗在我在，你们夺不走的。"\`
✅ \`> 旁白（女声，低沉）："大历年间，成都浣花溪。"\`
✅ 段间用空行分隔：
   \`\`\`
   # 第一集：才女入乐籍

   ## 场景 1 | 浣花溪畔
   \`\`\`

> 严格遵循以上规范！生成后会被自动校验，违规内容会被强制改写。
`
