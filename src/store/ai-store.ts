'use client'

import { create } from 'zustand'
import { useAISettingsStore } from './ai-settings-store'
import { useToastStore } from './toast-store'
import { useEditorStore } from './editor-store'
import type { ComplianceResult } from '@/lib/agent-system'

/** 对话消息 */
export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  type?: 'info' | 'user' | 'error' | 'question'
  questionKey?: string
  options?: { label: string; value: string }[]
  placeholder?: string
  customPlaceholder?: string
  whyAsk?: string
  allowCustom?: boolean
  fieldType?: 'choice' | 'multi-choice' | 'text' | 'textarea'
}

/** 对话选项（多轮选择用） */
export interface DialogueOption {
  label: string
  value: string
}

export interface DialogueQuestion {
  key: string
  question: string
  description?: string
  whyAsk?: string
  outputImpact?: string
  type: 'choice' | 'multi-choice' | 'text' | 'textarea'
  options?: DialogueOption[]
  placeholder?: string
  customPlaceholder?: string
  allowCustom?: boolean
}

interface DialogueStateLite {
  active: boolean
  agentType: 'short-drama' | 'short-drama-analysis' | 'outline' | 'general'
  currentIndex: number
  totalRounds: number
  maxRounds: number
  fields: DialogueQuestion[]
  collected: Record<string, string>
  initialRequest: string
}

type GenerationStep = 'idle' | 'outline' | 'script' | 'done'

interface AIState {
  messages: AIMessage[]
  isLoading: boolean
  currentTopic: string
  currentStep: GenerationStep
  // 流式状态：实时同步到编辑器
  streamingContent: string
  streamingType: 'outline' | 'script' | null
  // 已完成的内容
  outline: string
  script: string
  // 多轮对话状态
  dialogue: DialogueStateLite | null
  // 等待用户回答（多轮对话中）
  awaitingUserAnswer: boolean
  addMessage: (message: AIMessage) => void
  setMessages: (messages: AIMessage[]) => void
  setLoading: (loading: boolean) => void
  setTopic: (topic: string) => void
  clearMessages: () => void
  setStreamingContent: (content: string) => void
  setCurrentStep: (step: GenerationStep) => void
  setOutline: (outline: string) => void
  setScript: (script: string) => void
  setDialogue: (dialogue: DialogueStateLite | null) => void
  setAwaitingUserAnswer: (awaiting: boolean) => void
  /** 启动多轮对话 */
  startDialogue: (agentType: 'short-drama' | 'short-drama-analysis' | 'outline' | 'general', initialRequest: string) => void
  /** 回答当前问题（推进对话） */
  answerDialogue: (answer: string) => Promise<void>
  sendToAPIStream: (userMessage: string) => Promise<void>
}

/** 获取 AI 请求的 headers */
export function getAIHeaders(): Record<string, string> {
  const { config } = useAISettingsStore.getState()
  return {
    'Content-Type': 'application/json',
    'X-User-Api-Key': config.apiKey,
    'X-User-Base-Url': config.baseUrl,
    'X-User-Model': config.model,
    'X-User-Provider': config.provider,
  }
}

/** 处理 AI 错误 */
export function handleAIError(errMsg: string): string | null {
  if (errMsg.includes('API Key 未配置')) {
    useToastStore.getState().addToast({
      type: 'warning',
      message: errMsg,
      action: {
        label: '去设置',
        onClick: () => {
          window.dispatchEvent(new CustomEvent('open-ai-settings'))
        },
      },
    })
    return null
  }
  return errMsg
}

/** 大纲生成系统提示词 */
function outlineSystemPrompt(topic: string): string {
  return `你是一个专业的剧本创作助手。用户想要创作关于"${topic}"的内容。\n\n请根据用户输入生成一个结构化的故事大纲，包含：\n1. 故事背景设定\n2. 主要人物介绍\n3. 故事线（开端、发展、高潮、结局）\n4. 关键场景列表\n\n请直接输出大纲内容，不要使用 markdown 代码块包裹。`
}

/** 剧本生成系统提示词 */
function scriptSystemPrompt(topic: string, outline: string): string {
  return `你是一个专业的剧本创作助手。基于以下故事大纲，生成一个完整的剧本。\n\n创作主题：${topic}\n\n大纲：\n${outline}\n\n请使用标准剧本格式输出：\n- 场景标题（地点、时间）\n- 场景描述\n- 角色对话（角色名：对白内容）\n- 动作指示\n\n请直接输出剧本内容，不要使用 markdown 代码块包裹。`
}

export const useAIStore = create<AIState>((set, get) => ({
  messages: [],
  isLoading: false,
  currentTopic: '',
  currentStep: 'idle',
  streamingContent: '',
  streamingType: null,
  outline: '',
  script: '',
  dialogue: null,
  awaitingUserAnswer: false,

  addMessage: (message) => {
    set((state) => ({ messages: [...state.messages, message] }))
  },

  setMessages: (messages) => set({ messages }),
  setLoading: (loading) => set({ isLoading: loading }),
  setTopic: (topic) => set({ currentTopic: topic }),
  setStreamingContent: (content) => set({ streamingContent: content }),
  setCurrentStep: (step) => set({ currentStep: step }),
  setOutline: (outline) => set({ outline }),
  setScript: (script) => set({ script }),
  setDialogue: (dialogue) => set({ dialogue }),
  setAwaitingUserAnswer: (awaiting) => set({ awaitingUserAnswer: awaiting }),

  clearMessages: () => {
    set({
      messages: [],
      currentTopic: '',
      currentStep: 'idle',
      streamingContent: '',
      streamingType: null,
      outline: '',
      script: '',
      dialogue: null,
      awaitingUserAnswer: false,
    })
  },

  // ============ 多轮对话：启动 ============
  startDialogue: (agentType, initialRequest) => {
    void (async () => {
      const { createDialogue } = await import('@/lib/agent-system')
      const dialogue = createDialogue(agentType, initialRequest)
      const currentField = dialogue.fields[0]

      set({
        dialogue: {
          active: true,
          agentType,
          currentIndex: 0,
          totalRounds: 0,
          maxRounds: dialogue.maxRounds,
          fields: dialogue.fields,
          collected: {},
          initialRequest,
        },
        awaitingUserAnswer: true,
        currentTopic: initialRequest,
        currentStep: 'idle',
        outline: '',
        script: '',
      })

      const agentLabel = agentType === 'short-drama-analysis' ? '短剧分析 Agent' : agentType === 'outline' ? '大纲 Agent' : '短剧创作 Agent'

      // 智能开场：使用 planner 构建开场消息
      let openingMessage = `🤖 已启动 ${agentLabel}。我会根据你的回答动态组织输出，选项不够时可以直接自定义输入。`
      try {
        const { buildSmartOpening } = await import('@/lib/agents/agent-planner')
        const { extractKnownInfo } = await import('@/lib/agents/agent-planner')
        const extracted = extractKnownInfo(initialRequest, agentType)
        const knownFields = Object.entries(extracted)
          .filter(([, v]) => v)
          .map(([key, value]) => ({ key, value: value!, confidence: 0.85 }))
        const missingCount = dialogue.fields.length - knownFields.length
        if (knownFields.length > 0) {
          openingMessage = buildSmartOpening(knownFields, missingCount, agentType)
        }
      } catch {
        // fallback
      }

      // 显示引导消息（带问题+选项）
      set((state) => ({
        messages: [...state.messages, {
          role: 'assistant',
          content: `**第 1 / ${dialogue.maxRounds} 轮**\n${currentField.question}${currentField.description ? `\n_${currentField.description}_` : ''}`,
          type: 'question',
          questionKey: currentField.key,
          options: currentField.options,
          placeholder: currentField.placeholder,
          customPlaceholder: currentField.customPlaceholder,
          whyAsk: currentField.whyAsk,
          allowCustom: currentField.allowCustom,
          fieldType: currentField.type,
        }, {
          role: 'assistant',
          content: openingMessage,
          type: 'info',
        }],
      }))
    })()
  },

  // ============ 多轮对话：回答推进 ============
  answerDialogue: async (answer) => {
    const { dialogue, messages } = get()
    if (!dialogue || !dialogue.active) return

    const currentField = dialogue.fields[dialogue.currentIndex]
    if (!currentField) return

    // 记录用户回答到消息列表
    set((state) => ({
      messages: [...state.messages, {
        role: 'user',
        content: answer,
        type: 'user',
      }],
    }))

    // 推进对话
    const { advanceDialogue } = await import('@/lib/agent-system')
    const result = advanceDialogue(dialogue as any, answer)

    set({
      dialogue: result.state as any,
      awaitingUserAnswer: !result.done,
    })

    if (result.done) {
      // ============ 收集完成或达到 maxRounds → 自动执行 LLM ============
      const reasonText = result.reason === 'max_rounds'
        ? `已收集 ${result.state.rounds} 轮信息，达到最大轮次（${result.state.maxRounds}），开始创作。`
        : `信息收集完成，开始创作。`

      set((state) => ({
        messages: [...state.messages, {
          role: 'assistant',
          content: `✅ ${reasonText}`,
          type: 'info',
        }],
      }))

      // 把已收集信息编译成 prompt，调 LLM
      const { compileDialoguePrompt, checkCompliance, SHORT_DRAMA_SYSTEM_PROMPT, SHORT_DRAMA_ANALYSIS_SYSTEM_PROMPT, OUTLINE_SYSTEM_PROMPT } = await import('@/lib/agent-system')
      const { AGENT_STRUCTURED_JSON_PROTOCOL } = await import('@/lib/agents/structured-output')
      const { buildMemoryPromptContext, updateAgentMemoryFromInput } = await import('@/lib/agents/agent-memory')
      const memory = updateAgentMemoryFromInput(result.state.initialRequest)
      const finalPrompt = `${compileDialoguePrompt(result.state as any)}\n\n${buildMemoryPromptContext(memory)}\n\n${AGENT_STRUCTURED_JSON_PROTOCOL}`
      const systemPrompt = dialogue.agentType === 'short-drama-analysis'
        ? SHORT_DRAMA_ANALYSIS_SYSTEM_PROMPT
        : dialogue.agentType === 'outline'
        ? OUTLINE_SYSTEM_PROMPT
        : SHORT_DRAMA_SYSTEM_PROMPT

      // 进入正常的 LLM 流式生成流程
      set({
        isLoading: true,
        currentStep: 'outline',
        streamingContent: '',
        streamingType: null,
        dialogue: null,
        awaitingUserAnswer: false,
      })

      try {
        set((state) => ({
          messages: [...state.messages, {
            role: 'assistant',
            content: '正在创作大纲...',
            type: 'info',
          }],
        }))

        const outlineDraft = await callLLMStream(
          'outline',
          systemPrompt,
          [...messages.filter((m) => m.role !== 'system').map((m) => ({ role: m.role, content: m.content })), { role: 'user' as const, content: finalPrompt }],
          getAIHeaders(),
          systemPrompt
        )

        if (outlineDraft === null) return
        const outlineResult = await ensurePolicyCompliantContent('outline', outlineDraft, systemPrompt, getAIHeaders(), checkCompliance)
        if (outlineResult === null) return
        const { stripStructuredOutput } = await import('@/lib/agents/structured-output')
        const outlineContent = stripStructuredOutput(outlineResult.content)
        set({ outline: outlineContent, streamingContent: '', streamingType: null })

        set({ currentStep: 'script' })

        const scriptDraft = await callLLMStream(
          'script',
          systemPrompt,
          [...messages.filter((m) => m.role !== 'system').map((m) => ({ role: m.role, content: m.content })), { role: 'user' as const, content: finalPrompt }],
          getAIHeaders(),
          systemPrompt
        )

        if (scriptDraft === null) return
        const scriptResult = await ensurePolicyCompliantContent('script', scriptDraft, systemPrompt, getAIHeaders(), checkCompliance)
        if (scriptResult === null) return
        const { extractWithRetry } = await import('@/lib/agents/schema-validator')
        const { extractStructuredOutput } = await import('@/lib/agents/structured-output')
        const structuredOutput = extractWithRetry(scriptResult.content, extractStructuredOutput) || extractWithRetry(outlineResult.content, extractStructuredOutput)
        const scriptContent = stripStructuredOutput(scriptResult.content)
        if (structuredOutput) {
          const { updateAgentMemoryFromStructuredOutput } = await import('@/lib/agents/agent-memory')
          updateAgentMemoryFromStructuredOutput(structuredOutput)
        }
        const { extractAgentArtifacts } = await import('@/lib/agents/agent-tools')
        const toolResult = extractAgentArtifacts(outlineContent, scriptContent, structuredOutput)
        useEditorStore.getState().setAgentStructuredData(toolResult)
        set((state) => ({
          messages: [...state.messages, {
            role: 'assistant',
            content: `🧩 ${toolResult.executionSummary}\n\n${toolResult.complianceSummary}`,
            type: 'info',
          }],
        }))
        set({ script: scriptContent, streamingContent: '', streamingType: null })
        set({ currentStep: 'done', isLoading: false })
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          set({ streamingContent: '', streamingType: null, isLoading: false })
          return
        }
        const errMsg = error instanceof Error ? error.message : '请求失败'
        const unhandled = handleAIError(errMsg) || '请求失败'
        set((state) => ({
          messages: [...state.messages, {
            role: 'assistant',
            content: `❌ ${unhandled}`,
            type: 'error',
          }],
          isLoading: false,
          currentStep: 'idle',
        }))
        useToastStore.getState().addToast({
          type: 'error',
          message: unhandled,
        })
      }
    } else {
      // ============ 继续下一轮 ============
      const nextField = result.state.fields[result.state.currentIndex]
      if (nextField) {
        set((state) => ({
          messages: [...state.messages, {
            role: 'assistant',
            content: `**第 ${result.state.rounds + 1} / ${result.state.maxRounds} 轮**\n${nextField.question}${nextField.description ? `\n_${nextField.description}_` : ''}`,
            type: 'question',
            questionKey: nextField.key,
            options: nextField.options,
            placeholder: nextField.placeholder,
            customPlaceholder: nextField.customPlaceholder,
            whyAsk: nextField.whyAsk,
            allowCustom: nextField.allowCustom,
            fieldType: nextField.type,
          }],
        }))
      }
    }
  },

  sendToAPIStream: async (userMessage) => {
    const { messages, currentTopic, dialogue, awaitingUserAnswer } = get()

    // ============ 如果正在多轮对话中：走 answerDialogue 流程 ============
    if (dialogue && dialogue.active && awaitingUserAnswer) {
      await get().answerDialogue(userMessage)
      return
    }

    // 检查 API Key 是否配置
    const { config } = useAISettingsStore.getState()
    if (!config.apiKey || config.apiKey.trim() === '') {
      set((state) => ({
        messages: [...state.messages, {
          role: 'assistant',
          content: '请先在 AI 设置中配置 API Key',
          type: 'error',
        }],
        isLoading: false,
        currentStep: 'idle',
      }))
      useToastStore.getState().addToast({
        type: 'warning',
        message: '请先配置 API Key',
        action: {
          label: '去设置',
          onClick: () => window.dispatchEvent(new CustomEvent('open-ai-settings')),
        },
      })
      return
    }

    // ============ Agent 智能路由 ============
    const { detectIntent, validateUserInput, SHORT_DRAMA_SYSTEM_PROMPT, SHORT_DRAMA_ANALYSIS_SYSTEM_PROMPT, OUTLINE_SYSTEM_PROMPT } = await import('@/lib/agent-system')

    // 1) 意图识别：判断用户要做什么
    const intent = detectIntent(userMessage)
    console.log('[Agent] 意图识别', intent)

    // 2) 输入合规检测
    const inputCheck = validateUserInput(userMessage)
    if (!inputCheck.passed) {
      set((state) => ({
        messages: [...state.messages, {
          role: 'assistant',
          content: `⚠️ 内容合规检测未通过\n\n问题：${inputCheck.issues.join('；')}\n建议：${inputCheck.suggestions.join('；')}`,
          type: 'error',
        }],
        isLoading: false,
        currentStep: 'idle',
      }))
      useToastStore.getState().addToast({
        type: 'error',
        message: `内容未通过合规检测：${inputCheck.issues[0]}`,
      })
      return
    }

    // 3) 根据意图选择 System Prompt
    const systemPrompt = intent.agent === 'short-drama-analysis'
      ? SHORT_DRAMA_ANALYSIS_SYSTEM_PROMPT
      : intent.agent === 'outline'
      ? OUTLINE_SYSTEM_PROMPT
      : SHORT_DRAMA_SYSTEM_PROMPT
    // 添加意图提示到用户消息（让 LLM 知道任务）
    const intentPrefix = intent.agent === 'short-drama-analysis'
      ? `[任务意图：短剧分析] 请按用户选择的维度输出诊断、证据和可执行改法。\n\n`
      : intent.agent === 'short-drama'
      ? `[创作意图：短剧剧本] 请按"大纲→剧本"两阶段输出。\n\n`
      : intent.agent === 'outline'
      ? `[创作意图：故事大纲] 请输出完整故事大纲。\n\n`
      : ''

    const { AGENT_STRUCTURED_JSON_PROTOCOL } = await import('@/lib/agents/structured-output')
    const { buildMemoryPromptContext, updateAgentMemoryFromInput } = await import('@/lib/agents/agent-memory')
    const memory = updateAgentMemoryFromInput(userMessage)
    const finalUserMessage = `${intentPrefix}${userMessage}\n\n${buildMemoryPromptContext(memory)}\n\n${AGENT_STRUCTURED_JSON_PROTOCOL}`

    const userMsg: AIMessage = {
      role: 'user',
      content: userMessage,
      type: 'user',
    }
    set((state) => ({ messages: [...state.messages, userMsg] }))

    // ============ 智能路由：检测到创作/分析/大纲 → 启动多轮对话 ============
    if (intent.agent === 'short-drama' || intent.agent === 'short-drama-analysis' || intent.agent === 'outline') {
      // 多轮对话期间不需要 isLoading（按钮始终可点）
      get().startDialogue(intent.agent, userMessage)
      return
    }

    // general agent：直接执行 → 此时才设 isLoading
    set({
      isLoading: true,
      currentStep: 'outline',
      streamingContent: '',
      streamingType: null,
    })

    try {
      // ============ Step 1: 生成大纲 ============
      set((state) => ({
        messages: [...state.messages, {
          role: 'assistant',
          content: '正在创作大纲...',
          type: 'info',
        }],
      }))

      const outlineDraft = await callLLMStream(
        'outline',
        outlineSystemPrompt(currentTopic || userMessage),
        [...messages.filter((m) => m.role !== 'system').map((m) => ({ role: m.role, content: m.content })), { role: 'user' as const, content: finalUserMessage }],
        getAIHeaders(),
        systemPrompt // 传入 Agent 选择的 system
      )

      if (outlineDraft === null) return // 中止

      // ============ 合规检测 + 自动修正（输出侧）============
      const { checkCompliance } = await import('@/lib/agent-system')
      const outlineResult = await ensurePolicyCompliantContent('outline', outlineDraft, systemPrompt, getAIHeaders(), checkCompliance)
      if (outlineResult === null) return
      const { stripStructuredOutput } = await import('@/lib/agents/structured-output')
      const outlineContent = stripStructuredOutput(outlineResult.content)

      set({ outline: outlineContent, streamingContent: '', streamingType: null })

      // ============ Step 2: 基于大纲生成剧本 ============
      set({ currentStep: 'script' })

      const scriptDraft = await callLLMStream(
        'script',
        scriptSystemPrompt(currentTopic || userMessage, outlineContent),
        [...messages.filter((m) => m.role !== 'system').map((m) => ({ role: m.role, content: m.content })), { role: 'user' as const, content: finalUserMessage }],
        getAIHeaders(),
        systemPrompt
      )

      if (scriptDraft === null) return

      // 剧本合规检测 + 自动修正
      const scriptResult = await ensurePolicyCompliantContent('script', scriptDraft, systemPrompt, getAIHeaders(), checkCompliance)
      if (scriptResult === null) return
      const { extractStructuredOutput } = await import('@/lib/agents/structured-output')
      const structuredOutput = extractStructuredOutput(scriptResult.content) || extractStructuredOutput(outlineResult.content)
      const scriptContent = stripStructuredOutput(scriptResult.content)
      if (structuredOutput) {
        const { updateAgentMemoryFromStructuredOutput } = await import('@/lib/agents/agent-memory')
        updateAgentMemoryFromStructuredOutput(structuredOutput)
      }

      const { extractAgentArtifacts } = await import('@/lib/agents/agent-tools')
      const toolResult = extractAgentArtifacts(outlineContent, scriptContent, structuredOutput)
      useEditorStore.getState().setAgentStructuredData(toolResult)
      set((state) => ({
        messages: [...state.messages, {
          role: 'assistant',
          content: `🧩 ${toolResult.executionSummary}\n\n${toolResult.complianceSummary}`,
          type: 'info',
        }],
      }))
      set({ script: scriptContent, streamingContent: '', streamingType: null })
      set({ currentStep: 'done', isLoading: false })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        set({ streamingContent: '', streamingType: null, isLoading: false })
        return
      }
      const errMsg = error instanceof Error ? error.message : '请求失败'
      const unhandled = handleAIError(errMsg)
      if (unhandled) {
        set((state) => ({
          messages: [...state.messages, {
            role: 'assistant',
            content: unhandled,
            type: 'error',
          }],
        }))
      }
      set({ streamingContent: '', streamingType: null, isLoading: false, currentStep: 'idle' })
    }
  },
}))

interface ComplianceRewriteResult {
  content: string
  check: ComplianceResult
  rewritten: boolean
}

/** 迭代修正 Prompt 构建（由 self-reflection 模块接管，保留供降级使用） */
function buildComplianceRewritePrompt(contentType: 'outline' | 'script', content: string, check: ComplianceResult): string {
  return `你是高校主旋律网络视听内容合规修正智能体。请在不改变核心创意的前提下，自动改写以下${contentType === 'outline' ? '大纲' : '剧本'}，使其符合2026年网络视听内容导向、微短剧治理要求和高校思政创作标准。\n\n【必须修正的问题】\n${check.issues.join('\n') || '正向价值表达不足'}\n\n【修改建议】\n${check.suggestions.join('\n') || '补充主流价值、青年奋斗、人民视角、文化自信或时代精神'}\n\n【政策依据】\n${check.matchedPolicies?.join('\n') || '内置2026网络视听政策知识库'}\n\n【改写要求】\n1. 保留原有故事核心、人物关系和主要结构。\n2. 删除或替换所有风险表达。\n3. 避免口号式、说教式、脸谱化表达。\n4. 用人物行动和具体情节承载主旋律价值。\n5. 输出完整改写后的正文，不要解释过程。\n6. 如果原文包含 \`\`\`agent-json\`\`\` 结构化块，必须在改写后保留并同步修正该 JSON；如果原文没有，也可以追加合法的 \`\`\`agent-json\`\`\` 块。\n\n【待改写内容】\n${content}`
}

// 保留引用以避免 tree-shaking 移除（降级路径使用）
void buildComplianceRewritePrompt

async function ensurePolicyCompliantContent(
  type: 'outline' | 'script',
  content: string,
  systemPrompt: string,
  headers: Record<string, string>,
  checkCompliance: (content: string) => ComplianceResult
): Promise<ComplianceRewriteResult | null> {
  const firstCheck = checkCompliance(content)
  if (firstCheck.passed) {
    return { content, check: firstCheck, rewritten: false }
  }

  useAIStore.setState((state) => ({
    messages: [...state.messages, {
      role: 'assistant',
      content: `🔁 ${type === 'outline' ? '大纲' : '剧本'}发现政策风险，正在启动迭代式自我修正（最多 3 轮）。\n\n初始评分：${(firstCheck.score * 100).toFixed(0)}\n问题：${firstCheck.issues.join('；') || '正向价值表达不足'}\n建议：${firstCheck.suggestions.join('；')}`,
      type: 'info',
    }],
  }))

  // 使用迭代式自我修正
  const { iterativeSelfFix } = await import('@/lib/agents/self-reflection')
  const fixResult = await iterativeSelfFix(
    type,
    content,
    systemPrompt,
    headers,
    checkCompliance,
    async (system, messages, hdrs) => {
      const result = await callLLMStream(type, system, messages as any, hdrs, system)
      return result
    },
    3
  )

  // 显示修正过程
  for (let i = 1; i < fixResult.allChecks.length; i++) {
    const prev = fixResult.allChecks[i - 1]
    const curr = fixResult.allChecks[i]
    useAIStore.setState((state) => ({
      messages: [...state.messages, {
        role: 'assistant',
        content: `🔄 第 ${i} 轮修正：${(prev.score * 100).toFixed(0)} → ${(curr.score * 100).toFixed(0)}（${curr.severity}）`,
        type: 'info',
      }],
    }))
  }

  useAIStore.setState((state) => ({
    messages: [...state.messages, {
      role: 'assistant',
      content: `✅ ${type === 'outline' ? '大纲' : '剧本'}自我修正完成。\n\n${fixResult.summary}`,
      type: 'info',
    }],
  }))

  return { content: fixResult.content, check: fixResult.allChecks[fixResult.allChecks.length - 1], rewritten: true }
}

/** 调用 LLM 流式 API；
 *  - 实时通过 window event + zustand 暴露 streamingContent
 *  - 返回完整内容；中止返回 null
 */
async function callLLMStream(
  type: 'outline' | 'script',
  _unusedClientSystem: string, // 已废弃，统一使用 body.system
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  headers: Record<string, string>,
  agentSystemPrompt?: string
): Promise<string | null> {
  // 用 AbortController 标识流式请求，可被外部取消（如面板关闭/页面切换）
  const abortController = new AbortController()
  // 注册到全局，供 cleanup 使用
  if (typeof window !== 'undefined') {
    ;(window as any).__aiAbortController = abortController
  }

  let response: Response
  try {
    response = await fetch('/api/deepseek', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        // 优先使用 Agent 路由选出的 system prompt
        system: agentSystemPrompt || _unusedClientSystem,
        messages: messages.filter((m) => m.role !== 'system'),
      }),
      signal: abortController.signal,
    })
  } catch (err) {
    // 静默处理 abort：用户主动取消，不算错误
    if (err instanceof DOMException && err.name === 'AbortError') {
      return null
    }
    if ((err as any)?.name === 'AbortError') {
      return null
    }
    throw err
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'API 请求失败' }))
    throw new Error(error.error || 'API 请求失败')
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let fullContent = ''
  const ct = response.headers.get('content-type') || ''
  const isSSE = ct.includes('text/event-stream')
  // 立即标记流式类型
  useAIStore.setState({ streamingType: type, streamingContent: '' })

  try {
    if (isSSE) {
      // AI SDK v5+ UI stream: data: {"type":"text-delta","text":"..."} 或 v4: data: {"delta":"..."}
      // AI SDK v6 toTextStreamResponse 输出纯文本，这里一般走 else 分支
      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith('data:')) continue
          try {
            const json = JSON.parse(trimmed.slice(5).trim())
            const delta = json.delta ?? json.text ?? ''
            if (delta) {
              fullContent += delta
              useAIStore.setState({ streamingContent: fullContent })
              window.dispatchEvent(new CustomEvent('ai-streaming', { detail: { type, content: fullContent } }))
            }
          } catch {
            // 忽略非 JSON 行
          }
        }
      }
    } else {
      // AI SDK v6 toTextStreamResponse 实际返回 text/plain 纯文本流
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        if (chunk) {
          fullContent += chunk
          useAIStore.setState({ streamingContent: fullContent })
          window.dispatchEvent(new CustomEvent('ai-streaming', { detail: { type, content: fullContent } }))
        }
      }
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return fullContent || null
    }
    throw err
  }

  return fullContent
}
