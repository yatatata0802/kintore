import React, { useState } from 'react';
import { GiftDefinition, Exercise } from '../types';
import { X, Plus, Trash2, RotateCcw, Save, SlidersHorizontal } from 'lucide-react';
import { DEFAULT_GIFTS, DEFAULT_EXERCISES } from '../data/defaults';

interface GiftSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  gifts: GiftDefinition[];
  exercises: Exercise[];
  onSave: (gifts: GiftDefinition[], exercises: Exercise[]) => void;
  onResetDefaults: () => void;
}

export const GiftSettingsModal: React.FC<GiftSettingsModalProps> = ({
  isOpen,
  onClose,
  gifts,
  exercises,
  onSave,
  onResetDefaults,
}) => {
  const [editingGifts, setEditingGifts] = useState<GiftDefinition[]>(gifts);
  const [editingExercises, setEditingExercises] = useState<Exercise[]>(exercises);

  // New gift form state
  const [newGiftName, setNewGiftName] = useState('');
  const [newGiftEmoji, setNewGiftEmoji] = useState('🎁');
  const [newGiftExerciseId, setNewGiftExerciseId] = useState(exercises[0]?.id || 'knee-up');
  const [newGiftReps, setNewGiftReps] = useState(5);

  if (!isOpen) return null;

  const handleUpdateGiftReps = (giftId: string, reps: number) => {
    setEditingGifts((prev) =>
      prev.map((g) => {
        if (g.id === giftId) {
          const sign = g.type === 'reduce' || g.type === 'reduce_any' ? -1 : 1;
          const targetEx = editingExercises.find((e) => e.id === g.targetExerciseId);
          const exName = g.type === 'reduce_any' ? 'どれでも' : targetEx?.name || '';
          return {
            ...g,
            repsChange: Math.abs(reps) * sign,
            description: `${exName} ${sign > 0 ? '＋' : '－'}${Math.abs(reps)}回`,
          };
        }
        return g;
      })
    );
  };

  const handleAddCustomGift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGiftName.trim()) return;

    const targetEx = editingExercises.find((e) => e.id === newGiftExerciseId);
    const newGift: GiftDefinition = {
      id: `custom-${Date.now()}`,
      name: newGiftName.trim(),
      emoji: newGiftEmoji.trim() || '🎁',
      type: 'add',
      targetExerciseId: newGiftExerciseId,
      repsChange: Math.max(1, newGiftReps),
      description: `${targetEx?.name || ''} ＋${Math.max(1, newGiftReps)}回`,
      bgColor: 'from-purple-500/20 to-indigo-500/10 hover:from-purple-500/30 hover:to-indigo-500/20',
      borderColor: 'border-purple-500/40 hover:border-purple-300',
      badgeColor: 'bg-purple-500 text-white font-bold',
    };

    setEditingGifts((prev) => [...prev, newGift]);
    setNewGiftName('');
    setNewGiftEmoji('🎁');
  };

  const handleDeleteGift = (id: string) => {
    setEditingGifts((prev) => prev.filter((g) => g.id !== id));
  };

  const handleSaveAndClose = () => {
    onSave(editingGifts, editingExercises);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-neutral-800 text-white">
              <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
            </span>
            <div>
              <h3 className="font-bold text-white text-base">ギフト・筋トレ設定</h3>
              <p className="text-xs text-neutral-400">
                ギフトごとの筋トレ種目や回数の変更・新規追加
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {/* Current Gifts List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
              登録中のギフト設定 ({editingGifts.length}件)
            </h4>
            <div className="space-y-2">
              {editingGifts.map((gift) => {
                const targetEx = editingExercises.find((e) => e.id === gift.targetExerciseId);
                const absReps = Math.abs(gift.repsChange);

                return (
                  <div
                    key={gift.id}
                    className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{gift.emoji}</span>
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{gift.name}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              gift.type === 'clear_all'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                : gift.type === 'add'
                                ? 'bg-rose-500/20 text-rose-400'
                                : 'bg-sky-500/20 text-sky-400'
                            }`}
                          >
                            {gift.type === 'clear_all'
                              ? '全種目 帳消し'
                              : gift.type === 'add'
                              ? '加算'
                              : '救済'}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          対象:{' '}
                          {gift.type === 'clear_all'
                            ? '全種目の残りノルマ'
                            : gift.type === 'reduce_any'
                            ? 'どれでも選択'
                            : targetEx?.name}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {gift.type === 'clear_all' ? (
                        <div className="px-3 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold text-xs">
                          残り全て帳消し
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-400">回数:</span>
                          <input
                            type="number"
                            min="1"
                            max="999"
                            value={absReps}
                            onChange={(e) =>
                              handleUpdateGiftReps(gift.id, parseInt(e.target.value) || 1)
                            }
                            className="w-16 px-2 py-1 rounded bg-neutral-800 border border-neutral-700 text-white font-num font-bold text-center"
                          />
                          <span className="text-neutral-400">回</span>
                        </div>
                      )}

                      <button
                        onClick={() => handleDeleteGift(gift.id)}
                        className="p-1 text-neutral-500 hover:text-rose-400 transition-colors"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add New Custom Gift */}
          <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <h4 className="text-xs font-bold text-neutral-300 mb-2.5 flex items-center gap-1">
              <Plus className="w-3.5 h-3.5 text-emerald-400" /> 新しいギフトを追加
            </h4>
            <form onSubmit={handleAddCustomGift} className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
              <input
                type="text"
                placeholder="ギフト名 (例: ライオン)"
                value={newGiftName}
                onChange={(e) => setNewGiftName(e.target.value)}
                className="px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white"
                required
              />
              <input
                type="text"
                placeholder="絵文字 (例: 🦁)"
                value={newGiftEmoji}
                onChange={(e) => setNewGiftEmoji(e.target.value)}
                className="px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-center"
              />
              <select
                value={newGiftExerciseId}
                onChange={(e) => setNewGiftExerciseId(e.target.value)}
                className="px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white"
              >
                {editingExercises.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.emoji} {e.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={newGiftReps}
                  onChange={(e) => setNewGiftReps(parseInt(e.target.value) || 1)}
                  className="w-16 px-2 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white font-num font-bold text-center"
                />
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  追加
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-neutral-800 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              if (window.confirm('初期プリセット設定（バラ、ローズ、ハートポーズ等）に戻しますか？')) {
                onResetDefaults();
                setEditingGifts(DEFAULT_GIFTS);
                setEditingExercises(DEFAULT_EXERCISES);
              }
            }}
            className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>初期設定に戻す</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold"
            >
              キャンセル
            </button>
            <button
              onClick={handleSaveAndClose}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
            >
              <Save className="w-3.5 h-3.5" />
              <span>設定を保存</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
