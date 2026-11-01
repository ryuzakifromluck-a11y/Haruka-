"use client";

import { useRouter } from "next/navigation";
import { LANGUAGES, type Language } from "@/i18n";

/** Language picker for the sign-in page (before the account loads); remembered in a cookie. */
export function LoginLanguage({ lang }: { lang: Language }) {
  const router = useRouter();
  const choose = (l: Language) => {
    document.cookie = `haruka-lang=${l}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = l;
    router.refresh();
  };
  return (
    <div role="radiogroup" aria-label="Language · Til · Язык" className="mx-auto flex w-fit gap-1 rounded-full border border-line bg-card p-1 text-xs font-bold">
      {LANGUAGES.map((l) => (
        <button key={l.id} type="button" role="radio" aria-checked={lang === l.id} lang={l.id} title={l.label} onClick={() => choose(l.id)} className={lang === l.id ? "rounded-full bg-primary-strong px-3 py-1 text-white dark:text-[#1b1512]" : "rounded-full px-3 py-1 text-ink-soft hover:bg-subtle"}>
          {l.short}
        </button>
      ))}
    </div>
  );
}
