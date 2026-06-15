'use client'

import dynamic from 'next/dynamic'

const CreativeSpaceApp = dynamic(
  () => import('@/features/creative-space').then((mod) => mod.CreativeSpaceApp),
  {
    ssr: false,
    loading: () => (
      <div className="h-screen bg-black flex items-center justify-center text-zinc-400 text-sm">
        创意空间加载中...
      </div>
    ),
  }
)

export default function CreativeSpacePage() {
  return <CreativeSpaceApp />
}
