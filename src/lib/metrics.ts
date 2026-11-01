import { MATH_DOMAINS, MATH_TOPICS } from "@/data/math";
import { RW_DOMAINS, RW_SKILLS } from "@/data/rw";
import { PROVIDER_BY_ID } from "@/data/resources";
import type { Question } from "@/data/content-types";
import { addDays, isoToKey, todayKey } from "@/lib/date";
import type { AppState, TestRecord } from "@/lib/types";

export function mastery(questions: Question[], state: AppState) {
  const total = questions.length;
  const correct = questions.filter((q) => state.exercises[q.id]?.correct).length;
  const attempted = questions.filter((q) => state.exercises[q.id]).length;
  return { total, correct, attempted, pct: total ? Math.round((correct / total) * 100) : 0 };
}

export function mathDomainMastery(state: AppState) {
  return MATH_DOMAINS.map((d) => {
    const qs = MATH_TOPICS.filter((t) => t.domain === d.id).flatMap((t) => t.questions);
    return { ...d, ...mastery(qs, state) };
  });
}

export function rwDomainMastery(state: AppState) {
  return RW_DOMAINS.map((d) => {
    const qs = RW_SKILLS.filter((s) => s.domain === d.id).flatMap((s) => s.questions);
    return { ...d, ...mastery(qs, state) };
  });
}

export function allExerciseStats(state: AppState) {
  const all = [...MATH_TOPICS.flatMap((t) => t.questions), ...RW_SKILLS.flatMap((s) => s.questions)];
  return mastery(all, state);
}

export function totalFocusMinutes(state: AppState): number {
  return state.sessions.reduce((s, x) => s + x.minutes, 0);
}

export function minutesByDay(state: AppState, days: number, end = todayKey()) {
  const map: Record<string, number> = {};
  for (const s of state.sessions) {
    const k = isoToKey(s.date);
    map[k] = (map[k] ?? 0) + s.minutes;
  }
  const out: { key: string; minutes: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const key = addDays(end, -i);
    out.push({ key, minutes: Math.round(map[key] ?? 0) });
  }
  return out;
}

/** A day counts as "active" if focus time was logged or a plan task was completed. */
export function activeDays(state: AppState): Set<string> {
  const set = new Set<string>();
  state.sessions.forEach((s) => set.add(isoToKey(s.date)));
  Object.values(state.completedTasks).forEach((iso) => set.add(isoToKey(iso)));
  return set;
}

export function currentStreak(state: AppState): number {
  const days = activeDays(state);
  let streak = 0;
  let cursor = todayKey();
  if (!days.has(cursor)) cursor = addDays(cursor, -1); // today not done yet doesn't break the streak
  while (days.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function sortedTests(state: AppState): TestRecord[] {
  return [...state.tests].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

export function isOfficial(t: TestRecord): boolean {
  return Boolean(PROVIDER_BY_ID[t.provider]?.official);
}

export function latestOfficial(state: AppState): TestRecord | null {
  const off = sortedTests(state).filter((t) => isOfficial(t) && t.total != null);
  return off.length ? off[off.length - 1] : null;
}

/** Topics mentioned most in recent weak-topic lists and unreviewed errors. Purely counted from Haruka's own records. */
export function focusSuggestions(state: AppState, limit = 4): { topic: string; count: number }[] {
  const counts: Record<string, number> = {};
  const recentTests = sortedTests(state).slice(-3);
  recentTests.forEach((t) => t.weakTopics.forEach((w) => (counts[w.trim()] = (counts[w.trim()] ?? 0) + 2)));
  state.errors.filter((e) => !e.reviewed).forEach((e) => (counts[e.topic.trim()] = (counts[e.topic.trim()] ?? 0) + 1));
  return Object.entries(counts)
    .filter(([k]) => k)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** Parse a grid-in answer like "3/2", "-1.5", "1.50". */
export function parseNumeric(input: string): number | null {
  const s = input.trim().replace(/\s+/g, "").replace(/−/g, "-");
  if (!s) return null;
  if (/^-?\d+\/\d+$/.test(s)) {
    const [n, d] = s.split("/").map(Number);
    return d === 0 ? null : n / d;
  }
  if (/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return Number(s);
  return null;
}

export function checkNumeric(input: string, accept: number[]): boolean {
  const v = parseNumeric(input);
  if (v == null) return false;
  return accept.some((a) => Math.abs(a - v) < 1e-6);
}
