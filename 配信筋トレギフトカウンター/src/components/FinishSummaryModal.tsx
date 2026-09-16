import React, { useState } from 'react';
import { Exercise, GiftDefinition, GiftLogEntry } from '../types';
import {
  Trophy,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  X,
  Flame,
  Gift,
  Dumbbell,
  Award,
} from 'lucide-react';

interface FinishSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercises: Exercise[];
  gifts: GiftDefinition[];
  logs: GiftLogEntry[];
  onResetAndNewStream: () => void;
}

export const FinishSummaryModal: React.FC<FinishSummaryModalProps> = ({
  isOpen,
  onClose,
  exercises,
  gifts,
  logs,
  onResetAndNewStream,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // 1. All workouts performed
  const totalCompletedReps = exercises.reduce((acc, cur) => acc + cur.completedReps, 0);
  const totalTargetReps = exercises.reduce((acc, cur) => acc + Math.max(0, cur.targetReps), 0);

  // 2. Gift counts calculation
  // Aggregate gifts from logs
  const giftCountsMap = new Map<string, { name: string; emoji: string; count: number; deltaTotal: number }>();

  // Initialize with current gift definitions so they show up or in order
  gifts.forEach((g) => {
    giftCountsMap.set(g.name, {
      name: g.name,
      emoji: g.emoji,
      count: 0,
      deltaTotal: 0,
    });
  });

  // Tally from logs
  logs.forEach((log) => {
    const existing = giftCountsMap.get(log.giftName);
    if (existing) {
      existing.count += log.quantity;
      existing.deltaTotal += log.totalDelta;
    } else {
      giftCountsMap.set(log.giftName, {
        name: log.giftName,
        emoji: log.giftEmoji,
        count: log.quantity,
        deltaTotal: log.totalDelta,
      });
    }
  });

  const giftSummaryList = Array.from(giftCountsMap.values());
  const totalGiftsCount = giftSummaryList.reduce((acc, g) => acc + g.count, 0);

  // Format share text
  const generateShareText = () => {
    const lines: string[] = [
      '🔥【本日の筋トレ配信 実績レポート】🔥',
      '━━━━━━━━━━━━━━━━━━━━',
      '💪【やったトレーニング回数】',
      ...exercises.map(
        (ex) => `・${ex.emoji} ${ex.name}: ${ex.completedReps}回 ${ex.targetReps > 0 && ex.completedReps >= ex.targetReps ? '🏆(達成!)' : ''}`
      ),
      `👉 全種目合計: ${totalCompletedReps}回 消化！`,
      '',
      `🎁【いただいたギフト】(合計 ${totalGiftsCount}個)`,
      ...(giftSummaryList.filter((g) => g.count > 0).length > 0
        ? giftSummaryList
            .filter((g) => g.count > 0)
            .map((g) => `・${g.emoji} ${g.name}: ${g.count}個`)
        : ['・ギフト記録なし']),
      '━━━━━━━━━━━━━━━━━━━━',
      'たくさんのギフト＆熱い応援ありがとうございました！✨',
      '#筋トレ配信 #TikTokLive #筋トレ',
    ];
    return lines.join('\n');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-700/80 rounded-3xl shadow-2xl p-5 sm:p-7 my-auto text-neutral-100 max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
          aria-label="閉じる"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Celebration Banner */}
        <div className="text-center mb-6 shrink-0">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-lg shadow-amber-500/20 mb-3 animate-bounce">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            <span>配信お疲れ様でした！</span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            本日の筋トレ実績・いただいた応援ギフトの最終集計です
          </p>
        </div>

        {/* Scrollable Stats Container */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6">
          {/* 1. All Workouts Completed Section */}
          <div className="rounded-2xl bg-neutral-950/80 border border-neutral-800 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4 border-b border-neutral-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-rose-500" />
                <h3 className="font-extrabold text-base sm:text-lg text-white">
                  全てのトレーニングのやった数
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-neutral-400 block">全種目合計</span>
                <span className="font-num text-xl sm:text-2xl font-black text-rose-400">
                  {totalCompletedReps} <span className="text-xs font-normal text-neutral-400">回</span>
                </span>
              </div>
            </div>

            {/* Grid of Workouts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {exercises.map((ex) => {
                const isGoalAchieved = ex.targetReps > 0 && ex.completedReps >= ex.targetReps;
                return (
                  <div
                    key={ex.id}
                    className={`rounded-xl p-3.5 border flex items-center justify-between ${
                      ex.completedReps > 0
                        ? 'bg-neutral-900/90 border-neutral-700/80'
                        : 'bg-neutral-900/40 border-neutral-800/60 opacity-80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl filter drop-shadow">{ex.emoji}</span>
                      <div>
                        <div className="font-bold text-sm sm:text-base text-white flex items-center gap-1.5">
                          {ex.name}
                          {isGoalAchieved && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold flex items-center gap-0.5">
                              <Award className="w-2.5 h-2.5" /> 達成
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-neutral-400">
                          {ex.targetReps > 0 ? `ノルマ: ${ex.targetReps}回` : '目標設定なし'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                        やった数
                      </span>
                      <span className="font-num text-2xl font-extrabold text-white">
                        {ex.completedReps}
                        <span className="text-xs font-medium text-neutral-400 ml-1">回</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Received Gifts Count Section */}
          <div className="rounded-2xl bg-neutral-950/80 border border-neutral-800 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4 border-b border-neutral-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base sm:text-lg text-white">
                  もらったギフトの数
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-neutral-400 block">ギフト総数</span>
                <span className="font-num text-xl sm:text-2xl font-black text-amber-400">
                  {totalGiftsCount} <span className="text-xs font-normal text-neutral-400">個</span>
                </span>
              </div>
            </div>

            {/* Gift List Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {giftSummaryList.map((g) => {
                const hasReceived = g.count > 0;
                return (
                  <div
                    key={g.name}
                    className={`rounded-xl p-3 border flex flex-col justify-between transition-all ${
                      hasReceived
                        ? 'bg-neutral-900 border-amber-500/40 shadow-sm'
                        : 'bg-neutral-900/40 border-neutral-800/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl filter drop-shadow">{g.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-neutral-200 block truncate">
                          {g.name}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between pt-1 border-t border-neutral-800">
                      <span className="text-[10px] text-neutral-400">受取数</span>
                      <span
                        className={`font-num text-lg font-black ${
                          hasReceived ? 'text-amber-300' : 'text-neutral-500'
                        }`}
                      >
                        {g.count}
                        <span className="text-[10px] font-normal text-neutral-400 ml-0.5">個</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalGiftsCount === 0 && (
              <p className="text-xs text-neutral-500 text-center mt-3">
                ※今回のセッションではまだギフトが記録されていません
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Copy Share Text Button */}
          <button
            onClick={handleCopy}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700'
            }`}
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-neutral-400" />}
            <span>{copied ? '結果テキストをコピーしました！' : '結果をテキストコピー (SNS/配信後用)'}</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Close / Return */}
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs sm:text-sm font-semibold transition-colors"
            >
              画面に戻る
            </button>

            {/* Reset & New Stream */}
            <button
              onClick={() => {
                onResetAndNewStream();
                onClose();
              }}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-md shadow-rose-950/40 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>新しい配信を開始</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
