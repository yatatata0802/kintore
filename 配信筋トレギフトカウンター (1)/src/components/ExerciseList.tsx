import React from 'react';
import { Exercise } from '../types';
import { Check, Plus, Minus, CheckCheck, Flame, Trophy, Copy } from 'lucide-react';

interface ExerciseListProps {
  exercises: Exercise[];
  onAddCompleted: (exerciseId: string, delta: number) => void;
  onSetCompletedAll: (exerciseId: string) => void;
  compact?: boolean;
  onCopyRemaining?: () => void;
  isCopiedRemaining?: boolean;
  onCopyCurrent?: () => void;
  isCopiedCurrent?: boolean;
}

export const ExerciseList: React.FC<ExerciseListProps> = ({
  exercises,
  onAddCompleted,
  onSetCompletedAll,
  compact = false,
  onCopyRemaining,
  isCopiedRemaining = false,
  onCopyCurrent,
  isCopiedCurrent = false,
}) => {
  return (
    <div className={compact ? 'space-y-2.5 mb-2' : 'space-y-4 mb-8'}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xs sm:text-sm font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-amber-400" />
          種目別ステータス & 消化カウント
        </h2>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {onCopyRemaining && (
            <button
              id="exercise-list-copy-remaining-btn"
              onClick={onCopyRemaining}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border active:scale-95 ${
                isCopiedRemaining
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                  : 'bg-neutral-800 text-amber-300 border-neutral-700 hover:bg-neutral-700 hover:text-amber-200'
              }`}
              title="残り回数をコピー（例: 残り、ニーアップ◯回、腕立て◯回、ワイパー◯回、バーピー◯回）"
            >
              {isCopiedRemaining ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
              <span>{isCopiedRemaining ? 'コピー済' : '残りコピー'}</span>
            </button>
          )}
          {onCopyCurrent && (
            <button
              id="exercise-list-copy-current-btn"
              onClick={onCopyCurrent}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border active:scale-95 ${
                isCopiedCurrent
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                  : 'bg-neutral-800 text-emerald-400 border-neutral-700 hover:bg-neutral-700 hover:text-emerald-300'
              }`}
              title="消化実績をコピー（例: 【消化実績🔥計◯◯回達成】ニーアップ◯回 / 腕立て◯回 / ワイパー◯回 / バーピー◯回 完遂！）"
            >
              {isCopiedCurrent ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Flame className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isCopiedCurrent ? 'コピー済' : '【済】実績コピー'}</span>
            </button>
          )}
          <span className="text-[11px] text-neutral-400 hidden md:inline">
            タップして消化！
          </span>
        </div>
      </div>

      <div className={`grid ${compact ? 'grid-cols-2 gap-2.5' : 'grid-cols-1 md:grid-cols-2 gap-4'}`}>
        {exercises.map((exercise) => {
          const remaining = Math.max(0, exercise.targetReps - exercise.completedReps);
          const reliefShield = Math.max(0, exercise.completedReps - exercise.targetReps);
          const isDone = exercise.targetReps > 0 && remaining === 0;
          const effectiveTarget = Math.max(0, exercise.targetReps);
          const percent =
            effectiveTarget > 0
              ? Math.min(100, Math.round((exercise.completedReps / effectiveTarget) * 100))
              : 0;

          return (
            <div
              key={exercise.id}
              className={`rounded-2xl border bg-neutral-900/90 transition-all flex flex-col justify-between ${
                compact ? 'p-2.5 sm:p-3' : 'p-4'
              } ${
                reliefShield > 0
                  ? 'border-sky-500/50 shadow-md shadow-sky-500/10'
                  : isDone
                  ? 'border-emerald-500/50 shadow-md shadow-emerald-500/10'
                  : remaining > 0
                  ? 'border-neutral-800 hover:border-neutral-700'
                  : 'border-neutral-800'
              }`}
            >
              {/* Card Top: Exercise Name, Emoji, and Badge */}
              <div className={`flex items-center justify-between gap-2 ${compact ? 'mb-1.5' : 'mb-3'}`}>
                <div className="flex items-center gap-2">
                  <span className={`${compact ? 'text-2xl p-0.5' : 'text-3xl p-1'} rounded-xl bg-neutral-800/80 filter drop-shadow`}>
                    {exercise.emoji}
                  </span>
                  <div>
                    <h3 className={`font-extrabold text-white tracking-tight flex items-center gap-1.5 flex-wrap ${compact ? 'text-sm' : 'text-base'}`}>
                      <span>{exercise.name}</span>
                      {reliefShield > 0 && (
                        <span className="bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[9px] font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                          🛡️ ストック{reliefShield}
                        </span>
                      )}
                      {isDone && reliefShield === 0 && (
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                          <Trophy className="w-2.5 h-2.5" /> 達成
                        </span>
                      )}
                    </h3>
                    {exercise.notes && !compact && (
                      <p className="text-[11px] text-neutral-400 font-medium">{exercise.notes}</p>
                    )}
                  </div>
                </div>

                {/* Remaining Stat Callout */}
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-rose-400 block">
                    {reliefShield > 0 ? '免除中' : '残り'}
                  </span>
                  <div className="flex items-baseline justify-end gap-0.5">
                    <span
                      className={`font-num font-extrabold tracking-tight ${compact ? 'text-2xl' : 'text-3xl'} ${
                        remaining > 0
                          ? 'text-rose-400'
                          : reliefShield > 0
                          ? 'text-sky-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {remaining}
                    </span>
                    <span className="text-[10px] text-neutral-400">回</span>
                  </div>
                </div>
              </div>

              {/* Progress and Stats Row */}
              <div className={`bg-neutral-950/70 rounded-xl border border-neutral-800/60 space-y-1.5 ${compact ? 'p-2 mb-2' : 'p-3 mb-3'}`}>
                <div className="flex justify-between items-center text-[11px]">
                  <div className="flex items-center gap-1.5 text-neutral-300">
                    <span className="text-neutral-400 text-[10px]">消化:</span>
                    <span className="font-num font-bold text-emerald-400">
                      {exercise.completedReps}
                    </span>
                    <span className="text-neutral-500">/</span>
                    <span className="text-neutral-400 text-[10px]">ノルマ:</span>
                    <span
                      className={`font-num font-bold ${
                        exercise.targetReps < 0 ? 'text-sky-400' : 'text-neutral-200'
                      }`}
                    >
                      {exercise.targetReps}
                    </span>
                  </div>
                  {reliefShield > 0 ? (
                    <span className="text-[10px] font-bold text-sky-300">
                      相殺待機
                    </span>
                  ) : (
                    <span className="font-num text-[10px] font-bold text-neutral-400">
                      {percent}%
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      reliefShield > 0
                        ? 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]'
                        : isDone
                        ? 'bg-emerald-500'
                        : 'bg-gradient-to-r from-amber-500 to-rose-500'
                    }`}
                    style={{ width: `${reliefShield > 0 ? 100 : percent}%` }}
                  />
                </div>
              </div>

              {/* Workout Completion Action Buttons (Tap to count reps done) */}
              <div>
                <div className="grid grid-cols-4 gap-1">
                  <button
                    onClick={() => onAddCompleted(exercise.id, 1)}
                    className={`rounded-xl bg-neutral-800 hover:bg-emerald-600/30 hover:border-emerald-500/50 border border-neutral-700 text-emerald-300 font-num font-bold transition-all active:scale-95 flex items-center justify-center gap-0.5 shadow-sm ${
                      compact ? 'py-1.5 px-0.5 text-xs' : 'py-2.5 px-1 text-sm'
                    }`}
                    title="1回消化"
                  >
                    <Plus className="w-3 h-3" />
                    <span>1</span>
                  </button>

                  <button
                    onClick={() => onAddCompleted(exercise.id, 5)}
                    className={`rounded-xl bg-neutral-800 hover:bg-emerald-600/30 hover:border-emerald-500/50 border border-neutral-700 text-emerald-300 font-num font-bold transition-all active:scale-95 flex items-center justify-center gap-0.5 shadow-sm ${
                      compact ? 'py-1.5 px-0.5 text-xs' : 'py-2.5 px-1 text-sm'
                    }`}
                    title="5回消化"
                  >
                    <Plus className="w-3 h-3" />
                    <span>5</span>
                  </button>

                  <button
                    onClick={() => onAddCompleted(exercise.id, 10)}
                    className={`rounded-xl bg-neutral-800 hover:bg-emerald-600/30 hover:border-emerald-500/50 border border-neutral-700 text-emerald-300 font-num font-bold transition-all active:scale-95 flex items-center justify-center gap-0.5 shadow-sm ${
                      compact ? 'py-1.5 px-0.5 text-xs' : 'py-2.5 px-1 text-sm'
                    }`}
                    title="10回消化"
                  >
                    <Plus className="w-3 h-3" />
                    <span>10</span>
                  </button>

                  {/* Done All button or -1 */}
                  {remaining > 0 ? (
                    <button
                      onClick={() => onSetCompletedAll(exercise.id)}
                      className={`rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-300 font-bold transition-all active:scale-95 flex items-center justify-center gap-0.5 ${
                        compact ? 'py-1.5 px-0.5 text-[11px]' : 'py-2.5 px-1 text-xs'
                      }`}
                      title="残りすべて消化完了"
                    >
                      <CheckCheck className="w-3 h-3" />
                      <span>全完</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onAddCompleted(exercise.id, -1)}
                      className={`rounded-xl bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700 text-neutral-400 hover:text-rose-300 font-bold transition-all active:scale-95 flex items-center justify-center gap-0.5 ${
                        compact ? 'py-1.5 px-0.5 text-[11px]' : 'py-2.5 px-1 text-xs'
                      }`}
                      title="1回戻す"
                    >
                      <Minus className="w-3 h-3" />
                      <span>-1</span>
                    </button>
                  )}
                </div>

                {/* Sub-row for minus adjustment if needed */}
                {remaining > 0 && exercise.completedReps > 0 && (
                  <div className="flex justify-end mt-1">
                    <button
                      onClick={() => onAddCompleted(exercise.id, -1)}
                      className="text-[10px] text-neutral-500 hover:text-neutral-300 flex items-center gap-0.5 transition-colors"
                    >
                      <Minus className="w-2.5 h-2.5" /> 消化ミス修正 (-1)
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
