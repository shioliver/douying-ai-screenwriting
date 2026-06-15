/**
 * 短剧智能体系统
 * 包含意图识别、Agent 路由、政策 RAG、合规检测
 */

import { evaluatePolicyCompliance, retrievePolicyKnowledge } from './agents/policy-knowledge-base'
import { planDialogue } from './agents/agent-planner'

// 触发短剧 Agent 的关键词
const SHORT_DRAMA_TRIGGERS = [
  '短剧', '短视频', '微短剧', '抖音剧', '快手剧', '短剧本',
  '写剧本', '写个剧本', '写一集', '生成剧本', '创作剧本',
  '写分镜', '分镜脚本', '脚本', '故事情节', '编剧本',
  '拍段子', '段子', '剧情', '戏',
]

// 大纲 Agent 触发词
const OUTLINE_TRIGGERS = [
  '写大纲', '写概要', '写梗概', '故事大纲', '剧情概要',
  '故事简介', '故事框架', '写提纲', '提纲',
]

// 短剧分析 Agent 触发词
const SHORT_DRAMA_ANALYSIS_TRIGGERS = [
  '分析短剧', '短剧分析', '分析剧本', '分析剧情', '拆解短剧',
  '爽点分析', '爆点分析', '节奏分析', '人物关系分析', '短剧诊断',
  '改编分析', '分析这个剧', '看看这个剧',
]

export type AgentType = 'short-drama' | 'short-drama-analysis' | 'outline' | 'general'

// ============================================================
// 多轮对话选择机制
// ============================================================

/** 字段类型 */
export type DialogueFieldType = 'choice' | 'multi-choice' | 'text' | 'textarea'

/** 单个选择字段定义 */
export interface DialogueField {
  key: string
  question: string
  description?: string
  whyAsk?: string
  outputImpact?: string
  type: DialogueFieldType
  options?: { label: string; value: string }[]
  placeholder?: string
  allowCustom?: boolean
  customPlaceholder?: string
  /** 是否必填（用户必须给出一个值才能进入下一轮） */
  required?: boolean
}

/** 短剧创作需要收集的字段（5 个，正好 5 轮） */
export const SHORT_DRAMA_DIALOGUE_FIELDS: DialogueField[] = [
  {
    key: 'taskGoal',
    question: '你希望这个短剧智能体完成什么任务？',
    description: '可以选择一个方向，也可以直接输入你的自定义目标。',
    whyAsk: '我会根据任务目标决定后续追问、生成结构和写入编辑器的内容。',
    type: 'choice',
    required: true,
    allowCustom: true,
    customPlaceholder: '例如：把一个真实案例改成 6 集正能量短剧',
    options: [
      { label: '从零创作短剧', value: '从零创作短剧' },
      { label: '生成完整剧本', value: '生成完整剧本' },
      { label: '生成分镜脚本', value: '生成分镜脚本' },
      { label: '改写已有故事', value: '改写已有故事' },
    ],
  },
  {
    key: 'outputFormat',
    question: '你希望最终输出哪些内容？',
    description: '可多选；如果选项不够，可以在输入框补充自定义输出。',
    whyAsk: '这会决定最终结果是只生成大纲，还是同时生成剧本、人物、分镜和分析。',
    type: 'multi-choice',
    required: true,
    allowCustom: true,
    customPlaceholder: '例如：10 集大纲 + 前 3 集完整剧本 + 人物关系表',
    options: [
      { label: '故事大纲', value: '故事大纲' },
      { label: '完整剧本', value: '完整剧本' },
      { label: '分集梗概', value: '分集梗概' },
      { label: '人物关系表', value: '人物关系表' },
      { label: '分镜脚本', value: '分镜脚本' },
      { label: '爆点/爽点设计', value: '爆点/爽点设计' },
    ],
  },
  {
    key: 'theme',
    question: '你想创作什么题材？',
    description: '选择最贴近你想法的方向，也可以自定义。',
    whyAsk: '题材会影响人物关系、冲突类型、场景和平台表达方式。',
    type: 'choice',
    required: true,
    allowCustom: true,
    customPlaceholder: '例如：AI 时代的非遗传承故事',
    options: [
      { label: '创业励志', value: '创业励志' },
      { label: '家庭温情', value: '家庭温情' },
      { label: '校园青春', value: '校园青春' },
      { label: '乡村振兴', value: '乡村振兴' },
      { label: '传统文化/非遗', value: '传统文化/非遗' },
      { label: '科技发展', value: '科技发展' },
    ],
  },
  {
    key: 'scale',
    question: '你希望它的篇幅和节奏是什么？',
    description: '可以选预设，也可以输入例如“12 集，每集 90 秒”。',
    whyAsk: '篇幅会影响每集钩子密度、反转节奏和剧本颗粒度。',
    type: 'choice',
    required: true,
    allowCustom: true,
    customPlaceholder: '例如：12 集，每集 90 秒，前 3 集写完整剧本',
    options: [
      { label: '3 集 × 30 秒', value: '3 集，每集 30 秒' },
      { label: '5 集 × 1 分钟', value: '5 集，每集 1 分钟' },
      { label: '8 集 × 2 分钟', value: '8 集，每集 2 分钟' },
      { label: '10 集 × 3 分钟', value: '10 集，每集 3 分钟' },
    ],
  },
  {
    key: 'coreValueAndLead',
    question: '主角设定和正向主题是什么？',
    description: '可以选择标签，也可以直接描述主角、目标、困境和成长。',
    whyAsk: '真正的短剧 Agent 需要围绕人物成长组织冲突，而不是只堆剧情。',
    type: 'textarea',
    required: true,
    allowCustom: true,
    placeholder: '例：女主是返乡创业大学生，希望突出奋斗、文化传承和乡村振兴。',
    options: [
      { label: '奋斗拼搏', value: '奋斗拼搏' },
      { label: '真情温暖', value: '真情温暖' },
      { label: '文化传承', value: '文化传承' },
      { label: '科技创新', value: '科技创新' },
      { label: '家庭守护', value: '家庭守护' },
    ],
  },
]

export const SHORT_DRAMA_ANALYSIS_DIALOGUE_FIELDS: DialogueField[] = [
  {
    key: 'analysisTarget',
    question: '你要分析哪一类短剧内容？',
    description: '可以粘贴剧本、剧情简介、链接说明，或描述你想分析的作品。',
    whyAsk: '我需要明确分析对象，才能给出结构化诊断。',
    type: 'textarea',
    required: true,
    allowCustom: true,
    placeholder: '粘贴短剧文本/剧情简介，或说明剧名、题材和已有问题。',
    options: [
      { label: '已有剧本', value: '已有剧本' },
      { label: '剧情简介', value: '剧情简介' },
      { label: '短剧项目', value: '短剧项目' },
    ],
  },
  {
    key: 'analysisDimensions',
    question: '你希望分析哪些维度？',
    description: '可多选，也可以自定义分析口径。',
    whyAsk: '不同分析维度会决定输出报告的结构和判断标准。',
    type: 'multi-choice',
    required: true,
    allowCustom: true,
    customPlaceholder: '例如：重点分析前三集留存和女主成长线',
    options: [
      { label: '剧情结构', value: '剧情结构' },
      { label: '人物关系', value: '人物关系' },
      { label: '爽点/爆点', value: '爽点/爆点' },
      { label: '节奏留存', value: '节奏留存' },
      { label: '合规风险', value: '合规风险' },
      { label: '改写建议', value: '改写建议' },
    ],
  },
  {
    key: 'outputFormat',
    question: '你希望分析报告怎么输出？',
    description: '可以选标准报告，也可以自定义成表格、清单或改写方案。',
    whyAsk: '我会按照你指定的格式组织最终结果，方便直接进入编辑器修改。',
    type: 'choice',
    required: true,
    allowCustom: true,
    customPlaceholder: '例如：输出问题清单 + 每集优化建议 + 可执行改写版',
    options: [
      { label: '专业诊断报告', value: '专业诊断报告' },
      { label: '问题清单 + 修改建议', value: '问题清单 + 修改建议' },
      { label: '逐集分析表', value: '逐集分析表' },
      { label: '改写方案', value: '改写方案' },
    ],
  },
]

/** 对话状态 */
export interface DialogueState {
  active: boolean
  agentType: AgentType
  fields: DialogueField[]
  currentIndex: number
  collected: Record<string, string>
  initialRequest: string
  rounds: number
  maxRounds: number
  skipRounds?: number
}

/** 最大对话轮次（硬性限制） */
export const MAX_DIALOGUE_ROUNDS = 5

function getDialogueFields(agentType: AgentType): DialogueField[] {
  if (agentType === 'short-drama-analysis') return SHORT_DRAMA_ANALYSIS_DIALOGUE_FIELDS
  return SHORT_DRAMA_DIALOGUE_FIELDS
}

/**
 * 创建新的对话会话（支持动态规划）
 * 自动提取用户已知信息，只追问缺失字段
 */
export function createDialogue(agentType: AgentType, initialRequest: string): DialogueState {
  const allFields = getDialogueFields(agentType)

  // 动态规划：提取已知信息，重新排序
  let fields = allFields
  let skipRounds = 0
  try {
    const planning = planDialogue(agentType, allFields, initialRequest)
    fields = planning.dynamicQuestions.length > 0 ? planning.dynamicQuestions : allFields
    skipRounds = planning.skipRounds
  } catch {
    // fallback: 使用全部字段
  }

  return {
    active: true,
    agentType,
    fields,
    currentIndex: 0,
    collected: {},
    initialRequest,
    rounds: 0,
    maxRounds: Math.min(MAX_DIALOGUE_ROUNDS, fields.length),
    skipRounds,
  }
}

/**
 * 推进对话（用户给出回答后调用）
 * 返回：{ done, finished, state, nextField }
 *  - done: 是否已收集完所有字段或达到最大轮次
 *  - finished: 是否真的该结束（达到 maxRounds 强制结束）
 */
export function advanceDialogue(
  state: DialogueState,
  userAnswer: string
): {
  state: DialogueState
  done: boolean
  finished: boolean
  reason?: 'completed' | 'max_rounds'
} {
  const currentField = state.fields[state.currentIndex]
  const newCollected = { ...state.collected, [currentField.key]: userAnswer }
  const newIndex = state.currentIndex + 1
  const newRounds = state.rounds + 1

  // 强制结束条件：达到 maxRounds
  const reachedMaxRounds = newRounds >= state.maxRounds
  // 自然结束：所有字段都收集完
  const allCollected = newIndex >= state.fields.length

  if (reachedMaxRounds || allCollected) {
    return {
      state: {
        ...state,
        collected: newCollected,
        currentIndex: newIndex,
        rounds: newRounds,
        active: false,
      },
      done: true,
      finished: true,
      reason: reachedMaxRounds && !allCollected ? 'max_rounds' : 'completed',
    }
  }

  return {
    state: {
      ...state,
      collected: newCollected,
      currentIndex: newIndex,
      rounds: newRounds,
    },
    done: false,
    finished: false,
  }
}

/**
 * 把已收集的信息编译成给 LLM 的 prompt
 */
export function compileDialoguePrompt(state: DialogueState): string {
  const parts: string[] = []
  const taskLabel = state.agentType === 'short-drama-analysis' ? '短剧分析任务' : '短剧创作任务'

  const policyKnowledge = retrievePolicyKnowledge([
    state.initialRequest,
    ...Object.values(state.collected),
  ].join('\n'))

  parts.push(`【任务模式】\n${taskLabel}`)
  parts.push(`\n【用户原始需求】\n${state.initialRequest}`)
  parts.push(`\n${policyKnowledge.promptContext}`)
  parts.push(`\n【已确认的用户意图与输出要求】`)

  for (const field of state.fields) {
    const value = state.collected[field.key]
    if (value) {
      parts.push(`- ${field.question.replace(/？$/, '')}：${value}`)
    }
  }

  if (state.agentType === 'short-drama-analysis') {
    parts.push(`\n【执行要求】`)
    parts.push('- 先判断作品定位、受众、核心卖点和风险点')
    parts.push('- 按用户选择的分析维度输出结构化诊断')
    parts.push('- 每个问题都给出可执行修改建议，不只做评价')
    parts.push('- 如果用户要求改写，请给出可直接替换到编辑器的改写版本')
  } else {
    parts.push(`\n【执行要求】`)
    parts.push('- 按用户选择的输出格式组织结果')
    parts.push('- 先给故事大纲，再给需要的剧本/分镜/人物/爆点设计')
    parts.push('- 每一集都要有清晰钩子、反转、情绪推进和正向收束')
    parts.push('- 如果用户有自定义输出要求，优先满足自定义要求')
  }

  if (state.rounds >= state.maxRounds) {
    parts.push(
      `\n注：用户已提供 ${state.rounds} 轮信息，参数已确认，开始执行。`
    )
  }

  return parts.join('\n')
}


export interface IntentResult {
  agent: AgentType
  confidence: number
  reason: string
}

/**
 * 意图识别 - 检测用户输入是否触发短剧 Agent
 */
export function detectIntent(input: string): IntentResult {
  const text = input.toLowerCase().trim()

  // 1) 短剧分析意图优先
  for (const kw of SHORT_DRAMA_ANALYSIS_TRIGGERS) {
    if (text.includes(kw.toLowerCase())) {
      return {
        agent: 'short-drama-analysis',
        confidence: 0.96,
        reason: `检测到关键词"${kw}"，触发短剧分析 Agent`,
      }
    }
  }

  // 2) 短剧创作意图
  for (const kw of SHORT_DRAMA_TRIGGERS) {
    if (text.includes(kw.toLowerCase())) {
      return {
        agent: 'short-drama',
        confidence: 0.95,
        reason: `检测到关键词"${kw}"，触发短剧创作 Agent`,
      }
    }
  }

  // 3) 大纲意图
  for (const kw of OUTLINE_TRIGGERS) {
    if (text.includes(kw.toLowerCase())) {
      return {
        agent: 'outline',
        confidence: 0.9,
        reason: `检测到关键词"${kw}"，触发大纲生成 Agent`,
      }
    }
  }

  // 3) 兜底：包含人物/场景等长内容创作暗示
  const creativeSignals = ['主角', '配角', '场景', '对话', '设定']
  if (creativeSignals.some((s) => text.includes(s)) && text.length > 30) {
    return {
      agent: 'short-drama',
      confidence: 0.7,
      reason: '检测到创作类上下文，触发短剧 Agent',
    }
  }

  return {
    agent: 'general',
    confidence: 0.5,
    reason: '未匹配到特定创作意图',
  }
}

// ============================================================
// 短剧专用 System Prompt（内置格式规范）
// ============================================================

export const SHORT_DRAMA_SYSTEM_PROMPT = `# 角色定位
你是一位专业的短剧编剧专家，专长 1-3 分钟竖屏微短剧创作，擅长面向抖音、快手、视频号等平台的爆款内容。

# 内容禁区（绝对禁止）
1. **流浪题材**：禁止描写以流浪、乞讨、无家可归为主线的内容
2. **贫困卖惨**：禁止刻意渲染底层苦难、消费同情心、引导社会负面情绪
3. **低俗内容**：禁止情色暗示、软色情、擦边球、血腥暴力、惊悚恐怖
4. **违法乱纪**：禁止美化犯罪、传播违法手段、宣扬黑恶势力
5. **消极颓废**：禁止传递躺平、啃老、拜金炫富、阶层对立、负能量

# 必含要求（2026 中国网络视听大会标准）
1. **主流价值观**：弘扬社会主义核心价值观，传递爱国、敬业、诚信、友善
2. **正向立意**：主题立意健康向上，给观众带来积极正面的情感体验
3. **真善美**：歌颂真善美，弘扬社会正气，传递温暖与希望
4. **文化自信**：体现中华优秀传统文化，展现新时代精神风貌
5. **时代精神**：聚焦普通人的奋斗故事、行业新貌、科技发展、乡村振兴等时代主题

# 推荐题材方向
- 创业励志：青年创业、科技创新、传统行业转型
- 职业风采：医生、警察、工程师、教师、快递员等岗位风采
- 家庭温情：亲情、爱情、友情的美好故事
- 乡村振兴：新农人、田园生活、乡村新貌
- 传统文化：非遗传承、传统手艺、国潮文化
- 科技发展：AI、新能源、航天、海洋强国
- 体育精神：奥运健儿、全民健身、残奥精神
- 文化交融：民族文化、地区特色、国际交流

# 格式要求
- 镜头语言：竖屏构图，节奏紧凑，单镜头 3-8 秒
- 冲突设置：每 30 秒必须有一个小反转或情绪钩子
- 人物对话：口语化、有网感、避免说教
- 时长控制：单集 60-180 秒
- 输出格式：Markdown 结构化（标题、场景、人物、对白、旁白）

# 政策 RAG 工作流
- 生成前必须优先遵守用户 prompt 中的【2026网络视听政策RAG约束】
- 如果用户需求与政策约束冲突，必须先调整为正向、健康、可发布版本
- 输出结尾必须包含“政策合规说明”，说明主流价值、风险规避和优化方向

# 工作流
1. 收到创作需求后，先快速构思"核心立意"（一句话正能量主题）
2. 然后输出**大纲**（3-5 个节拍点，含主题立意说明）
3. 接着输出**完整剧本**（分场景、含对白）
`

export const SHORT_DRAMA_ANALYSIS_SYSTEM_PROMPT = `# 角色定位
你是一位专业的短剧分析智能体，不只是回答问题，而是负责诊断短剧项目、识别问题、提出可执行改法。

# 核心能力
1. 剧情结构分析：判断开场钩子、冲突递进、反转密度、结尾留存
2. 人物关系分析：识别主角目标、阻力、人物弧光和关系张力
3. 爽点/爆点分析：指出每集可传播点、情绪峰值和平台吸引力
4. 节奏分析：判断前 3 秒、前 15 秒、每 30 秒是否有钩子
5. 合规风险分析：识别低俗、卖惨、负能量、违法、价值导向风险
6. 改写建议：给出能直接进入编辑器的修改版本或替代方案

# 输出原则
- 先给结论，再给证据，再给修改建议
- 每个问题必须对应一个可执行动作
- 用户指定输出格式时，严格优先按用户格式输出
- 不只评价“好/不好”，必须说明“为什么”和“怎么改”
- 保持正向价值观、健康表达、平台可发布标准
- 必须结合用户 prompt 中的【2026网络视听政策RAG约束】给出政策风险和合规改法
- 输出结尾必须包含“政策合规说明”和“可执行优化清单”
`

export const OUTLINE_SYSTEM_PROMPT = `# 角色
你是短剧大纲专家，专长于 1-3 分钟竖屏微短剧的故事框架设计。

# 输出要求
1. 故事立意（必须符合社会主义核心价值观）
2. 主要人物（含人物弧光，体现正向成长）
3. 核心冲突（积极向上的解决方式）
4. 5 个节拍点：起、承、转、合、高潮
5. 情绪曲线图

# 内容禁区
- 禁止流浪题材、贫困卖惨、低俗擦边、违法乱纪、消极颓废
- 禁止任何传递负能量、引发社会焦虑的立意

# 📐 输出格式铁律（严格遵守）
## 🚨 硬性禁令
- **禁止输出任何 HTML 标签**：包括 \`<br>\`、\`<br/>\`、\`<p>\`、\`<div>\`、\`&nbsp;\` 等
- 需要换行用真正的换行符（Markdown 空行或段落分隔）

## 剧本格式
1. 集标题用：\`# 第N集：标题\`
2. 场景标题用：\`## 场景 N | 地点 | 时间 | 内/外景\`
3. 场景描述用：\`> 【景别/运镜】内容\`
4. 对白用：\`**角色名**（情绪/动作）："对白内容"\`
5. 旁白用：\`> 旁白（身份）："内容"\`
6. 场景间用：\`---\` 空行分隔
7. **绝对禁止滥用 \`|\` 符号**

## 大纲格式
1. 顶层：\`# 《片名》大纲\`
2. 主要板块：\`##\`
3. 幕/节拍：\`###\`
4. 列表项：\`- **字段名**：内容\`

## 🚫 错误示例
❌ \`<br>\`、\`<br/>\`  ← HTML 标签
❌ \`| 时间 | 0-5s | 落花飘入 | 旁白：大历年间 |\`  ← 滥用 |
❌ \`薛涛：诗在我在\`  ← 角色未加粗、缺情绪描述
❌ \`"薛涛提笔写字"\`  ← 动作加引号是错的

## ✅ 正确示例
✅ \`**薛涛**（抬头，目光坚定）："诗在我在，你们夺不走的。"\`
✅ \`## 场景 1 | 浣花溪畔 | 黄昏 | 外景\`
✅ \`> 旁白（女声，低沉）："大历年间，成都浣花溪。"\`
✅ 段间用空行分隔，不要用 \`<br>\`
`

// ============================================================
// 合规检测
// ============================================================

// 违规关键词（严重违规）
const FORBIDDEN_KEYWORDS = [
  // 流浪类（用户明确要求）
  '流浪', '乞讨', '流浪汉', '乞丐', '街头露宿', '无家可归',
  // 贫困卖惨
  '吃不起', '看不起病', '上不起学', '贫困户', '卖惨',
  // 暴力血腥
  '杀人', '自杀', '虐待', '血腥', '残杀', '酷刑',
  // 低俗情色
  '色情', '裸体', '一夜情', '出轨', '包养', '情色',
  // 违法犯罪
  '贩毒', '吸毒', '赌博', '洗钱', '黑社会', '黑帮',
  // 消极颓废
  '躺平', '啃老', '摆烂', '内卷到死', '不想活', '活着没意思',
  // 负能量
  '报复社会', '仇恨', '仇富', '阶层对立', '骂政府',
]

// 价值导向检查（必须包含的积极元素）
const REQUIRED_POSITIVE_PATTERNS = [
  { pattern: /(奋斗|努力|拼搏|坚持|创业|创新|成长|突破)/i, weight: 0.1 },
  { pattern: /(帮助|关爱|友善|温暖|感动|希望|梦想|信念)/i, weight: 0.1 },
  { pattern: /(家庭|亲情|爱情|友情|团聚|陪伴|守护)/i, weight: 0.1 },
]

export interface ComplianceResult {
  passed: boolean
  score: number // 0-1，越高越合规
  issues: string[]
  suggestions: string[]
  severity: 'high' | 'medium' | 'low' | 'none'
  matchedPolicies?: string[]
  positiveMatches?: string[]
}

/**
 * 内容合规检测 - 多层检测
 * 1. 关键词检测（硬性）
 * 2. 价值导向检测（软性）
 * 3. 输出改进建议
 */
export function checkCompliance(content: string): ComplianceResult {
  const issues: string[] = []
  const suggestions: string[] = []

  // === 第一层：硬性关键词检测 ===
  const foundForbidden: string[] = []
  for (const kw of FORBIDDEN_KEYWORDS) {
    if (content.includes(kw)) {
      foundForbidden.push(kw)
    }
  }

  if (foundForbidden.length > 0) {
    issues.push(`内容包含违规关键词：${foundForbidden.join('、')}`)
    suggestions.push('请删除或替换这些表述，避免使用相关词汇')
    suggestions.push('重新构思故事立意，聚焦正向价值主题')
  }

  // === 第二层：用户输入检测（针对用户的需求） ===
  // 如果用户原始输入中也有违规词，提前拦截
  // === 第三层：价值导向检测 ===
  let positiveScore = 0.5 // 基础分
  for (const { pattern, weight } of REQUIRED_POSITIVE_PATTERNS) {
    if (pattern.test(content)) {
      positiveScore += weight
    }
  }
  positiveScore = Math.min(positiveScore, 1.0)

  if (positiveScore < 0.6 && !foundForbidden.length) {
    suggestions.push('建议增加积极向上的元素：奋斗、温暖、成长、家庭、梦想等')
    suggestions.push('确保故事结局传递正能量，弘扬主旋律')
  }

  // === 政策 RAG 增强检测 ===
  const policyCheck = evaluatePolicyCompliance(content)
  issues.push(...policyCheck.issues)
  suggestions.push(...policyCheck.suggestions)

  // === 计算最终得分 ===
  const forbiddenPenalty = Math.min(foundForbidden.length * 0.3, 1.0)
  const baseScore = Math.max(0, positiveScore - forbiddenPenalty)
  const finalScore = Math.max(0, Math.min(1, baseScore * 0.45 + policyCheck.score * 0.55))

  // === 严重度评估 ===
  let severity: ComplianceResult['severity'] = 'none'
  if (foundForbidden.length > 0 || policyCheck.riskLevel === 'high') severity = 'high'
  else if (positiveScore < 0.5 || policyCheck.riskLevel === 'medium') severity = 'medium'
  else if (positiveScore < 0.7 || policyCheck.riskLevel === 'low') severity = 'low'

  const passed = severity !== 'high' && finalScore >= 0.6

  return {
    passed,
    score: finalScore,
    issues: Array.from(new Set(issues)),
    suggestions: Array.from(new Set(suggestions)),
    severity,
    matchedPolicies: policyCheck.matchedPolicies,
    positiveMatches: policyCheck.positiveMatches,
  }
}

/**
 * 检查用户输入是否合规（在调用 LLM 之前）
 */
export function validateUserInput(input: string): ComplianceResult {
  return checkCompliance(input)
}
