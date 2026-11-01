"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CalendarDays, Download, LogOut, Moon, RotateCcw, ShieldCheck, ShieldAlert, Sun, Monitor, Upload, Clock } from "lucide-react";
import { Button, Card, CardHeader, Field, Input, Modal, PageHeader, Segmented, Toggle } from "@/components/ui";
import { defaultState, normalizeState, useStore } from "@/lib/store";
import { addDays, diffDays, formatDate, formatMinutes, isValidDateKey, todayKey } from "@/lib/date";
import type { AppState, Language, ThemePref } from "@/lib/types";
import { useT } from "@/i18n/useT";
import { LANGUAGES, type MsgKey } from "@/i18n";

function Row({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{title}</p>
        {desc && <p className="text-xs text-muted">{desc}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { state, update, replace, mode, userEmail } = useStore();
  const s = state.settings;
  const { t, setLanguage } = useT();
  const [exam, setExam] = useState(s.examDate ?? "");
  const [start, setStart] = useState(s.planStartDate);
  const [goal, setGoal] = useState(String(s.dailyGoalMinutes));
  const [errors, setErrors] = useState<Record<string, MsgKey>>({});
  const [saved, setSaved] = useState(false);
  const [perm, setPerm] = useState<string>("default");
  const [resetOpen, setResetOpen] = useState(false);
  const [resetText, setResetText] = useState("");
  const [importMsg, setImportMsg] = useState<MsgKey | "">("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPerm(typeof Notification === "undefined" ? "unsupported" : Notification.permission);
  }, []);

  const setSetting = <K extends keyof AppState["settings"]>(k: K, v: AppState["settings"][K]) => update((st) => ({ ...st, settings: { ...st.settings, [k]: v } }));
  const setNotif = (k: keyof AppState["settings"]["notifications"], v: boolean | string) => update((st) => ({ ...st, settings: { ...st.settings, notifications: { ...st.settings.notifications, [k]: v } } }));

  const saveDates = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, MsgKey> = {};
    if (exam && !isValidDateKey(exam)) er.exam = "settings.errDate";
    else if (exam && diffDays(exam, todayKey()) < 0) er.exam = "settings.errExamPast";
    if (!isValidDateKey(start)) er.start = "settings.errDate";
    else if (exam && isValidDateKey(exam) && diffDays(exam, start) < 0) er.start = "settings.errStart";
    const g = Number(goal);
    if (!Number.isInteger(g) || g < 30 || g > 600) er.goal = "settings.errGoal";
    setErrors(er);
    if (Object.keys(er).length) return;
    update((st) => ({ ...st, settings: { ...st.settings, examDate: exam || null, planStartDate: start, dailyGoalMinutes: g } }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const requestPermission = async (key: "dailyReminder" | "timerAlerts" | "weeklyReview", v: boolean) => {
    if (v && typeof Notification !== "undefined" && Notification.permission === "default") {
      const p = await Notification.requestPermission();
      setPerm(p);
    }
    setNotif(key, v);
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `haruka-sat-journey-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (file: File) => {
    try {
      if (file.size > 5_000_000) throw new Error("File too large");
      const data = JSON.parse(await file.text());
      if (!data || typeof data !== "object" || data.version !== 1 || !data.settings) throw new Error("Not a backup file");
      replace(normalizeState(data));
      setImportMsg("settings.restored");
    } catch {
      setImportMsg("settings.restoreBad");
    }
  };

  const doReset = () => {
    const fresh = defaultState();
    // Keep preferences; clear progress.
    replace({ ...fresh, settings: { ...state.settings }, pet: state.pet });
    setResetOpen(false);
    setResetText("");
  };

  const suggestedExam = addDays(start, 20 * 7 - 2);

  return (
    <div className="max-w-3xl">
      <PageHeader eyebrow={t("settings.eyebrow")} title={t("settings.title")} />

      <Card className="mb-6">
        <CardHeader icon={<CalendarDays className="h-4 w-4" />} title={t("settings.examPlan")} />
        <form onSubmit={saveDates} className="space-y-4 px-5 pb-6 pt-4 sm:px-6" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("settings.examDate")} htmlFor="s-exam" error={errors.exam && t(errors.exam)} hint={exam ? formatDate(exam, { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : t("settings.examNotSet", { date: formatDate(suggestedExam) })}>
              <Input id="s-exam" type="date" value={exam} min={todayKey()} onChange={(e) => setExam(e.target.value)} invalid={Boolean(errors.exam)} />
            </Field>
            <Field label={t("settings.startDate")} htmlFor="s-start" error={errors.start && t(errors.start)} hint={t("settings.startHint")}>
              <Input id="s-start" type="date" value={start} onChange={(e) => setStart(e.target.value)} invalid={Boolean(errors.start)} />
            </Field>
          </div>
          <Field label={t("settings.goal")} htmlFor="s-goal" error={errors.goal && t(errors.goal)} hint={t("settings.goalHint", { time: formatMinutes(Number(goal) || 0) })}>
            <Input id="s-goal" type="number" min={30} max={600} value={goal} onChange={(e) => setGoal(e.target.value)} className="sm:w-40" invalid={Boolean(errors.goal)} />
          </Field>
          <div className="flex items-center gap-3">
            <Button type="submit">{t("common.action.saveChanges")}</Button>
            {saved && <span className="text-sm text-success">{t("settings.saved")}</span>}
          </div>
        </form>
      </Card>

      <Card className="mb-6">
        <CardHeader icon={<Sun className="h-4 w-4" />} title={t("settings.appearance")} />
        <div className="divide-y divide-line px-5 pb-2 sm:px-6">
          <Row title={t("settings.theme")} desc={t("settings.themeDesc")}>
            <Segmented<ThemePref> value={s.theme} onChange={(v) => setSetting("theme", v)} options={[{ value: "light", label: <span className="flex items-center gap-1"><Sun className="h-3.5 w-3.5" />{t("settings.light")}</span> }, { value: "dark", label: <span className="flex items-center gap-1"><Moon className="h-3.5 w-3.5" />{t("settings.dark")}</span> }, { value: "system", label: <span className="flex items-center gap-1"><Monitor className="h-3.5 w-3.5" />{t("settings.system")}</span> }]} />
          </Row>
          <Row title={t("settings.language")} desc={t("settings.languageDesc")}>
            <Segmented<Language> value={s.language} onChange={setLanguage} options={LANGUAGES.map((l) => ({ value: l.id, label: <span lang={l.id}>{l.label}</span> }))} />
          </Row>
          <Row title={t("settings.uzVocab")} desc={t("settings.uzVocabDesc")}>
            <Toggle checked={s.showUzbek} onChange={(v) => setSetting("showUzbek", v)} label={t("settings.showUz")} />
          </Row>
        </div>
      </Card>

      <Card className="mb-6">
        <CardHeader icon={<Bell className="h-4 w-4" />} title={t("settings.notifications")} subtitle={t("settings.notificationsSub")} />
        <div className="divide-y divide-line px-5 pb-2 sm:px-6">
          {perm === "denied" && <p className="py-3 text-xs text-danger">{t("settings.blocked")}</p>}
          {perm === "unsupported" && <p className="py-3 text-xs text-muted">{t("settings.unsupported")}</p>}
          <Row title={t("settings.daily")} desc={t("settings.dailyDesc")}>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-muted" />
                <Input type="time" value={s.notifications.reminderTime} onChange={(e) => e.target.value && setNotif("reminderTime", e.target.value)} className="h-9 w-28" aria-label={t("settings.reminderTime")} />
              </span>
              <Toggle checked={s.notifications.dailyReminder} onChange={(v) => requestPermission("dailyReminder", v)} label={t("settings.daily")} />
            </div>
          </Row>
          <Row title={t("settings.timerAlerts")} desc={t("settings.timerAlertsDesc")}>
            <Toggle checked={s.notifications.timerAlerts} onChange={(v) => requestPermission("timerAlerts", v)} label={t("settings.timerAlerts")} />
          </Row>
          <Row title={t("settings.weekly")} desc={t("settings.weeklyDesc")}>
            <Toggle checked={s.notifications.weeklyReview} onChange={(v) => requestPermission("weeklyReview", v)} label={t("settings.weekly")} />
          </Row>
        </div>
      </Card>

      <Card className="mb-6">
        <CardHeader icon={mode === "cloud" ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />} title={t("settings.account")} />
        <div className="divide-y divide-line px-5 pb-2 sm:px-6">
          {mode === "cloud" ? (
            <Row title={t("settings.signedInAs", { email: userEmail ?? "Haruka" })} desc={t("settings.signedInDesc")}>
              <form action="/auth/signout" method="post">
                <Button type="submit" variant="secondary" size="sm"><LogOut className="h-4 w-4" /> {t("nav.signOut")}</Button>
              </form>
            </Row>
          ) : (
            <Row title={t("settings.localMode")} desc={t("settings.localDesc")}>
              <span className="text-xs text-warn">{t("settings.notPrivate")}</span>
            </Row>
          )}
          <Row title={t("settings.export")} desc={t("settings.exportDesc")}>
            <Button variant="secondary" size="sm" onClick={exportData}><Download className="h-4 w-4" /> {t("settings.exportBtn")}</Button>
          </Row>
          <Row title={t("settings.restore")} desc={importMsg ? t(importMsg) : t("settings.restoreDesc")}>
            <>
              <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void importData(f); e.target.value = ""; }} />
              <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" /> {t("settings.restoreBtn")}</Button>
            </>
          </Row>
          <Row title={t("settings.reset")} desc={t("settings.resetDesc")}>
            <Button variant="danger" size="sm" onClick={() => setResetOpen(true)}><RotateCcw className="h-4 w-4" /> {t("settings.resetBtn")}</Button>
          </Row>
        </div>
      </Card>

      <Modal open={resetOpen} onClose={() => setResetOpen(false)} title={t("settings.resetTitle")}>
        <p className="text-sm text-ink-soft">{t("settings.resetBody")}</p>
        <Field label={t("settings.resetConfirm")} htmlFor="reset-confirm">
          <Input id="reset-confirm" value={resetText} onChange={(e) => setResetText(e.target.value)} autoComplete="off" />
        </Field>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setResetOpen(false)}>{t("common.action.cancel")}</Button>
          <Button variant="danger" disabled={resetText !== "RESET"} onClick={doReset}>{t("settings.reset")}</Button>
        </div>
      </Modal>
    </div>
  );
}
