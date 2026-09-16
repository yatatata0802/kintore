import React from 'react';
import {
  Radio,
  Volume2,
  VolumeX,
  MonitorPlay,
  History,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Tablet,
  Copy,
  Check,
} from 'lucide-react';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenOverlay: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onReset: () => void;
  onFinish: () => void;
  historyCount: number;
  ipadFitMode: boolean;
  onToggleIpadFit: () => void;
  onCopyRemaining: () => void;
  isCopied: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  onToggleSound,
  onOpenOverlay,
  onOpenHistory,
  onOpenSettings,
  onReset,
  onFinish,
  historyCount,
  ipadFitMode,
  onToggleIpadFit,
  onCopyRemaining,
  isCopied,
}) => {
  return (
    <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-30 px-3 sm:px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        {/* Logo & Live Status */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="text-[11px] font-bold text-rose-400 tracking-wider flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse" /> LIVE
            </span>
          </div>
          <div>
            <h1 className="text-base sm:text-lg md:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>筋トレギフトカウンター</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 hidden sm:inline-block">
                TikTok配信
              </span>
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* iPad 1-Screen Fit Toggle */}
          <button
            id="ipad-fit-toggle-btn"
            onClick={onToggleIpadFit}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
              ipadFitMode
                ? 'bg-sky-500/20 text-sky-300 border-sky-400/40 shadow-sm shadow-sky-500/10'
                : 'bg-neutral-800/80 text-neutral-400 border-neutral-700 hover:text-white'
            }`}
            title="iPad横画面でスクロールせずに1画面で全操作できるレイアウト"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
              {ipadFitMode ? 'iPad横画面フィット: ON' : '1画面フィット'}
            </span>
          </button>

          {/* Sound Toggle */}
          <button
            id="sound-toggle-btn"
            onClick={onToggleSound}
            className={`p-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              soundEnabled
                ? 'bg-neutral-800 text-emerald-400 hover:bg-neutral-700'
                : 'bg-neutral-900 text-neutral-500 hover:bg-neutral-800'
            }`}
            title={soundEnabled ? '効果音ON' : '効果音OFF'}
            aria-label="効果音切り替え"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="text-xs hidden md:inline">{soundEnabled ? '音ON' : 'ミュート'}</span>
          </button>

          {/* History Button */}
          <button
            id="history-btn"
            onClick={onOpenHistory}
            className="p-2 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors flex items-center gap-1.5 text-xs relative"
            title="ギフト・消化履歴"
          >
            <History className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">履歴</span>
            {historyCount > 0 && (
              <span className="bg-sky-500 text-neutral-950 font-bold rounded-full px-1.5 py-0.2 text-[10px] min-w-4 text-center">
                {historyCount > 99 ? '99+' : historyCount}
              </span>
            )}
          </button>

          {/* Copy Remaining Reps Button */}
          <button
            id="copy-remaining-header-btn"
            onClick={onCopyRemaining}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border active:scale-95 ${
              isCopied
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-sm'
                : 'bg-neutral-800 text-amber-300 border-neutral-700 hover:bg-neutral-700 hover:text-amber-200'
            }`}
            title="残り回数をコピー（例: 残り、ニーアップ◯回、腕立て◯回、ワイパー◯回、バーピー◯回）"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isCopied ? 'コピー完了！' : '残りコピー'}</span>
          </button>

          {/* OBS / Overlay Mode Button */}
          <button
            id="obs-overlay-btn"
            onClick={onOpenOverlay}
            className="px-3 py-2 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 hover:bg-indigo-600/50 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold shadow-sm"
            title="配信画面・OBSキャプチャ用オーバーレイ"
          >
            <MonitorPlay className="w-4 h-4 text-indigo-400" />
            <span>配信画面モード</span>
          </button>

          {/* Finish Stream Button */}
          <button
            id="finish-stream-btn"
            onClick={onFinish}
            className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center gap-1.5 text-xs font-bold shadow-md shadow-emerald-950/40"
            title="配信を終了して筋トレ実績・もらったギフト数を表示"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>終了</span>
          </button>

          {/* Settings Button */}
          <button
            id="settings-btn"
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors"
            title="ギフト・種目ルール設定"
            aria-label="設定"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Reset Button */}
          <button
            id="reset-btn"
            onClick={onReset}
            className="p-2 rounded-lg bg-neutral-800/80 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="回数をリセット"
            aria-label="リセット"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
