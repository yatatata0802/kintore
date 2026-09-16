export interface Exercise {
  id: string;
  name: string;
  emoji: string;
  targetReps: number;
  completedReps: number;
  color: string; // Tailwind color theme identifier (rose, blue, amber, emerald, purple, etc.)
  notes?: string;
}

export type GiftActionType = 'add' | 'reduce' | 'reduce_any' | 'clear_all';

export interface GiftDefinition {
  id: string;
  name: string;
  emoji: string;
  type: GiftActionType;
  targetExerciseId?: string; // which exercise it modifies, or undefined if 'reduce_any'
  repsChange: number; // positive for add, negative for reduction
  description: string;
  bgColor: string;
  borderColor: string;
  badgeColor: string;
}

export interface GiftLogEntry {
  id: string;
  timestamp: number;
  giftName: string;
  giftEmoji: string;
  exerciseName: string;
  repsChange: number;
  quantity: number; // e.g., 1x, 5x, 10x
  totalDelta: number;
  isUndo?: boolean;
}

export interface WorkoutAppState {
  exercises: Exercise[];
  gifts: GiftDefinition[];
  logs: GiftLogEntry[];
  soundEnabled: boolean;
  activeMultiplier: number;
}
