"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarDays, Database, GraduationCap, MonitorPlay, NotebookPen, Send, Target, Trophy } from "lucide-react";
import { Card, Checkbox, EmptyState, LinkButton, ProgressRing, cx } from "@/components/ui";
import { ActivityChart } from "@/components/charts";
import { PomodoroCard } from "@/components/PomodoroCard";
import { useTaskToggle } from "@/components/TaskRow";
import { uid, useStore } from "@/lib/store";
import { useT } from "@/i18n/useT";
import { formatDateObj } from "@/lib/date";
import { curriculumText } from "@/lib/plan";
import { REQUIRED_TASKS, getDay, planPosition, taskStats } from "@/lib/plan";
import { diffDays, formatDate, formatMinutes, fromKey, isoToKey, toKey, todayKey } from "@/lib/date";
import { latestOfficial, minutesByDay } from "@/lib/metrics";

const KIND = {
  math: { label: "common.kind.math", dot: "bg-primary" },
  rw: { label: "common.kind.rw", dot: "bg-rose" },
  timed: { label: "common.kind.timed", dot: "bg-warn" },
  review: { label: "common.kind.review", dot: "bg-chart1" },
  custom: { label: "common.kind.custom", dot: "bg-muted" },
} as const;

function useToday() {
  const { state } = useStore();
  const today = todayKey();
  const pos = planPosition(state.settings.planStartDate, today);
  const day = pos.status === "active" ? getDay(pos.week, pos.day) : undefined;
  const dayKey = day?.key ?? `date-${today}`;
  const planTasks = day?.tasks ?? [];
  const custom = state.customTasks[dayKey] ?? [];
  const items = [
    ...planTasks.map((p) => ({ id: p.id, title: p.title, minutes: p.minutes, kind: p.kind as keyof typeof KIND, optional: p.optional })),
    ...custom.map((c) => ({ id: c.id, title: c.title, minutes: c.minutes, kind: "custom" as const, optional: false })),
  ];
  const done = items.filter((i) => state.completedTasks[i.id]).length;
  return { today, pos, day, dayKey, items, done };
}

function greetingKey(): "goodMorning" | "goodAfternoon" | "goodEvening" {
  const h = new Date().getHours();
  return h < 12 ? "goodMorning" : h < 18 ? "goodAfternoon" : "goodEvening";
}

function MiniCalendar({ today, exam, start }: { today: string; exam: string | null; start: string }) {
  const { t } = useT();
  const d = fromKey(today);
  // Monday-first narrow weekday letters in the current language (2024-01-01 was a Monday)
  const letters = Array.from({ length: 7 }, (_, i) => formatDateObj(new Date(2024, 0, 1 + i), { weekday: "narrow" }));
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7; // Monday first
  const daysIn = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const cells: (string | null)[] = [...Array(offset).fill(null), ...Array.from({ length: daysIn }, (_, i) => toKey(new Date(d.getFullYear(), d.getMonth(), i + 1)))];
  return (
    <div className="rounded-[20px] bg-white/45 p-3 backdrop-blur-md dark:bg-black/25">
      <p className="mb-1.5 text-center text-xs font-extrabold text-[#5c3a1c] dark:text-[#ffe0c6]">{formatDateObj(d, { month: "long", year: "numeric" })}</p>
      <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-bold text-[#7a5232] dark:text-[#f3c9a8]">
        {letters.map((w, i) => <span key={i} className="py-0.5">{w}</span>)}
        {cells.map((c, i) =>
          c ? (
            <span
              key={c}
              title={c === exam ? t("dashboard.satDay") : c === start ? t("dashboard.planStarts") : undefined}
              className={cx(
                "grid h-6 place-items-center rounded-full text-[11px] tabular-nums",
                c === today ? "bg-[#f2762f] font-extrabold text-white" : c === exam ? "bg-[#2f9e5b] font-extrabold text-white" : c === start ? "ring-2 ring-[#f2762f]" : "text-[#3b2410] dark:text-[#fff3e6]",
              )}
            >
              {Number(c.slice(-2))}
            </span>
          ) : (
            <span key={`e${i}`} />
          ),
        )}
      </div>
    </div>
  );
}

function GreetingBanner() {
  const { state } = useStore();
  const { today, pos, items, done } = useToday();
  const left = items.filter((i) => !i.optional).length - items.filter((i) => !i.optional && state.completedTasks[i.id]).length;
  const { t, tn } = useT();
  let line: string;
  if (pos.status === "before") line = t("dashboard.lineBefore", { date: formatDate(state.settings.planStartDate, { weekday: "long", month: "short", day: "numeric" }) });
  else if (pos.status === "after") line = t("dashboard.lineAfter");
  else if (items.length === 0 || (left <= 0 && done > 0)) line = t("dashboard.lineDone");
  else line = tn("dashboard.lineLeft", left);

  return (
    <section className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#ffd8b0] via-[#ffb98f] to-[#ff9c8c] p-5 shadow-soft dark:from-[#5a3520] dark:via-[#5a2f25] dark:to-[#4a2430] sm:p-6">
      {/* Simple sunrise scene */}
      <svg aria-hidden viewBox="0 0 400 160" preserveAspectRatio="xMidYMax slice" className="pointer-events-none absolute inset-0 h-full w-full opacity-90">
        <circle cx="120" cy="112" r="34" fill="#fff4c9" opacity="0.85" />
        <path d="M0 130 Q60 100 120 122 T240 116 T400 120 V160 H0Z" fill="#ff9f73" opacity="0.55" />
        <path d="M0 145 Q80 122 170 140 T400 136 V160 H0Z" fill="#f2762f" opacity="0.35" />
        <g fill="#ffffff" opacity="0.5">
          <ellipse cx="60" cy="40" rx="26" ry="7" />
          <ellipse cx="210" cy="28" rx="20" ry="5" />
        </g>
      </svg>
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-sm">
          <p className="text-xs font-extrabold uppercase tracking-wider text-[#7a5232] dark:text-[#f3c9a8]">{t(`dashboard.${greetingKey()}`)}</p>
          <h1 className="mt-0.5 text-2xl font-extrabold text-[#3b2410] dark:text-[#fff3e6] sm:text-[28px]">{t("dashboard.welcome")}</h1>
          <p className="mt-1 text-sm font-semibold text-[#5c3a1c] dark:text-[#ffe0c6]">{line}</p>
          <p className="mt-3 text-xs font-bold text-[#7a5232] dark:text-[#f3c9a8]">{t("dashboard.headline")}</p>
          <Link href="/plan" className="mt-4 inline-flex h-10 items-center rounded-full bg-white px-6 text-sm font-extrabold text-[#3b2410] shadow-sm hover:bg-white/90">
            {t("dashboard.ready")}
          </Link>
        </div>
        <div className="w-full sm:w-[230px]">
          <MiniCalendar today={today} exam={state.settings.examDate} start={state.settings.planStartDate} />
        </div>
      </div>
    </section>
  );
}

function TodayTasks() {
  const { state, update } = useStore();
  const toggle = useTaskToggle();
  const { pos, day, items, done } = useToday();
  const { t } = useT();
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-extrabold">{t("dashboard.todayTasks")}</h2>
        {items.length > 0 && <span className="rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-extrabold text-success">{done}/{items.length}</span>}
      </div>
      {pos.status === "before" && (
        <div className="mb-3 rounded-2xl bg-subtle px-3 py-3 text-xs font-semibold text-ink-soft">
          <p>{t("dashboard.startsAsk", { date: formatDate(state.settings.planStartDate, { weekday: "long", month: "short", day: "numeric" }) })}</p>
          <button type="button" onClick={() => update((s) => ({ ...s, settings: { ...s.settings, planStartDate: todayKey() } }))} className="mt-2 rounded-full bg-primary-strong px-4 py-1.5 text-xs font-extrabold text-white dark:text-[#1b1512]">
            {t("dashboard.startNow")}
          </button>
        </div>
      )}
      {day?.isRest && <p className="mb-3 rounded-2xl bg-subtle px-3 py-2 text-xs font-semibold text-ink-soft">{t("dashboard.restDay")}</p>}
      {items.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted">{t("dashboard.noTasks")}</p>
      ) : (
        <ul className="divide-y divide-line">
          {items.map((i) => {
            const isDone = Boolean(state.completedTasks[i.id]);
            return (
              <li key={i.id} className="flex items-center gap-3 py-3">
                <Checkbox checked={isDone} onChange={(v) => toggle(i.id, v)} label={t(isDone ? "common.markNotDone" : "common.markDone", { title: i.title })} />
                <div className="min-w-0 flex-1">
                  <p className={cx("truncate text-sm font-bold", isDone ? "text-muted line-through" : "text-ink")}>{i.title}</p>
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                    <span className={cx("h-1.5 w-1.5 rounded-full", KIND[i.kind].dot)} />
                    {t(KIND[i.kind].label)}
                    {i.optional && ` · ${t("common.optionalLower")}`}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-bold text-muted">{formatMinutes(i.minutes)}</span>
                {i.kind === "custom" && (
                  <button
                    type="button"
                    aria-label={t("dashboard.deleteTask", { title: i.title })}
                    onClick={() => update((s) => ({ ...s, customTasks: Object.fromEntries(Object.entries(s.customTasks).map(([k, v]) => [k, v.filter((x) => x.id !== i.id)])) }))}
                    className="text-xs font-bold text-muted hover:text-danger"
                  >
                    ✕
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {day && (
        <Link href={`/plan?week=${day.week}#${day.key}`} className="mt-2 inline-block text-xs font-bold text-primary-strong hover:underline">
          {t("dashboard.seeDetails")}
        </Link>
      )}
    </Card>
  );
}

function QuickAdd() {
  const { update } = useStore();
  const { dayKey } = useToday();
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState(30);
  const [err, setErr] = useState("");
  const { t } = useT();
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 3) return setErr(t("dashboard.tooShort"));
    update((s) => ({ ...s, customTasks: { ...s.customTasks, [dayKey]: [...(s.customTasks[dayKey] ?? []), { id: `c-${uid()}`, title: title.trim(), minutes }] } }));
    setTitle("");
    setErr("");
  };
  return (
    <form onSubmit={add} className="rounded-[22px] border border-white/60 bg-card p-2 shadow-soft dark:border-line" noValidate>
      <div className="flex items-center gap-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("dashboard.addPlaceholder")} aria-label={t("dashboard.addLabel")} maxLength={140} className="h-10 min-w-0 flex-1 rounded-full bg-subtle px-4 text-sm font-semibold text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40" />
        <select value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} aria-label={t("dashboard.minutes")} className="h-10 rounded-full bg-subtle px-3 text-xs font-bold text-ink-soft focus:outline-none">
          {[15, 30, 45, 60, 90].map((m) => <option key={m} value={m}>{t("common.minutesShort", { n: m })}</option>)}
        </select>
        <button type="submit" aria-label={t("dashboard.addTask")} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-chart1 text-white hover:brightness-110 dark:text-[#1b1512]">
          <Send className="h-4 w-4" />
        </button>
      </div>
      {err && <p className="px-3 pt-1 text-xs text-danger">{err}</p>}
    </form>
  );
}

function WeeklyChartCard() {
  const { state } = useStore();
  const activity = minutesByDay(state, 7);
  const total = activity.reduce((s, d) => s + d.minutes, 0);
  const { t } = useT();
  return (
    <Card className="p-5">
      <h2 className="text-base font-extrabold">{t("dashboard.weeklyTitle")}</h2>
      <p className="text-xs font-semibold text-muted">{t("dashboard.weeklySub", { time: formatMinutes(total) })}</p>
      {total === 0 ? (
        <div className="mt-3 rounded-2xl bg-subtle px-4 py-6 text-center text-xs font-semibold text-muted">{t("dashboard.weeklyEmpty")}</div>
      ) : (
        <ActivityChart data={activity} goal={state.settings.dailyGoalMinutes} height={170} />
      )}
    </Card>
  );
}

function TodayRing() {
  const { state } = useStore();
  const { today, items, done } = useToday();
  const req = items.filter((i) => !i.optional);
  const reqDone = req.filter((i) => state.completedTasks[i.id]).length;
  const pct = req.length ? Math.round((reqDone / req.length) * 100) : items.length ? Math.round((done / items.length) * 100) : 0;
  const focused = state.sessions.filter((s) => isoToKey(s.date) === today).reduce((a, s) => a + s.minutes, 0);
  const { t } = useT();
  return (
    <Card className="flex flex-col p-5">
      <h2 className="text-base font-extrabold">{t("dashboard.ringTitle")}</h2>
      <p className="text-xs font-semibold text-muted">{t("dashboard.ringSub")}</p>
      <div className="flex flex-1 flex-col items-center justify-center py-3">
        <ProgressRing value={pct} size={128} stroke={13} tone="success">
          <span className="text-2xl font-extrabold text-ink">{pct}%</span>
        </ProgressRing>
        <p className="mt-3 flex items-center gap-1.5 text-xs font-bold text-ink-soft">
          <span className="h-2 w-2 rounded-full bg-chart1" /> {t("dashboard.focusedToday", { time: formatMinutes(focused) })}
        </p>
      </div>
    </Card>
  );
}

function JourneyCard() {
  const { state } = useStore();
  const { today, pos } = useToday();
  const overall = taskStats(REQUIRED_TASKS, state.completedTasks);
  const exam = state.settings.examDate;
  const days = exam ? diffDays(exam, today) : null;
  const latest = latestOfficial(state);
  const { t, tn } = useT();
  const stats = [
    { label: t("dashboard.target"), value: "1400+", sub: latest ? t("dashboard.latest", { n: latest.total ?? "—" }) : t("dashboard.noScore"), icon: Target, tone: "bg-primary-soft text-primary-strong" },
    { label: t("dashboard.daysTo"), value: days == null ? "—" : String(days), sub: days == null ? <Link href="/settings" className="font-bold text-primary-strong underline">{t("dashboard.setExam")}</Link> : formatDate(exam!, { month: "short", day: "numeric" }), icon: CalendarDays, tone: "bg-rose-soft text-rose" },
    { label: t("dashboard.currentWeek"), value: pos.status === "active" ? `${pos.week}/20` : pos.status === "before" ? t("dashboard.soon") : t("dashboard.done"), sub: pos.status === "active" ? curriculumText(pos.week).title : pos.status === "before" ? t("dashboard.startsIn", { days: tn("common.days", pos.daysUntilStart) }) : t("dashboard.allWeeks"), icon: Trophy, tone: "bg-warn-soft text-warn" },
    { label: t("dashboard.planDone"), value: `${overall.pct}%`, sub: t("dashboard.ofTasks", { done: overall.done, total: overall.total }), icon: CalendarDays, tone: "bg-success-soft text-success" },
  ];
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-extrabold">{t("dashboard.journeyTitle")}</h2>
        <Link href="/progress" className="text-xs font-bold text-primary-strong hover:underline">{t("dashboard.progressLink")}</Link>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-subtle p-3">
            <span className={cx("grid h-8 w-8 place-items-center rounded-xl", s.tone)}>
              <s.icon className="h-4 w-4" />
            </span>
            <p className="mt-2 text-xl font-extrabold text-ink">{s.value}</p>
            <p className="text-xs font-bold text-ink-soft">{s.label}</p>
            <p className="mt-0.5 truncate text-[11px] text-muted">{s.sub}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function QuickLinks() {
  const { t } = useT();
  const links = [
    { href: "https://bluebook.collegeboard.org/students/practice", label: "Bluebook", note: t("dashboard.bluebookNote"), icon: MonitorPlay, tone: "bg-[#e7f0ff] text-[#2f5fb3]", external: true },
    { href: "https://satsuitequestionbank.collegeboard.org/", label: t("dashboard.qbank"), note: t("dashboard.qbankNote"), icon: Database, tone: "bg-success-soft text-success", external: true },
    { href: "https://www.khanacademy.org/digital-sat", label: "Khan Academy", note: t("dashboard.khanNote"), icon: GraduationCap, tone: "bg-primary-soft text-primary-strong", external: true },
    { href: "/errors", label: t("dashboard.mistakes"), note: t("dashboard.mistakesNote"), icon: NotebookPen, tone: "bg-rose-soft text-rose", external: false },
  ];
  return (
    <Card className="p-5">
      <h2 className="mb-3 text-base font-extrabold">{t("dashboard.linksTitle")}</h2>
      <div className="grid grid-cols-4 gap-2">
        {links.map((l) => {
          const inner = (
            <>
              <span className={cx("grid h-12 w-12 place-items-center rounded-2xl transition-transform group-hover:-translate-y-0.5", l.tone)}>
                <l.icon className="h-5 w-5" />
              </span>
              <span className="mt-1.5 text-center text-[11px] font-extrabold leading-tight text-ink">
                {l.label}
                {l.external && <span className="sr-only"> {t("common.newTab")}</span>}
              </span>
              <span className="text-center text-[10px] text-muted">{l.note}</span>
            </>
          );
          return l.external ? (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center">{inner}</a>
          ) : (
            <Link key={l.href} href={l.href} className="group flex flex-col items-center">{inner}</Link>
          );
        })}
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { pos } = useToday();
  const { t } = useT();
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="min-w-0 space-y-5 lg:col-span-2">
        <GreetingBanner />
        <div className="space-y-5 lg:hidden">
          <TodayTasks />
          <QuickAdd />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <WeeklyChartCard />
          <TodayRing />
        </div>
        <JourneyCard />
        {pos.status === "after" && <EmptyState icon={<Trophy className="h-5 w-5" />} title={t("dashboard.finishedTitle")} body={t("dashboard.finishedBody")} action={<LinkButton href="/progress" variant="secondary">{t("dashboard.openProgress")}</LinkButton>} />}
      </div>
      <div className="min-w-0 space-y-5">
        <div className="hidden space-y-5 lg:block">
          <TodayTasks />
          <QuickAdd />
        </div>
        <PomodoroCard />
        <QuickLinks />
        <p className="px-2 text-center text-xs font-semibold italic text-ink-soft">{t("dashboard.motto")}</p>
      </div>
    </div>
  );
}

