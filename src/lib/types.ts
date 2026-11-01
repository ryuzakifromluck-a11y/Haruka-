export type Subject = "math" | "rw";
export type Difficulty = "easy" | "medium" | "hard";
export type ThemePref = "light" | "dark" | "system";
export type Language = "en" | "uz" | "ru";
export type VocabStatus = "new" | "learning" | "mastered";
export type SessionKind = "math" | "rw" | "timed" | "review" | "other";

export interface NotificationPrefs {
  dailyReminder: boolean;
  reminderTime: string; // "HH:MM"
  timerAlerts: boolean;
  weeklyReview: boolean;
}

export interface Settings {
  planStartDate: string; // YYYY-MM-DD
  examDate: string | null; // YYYY-MM-DD
  dailyGoalMinutes: number;
  theme: ThemePref;
  language: Language;
  showUzbek: boolean;
  notifications: NotificationPrefs;
}

export interface StudySession {
  id: string;
  date: string; // ISO datetime of when the session ended / was logged
  minutes: number;
  kind: SessionKind;
  note?: string;
  source: "timer" | "manual";
}

export interface ErrorEntry {
  id: string;
  question: string;
  subject: Subject;
  topic: string;
  difficulty: Difficulty;
  whyWrong: string;
  correctAnswer: string;
  explanation: string;
  date: string; // YYYY-MM-DD
  reviewed: boolean;
  source?: string;
  retryCount: number;
  lastRetried?: string;
  lastRetryResult?: "correct" | "incorrect";
}

export interface TestRecord {
  id: string;
  date: string; // YYYY-MM-DD
  provider: string; // provider id from data/providers
  testName?: string;
  total: number | null;
  math: number | null;
  rw: number | null;
  notes: string;
  weakTopics: string[];
}

export interface ExerciseResult {
  correct: boolean; // ever answered correctly
  attempts: number;
  lastAt: string;
}

export interface CustomTask {
  id: string;
  title: string;
  minutes: number;
}

export interface ActiveTimer {
  kind: SessionKind;
  mode: "focus" | "break";
  targetMinutes: number;
  startedAt: number | null; // epoch ms when current run started (null = paused)
  accumulatedMs: number; // focus/break time before current run
  label?: string;
}

export type PetSpecies = "cat" | "dog" | "rabbit" | "fox";
export type PetSize = "s" | "m" | "l";

export interface PetPrefs {
  species: PetSpecies;
  /** Chosen coat per species, so switching back keeps each pet's look. */
  coats: Partial<Record<PetSpecies, string>>;
  /** Optional nickname per species. */
  names: Partial<Record<PetSpecies, string>>;
  visible: boolean;
  sound: boolean;
  size: PetSize;
  /** Last position as fractions of the viewport (0..1), or null for the default corner. */
  position: { x: number; y: number } | null;
}

export interface AppState {
  version: 1;
  settings: Settings;
  completedTasks: Record<string, string>; // taskId -> ISO date completed
  customTasks: Record<string, CustomTask[]>; // dayKey -> tasks
  sessions: StudySession[];
  errors: ErrorEntry[];
  tests: TestRecord[];
  exercises: Record<string, ExerciseResult>;
  vocab: Record<string, VocabStatus>;
  timer: ActiveTimer | null;
  pet: PetPrefs;
  updatedAt: string;
}
