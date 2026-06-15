export interface AgentLongTermMemory {
  preferredThemes: string[]
  preferredOutputs: string[]
  preferredTone: string[]
  recentProjects: Array<{
    title: string
    theme: string
    logline: string
    updatedAt: number
  }>
  policyPreference: string
}

const MEMORY_KEY = 'writer-agent-long-term-memory-v1'

const DEFAULT_MEMORY: AgentLongTermMemory = {
  preferredThemes: [],
  preferredOutputs: [],
  preferredTone: ['高校主旋律', '青年表达', '正向价值', '避免说教'],
  recentProjects: [],
  policyPreference: '优先符合2026网络视听政策、高校思政创作标准和微短剧专项治理要求',
}

export function loadAgentMemory(): AgentLongTermMemory {
  if (typeof window === 'undefined') return DEFAULT_MEMORY
  try {
    const raw = window.localStorage.getItem(MEMORY_KEY)
    if (!raw) return DEFAULT_MEMORY
    const parsed = JSON.parse(raw)
    return {
      ...DEFAULT_MEMORY,
      ...parsed,
      preferredThemes: Array.isArray(parsed?.preferredThemes) ? parsed.preferredThemes : [],
      preferredOutputs: Array.isArray(parsed?.preferredOutputs) ? parsed.preferredOutputs : [],
      preferredTone: Array.isArray(parsed?.preferredTone) ? parsed.preferredTone : DEFAULT_MEMORY.preferredTone,
      recentProjects: Array.isArray(parsed?.recentProjects) ? parsed.recentProjects.slice(0, 8) : [],
    }
  } catch {
    return DEFAULT_MEMORY
  }
}

export function saveAgentMemory(memory: AgentLongTermMemory): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(MEMORY_KEY, JSON.stringify({
    ...memory,
    preferredThemes: unique(memory.preferredThemes).slice(0, 12),
    preferredOutputs: unique(memory.preferredOutputs).slice(0, 12),
    preferredTone: unique(memory.preferredTone).slice(0, 12),
    recentProjects: memory.recentProjects.slice(0, 8),
  }))
}

export function buildMemoryPromptContext(memory: AgentLongTermMemory): string {
  return [
    '【长期记忆】',
    `创作偏好：${memory.preferredThemes.join('、') || '暂无明确偏好'}`,
    `输出偏好：${memory.preferredOutputs.join('、') || '暂无明确偏好'}`,
    `表达风格：${memory.preferredTone.join('、')}`,
    `政策偏好：${memory.policyPreference}`,
    memory.recentProjects.length
      ? `近期项目：${memory.recentProjects.map((item) => `${item.title}（${item.theme}）`).join('；')}`
      : '近期项目：暂无',
  ].join('\n')
}

export function updateAgentMemoryFromInput(input: string): AgentLongTermMemory {
  const memory = loadAgentMemory()
  const themes = ['乡村振兴', '校园青春', '青年奋斗', '科技创新', '文化传承', '非遗', '家庭温情', '中国式现代化', '生态文明']
  const outputs = ['大纲', '完整剧本', '分镜脚本', '人物关系表', '爆点分析', '合规报告']

  memory.preferredThemes = unique([
    ...memory.preferredThemes,
    ...themes.filter((item) => input.includes(item)),
  ])
  memory.preferredOutputs = unique([
    ...memory.preferredOutputs,
    ...outputs.filter((item) => input.includes(item)),
  ])
  saveAgentMemory(memory)
  return memory
}

export function updateAgentMemoryFromStructuredOutput(output: { title?: string; theme?: string; logline?: string; policyCompliance?: { positiveDirections?: string[] } }): AgentLongTermMemory {
  const memory = loadAgentMemory()
  if (output.theme) memory.preferredThemes = unique([...memory.preferredThemes, output.theme])
  if (output.policyCompliance?.positiveDirections?.length) {
    memory.preferredThemes = unique([...memory.preferredThemes, ...output.policyCompliance.positiveDirections])
  }
  if (output.title || output.theme || output.logline) {
    memory.recentProjects = [{
      title: output.title || '未命名项目',
      theme: output.theme || '未标注主题',
      logline: output.logline || '',
      updatedAt: Date.now(),
    }, ...memory.recentProjects].slice(0, 8)
  }
  saveAgentMemory(memory)
  return memory
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.map((item) => item.trim()).filter(Boolean)))
}
