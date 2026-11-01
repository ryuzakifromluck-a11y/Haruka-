"use client";

import { Languages } from "lucide-react";
import { useT } from "@/i18n/useT";

/** Shown in Uzbek/Russian: study content stays in English, like the real SAT. */
export function EnglishNote({ className = "mb-5" }: { className?: string }) {
  const { lang, t } = useT();
  if (lang === "en") return null;
  return (
    <p className={`flex items-start gap-2 rounded-xl bg-subtle px-3.5 py-2.5 text-xs text-ink-soft ${className}`}>
      <Languages className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
      {t("study.englishNote")}
    </p>
  );
}
