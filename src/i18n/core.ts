/**
 * Central translation system (English, Uzbek, Russian).
 *
 * - Every namespace lives in ./messages/<ns>.ts with en, uz and ru side by side;
 *   the `ns()` helper makes TypeScript reject a missing or extra key.
 * - Test material (questions, passages, answer choices, explanations, lessons,
 *   vocabulary examples) is NOT routed through here and stays in English.
 */
export type Language = "en" | "uz" | "ru";

export const LANGUAGES: { id: Language; label: string; short: string; intl: string }[] = [
  { id: "en", label: "English", short: "EN", intl: "en-US" },
  { id: "uz", label: "O‘zbekcha", short: "UZ", intl: "uz-Latn-UZ" },
  { id: "ru", label: "Русский", short: "RU", intl: "ru-RU" },
];

export function isLanguage(v: unknown): v is Language {
  return v === "en" || v === "uz" || v === "ru";
}

export function intlLocale(lang: Language): string {
  return LANGUAGES.find((l) => l.id === lang)?.intl ?? "en-US";
}

export type Plural = { one?: string; few?: string; many?: string; other: string };
export type Widen<T> = T extends string ? string : T extends { other: string } ? Plural : { [K in keyof T]: Widen<T[K]> };

/** Declare a namespace: uz and ru must have exactly the same keys as en. */
export function ns<T>(en: T, uz: Widen<T>, ru: Widen<T>): Record<Language, Widen<T>> {
  return { en: en as unknown as Widen<T>, uz, ru };
}

export type Vars = Record<string, string | number>;

export function interpolate(s: string, vars?: Vars): string {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

const rulesCache = new Map<Language, Intl.PluralRules>();
export function pluralForm(p: Plural, n: number, lang: Language): string {
  let r = rulesCache.get(lang);
  if (!r) {
    r = new Intl.PluralRules(intlLocale(lang));
    rulesCache.set(lang, r);
  }
  const cat = r.select(n) as keyof Plural;
  return p[cat] ?? p.other;
}

// Module-level "current language" for plain helpers (dates, durations, plan text).
// The store provider keeps it in sync before children render.
let current: Language = "en";
export function setCurrentLanguage(l: Language) {
  current = l;
}
export function currentLanguage(): Language {
  return current;
}

export const LANG_COOKIE = "haruka-lang";

/** Reads the saved language from a Cookie header / document.cookie string. */
export function languageFromCookie(cookie: string | undefined | null): Language | null {
  const m = cookie?.match(/(?:^|;\s*)haruka-lang=([a-z]{2})/);
  return m && isLanguage(m[1]) ? m[1] : null;
}
