import { CURRICULUM, type DayOverride, type TopicItem, type WeekPlan } from "@/data/curriculum";
import { PHRASES } from "@/data/curriculum.i18n";
import { currentLanguage, tr, trList, type Language, type MsgKey } from "@/i18n";
import { addDays, diffDays } from "@/lib/date";
import type { AppState } from "@/lib/types";

export type BlockKind = "math" | "rw" | "timed" | "review";

export interface PlanTask {
  id: string; // w{week}-d{day}-b{n}
  week: number;
  day: number; // 1..7
  block: number;
  kind: BlockKind;
  title: string;
  objective: string;
  assignment: string;
  minutes: number;
  optional?: boolean;
  link?: { href: string; label: string; external?: boolean };
}

export interface PlanDay {
  key: string; // w{week}-d{day}
  week: number;
  day: number;
  routine: string;
  title: string;
  objective: string;
  isRest: boolean;
  tasks: PlanTask[];
}

const QBANK = "https://satsuitequestionbank.collegeboard.org/";
const KHAN = "https://www.khanacademy.org/digital-sat";

/** Curriculum sentence in the chosen language (English is the source text). */
function ph(s: string, lang: Language): string {
  if (lang === "en") return s;
  const hit = PHRASES[s];
  return hit ? hit[lang === "uz" ? 0 : 1] : s;
}

export function routineLabel(day: number, lang: Language = currentLanguage()): string {
  return trList("planGen.routine", lang)[day - 1] ?? "";
}

/** Kept for code that wants the English routine names. */
export const ROUTINE = trList("planGen.routine", "en");

// SAT topic and skill names stay in English on purpose: they match the official Question Bank filters.
function names(items: TopicItem[]): string {
  return items.map((t) => t.label).join(", ");
}

function topicLink(item: TopicItem | undefined, subject: "math" | "rw", lang: Language) {
  if (item?.ref) {
    return { href: subject === "math" ? `/math/${item.ref}` : `/reading-writing/${item.ref}`, label: ph("Open lesson", lang) };
  }
  return { href: QBANK, label: ph("Open Question Bank", lang), external: true };
}

function split<T>(arr: T[]): [T[], T[]] {
  if (arr.length <= 1) return [arr, arr];
  const mid = Math.ceil(arr.length / 2);
  return [arr.slice(0, mid), arr.slice(mid)];
}

type GenBlock = Omit<PlanTask, "id" | "week" | "day" | "block">;

function generatedDay(w: WeekPlan, day: number, lang: Language): { title: string; blocks: GenBlock[] } {
  const g = (k: string, vars?: Record<string, string | number>) => tr(`planGen.${k}` as MsgKey, vars, lang);
  const [m1, m2] = split(w.math);
  const [r1, r2] = split(w.rw);
  const qbank = { href: QBANK, label: ph("Open Question Bank", lang), external: true };
  const errorBlock = (focus: string): GenBlock => ({
    kind: "review",
    title: g("errorBlock.title"),
    objective: g("errorBlock.objective"),
    assignment: g("errorBlock.assignment", { focus }),
    minutes: 45,
    link: { href: "/errors", label: ph("Open Error Notebook", lang) },
  });
  const lessonDay = (d: 1 | 2 | 3 | 4 | 5, math: TopicItem[], rw: TopicItem[], vars: Record<string, string>, links: { math: GenBlock["link"]; rw: GenBlock["link"]; timed: GenBlock["link"] }) => ({
    title: g(`d${d}.title`, vars),
    blocks: [
      { kind: "math" as const, title: g(`d${d}.mathTitle`, vars), objective: g(`d${d}.mathObj`, vars), assignment: g(`d${d}.mathAsg`, vars), minutes: 90, link: links.math },
      { kind: "rw" as const, title: g(`d${d}.rwTitle`, vars), objective: g(`d${d}.rwObj`, vars), assignment: g(`d${d}.rwAsg`, vars), minutes: 90, link: links.rw },
      { kind: "timed" as const, title: g("timedTitle"), objective: g(`d${d}.timedObj`, vars), assignment: g(`d${d}.timedAsg`, vars), minutes: 45, link: links.timed },
      errorBlock(g(`focus.d${d}`)),
    ],
  });
  switch (day) {
    case 1:
      return lessonDay(1, m1, r1, { math: names(m1), rw: names(r1), mathOne: m1[0]?.label ?? g("todayTopic"), rwOne: r1[0]?.label ?? g("todaySkill") },
        { math: topicLink(m1[0], "math", lang), rw: topicLink(r1[0], "rw", lang), timed: qbank });
    case 2:
      return lessonDay(2, m1, r1, { math: names(m1), rw: names(r1) }, { math: topicLink(m1[0], "math", lang), rw: qbank, timed: qbank });
    case 3:
      return lessonDay(3, m2, r2, { math: names(m2), rw: names(r2) }, { math: topicLink(m2[0], "math", lang), rw: topicLink(r2[0], "rw", lang), timed: qbank });
    case 4:
      return lessonDay(4, w.math, w.rw, { math: names(w.math), rw: names(w.rw) }, { math: qbank, rw: qbank, timed: { href: KHAN, label: ph("Open Khan Academy", lang), external: true } });
    case 5:
      return lessonDay(5, w.math, w.rw, {}, { math: topicLink(w.math[0], "math", lang), rw: topicLink(w.rw[0], "rw", lang), timed: qbank });
    case 6:
      return {
        title: g("d6.title"),
        blocks: [
          { kind: "timed", title: g("d6.assessTitle"), objective: g("d6.assessObj"), assignment: ph(w.assessment, lang), minutes: 90, link: qbank },
          { kind: "review", title: g("d6.analysisTitle"), objective: g("d6.analysisObj"), assignment: g("d6.analysisAsg"), minutes: 60, link: { href: "/errors", label: ph("Open Error Notebook", lang) } },
          { kind: "math", title: g("d6.mathTitle"), objective: g("d6.mathObj"), assignment: g("d6.mathAsg"), minutes: 60, link: topicLink(w.math[0], "math", lang) },
          { kind: "rw", title: g("d6.rwTitle"), objective: g("d6.rwObj"), assignment: g("d6.rwAsg"), minutes: 60, link: topicLink(w.rw[0], "rw", lang) },
        ],
      };
    default:
      return { title: g("rest.title"), blocks: [] };
  }
}

function localizeOverride(o: DayOverride, lang: Language): { title: string; blocks: GenBlock[] } {
  return {
    title: ph(o.title, lang),
    blocks: o.blocks.map((b) => ({ ...b, title: ph(b.title, lang), objective: ph(b.objective, lang), assignment: ph(b.assignment, lang), link: b.link ? { ...b.link, label: ph(b.link.label, lang) } : undefined })),
  };
}

function buildWeek(w: WeekPlan, lang: Language): PlanDay[] {
  const g = (k: string) => tr(`planGen.${k}` as MsgKey, undefined, lang);
  const days: PlanDay[] = [];
  for (let d = 1; d <= 7; d++) {
    const key = `w${w.week}-d${d}`;
    if (d === 7) {
      days.push({
        key, week: w.week, day: d, routine: routineLabel(7, lang), isRest: true,
        title: g("rest.title"),
        objective: g("rest.objective"),
        tasks: [{
          id: `${key}-b1`, week: w.week, day: d, block: 1, kind: "review", optional: true,
          title: g("rest.taskTitle"),
          objective: g("rest.taskObj"),
          assignment: g("rest.taskAsg"),
          minutes: 20, link: { href: "/vocabulary", label: ph("Open flashcards", lang) },
        }],
      });
      continue;
    }
    const override = w.days?.[d - 1];
    const src = override ? localizeOverride(override, lang) : generatedDay(w, d, lang);
    days.push({
      key, week: w.week, day: d, routine: routineLabel(d, lang), isRest: false,
      title: src.title,
      objective: src.blocks[0]?.objective ?? "",
      tasks: src.blocks.map((b, i) => ({ ...b, id: `${key}-b${i + 1}`, week: w.week, day: d, block: i + 1 })),
    });
  }
  return days;
}

const cache: Partial<Record<Language, Record<number, PlanDay[]>>> = {};
function weeksFor(lang: Language): Record<number, PlanDay[]> {
  return (cache[lang] ??= Object.fromEntries(CURRICULUM.map((w) => [w.week, buildWeek(w, lang)])));
}

/** The English plan: ids, minutes and links are the same in every language. */
export const PLAN_BY_WEEK: Record<number, PlanDay[]> = weeksFor("en");
export const PLAN: PlanDay[] = CURRICULUM.flatMap((w) => PLAN_BY_WEEK[w.week]);
export const ALL_TASKS: PlanTask[] = PLAN.flatMap((d) => d.tasks);
export const REQUIRED_TASKS = ALL_TASKS.filter((t) => !t.optional);

/** The days of a week, written in the given language. */
export function weekDays(week: number, lang: Language = currentLanguage()): PlanDay[] {
  return weeksFor(lang)[week] ?? [];
}

/** Week headline text (title, objectives, practice, assessment) in the given language. */
export function curriculumText(week: number, lang: Language = currentLanguage()) {
  const w = CURRICULUM[week - 1];
  return {
    monthTitle: ph(w.monthTitle, lang),
    title: ph(w.title, lang),
    objectives: w.objectives.map((s) => ph(s, lang)),
    practice: w.practice.map((s) => ph(s, lang)),
    assessment: ph(w.assessment, lang),
  };
}

export function monthTitle(month: number, lang: Language = currentLanguage()): string {
  return ph(CURRICULUM.find((c) => c.month === month)?.monthTitle ?? "", lang);
}

export function dayDate(startDate: string, week: number, day: number): string {
  return addDays(startDate, (week - 1) * 7 + (day - 1));
}

/** Where today falls in the plan. */
export function planPosition(startDate: string, today: string): { status: "before" | "active" | "after"; week: number; day: number; daysUntilStart: number } {
  const offset = diffDays(today, startDate);
  if (offset < 0) return { status: "before", week: 1, day: 1, daysUntilStart: -offset };
  const total = CURRICULUM.length * 7;
  if (offset >= total) return { status: "after", week: CURRICULUM.length, day: 7, daysUntilStart: 0 };
  return { status: "active", week: Math.floor(offset / 7) + 1, day: (offset % 7) + 1, daysUntilStart: 0 };
}

export function getDay(week: number, day: number, lang: Language = currentLanguage()): PlanDay | undefined {
  return weekDays(week, lang)[day - 1];
}

export interface Stats {
  done: number;
  total: number;
  pct: number;
  minutesDone: number;
  minutesTotal: number;
}

export function taskStats(tasks: PlanTask[], completed: AppState["completedTasks"]): Stats {
  const req = tasks.filter((t) => !t.optional);
  const doneTasks = req.filter((t) => completed[t.id]);
  const minutesTotal = req.reduce((s, t) => s + t.minutes, 0);
  const minutesDone = doneTasks.reduce((s, t) => s + t.minutes, 0);
  return { done: doneTasks.length, total: req.length, pct: req.length ? Math.round((doneTasks.length / req.length) * 100) : 0, minutesDone, minutesTotal };
}

export function weekStats(week: number, state: AppState): Stats {
  return taskStats((PLAN_BY_WEEK[week] ?? []).flatMap((d) => d.tasks), state.completedTasks);
}

export function subjectStats(subject: "math" | "rw", state: AppState): Stats {
  return taskStats(REQUIRED_TASKS.filter((t) => t.kind === subject), state.completedTasks);
}
