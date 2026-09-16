import { Exercise } from '../types';

/**
 * ユーザー指定フォーマットで残り回数テキストを生成:
 * 「残り、ニーアップ◯回、腕立て◯回、ワイパー◯回、バーピー◯回」
 */
export function formatRemainingRepsText(exercises: Exercise[]): string {
  const getRemaining = (searchTerms: string[]): number => {
    const ex = exercises.find((e) =>
      searchTerms.some(
        (term) =>
          e.id.toLowerCase().includes(term.toLowerCase()) ||
          e.name.toLowerCase().includes(term.toLowerCase())
      )
    );
    return ex ? Math.max(0, ex.targetReps - ex.completedReps) : 0;
  };

  const knee = getRemaining(['knee', 'ニーアップ', 'もも上げ']);
  const push = getRemaining(['push', '腕立て', 'うでたて']);
  const wiper = getRemaining(['wiper', 'pull', 'ワイパー', 'けんすい', '懸垂']);
  const burpee = getRemaining(['burpee', 'バーピー']);

  return `残り、ニーアップ${knee}回、腕立て${push}回、ワイパー${wiper}回、バーピー${burpee}回`;
}

/**
 * 配信コメント欄で「残りノルマ」と一瞬で識別できるように設計された消化実績テキスト:
 * 「【消化実績🔥計◯◯回達成】ニーアップ◯回 / 腕立て◯回 / ワイパー◯回 / バーピー◯回 完遂！」
 */
export function formatCompletedRepsText(exercises: Exercise[]): string {
  const getCompleted = (searchTerms: string[]): number => {
    const ex = exercises.find((e) =>
      searchTerms.some(
        (term) =>
          e.id.toLowerCase().includes(term.toLowerCase()) ||
          e.name.toLowerCase().includes(term.toLowerCase())
      )
    );
    return ex ? Math.max(0, ex.completedReps) : 0;
  };

  const knee = getCompleted(['knee', 'ニーアップ', 'もも上げ']);
  const push = getCompleted(['push', '腕立て', 'うでたて']);
  const wiper = getCompleted(['wiper', 'pull', 'ワイパー', 'けんすい', '懸垂']);
  const burpee = getCompleted(['burpee', 'バーピー']);
  const totalCompleted = knee + push + wiper + burpee;

  return `【消化実績🔥計${totalCompleted}回達成】ニーアップ${knee}回 / 腕立て${push}回 / ワイパー${wiper}回 / バーピー${burpee}回 完遂！`;
}

/**
 * クリップボードにテキストをコピー (ブラウザ & iframe / iOS Safari対応フォールバック付き)
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  // モダンブラウザの Clipboard API をまず試行
  if (navigator?.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard.writeText failed, using textarea fallback:', err);
    }
  }

  // iframe や権限ブロック環境向けフォールバック
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  } catch (err) {
    console.error('Fallback clipboard copy failed:', err);
    return false;
  }
}
