// @ts-nocheck
import React, { useState } from 'react';
import { X, Key } from 'lucide-react';

interface ApiKeyPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string, provider: string) => void;
}

export const ApiKeyPrompt: React.FC<ApiKeyPromptProps> = ({ isOpen, onClose, onSave }) => {
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState('openrouter');
  const [error, setError] = useState('');

  const handleSave = () => {
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      setError('请输入有效的 API Key');
      return;
    }

    // OpenRouter API Key 不需要特定格式验证
    onSave(trimmedKey, provider);
    setApiKey('');
    setError('');
  };

  const handleClose = () => {
    setApiKey('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-[#1c1c1e] rounded-2xl shadow-2xl border border-white/10 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <Key className="text-cyan-500" size={24} />
            </div>
            <h2 className="text-xl font-bold text-white">配置 API Key</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-200">
              <span className="font-semibold">💡 提示：</span>
              配置 OpenRouter API Key 以使用 AI 功能（支持免费模型）
            </p>
          </div>

          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              API 提供商
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full px-4 py-3 bg-[#2c2c2e] border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
            >
              <option value="openrouter">OpenRouter</option>
              <option value="custom">自定义 API</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setError('');
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                }
              }}
              placeholder="请输入您的 OpenRouter API Key"
              className="w-full px-4 py-3 bg-[#2c2c2e] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
            />
            {error && (
              <p className="text-xs text-red-400 animate-in fade-in duration-200">
                {error}
              </p>
            )}
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg space-y-2">
            <p className="text-xs text-blue-200">
              <span className="font-semibold">💡 如何获取 API Key？</span>
            </p>
            <ol className="text-xs text-blue-200/80 space-y-1 list-decimal list-inside">
              <li>访问 <a href="https://openrouter.ai/" target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-400">OpenRouter</a></li>
              <li>注册并登录您的账号</li>
              <li>进入 API Keys 页面创建新的 API Key</li>
              <li>复制生成的 API Key 并粘贴到上方输入框</li>
            </ol>
            <p className="text-xs text-cyan-300 mt-2">
              ✨ 推荐模型: Tencent: Hy3 preview (免费)
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 transition-all hover:scale-105"
          >
            保存并开始使用
          </button>
        </div>
      </div>
    </div>
  );
};
