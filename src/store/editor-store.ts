import { create } from 'zustand'

interface ScriptTag {
  id: string
  label: string
  icon: string
  count: number
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
  setActiveTag: (tag: string) => void
  updateCounts: (words: number, chars: number) => void
  updateScriptData: (data: Partial<ScriptData>) => void
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
  setActiveTag: (tag) => set({ activeTag: tag }),
  updateCounts: (words, chars) => set({ wordCount: words, characterCount: chars }),
  updateScriptData: (data) => set((state) => ({ scriptData: { ...state.scriptData, ...data } })),
  toggleLeftSidebar: () => set((state) => ({ leftSidebarOpen: !state.leftSidebarOpen })),
  toggleRightSidebar: () => set((state) => ({ rightSidebarOpen: !state.rightSidebarOpen })),
  toggleAIPanel: () => set((state) => ({ aiPanelOpen: !state.aiPanelOpen })),
}))
