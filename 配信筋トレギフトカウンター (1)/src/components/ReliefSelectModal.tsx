import React from 'react';
import { Exercise, GiftDefinition } from '../types';
import { X, Sparkles, ChevronRight } from 'lucide-react';

interface ReliefSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  gift: GiftDefinition | null;
  multiplier: number;
  exercises: Exercise[];
  onApplyRelief: (exerciseId: string, amount: number) => void;
}

export const ReliefSelectModal: React.FC<ReliefSelectModalProps> = ({
  isOpen,
  onClose,
  gift,
  multiplier,
  exercises,
  onApplyRelief,
}) => {
  if (!isOpen || !gift) return null;

  const totalDeduction = Math.abs(gift.repsChange * multiplier);

  // Find exercise with highest remaining reps, or hardest exercise if all are 0
  const exercisesWithRemaining = exercises.map((ex) => {
    const remaining = Math.max(0, ex.targetReps - ex.completedReps);
    const shield = Math.max(0, ex.completedReps - ex.targetReps);
    return {
      ...ex,
      remaining,
      shield,
    };
  });

  const hasAnyRemaining = exercisesWithRemaining.some((e) => e.remaining > 0);
  const highestRemaining = hasAnyRemaining
    ? [...exercisesWithRemaining].sort((a, b) => b.remaining - a.remaining)[0]
    : exercisesWithRemaining.find((e) => e.id === 'burpee') || exercisesWithRemaining[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-neutral-900 border border-fuchsia-500/40 rounded-2xl p-5 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="text-4xl filter drop-shadow animate-bounce">
            {gift.emoji}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
              <span>{gift.name}</span>
              <span className="text-xs bg-fuchsia-500 text-white font-extrabold px-2 py-0.5 rounded-full">
                －{totalDeduction}回 救済！
              </span>
            </h3>
            <p className="text-xs text-neutral-300">
              どの筋トレの回数を減らしますか？（先取りOK）
            </p>
          </div>
        </div>

        {/* Preemptive explanation badge */}
        <div className="mb-3 p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-[11px] text-sky-200 flex items-center gap-2">
          <span className="text-base">🛡️</span>
          <span>
            <strong>先取り救済対応：</strong> 残り0回の種目にも付与でき、後からギフトが来ても相殺（チャラ）されます！
          </span>
        </div>

        {/* Smart One-Click Recommendation */}
        {highestRemaining && (
          <button
            onClick={() => {
              onApplyRelief(highestRemaining.id, totalDeduction);
              onClose();
            }}
            className="w-full mb-3 p-3 rounded-xl bg-gradient-to-r from-fuchsia-600/30 to-pink-600/30 border border-fuchsia-500/50 hover:border-fuchsia-400 text-left transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
              <div>
                <span className="text-[11px] font-bold text-fuchsia-300 block uppercase tracking-wide">
                  {hasAnyRemaining ? '残りが一番多い種目（おすすめ）' : '高負荷種目の先取り救済（おすすめ）'}
                </span>
                <span className="text-sm font-bold text-white">
                  {highestRemaining.emoji} {highestRemaining.name} を －{totalDeduction}回
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-neutral-400 block">
                {highestRemaining.remaining > 0 ? '現在残り' : '現在ストック'}
              </span>
              <span className="font-num text-sm font-bold text-rose-400">
                {highestRemaining.remaining > 0
                  ? `${highestRemaining.remaining}回`
                  : `${highestRemaining.shield}回分`}
              </span>
            </div>
          </button>
        )}

        {/* Exercise Selection List */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {exercisesWithRemaining.map((ex) => (
            <button
              key={ex.id}
              onClick={() => {
                onApplyRelief(ex.id, totalDeduction);
                onClose();
              }}
              className="w-full p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 hover:border-neutral-600 hover:bg-neutral-800/60 transition-all flex items-center justify-between group active:scale-98"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{ex.emoji}</span>
                <div className="text-left">
                  <div className="font-bold text-sm text-neutral-100 group-hover:text-fuchsia-300 transition-colors">
                    {ex.name}
                  </div>
                  <div className="text-xs text-neutral-400">
                    ノルマ {ex.targetReps}回 / 消化 {ex.completedReps}回
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="text-[11px] text-neutral-400 block">
                    {ex.remaining > 0 ? '残り回数' : '先取りストック'}
                  </span>
                  <span
                    className={`font-num text-sm font-bold ${
                      ex.remaining > 0 ? 'text-rose-400' : 'text-sky-400'
                    }`}
                  >
                    {ex.remaining > 0
                      ? `${ex.remaining}回`
                      : `＋${totalDeduction}回分ストック`}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-fuchsia-400 transition-colors" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
