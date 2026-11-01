export type QuestionLevel = "easy" | "medium" | "hard" | "sat";

export interface Question {
  id: string;
  level: QuestionLevel;
  /** Optional short passage (R&W) shown above the prompt. */
  passage?: string;
  /** Optional second passage for cross-text questions. */
  passage2?: string;
  prompt: string;
  table?: { headers: string[]; rows: (string | number)[][] };
  /** Multiple-choice options. If omitted, the question is a student-produced response (grid-in). */
  choices?: string[];
  /** Index of the correct choice for multiple-choice questions. */
  correct?: number;
  /** Accepted numeric values for grid-in questions. */
  accept?: number[];
  answerText: string;
  explanation: string;
}

export interface Formula {
  name: string;
  expr: string;
  note?: string;
}

export interface WorkedExample {
  problem: string;
  steps: string[];
  answer: string;
}

export interface MathTopic {
  id: string;
  domain: MathDomainId;
  title: string;
  summary: string;
  overview: string[];
  formulas: Formula[];
  examples: WorkedExample[];
  questions: Question[];
  keywords: string[];
}

export type MathDomainId = "algebra" | "advanced" | "psda" | "geometry";

export interface Domain<T extends string> {
  id: T;
  title: string;
  weight: string; // share of the section on the SAT
  description: string;
}

export type RWDomainId = "info" | "craft" | "expression" | "conventions";

export interface RWSkill {
  id: string;
  domain: RWDomainId;
  title: string;
  summary: string;
  overview: string[];
  looksLike: string[];
  strategies: string[];
  traps: string[];
  questions: Question[];
  keywords: string[];
}
