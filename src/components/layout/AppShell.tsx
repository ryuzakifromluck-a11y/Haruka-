"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { BookOpen, CalendarDays, ClipboardCheck, Cloud, CloudOff, LayoutGrid, LineChart, LogOut, Menu, NotebookPen, Settings, ShieldAlert, Sigma, Timer, X, Library, PawPrint } from "lucide-react";
import { Monogram, Wordmark } from "@/components/Logo";
import { cx } from "@/components/ui";
import { useStore } from "@/lib/store";
import { useT } from "@/i18n/useT";
import { LANGUAGES, type Language } from "@/i18n/core";
import { elapsedMs, formatClock } from "@/lib/timer";
import { ThemeApplier } from "./ThemeApplier";
import { NotificationManager } from "./NotificationManager";
import { PetCompanion } from "@/components/pet/PetCompanion";

type NavKey = "dashboard" | "plan" | "timer" | "math" | "rw" | "vocab" | "tests" | "errors" | "progress" | "pet" | "settings";
const NAV: { href: string; key: NavKey; icon: typeof LayoutGrid }[] = [
  { href: "/", key: "dashboard", icon: LayoutGrid },
  { href: "/plan", key: "plan", icon: CalendarDays },
  { href: "/timer", key: "timer", icon: Timer },
  { href: "/math", key: "math", icon: Sigma },
  { href: "/reading-writing", key: "rw", icon: BookOpen },
  { href: "/vocabulary", key: "vocab", icon: Library },
  { href: "/tests", key: "tests", icon: ClipboardCheck },
  { href: "/errors", key: "errors", icon: NotebookPen },
  { href: "/progress", key: "progress", icon: LineChart },
  { href: "/pet", key: "pet", icon: PawPrint },
  { href: "/settings", key: "settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/** The floating orange rail (desktop). */
function Rail() {
  const pathname = usePathname();
  const { mode } = useStore();
  const { t } = useT();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[112px] flex-col items-center py-5 lg:flex">
      <Link href="/" aria-label={t("nav.homeLabel")} className="mb-5">
        <Monogram size={44} />
      </Link>
      <nav aria-label={t("nav.main")} className="flex w-[84px] flex-1 flex-col items-center gap-1 overflow-y-auto rounded-[30px] bg-gradient-to-b from-[var(--rail-a)] to-[var(--rail-b)] py-4 shadow-[0_18px_40px_-18px_rgba(230,110,40,0.7)]">
        {NAV.map((n) => {
          const active = isActive(pathname, n.href);
          const Icon = n.icon;
          return (
            <Link
              key={n.href}
              href={n.href}
              aria-current={active ? "page" : undefined}
              aria-label={t(`nav.full.${n.key}`)}
              title={t(`nav.full.${n.key}`)}
              className={cx(
                "flex w-[68px] shrink-0 flex-col items-center gap-0.5 rounded-2xl py-[7px] text-[10.5px] font-bold transition-all",
                active ? "bg-white text-[#e0662a] shadow-sm dark:bg-[#fff3ea]" : "text-white/90 hover:bg-white/15 hover:text-white",
              )}
            >
              <Icon className="h-[19px] w-[19px]" strokeWidth={2.1} />
              <span className="max-w-full truncate px-0.5">{t(`nav.short.${n.key}`)}</span>
            </Link>
          );
        })}
        {mode === "cloud" && (
          <form action="/auth/signout" method="post" className="mt-auto pt-2">
            <button type="submit" title={t("nav.signOut")} aria-label={t("nav.signOut")} className="grid h-10 w-10 place-items-center rounded-2xl text-white/85 hover:bg-white/15 hover:text-white">
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </form>
        )}
      </nav>
    </aside>
  );
}

function TimerPill() {
  const { state } = useStore();
  const { t } = useT();
  const [now, setNow] = useState(() => Date.now());
  const timer = state.timer;
  useEffect(() => {
    if (!timer?.startedAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [timer?.startedAt]);
  if (!timer) return null;
  return (
    <Link href="/timer" className="flex items-center gap-2 rounded-full bg-success-soft px-3 py-1.5 text-xs font-bold text-success">
      <span className={cx("h-2 w-2 rounded-full bg-success", Boolean(timer.startedAt) && "animate-pulse")} />
      {timer.mode === "break" ? t("nav.break") : t("nav.focus")}
      <span className="font-mono tabular-nums">{formatClock(elapsedMs(timer, now))}</span>
    </Link>
  );
}

function SyncDot() {
  const { sync, mode } = useStore();
  const { t } = useT();
  if (mode === "local")
    return (
      <span className="hidden items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-muted xl:flex" title={t("nav.savedHereHint")}>
        <CloudOff className="h-4 w-4" /> {t("nav.savedHere")}
      </span>
    );
  const label = sync === "saving" ? t("nav.saving") : sync === "error" ? t("nav.syncError") : sync === "loading" ? t("nav.loading") : t("nav.saved");
  return (
    <span className={cx("hidden items-center gap-1.5 text-xs font-semibold sm:flex", sync === "error" ? "text-danger" : "text-muted")}>
      <Cloud className="h-4 w-4" /> {label}
    </span>
  );
}

/** EN · UZ · RU switch: applies instantly and is saved with the rest of the settings. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLanguage, t } = useT();
  return (
    <div role="radiogroup" aria-label={t("nav.language")} className={cx("flex items-center rounded-full bg-subtle p-0.5", className)}>
      {LANGUAGES.map((l) => (
        <button
          key={l.id}
          type="button"
          role="radio"
          aria-checked={lang === l.id}
          aria-label={l.label}
          title={l.label}
          lang={l.id}
          onClick={() => setLanguage(l.id as Language)}
          className={cx("rounded-full px-2 py-1 text-[11px] font-extrabold transition-colors", lang === l.id ? "bg-primary text-white shadow-sm dark:text-[#1b1512]" : "text-ink-soft hover:text-ink")}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}

function TopBar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const { mode, userEmail } = useStore();
  const { t } = useT();
  const current = NAV.find((n) => isActive(pathname, n.href));
  const title = current ? (current.key === "dashboard" ? t("nav.overview") : t(`nav.full.${current.key}`)) : "";
  return (
    <header className="sticky top-0 z-20 px-3 pt-3 sm:px-6 lg:px-0 lg:pt-5">
      <div className="flex h-16 items-center gap-3 rounded-[22px] border border-white/60 bg-card/90 px-4 shadow-soft backdrop-blur-xl dark:border-line sm:px-6">
        <Link href="/" className="lg:hidden" aria-label={t("nav.homeLabel")}>
          <Monogram size={34} />
        </Link>
        <p className="min-w-0 flex-1 truncate text-base font-extrabold text-ink">{title}</p>
        <TimerPill />
        <SyncDot />
        <LanguageSwitcher className="hidden sm:flex" />
        <Link href="/settings" className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-1 hover:bg-subtle sm:pr-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#ffc59a] to-[#f2762f] text-sm font-extrabold text-white">H</span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-sm font-extrabold text-ink">Haruka</span>
            <span className="block max-w-[160px] truncate text-[11px] text-muted">{mode === "cloud" ? userEmail ?? t("nav.signedIn") : t("nav.localMode")}</span>
          </span>
        </Link>
        <button type="button" onClick={onMenu} className="grid h-10 w-10 place-items-center rounded-full text-ink-soft hover:bg-subtle lg:hidden" aria-label={t("nav.openMenu")}>
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { mode } = useStore();
  const { t } = useT();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="min-h-dvh">
      <ThemeApplier />
      <NotificationManager />
      <Rail />
      <PetCompanion />

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={t("nav.menu")}>
          <div className="absolute inset-0 bg-[#1b1512]/40 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
          <div className="animate-fade-up absolute inset-y-3 right-3 flex w-[78%] max-w-xs flex-col rounded-[28px] bg-card p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between px-1">
              <Wordmark />
              <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full text-ink-soft hover:bg-subtle" aria-label={t("nav.closeMenu")}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <LanguageSwitcher className="mb-3 self-start" />
            <nav aria-label={t("nav.main")} className="flex-1 overflow-y-auto">
              <ul className="flex flex-col gap-1">
                {NAV.map((n) => {
                  const active = isActive(pathname, n.href);
                  const Icon = n.icon;
                  return (
                    <li key={n.href}>
                      <Link href={n.href} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined} className={cx("flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold", active ? "bg-gradient-to-r from-[var(--rail-a)] to-[var(--rail-b)] text-white" : "text-ink-soft hover:bg-subtle")}>
                        <Icon className="h-[18px] w-[18px]" strokeWidth={2.1} />
                        {t(`nav.full.${n.key}`)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            {mode === "cloud" && (
              <form action="/auth/signout" method="post" className="mt-3">
                <button type="submit" className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold text-ink-soft hover:bg-subtle">
                  <LogOut className="h-[18px] w-[18px]" /> {t("nav.signOut")}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="lg:pl-[112px] lg:pr-6">
        <div className="mx-auto w-full max-w-[1280px]">
          <TopBar onMenu={() => setOpen(true)} />
          {mode === "local" && (
            <div className="mx-3 mt-3 flex items-start gap-2 rounded-2xl bg-warn-soft px-4 py-2.5 text-xs text-ink-soft sm:mx-6 lg:mx-0">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warn" />
              <span>
                <strong className="font-extrabold text-ink">{t("nav.notPrivateTitle")}</strong> {t("nav.notPrivateBody")}
              </span>
            </div>
          )}
          <main className="px-3 pb-28 pt-5 sm:px-6 lg:px-0 lg:pb-10">{children}</main>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <nav aria-label={t("nav.quick")} className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-5 rounded-[24px] bg-gradient-to-r from-[var(--rail-a)] to-[var(--rail-b)] p-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] shadow-[0_14px_30px_-14px_rgba(230,110,40,0.8)] lg:hidden">
        {[NAV[0], NAV[1], NAV[2], NAV[7], NAV[8]].map((n) => {
          const active = isActive(pathname, n.href);
          const Icon = n.icon;
          return (
            <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined} className={cx("flex flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[10.5px] font-bold", active ? "bg-white text-[#e0662a]" : "text-white")}>
              <Icon className="h-5 w-5" strokeWidth={2.1} />
              <span className="max-w-full truncate px-0.5">{t(`nav.short.${n.key}`)}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
