import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Flame, Copy, Check } from 'lucide-react';
import { Exercise, GiftDefinition, GiftLogEntry } from './types';
import { DEFAULT_EXERCISES, DEFAULT_GIFTS } from './data/defaults';
import { loadStoredData, saveStoredData } from './utils/storage';
import { sounds } from './utils/sound';
import { formatRemainingRepsText, copyTextToClipboard } from './utils/clipboard';
import { Header } from './components/Header';
import { GiftButtonBar } from './components/GiftButtonBar';
import { ExerciseList } from './components/ExerciseList';
import { ReliefSelectModal } from './components/ReliefSelectModal';
import { StreamOverlayMode } from './components/StreamOverlayMode';
import { ActivityLogDrawer } from './components/ActivityLogDrawer';
import { GiftSettingsModal } from './components/GiftSettingsModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { FinishSummaryModal } from './components/FinishSummaryModal';

interface StateSnapshot {
  exercises: Exercise[];
  logs: GiftLogEntry[];
  description: string;
}

export default function App() {
  const [initialData] = useState(() => loadStoredData());

  const [exercises, setExercises] = useState<Exercise[]>(initialData.exercises);
  const [gifts, setGifts] = useState<GiftDefinition[]>(initialData.gifts);
  const [logs, setLogs] = useState<GiftLogEntry[]>(initialData.logs);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(initialData.soundEnabled);
  const [activeMultiplier, setActiveMultiplier] = useState<number>(initialData.activeMultiplier);

  // Undo history stack
  const [historyStack, setHistoryStack] = useState<StateSnapshot[]>([]);

  // Modals & UI States
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isFinishSummaryOpen, setIsFinishSummaryOpen] = useState(false);
  const [clearAllCelebration, setClearAllCelebration] = useState<{
    active: boolean;
    clearedReps: number;
    giftName: string;
    giftEmoji: string;
  }>({ active: false, clearedReps: 0, giftName: 'クジラのダイビング', giftEmoji: '🐋' });
  const [reliefModalGift, setReliefModalGift] = useState<{
    gift: GiftDefinition;
    multiplier: number;
  } | null>(null);

  const [ipadFitMode, setIpadFitMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  const [lastActionText, setLastActionText] = useState<string | null>(null);
  const actionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isCopied, setIsCopied] = useState<boolean>(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save to localStorage
  useEffect(() => {
    saveStoredData({
      exercises,
      gifts,
      logs,
      soundEnabled,
      activeMultiplier,
    });
  }, [exercises, gifts, logs, soundEnabled, activeMultiplier]);

  const showActionToast = (text: string) => {
    if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
    setLastActionText(text);
    actionTimeoutRef.current = setTimeout(() => {
      setLastActionText(null);
    }, 3500);
  };

  const handleCopyRemaining = async () => {
    const text = formatRemainingRepsText(exercises);
    const success = await copyTextToClipboard(text);
    if (soundEnabled) {
      sounds.playClick();
    }
    setIsCopied(true);
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => {
      setIsCopied(false);
    }, 2500);

    if (success) {
      showActionToast(`📋 コピーしました: ${text}`);
    } else {
      showActionToast(`📋 ${text}`);
    }
  };

  const pushSnapshot = (desc: string) => {
    setHistoryStack((prev) => [
      {
        exercises: JSON.parse(JSON.stringify(exercises)),
        logs: JSON.parse(JSON.stringify(logs)),
        description: desc,
      },
      ...prev.slice(0, 19), // Keep up to 20 undos
    ]);
  };

  const handleUndo = () => {
    if (historyStack.length === 0) return;
    const [lastState, ...remainingStack] = historyStack;
    setExercises(lastState.exercises);
    setLogs(lastState.logs);
    setHistoryStack(remainingStack);
    showActionToast(`↩️ 「${lastState.description}」を取り消しました`);
  };

  // Gift Click Handler
  const handleSelectGift = (gift: GiftDefinition, multiplier: number) => {
    if (gift.type === 'reduce_any') {
      // Mishka Bear - select which exercise to reduce
      setReliefModalGift({ gift, multiplier });
      return;
    }

    pushSnapshot(`${gift.name} ×${multiplier}`);

    if (gift.type === 'add') {
      const addedReps = gift.repsChange * multiplier;
      const targetEx = exercises.find((e) => e.id === gift.targetExerciseId);
      const exName = targetEx?.name || '筋トレ';
      const prevShield = targetEx ? Math.max(0, targetEx.completedReps - targetEx.targetReps) : 0;

      setExercises((prev) =>
        prev.map((ex) => {
          if (ex.id === gift.targetExerciseId) {
            return {
              ...ex,
              targetReps: ex.targetReps + addedReps,
            };
          }
          return ex;
        })
      );

      const newLog: GiftLogEntry = {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        giftName: gift.name,
        giftEmoji: gift.emoji,
        exerciseName:
          prevShield > 0
            ? `${exName} +${addedReps}回 (先取り救済と相殺！)`
            : `${exName} +${addedReps}回`,
        repsChange: gift.repsChange,
        quantity: multiplier,
        totalDelta: addedReps,
      };
      setLogs((prev) => [newLog, ...prev]);

      if (soundEnabled) sounds.playGiftAdd(multiplier);

      if (prevShield >= addedReps) {
        showActionToast(
          `✨ チャラ発動！ ${gift.emoji} ${gift.name} ×${multiplier} (+${addedReps}回) は先取り救済と相殺され帳消しになりました！`
        );
      } else if (prevShield > 0) {
        const remainingAdd = addedReps - prevShield;
        showActionToast(
          `⚖️ 相殺発動！ ${gift.emoji} ${gift.name} ×${multiplier} のうち ${prevShield}回分チャラになり、残り＋${remainingAdd}回が加算されました！`
        );
      } else {
        showActionToast(`🎁 ${gift.emoji} ${gift.name} ×${multiplier} を受取！ ${exName} ＋${addedReps}回`);
      }
    } else if (gift.type === 'reduce') {
      // Target specific reduction (e.g. 希望のかけら)
      const deduction = Math.abs(gift.repsChange * multiplier);
      const targetEx = exercises.find((e) => e.id === gift.targetExerciseId);
      const exName = targetEx?.name || '筋トレ';
      const currentRemaining = targetEx ? Math.max(0, targetEx.targetReps - targetEx.completedReps) : 0;

      setExercises((prev) =>
        prev.map((ex) => {
          if (ex.id === gift.targetExerciseId) {
            return {
              ...ex,
              targetReps: ex.targetReps - deduction,
            };
          }
          return ex;
        })
      );

      const newLog: GiftLogEntry = {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        giftName: gift.name,
        giftEmoji: gift.emoji,
        exerciseName: `${exName} 救済 －${deduction}回`,
        repsChange: gift.repsChange,
        quantity: multiplier,
        totalDelta: -deduction,
      };
      setLogs((prev) => [newLog, ...prev]);

      if (soundEnabled) sounds.playRelief();

      if (currentRemaining >= deduction) {
        showActionToast(`✨ ${gift.emoji} ${gift.name} ×${multiplier} 救済発動！ ${exName} －${deduction}回`);
      } else if (currentRemaining > 0) {
        const extraShield = deduction - currentRemaining;
        showActionToast(
          `🛡️ ${gift.emoji} ${gift.name} ×${multiplier} 救済！ 残り${currentRemaining}回を減らし、${extraShield}回分は先取り免除ストックへ！`
        );
      } else {
        showActionToast(
          `🛡️ ${gift.emoji} ${gift.name} ×${multiplier} 先取り救済！ ${exName} に ${deduction}回分の免除ストックが付与されました（次回ギフト相殺）`
        );
      }
    } else if (gift.type === 'clear_all') {
      // 超特大ギフト（クジラのダイビング等）: 全種目の残りノルマを全て帳消し（チャラ）に！
      const totalRemainingBefore = exercises.reduce(
        (acc, cur) => acc + Math.max(0, cur.targetReps - cur.completedReps),
        0
      );

      setExercises((prev) =>
        prev.map((ex) => {
          const remaining = Math.max(0, ex.targetReps - ex.completedReps);
          if (remaining > 0) {
            return {
              ...ex,
              targetReps: ex.completedReps, // 残りを即0回に帳消し
            };
          }
          return ex;
        })
      );

      const newLog: GiftLogEntry = {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        giftName: gift.name,
        giftEmoji: gift.emoji,
        exerciseName: `全種目の筋トレ 全て帳消し (残り${totalRemainingBefore}回免除)`,
        repsChange: -totalRemainingBefore,
        quantity: multiplier,
        totalDelta: -totalRemainingBefore,
      };
      setLogs((prev) => [newLog, ...prev]);

      if (soundEnabled) sounds.playWhaleDiving();

      // Show clear all overlay celebration
      setClearAllCelebration({
        active: true,
        clearedReps: totalRemainingBefore,
        giftName: gift.name,
        giftEmoji: gift.emoji,
      });
      setTimeout(() => {
        setClearAllCelebration((prev) => ({ ...prev, active: false }));
      }, 4500);

      if (totalRemainingBefore > 0) {
        showActionToast(
          `${gift.emoji} ${gift.name} 受取！ 全ノルマ (${totalRemainingBefore}回分) が全て帳消しになりました！🌊🎉`
        );
      } else {
        showActionToast(`${gift.emoji} ${gift.name} 受取！ 現在のノルマはすべて既に帳消し・達成済みです！✨`);
      }
    }
  };

  // Relief Any handler (for Mishka bear, Fireworks -100, or custom any-reduction gifts)
  const handleApplyReliefAny = (exerciseId: string, amount: number) => {
    if (!reliefModalGift) return;
    const { gift, multiplier } = reliefModalGift;

    pushSnapshot(`${gift.name} 救済 (${amount}回)`);

    const targetEx = exercises.find((e) => e.id === exerciseId);
    const exName = targetEx?.name || '種目';
    const currentRemaining = targetEx ? Math.max(0, targetEx.targetReps - targetEx.completedReps) : 0;

    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            targetReps: ex.targetReps - amount,
          };
        }
        return ex;
      })
    );

    const newLog: GiftLogEntry = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      giftName: gift.name,
      giftEmoji: gift.emoji,
      exerciseName: `${exName} 救済 －${amount}回`,
      repsChange: -amount,
      quantity: multiplier,
      totalDelta: -amount,
    };
    setLogs((prev) => [newLog, ...prev]);

    if (soundEnabled) {
      if (gift.id === 'fireworks') {
        sounds.playFireworks();
      } else {
        sounds.playRelief();
      }
    }

    if (currentRemaining >= amount) {
      showActionToast(`${gift.emoji} ${gift.name} 救済成功！ ${exName} を －${amount}回 減らしました`);
    } else if (currentRemaining > 0) {
      const extraShield = amount - currentRemaining;
      showActionToast(
        `🛡️ ${gift.emoji} ${gift.name} 救済！ 残り${currentRemaining}回を減らし、${extraShield}回分は先取り免除ストックへ！`
      );
    } else {
      showActionToast(
        `🛡️ ${gift.emoji} ${gift.name} 先取り救済！ ${exName} に ${amount}回分の免除ストックが付与されました（次回ギフト相殺）`
      );
    }
  };

  // Exercise completed reps increment
  const handleAddCompleted = (exerciseId: string, delta: number) => {
    const targetEx = exercises.find((e) => e.id === exerciseId);
    if (!targetEx) return;

    pushSnapshot(`${targetEx.name} 消化 ${delta > 0 ? `+${delta}` : delta}回`);

    let didCompleteTarget = false;
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseId) {
          const newCompleted = Math.max(0, ex.completedReps + delta);
          if (newCompleted >= ex.targetReps && ex.targetReps > 0 && ex.completedReps < ex.targetReps) {
            didCompleteTarget = true;
          }
          return {
            ...ex,
            completedReps: newCompleted,
          };
        }
        return ex;
      })
    );

    if (soundEnabled) {
      if (didCompleteTarget) {
        sounds.playTargetCompleted();
      } else {
        sounds.playRepCount();
      }
    }
  };

  const handleSetCompletedAll = (exerciseId: string) => {
    const targetEx = exercises.find((e) => e.id === exerciseId);
    if (!targetEx) return;

    pushSnapshot(`${targetEx.name} ノルマ全消化`);

    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            completedReps: ex.targetReps,
          };
        }
        return ex;
      })
    );

    if (soundEnabled) sounds.playTargetCompleted();
    showActionToast(`🎉 ${targetEx.emoji} ${targetEx.name} のノルマを全て達成しました！`);
  };

  // Reset all counts
  const handleResetConfirmed = () => {
    pushSnapshot('全リセット実行');
    setExercises((prev) =>
      prev.map((ex) => ({
        ...ex,
        targetReps: 0,
        completedReps: 0,
      }))
    );
    showActionToast('🔄 全種目のカウントをリセットしました');
  };

  // Settings Save
  const handleSaveSettings = (newGifts: GiftDefinition[], newExercises: Exercise[]) => {
    setGifts(newGifts);
    setExercises(newExercises);
    showActionToast('⚙️ ギフトと種目の設定を保存しました');
  };

  // Reset to default gifts & exercises
  const handleResetDefaults = () => {
    setGifts(DEFAULT_GIFTS);
    setExercises(DEFAULT_EXERCISES);
    showActionToast('⚙️ 初期プリセットに戻しました');
  };

  // Calculate totals
  const totalTarget = exercises.reduce((acc, cur) => acc + cur.targetReps, 0);
  const totalCompleted = exercises.reduce((acc, cur) => acc + cur.completedReps, 0);
  const totalRemaining = exercises.reduce(
    (acc, cur) => acc + Math.max(0, cur.targetReps - cur.completedReps),
    0
  );
  const totalReliefShield = exercises.reduce(
    (acc, cur) => acc + Math.max(0, cur.completedReps - cur.targetReps),
    0
  );

  const handleOpenFinish = () => {
    if (soundEnabled) {
      sounds.playTargetCompleted();
    }
    setIsFinishSummaryOpen(true);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Header
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onOpenOverlay={() => setIsOverlayOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onReset={() => setIsResetConfirmOpen(true)}
        onFinish={handleOpenFinish}
        historyCount={logs.length}
        ipadFitMode={ipadFitMode}
        onToggleIpadFit={() => setIpadFitMode(!ipadFitMode)}
        onCopyRemaining={handleCopyRemaining}
        isCopied={isCopied}
      />

      {/* Main Content Area */}
      <main className={`flex-1 w-full mx-auto ${ipadFitMode ? 'max-w-7xl p-2.5 sm:p-3 lg:p-3.5' : 'max-w-6xl p-4 sm:p-6 lg:p-8'}`}>
        {ipadFitMode ? (
          /* iPad Landscape 2-Column "All-In-One Screen" Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 items-start">
            {/* Left Column: Gift Operation Panel */}
            <div className="lg:col-span-6 xl:col-span-6 space-y-2">
              <GiftButtonBar
                gifts={gifts}
                activeMultiplier={activeMultiplier}
                onChangeMultiplier={setActiveMultiplier}
                onSelectGift={handleSelectGift}
                canUndo={historyStack.length > 0}
                onUndo={handleUndo}
                lastActionText={lastActionText}
                compact={true}
              />
            </div>

            {/* Right Column: Real-time Reps Status & Exercise Cards */}
            <div className="lg:col-span-6 xl:col-span-6 space-y-2.5">
              {/* Quick Stream Status HUD Card */}
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-rose-500/20 text-rose-400">
                    <Flame className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                      残りノルマ合計
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-num text-2xl font-black text-rose-400">
                        {totalRemaining}
                      </span>
                      <span className="text-xs text-neutral-400">回</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-center px-2 py-0.5 rounded-lg bg-black/40 border border-white/5">
                    <span className="text-[9px] text-emerald-400 font-bold block">消化済み</span>
                    <span className="font-num text-xs font-black text-emerald-400">
                      {totalCompleted}回
                    </span>
                  </div>

                  {totalReliefShield > 0 && (
                    <div className="text-center px-2 py-0.5 rounded-lg bg-sky-500/10 border border-sky-500/20">
                      <span className="text-[9px] text-sky-400 font-bold block">相殺</span>
                      <span className="font-num text-xs font-black text-sky-300">
                        {totalReliefShield}回
                      </span>
                    </div>
                  )}

                  <button
                    id="hud-copy-remaining-btn"
                    onClick={handleCopyRemaining}
                    className={`px-2.5 py-1.5 rounded-lg font-bold text-xs shadow-sm flex items-center gap-1 transition-all active:scale-95 border ${
                      isCopied
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                        : 'bg-neutral-800 text-amber-300 border-neutral-700 hover:bg-neutral-700 hover:text-amber-200'
                    }`}
                    title="残り回数をコピー（例: 残り、ニーアップ◯回、腕立て◯回、ワイパー◯回、バーピー◯回）"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                    <span>{isCopied ? 'コピー済' : '残りコピー'}</span>
                  </button>

                  <button
                    onClick={handleOpenFinish}
                    className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-sm flex items-center gap-1 shrink-0"
                    title="配信を終了して最終実績レポートを表示"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>配信終了</span>
                  </button>
                </div>
              </div>

              {/* Exercises List (compact 2x2 grid) */}
              <ExerciseList
                exercises={exercises}
                onAddCompleted={handleAddCompleted}
                onSetCompletedAll={handleSetCompletedAll}
                compact={true}
                onCopyRemaining={handleCopyRemaining}
                isCopied={isCopied}
              />
            </div>
          </div>
        ) : (
          /* Standard Vertical Stacking Layout */
          <>
            <GiftButtonBar
              gifts={gifts}
              activeMultiplier={activeMultiplier}
              onChangeMultiplier={setActiveMultiplier}
              onSelectGift={handleSelectGift}
              canUndo={historyStack.length > 0}
              onUndo={handleUndo}
              lastActionText={lastActionText}
            />

            <ExerciseList
              exercises={exercises}
              onAddCompleted={handleAddCompleted}
              onSetCompletedAll={handleSetCompletedAll}
              onCopyRemaining={handleCopyRemaining}
              isCopied={isCopied}
            />

            <div className="mt-8 pt-4 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-neutral-400 text-center sm:text-left">
                配信終了時にタップすると、本日の全トレーニング消化回数ともらったギフトの最終実績レポートを表示します。
              </p>
              <button
                id="bottom-finish-btn"
                onClick={handleOpenFinish}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] shrink-0"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                <span>配信を終了して実績を表示</span>
              </button>
            </div>
          </>
        )}
      </main>

      {/* Stream Overlay Fullscreen Mode (OBS Window Capture) */}
      <StreamOverlayMode
        isOpen={isOverlayOpen}
        onClose={() => setIsOverlayOpen(false)}
        exercises={exercises}
        totalTarget={totalTarget}
        totalCompleted={totalCompleted}
        totalRemaining={totalRemaining}
        totalReliefShield={totalReliefShield}
        onAddCompleted={handleAddCompleted}
      />

      {/* Stream Finish Summary Modal (All workouts completed + all gifts received) */}
      <FinishSummaryModal
        isOpen={isFinishSummaryOpen}
        onClose={() => setIsFinishSummaryOpen(false)}
        exercises={exercises}
        gifts={gifts}
        logs={logs}
        onResetAndNewStream={handleResetConfirmed}
      />

      {/* Relief Any Modal (For Mishka Bear: -5 to chosen exercise) */}
      <ReliefSelectModal
        isOpen={Boolean(reliefModalGift)}
        onClose={() => setReliefModalGift(null)}
        gift={reliefModalGift?.gift || null}
        multiplier={reliefModalGift?.multiplier || 1}
        exercises={exercises}
        onApplyRelief={handleApplyReliefAny}
      />

      {/* Gift Activity Log Drawer */}
      <ActivityLogDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        logs={logs}
        onClearLogs={() => {
          setLogs([]);
          showActionToast('🗑️ 履歴ログを消去しました');
        }}
      />

      {/* Settings Modal */}
      <GiftSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        gifts={gifts}
        exercises={exercises}
        onSave={handleSaveSettings}
        onResetDefaults={handleResetDefaults}
      />

      {/* Reset Confirmation Modal */}
      <ResetConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetConfirmed}
      />

      {/* 🐋 Whale Diving / Clear All Celebratory Overlay */}
      {clearAllCelebration.active && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
          <div className="text-center p-6 sm:p-8 bg-neutral-900/95 border-2 border-cyan-400/80 rounded-3xl shadow-2xl shadow-cyan-500/40 max-w-md w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 animate-pulse-subtle pointer-events-none" />
            <div className="text-6xl sm:text-7xl mb-3 animate-bounce">
              {clearAllCelebration.giftEmoji}🌊✨
            </div>
            <span className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 text-neutral-950 text-xs font-black tracking-wider uppercase shadow-md mb-2">
              超特大ギフト
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-sky-300 to-blue-300">
              {clearAllCelebration.giftName} 炸裂！！
            </h2>
            <p className="text-lg font-extrabold text-white mt-2">
              全種目の残りノルマが
              <span className="text-cyan-300 text-xl font-black block mt-0.5">
                🌊 全て帳消し（チャラ）になりました！ 🌊
              </span>
            </p>
            {clearAllCelebration.clearedReps > 0 && (
              <p className="text-xs text-neutral-400 mt-2">
                （合計 {clearAllCelebration.clearedReps}回分の筋トレが免除されました）
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
