/**
 * Agent 自我反思模块
 * 迭代式修正 + 策略选择 + 多轮检测
 * 实现真正 Agent 的自我修正闭环
 */

import type { ComplianceResult } from '../agent-system'
import { evaluatePolicyCompliance } from './policy-knowledge-base'

export type FixStrategy = 'replace' | 'rewrite' | 'reframe' | 'expand' | 'remove'

export interface FixAction {
  strategy: FixStrategy
  target: string
  replacement: string
  reason: string
  policyBasis: string
}

export interface SelfReflectionResult {
  needsFix: boolean
  actions: FixAction[]
  confidence: number
  riskLevel: 'high' | 'medium' | 'low' | 'none'
  score: number
  summary: string
}

export interface IterativeFixResult {
  content: string
  iterations: number
  finalScore: number
  finalRiskLevel: string
  allChecks: ComplianceResult[]
  success: boolean
  summary: string
}

/**
 * 分析合规问题并生成修正策略
 */
export function analyzeIssuesAndPlanFixes(
  content: string,
  check: ComplianceResult
): SelfReflectionResult {
  if (check.passed && check.severity === 'none') {
    return {
      needsFix: false,
      actions: [],
      confidence: 0.95,
      riskLevel: 'none',
      score: check.score,
      summary: '内容已通过合规检测，无需修正',
    }
  }

  const actions: FixAction[] = []
  const policyCheck = evaluatePolicyCompliance(content)

  // 策略 1：替换违规关键词
  for (const issue of check.issues) {
    if (issue.includes('违规关键词')) {
      const forbiddenPatterns = ['流浪', '乞讨', '卖惨', '杀人', '自杀', '色情', '贩毒', '躺平', '啃老', '摆烂']
      for (const pattern of forbiddenPatterns) {
        if (content.includes(pattern)) {
          const replacements: Record<string, string> = {
            '流浪': '在外打拼',
            '乞讨': '寻求帮助',
            '卖惨': '展现困难',
            '杀人': '冲突',
            '自杀': '极端想法',
            '色情': '感情',
            '贩毒': '违法',
            '躺平': '暂时迷茫',
            '啃老': '依赖家庭',
            '摆烂': '遇到挫折',
          }
          actions.push({
            strategy: 'replace',
            target: pattern,
            replacement: replacements[pattern] || '正向表达',
            reason: `替换"${pattern}"为正向表达`,
            policyBasis: '2026年微短剧专项治理要求',
          })
        }
      }
    }
  }

  // 策略 2：补充正向价值
  if (check.suggestions.some(s => s.includes('积极向上') || s.includes('正能量') || s.includes('主流价值'))) {
    const positiveAdditions = [
      '通过人物行动展现奋斗精神',
      '在冲突中体现真善美',
      '用具体情节传递温暖与希望',
      '展现普通人的时代担当',
    ]
    actions.push({
      strategy: 'expand',
      target: '正向价值表达',
      replacement: positiveAdditions.join('；'),
      reason: '补充主流价值、青年奋斗、人民视角表达',
      policyBasis: '2026年网络视听精品创作传播工程',
    })
  }

  // 策略 3：改写说教/口号化表达
  if (policyCheck.issues.some(i => i.includes('质量风险'))) {
    actions.push({
      strategy: 'rewrite',
      target: '说教式/口号式表达',
      replacement: '用人物行动和具体情节承载主题',
      reason: '避免概念化、浅表化、口号式表达',
      policyBasis: '长征主题微短剧创作推进要求',
    })
  }

  // 策略 4：移除高风险内容
  if (check.severity === 'high') {
    actions.push({
      strategy: 'remove',
      target: '高风险内容段落',
      replacement: '删除或彻底重写相关段落',
      reason: '内容触及政策红线，必须移除',
      policyBasis: '网络视听内容审核标准',
    })
  }

  // 策略 5：重构叙事框架
  if (actions.length >= 3) {
    actions.push({
      strategy: 'reframe',
      target: '整体叙事框架',
      replacement: '从正向角度重构故事立意和人物动机',
      reason: '问题较多，建议从根源重构',
      policyBasis: '高校微短剧创作与思政教育融合标准',
    })
  }

  const riskLevel = check.severity === 'high' ? 'high'
    : check.severity === 'medium' ? 'medium'
    : check.severity === 'low' ? 'low' : 'none'

  return {
    needsFix: actions.length > 0,
    actions,
    confidence: 0.8,
    riskLevel,
    score: check.score,
    summary: actions.length > 0
      ? `发现 ${actions.length} 个需要修正的问题，已制定 ${actions.length} 条修正策略`
      : '内容基本合规，仅需微调',
  }
}

/**
 * 构建迭代修正 Prompt
 */
export function buildIterativeFixPrompt(
  contentType: 'outline' | 'script',
  content: string,
  reflection: SelfReflectionResult,
  iteration: number,
  maxIterations: number
): string {
  const strategyDescriptions: Record<FixStrategy, string> = {
    replace: '直接替换违规词汇为正向表达',
    rewrite: '重写相关段落，保留核心创意但改变表达方式',
    reframe: '从根源重构叙事框架和人物动机',
    expand: '在现有内容基础上补充正向价值表达',
    remove: '删除高风险内容段落',
  }

  const actionsText = reflection.actions
    .map((a, i) => `${i + 1}. 【${a.strategy === 'replace' ? '替换' : a.strategy === 'rewrite' ? '重写' : a.strategy === 'reframe' ? '重构' : a.strategy === 'expand' ? '补充' : '移除'}】${a.target} → ${a.replacement}\n   原因：${a.reason}\n   依据：${a.policyBasis}`)
    .join('\n')

  return `你是高校主旋律网络视听内容合规修正智能体（第 ${iteration}/${maxIterations} 轮修正）。

【修正策略】
${actionsText}

【修正要求】
1. 按上述策略逐条执行修正
2. 保留原有故事核心、人物关系和主要结构
3. 用具体情节和人物行动承载主旋律价值，避免口号式说教
4. 如果原文包含 \`\`\`agent-json\`\`\` 结构化块，必须同步修正该 JSON
5. 输出完整改写后的正文

【待修正内容】
${content}`
}

/**
 * 迭代式自我修正
 * 最多执行 maxIterations 轮，直到合规或达到上限
 */
export async function iterativeSelfFix(
  contentType: 'outline' | 'script',
  initialContent: string,
  systemPrompt: string,
  headers: Record<string, string>,
  checkCompliance: (content: string) => ComplianceResult,
  callLLM: (system: string, messages: { role: string; content: string }[], headers: Record<string, string>) => Promise<string | null>,
  maxIterations = 3
): Promise<IterativeFixResult> {
  const allChecks: ComplianceResult[] = []
  let currentContent = initialContent
  let currentCheck = checkCompliance(currentContent)
  allChecks.push(currentCheck)

  if (currentCheck.passed) {
    return {
      content: currentContent,
      iterations: 0,
      finalScore: currentCheck.score,
      finalRiskLevel: currentCheck.severity,
      allChecks,
      success: true,
      summary: '首次检测即通过，无需修正',
    }
  }

  for (let i = 1; i <= maxIterations; i++) {
    const reflection = analyzeIssuesAndPlanFixes(currentContent, currentCheck)

    if (!reflection.needsFix) {
      return {
        content: currentContent,
        iterations: i - 1,
        finalScore: currentCheck.score,
        finalRiskLevel: currentCheck.severity,
        allChecks,
        success: true,
        summary: `第 ${i - 1} 轮修正后通过检测`,
      }
    }

    const fixPrompt = buildIterativeFixPrompt(contentType, currentContent, reflection, i, maxIterations)

    const rewritten = await callLLM(systemPrompt, [{ role: 'user', content: fixPrompt }], headers)
    if (!rewritten) {
      return {
        content: currentContent,
        iterations: i,
        finalScore: currentCheck.score,
        finalRiskLevel: currentCheck.severity,
        allChecks,
        success: false,
        summary: `第 ${i} 轮修正时 LLM 调用失败`,
      }
    }

    currentContent = rewritten
    currentCheck = checkCompliance(currentContent)
    allChecks.push(currentCheck)

    if (currentCheck.passed) {
      return {
        content: currentContent,
        iterations: i,
        finalScore: currentCheck.score,
        finalRiskLevel: currentCheck.severity,
        allChecks,
        success: true,
        summary: `第 ${i} 轮修正后通过检测。评分：${(currentCheck.score * 100).toFixed(0)}，风险等级：${currentCheck.severity}`,
      }
    }
  }

  return {
    content: currentContent,
    iterations: maxIterations,
    finalScore: currentCheck.score,
    finalRiskLevel: currentCheck.severity,
    allChecks,
    success: currentCheck.passed,
    summary: `完成 ${maxIterations} 轮修正。最终评分：${(currentCheck.score * 100).toFixed(0)}，风险等级：${currentCheck.severity}${currentCheck.passed ? '，已通过' : '，仍未通过'}`,
  }
}
