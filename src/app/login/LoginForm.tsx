"use client";

import { useActionState } from "react";
import { Mail, Send } from "lucide-react";
import { tr, type Language } from "@/i18n";
import { sendMagicLink, type LoginState } from "./actions";

const initial: LoginState = { status: "idle", message: "" };

export function LoginForm({ lang }: { lang: Language }) {
  const [state, action, pending] = useActionState(sendMagicLink, initial);
  return (
    <form action={action} className="mt-6 space-y-3">
      <label htmlFor="email" className="text-sm font-medium">{tr("auth.email", undefined, lang)}</label>
      <div className="relative">
        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="h-11 w-full rounded-xl border border-line-strong bg-card pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary-soft" />
      </div>
      <button type="submit" disabled={pending} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary-strong text-sm font-medium text-white transition hover:bg-primary disabled:opacity-60 dark:text-[#1b1512]">
        <Send className="h-4 w-4" /> {pending ? tr("auth.sending", undefined, lang) : tr("auth.send", undefined, lang)}
      </button>
      {state.message && (
        <p role="status" className={state.status === "error" ? "rounded-xl bg-danger-soft px-4 py-3 text-sm" : "rounded-xl bg-success-soft px-4 py-3 text-sm"}>
          {tr(`auth.msg.${state.message}`, undefined, lang)}
        </p>
      )}
    </form>
  );
}
