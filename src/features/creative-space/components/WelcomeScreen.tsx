// @ts-nocheck
/**
 * 抖影AI 漫剧生成平台 - 欢迎屏幕组件
 *
 * @developer 光波 (a@ggbo.com)
 * @copyright Copyright (c) 2025 光波. All rights reserved.
 */

// components/WelcomeScreen.tsx
import React from 'react';
import { BookOpen, Clapperboard, Image, LayoutTemplate, Sparkles, User } from 'lucide-react';

interface WelcomeScreenProps {
  visible: boolean;
  onTemplateSelect?: (template: 'short-drama' | 'script' | 'character' | 'image' | 'blank') => void;
}

const templates = [
  { id: 'short-drama', title: '一键短剧工作流', desc: '剧本、角色、分镜、视频一条链路', icon: Clapperboard, accent: 'from-cyan-400 to-blue-500' },
  { id: 'script', title: '从剧本开始', desc: '先生成剧情大纲与分集内容', icon: BookOpen, accent: 'from-amber-300 to-orange-500' },
  { id: 'character', title: '从角色开始', desc: '创建主角设定和一致性形象', icon: User, accent: 'from-pink-400 to-fuchsia-500' },
  { id: 'image', title: '从图片开始', desc: '生成概念图、分镜图和风格参考', icon: Image, accent: 'from-purple-400 to-indigo-500' },
  { id: 'blank', title: '空白画布', desc: '自由添加节点构建你的流程', icon: LayoutTemplate, accent: 'from-slate-300 to-slate-500' },
] as const;

/**
 * 欢迎屏幕组件
 * 在画布为空时显示
 */
export const WelcomeScreen: React.FC<WelcomeScreenProps> = React.memo(({ visible, onTemplateSelect }) => {
  if (!visible) return null;

  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center px-8 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] z-50 pointer-events-none ${
        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
      }`}
    >
      <div className="pointer-events-auto w-full max-w-5xl select-none animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.08] border border-white/10 backdrop-blur-xl text-[11px] text-cyan-100/80 mb-4">
            <Sparkles size={13} /> 2026 AI 节点式内容创作空间
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-[-0.04em] text-white drop-shadow-2xl">
            今天想创作什么？
          </h1>
          <p className="mt-3 text-sm text-slate-300/80">选择一个入口，系统会帮你搭好第一组创作节点。</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {templates.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTemplateSelect?.(item.id)}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/25 backdrop-blur-2xl p-4 text-left transition-all hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.08] hover:shadow-2xl hover:shadow-cyan-500/10"
              >
                <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${item.accent} opacity-70`} />
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.accent} text-white flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={18} />
                </div>
                <div className="text-sm font-semibold text-white mb-1">{item.title}</div>
                <div className="text-[11px] leading-relaxed text-slate-400">{item.desc}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});
