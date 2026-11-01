import { currentLanguage, intlLocale, tr } from "@/i18n";
// Date helpers that work on local calendar dates (YYYY-MM-DD) to avoid timezone drift.

export function toKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function todayKey(): string {
  return toKey(new Date());
}

export function addDays(key: string, n: number): string {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
}

export function diffDays(a: string, b: string): number {
  // a - b in whole days
  const ms = fromKey(a).getTime() - fromKey(b).getTime();
  return Math.round(ms / 86_400_000);
}

export function isValidDateKey(key: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return false;
  const d = fromKey(key);
  return toKey(d) === key;
}

/** Monday on or after the given date. */
export function nextMonday(key: string): string {
  const d = fromKey(key);
  const dow = d.getDay(); // 0 Sun .. 6 Sat
  const delta = dow === 1 ? 0 : (8 - dow) % 7;
  return addDays(key, delta);
}

/** Locale used for dates; follows the interface language. */
export function dateLocale(): string {
  return intlLocale(currentLanguage());
}

// Many browsers ship without Uzbek month names (they print "M11"), so Uzbek dates are built by hand.
const UZ_MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
const UZ_MONTHS_SHORT = ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sen", "okt", "noy", "dek"];
const UZ_DAYS = ["yakshanba", "dushanba", "seshanba", "chorshanba", "payshanba", "juma", "shanba"];
const UZ_DAYS_SHORT = ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"];
const UZ_DAYS_NARROW = ["Y", "D", "S", "C", "P", "J", "S"];

function formatUz(d: Date, o: Intl.DateTimeFormatOptions): string {
  const parts: string[] = [];
  const wd = o.weekday === "long" ? UZ_DAYS[d.getDay()] : o.weekday === "short" ? UZ_DAYS_SHORT[d.getDay()] : o.weekday === "narrow" ? UZ_DAYS_NARROW[d.getDay()] : "";
  const m = d.getMonth();
  const monthName = o.month === "long" ? UZ_MONTHS[m] : o.month === "short" ? UZ_MONTHS_SHORT[m] : o.month ? String(m + 1).padStart(2, "0") : "";
  let core = "";
  if (o.day && monthName && o.month !== "numeric" && o.month !== "2-digit") core = `${d.getDate()}-${monthName}`;
  else if (o.day && monthName) core = `${String(d.getDate()).padStart(2, "0")}.${monthName}`;
  else if (o.day) core = String(d.getDate());
  else if (monthName) core = monthName;
  if (o.year) core = core ? (o.day ? `${core}, ${d.getFullYear()}` : `${core} ${d.getFullYear()}`) : String(d.getFullYear());
  if (wd) parts.push(wd);
  if (core) parts.push(core);
  return parts.join(", ");
}

/** Formats a Date in the interface language. */
export function formatDateObj(d: Date, opts: Intl.DateTimeFormatOptions): string {
  const lang = currentLanguage();
  if (lang === "uz") return formatUz(d, opts);
  // Russian short months end with a dot ("нояб."), which clashes with sentence punctuation; use the full form.
  const o = lang === "ru" && opts.month === "short" && opts.day ? { ...opts, month: "long" as const } : opts;
  return d.toLocaleDateString(dateLocale(), o);
}

export function formatDate(key: string, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }): string {
  if (!key) return "";
  return formatDateObj(fromKey(key), opts);
}

export function weekdayName(key: string, style: "long" | "short" = "long"): string {
  return formatDateObj(fromKey(key), { weekday: style });
}

export function formatMinutes(min: number): string {
  const m = Math.round(min);
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return tr("common.duration.min", { n: r });
  if (r === 0) return tr("common.duration.h", { n: h });
  return tr("common.duration.hm", { h, m: r });
}

export function formatHours(min: number): string {
  return (min / 60).toFixed(min >= 600 ? 0 : 1);
}

export function isoToKey(iso: string): string {
  return toKey(new Date(iso));
}
