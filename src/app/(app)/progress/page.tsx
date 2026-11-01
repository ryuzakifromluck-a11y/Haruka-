"use client";

import { useState } from "react";
import { BookCheck, CalendarCheck, ClipboardList, Clock, Flame, LineChart as LineIcon, Pencil, Plus, Target, Trash2 } from "lucide-react";
import { Badge, Button, Card, CardHeader, EmptyState, Field, Input, Modal, PageHeader, ProgressBar, Segmented, Select, StatTile, Textarea } from "@/components/ui";
import { ScoreChart, WeeklyTasksChart, type ScorePoint } from "@/components/charts";
import { useStore, uid } from "@/lib/store";
import { REQUIRED_TASKS, taskStats, weekStats } from "@/lib/plan";
import { activeDays, allExerciseStats, currentStreak, isOfficial, mathDomainMastery, rwDomainMastery, sortedTests, totalFocusMinutes } from "@/lib/metrics";
import { addDays, formatDate, formatHours, isValidDateKey, todayKey } from "@/lib/date";
import { PROVIDERS, PROVIDER_BY_ID } from "@/data/resources";
import type { TestRecord } from "@/lib/types";
import { useT } from "@/i18n/useT";
import type { MsgKey } from "@/i18n";

interface FormState {
  date: string;
  provider: string;
  testName: string;
  total: string;
  math: string;
  rw: string;
  notes: string;
  weakTopics: string;
}

function toForm(t?: TestRecord): FormState {
  return t
    ? { date: t.date, provider: t.provider, testName: t.testName ?? "", total: t.total?.toString() ?? "", math: t.math?.toString() ?? "", rw: t.rw?.toString() ?? "", notes: t.notes, weakTopics: t.weakTopics.join(", ") }
    : { date: todayKey(), provider: "bluebook", testName: "", total: "", math: "", rw: "", notes: "", weakTopics: "" };
}

function validScore(v: string, min: number, max: number): number | null | "invalid" {
  if (!v.trim()) return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max || n % 10 !== 0) return "invalid";
  return n;
}

function TestForm({ initial, onSave, onCancel }: { initial?: TestRecord; onSave: (t: TestRecord) => void; onCancel: () => void }) {
  const [f, setF] = useState<FormState>(toForm(initial));
  const { t } = useT();
  const [err, setErr] = useState<Record<string, string>>({});
  const set = (k: keyof FormState, v: string) => setF((x) => ({ ...x, [k]: v }));
  const official = PROVIDER_BY_ID[f.provider]?.official;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    const m = (k: MsgKey, v?: Record<string, number>) => t(k, v);
    if (!isValidDateKey(f.date)) er.date = m("progress.form.errDate");
    else if (f.date > todayKey()) er.date = m("progress.form.errFuture");
    if (!PROVIDER_BY_ID[f.provider]) er.provider = m("progress.form.errProvider");
    const total = validScore(f.total, 400, 1600);
    const math = validScore(f.math, 200, 800);
    const rw = validScore(f.rw, 200, 800);
    if (total === "invalid") er.total = m("progress.form.errTotal");
    if (math === "invalid") er.math = m("progress.form.errMath");
    if (rw === "invalid") er.rw = m("progress.form.errRw");
    let finalTotal = total;
    if (!er.total && !er.math && !er.rw) {
      if (total == null && (math == null || rw == null)) er.total = m("progress.form.errMissing");
      if (typeof total === "number" && typeof math === "number" && typeof rw === "number" && math + rw !== total) er.total = m("progress.form.errSum", { sum: math + rw });
      if (total == null && typeof math === "number" && typeof rw === "number") finalTotal = math + rw; // exact sum of reported sections
    }
    const weak = f.weakTopics.split(",").map((s) => s.trim()).filter(Boolean);
    if (weak.length > 10) er.weakTopics = m("progress.form.errWeak");
    setErr(er);
    if (Object.keys(er).length) return;
    onSave({ id: initial?.id ?? uid(), date: f.date, provider: f.provider, testName: f.testName.trim() || undefined, total: finalTotal as number | null, math: math as number | null, rw: rw as number | null, notes: f.notes.trim(), weakTopics: weak });
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("progress.form.date")} htmlFor="t-date" error={err.date}>
          <Input id="t-date" type="date" value={f.date} max={todayKey()} onChange={(e) => set("date", e.target.value)} invalid={Boolean(err.date)} />
        </Field>
        <Field label={t("progress.form.provider")} htmlFor="t-prov" error={err.provider}>
          <Select id="t-prov" value={f.provider} onChange={(e) => set("provider", e.target.value)}>
            {PROVIDERS.map((p) => <option key={p.id} value={p.id}>{p.name}{p.official ? "" : t("progress.form.unofficialSuffix")}</option>)}
          </Select>
        </Field>
      </div>
      <p className={official ? "rounded-xl bg-primary-soft px-4 py-2.5 text-xs text-ink-soft" : "rounded-xl bg-warn-soft px-4 py-2.5 text-xs text-ink-soft"}>
        {official ? t("progress.form.officialNote") : t("progress.form.thirdNote")}
      </p>
      <Field label={t("progress.form.name")} htmlFor="t-name">
        <Input id="t-name" value={f.testName} onChange={(e) => set("testName", e.target.value)} placeholder={t("progress.form.namePh")} maxLength={80} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={t("progress.form.total")} htmlFor="t-total" error={err.total} hint="400–1600">
          <Input id="t-total" type="number" inputMode="numeric" step={10} value={f.total} onChange={(e) => set("total", e.target.value)} invalid={Boolean(err.total)} />
        </Field>
        <Field label={t("progress.math")} htmlFor="t-math" error={err.math} hint="200–800">
          <Input id="t-math" type="number" inputMode="numeric" step={10} value={f.math} onChange={(e) => set("math", e.target.value)} invalid={Boolean(err.math)} />
        </Field>
        <Field label={t("progress.rwFull")} htmlFor="t-rw" error={err.rw} hint="200–800">
          <Input id="t-rw" type="number" inputMode="numeric" step={10} value={f.rw} onChange={(e) => set("rw", e.target.value)} invalid={Boolean(err.rw)} />
        </Field>
      </div>
      <Field label={t("progress.form.weak")} htmlFor="t-weak" error={err.weakTopics} hint={t("progress.form.weakHint")}>
        <Input id="t-weak" value={f.weakTopics} onChange={(e) => set("weakTopics", e.target.value)} invalid={Boolean(err.weakTopics)} />
      </Field>
      <Field label={t("progress.form.notes")} htmlFor="t-notes">
        <Textarea id="t-notes" value={f.notes} onChange={(e) => set("notes", e.target.value)} placeholder={t("progress.form.notesPh")} maxLength={2000} />
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={onCancel}>{t("common.action.cancel")}</Button>
        <Button type="submit">{t("progress.form.save")}</Button>
      </div>
    </form>
  );
}

function DomainBars({ title, rows, tone }: { title: string; rows: { id: string; title: string; pct: number; correct: number; total: number }[]; tone: "primary" | "rose" }) {
  const { t } = useT();
  return (
    <Card>
      <CardHeader title={title} subtitle={t("progress.masterySub")} />
      <div className="space-y-4 px-5 pb-6 pt-4 sm:px-6">
        {rows.map((r) => (
          <div key={r.id}>
            <div className="mb-1 flex justify-between text-sm"><span className="text-ink-soft">{r.title}</span><span className="tabular-nums text-muted">{r.correct}/{r.total} · {r.pct}%</span></div>
            <ProgressBar value={r.pct} tone={tone} label={t("progress.masteryOf", { title: r.title })} />
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function ProgressPage() {
  const { state, update } = useStore();
  const { t } = useT();
  const [modal, setModal] = useState<{ open: boolean; edit?: TestRecord }>({ open: false });
  const [field, setField] = useState<"total" | "math" | "rw">("total");
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const focusMin = totalFocusMinutes(state);
  const lessons = taskStats(REQUIRED_TASKS, state.completedTasks);
  const ex = allExerciseStats(state);
  const days = activeDays(state);
  const last7 = Array.from({ length: 7 }, (_, i) => addDays(todayKey(), -i)).filter((d) => days.has(d)).length;
  const streak = currentStreak(state);
  const tests = sortedTests(state);
  const weekly = Array.from({ length: 20 }, (_, i) => ({ week: i + 1, pct: weekStats(i + 1, state).pct }));

  const points: ScorePoint[] = tests
    .map((t) => ({ t, v: t[field] }))
    .filter((x) => x.v != null)
    .map(({ t, v }) => ({ date: t.date, official: isOfficial(t) ? v : null, unofficial: isOfficial(t) ? null : v, provider: PROVIDER_BY_ID[t.provider]?.name ?? t.provider }));

  const save = (t: TestRecord) => {
    update((s) => ({ ...s, tests: s.tests.some((x) => x.id === t.id) ? s.tests.map((x) => (x.id === t.id ? t : x)) : [...s.tests, t] }));
    setModal({ open: false });
  };

  return (
    <div>
      <PageHeader eyebrow={t("progress.eyebrow")} title={t("progress.title")} description={t("progress.description")} action={<Button onClick={() => setModal({ open: true })}><Plus className="h-4 w-4" /> {t("progress.addResult")}</Button>} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label={t("progress.focusedHours")} value={formatHours(focusMin)} sub={t("progress.focusedSub")} icon={<Clock className="h-4 w-4" />} />
        <StatTile label={t("progress.lessons")} value={`${lessons.done}`} sub={t("progress.lessonsSub", { total: lessons.total, pct: lessons.pct })} icon={<BookCheck className="h-4 w-4" />} />
        <StatTile label={t("progress.exercises")} value={`${ex.correct}`} sub={t("progress.exercisesSub", { attempted: ex.attempted, total: ex.total })} icon={<Target className="h-4 w-4" />} />
        <StatTile label={t("progress.consistency")} value={`${last7}/7`} sub={streak ? t("progress.consistencyStreak", { n: streak }) : t("progress.consistencyNo")} icon={streak ? <Flame className="h-4 w-4" /> : <CalendarCheck className="h-4 w-4" />} />
      </div>

      <Card className="mt-6">
        <CardHeader icon={<LineIcon className="h-4 w-4" />} title={t("progress.scoreTitle")} subtitle={t("progress.scoreSub")} action={<Segmented size="sm" value={field} onChange={setField} options={[{ value: "total", label: t("progress.total") }, { value: "math", label: t("progress.math") }, { value: "rw", label: t("progress.rw") }]} />} />
        <div className="px-4 pb-6 pt-4 sm:px-6">
          {points.length === 0 ? (
            <EmptyState icon={<LineIcon className="h-5 w-5" />} title={t("progress.noScores")} body={t("progress.noScoresBody")} action={<Button variant="secondary" onClick={() => setModal({ open: true })}><Plus className="h-4 w-4" /> {t("progress.addResult")}</Button>} />
          ) : (
            <ScoreChart data={points} field={field === "total" ? t("progress.total") : field === "math" ? t("progress.math") : t("progress.rwFull")} target={field === "total" ? 1400 : undefined} range={field === "total" ? [400, 1600] : [200, 800]} />
          )}
          {field !== "total" && points.length > 0 && <p className="mt-2 text-xs text-muted">{t("progress.sectionNote")}</p>}
        </div>
      </Card>

      <Card className="mt-6">
        <CardHeader icon={<ClipboardList className="h-4 w-4" />} title={t("progress.history")} />
        <div className="px-5 pb-6 pt-4 sm:px-6">
          {tests.length === 0 ? (
            <p className="text-sm text-muted">{t("progress.noHistory")}</p>
          ) : (
            <div className="-mx-2 overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                    <th className="px-2 py-2 font-semibold">{t("progress.date")}</th>
                    <th className="px-2 py-2 font-semibold">{t("progress.provider")}</th>
                    <th className="px-2 py-2 text-right font-semibold">{t("progress.total")}</th>
                    <th className="px-2 py-2 text-right font-semibold">{t("progress.math")}</th>
                    <th className="px-2 py-2 text-right font-semibold">{t("progress.rw")}</th>
                    <th className="px-2 py-2 font-semibold">{t("progress.weakest")}</th>
                    <th className="px-2 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {[...tests].reverse().map((rec) => (
                    <tr key={rec.id} className="border-b border-line align-top last:border-0">
                      <td className="whitespace-nowrap px-2 py-3">{formatDate(rec.date)}</td>
                      <td className="px-2 py-3">
                        <p className="font-medium text-ink">{PROVIDER_BY_ID[rec.provider]?.name ?? rec.provider}</p>
                        {rec.testName && <p className="text-xs text-muted">{rec.testName}</p>}
                        <Badge tone={isOfficial(rec) ? "primary" : "warn"} className="mt-1">{isOfficial(rec) ? t("progress.officialPractice") : t("common.unofficial")}</Badge>
                        {rec.notes && <p className="mt-1 max-w-xs text-xs text-muted">{rec.notes}</p>}
                      </td>
                      <td className="px-2 py-3 text-right font-serif text-lg font-semibold tabular-nums">{rec.total ?? "—"}</td>
                      <td className="px-2 py-3 text-right tabular-nums">{rec.math ?? "—"}</td>
                      <td className="px-2 py-3 text-right tabular-nums">{rec.rw ?? "—"}</td>
                      <td className="px-2 py-3">
                        <div className="flex max-w-[220px] flex-wrap gap-1">{rec.weakTopics.length ? rec.weakTopics.map((w) => <Badge key={w}>{w}</Badge>) : <span className="text-muted">—</span>}</div>
                      </td>
                      <td className="whitespace-nowrap px-2 py-3 text-right">
                        {confirmDel === rec.id ? (
                          <span className="inline-flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => setConfirmDel(null)}>{t("common.action.cancel")}</Button>
                            <Button size="sm" variant="danger" onClick={() => { update((s) => ({ ...s, tests: s.tests.filter((x) => x.id !== rec.id) })); setConfirmDel(null); }}>{t("common.action.delete")}</Button>
                          </span>
                        ) : (
                          <span className="inline-flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => setModal({ open: true, edit: rec })} aria-label={t("progress.editLabel")}><Pencil className="h-4 w-4" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => setConfirmDel(rec.id)} aria-label={t("progress.deleteLabel")}><Trash2 className="h-4 w-4" /></Button>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <DomainBars title={t("progress.mathMastery")} rows={mathDomainMastery(state)} tone="primary" />
        <DomainBars title={t("progress.rwMastery")} rows={rwDomainMastery(state)} tone="rose" />
      </div>

      <Card className="mt-6">
        <CardHeader icon={<CalendarCheck className="h-4 w-4" />} title={t("progress.weeklyTitle")} subtitle={t("progress.weeklySub")} />
        <div className="px-3 pb-5 pt-4 sm:px-5">
          {lessons.done === 0 ? <p className="px-2 text-sm text-muted">{t("progress.weeklyEmpty")}</p> : <WeeklyTasksChart data={weekly} />}
        </div>
      </Card>

      <Modal open={modal.open} onClose={() => setModal({ open: false })} title={modal.edit ? t("progress.editResult") : t("progress.addResult")} wide>
        <TestForm key={modal.edit?.id ?? "new"} initial={modal.edit} onSave={save} onCancel={() => setModal({ open: false })} />
      </Modal>
    </div>
  );
}
