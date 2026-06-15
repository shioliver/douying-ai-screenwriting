/**
 * 结构化输出 Schema 验证器
 * 对 Agent 输出的 JSON 进行严格校验和自动修复
 */

import type { AgentStructuredOutput } from './structured-output'

export interface SchemaValidationError {
  field: string
  message: string
  severity: 'error' | 'warning'
  fix?: string
}

export interface SchemaValidationResult {
  valid: boolean
  errors: SchemaValidationError[]
  warnings: SchemaValidationError[]
  fixedOutput: AgentStructuredOutput | null
}

const REQUIRED_FIELDS = ['title', 'logline', 'theme', 'characters', 'episodes', 'policyCompliance']
const OPTIONAL_FIELDS = ['scenes', 'storyboard']

/**
 * 验证结构化输出
 */
export function validateStructuredOutput(output: AgentStructuredOutput): SchemaValidationResult {
  const errors: SchemaValidationError[] = []
  const warnings: SchemaValidationError[] = []

  // 检查必需字段
  for (const field of REQUIRED_FIELDS) {
    const value = (output as any)[field]
    if (value === undefined || value === null) {
      errors.push({
        field,
        message: `必需字段 "${field}" 缺失`,
        severity: 'error',
        fix: `补充 ${field} 字段`,
      })
    }
  }

  // 检查 title
  if (output.title && output.title.length < 2) {
    warnings.push({
      field: 'title',
      message: '标题过短',
      severity: 'warning',
      fix: '建议标题不少于 2 个字符',
    })
  }

  // 检查 logline
  if (output.logline && output.logline.length < 10) {
    warnings.push({
      field: 'logline',
      message: '一句话梗概过短',
      severity: 'warning',
      fix: '建议梗概不少于 10 个字符',
    })
  }

  // 检查 characters
  if (output.characters) {
    if (output.characters.length === 0) {
      warnings.push({
        field: 'characters',
        message: '未提取到人物',
        severity: 'warning',
        fix: '至少应包含 1 个人物',
      })
    }
    for (let i = 0; i < output.characters.length; i++) {
      const char = output.characters[i]
      if (!char.name) {
        errors.push({
          field: `characters[${i}].name`,
          message: `第 ${i + 1} 个人物缺少名称`,
          severity: 'error',
        })
      }
      if (!char.description) {
        warnings.push({
          field: `characters[${i}].description`,
          message: `人物"${char.name || i}"缺少描述`,
          severity: 'warning',
          fix: '补充人物描述',
        })
      }
    }
  }

  // 检查 episodes
  if (output.episodes) {
    if (output.episodes.length === 0) {
      warnings.push({
        field: 'episodes',
        message: '未生成分集',
        severity: 'warning',
        fix: '至少应包含 1 集',
      })
    }
    for (let i = 0; i < output.episodes.length; i++) {
      const ep = output.episodes[i]
      if (!ep.hook) {
        warnings.push({
          field: `episodes[${i}].hook`,
          message: `第 ${ep.episodeNumber || i + 1} 集缺少开场钩子`,
          severity: 'warning',
          fix: '每集应有明确的开场钩子',
        })
      }
      if (!ep.positiveValue) {
        warnings.push({
          field: `episodes[${i}].positiveValue`,
          message: `第 ${ep.episodeNumber || i + 1} 集缺少正向价值`,
          severity: 'warning',
          fix: '每集应体现正向价值',
        })
      }
    }
  }

  // 检查 policyCompliance
  if (output.policyCompliance) {
    if (!output.policyCompliance.score && output.policyCompliance.score !== 0) {
      warnings.push({
        field: 'policyCompliance.score',
        message: '缺少政策合规评分',
        severity: 'warning',
        fix: '补充合规评分（0-100）',
      })
    }
    if (!output.policyCompliance.riskLevel) {
      warnings.push({
        field: 'policyCompliance.riskLevel',
        message: '缺少风险等级',
        severity: 'warning',
        fix: '补充风险等级：none/low/medium/high',
      })
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    fixedOutput: errors.length === 0 ? output : null,
  }
}

/**
 * 尝试自动修复结构化输出
 */
export function tryFixStructuredOutput(output: AgentStructuredOutput): AgentStructuredOutput {
  const fixed = { ...output }

  // 修复缺失的必需字段
  if (!fixed.title) fixed.title = '未命名作品'
  if (!fixed.logline) fixed.logline = '暂无梗概'
  if (!fixed.theme) fixed.theme = '未标注主题'
  if (!fixed.characters) fixed.characters = []
  if (!fixed.episodes) fixed.episodes = []
  if (!fixed.scenes) fixed.scenes = []
  if (!fixed.storyboard) fixed.storyboard = []

  // 修复 policyCompliance
  if (!fixed.policyCompliance) {
    fixed.policyCompliance = {
      score: 0,
      riskLevel: 'none',
      positiveDirections: [],
      risksAvoided: [],
      explanation: '未进行政策合规检测',
    }
  }
  if (!fixed.policyCompliance.score && fixed.policyCompliance.score !== 0) fixed.policyCompliance.score = 0
  if (!fixed.policyCompliance.riskLevel) fixed.policyCompliance.riskLevel = 'none'
  if (!fixed.policyCompliance.positiveDirections) fixed.policyCompliance.positiveDirections = []
  if (!fixed.policyCompliance.risksAvoided) fixed.policyCompliance.risksAvoided = []
  if (!fixed.policyCompliance.explanation) fixed.policyCompliance.explanation = ''

  // 修复 characters
  fixed.characters = fixed.characters.map((c, i) => ({
    ...c,
    name: c.name || `人物${i + 1}`,
    role: c.role || '其他',
    description: c.description || '',
  }))

  // 修复 episodes
  fixed.episodes = fixed.episodes.map((ep, i) => ({
    ...ep,
    episodeNumber: ep.episodeNumber || i + 1,
    title: ep.title || `第${i + 1}集`,
    hook: ep.hook || '',
    conflict: ep.conflict || '',
    turningPoint: ep.turningPoint || '',
    positiveValue: ep.positiveValue || '',
    summary: ep.summary || '',
  }))

  return fixed
}

/**
 * 带重试的结构化输出提取
 * 如果首次提取失败，尝试自动修复
 */
export function extractWithRetry(
  content: string,
  extractFn: (content: string) => AgentStructuredOutput | null,
  maxRetries = 2
): AgentStructuredOutput | null {
  let output = extractFn(content)

  if (!output) return null

  // 验证
  const validation = validateStructuredOutput(output)

  if (validation.valid) return output

  // 尝试自动修复
  if (validation.errors.length > 0 && validation.errors.length <= 3) {
    const fixed = tryFixStructuredOutput(output)
    const reValidation = validateStructuredOutput(fixed)
    if (reValidation.valid) return fixed
  }

  // 如果修复后仍有错误，返回修复版本（带警告）
  if (maxRetries > 0) {
    return tryFixStructuredOutput(output)
  }

  return output
}
