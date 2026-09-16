import React from 'react';
import { GiftDefinition } from '../types';
import { Sparkles, Undo2, Zap, HeartHandshake } from 'lucide-react';

interface GiftButtonBarProps {
  gifts: GiftDefinition[];
  activeMultiplier: number;
  onChangeMultiplier: (multiplier: number) => void;
  onSelectGift: (gift: GiftDefinition, multiplier: number) => void;
  canUndo: boolean;
  onUndo: () => void;
  lastActionText?: string | null;
  compact?: boolean;
}

export const GiftButtonBar: React.FC<GiftButtonBarProps> = ({
  gifts,
  activeMultiplier,
  onChangeMultiplier,
  onSelectGift,
  canUndo,
  onUndo,
  lastActionText,
  compact = false,
}) => {
  const multipliers = [1, 5, 10, 20, 50, 100];

  const standardGifts = gifts.filter((g) => g.type === 'add');
  const reliefGifts = gifts.filter((g) => g.type === 'reduce' || g.type === 'reduce_any' || g.type === 'clear_all');

  return (
    <div className={compact ? 'mb-2 space-y-2' : 'mb-6 space-y-4'}>
      {/* Bar Header & Multiplier Picker */}
      <div className={`flex flex-wrap items-center justify-between gap-2 bg-neutral-900/90 border border-neutral-800 rounded-xl ${compact ? 'p-2' : 'p-3'}`}>
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
            <Zap className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
              ギフト受取ボタン
              <span className="text-[10px] sm:text-[11px] font-normal text-neutral-400">
                （タップ即加算）
              </span>
            </h2>
          </div>
        </div>

        {/* Multiplier / 連打倍率 selector */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
          <span className="text-xs text-neutral-400 font-medium mr-1 hidden sm:inline">
            受取個数:
          </span>
          {multipliers.map((m) => (
            <button
              key={m}
              id={`multiplier-${m}-btn`}
              onClick={() => onChangeMultiplier(m)}
              className={`font-bold rounded-lg transition-all ${
                compact ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
              } ${
                activeMultiplier === m
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 scale-105'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white'
              }`}
            >
              ×{m}
            </button>
          ))}

          {/* Undo Button */}
          {canUndo && (
            <button
              id="undo-gift-btn"
              onClick={onUndo}
              className={`font-semibold rounded-lg bg-neutral-800 border border-neutral-700 text-amber-300 hover:bg-neutral-700 hover:text-amber-200 transition-colors flex items-center gap-1 ${
                compact ? 'ml-1 px-2 py-0.5 text-xs' : 'ml-2 px-2.5 py-1 text-xs'
              }`}
              title="直前の入力を取り消し"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>取消</span>
            </button>
          )}
        </div>
      </div>

      {/* Last Action Notification Toast */}
      {lastActionText && (
        <div className="text-xs text-center py-1 px-3 bg-neutral-800/60 border border-neutral-700/50 rounded-lg text-neutral-300 animate-pulse-subtle">
          {lastActionText}
        </div>
      )}

      {/* 1. 加算ギフト (Workout gifts: バラ, ローズ, ハートポーズ, コーギー, etc.) */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-rose-400" />
            筋トレ追加ギフト（ノルマUP）
          </span>
          {activeMultiplier > 1 && (
            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.2 rounded-full">
              現在 {activeMultiplier}個 ずつ追加中！
            </span>
          )}
        </div>
        <div className={`grid ${compact ? 'grid-cols-3 gap-2' : 'grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3'}`}>
          {standardGifts.map((gift) => {
            const calculatedChange = gift.repsChange * activeMultiplier;
            return (
              <button
                key={gift.id}
                id={`gift-btn-${gift.id}`}
                onClick={() => onSelectGift(gift, activeMultiplier)}
                className={`group relative overflow-hidden text-left rounded-xl border bg-gradient-to-br ${gift.bgColor} ${gift.borderColor} transition-all duration-150 active:scale-95 hover:shadow-lg focus:outline-none ${
                  compact ? 'p-2' : 'p-3.5'
                }`}
              >
                <div className={`flex items-start justify-between gap-1 ${compact ? 'mb-1' : 'mb-2'}`}>
                  <span className={`${compact ? 'text-2xl' : 'text-3xl'} filter drop-shadow group-hover:scale-110 transition-transform`}>
                    {gift.emoji}
                  </span>
                  <span
                    className={`font-num px-1.5 py-0.2 rounded-full font-extrabold shadow-sm ${
                      compact ? 'text-[11px]' : 'text-xs'
                    } ${gift.badgeColor}`}
                  >
                    +{calculatedChange}回
                  </span>
                </div>
                <div className={`font-bold text-white tracking-tight truncate ${compact ? 'text-xs' : 'text-sm'}`}>
                  {gift.name}
                  {activeMultiplier > 1 && (
                    <span className="text-xs text-rose-300 ml-1">×{activeMultiplier}</span>
                  )}
                </div>
                <div className={`text-neutral-300 mt-0.5 truncate font-medium ${compact ? 'text-[10px]' : 'text-xs'}`}>
                  {gift.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. 救済ギフト (Relief gifts: 希望のかけら, ミシカベア, 花火, クジラのダイビング) */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
            <HeartHandshake className="w-3.5 h-3.5 text-sky-400" />
            リスナー救済・帳消しギフト（回数マイナス・全免除）
          </span>
          <span className="text-[10px] text-neutral-400 hidden sm:inline">
            🎆花火:－100回 / 🐋クジラ:全帳消し
          </span>
        </div>
        <div className={`grid ${compact ? 'grid-cols-2 gap-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3'}`}>
          {reliefGifts.map((gift) => {
            const calculatedChange = gift.repsChange * activeMultiplier;
            const isClearAll = gift.type === 'clear_all';

            return (
              <button
                key={gift.id}
                id={`gift-btn-${gift.id}`}
                onClick={() => onSelectGift(gift, activeMultiplier)}
                className={`group relative overflow-hidden text-left rounded-xl border bg-gradient-to-br ${gift.bgColor} ${gift.borderColor} transition-all duration-150 active:scale-95 hover:shadow-lg focus:outline-none ${
                  compact ? 'p-2' : 'p-3.5'
                }`}
              >
                <div className={`flex items-start justify-between gap-1 ${compact ? 'mb-1' : 'mb-2'}`}>
                  <div className="flex items-center gap-2">
                    <span className={`${compact ? 'text-2xl' : 'text-3xl'} filter drop-shadow group-hover:scale-110 transition-transform`}>
                      {gift.emoji}
                    </span>
                    <div>
                      <div className={`font-bold text-white tracking-tight flex items-center gap-1.5 ${compact ? 'text-xs' : 'text-sm'}`}>
                        <span>{gift.name}</span>
                        {activeMultiplier > 1 && !isClearAll && (
                          <span className="text-xs text-sky-300 ml-1">×{activeMultiplier}</span>
                        )}
                      </div>
                      <div className={`text-neutral-300 font-medium truncate ${compact ? 'text-[10px] max-w-28' : 'text-xs'}`}>
                        {gift.description}
                      </div>
                    </div>
                  </div>
                  {isClearAll ? (
                    <span className={`rounded-full font-black shadow-md bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 text-neutral-950 shrink-0 ${
                      compact ? 'text-[10px] px-2 py-0.5' : 'text-[11px] px-2.5 py-1'
                    }`}>
                      🌊 全て帳消し
                    </span>
                  ) : (
                    <span
                      className={`font-num rounded-full font-extrabold shadow-sm shrink-0 ${
                        compact ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
                      } ${gift.badgeColor}`}
                    >
                      {calculatedChange}回
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
