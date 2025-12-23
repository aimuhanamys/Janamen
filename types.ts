
export enum Goal {
  LOSS = 'похудение',
  MAINTENANCE = 'поддержание',
  GAIN = 'набор'
}

export enum Gender {
  MALE = 'M',
  FEMALE = 'F'
}

export interface UserProfile {
  height: number;
  weight: number;
  age: number;
  gender: Gender;
  goal: Goal;
  stepGoal: number;
  vitaminReminderTime?: string;
}

export interface Activity {
  id: string;
  type: 'walking' | 'gym' | 'running' | 'other';
  duration: number;
  caloriesBurned: number;
  timestamp: number;
}

export interface DailyData {
  date: string;
  calories: number;
  water: number;
  sleepHours: number;
  sleepStart: string; // HH:mm
  sleepEnd: string;   // HH:mm
  vitamins: boolean;
  steps: number;
  activities: Activity[];
  meals: Meal[];
}

export interface Meal {
  id: string;
  name: string;
  weight: number;
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
  fiber: number;
  timestamp: number;
}

export interface RecoveryStats {
  score: number;
  breakdown: {
    sleep: number;
    calories: number;
    water: number;
    activity: number;
    vitamins: number;
    lateDinnerPenalty: boolean;
  };
}

export type ChallengeType = 'step' | 'calories' | 'water' | 'sleep' | 'workout' | 'custom' | 'other';

export type ChallengeUnit = 'шаг' | 'калорий' | 'тренировка' | 'час' | 'минут' | 'литр' | 'мл' | 'день';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  goalValue: number;
  unit: ChallengeUnit;
  durationDays: number;
  color: string; // hex or tailwind class
  icon: string;
}

export interface ChallengeParticipant {
  userId: string;
  challengeId: string;
  progress: number;
  joinedAt: string;
  teamId?: string;
}

export interface ChallengeTeam {
  id: string;
  challengeId: string;
  name: string;
  members: string[]; // userIds
  totalProgress: number;
}

export interface Profile {
  id: string;
  userId: string;
  trophies: number;
  streak: number;
  // Level is removed as per request
}
