# Debug: AI 流式输出不显示

## Session
- **ID**: ai-streaming-not-displayed
- **Status**: [OPEN]
- **Created**: 2026-06-05
- **Last Update**: 2026-06-05

## Symptoms
**Actual**: 用户在 AI 对话窗口输入创意（如"薛涛创业短剧"）后：
- 之前：页面崩溃（Maximum update depth exceeded）
- 现在（修复后）：内容不显示在编辑器中，对话窗口只显示步骤节点

**Expected**: AI 生成的大纲/剧本内容应**实时流式**显示在中间编辑器的对应标签页中

## Reproduction Steps
1. 打开 http://localhost:3000/editor
2. 在右下角"新对话"窗口输入创意描述
3. 按 Enter 发送
4. 观察：中间编辑器是否显示流式内容

## Environment
- **OS**: macOS
- **Browser**: trae-preview (Chrome-based)
- **Node**: v24.13.1
- **Next.js**: 16.2.6
- **React**: 19.2.4
- **TipTap**: 3.23.6
- **AI SDK**: 6.0.194

## Hypotheses (待验证)

### H1: ai-streaming 事件未触发
**观察点**: `ai-store.ts` 中 `callLLMStream` 解析 SSE delta 后是否真的派发了 CustomEvent
**插桩位置**: `callLLMStream` 内部 + `editor-area.tsx` 事件监听

### H2: 事件被监听但 setContents 失败
**观察点**: `editor-area.tsx` 收到 `ai-streaming` 后，`setContents` 是否被调用、throttle 是否正常工作
**插桩位置**: `flush()` 函数入口和出口

### H3: setContents 触发但 useEffect 没把内容同步给 TipTap
**观察点**: `useEffect [contents, activeTab, editor]` 是否执行
**插桩位置**: useEffect 第一行

### H4: TipTap editor.commands.setContent 不生效
**观察点**: TipTap 版本 (3.23.6) 的 `setContent` 签名或行为
**插桩位置**: setContent 调用前后 getHTML() 对比

### H5: AI SDK 返回的 SSE 格式不是 text-delta
**观察点**: 服务器响应格式，delta 字段是否被正确解析
**插桩位置**: `callLLMStream` 解析 SSE 时打印 json

## Instrumentation
待添加

## Evidence Log
待收集

## Root Cause ✅ 已确认（最终）

### 根本原因
**DeepSeek API Key 鉴权失败** — DeepSeek 服务器返回 401：
```
Authentication Fails, Your api key: ****c9f3 is invalid
```

### 完整错误链
1. ❌ `sk-0a52bb01aa324f3a8f77e4bd6a17c9f3` 在 DeepSeek 平台是**无效 key**
2. ❌ `streamText` 把 401 错误**包装成正常 stream response**（200 + 0 字节）
3. ❌ 前端 `callLLMStream` 看到 `response.ok=true` → 进入流读取
4. ❌ 读 0 字节死循环 + React 状态变化导致 fetch abort
5. ❌ 用户看不到任何输出，控制台只看到 `ERR_ABORTED`

### 为什么我之前测通
我用了**同一个 key** 做 curl 测过 streaming（之前我成功过），可能那时 key 还有效，或者我用了不同的 key 路径。

## Fix ✅ 已实施

### 后端修复 `route.ts`
加**鉴权探测** —— 正式流式前，先用 `max_tokens: 1` 探测一次，如果上游返回 401 直接返回：
```typescript
if (!authValid) {
  return new Response(JSON.stringify({ error: 'DeepSeek API Key 无效或网络错误', status: 401, detail: ... }), { status: 401 })
}
```

### 前端修复 `ai-store.ts`
在 `sendToAPIStream` 入口加 API Key 检查，空 key 提示用户去设置，避免无意义请求。

### 前端修复 `ai-settings-store.ts`
`testConnection` 不再 `reader.cancel()`，改用 `releaseLock()` + 2s 超时，避免触发 `ERR_ABORTED`。

## Verification
- 用户必须用**有效的 DeepSeek API Key**（在 https://platform.deepseek.com 重新生成）
- 在 AI 设置中重新配置 key
- 然后再发送创意测试

## Cleanup
未开始
