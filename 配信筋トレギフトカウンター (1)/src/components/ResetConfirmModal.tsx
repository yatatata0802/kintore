import React from 'react';
import { AlertTriangle, X, Check } from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center gap-3 text-rose-400 mb-3">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base">筋トレ回数をリセット</h3>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed mb-5">
          現在蓄積されているギフトノルマ・消化済み回数をすべてゼロにリセットしますか？
          （※配信終了後のリセットにお使いください）
        </p>

        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold"
          >
            キャンセル
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>リセット実行</span>
          </button>
        </div>
      </div>
    </div>
  );
};
