"use client";

import Link from "next/link";
import { useT } from "@/i18n/useT";

export default function NotFound() {
  const { t } = useT();
  return (
    <div className="py-20 text-center">
      <p className="font-serif text-5xl font-semibold">{t("common.notFound.title")}</p>
      <p className="mt-2 text-muted">{t("common.notFound.body")}</p>
      <Link href="/" className="mt-6 inline-block text-sm font-medium text-primary-strong hover:underline">{t("common.notFound.back")}</Link>
    </div>
  );
}
