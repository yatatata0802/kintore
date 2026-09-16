import React from 'react';
import { GiftLogEntry } from '../types';
import { X, History, Trash2, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';

interface ActivityLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: GiftLogEntry[];
  onClearLogs: () => void;
}

export const ActivityLogDrawer: React.FC<ActivityLogDrawerProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs,
}) => {
  if (!isOpen) return null;

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-neutral-900 border-l border-neutral-800 h-full flex flex-col p-5 shadow-2xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <History className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-white text-base">ギフト・消化履歴</h3>
              <p className="text-xs text-neutral-400">配信中の受取ログ一覧（最新順）</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Logs List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2">
          {logs.length === 0 ? (
            <div className="text-center py-16 text-neutral-500">
              <Clock className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">まだ履歴はありません</p>
              <p className="text-xs text-neutral-600 mt-1">
                ギフト受取や筋トレ消化をするとここに記録されます
              </p>
            </div>
          ) : (
            logs.map((log) => {
              const isPositive = log.totalDelta > 0;
              const isRelief = log.totalDelta < 0;

              return (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{log.giftEmoji}</span>
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{log.giftName}</span>
                        {log.quantity > 1 && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300">
                            ×{log.quantity}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        {log.exerciseName}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`font-num font-bold text-sm flex items-center justify-end gap-0.5 ${
                        isRelief
                          ? 'text-sky-400'
                          : isPositive
                          ? 'text-rose-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {isPositive ? `+${log.totalDelta}` : `${log.totalDelta}`}回
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-500 block">
                      {formatTime(log.timestamp)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        {logs.length > 0 && (
          <div className="pt-3 border-t border-neutral-800">
            <button
              onClick={onClearLogs}
              className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 border border-neutral-700/60 transition-colors flex items-center justify-center gap-2 text-xs font-semibold"
            >
              <Trash2 className="w-4 h-4" />
              <span>履歴ログを消去</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
