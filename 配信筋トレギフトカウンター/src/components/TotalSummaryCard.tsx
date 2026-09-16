import React, { useState, useEffect } from 'react';
import { Flame, CheckCircle2, Target, Play, Pause, RotateCcw, Award } from 'lucide-react';

interface TotalSummaryCardProps {
  totalTarget: number;
  totalCompleted: number;
  totalRemaining: number;
  totalReliefShield?: number;
}

export const TotalSummaryCard: React.FC<TotalSummaryCardProps> = ({
  totalTarget,
  totalCompleted,
  totalRemaining,
  totalReliefShield = 0,
}) => {
  // Mini rest stopwatch for streamer between sets
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const effectiveTarget = Math.max(0, totalTarget);
  const progressPercent =
    effectiveTarget > 0 ? Math.min(100, Math.round((totalCompleted / effectiveTarget) * 100)) : 0;
  const isCompleted = effectiveTarget > 0 && totalRemaining === 0;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl p-4 sm:p-6 mb-6">
      {/* Background ambient glow */}
      <div
        className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-colors duration-700 ${
          isCompleted
            ? 'bg-emerald-500/15'
            : totalRemaining > 0
            ? 'bg-rose-500/15'
            : 'bg-indigo-500/10'
        }`}
      />

      <div className="relative z-10 flex flex-col gap-5">
        {/* Top line stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-stretch">
          {/* 1. 残り回数 (Most critical for stream viewer and streamer) */}
          <div className="p-4 rounded-xl bg-neutral-950/80 border border-rose-500/30 flex flex-col justify-between shadow-inner">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="text-xs font-bold tracking-wider text-rose-400 flex items-center gap-1.5 uppercase">
                <Flame className="w-4 h-4 text-rose-500" />
                残り回数
              </span>
              {totalRemaining === 0 && totalReliefShield > 0 ? (
                <span className="bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  🛡️ 先取り救済あり
                </span>
              ) : totalRemaining === 0 && totalTarget > 0 ? (
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Award className="w-3 h-3" /> ノルマ達成！
                </span>
              ) : null}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-num text-4xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-sm">
                {totalRemaining}
              </span>
              <span className="text-sm font-medium text-neutral-400">回</span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              {totalRemaining > 0
                ? 'リスナーの愛に応えて全力筋トレ！'
                : totalReliefShield > 0
                ? `救済ストック ${totalReliefShield}回分（ギフト相殺枠）`
                : '全ノルマ消化完了！'}
            </p>
          </div>

          {/* 2. これまでやった合計回数 (Achievement progress) */}
          <div className="p-4 rounded-xl bg-neutral-950/80 border border-emerald-500/30 flex flex-col justify-between shadow-inner">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="text-xs font-bold tracking-wider text-emerald-400 flex items-center gap-1.5 uppercase">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                消化した合計回数
              </span>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">
                {progressPercent}%
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-num text-4xl sm:text-5xl font-extrabold text-emerald-400 tracking-tight">
                {totalCompleted}
              </span>
              <span className="text-sm font-medium text-neutral-400">回 達成</span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">これまで配信中にこなした累積数</p>
          </div>

          {/* 3. 合計ノルマ (Total gifts task) */}
          <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-700/40 flex flex-col justify-between shadow-inner">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="text-xs font-bold tracking-wider text-indigo-300 flex items-center gap-1.5 uppercase">
                <Target className="w-4 h-4 text-indigo-400" />
                現在の合計ノルマ
              </span>
              {/* Mini Rest Timer Widget */}
              <div className="flex items-center gap-1 bg-neutral-800/80 px-2 py-0.5 rounded text-[11px]">
                <span className="font-num font-mono text-neutral-300">{formatTimer(timerSeconds)}</span>
                <button
                  onClick={() => setTimerRunning(!timerRunning)}
                  className="text-neutral-400 hover:text-white ml-0.5"
                  title={timerRunning ? '休憩タイマーストップ' : 'インターバル計測スタート'}
                >
                  {timerRunning ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
                </button>
                <button
                  onClick={() => {
                    setTimerSeconds(0);
                    setTimerRunning(false);
                  }}
                  className="text-neutral-500 hover:text-neutral-300"
                  title="タイマーリセット"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-num text-4xl sm:text-5xl font-extrabold text-neutral-200 tracking-tight">
                {totalTarget}
              </span>
              <span className="text-sm font-medium text-neutral-400">回 （ギフト累計）</span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              {totalTarget < 0
                ? `先取り救済によりマイナス ${Math.abs(totalTarget)}回`
                : '救済ギフトを引いた現在値'}
            </p>
          </div>
        </div>

        {/* Preemptive Relief Active Shield Notification Banner */}
        {totalReliefShield > 0 && (
          <div className="p-3 rounded-xl bg-gradient-to-r from-sky-500/20 via-cyan-500/10 to-indigo-500/20 border border-sky-500/40 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛡️</span>
              <div>
                <span className="font-bold text-sky-300 block">
                  先取り救済シールド発動中（合計 {totalReliefShield}回分ストック）
                </span>
                <span className="text-neutral-300 text-[11px]">
                  この後ギフトが届いても、先取り分と自動で相殺（チャラ）されます！
                </span>
              </div>
            </div>
            <span className="font-num font-bold text-sky-400 text-sm px-2.5 py-1 bg-sky-950/80 border border-sky-500/30 rounded-lg shrink-0">
              免除ストック: {totalReliefShield}回
            </span>
          </div>
        )}

        {/* Big Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs text-neutral-400 font-medium">
            <span>全体ノルマ消化率</span>
            <span className="font-num font-bold text-white text-sm">{progressPercent}%</span>
          </div>
          <div className="h-3 w-full bg-neutral-950 rounded-full overflow-hidden p-0.5 border border-neutral-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                  : 'bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
