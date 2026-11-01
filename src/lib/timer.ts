import { tr } from "@/i18n";
import type { ActiveTimer, SessionKind } from "@/lib/types";

export function elapsedMs(t: ActiveTimer | null, now: number): number {
  if (!t) return 0;
  return t.accumulatedMs + (t.startedAt ? Math.max(0, now - t.startedAt) : 0);
}

export function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}


const kindEntry = (value: SessionKind, key: "math" | "rw" | "timed" | "review" | "otherStudy", minutes: number) => ({
  value,
  minutes,
  /** Labels follow the current interface language. */
  get label() { return tr(`common.session.${key}.label`); },
  get short() { return tr(`common.session.${key}.short`); },
});

export const SESSION_KINDS: { value: SessionKind; readonly label: string; readonly short: string; minutes: number }[] = [
  kindEntry("math", "math", 90),
  kindEntry("rw", "rw", 90),
  kindEntry("timed", "timed", 45),
  kindEntry("review", "review", 45),
  kindEntry("other", "otherStudy", 25),
];
