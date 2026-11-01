"use client";

import { useState } from "react";
import { History, Plus, Trash2 } from "lucide-react";
import { Button, Card, CardHeader, EmptyState, Field, Input, PageHeader, ProgressBar, Select } from "@/components/ui";
import { useStore, uid } from "@/lib/store";
import { SESSION_KINDS } from "@/lib/timer";
import { PomodoroCard } from "@/components/PomodoroCard";
import { formatDate, formatMinutes, isValidDateKey, isoToKey, todayKey } from "@/lib/date";
import type { SessionKind } from "@/lib/types";
import { useT } from "@/i18n/useT";
import type { MsgKey } from "@/i18n";

const KINDS = SESSION_KINDS;
const kindLabel = (kind: SessionKind) => KINDS.find((k) => k.value === kind)?.label ?? kind;

function ManualLog() {
  const { update } = useStore();
  const { t } = useT();
  const [date, setDate] = useState(todayKey());
  const [minutes, setMinutes] = useState("");
  const [kind, setKind] = useState<SessionKind>("math");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, MsgKey>>({});
  const [ok, setOk] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, MsgKey> = {};
    const m = Number(minutes);
    if (!isValidDateKey(date)) errs.date = "timer.errDate";
    else if (date > todayKey()) errs.date = "timer.errFuture";
    if (!minutes || !Number.isFinite(m) || m < 1 || m > 600) errs.minutes = "timer.errMinutes";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const [y, mo, d] = date.split("-").map(Number);
    const at = new Date(y, mo - 1, d, 12).toISOString();
    update((s) => ({ ...s, sessions: [{ id: uid(), date: at, minutes: Math.round(m), kind, note: note.trim() || undefined, source: "manual" }, ...s.sessions] }));
    setMinutes("");
    setNote("");
    setOk(true);
    setTimeout(() => setOk(false), 2500);
  };

  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={t("timer.date")} htmlFor="ml-date" error={errors.date && t(errors.date)}>
          <Input id="ml-date" type="date" value={date} max={todayKey()} onChange={(e) => setDate(e.target.value)} invalid={Boolean(errors.date)} />
        </Field>
        <Field label={t("timer.focusedMinutes")} htmlFor="ml-min" error={errors.minutes && t(errors.minutes)} hint={t("timer.excludeBreaks")}>
          <Input id="ml-min" type="number" min={1} max={600} value={minutes} onChange={(e) => setMinutes(e.target.value)} invalid={Boolean(errors.minutes)} />
        </Field>
      </div>
      <Field label={t("timer.activity")} htmlFor="ml-kind">
        <Select id="ml-kind" value={kind} onChange={(e) => setKind(e.target.value as SessionKind)}>
          {KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
        </Select>
      </Field>
      <Field label={t("timer.note")} htmlFor="ml-note">
        <Input id="ml-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={140} placeholder={t("timer.notePh")} />
      </Field>
      <div className="flex items-center gap-3">
        <Button type="submit"><Plus className="h-4 w-4" /> {t("timer.log")}</Button>
        {ok && <span className="text-sm text-success">{t("timer.logged")}</span>}
      </div>
    </form>
  );
}

export default function TimerPage() {
  const { state, update } = useStore();
  const { t } = useT();
  const today = todayKey();
  const todayMin = state.sessions.filter((s) => isoToKey(s.date) === today).reduce((a, s) => a + s.minutes, 0);
  const goal = state.settings.dailyGoalMinutes;
  const recent = state.sessions.slice(0, 15);
  const remove = (id: string) => update((s) => ({ ...s, sessions: s.sessions.filter((x) => x.id !== id) }));

  return (
    <div>
      <PageHeader title={t("timer.title")} description={t("timer.description")} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <PomodoroCard large className="min-w-0 p-6 sm:p-8 lg:col-span-3" />
        <div className="min-w-0 space-y-5 lg:col-span-2">
          <Card className="p-5">
            <p className="text-sm font-bold text-ink-soft">{t("timer.focusedToday")}</p>
            <p className="mt-1 text-3xl font-extrabold">{formatMinutes(todayMin)}</p>
            <p className="mb-3 text-xs text-muted">{t("timer.dailyGoal", { time: formatMinutes(goal) })}</p>
            <ProgressBar value={(todayMin / goal) * 100} tone="success" label={t("timer.goalProgress")} />
          </Card>
          <Card>
            <CardHeader title={t("timer.addTitle")} subtitle={t("timer.addSub")} />
            <div className="px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
              <ManualLog />
            </div>
          </Card>
        </div>
      </div>

      <Card className="mt-5">
        <CardHeader icon={<History className="h-4 w-4" />} title={t("timer.recent")} />
        <div className="px-5 pb-5 pt-4 sm:px-6">
          {recent.length === 0 ? (
            <EmptyState icon={<History className="h-5 w-5" />} title={t("timer.emptyTitle")} body={t("timer.emptyBody")} />
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((s) => (
                <li key={s.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">{kindLabel(s.kind)}</p>
                    <p className="truncate text-xs text-muted">{formatDate(isoToKey(s.date))} · {s.source === "timer" ? t("timer.viaTimer") : t("timer.byHand")}{s.note ? ` · ${s.note}` : ""}</p>
                  </div>
                  <span className="text-sm font-extrabold tabular-nums">{formatMinutes(s.minutes)}</span>
                  <Button variant="ghost" size="sm" onClick={() => remove(s.id)} aria-label={t("timer.deleteSession")}><Trash2 className="h-4 w-4" /></Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
}
