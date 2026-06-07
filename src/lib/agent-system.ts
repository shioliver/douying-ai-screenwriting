/**
 * 短剧智能体系统
 * 包含意图识别、Agent 路由、合规检测
 */

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

export type AgentType = 'short-drama' | 'outline' | 'general'

// ============================================================
// 多轮对话选择机制（最多 5 轮）
// ============================================================

/** 字段类型 */
export type DialogueFieldType = 'choice' | 'text'

/** 单个选择字段定义 */
export interface DialogueField {
  key: string
  question: string
  description?: string
  type: DialogueFieldType
  options?: { label: string; value: string }[]
  placeholder?: string
  /** 是否必填（用户必须给出一个值才能进入下一轮） */
  required?: boolean
}

/** 短剧创作需要收集的字段（5 个，正好 5 轮） */
export const SHORT_DRAMA_DIALOGUE_FIELDS: DialogueField[] = [
  {
    key: 'theme',
    question: '你想创作什么题材？',
    description: '选择最贴近你想法的方向',
    type: 'choice',
    required: true,
    options: [
      { label: '🚀 创业励志', value: '创业励志' },
      { label: '👨‍👩‍👧 家庭温情', value: '家庭温情' },
      { label: '🏫 校园青春', value: '校园青春' },
      { label: '🌾 乡村振兴', value: '乡村振兴' },
      { label: '🎭 传统文化/非遗', value: '传统文化' },
      { label: '🔬 科技发展', value: '科技发展' },
    ],
  },
  {
    key: 'episodes',
    question: '想要多少集？',
    type: 'choice',
    required: true,
    options: [
      { label: '3 集（紧凑）', value: '3' },
      { label: '5 集（标准）', value: '5' },
      { label: '8 集（深度）', value: '8' },
      { label: '10 集（系列）', value: '10' },
    ],
  },
  {
    key: 'duration',
    question: '每集时长？',
    type: 'choice',
    required: true,
    options: [
      { label: '30 秒（超短）', value: '30' },
      { label: '1 分钟（标准）', value: '60' },
      { label: '2 分钟（中长）', value: '120' },
      { label: '3 分钟（完整）', value: '180' },
    ],
  },
  {
    key: 'coreValue',
    question: '希望突出哪个正向主题？',
    description: '可多选或自定义',
    type: 'choice',
    required: true,
    options: [
      { label: '💪 奋斗拼搏', value: '奋斗拼搏' },
      { label: '❤️ 真情温暖', value: '真情温暖' },
      { label: '🏛️ 文化传承', value: '文化传承' },
      { label: '🤝 助人为乐', value: '助人为乐' },
      { label: '🇨🇳 爱国情怀', value: '爱国情怀' },
    ],
  },
  {
    key: 'protagonist',
    question: '主角是怎样的角色？',
    description: '可点击下方选项或直接输入自定义描述',
    type: 'text',
    required: true,
    placeholder: '例：90后返乡创业大学生',
    options: [
      { label: '👨‍🎓 青年学生', value: '青年学生' },
      { label: '👩‍💼 都市白领', value: '都市白领' },
      { label: '👨‍🌾 新农人', value: '新农人' },
      { label: '👴 退休老人', value: '退休老人' },
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
}

/** 最大对话轮次（硬性限制） */
export const MAX_DIALOGUE_ROUNDS = 5

/**
 * 创建新的对话会话
 */
export function createDialogue(agentType: AgentType, initialRequest: string): DialogueState {
  return {
    active: true,
    agentType,
    fields: SHORT_DRAMA_DIALOGUE_FIELDS,
    currentIndex: 0,
    collected: {},
    initialRequest,
    rounds: 0,
    maxRounds: MAX_DIALOGUE_ROUNDS,
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
  parts.push(`【用户原始需求】\n${state.initialRequest}`)
  parts.push(`\n【已确认的创作参数】`)

  for (const field of state.fields) {
    const value = state.collected[field.key]
    if (value) {
      parts.push(`- ${field.question.replace(/？$/, '')}：${value}`)
    }
  }

  if (state.rounds >= state.maxRounds) {
    parts.push(
      `\n注：用户已提供 ${state.rounds} 轮信息，参数已确认，开始创作。`
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

  // 1) 短剧意图
  for (const kw of SHORT_DRAMA_TRIGGERS) {
    if (text.includes(kw.toLowerCase())) {
      return {
        agent: 'short-drama',
        confidence: 0.95,
        reason: `检测到关键词"${kw}"，触发短剧创作 Agent`,
      }
    }
  }

  // 2) 大纲意图
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

# 工作流
1. 收到创作需求后，先快速构思"核心立意"（一句话正能量主题）
2. 然后输出**大纲**（3-5 个节拍点，含主题立意说明）
3. 接着输出**完整剧本**（分场景、含对白）
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

  // === 计算最终得分 ===
  const forbiddenPenalty = Math.min(foundForbidden.length * 0.3, 1.0)
  const finalScore = Math.max(0, positiveScore - forbiddenPenalty)

  // === 严重度评估 ===
  let severity: ComplianceResult['severity'] = 'none'
  if (foundForbidden.length > 0) severity = 'high'
  else if (positiveScore < 0.5) severity = 'medium'
  else if (positiveScore < 0.7) severity = 'low'

  const passed = severity !== 'high' && finalScore >= 0.5

  return {
    passed,
    score: finalScore,
    issues,
    suggestions,
    severity,
  }
}

/**
 * 检查用户输入是否合规（在调用 LLM 之前）
 */
export function validateUserInput(input: string): ComplianceResult {
  return checkCompliance(input)
}
