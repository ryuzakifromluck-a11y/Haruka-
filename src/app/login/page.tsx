import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Monogram } from "@/components/Logo";
import { supabaseConfigured } from "@/lib/supabase/config";
import { LANG_COOKIE, isLanguage, tr, type Language } from "@/i18n";
import { LoginForm } from "./LoginForm";
import { LoginLanguage } from "./LoginLanguage";

export async function generateMetadata(): Promise<Metadata> {
  return { title: tr("auth.pageTitle", undefined, await cookieLanguage()) };
}

async function cookieLanguage(): Promise<Language> {
  const v = (await cookies()).get(LANG_COOKIE)?.value;
  return isLanguage(v) ? v : "en";
}

const ERROR_CODES = ["not_invited", "invalid_link", "not_configured"] as const;
type ErrorCode = (typeof ERROR_CODES)[number];

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const lang = await cookieLanguage();
  const t = (k: Parameters<typeof tr>[0]) => tr(k, undefined, lang);
  const code = ERROR_CODES.find((c): c is ErrorCode => c === error);
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-12">
      <div className="w-full max-w-md">
        <LoginLanguage lang={lang} />
        <div className="mb-8 mt-6 flex flex-col items-center text-center">
          <Monogram size={56} />
          <h1 className="mt-5 font-serif text-4xl font-semibold">Haruka&rsquo;s SAT Journey</h1>
          <p className="mt-2 font-serif text-lg italic text-ink-soft">{t("auth.motto")}</p>
        </div>
        <div className="rounded-3xl border border-line bg-card p-6 shadow-soft sm:p-8">
          {supabaseConfigured ? (
            <>
              <h2 className="font-serif text-2xl font-semibold">{t("auth.welcome")}</h2>
              <p className="mt-1 text-sm text-muted">{t("auth.intro")}</p>
              {code && <p className="mt-4 rounded-xl bg-danger-soft px-4 py-3 text-sm text-ink">{t(`auth.err.${code}`)}</p>}
              <LoginForm lang={lang} />
            </>
          ) : (
            <>
              <h2 className="font-serif text-2xl font-semibold">{t("auth.notSetTitle")}</h2>
              <p className="mt-2 text-sm text-ink-soft">
                {t("auth.notSetA")}<code className="rounded bg-subtle px-1">NEXT_PUBLIC_SUPABASE_URL</code>, <code className="rounded bg-subtle px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> {t("auth.and")} <code className="rounded bg-subtle px-1">ALLOWED_EMAILS</code>{t("auth.notSetB")}
              </p>
            </>
          )}
        </div>
        <p className="mt-6 text-center text-xs text-muted">{t("auth.footer")}</p>
      </div>
    </main>
  );
}
