/**
 * Agent 任务规划器
 * 动态分析用户输入，提取已知信息，只追问缺失信息
 * 实现真正 Agent 的自主规划能力
 */

import type { DialogueField, AgentType } from '../agent-system'

export interface ExtractedInfo {
  taskGoal?: string
  outputFormat?: string
  theme?: string
  scale?: string
  coreValueAndLead?: string
  analysisTarget?: string
  analysisDimensions?: string
  [key: string]: string | undefined
}

export interface PlanningResult {
  knownFields: Array<{ key: string; value: string; confidence: number }>
  missingFields: string[]
  suggestedOrder: string[]
  skipRounds: number
  dynamicQuestions: DialogueField[]
}

// 题材关键词映射
const THEME_KEYWORDS: Record<string, string[]> = {
  '创业励志': ['创业', '创业故事', '创业励志', '创业青年', '创业失败', '创业成功'],
  '家庭温情': ['家庭', '亲情', '亲情故事', '家庭温情', '父母', '子女', '团圆'],
  '校园青春': ['校园', '大学', '校园青春', '青春', '学生', '校园生活', '高考'],
  '乡村振兴': ['乡村', '农村', '乡村振兴', '返乡', '新农人', '田园', '乡村创业'],
  '传统文化/非遗': ['非遗', '传统文化', '非遗传承', '国潮', '手艺', '传统', '文化传承'],
  '科技发展': ['科技', 'AI', '人工智能', '新能源', '航天', '科技', '创新', '数字化'],
}

// 正向主题关键词映射
const VALUE_KEYWORDS: Record<string, string[]> = {
  '奋斗拼搏': ['奋斗', '拼搏', '努力', '坚持', '不放弃', '追梦'],
  '真情温暖': ['温暖', '真情', '感动', '爱', '守护', '陪伴'],
  '文化传承': ['传承', '非遗', '文化', '传统', '手艺', '国潮'],
  '科技创新': ['创新', '科技', 'AI', '数字化', '智能', '未来'],
  '家庭守护': ['家庭', '亲情', '守护', '团圆', '陪伴', '家人'],
}

// 输出格式关键词映射
const OUTPUT_KEYWORDS: Record<string, string[]> = {
  '故事大纲': ['大纲', '概要', '框架', '提纲', '故事线'],
  '完整剧本': ['完整剧本', '剧本', '全剧本', '写出来'],
  '分集梗概': ['分集', '每集', '分集梗概', '集梗概'],
  '人物关系表': ['人物关系', '角色关系', '人物表', '角色表'],
  '分镜脚本': ['分镜', '分镜脚本', '镜头', '画面'],
  '爆点/爽点设计': ['爆点', '爽点', '钩子', '反转', '高潮'],
}

// 篇幅关键词映射
const SCALE_PATTERNS: Array<{ pattern: RegExp; value: string }> = [
  { pattern: /3\s*集|三集|3集/i, value: '3 集，每集 30 秒' },
  { pattern: /5\s*集|五集|5集/i, value: '5 集，每集 1 分钟' },
  { pattern: /8\s*集|八集|8集/i, value: '8 集，每集 2 分钟' },
  { pattern: /10\s*集|十集|10集/i, value: '10 集，每集 3 分钟' },
  { pattern: /12\s*集|十二集|12集/i, value: '12 集，每集 3 分钟' },
  { pattern: /30\s*秒|30s/i, value: '30 秒' },
  { pattern: /1\s*分钟|60\s*秒|1min/i, value: '1 分钟' },
  { pattern: /2\s*分钟|120\s*秒|2min/i, value: '2 分钟' },
  { pattern: /3\s*分钟|180\s*秒|3min/i, value: '3 分钟' },
]

// 任务目标关键词映射
const TASK_KEYWORDS: Record<string, string[]> = {
  '从零创作短剧': ['从零', '创作', '写一个', '写个', '帮我写', '创作一个'],
  '生成完整剧本': ['完整剧本', '写出来', '生成剧本'],
  '生成分镜脚本': ['分镜', '分镜脚本', '镜头脚本'],
  '改写已有故事': ['改写', '改编', '修改', '优化'],
}

/**
 * 从用户输入中提取已知信息
 */
export function extractKnownInfo(input: string, agentType: AgentType): ExtractedInfo {
  const info: ExtractedInfo = {}

  // 提取任务目标
  for (const [task, keywords] of Object.entries(TASK_KEYWORDS)) {
    if (keywords.some(kw => input.includes(kw))) {
      info.taskGoal = task
      break
    }
  }

  // 提取题材
  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
    if (keywords.some(kw => input.includes(kw))) {
      info.theme = theme
      break
    }
  }

  // 提取篇幅
  for (const { pattern, value } of SCALE_PATTERNS) {
    if (pattern.test(input)) {
      info.scale = value
      break
    }
  }

  // 提取正向主题
  for (const [value, keywords] of Object.entries(VALUE_KEYWORDS)) {
    if (keywords.some(kw => input.includes(kw))) {
      info.coreValueAndLead = value
      break
    }
  }

  // 提取输出格式（多选）
  const matchedOutputs: string[] = []
  for (const [format, keywords] of Object.entries(OUTPUT_KEYWORDS)) {
    if (keywords.some((kw: string) => input.includes(kw))) {
      matchedOutputs.push(format)
    }
  }
  if (matchedOutputs.length > 0) {
    info.outputFormat = matchedOutputs.join('、')
  }

  // 分析 Agent 特殊提取
  if (agentType === 'short-drama-analysis') {
    if (input.includes('剧本') || input.includes('剧情') || input.includes('故事')) {
      info.analysisTarget = '已有剧本'
    }
    const analysisDims = ['剧情结构', '人物关系', '爽点', '爆点', '节奏', '合规', '改写']
    const matched = analysisDims.filter(d => input.includes(d))
    if (matched.length > 0) {
      info.analysisDimensions = matched.join('、')
    }
  }

  return info
}

/**
 * 动态规划对话流程
 * 只追问缺失信息，跳过已知信息
 */
export function planDialogue(
  agentType: AgentType,
  fields: DialogueField[],
  initialRequest: string
): PlanningResult {
  const extracted = extractKnownInfo(initialRequest, agentType)
  const knownFields: Array<{ key: string; value: string; confidence: number }> = []
  const missingFields: string[] = []

  // 判断每个字段是否已知
  for (const field of fields) {
    const value = extracted[field.key]
    if (value) {
      knownFields.push({
        key: field.key,
        value,
        confidence: 0.85,
      })
    } else {
      missingFields.push(field.key)
    }
  }

  // 动态排序：先问最关键的缺失字段
  const fieldPriority: Record<string, number> = {
    taskGoal: 1,
    analysisTarget: 1,
    outputFormat: 2,
    analysisDimensions: 2,
    theme: 3,
    scale: 4,
    coreValueAndLead: 5,
  }

  const suggestedOrder = [
    ...missingFields.sort((a, b) => (fieldPriority[a] || 99) - (fieldPriority[b] || 99)),
  ]

  // 生成动态问题列表（只包含缺失字段）
  const dynamicQuestions = fields
    .filter(f => missingFields.includes(f.key))
    .sort((a, b) => (fieldPriority[a.key] || 99) - (fieldPriority[b.key] || 99))

  return {
    knownFields,
    missingFields,
    suggestedOrder,
    skipRounds: knownFields.length,
    dynamicQuestions,
  }
}

/**
 * 构建智能开场消息
 * 告知用户已识别到的信息，并说明接下来要问什么
 */
export function buildSmartOpening(
  knownFields: Array<{ key: string; value: string; confidence: number }>,
  missingCount: number,
  agentType: AgentType
): string {
  const agentLabel = agentType === 'short-drama-analysis' ? '短剧分析 Agent' : '短剧创作 Agent'

  if (knownFields.length === 0) {
    return `${agentLabel} 已启动。我会根据你的回答动态组织输出，选项不够时可以直接自定义输入。`
  }

  const knownText = knownFields
    .map(f => {
      const label = f.key === 'taskGoal' ? '任务目标'
        : f.key === 'theme' ? '题材'
        : f.key === 'scale' ? '篇幅'
        : f.key === 'coreValueAndLead' ? '正向主题'
        : f.key === 'outputFormat' ? '输出格式'
        : f.key === 'analysisTarget' ? '分析对象'
        : f.key === 'analysisDimensions' ? '分析维度'
        : f.key
      return `${label}：${f.value}`
    })
    .join('；')

  return `${agentLabel} 已启动。我已识别到：${knownText}。接下来还需要确认 ${missingCount} 项信息，我会智能跳过已知内容。`
}

/**
 * 评估用户回答是否包含额外信息
 * 如果用户在一个问题中回答了多个问题，自动提取
 */
export function extractBonusInfo(
  answer: string,
  currentFieldKey: string,
  fields: DialogueField[],
  agentType: AgentType
): Array<{ key: string; value: string }> {
  const extracted = extractKnownInfo(answer, agentType)
  const bonus: Array<{ key: string; value: string }> = []

  for (const field of fields) {
    if (field.key === currentFieldKey) continue
    if (extracted[field.key]) {
      bonus.push({ key: field.key, value: extracted[field.key]! })
    }
  }

  return bonus
}
