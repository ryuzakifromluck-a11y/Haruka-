import { currentLanguage, interpolate, pluralForm, type Language, type Plural, type Vars } from "./core";
import { common } from "./messages/common";
import { nav } from "./messages/nav";
import { dashboard } from "./messages/dashboard";
import { plan } from "./messages/plan";
import { timer } from "./messages/timer";
import { study } from "./messages/study";
import { tests } from "./messages/tests";
import { errors } from "./messages/errors";
import { progress } from "./messages/progress";
import { settings } from "./messages/settings";
import { pet } from "./messages/pet";
import { auth } from "./messages/auth";
import { planGen } from "./messages/planGen";
import { chat } from "./messages/chat";

export * from "./core";

const pick = <T,>(m: Record<Language, T>, l: Language) => m[l];
function build(l: Language) {
  return {
    common: pick(common, l),
    nav: pick(nav, l),
    dashboard: pick(dashboard, l),
    plan: pick(plan, l),
    timer: pick(timer, l),
    study: pick(study, l),
    tests: pick(tests, l),
    errors: pick(errors, l),
    progress: pick(progress, l),
    settings: pick(settings, l),
    pet: pick(pet, l),
    auth: pick(auth, l),
    planGen: pick(planGen, l),
    chat: pick(chat, l),
  };
}

export type Messages = ReturnType<typeof build>;
const DICTS: Record<Language, Messages> = { en: build("en"), uz: build("uz"), ru: build("ru") };

type Leaves<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : T[K] extends readonly unknown[] ? never : T[K] extends Plural ? never : Leaves<T[K], `${P}${K}.`>;
}[keyof T & string];
type PluralLeaves<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string ? never : T[K] extends readonly unknown[] ? never : T[K] extends Plural ? `${P}${K}` : PluralLeaves<T[K], `${P}${K}.`>;
}[keyof T & string];

export type MsgKey = Leaves<Messages>;
export type PluralKey = PluralLeaves<Messages>;

function lookup(lang: Language, key: string): unknown {
  let node: unknown = DICTS[lang];
  for (const part of key.split(".")) {
    if (node && typeof node === "object") node = (node as Record<string, unknown>)[part];
    else return undefined;
  }
  return node;
}

/** Translate a key. Falls back to English, then to the key itself. */
export function tr(key: MsgKey, vars?: Vars, lang: Language = currentLanguage()): string {
  const v = lookup(lang, key) ?? lookup("en", key);
  return typeof v === "string" ? interpolate(v, vars) : key;
}

/** Translate a plural key; `{n}` is filled with the count. */
export function trn(key: PluralKey, n: number, vars?: Vars, lang: Language = currentLanguage()): string {
  const v = (lookup(lang, key) ?? lookup("en", key)) as Plural | undefined;
  if (!v || typeof v !== "object") return key;
  return interpolate(pluralForm(v, n, lang), { n, ...vars });
}

/** A whole message subtree (e.g. lists of lines for the pet). */
export function trList(key: string, lang: Language = currentLanguage()): string[] {
  const v = lookup(lang, key) ?? lookup("en", key);
  return Array.isArray(v) ? (v as string[]) : [];
}
