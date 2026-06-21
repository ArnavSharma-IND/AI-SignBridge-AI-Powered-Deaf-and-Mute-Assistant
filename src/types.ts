/**
 * AI SignBridge Shared Type Declarations
 */

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface GestureInfo {
  id: string;
  name: string;
  category: "Alphabet" | "Number" | "Word" | "Emergency";
  fingerState: [number, number, number, number, number]; // [Thumb, Index, Middle, Ring, Pinky] (1 = extended, 0 = folded)
  description: string;
  visualSymbol?: string;
}

export interface TranslationLog {
  id: string;
  timestamp: string;
  rawSigns: string[];
  correctedSentence: string;
  language: string;
  emotion: string;
  confidence: number;
  context: string;
  isEmergency?: boolean;
}

export interface QuizQuestion {
  id: string;
  targetGesture: string;
  hint: string;
  visualAslGuide: string; // Dynamic path or outline representation
  standardDurationS: number;
}

export interface UsageStats {
  date: string;
  count: number;
  accuracy: number;
}

export type AppLanguage = "English" | "Hindi" | "Bengali" | "Marathi";

export interface UserAccount {
  isAuthenticated: boolean;
  username: string;
  email: string;
  streakDays: number;
  completedLessons: string[];
  totalPracticeTimeMins: number;
}

export interface EmotionProfile {
  name: "Happy" | "Sad" | "Angry" | "Distressed" | "Calm";
  score: number;
  color: string;
  marker: string;
}
