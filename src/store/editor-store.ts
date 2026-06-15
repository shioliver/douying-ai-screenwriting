import { create } from 'zustand'

interface ScriptTag {
  id: string
  label: string
  icon: string
  count: number
}

interface AgentStructuredData {
  characters: Array<{ id: string; name: string; description: string; role: string }>
  scenes: Array<{ id: string; title: string; location: string; time: string; description: string }>
  locations: Array<{ id: string; name: string; description: string }>
  shots: Array<{ id: string; sceneTitle: string; shotType: string; camera: string; description: string }>
  executionSummary: string
  complianceSummary: string
}

interface ScriptData {
  sceneCount: number
  characterCount: number
  locationCount: number
  shotCount: number
  characterRelationCount: number
}

interface EditorState {
  activeTag: string
  tags: ScriptTag[]
  wordCount: number
  characterCount: number
  leftSidebarOpen: boolean
  rightSidebarOpen: boolean
  aiPanelOpen: boolean
  scriptData: ScriptData
  agentStructuredData: AgentStructuredData
  setActiveTag: (tag: string) => void
  updateCounts: (words: number, chars: number) => void
  updateScriptData: (data: Partial<ScriptData>) => void
  setAgentStructuredData: (data: AgentStructuredData) => void
  toggleLeftSidebar: () => void
  toggleRightSidebar: () => void
  toggleAIPanel: () => void
}

export const useEditorStore = create<EditorState>((set) => ({
  activeTag: 'script',
  tags: [
    { id: 'script', label: '剧本', icon: 'file-text', count: 1 },
    { id: 'scenes', label: '场次', icon: 'clapperboard', count: 6 },
    { id: 'characters', label: '人物', icon: 'users', count: 3 },
    { id: 'locations', label: '地点', icon: 'map-pin', count: 5 },
    { id: 'shots', label: '分镜', icon: 'camera', count: 0 },
    { id: 'assets', label: '资产', icon: 'folder', count: 0 },
  ],
  wordCount: 0,
  characterCount: 0,
  leftSidebarOpen: true,
  rightSidebarOpen: true,
  aiPanelOpen: false,
  scriptData: {
    sceneCount: 0,
    characterCount: 0,
    locationCount: 0,
    shotCount: 0,
    characterRelationCount: 0,
  },
  agentStructuredData: {
    characters: [],
    scenes: [],
    locations: [],
    shots: [],
    executionSummary: '',
    complianceSummary: '',
  },
  setActiveTag: (tag) => set({ activeTag: tag }),
  updateCounts: (words, chars) => set({ wordCount: words, characterCount: chars }),
  updateScriptData: (data) => set((state) => ({ scriptData: { ...state.scriptData, ...data } })),
  setAgentStructuredData: (data) => set({
    agentStructuredData: data,
    scriptData: {
      sceneCount: data.scenes.length,
      characterCount: data.characters.length,
      locationCount: data.locations.length,
      shotCount: data.shots.length,
      characterRelationCount: Math.max(0, data.characters.length - 1),
    },
  }),
  toggleLeftSidebar: () => set((state) => ({ leftSidebarOpen: !state.leftSidebarOpen })),
  toggleRightSidebar: () => set((state) => ({ rightSidebarOpen: !state.rightSidebarOpen })),
  toggleAIPanel: () => set((state) => ({ aiPanelOpen: !state.aiPanelOpen })),
}))
