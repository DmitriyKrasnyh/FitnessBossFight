export interface Boss {
  id: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  maxHP: number;
  avatar: string;
  description: string;
}

export interface Exercise {
  id: string;
  name: string;
  icon: string;
  description: string;
  detection: {
    downAngle: number;
    upAngle: number;
    holdDuration: number;
    joints: string[];
  };
}

export interface GameSession {
  id: string;
  bossId: string;
  exerciseId: string;
  reps: number;
  accuracy: number;
  duration: number;
  victory: boolean;
  timestamp: number;
}

export interface UserStats {
  totalReps: number;
  totalSessions: number;
  victories: number;
  streak: number;
  bestAccuracy: number;
}

export interface Pose {
  keypoints: Array<{
    x: number;
    y: number;
    score: number;
    name: string;
  }>;
}

export type ExercisePhase = 'neutral' | 'down' | 'up';

export interface ExerciseState {
  phase: ExercisePhase;
  reps: number;
  lastTransition: number;
  angles: number[];
  combo: number;
}

export interface UserSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  cameraPermission: boolean;
}
