"use client";

import { useT } from "@/i18n/useT";

export default function ErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
  const { t } = useT();
  return (
    <div className="py-20 text-center">
      <p className="font-serif text-4xl font-semibold">{t("common.crash.title")}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{t("common.crash.body")} {error.message ? `(${error.message})` : ""}</p>
      <button type="button" onClick={reset} className="mt-6 rounded-xl bg-primary-strong px-4 py-2 text-sm font-medium text-white dark:text-[#1b1512]">{t("common.action.tryAgain")}</button>
    </div>
  );
}
