/**
 * Agent 工具注册中心
 * 动态注册、选择、组合工具
 * 实现真正 Agent 的工具调用能力
 */

export type ToolCategory = 'creation' | 'analysis' | 'compliance' | 'editor' | 'memory' | 'rag'

export interface ToolParameter {
  name: string
  description: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  required?: boolean
}

export interface ToolDefinition {
  id: string
  name: string
  description: string
  category: ToolCategory
  parameters: ToolParameter[]
  execute: (params: Record<string, unknown>) => Promise<ToolResult>
}

export interface ToolResult {
  success: boolean
  data?: unknown
  error?: string
  summary: string
}

export interface ToolCallRecord {
  toolId: string
  toolName: string
  params: Record<string, unknown>
  result: ToolResult
  timestamp: number
  duration: number
}

const TOOL_REGISTRY = new Map<string, ToolDefinition>()

/**
 * 注册工具
 */
export function registerTool(tool: ToolDefinition): void {
  TOOL_REGISTRY.set(tool.id, tool)
}

/**
 * 注销工具
 */
export function unregisterTool(toolId: string): void {
  TOOL_REGISTRY.delete(toolId)
}

/**
 * 获取工具
 */
export function getTool(toolId: string): ToolDefinition | undefined {
  return TOOL_REGISTRY.get(toolId)
}

/**
 * 获取所有工具
 */
export function getAllTools(): ToolDefinition[] {
  return Array.from(TOOL_REGISTRY.values())
}

/**
 * 按类别获取工具
 */
export function getToolsByCategory(category: ToolCategory): ToolDefinition[] {
  return getAllTools().filter(t => t.category === category)
}

/**
 * 根据任务自动选择工具
 */
export function selectToolsForTask(taskDescription: string): ToolDefinition[] {
  const tools = getAllTools()
  const selected: ToolDefinition[] = []
  const text = taskDescription.toLowerCase()

  for (const tool of tools) {
    const nameMatch = tool.name.toLowerCase()
    const descMatch = tool.description.toLowerCase()
    if (text.includes(nameMatch) || descMatch.split(' ').some(word => word.length > 3 && text.includes(word))) {
      selected.push(tool)
    }
  }

  return selected.length > 0 ? selected : tools.filter(t => t.category === 'creation')
}

/**
 * 执行工具调用
 */
export async function executeTool(toolId: string, params: Record<string, unknown>): Promise<ToolCallRecord> {
  const tool = TOOL_REGISTRY.get(toolId)
  if (!tool) {
    return {
      toolId,
      toolName: 'unknown',
      params,
      result: { success: false, error: `工具 ${toolId} 未注册`, summary: '工具未找到' },
      timestamp: Date.now(),
      duration: 0,
    }
  }

  const start = Date.now()
  try {
    const result = await tool.execute(params)
    return {
      toolId,
      toolName: tool.name,
      params,
      result,
      timestamp: start,
      duration: Date.now() - start,
    }
  } catch (error) {
    return {
      toolId,
      toolName: tool.name,
      params,
      result: {
        success: false,
        error: error instanceof Error ? error.message : '执行失败',
        summary: '工具执行异常',
      },
      timestamp: start,
      duration: Date.now() - start,
    }
  }
}

/**
 * 批量执行工具（组合调用）
 */
export async function executeToolChain(
  toolIds: string[],
  paramsList: Record<string, unknown>[]
): Promise<ToolCallRecord[]> {
  const results: ToolCallRecord[] = []
  for (let i = 0; i < toolIds.length; i++) {
    const result = await executeTool(toolIds[i], paramsList[i] || {})
    results.push(result)
    if (!result.result.success) break
  }
  return results
}

// ============================================================
// 注册内置工具
// ============================================================

registerTool({
  id: 'write-to-editor',
  name: '写入编辑器',
  description: '将生成内容写入编辑器的大纲或剧本区域',
  category: 'editor',
  parameters: [
    { name: 'target', description: '写入目标：outline 或 script', type: 'string', required: true },
    { name: 'content', description: '要写入的内容', type: 'string', required: true },
  ],
  execute: async (params) => {
    const { useAIStore } = await import('@/store/ai-store')
    const target = params.target as string
    const content = params.content as string
    if (target === 'outline') {
      useAIStore.getState().setOutline(content)
    } else if (target === 'script') {
      useAIStore.getState().setScript(content)
    }
    return {
      success: true,
      summary: `已写入${target === 'outline' ? '大纲' : '剧本'}区域`,
    }
  },
})

registerTool({
  id: 'extract-characters',
  name: '提取人物',
  description: '从文本中提取人物信息并写入编辑器',
  category: 'creation',
  parameters: [
    { name: 'text', description: '要分析的文本', type: 'string', required: true },
  ],
  execute: async (params) => {
    const { extractAgentArtifacts } = await import('./agent-tools')
    const text = params.text as string
    const result = extractAgentArtifacts(text, '', null)
    return {
      success: true,
      data: result.characters,
      summary: `提取了 ${result.characters.length} 个人物`,
    }
  },
})

registerTool({
  id: 'extract-scenes',
  name: '提取场景',
  description: '从文本中提取场景信息',
  category: 'creation',
  parameters: [
    { name: 'text', description: '要分析的文本', type: 'string', required: true },
  ],
  execute: async (params) => {
    const { extractAgentArtifacts } = await import('./agent-tools')
    const text = params.text as string
    const result = extractAgentArtifacts(text, '', null)
    return {
      success: true,
      data: result.scenes,
      summary: `提取了 ${result.scenes.length} 个场景`,
    }
  },
})

registerTool({
  id: 'policy-check',
  name: '政策合规检测',
  description: '对内容进行政策合规检测',
  category: 'compliance',
  parameters: [
    { name: 'content', description: '要检测的内容', type: 'string', required: true },
  ],
  execute: async (params) => {
    const { checkCompliance } = await import('../agent-system')
    const content = params.content as string
    const result = checkCompliance(content)
    return {
      success: result.passed,
      data: result,
      summary: `合规评分：${(result.score * 100).toFixed(0)}，风险等级：${result.severity}`,
    }
  },
})

registerTool({
  id: 'policy-retrieve',
  name: '检索政策知识',
  description: '根据内容检索相关政策知识',
  category: 'rag',
  parameters: [
    { name: 'query', description: '检索关键词', type: 'string', required: true },
  ],
  execute: async (params) => {
    const { retrievePolicyKnowledge } = await import('./policy-knowledge-base')
    const query = params.query as string
    const result = retrievePolicyKnowledge(query)
    return {
      success: true,
      data: result,
      summary: `检索到 ${result.items.length} 条相关政策`,
    }
  },
})

registerTool({
  id: 'update-memory',
  name: '更新长期记忆',
  description: '从用户输入或生成结果中更新长期记忆',
  category: 'memory',
  parameters: [
    { name: 'input', description: '用户输入或生成内容', type: 'string', required: true },
    { name: 'type', description: '更新类型：input 或 output', type: 'string', required: true },
  ],
  execute: async (params) => {
    const { updateAgentMemoryFromInput, updateAgentMemoryFromStructuredOutput } = await import('./agent-memory')
    const input = params.input as string
    const type = params.type as string
    if (type === 'output') {
      try {
        const parsed = JSON.parse(input)
        updateAgentMemoryFromStructuredOutput(parsed)
      } catch {
        updateAgentMemoryFromInput(input)
      }
    } else {
      updateAgentMemoryFromInput(input)
    }
    return {
      success: true,
      summary: '长期记忆已更新',
    }
  },
})

registerTool({
  id: 'generate-outline',
  name: '生成大纲',
  description: '基于用户需求和政策约束生成故事大纲',
  category: 'creation',
  parameters: [
    { name: 'prompt', description: '生成提示词', type: 'string', required: true },
  ],
  execute: async () => {
    return {
      success: true,
      summary: '大纲生成由 LLM 流式调用完成，此工具为占位',
    }
  },
})

registerTool({
  id: 'generate-script',
  name: '生成剧本',
  description: '基于大纲生成完整剧本',
  category: 'creation',
  parameters: [
    { name: 'outline', description: '故事大纲', type: 'string', required: true },
  ],
  execute: async () => {
    return {
      success: true,
      summary: '剧本生成由 LLM 流式调用完成，此工具为占位',
    }
  },
})

registerTool({
  id: 'analyze-drama',
  name: '分析短剧',
  description: '对短剧内容进行多维度分析',
  category: 'analysis',
  parameters: [
    { name: 'content', description: '要分析的短剧内容', type: 'string', required: true },
    { name: 'dimensions', description: '分析维度', type: 'array', required: false },
  ],
  execute: async () => {
    return {
      success: true,
      summary: '短剧分析由 LLM 流式调用完成，此工具为占位',
    }
  },
})
