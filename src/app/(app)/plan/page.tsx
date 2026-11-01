"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight, ClipboardCheck, Clock, Plus, Target, Trash2, BookOpen, Sigma, Moon } from "lucide-react";
import { Badge, Button, Card, Checkbox, Input, PageHeader, ProgressBar, cx } from "@/components/ui";
import { TaskRow, useTaskToggle } from "@/components/TaskRow";
import { useStore, uid } from "@/lib/store";
import { CURRICULUM } from "@/data/curriculum";
import { useT } from "@/i18n/useT";
import { curriculumText, monthTitle, weekDays, dayDate, planPosition, taskStats, weekStats, type PlanDay } from "@/lib/plan";
import { formatDate, formatMinutes, todayKey, weekdayName } from "@/lib/date";

function CustomTasks({ day }: { day: PlanDay }) {
  const { state, update } = useStore();
  const { t: tt } = useT();
  const toggle = useTaskToggle();
  const tasks = state.customTasks[day.key] ?? [];
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState("30");
  const [err, setErr] = useState("");

  const add = () => {
    const m = Number(minutes);
    if (title.trim().length < 3) return setErr(tt("plan.errTitle"));
    if (!Number.isFinite(m) || m < 5 || m > 300) return setErr(tt("plan.errMinutes"));
    update((s) => ({ ...s, customTasks: { ...s.customTasks, [day.key]: [...(s.customTasks[day.key] ?? []), { id: `c-${uid()}`, title: title.trim(), minutes: Math.round(m) }] } }));
    setTitle("");
    setMinutes("30");
    setErr("");
    setAdding(false);
  };
  const remove = (id: string) =>
    update((s) => {
      const completedTasks = { ...s.completedTasks };
      delete completedTasks[id];
      return { ...s, completedTasks, customTasks: { ...s.customTasks, [day.key]: (s.customTasks[day.key] ?? []).filter((t) => t.id !== id) } };
    });

  return (
    <div className="mt-3 space-y-2">
      {tasks.map((t) => {
        const done = Boolean(state.completedTasks[t.id]);
        return (
          <div key={t.id} className="flex items-center gap-3 rounded-xl border border-dashed border-line-strong p-3">
            <Checkbox checked={done} onChange={(v) => toggle(t.id, v)} label={tt("common.markDone", { title: t.title })} />
            <div className="min-w-0 flex-1">
              <p className={cx("text-sm font-medium", done && "text-muted line-through")}>{t.title}</p>
              <p className="text-xs text-muted">{tt("plan.personal", { time: formatMinutes(t.minutes) })}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => remove(t.id)} aria-label={tt("plan.deleteTask", { title: t.title })}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      })}
      {adding ? (
        <div className="rounded-xl border border-line bg-subtle/60 p-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input placeholder={tt("plan.taskPh")} value={title} onChange={(e) => setTitle(e.target.value)} invalid={Boolean(err) && title.trim().length < 3} aria-label={tt("plan.taskDesc")} maxLength={140} />
            <Input type="number" min={5} max={300} value={minutes} onChange={(e) => setMinutes(e.target.value)} className="sm:w-28" aria-label={tt("plan.minutes")} />
          </div>
          {err && <p className="mt-1.5 text-xs text-danger">{err}</p>}
          <div className="mt-2 flex gap-2">
            <Button size="sm" onClick={add}>{tt("plan.addTask")}</Button>
            <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setErr(""); }}>{tt("common.action.cancel")}</Button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-strong hover:underline">
          <Plus className="h-3.5 w-3.5" /> {tt("plan.addPersonal")}
        </button>
      )}
    </div>
  );
}

function DayCard({ day, isToday, defaultOpen }: { day: PlanDay; isToday: boolean; defaultOpen: boolean }) {
  const { state } = useStore();
  const { t } = useT();
  const [open, setOpen] = useState(defaultOpen);
  const date = dayDate(state.settings.planStartDate, day.week, day.day);
  const s = taskStats(day.tasks, state.completedTasks);
  useEffect(() => setOpen(defaultOpen), [defaultOpen]);
  return (
    <Card as="article" id={day.key} className={cx("scroll-mt-24 overflow-hidden", isToday && "ring-2 ring-primary/40")}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-4 px-5 py-4 text-left sm:px-6" aria-expanded={open}>
        <div className={cx("grid h-12 w-12 shrink-0 place-items-center rounded-xl text-center", isToday ? "bg-primary-strong text-white dark:text-[#1b1512]" : "bg-subtle text-ink")}>
          <div>
            <p className="text-[10px] font-semibold uppercase leading-none">{weekdayName(date, "short")}</p>
            <p className="font-serif text-lg font-semibold leading-tight">{formatDate(date, { day: "numeric" })}</p>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-medium text-muted">{t("plan.dayRoutine", { n: day.day, routine: day.routine })}</p>
            {isToday && <Badge tone="primary">{t("plan.today")}</Badge>}
            {s.total > 0 && s.done === s.total && <Badge tone="success">{t("plan.complete")}</Badge>}
          </div>
          <p className="mt-0.5 truncate font-serif text-lg font-semibold text-ink">{day.title}</p>
          <div className="mt-1.5 flex items-center gap-3">
            {day.isRest ? (
              <span className="inline-flex items-center gap-1 text-xs text-muted"><Moon className="h-3 w-3" /> {t("plan.recovery")}</span>
            ) : (
              <>
                <ProgressBar value={s.pct} className="max-w-[160px]" label={t("plan.dayProgress", { n: day.day })} />
                <span className="whitespace-nowrap text-xs tabular-nums text-muted">{s.done}/{s.total} · {formatMinutes(s.minutesTotal)}</span>
              </>
            )}
          </div>
        </div>
        <ChevronDown className={cx("h-5 w-5 shrink-0 text-muted transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="border-t border-line px-5 pb-5 pt-4 sm:px-6">
          <p className="mb-3 text-sm text-ink-soft">
            <span className="font-medium text-ink">{t("plan.objective")}</span>
            {day.objective}
          </p>
          {!day.isRest && <p className="mb-3 text-xs text-muted">{t("plan.breakHint")}</p>}
          <div className="space-y-2.5">
            {day.tasks.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </div>
          <CustomTasks day={day} />
        </div>
      )}
    </Card>
  );
}

function PlanInner() {
  const { state } = useStore();
  const { t, lang } = useT();
  const params = useSearchParams();
  const router = useRouter();
  const today = todayKey();
  const pos = planPosition(state.settings.planStartDate, today);
  const paramWeek = Number(params.get("week"));
  const week = paramWeek >= 1 && paramWeek <= 20 ? paramWeek : pos.week;
  const w = CURRICULUM[week - 1];
  const wt = curriculumText(week, lang);
  const ws = weekStats(week, state);
  const days = weekDays(week, lang);
  const setWeek = (n: number) => router.replace(`/plan?week=${n}`, { scroll: false });

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }, [week]);

  const months = [1, 2, 3, 4, 5].map((m) => ({ m, title: monthTitle(m, lang), weeks: CURRICULUM.filter((c) => c.month === m) }));

  return (
    <div>
      <PageHeader eyebrow={t("plan.eyebrow")} title={t("plan.title")} description={t("plan.description")} />

      {/* Week selector */}
      <Card className="mb-6 p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {months.map(({ m, title, weeks }) => (
            <div key={m}>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{t("plan.month", { n: m })}</p>
              <p className="mb-2 hidden text-xs text-ink-soft md:block">{title}</p>
              <div className="flex flex-wrap gap-1.5">
                {weeks.map((wk) => {
                  const st = weekStats(wk.week, state);
                  const active = wk.week === week;
                  const current = pos.status === "active" && wk.week === pos.week;
                  return (
                    <button
                      key={wk.week}
                      type="button"
                      onClick={() => setWeek(wk.week)}
                      aria-pressed={active}
                      title={t("plan.weekTitle", { n: wk.week, title: curriculumText(wk.week, lang).title, pct: st.pct })}
                      className={cx(
                        "relative h-9 w-9 rounded-lg text-sm font-medium tabular-nums transition-colors",
                        active ? "bg-primary-strong text-white dark:text-[#1b1512]" : st.pct === 100 ? "bg-success-soft text-success" : "bg-subtle text-ink-soft hover:bg-primary-soft",
                      )}
                    >
                      {wk.week}
                      {current && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-rose" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Week overview */}
      <Card className="mb-6 p-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{t("plan.weekMonth", { week, month: w.month, title: wt.monthTitle })}</p>
            <h2 className="mt-1 font-serif text-3xl font-semibold">{wt.title}</h2>
            <p className="mt-1 text-sm text-muted">
              {formatDate(dayDate(state.settings.planStartDate, week, 1), { month: "short", day: "numeric" })} – {formatDate(dayDate(state.settings.planStartDate, week, 7), { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" disabled={week <= 1} onClick={() => setWeek(week - 1)} aria-label={t("plan.prevWeek")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="sm" disabled={week >= 20} onClick={() => setWeek(week + 1)} aria-label={t("plan.nextWeek")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <ProgressBar value={ws.pct} className="max-w-sm" label={t("plan.weekProgress")} />
          <span className="whitespace-nowrap text-sm tabular-nums text-ink-soft">{ws.done}/{ws.total} · {ws.pct}%</span>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><Target className="h-4 w-4 text-primary" /> {t("plan.objectives")}</h3>
            <ul className="space-y-1.5 text-sm text-ink-soft">
              {wt.objectives.map((o) => (
                <li key={o} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />{o}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><Sigma className="h-4 w-4 text-primary" /> {t("plan.mathTopics")}</h3>
              <div className="flex flex-wrap gap-1.5">{w.math.map((m) => <Badge key={m.label} tone="primary">{m.label}</Badge>)}</div>
            </div>
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><BookOpen className="h-4 w-4 text-rose" /> {t("plan.rwTopics")}</h3>
              <div className="flex flex-wrap gap-1.5">{w.rw.map((m) => <Badge key={m.label} tone="rose">{m.label}</Badge>)}</div>
            </div>
            {lang !== "en" && <p className="text-xs text-muted">{t("plan.topicNote")}</p>}
          </div>
          <div>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><Clock className="h-4 w-4 text-primary" /> {t("plan.practice")}</h3>
            <ul className="space-y-1.5 text-sm text-ink-soft">
              {wt.practice.map((p) => (
                <li key={p} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-rose" />{p}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><ClipboardCheck className="h-4 w-4 text-primary" /> {t("plan.assessment")}</h3>
            <p className="text-sm text-ink-soft">{wt.assessment}</p>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {days.map((d) => {
          const isToday = pos.status === "active" && d.week === pos.week && d.day === pos.day;
          return <DayCard key={d.key} day={d} isToday={isToday} defaultOpen={isToday || (pos.week !== week && d.day === 1) || (pos.status === "before" && week === 1 && d.day === 1)} />;
        })}
      </div>
    </div>
  );
}

export default function PlanPage() {
  return (
    <Suspense>
      <PlanInner />
    </Suspense>
  );
}
