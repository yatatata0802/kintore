import React, { useState, useRef } from 'react';
import { Exercise } from '../types';
import { X, Flame, CheckCircle, Target, Plus, Check, Copy } from 'lucide-react';
import { formatRemainingRepsText, copyTextToClipboard } from '../utils/clipboard';

interface StreamOverlayModeProps {
  isOpen: boolean;
  onClose: () => void;
  exercises: Exercise[];
  totalTarget: number;
  totalCompleted: number;
  totalRemaining: number;
  totalReliefShield?: number;
  onAddCompleted: (exerciseId: string, delta: number) => void;
}

export const StreamOverlayMode: React.FC<StreamOverlayModeProps> = ({
  isOpen,
  onClose,
  exercises,
  totalTarget,
  totalCompleted,
  totalRemaining,
  totalReliefShield = 0,
  onAddCompleted,
}) => {
  const [bgMode, setBgMode] = useState<'dark' | 'transparent' | 'chroma'>('dark');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  if (!isOpen) return null;

  const handleCopy = async () => {
    const text = formatRemainingRepsText(exercises);
    await copyTextToClipboard(text);
    setIsCopied(true);
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => {
      setIsCopied(false);
    }, 2500);
  };

  const bgClasses = {
    dark: 'bg-neutral-950/95 text-white',
    transparent: 'bg-neutral-950/60 backdrop-blur-md text-white',
    chroma: 'bg-[#00ff00] text-black',
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto p-4 sm:p-8 flex flex-col justify-between transition-colors ${bgClasses[bgMode]}`}
    >
      {/* Top Bar for OBS Settings & Close */}
      <div className="flex items-center justify-between gap-4 mb-4 z-20">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/90 text-white font-bold text-xs tracking-wider uppercase animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white"></span> OBS 配信画面表示
          </span>
          <div className="hidden sm:flex items-center gap-1 bg-black/40 rounded-lg p-1 border border-white/10 text-xs">
            <button
              onClick={() => setBgMode('dark')}
              className={`px-2 py-1 rounded ${bgMode === 'dark' ? 'bg-white/20 text-white font-bold' : 'text-neutral-400'}`}
            >
              ダーク
            </button>
            <button
              onClick={() => setBgMode('transparent')}
              className={`px-2 py-1 rounded ${bgMode === 'transparent' ? 'bg-white/20 text-white font-bold' : 'text-neutral-400'}`}
            >
              半透明
            </button>
            <button
              onClick={() => setBgMode('chroma')}
              className={`px-2 py-1 rounded ${bgMode === 'chroma' ? 'bg-black text-white font-bold' : 'text-neutral-400'}`}
            >
              グリーンバック
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="overlay-copy-btn"
            onClick={handleCopy}
            className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold ${
              isCopied
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                : 'bg-black/50 hover:bg-black/70 text-amber-300 border-white/20 hover:text-amber-200'
            }`}
            title="残り回数をコピー（例: 残り、ニーアップ◯回、腕立て◯回、ワイパー◯回、バーピー◯回）"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isCopied ? 'コピー完了！' : '残り回数コピー'}</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-black/50 hover:bg-black/70 text-white border border-white/20 transition-all flex items-center gap-1.5 text-xs font-bold"
          >
            <X className="w-4 h-4" />
            <span>通常画面へ戻る</span>
          </button>
        </div>
      </div>

      {/* Main HUD Banner */}
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col justify-center">
        {/* Big Total Remaining Hero Card */}
        <div
          className={`rounded-3xl p-6 sm:p-8 mb-6 border shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6 ${
            bgMode === 'chroma'
              ? 'bg-black text-white border-white/30'
              : 'bg-neutral-900/90 border-neutral-700/60'
          }`}
        >
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-rose-400 font-extrabold text-sm sm:text-base tracking-widest uppercase mb-1">
              <Flame className="w-5 h-5 text-rose-500 animate-bounce" />
              筋トレ ギフトノルマ 残り回数
            </div>
            <div className="flex items-baseline justify-center md:justify-start gap-3">
              <span className="font-num text-6xl sm:text-8xl font-black tracking-tight text-rose-400 drop-shadow-[0_4px_16px_rgba(244,63,94,0.4)]">
                {totalRemaining}
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-neutral-300">
                回
              </span>
            </div>
            <div className="text-xs text-neutral-400 mt-1">
              {totalRemaining === 0 && totalReliefShield > 0
                ? `🛡️ 先取り救済シールド発動中（${totalReliefShield}回分チャラ枠あり）`
                : totalRemaining === 0 && totalTarget > 0
                ? '🎉 全ノルマ達成！お疲れ様でした！'
                : 'ギフトをもらうと即時加算されます'}
            </div>
          </div>

          {/* Side summary: Completed & Target */}
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-center min-w-32">
              <div className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1 mb-1">
                <CheckCircle className="w-3.5 h-3.5" /> 消化済み
              </div>
              <div className="font-num text-3xl sm:text-4xl font-black text-emerald-400">
                {totalCompleted}
              </div>
              <div className="text-[11px] text-neutral-400">回 達成</div>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-center min-w-32">
              <div className="text-xs font-bold text-indigo-300 flex items-center justify-center gap-1 mb-1">
                <Target className="w-3.5 h-3.5" /> 合計目標
              </div>
              <div className="font-num text-3xl sm:text-4xl font-black text-neutral-200">
                {totalTarget}
              </div>
              <div className="text-[11px] text-neutral-400">
                {totalTarget < 0 ? '先取り救済中' : '回 ノルマ'}
              </div>
            </div>
          </div>
        </div>

        {/* Exercises Grid for Streamers & Viewers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {exercises.map((ex) => {
            const remaining = Math.max(0, ex.targetReps - ex.completedReps);
            const reliefShield = Math.max(0, ex.completedReps - ex.targetReps);
            const isDone = ex.targetReps > 0 && remaining === 0;

            return (
              <div
                key={ex.id}
                className={`rounded-2xl p-4 border flex flex-col justify-between transition-all ${
                  bgMode === 'chroma'
                    ? 'bg-black text-white border-white/30'
                    : reliefShield > 0
                    ? 'bg-sky-950/80 border-sky-500/60 shadow-lg shadow-sky-500/10'
                    : isDone
                    ? 'bg-emerald-950/80 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                    : 'bg-neutral-900/90 border-neutral-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl filter drop-shadow">{ex.emoji}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        reliefShield > 0
                          ? 'bg-sky-500 text-neutral-950'
                          : isDone
                          ? 'bg-emerald-500 text-neutral-950'
                          : 'bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      {reliefShield > 0
                        ? `🛡️ ${reliefShield}回免除`
                        : isDone
                        ? '完了'
                        : `${ex.completedReps}/${ex.targetReps}`}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-base tracking-tight truncate">
                    {ex.name}
                  </h4>
                </div>

                <div className="my-3 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                    {reliefShield > 0 ? '残り（免除中）' : '残り'}
                  </div>
                  <div
                    className={`font-num text-4xl sm:text-5xl font-black ${
                      remaining > 0
                        ? 'text-rose-400'
                        : reliefShield > 0
                        ? 'text-sky-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {remaining}
                  </div>
                </div>

                {/* Quick 1-tap rep completion buttons right in overlay */}
                <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-white/10">
                  <button
                    onClick={() => onAddCompleted(ex.id, 1)}
                    className="py-1.5 px-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 font-num font-bold text-xs flex items-center justify-center gap-0.5 active:scale-90"
                    title="+1回消化"
                  >
                    <Plus className="w-3 h-3" /> 1
                  </button>
                  <button
                    onClick={() => onAddCompleted(ex.id, 5)}
                    className="py-1.5 px-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 font-num font-bold text-xs flex items-center justify-center gap-0.5 active:scale-90"
                    title="+5回消化"
                  >
                    <Plus className="w-3 h-3" /> 5
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="text-center text-xs text-neutral-400 mt-4">
        画面をOBSのウィンドウキャプチャで取り込むか、スマホスタンドに置いて配信にお使いください
      </div>
    </div>
  );
};
