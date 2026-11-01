"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { MessageCircle, Minus, RotateCcw, SendHorizontal, Sparkles, X } from "lucide-react";
import { cx } from "@/components/ui";
import { tr, type Language, type MsgKey } from "@/i18n";
import { ERROR_MARKER, REFUSAL_MARKER } from "@/lib/pet-chat/protocol";
import type { PetSpecies } from "@/lib/types";

export const CHAT_MAX_CHARS = 2000;

type Notice = "notConfigured" | "error" | "offline" | "rateLimited" | "unauthorized" | "refusal";

export interface ChatMsg {
  id: number;
  role: "user" | "assistant";
  text: string;
  /** greet = local greeting; notice = status line, never sent to the AI */
  kind?: "greet" | "notice";
  notice?: Notice;
  pending?: boolean;
  /** For failed replies: lets the user resend. */
  retryable?: boolean;
}

export type ChatView = "closed" | "open" | "min";

let nextId = 1;

/** Conversation state + streaming calls to /api/pet-chat. History lives only while the chat is open or minimized. */
export function usePetChat(opts: { species: PetSpecies; name: string; lang: Language; onThinking?: () => void; onReply?: () => void }) {
  const [view, setView] = useState<ChatView>("closed");
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [busy, setBusy] = useState(false);
  const [unread, setUnread] = useState(false);
  const configured = useRef<boolean | null>(null);
  const abort = useRef<AbortController | null>(null);
  const greetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const live = useRef(opts);
  live.current = opts;
  const viewRef = useRef(view);
  viewRef.current = view;

  const patch = (id: number, p: Partial<ChatMsg>) => setMsgs((list) => list.map((m) => (m.id === id ? { ...m, ...p } : m)));

  const open = useCallback(() => {
    setUnread(false);
    if (viewRef.current !== "closed") {
      setView("open");
      return;
    }
    viewRef.current = "open";
    setView("open");
    // Fresh conversation: think for a moment, then greet.
    const greetId = nextId++;
    setMsgs([{ id: greetId, role: "assistant", text: "", kind: "greet", pending: true }]);
    live.current.onThinking?.();
    const check = fetch("/api/pet-chat", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { configured?: boolean } | null) => (configured.current = d ? Boolean(d.configured) : null))
      .catch(() => (configured.current = null));
    greetTimer.current = setTimeout(async () => {
      await check;
      if (viewRef.current === "closed") return;
      const { species, name } = live.current;
      patch(greetId, { pending: false, text: tr(`chat.greet.${species}`, { name }) });
      live.current.onReply?.();
      if (configured.current === false) {
        setMsgs((list) => [...list, { id: nextId++, role: "assistant", text: "", kind: "notice", notice: "notConfigured" }]);
      }
    }, 950);
  }, []);

  const close = useCallback(() => {
    abort.current?.abort();
    if (greetTimer.current) clearTimeout(greetTimer.current);
    setBusy(false);
    setMsgs([]);
    setUnread(false);
    viewRef.current = "closed";
    setView("closed");
  }, []);

  const minimize = useCallback(() => setView((v) => (v === "open" ? "min" : v)), []);

  const request = useCallback(async (history: ChatMsg[]) => {
    const replyId = nextId++;
    setMsgs([...history, { id: replyId, role: "assistant", text: "", pending: true }]);
    setBusy(true);
    live.current.onThinking?.();
    const ctrl = new AbortController();
    abort.current = ctrl;
    const fail = (notice: Notice, retryable = false) => patch(replyId, { pending: false, kind: "notice", notice, text: "", retryable });
    try {
      const { species, name, lang } = live.current;
      const res = await fetch("/api/pet-chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: ctrl.signal,
        body: JSON.stringify({
          species,
          name,
          lang,
          messages: history.filter((m) => m.kind !== "notice" && m.text.trim()).map((m) => ({ role: m.role, content: m.text })),
        }),
      });
      if (!res.ok || !res.body) {
        if (res.status === 503) {
          configured.current = false;
          return fail("notConfigured");
        }
        if (res.status === 429) return fail("rateLimited", true);
        if (res.status === 401) return fail("unauthorized");
        return fail("error", true);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";
      let first = true;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        const visible = text.split("\u0000")[0];
        if (visible) {
          if (first) {
            first = false;
            live.current.onReply?.();
          }
          patch(replyId, { pending: false, text: visible });
        }
      }
      text += decoder.decode();
      if (text.endsWith(REFUSAL_MARKER) && !text.split("\u0000")[0]) return fail("refusal");
      if (text.endsWith(ERROR_MARKER) && !text.split("\u0000")[0]) return fail("error", true);
      if (!text.split("\u0000")[0].trim()) return fail("error", true);
      patch(replyId, { pending: false, text: text.split("\u0000")[0].trim() });
      if (viewRef.current === "min") setUnread(true);
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      fail(typeof navigator !== "undefined" && navigator.onLine === false ? "offline" : "error", true);
    } finally {
      if (abort.current === ctrl) abort.current = null;
      setBusy(false);
    }
  }, []);

  const send = useCallback(
    (text: string) => {
      const t = text.trim();
      if (!t || busy || t.length > CHAT_MAX_CHARS) return false;
      void request([...msgs.filter((m) => !m.pending && !(m.kind === "notice" && m.retryable)), { id: nextId++, role: "user", text: t }]);
      return true;
    },
    [busy, msgs, request],
  );

  /** Resend the last question after a failed reply. */
  const retry = useCallback(() => {
    if (busy) return;
    const kept = msgs.filter((m) => !(m.kind === "notice" && m.retryable));
    if (kept[kept.length - 1]?.role === "user") void request(kept);
  }, [busy, msgs, request]);

  useEffect(() => () => {
    abort.current?.abort();
    if (greetTimer.current) clearTimeout(greetTimer.current);
  }, []);

  return { view, msgs, busy, unread, open, close, minimize, send, retry };
}

const NOTICE_KEY: Record<Notice, MsgKey> = {
  notConfigured: "chat.notConfigured",
  error: "chat.error",
  offline: "chat.offline",
  rateLimited: "chat.rateLimited",
  unauthorized: "chat.unauthorized",
  refusal: "chat.refusal",
};

const SPECIES_EMOJI: Record<PetSpecies, string> = { cat: "🐱", dog: "🐶", rabbit: "🐰", fox: "🦊" };

function Dots({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 py-1" role="status">
      <span className="pet-chat-dot h-1.5 w-1.5 rounded-full bg-current" />
      <span className="pet-chat-dot h-1.5 w-1.5 rounded-full bg-current" style={{ animationDelay: "0.15s" }} />
      <span className="pet-chat-dot h-1.5 w-1.5 rounded-full bg-current" style={{ animationDelay: "0.3s" }} />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export interface ChatPlacement {
  style: CSSProperties;
  origin: "bottom" | "top";
}

/** Where the window goes: directly above the pet when there is room, otherwise below, otherwise a sheet. */
export function placeChat(pet: { x: number; y: number }, size: number): ChatPlacement {
  if (typeof window === "undefined") return { style: { display: "none" }, origin: "bottom" };
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const gap = 8;
  const width = Math.min(380, vw - gap * 2);
  const left = Math.round(Math.min(Math.max(pet.x + size / 2 - width / 2, gap), vw - width - gap));
  const above = pet.y + size * 0.12 - gap; // the pet's head, roughly
  const below = vh - (pet.y + size) - gap;
  const ideal = Math.min(500, vh * 0.72);
  if (above >= Math.min(ideal, 300)) {
    return { origin: "bottom", style: { left, width, bottom: Math.round(vh - above), height: Math.round(Math.min(ideal, above - gap)) } };
  }
  if (below >= Math.min(ideal, 300)) {
    return { origin: "top", style: { left, width, top: Math.round(pet.y + size + gap), height: Math.round(Math.min(ideal, below - gap)) } };
  }
  return { origin: "bottom", style: { left: gap, right: gap, bottom: gap, height: Math.round(Math.min(ideal, vh - gap * 2)) } };
}

export function PetChatWindow({
  name,
  species,
  chat,
  placement,
}: {
  name: string;
  species: PetSpecies;
  chat: ReturnType<typeof usePetChat>;
  placement: ChatPlacement;
}) {
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { view, msgs, busy } = chat;
  const tooLong = draft.trim().length > CHAT_MAX_CHARS;

  // Keep the newest message in view.
  useLayoutEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, view]);

  useEffect(() => {
    if (view === "open") inputRef.current?.focus({ preventScroll: true });
  }, [view]);

  // Grow the input with its text, up to ~5 lines.
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [draft]);

  const submit = () => {
    if (chat.send(draft)) setDraft("");
  };

  if (view === "closed") return null;

  if (view === "min") {
    return (
      <button
        type="button"
        onClick={chat.open}
        className="pet-pop fixed z-[36] flex items-center gap-2 rounded-full border border-line bg-card px-3.5 py-2 text-sm font-extrabold text-ink shadow-soft hover:bg-subtle print:hidden"
        style={{ left: placement.style.left, ...(placement.origin === "bottom" ? { bottom: placement.style.bottom } : { top: placement.style.top }) }}
        aria-label={tr("chat.reopen", { name })}
        data-testid="pet-chat-min"
      >
        <MessageCircle className="h-4 w-4 text-primary-strong" />
        {tr("chat.title", { name })}
        {chat.unread && <span className="h-2 w-2 rounded-full bg-rose" aria-hidden />}
      </button>
    );
  }

  return (
    <section
      role="dialog"
      aria-label={tr("chat.dialog", { name })}
      className={cx("pet-chat-in fixed z-[36] flex flex-col overflow-hidden rounded-[22px] border border-line bg-card text-ink shadow-[0_18px_50px_-12px_rgba(60,30,10,0.35)] print:hidden", placement.origin === "top" ? "origin-top" : "origin-bottom")}
      style={placement.style}
      data-testid="pet-chat"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          chat.minimize();
        }
      }}
    >
      <header className="flex items-center gap-3 border-b border-line bg-gradient-to-r from-primary-soft to-card px-4 py-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-card text-lg shadow-sm" aria-hidden>
          {SPECIES_EMOJI[species]}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-extrabold">{tr("chat.title", { name })}</p>
          <p className="flex items-center gap-1 text-[11px] font-semibold text-muted">
            <Sparkles className="h-3 w-3" /> {busy ? tr("chat.thinking", { name }) : tr("chat.subtitle")}
          </p>
        </div>
        <button type="button" onClick={chat.minimize} className="grid h-8 w-8 place-items-center rounded-full text-ink-soft hover:bg-subtle" aria-label={tr("chat.minimize")} title={tr("chat.minimize")}>
          <Minus className="h-4 w-4" />
        </button>
        <button type="button" onClick={chat.close} className="grid h-8 w-8 place-items-center rounded-full text-ink-soft hover:bg-subtle" aria-label={tr("chat.close")} title={tr("chat.close")}>
          <X className="h-4 w-4" />
        </button>
      </header>

      <div ref={listRef} className="flex-1 space-y-2.5 overflow-y-auto overscroll-contain px-3.5 py-4" aria-live="polite" data-testid="pet-chat-log">
        {msgs.map((m) => {
          const mine = m.role === "user";
          const isNotice = m.kind === "notice";
          return (
            <div key={m.id} className={cx("flex", mine ? "justify-end" : "justify-start")}>
              <div
                className={cx(
                  "pet-pop max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-[14px] leading-relaxed",
                  mine && "rounded-br-md bg-primary-strong text-white dark:text-[#1b1512]",
                  !mine && !isNotice && "rounded-bl-md bg-subtle text-ink",
                  isNotice && "rounded-bl-md border border-warn/30 bg-warn-soft text-ink",
                )}
                data-role={m.role}
                data-notice={m.notice}
              >
                {m.pending ? <Dots label={tr("chat.thinking", { name })} /> : isNotice && m.notice ? tr(NOTICE_KEY[m.notice]) : m.text}
                {isNotice && m.retryable && (
                  <button type="button" onClick={chat.retry} disabled={busy} className="mt-1.5 flex items-center gap-1 text-xs font-extrabold text-primary-strong hover:underline disabled:opacity-50">
                    <RotateCcw className="h-3 w-3" /> {tr("chat.retry")}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <form
        className="border-t border-line bg-card p-2.5"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={tr("chat.placeholder", { name })}
            aria-label={tr("chat.inputLabel")}
            aria-invalid={tooLong || undefined}
            className="max-h-[120px] min-h-[42px] flex-1 resize-none rounded-2xl border border-line-strong bg-subtle/60 px-3.5 py-2.5 text-[16px] leading-snug text-ink placeholder:text-muted focus:border-primary focus:bg-card focus:outline-none sm:text-sm"
            data-testid="pet-chat-input"
          />
          <button
            type="submit"
            disabled={busy || !draft.trim() || tooLong}
            className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full bg-primary-strong text-white transition hover:bg-primary disabled:opacity-40 dark:text-[#1b1512]"
            aria-label={tr("chat.send")}
            title={tr("chat.send")}
            data-testid="pet-chat-send"
          >
            <SendHorizontal className="h-4 w-4" />
          </button>
        </div>
        <p className={cx("mt-1.5 px-1 text-[10.5px]", tooLong ? "text-danger" : "text-muted")}>{tooLong ? tr("chat.tooLong", { n: CHAT_MAX_CHARS }) : tr("chat.note")}</p>
      </form>
    </section>
  );
}
