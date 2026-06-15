import { checkCompliance } from '../agent-system'
import type { AgentStructuredOutput } from './structured-output'

export interface AgentCharacterArtifact {
  id: string
  name: string
  description: string
  role: '主角' | '配角' | '其他'
}

export interface AgentSceneArtifact {
  id: string
  title: string
  location: string
  time: string
  description: string
}

export interface AgentShotArtifact {
  id: string
  sceneTitle: string
  shotType: string
  camera: string
  description: string
}

export interface AgentLocationArtifact {
  id: string
  name: string
  description: string
}

export interface AgentToolResult {
  characters: AgentCharacterArtifact[]
  scenes: AgentSceneArtifact[]
  locations: AgentLocationArtifact[]
  shots: AgentShotArtifact[]
  executionSummary: string
  complianceSummary: string
}

function uniqueBy<T>(items: T[], keyGetter: (item: T) => string): T[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = keyGetter(item).trim()
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function makeId(prefix: string, index: number): string {
  return `${prefix}-${Date.now()}-${index}`
}

function buildArtifactsFromStructuredOutput(structured: AgentStructuredOutput, content: string): AgentToolResult {
  const compliance = checkCompliance(content)
  const characters: AgentCharacterArtifact[] = structured.characters.map((item, index) => {
    const role: AgentCharacterArtifact['role'] = item.role === '主角' || item.role === '配角' ? item.role : '其他'
    return {
      id: makeId('character-json', index),
      name: item.name,
      description: [item.description, item.arc].filter(Boolean).join('；'),
      role,
    }
  })
  const scenes = structured.scenes.map((item, index) => ({
    id: makeId('scene-json', index),
    title: item.title,
    location: item.location,
    time: item.time,
    description: item.description,
  }))
  const locations = uniqueBy(scenes.map((scene, index) => ({
    id: makeId('location-json', index),
    name: scene.location,
    description: `来自结构化场景「${scene.title}」`,
  })), (item) => item.name)
  const shots = structured.storyboard.map((item, index) => ({
    id: makeId('shot-json', index),
    sceneTitle: item.sceneTitle,
    shotType: item.shotType,
    camera: item.camera,
    description: item.description,
  }))
  const complianceSummary = [
    `结构化协议评分：${structured.policyCompliance.score || Math.round(compliance.score * 100)}`,
    `风险等级：${structured.policyCompliance.riskLevel || compliance.severity}`,
    structured.policyCompliance.positiveDirections?.length ? `正向方向：${structured.policyCompliance.positiveDirections.join('、')}` : '',
    structured.policyCompliance.risksAvoided?.length ? `已规避风险：${structured.policyCompliance.risksAvoided.join('、')}` : '',
    structured.policyCompliance.explanation || '',
  ].filter(Boolean).join('\n')

  return {
    characters,
    scenes,
    locations,
    shots,
    executionSummary: `Agent 已通过结构化 JSON 协议写入 ${characters.length} 个人物、${scenes.length} 个场景、${locations.length} 个地点、${shots.length} 条分镜。`,
    complianceSummary,
  }
}

export function extractAgentArtifacts(outline: string, script: string, structured?: AgentStructuredOutput | null): AgentToolResult {
  if (structured) {
    return buildArtifactsFromStructuredOutput(structured, `${outline}\n\n${script}`)
  }

  const content = `${outline}\n\n${script}`
  const lines = content.split(/\n+/).map((line) => line.trim()).filter(Boolean)

  const characters = uniqueBy([
    ...extractCharacters(lines),
    ...extractDialogueCharacters(lines),
  ], (item) => item.name).slice(0, 12)

  const scenes = extractScenes(lines).slice(0, 30)
  const locations = uniqueBy(scenes.map((scene, index) => ({
    id: makeId('location', index),
    name: scene.location,
    description: `来自场景「${scene.title}」`,
  })), (item) => item.name).slice(0, 20)

  const shots = extractShots(lines, scenes).slice(0, 60)
  const compliance = checkCompliance(content)
  const complianceSummary = [
    `政策合规评分：${Math.round(compliance.score * 100)}`,
    `风险等级：${compliance.severity}`,
    compliance.matchedPolicies?.length ? `依据：${compliance.matchedPolicies.join('；')}` : '',
    compliance.issues.length ? `问题：${compliance.issues.join('；')}` : '未发现高风险问题',
    compliance.suggestions.length ? `建议：${compliance.suggestions.join('；')}` : '',
  ].filter(Boolean).join('\n')

  return {
    characters,
    scenes,
    locations,
    shots,
    executionSummary: `Agent 已提取 ${characters.length} 个人物、${scenes.length} 个场景、${locations.length} 个地点、${shots.length} 条分镜线索，并完成政策合规自检。`,
    complianceSummary,
  }
}

function extractCharacters(lines: string[]): AgentCharacterArtifact[] {
  const result: AgentCharacterArtifact[] = []
  const characterSectionIndex = lines.findIndex((line) => /人物|角色/.test(line) && /^#{1,4}|^[-*]/.test(line))
  const source = characterSectionIndex >= 0 ? lines.slice(characterSectionIndex, characterSectionIndex + 18) : lines

  source.forEach((line, index) => {
    const match = line.match(/(?:[-*]\s*)?(?:\*\*)?([^：:（）()\-—]{2,12})(?:\*\*)?[：:（）()\-—]\s*(.+)/)
    if (!match) return
    const name = match[1].replace(/主角|配角|人物|角色|姓名/g, '').trim()
    if (!name || /场景|地点|时间|主题|大纲|剧本|旁白/.test(name)) return
    result.push({
      id: makeId('character', index),
      name,
      description: match[2].slice(0, 120),
      role: index === 0 ? '主角' : '配角',
    })
  })

  return result
}

function extractDialogueCharacters(lines: string[]): AgentCharacterArtifact[] {
  const names = new Set<string>()
  for (const line of lines) {
    const match = line.match(/^\*\*([^*]{2,12})\*\*（?.*?）?[：:]/) || line.match(/^([^：:]{2,12})[：:]/)
    if (!match) continue
    const name = match[1].trim()
    if (/旁白|场景|镜头|地点|时间|标题|第\d+集/.test(name)) continue
    names.add(name)
  }
  return Array.from(names).map((name, index) => ({
    id: makeId('character-dialogue', index),
    name,
    description: '从对白中自动识别的人物',
    role: index === 0 ? '主角' : '配角',
  }))
}

function extractScenes(lines: string[]): AgentSceneArtifact[] {
  const scenes: AgentSceneArtifact[] = []
  lines.forEach((line, index) => {
    const match = line.match(/^(?:#{1,4}\s*)?场景\s*\d*\s*[|｜:：-]?\s*([^|｜：:]+)?(?:[|｜]\s*([^|｜]+))?(?:[|｜]\s*([^|｜]+))?/) || line.match(/^(?:INT|EXT|内景|外景)[.\s：:-]+(.+)/i)
    if (!match) return
    const title = line.replace(/^#{1,4}\s*/, '').slice(0, 60)
    const location = (match[2] || match[1] || '未标注地点').trim()
    const time = (match[3] || '未标注时间').trim()
    scenes.push({
      id: makeId('scene', index),
      title,
      location,
      time,
      description: lines[index + 1]?.replace(/^>\s*/, '').slice(0, 160) || '',
    })
  })
  return scenes
}

function extractShots(lines: string[], scenes: AgentSceneArtifact[]): AgentShotArtifact[] {
  const shotWords = /(特写|近景|中景|全景|远景|推入|拉出|摇镜|移镜|跟拍|俯拍|仰拍|航拍|蒙太奇|慢动作|主观镜头|过肩镜头)/
  const shots: AgentShotArtifact[] = []
  lines.forEach((line, index) => {
    if (!shotWords.test(line) && !/镜头|分镜|景别|运镜/.test(line)) return
    const shotType = line.match(shotWords)?.[1] || '镜头'
    shots.push({
      id: makeId('shot', index),
      sceneTitle: scenes.find((scene) => index >= lines.findIndex((l) => l.includes(scene.title.slice(0, 12))))?.title || '未归属场景',
      shotType,
      camera: line.match(/【([^】]+)】/)?.[1] || shotType,
      description: line.replace(/^[-*>\s]+/, '').slice(0, 180),
    })
  })
  return shots
}
