"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Coffee, Minus, Pause, Play, Plus, Square, X } from "lucide-react";
import { cx } from "@/components/ui";
import { uid, useStore } from "@/lib/store";
import { SESSION_KINDS, elapsedMs, formatClock } from "@/lib/timer";
import type { SessionKind } from "@/lib/types";
import { useT } from "@/i18n/useT";

/** Start/pause/finish logic shared by the dashboard card and the Timer page. */
export function useTimerControls() {
  const { state, update } = useStore();
  const timer = state.timer;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!timer?.startedAt) return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [timer?.startedAt]);

  return {
    timer,
    elapsed: elapsedMs(timer, now),
    start: (kind: SessionKind, mode: "focus" | "break", minutes: number) => {
      update((s) => ({ ...s, timer: { kind, mode, targetMinutes: minutes, startedAt: Date.now(), accumulatedMs: 0 } }));
      setNow(Date.now());
    },
    pause: () => update((s) => (s.timer ? { ...s, timer: { ...s.timer, accumulatedMs: elapsedMs(s.timer, Date.now()), startedAt: null } } : s)),
    resume: () => update((s) => (s.timer ? { ...s, timer: { ...s.timer, startedAt: Date.now() } } : s)),
    discard: () => update((s) => ({ ...s, timer: null })),
    /** Logs focus time (never break time). Sessions under 1 minute are dropped. */
    finish: () =>
      update((s) => {
        if (!s.timer) return s;
        const minutes = Math.round(elapsedMs(s.timer, Date.now()) / 60_000);
        if (s.timer.mode === "break" || minutes < 1) return { ...s, timer: null };
        return { ...s, timer: null, sessions: [{ id: uid(), date: new Date().toISOString(), minutes, kind: s.timer.kind, source: "timer" }, ...s.sessions] };
      }),
  };
}

function Hourglass({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 64" className={className} aria-hidden>
      <rect x="6" y="2" width="36" height="6" rx="3" fill="#2f9e5b" />
      <rect x="6" y="56" width="36" height="6" rx="3" fill="#2f9e5b" />
      <path d="M11 8h26c0 10-8 16-11 24 3 8 11 14 11 24H11c0-10 8-16 11-24-3-8-11-14-11-24z" fill="#ffffff" fillOpacity="0.75" stroke="#2f9e5b" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M16 14h16c-1.5 5-5 8-8 12-3-4-6.5-7-8-12z" fill="#4cc27a" />
      <path d="M14 54c1-6 6-9 10-11 4 2 9 5 10 11z" fill="#4cc27a" />
      <path d="M24 30v12" stroke="#4cc27a" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 3" />
    </svg>
  );
}

export function PomodoroCard({ className, large }: { className?: string; large?: boolean }) {
  const { timer, elapsed, start, pause, resume, finish, discard } = useTimerControls();
  const { t } = useT();
  const [kind, setKind] = useState<SessionKind>("math");
  const [minutes, setMinutes] = useState(25);
  const remaining = timer ? Math.max(0, timer.targetMinutes * 60_000 - elapsed) : minutes * 60_000;
  const over = timer && elapsed >= timer.targetMinutes * 60_000;

  return (
    <section aria-labelledby="pomo-h" className={cx("relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[var(--pomo-a)] via-[var(--pomo-b)] to-[var(--pomo-c)] p-5 shadow-soft", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="pomo-h" className="text-lg font-extrabold text-[#3b2410] dark:text-[#fff3e6]">{t("timer.pomodoro")}</h2>
          {timer ? (
            <p className="mt-0.5 text-sm font-semibold text-[#5c3a1c] dark:text-[#ffe0c6]">{timer.mode === "break" ? t("timer.breakNotCounted") : SESSION_KINDS.find((k) => k.value === timer.kind)?.short}</p>
          ) : (
            <select value={kind} onChange={(e) => setKind(e.target.value as SessionKind)} aria-label={t("timer.whatStudying")} className="mt-1 -ml-1 rounded-full bg-white/40 px-2 py-0.5 text-sm font-bold text-[#5c3a1c] focus:outline-none dark:bg-black/20 dark:text-[#ffe0c6]">
              {SESSION_KINDS.map((k) => (
                <option key={k.value} value={k.value}>{k.short}</option>
              ))}
            </select>
          )}
        </div>
        {!large && <Link href="/timer" className="rounded-full bg-white/40 px-3 py-1 text-xs font-bold text-[#5c3a1c] hover:bg-white/60 dark:bg-black/20 dark:text-[#ffe0c6]">{t("common.action.open")}</Link>}
      </div>

      <div className="mt-2 flex flex-col items-center">
        <Hourglass className={large ? "h-32 w-24" : "h-20 w-16"} />
        <div className="mt-3 flex items-center gap-3">
          {!timer && (
            <button type="button" onClick={() => setMinutes((m) => Math.max(5, m - 5))} aria-label={t("timer.lessMin")} className="grid h-8 w-8 place-items-center rounded-full bg-white/50 text-[#5c3a1c] hover:bg-white/70 dark:bg-black/20 dark:text-[#ffe0c6]">
              <Minus className="h-4 w-4" />
            </button>
          )}
          <p className={cx("min-w-[96px] text-center font-mono font-bold tabular-nums text-[#3b2410] dark:text-[#fff3e6]", large ? "text-5xl" : "text-3xl")} aria-live="off"><span>
            {over ? `+${formatClock(elapsed - timer!.targetMinutes * 60_000)}` : formatClock(remaining)}
          </span></p>
          {!timer && (
            <button type="button" onClick={() => setMinutes((m) => Math.min(180, m + 5))} aria-label={t("timer.moreMin")} className="grid h-8 w-8 place-items-center rounded-full bg-white/50 text-[#5c3a1c] hover:bg-white/70 dark:bg-black/20 dark:text-[#ffe0c6]">
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
        {large && !timer && (
          <div className="mt-4 flex flex-wrap justify-center gap-1.5" role="radiogroup" aria-label={t("timer.blockLength")}>
            {[25, 45, 60, 90].map((m) => (
              <button key={m} type="button" role="radio" aria-checked={minutes === m} onClick={() => setMinutes(m)} className={cx("rounded-full px-3 py-1 text-xs font-extrabold", minutes === m ? "bg-[#3b2410] text-white" : "bg-white/50 text-[#5c3a1c] dark:bg-black/20 dark:text-[#ffe0c6]")}>
                {t("common.minutesShort", { n: m })}
              </button>
            ))}
          </div>
        )}
        <div className="mt-4 flex w-full max-w-[300px] gap-2">
          {!timer ? (
            <button type="button" onClick={() => start(kind, "focus", minutes)} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-white text-sm font-extrabold text-[#3b2410] shadow-sm hover:bg-white/90">
              <Play className="h-4 w-4" /> {t("common.action.start")}
            </button>
          ) : null}
          {!timer && large && (
            <button type="button" onClick={() => start(kind, "break", 10)} className="flex h-10 items-center justify-center gap-1.5 rounded-full bg-white/50 px-4 text-sm font-extrabold text-[#5c3a1c] dark:bg-black/20 dark:text-[#ffe0c6]">
              <Coffee className="h-4 w-4" /> {t("timer.break")}
            </button>
          )}
          {timer ? (
            <>
              {timer.startedAt ? (
                <button type="button" onClick={pause} className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-white text-sm font-extrabold text-[#3b2410]"><Pause className="h-4 w-4" /> {t("common.action.pause")}</button>
              ) : (
                <button type="button" onClick={resume} className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-white text-sm font-extrabold text-[#3b2410]"><Play className="h-4 w-4" /> {t("common.action.resume")}</button>
              )}
              <button type="button" onClick={finish} title={timer.mode === "break" ? t("timer.endBreak") : t("timer.finishTitle")} className="flex h-10 items-center justify-center gap-1.5 rounded-full bg-[#3b2410] px-4 text-sm font-extrabold text-white"><Square className="h-3.5 w-3.5" /> {timer.mode === "break" ? t("common.action.end") : t("common.action.finish")}</button>
              <button type="button" onClick={discard} aria-label={t("timer.discardTimer")} className="grid h-10 w-10 place-items-center rounded-full bg-white/50 text-[#5c3a1c] dark:bg-black/20 dark:text-[#ffe0c6]"><X className="h-4 w-4" /></button>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
