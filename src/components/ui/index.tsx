"use client";

import { tr } from "@/i18n";
import Link from "next/link";
import { X } from "lucide-react";
import { useEffect, useId, useRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export function Card({ children, className, as: As = "section", ...rest }: { children: ReactNode; className?: string; as?: "section" | "div" | "article"; id?: string }) {
  return (
    <As className={cx("rounded-[26px] border border-white/60 bg-card shadow-soft dark:border-line", className)} {...rest}>
      {children}
    </As>
  );
}

export function CardHeader({ title, subtitle, icon, action }: { title: ReactNode; subtitle?: ReactNode; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
      <div className="flex min-w-0 items-start gap-3">
        {icon && <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary-strong">{icon}</div>}
        <div className="min-w-0">
          <h2 className="text-lg font-extrabold leading-tight text-ink">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "soft";
const btnBase = "inline-flex items-center justify-center gap-2 rounded-full text-sm font-bold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]";
const btnVariants: Record<BtnVariant, string> = {
  primary: "bg-primary-strong text-white hover:brightness-110 dark:text-[#1b1512] shadow-sm",
  secondary: "border border-line-strong bg-card text-ink hover:bg-subtle hover:border-primary/40",
  ghost: "text-ink-soft hover:bg-subtle hover:text-ink",
  danger: "bg-danger text-white hover:opacity-90 dark:text-[#1b1512]",
  soft: "bg-primary-soft text-primary-strong hover:brightness-95",
};
const btnSizes = { sm: "h-8 px-3.5", md: "h-10 px-5", lg: "h-12 px-6 text-base" };

export function Button({ variant = "primary", size = "md", className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: keyof typeof btnSizes }) {
  return <button type="button" className={cx(btnBase, btnVariants[variant], btnSizes[size], className)} {...rest} />;
}

export function LinkButton({ href, external, variant = "primary", size = "md", className, children }: { href: string; external?: boolean; variant?: BtnVariant; size?: keyof typeof btnSizes; className?: string; children: ReactNode }) {
  const cls = cx(btnBase, btnVariants[variant], btnSizes[size], className);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

type Tone = "neutral" | "primary" | "rose" | "success" | "warn" | "danger";
const tones: Record<Tone, string> = {
  neutral: "bg-subtle text-ink-soft border-line",
  primary: "bg-primary-soft text-primary-strong border-transparent",
  rose: "bg-rose-soft text-rose border-transparent",
  success: "bg-success-soft text-success border-transparent",
  warn: "bg-warn-soft text-warn border-transparent",
  danger: "bg-danger-soft text-danger border-transparent",
};

export function Badge({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={cx("inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-bold", tones[tone], className)}>{children}</span>;
}

export function ProgressBar({ value, tone = "primary", className, label }: { value: number; tone?: "primary" | "rose" | "success"; className?: string; label?: string }) {
  const v = Math.max(0, Math.min(100, value));
  const color = tone === "rose" ? "bg-rose" : tone === "success" ? "bg-chart1" : "bg-primary";
  return (
    <div className={cx("h-2 w-full overflow-hidden rounded-full bg-subtle", className)} role="progressbar" aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className={cx("h-full rounded-full transition-[width] duration-700 ease-out", color)} style={{ width: `${v}%` }} />
    </div>
  );
}

export function ProgressRing({ value, size = 120, stroke = 10, children, tone = "primary" }: { value: number; size?: number; stroke?: number; children?: ReactNode; tone?: "primary" | "rose" | "success" }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--subtle)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tone === "rose" ? "var(--rose)" : tone === "success" ? "var(--chart-1)" : "var(--primary)"} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (v / 100) * c} style={{ transition: "stroke-dashoffset 0.8s ease-out" }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl bg-subtle px-6 py-10 text-center">
      <div className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-card text-primary shadow-soft">{icon}</div>
      <p className="text-base font-extrabold text-ink">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: ReactNode; action?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold leading-tight text-ink sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-ink-soft">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 flex-wrap gap-2">{action}</div>}
    </header>
  );
}

export function Field({ label, error, hint, children, htmlFor }: { label: string; error?: string; hint?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error ? <p className="text-xs text-danger">{error}</p> : hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

const inputCls = "w-full rounded-2xl border border-line-strong bg-card px-3 py-2 text-sm text-ink placeholder:text-muted/70 transition focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary-soft";

export function Input({ className, invalid, ...rest }: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return <input className={cx(inputCls, "h-10", invalid && "border-danger", className)} aria-invalid={invalid || undefined} {...rest} />;
}

export function Textarea({ className, invalid, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return <textarea className={cx(inputCls, "min-h-[84px] resize-y", invalid && "border-danger", className)} aria-invalid={invalid || undefined} {...rest} />;
}

export function Select({ className, invalid, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select className={cx(inputCls, "h-10 pr-8", invalid && "border-danger", className)} aria-invalid={invalid || undefined} {...rest}>
      {children}
    </select>
  );
}

export function Segmented<T extends string>({ value, onChange, options, className, size = "md" }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode }[]; className?: string; size?: "sm" | "md" }) {
  return (
    <div role="radiogroup" className={cx("inline-flex flex-wrap gap-1 rounded-full bg-subtle p-1", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cx("rounded-full font-bold transition-all", size === "sm" ? "px-3 py-1 text-xs" : "px-3.5 py-1.5 text-sm", value === o.value ? "bg-primary-strong text-white shadow-sm dark:text-[#1b1512]" : "text-muted hover:text-ink")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Checkbox({ checked, onChange, label, className }: { checked: boolean; onChange: (v: boolean) => void; label: string; className?: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx("grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 transition-all", checked ? "border-chart1 bg-chart1 text-white dark:text-[#1b1512]" : "border-line-strong bg-card hover:border-primary", className)}
    >
      <svg viewBox="0 0 16 16" className={cx("h-3.5 w-3.5 transition-transform", checked ? "scale-100" : "scale-0")} aria-hidden>
        <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={cx("relative h-6 w-11 shrink-0 rounded-full transition-colors", checked ? "bg-chart1" : "bg-line-strong")}>
      <span className={cx("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", checked ? "translate-x-5" : "translate-x-0.5")} />
    </button>
  );
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.querySelector<HTMLElement>("input, textarea, select, button")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby={id}>
      <div className="absolute inset-0 bg-[#1b1512]/40 backdrop-blur-[2px]" onClick={onClose} />
      <div ref={ref} className={cx("animate-fade-up relative max-h-[92vh] w-full overflow-y-auto rounded-t-[28px] bg-card p-5 shadow-2xl sm:rounded-[28px] sm:p-7", wide ? "sm:max-w-2xl" : "sm:max-w-lg")}>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id={id} className="text-xl font-extrabold text-ink">
            {title}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label={tr("common.action.close")}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function StatTile({ label, value, sub, icon }: { label: string; value: ReactNode; sub?: ReactNode; icon?: ReactNode }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-ink-soft">{label}</p>
        {icon && <span className="text-primary">{icon}</span>}
      </div>
      <p className="mt-2 text-3xl font-extrabold text-ink">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </Card>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("animate-pulse rounded-[26px] bg-white/60 dark:bg-subtle", className)} />;
}

export function AiLabel({ className }: { className?: string }) {
  return (
    <Badge tone="warn" className={className}>
      {tr("common.aiLabel")}
    </Badge>
  );
}
