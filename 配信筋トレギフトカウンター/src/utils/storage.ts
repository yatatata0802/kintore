import { Exercise, GiftDefinition, GiftLogEntry } from '../types';
import { DEFAULT_EXERCISES, DEFAULT_GIFTS } from '../data/defaults';

const STORAGE_KEY = 'live_stream_workout_state_v1';

export interface StoredData {
  exercises: Exercise[];
  gifts: GiftDefinition[];
  logs: GiftLogEntry[];
  soundEnabled: boolean;
  activeMultiplier: number;
}

export function loadStoredData(): StoredData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        exercises: DEFAULT_EXERCISES,
        gifts: DEFAULT_GIFTS,
        logs: [],
        soundEnabled: true,
        activeMultiplier: 1,
      };
    }
    const parsed = JSON.parse(raw);
    const savedExercises: Exercise[] = parsed.exercises || DEFAULT_EXERCISES;
    const mergedExercises = savedExercises.map((ex) => {
      if (ex.id === 'pull-up' && (ex.name === '懸垂' || ex.name === 'けんすい')) {
        return {
          ...ex,
          name: 'ハンギングワイパー',
          emoji: '🤸',
          notes: 'バーにぶら下がり足を左右にワイパー！',
        };
      }
      return ex;
    });

    const savedGifts: GiftDefinition[] = parsed.gifts || DEFAULT_GIFTS;
    let mergedGifts = savedGifts.map((g) => {
      // Migrate fireworks from clear_all to reduce_any -100
      if (g.id === 'fireworks' && g.type === 'clear_all') {
        const defaultFireworks = DEFAULT_GIFTS.find((dg) => dg.id === 'fireworks')!;
        return { ...g, ...defaultFireworks };
      }
      // Migrate heart-pose description if it still mentions 懸垂
      if (g.id === 'heart-pose' && g.description && g.description.includes('懸垂')) {
        return {
          ...g,
          description: 'ハンギングワイパー ＋5回',
        };
      }
      return g;
    });

    for (const defaultGift of DEFAULT_GIFTS) {
      if (!mergedGifts.some((g) => g.id === defaultGift.id)) {
        mergedGifts.push(defaultGift);
      }
    }

    return {
      exercises: mergedExercises,
      gifts: mergedGifts,
      logs: parsed.logs || [],
      soundEnabled: parsed.soundEnabled ?? true,
      activeMultiplier: parsed.activeMultiplier || 1,
    };
  } catch {
    return {
      exercises: DEFAULT_EXERCISES,
      gifts: DEFAULT_GIFTS,
      logs: [],
      soundEnabled: true,
      activeMultiplier: 1,
    };
  }
}

export function saveStoredData(data: StoredData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save to localStorage', e);
  }
}

export function clearStoredData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear storage', e);
  }
}
