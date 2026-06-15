// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { DetailedStoryboardShot } from '../types';
import { X, Save, RotateCcw, Focus, Maximize2, Minimize2, Eye, User, Users, Move, MoveRight, MoveLeft, RotateCw, Video, Hand, ZoomIn, Circle } from 'lucide-react';

interface StoryboardEditorProps {
    shot: DetailedStoryboardShot | null;
    onSave: (shot: DetailedStoryboardShot) => void;
    onClose: () => void;
}

const SHOT_TYPES = [
    { value: '特写 (Close-up)', label: '特写', icon: Focus, desc: 'CU' },
    { value: '中景 (Medium Shot)', label: '中景', icon: User, desc: 'MS' },
    { value: '全景 (Wide Shot)', label: '全景', icon: Maximize2, desc: 'WS' },
    { value: '主观镜头 (POV Shot)', label: '主观', icon: Eye, desc: 'POV' },
    { value: '过肩镜头 (Over-the-Shoulder)', label: '过肩', icon: Users, desc: 'OTS' },
    { value: '远景 (Long Shot)', label: '远景', icon: Minimize2, desc: 'LS' },
    { value: '特写 (Extreme Close-up)', label: '大特写', icon: Circle, desc: 'ECU' }
];

const CAMERA_ANGLES = [
    { value: '平视 (Eye Level)', label: '平视', icon: '━', desc: 'Eye' },
    { value: '仰角 (Low Angle)', label: '仰角', icon: '╱', desc: 'Low' },
    { value: '俯角 (High Angle)', label: '俯角', icon: '╲', desc: 'High' },
    { value: '第一人称视角', label: '第一人称', icon: '👁', desc: 'POV' },
    { value: '侧面 (Profile)', label: '侧面', icon: '│', desc: 'Side' },
    { value: '45度角', label: '45度', icon: '╱', desc: '45°' },
    { value: '顶视 (Bird\'s Eye View)', label: '顶视', icon: '⊙', desc: 'Top' },
    { value: '荷兰角 (Dutch Angle)', label: '荷兰角', icon: '⧸', desc: 'Dutch' }
];

const CAMERA_MOVEMENTS = [
    { value: '固定镜头 (Static Shot)', label: '固定', icon: Circle, desc: 'Static' },
    { value: '推镜 (Push In)', label: '推镜', icon: MoveRight, desc: 'Push' },
    { value: '拉镜 (Pull Out)', label: '拉镜', icon: MoveLeft, desc: 'Pull' },
    { value: '缓慢推进 (Slow Push In)', label: '缓推', icon: MoveRight, desc: 'Slow' },
    { value: '摇镜 (Pan)', label: '摇镜', icon: Move, desc: 'Pan' },
    { value: '倾斜 (Tilt)', label: '倾斜', icon: RotateCw, desc: 'Tilt' },
    { value: '跟拍 (Following)', label: '跟拍', icon: Video, desc: 'Follow' },
    { value: '环绕 (Orbit)', label: '环绕', icon: RotateCw, desc: 'Orbit' },
    { value: '快速甩镜 (Whip Pan)', label: '甩镜', icon: Move, desc: 'Whip' },
    { value: '手持 (Handheld)', label: '手持', icon: Hand, desc: 'Hand' },
    { value: '变焦 (Zoom)', label: '变焦', icon: ZoomIn, desc: 'Zoom' }
];

export const StoryboardEditor: React.FC<StoryboardEditorProps> = ({
    shot,
    onSave,
    onClose
}) => {
    const [editedShot, setEditedShot] = useState<DetailedStoryboardShot | null>(null);

    useEffect(() => {
        if (shot) {
            setEditedShot({ ...shot });
        }
    }, [shot]);

    if (!shot || !editedShot) return null;

    const handleSave = () => {
        if (editedShot) {
            onSave(editedShot);
            onClose();
        }
    };

    const handleReset = () => {
        setEditedShot({ ...shot });
    };

    const updateField = (field: keyof DetailedStoryboardShot, value: any) => {
        setEditedShot(prev => prev ? { ...prev, [field]: value } : null);
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={(e) => {
                // Click on backdrop to close
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className="w-[700px] max-h-[90vh] bg-[#1c1c1e] border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-white">✏️ 编辑分镜 {editedShot.shotNumber.toString().padStart(2, '0')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-black rounded-lg text-xs font-bold transition-colors"
                        >
                            <Save size={14} />
                            保存
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <div className="space-y-6">
                        {/* Duration */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2">⏱️ 时长设置</label>
                            <div className="bg-black/20 border border-white/10 rounded-lg p-4">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="flex-1">
                                        <span className="text-[10px] text-slate-500">开始时间</span>
                                        <div className="text-sm text-white mt-1">{formatTime(editedShot.startTime)}</div>
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-[10px] text-slate-500">结束时间</span>
                                        <div className="text-sm text-white mt-1">{formatTime(editedShot.endTime)}</div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] text-slate-500">时长 (秒)</span>
                                        <span className="text-sm text-cyan-400 font-bold">{editedShot.duration}秒</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="3"
                                        max="5"
                                        step="1"
                                        value={editedShot.duration}
                                        onChange={(e) => updateField('duration', parseInt(e.target.value))}
                                        className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none"
                                    />
                                    <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                                        <span>3</span>
                                        <span>4</span>
                                        <span>5</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Scene and Characters */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2">📍 场景</label>
                                <input
                                    type="text"
                                    value={editedShot.scene}
                                    onChange={(e) => updateField('scene', e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 transition-colors"
                                    placeholder="教室 - 白天 - 靠窗最后一排"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2">👤 涉及角色</label>
                                <input
                                    type="text"
                                    value={editedShot.characters.join('、')}
                                    onChange={(e) => updateField('characters', e.target.value.split('、').filter(c => c.trim()))}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 transition-colors"
                                    placeholder="用、分隔多个角色"
                                />
                            </div>
                        </div>

                        {/* Camera Info */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2">🎬 景别</label>
                            <div className="grid grid-cols-4 gap-2">
                                {SHOT_TYPES.map(type => {
                                    const Icon = type.icon;
                                    const isSelected = editedShot.shotSize === type.value;
                                    return (
                                        <button
                                            key={type.value}
                                            onClick={() => updateField('shotSize', type.value)}
                                            className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                                                isSelected
                                                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                                                    : 'bg-black/20 border-white/10 text-slate-400 hover:border-white/30'
                                            }`}
                                        >
                                            <Icon size={16} />
                                            <span className="text-[10px] font-medium">{type.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2">📐 拍摄角度</label>
                            <div className="grid grid-cols-4 gap-2">
                                {CAMERA_ANGLES.map(angle => {
                                    const isSelected = editedShot.cameraAngle === angle.value;
                                    return (
                                        <button
                                            key={angle.value}
                                            onClick={() => updateField('cameraAngle', angle.value)}
                                            className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                                                isSelected
                                                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                                                    : 'bg-black/20 border-white/10 text-slate-400 hover:border-white/30'
                                            }`}
                                        >
                                            <span className="text-lg">{angle.icon}</span>
                                            <span className="text-[10px] font-medium">{angle.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2">🎥 运镜方式</label>
                            <div className="grid grid-cols-4 gap-2">
                                {CAMERA_MOVEMENTS.map(movement => {
                                    const Icon = movement.icon;
                                    const isSelected = editedShot.cameraMovement === movement.value;
                                    return (
                                        <button
                                            key={movement.value}
                                            onClick={() => updateField('cameraMovement', movement.value)}
                                            className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                                                isSelected
                                                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                                                    : 'bg-black/20 border-white/10 text-slate-400 hover:border-white/30'
                                            }`}
                                        >
                                            <Icon size={16} />
                                            <span className="text-[10px] font-medium">{movement.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Visual Description */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2">🎨 画面描述</label>
                            <textarea
                                value={editedShot.visualDescription}
                                onChange={(e) => updateField('visualDescription', e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 transition-colors resize-none h-24 custom-scrollbar"
                                placeholder="详细描述画面内容、人物动作、环境细节..."
                            />
                        </div>

                        {/* Dialogue */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2">💬 角色对白</label>
                            <textarea
                                value={editedShot.dialogue}
                                onChange={(e) => updateField('dialogue', e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 transition-colors resize-none h-20 custom-scrollbar"
                                placeholder="角色对白或内心独白，无对白请填写'无'"
                            />
                        </div>

                        {/* Effects */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2">✨ 视觉效果</label>
                            <textarea
                                value={editedShot.visualEffects}
                                onChange={(e) => updateField('visualEffects', e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 transition-colors resize-none h-20 custom-scrollbar"
                                placeholder="景深、色调、特效、风格等..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2">🎵 音效/配乐</label>
                            <textarea
                                value={editedShot.audioEffects}
                                onChange={(e) => updateField('audioEffects', e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 transition-colors resize-none h-20 custom-scrollbar"
                                placeholder="环境音、音效、背景音乐..."
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/10 bg-white/5 flex items-center justify-between shrink-0">
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg text-xs font-bold transition-colors"
                    >
                        <RotateCcw size={14} />
                        重置
                    </button>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg text-xs font-bold transition-colors"
                        >
                            取消
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-black rounded-lg text-xs font-bold transition-colors"
                        >
                            <Save size={14} />
                            保存更改
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
