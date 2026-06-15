export interface StructuredCharacter {
  name: string
  role: string
  description: string
  arc?: string
}

export interface StructuredEpisode {
  episodeNumber: number
  title: string
  hook: string
  conflict: string
  turningPoint: string
  positiveValue: string
  summary?: string
}

export interface StructuredScene {
  episodeNumber?: number
  title: string
  location: string
  time: string
  description: string
}

export interface StructuredStoryboardShot {
  sceneTitle: string
  shotType: string
  camera: string
  description: string
  duration?: string
}

export interface StructuredPolicyCompliance {
  score: number
  riskLevel: 'high' | 'medium' | 'low' | 'none'
  positiveDirections: string[]
  risksAvoided: string[]
  explanation: string
}

export interface AgentStructuredOutput {
  title: string
  logline: string
  theme: string
  characters: StructuredCharacter[]
  episodes: StructuredEpisode[]
  scenes: StructuredScene[]
  storyboard: StructuredStoryboardShot[]
  policyCompliance: StructuredPolicyCompliance
}

export const AGENT_STRUCTURED_JSON_PROTOCOL = `
【结构化 JSON 生成协议】
你必须在正文最后追加一个机器可读 JSON 块，格式如下：

\`\`\`agent-json
{
  "title": "作品标题",
  "logline": "一句话故事梗概",
  "theme": "主题表达",
  "characters": [
    {
      "name": "人物名",
      "role": "主角/配角/其他",
      "description": "人物设定",
      "arc": "人物成长弧光"
    }
  ],
  "episodes": [
    {
      "episodeNumber": 1,
      "title": "集标题",
      "hook": "开场钩子",
      "conflict": "核心冲突",
      "turningPoint": "反转/转折",
      "positiveValue": "正向价值",
      "summary": "本集梗概"
    }
  ],
  "scenes": [
    {
      "episodeNumber": 1,
      "title": "场景名",
      "location": "地点",
      "time": "时间",
      "description": "场景说明"
    }
  ],
  "storyboard": [
    {
      "sceneTitle": "所属场景",
      "shotType": "景别",
      "camera": "运镜",
      "description": "画面描述",
      "duration": "建议时长"
    }
  ],
  "policyCompliance": {
    "score": 90,
    "riskLevel": "low",
    "positiveDirections": ["青年奋斗", "文化自信"],
    "risksAvoided": ["避免低俗", "避免说教"],
    "explanation": "政策合规说明"
  }
}
\`\`\`

要求：
1. JSON 必须合法，不要写注释，不要尾随逗号。
2. JSON 字段必须完整，即使内容较少也要给空数组或空字符串。
3. JSON 用于系统写入人物、场景、分镜和合规报告，不要省略。
4. 正文给用户阅读，agent-json 给系统执行。
`

export function extractStructuredOutput(content: string): AgentStructuredOutput | null {
  const fenced = content.match(/```agent-json\s*([\s\S]*?)```/)
  const raw = fenced?.[1] || tryFindJsonObject(content)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    return normalizeStructuredOutput(parsed)
  } catch {
    return null
  }
}

export function stripStructuredOutput(content: string): string {
  return content.replace(/```agent-json\s*[\s\S]*?```/g, '').trim()
}

function tryFindJsonObject(content: string): string | null {
  const start = content.indexOf('{')
  const end = content.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null
  return content.slice(start, end + 1)
}

function normalizeStructuredOutput(input: any): AgentStructuredOutput {
  return {
    title: String(input?.title || ''),
    logline: String(input?.logline || ''),
    theme: String(input?.theme || ''),
    characters: Array.isArray(input?.characters) ? input.characters.map((item: any) => ({
      name: String(item?.name || ''),
      role: String(item?.role || '其他'),
      description: String(item?.description || ''),
      arc: item?.arc ? String(item.arc) : '',
    })).filter((item: StructuredCharacter) => item.name) : [],
    episodes: Array.isArray(input?.episodes) ? input.episodes.map((item: any, index: number) => ({
      episodeNumber: Number(item?.episodeNumber || index + 1),
      title: String(item?.title || `第${index + 1}集`),
      hook: String(item?.hook || ''),
      conflict: String(item?.conflict || ''),
      turningPoint: String(item?.turningPoint || ''),
      positiveValue: String(item?.positiveValue || ''),
      summary: String(item?.summary || ''),
    })) : [],
    scenes: Array.isArray(input?.scenes) ? input.scenes.map((item: any) => ({
      episodeNumber: item?.episodeNumber ? Number(item.episodeNumber) : undefined,
      title: String(item?.title || ''),
      location: String(item?.location || ''),
      time: String(item?.time || ''),
      description: String(item?.description || ''),
    })).filter((item: StructuredScene) => item.title || item.location) : [],
    storyboard: Array.isArray(input?.storyboard) ? input.storyboard.map((item: any) => ({
      sceneTitle: String(item?.sceneTitle || ''),
      shotType: String(item?.shotType || ''),
      camera: String(item?.camera || ''),
      description: String(item?.description || ''),
      duration: String(item?.duration || ''),
    })).filter((item: StructuredStoryboardShot) => item.description) : [],
    policyCompliance: {
      score: Number(input?.policyCompliance?.score || 0),
      riskLevel: input?.policyCompliance?.riskLevel || 'none',
      positiveDirections: Array.isArray(input?.policyCompliance?.positiveDirections) ? input.policyCompliance.positiveDirections.map(String) : [],
      risksAvoided: Array.isArray(input?.policyCompliance?.risksAvoided) ? input.policyCompliance.risksAvoided.map(String) : [],
      explanation: String(input?.policyCompliance?.explanation || ''),
    },
  }
}
