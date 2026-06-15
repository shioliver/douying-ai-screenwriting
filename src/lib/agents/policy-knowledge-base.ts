export type PolicyCategory = '精品创作' | '专项治理' | '主题创作' | '高校思政'

export interface PolicyKnowledgeItem {
  id: string
  title: string
  source: string
  url: string
  date: string
  category: PolicyCategory
  keywords: string[]
  summary: string
  positiveDirections: string[]
  requiredStandards: string[]
  forbiddenPatterns: string[]
  qualityWarnings: string[]
}

export interface PolicyRetrievalResult {
  items: PolicyKnowledgeItem[]
  matchedKeywords: string[]
  positiveDirections: string[]
  requiredStandards: string[]
  forbiddenPatterns: string[]
  qualityWarnings: string[]
  promptContext: string
}

export interface PolicyComplianceResult {
  score: number
  riskLevel: 'high' | 'medium' | 'low' | 'none'
  matchedPolicies: string[]
  issues: string[]
  suggestions: string[]
  positiveMatches: string[]
}

export const POLICY_KNOWLEDGE_BASE: PolicyKnowledgeItem[] = [
  {
    id: 'nrta-2026-quality-project',
    title: '2026年网络视听节目精品创作传播工程',
    source: '国家广播电视总局办公厅',
    url: 'http://www.nrta.gov.cn/art/2026/5/26/art_113_73368.html?xxgkhide=1',
    date: '2026-05-26',
    category: '精品创作',
    keywords: ['网络视听', '精品创作', '主流价值', '人民中心', '中国式现代化', '乡村振兴', '生态文明', '中华优秀传统文化', '讲好中国故事', '艺术技术'],
    summary: '网络视听作品应坚持正确政治方向、舆论导向、价值取向，坚持以人民为中心的创作导向，做到思想精深、艺术精湛、制作精良相统一。',
    positiveDirections: ['弘扬主流价值', '以人民为中心', '中华优秀传统文化', '革命文化', '社会主义先进文化', '中国式现代化', '乡村振兴', '生态文明建设', '普通人奋斗故事', '美好生活', '讲好中国故事', '艺术+技术创新'],
    requiredStandards: ['坚持正确政治方向', '坚持正确舆论导向', '坚持正确价值取向', '思想精深', '艺术精湛', '制作精良', '服务党和国家工作大局', '真实反映人民奋斗逐梦图景'],
    forbiddenPatterns: ['消解主流价值', '宣扬错误价值观', '脱离人民生活', '低质粗糙内容', '历史虚无主义'],
    qualityWarnings: ['避免空泛口号', '避免主题悬浮', '避免只讲概念不讲人物', '避免重形式轻思想'],
  },
  {
    id: 'nrta-2026-short-drama-governance',
    title: '2026年微短剧有害低俗内容和侵权盗版专项治理',
    source: '人民网－人民日报 / 国家广播电视总局',
    url: 'http://society.people.com.cn/n1/2026/0604/c1008-40733548.html',
    date: '2026-06-04',
    category: '专项治理',
    keywords: ['微短剧', '专项治理', '有害低俗', '侵权盗版', '儿童有害', '软色情', '拜金炫富', '畸形婚恋', '封建糟粕', '暴力复仇', '低俗片名'],
    summary: '微短剧创作传播需集中防范涉儿童有害、软色情擦边、拜金炫富、畸形婚恋观、封建糟粕、暴力复仇、低俗片名、侵权盗版等重点问题。',
    positiveDirections: ['清朗健康内容生态', '规范创作传播行为', '提升微短剧创作质量', '健康婚恋观', '尊重原创版权'],
    requiredStandards: ['平台可发布', '内容健康', '版权清晰', '标题正当', '价值观健康'],
    forbiddenPatterns: ['涉儿童有害', '软色情', '擦边', '拜金炫富', '畸形婚恋', '封建糟粕', '暴力复仇', '低俗片名', '侵权盗版'],
    qualityWarnings: ['避免用刺激性标题引流', '避免以复仇爽感作为核心价值', '避免将金钱和阶层作为唯一成功标准', '避免低俗反转'],
  },
  {
    id: 'nrta-2026-long-march-short-drama',
    title: '“长征：我们的故事”主题微短剧创作推进要求',
    source: '国家广播电视总局网络视听节目管理司、内容中心',
    url: 'http://www.nrta.gov.cn/art/2026/6/12/art_114_73455.html',
    date: '2026-06-12',
    category: '主题创作',
    keywords: ['长征', '主题微短剧', '主旋律', '历史观', '英雄人物', '小人物', '小切口', '宏大主题', '时代表达'],
    summary: '主题微短剧应提高政治站位，坚守正确历史观，抵制历史虚无主义，严禁戏说、恶搞、歪曲历史与英雄人物，以小人物、小切口展现宏大主题。',
    positiveDirections: ['正确历史观', '长征精神', '中国式现代化实践', '小人物小切口', '宏大主题', '历史真实与艺术真实结合', '时代表达'],
    requiredStandards: ['提高政治站位', '把牢题材创作方向', '注重精神内涵', '注重人物塑造', '注重细节呈现', '发挥微短剧优势'],
    forbiddenPatterns: ['历史虚无主义', '戏说历史', '恶搞英雄人物', '歪曲历史', '歪曲英雄人物'],
    qualityWarnings: ['避免概念化表达', '避免浅表化表达', '避免口号式表达', '避免说教式表达', '避免简单情景再现', '避免脸谱化人物'],
  },
  {
    id: 'college-ideological-short-drama-2026',
    title: '高校微短剧创作与思政教育融合标准',
    source: '高校内容创作产品内置标准',
    url: 'local://college-main-theme-short-drama-standard',
    date: '2026-06-13',
    category: '高校思政',
    keywords: ['高校', '大学生', '思政教育', '青年', '课程实践', '网络微短剧', '价值引领', '青年表达'],
    summary: '高校场景下的微短剧创作应兼顾青年表达、课程实践、价值引领和网络传播，避免把主旋律表达做成说教和口号。',
    positiveDirections: ['青年奋斗', '课程实践', '价值引领', '文化自信', '劳动精神', '奉献精神', '创新精神', '团队协作', '社会责任', '青春担当'],
    requiredStandards: ['适合高校传播', '适合课堂讨论', '适合学生创作', '价值表达自然融入剧情', '青年视角表达时代精神'],
    forbiddenPatterns: ['校园霸凌娱乐化', '恶搞思政内容', '低俗校园恋爱', '拜金成功学', '极端逆袭叙事'],
    qualityWarnings: ['避免居高临下说教', '避免口号堆砌', '避免把学生脸谱化', '避免脱离真实校园生活', '避免价值表达和剧情割裂'],
  },
]

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)))
}

function scoreItem(input: string, item: PolicyKnowledgeItem): number {
  const text = input.toLowerCase()
  return item.keywords.reduce((score, keyword) => {
    return text.includes(keyword.toLowerCase()) ? score + 2 : score
  }, 0) + item.positiveDirections.reduce((score, keyword) => {
    return text.includes(keyword.toLowerCase()) ? score + 1 : score
  }, 0) + item.forbiddenPatterns.reduce((score, keyword) => {
    return text.includes(keyword.toLowerCase()) ? score + 3 : score
  }, 0)
}

export function retrievePolicyKnowledge(input: string, limit = 4): PolicyRetrievalResult {
  const scored = POLICY_KNOWLEDGE_BASE
    .map((item) => ({ item, score: scoreItem(input, item) }))
    .sort((a, b) => b.score - a.score)

  const relevant = scored.some((entry) => entry.score > 0)
    ? scored.filter((entry) => entry.score > 0).slice(0, limit).map((entry) => entry.item)
    : POLICY_KNOWLEDGE_BASE.slice(0, limit)

  const matchedKeywords = unique(relevant.flatMap((item) => item.keywords).filter((keyword) => input.includes(keyword)))
  const positiveDirections = unique(relevant.flatMap((item) => item.positiveDirections))
  const requiredStandards = unique(relevant.flatMap((item) => item.requiredStandards))
  const forbiddenPatterns = unique(relevant.flatMap((item) => item.forbiddenPatterns))
  const qualityWarnings = unique(relevant.flatMap((item) => item.qualityWarnings))

  const promptContext = [
    '【2026网络视听政策RAG约束】',
    ...relevant.map((item, index) => [
      `${index + 1}. ${item.title}（${item.source}，${item.date}）`,
      `   摘要：${item.summary}`,
      `   正向方向：${item.positiveDirections.join('、')}`,
      `   硬性禁区：${item.forbiddenPatterns.join('、')}`,
      `   质量提醒：${item.qualityWarnings.join('、')}`,
    ].join('\n')),
  ].join('\n')

  return {
    items: relevant,
    matchedKeywords,
    positiveDirections,
    requiredStandards,
    forbiddenPatterns,
    qualityWarnings,
    promptContext,
  }
}

export function evaluatePolicyCompliance(content: string): PolicyComplianceResult {
  const retrieval = retrievePolicyKnowledge(content)
  const issues: string[] = []
  const suggestions: string[] = []
  const positiveMatches: string[] = []

  for (const pattern of retrieval.forbiddenPatterns) {
    if (content.includes(pattern)) {
      issues.push(`触及政策风险：${pattern}`)
      suggestions.push(`删除或改写“${pattern}”相关表达，改为正向、健康、可发布的叙事方式`)
    }
  }

  for (const direction of retrieval.positiveDirections) {
    if (content.includes(direction)) {
      positiveMatches.push(direction)
    }
  }

  const qualityHits = retrieval.qualityWarnings.filter((warning) => content.includes(warning.replace(/^避免/, '')))
  for (const warning of qualityHits) {
    issues.push(`质量风险：${warning}`)
    suggestions.push(`优化表达，${warning}，改用人物行动和具体情节承载主题`)
  }

  if (positiveMatches.length < 2) {
    suggestions.push('建议补充主流价值、青年奋斗、人民视角、文化自信或时代精神等正向表达')
  }

  const riskPenalty = Math.min(issues.length * 0.18, 0.72)
  const positiveBonus = Math.min(positiveMatches.length * 0.06, 0.24)
  const score = Math.max(0, Math.min(1, 0.76 + positiveBonus - riskPenalty))
  const riskLevel = issues.some((issue) => issue.includes('政策风险'))
    ? 'high'
    : score < 0.65
    ? 'medium'
    : suggestions.length > 0
    ? 'low'
    : 'none'

  return {
    score,
    riskLevel,
    matchedPolicies: retrieval.items.map((item) => item.title),
    issues,
    suggestions: unique(suggestions),
    positiveMatches: unique(positiveMatches),
  }
}
