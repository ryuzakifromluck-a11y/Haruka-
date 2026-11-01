"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Layers, List, RotateCw, Search, Shuffle } from "lucide-react";
import { Badge, Button, Card, EmptyState, Input, PageHeader, ProgressBar, Segmented, Toggle, cx } from "@/components/ui";
import { VOCAB, type VocabWord } from "@/data/vocab";
import { useStore } from "@/lib/store";
import type { VocabStatus } from "@/lib/types";
import { useT } from "@/i18n/useT";
import { EnglishNote } from "@/components/EnglishNote";

type Filter = "all" | VocabStatus;
const STATUS_TONE = { new: "neutral", learning: "warn", mastered: "success" } as const;
const STATUS_LABEL = { new: "study.vocab.new", learning: "study.vocab.learning", mastered: "study.vocab.mastered" } as const;

export default function VocabularyPage() {
  const { state, update } = useStore();
  const { t } = useT();
  const [view, setView] = useState<"cards" | "list">("cards");
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [order, setOrder] = useState<string[]>(() => VOCAB.map((w) => w.id));
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const showUz = state.settings.showUzbek;

  const status = (w: VocabWord): VocabStatus => state.vocab[w.id] ?? "new";
  const byId = useMemo(() => Object.fromEntries(VOCAB.map((w) => [w.id, w])), []);
  const deck = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return order.map((id) => byId[id]).filter((w) => (filter === "all" || (state.vocab[w.id] ?? "new") === filter) && (!needle || [w.word, w.definition, w.uzbek].join(" ").toLowerCase().includes(needle)));
  }, [order, byId, filter, q, state.vocab]);

  useEffect(() => {
    if (i >= deck.length) setI(Math.max(0, deck.length - 1));
  }, [deck.length, i]);

  const card = deck[i];
  const counts = { new: 0, learning: 0, mastered: 0 } as Record<VocabStatus, number>;
  VOCAB.forEach((w) => counts[status(w)]++);

  const setStatus = (id: string, s: VocabStatus) => update((st) => ({ ...st, vocab: { ...st.vocab, [id]: s } }));
  const go = (d: number) => {
    setFlipped(false);
    setI((x) => (deck.length ? (x + d + deck.length) % deck.length : 0));
  };
  const mark = (s: VocabStatus) => {
    if (!card) return;
    setStatus(card.id, s);
    // When filtering by a status, the card may leave the deck; otherwise advance.
    if (filter === "all" || filter === s) go(1);
    else setFlipped(false);
  };
  const shuffle = () => {
    const a = [...order];
    for (let k = a.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      [a[k], a[j]] = [a[j], a[k]];
    }
    setOrder(a);
    setI(0);
    setFlipped(false);
  };

  useEffect(() => {
    if (view !== "cards") return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === " ") {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div>
      <PageHeader eyebrow={t("study.vocab.eyebrow")} title={t("study.vocab.title")} description={t("study.vocab.description")} />
      <EnglishNote />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {(["new", "learning", "mastered"] as VocabStatus[]).map((s) => (
          <Card key={s} className="p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{t(STATUS_LABEL[s])}</p>
            <p className="mt-1 font-serif text-3xl font-semibold">{counts[s]}</p>
            <ProgressBar value={(counts[s] / VOCAB.length) * 100} tone={s === "mastered" ? "success" : s === "learning" ? "rose" : "primary"} className="mt-2" label={t("study.vocab.words", { status: t(STATUS_LABEL[s]) })} />
          </Card>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input value={q} onChange={(e) => { setQ(e.target.value); setI(0); }} placeholder={t("study.vocab.searchPh")} className="pl-9" aria-label={t("study.vocab.searchLabel")} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Segmented size="sm" value={filter} onChange={(v) => { setFilter(v); setI(0); setFlipped(false); }} options={[{ value: "all", label: t("common.all") }, { value: "new", label: t("study.vocab.new") }, { value: "learning", label: t("study.vocab.learning") }, { value: "mastered", label: t("study.vocab.mastered") }]} />
          <Segmented size="sm" value={view} onChange={setView} options={[{ value: "cards", label: <span className="flex items-center gap-1"><Layers className="h-3.5 w-3.5" />{t("study.vocab.cards")}</span> }, { value: "list", label: <span className="flex items-center gap-1"><List className="h-3.5 w-3.5" />{t("study.vocab.list")}</span> }]} />
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <Toggle checked={showUz} onChange={(v) => update((s) => ({ ...s, settings: { ...s.settings, showUzbek: v } }))} label={t("study.vocab.showUz")} />
            {t("study.vocab.uzLabel")}
          </label>
        </div>
      </div>

      {deck.length === 0 ? (
        <EmptyState icon={<Layers className="h-5 w-5" />} title={filter === "mastered" ? t("study.vocab.noMastered") : t("study.vocab.noWords")} body={filter === "mastered" ? t("study.vocab.noMasteredBody") : t("study.vocab.noWordsBody")} />
      ) : view === "cards" && card ? (
        <div className="mx-auto max-w-xl">
          <div className="mb-3 flex items-center justify-between text-sm text-muted">
            <span className="tabular-nums">{t("study.vocab.cardOf", { n: i + 1, total: deck.length })}</span>
            <Button variant="ghost" size="sm" onClick={shuffle}><Shuffle className="h-4 w-4" /> {t("study.vocab.shuffle")}</Button>
          </div>
          <div className="flip-card" data-flipped={flipped}>
            <button type="button" onClick={() => setFlipped((f) => !f)} className="flip-inner relative block h-72 w-full text-left" aria-label={flipped ? t("study.vocab.showWord") : t("study.vocab.showDef")}>
              <div className="flip-face absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-line bg-card p-8 text-center shadow-soft">
                <Badge tone={STATUS_TONE[status(card)]} className="absolute right-5 top-5">{t(STATUS_LABEL[status(card)])}</Badge>
                <p className="text-xs uppercase tracking-[0.2em] text-muted">{card.pos}</p>
                <p className="mt-2 font-serif text-5xl font-semibold text-ink">{card.word}</p>
                <p className="mt-6 flex items-center gap-1.5 text-xs text-muted"><RotateCw className="h-3.5 w-3.5" /> {t("study.vocab.flipHint")}</p>
              </div>
              <div className="flip-face flip-back absolute inset-0 flex flex-col justify-center rounded-3xl border border-primary/30 bg-primary-soft p-7 shadow-soft sm:p-8">
                <p className="font-serif text-2xl font-semibold text-ink">{card.word} <span className="font-sans text-sm font-normal text-muted">{card.pos}</span></p>
                <p className="mt-2 text-[15px] text-ink">{card.definition}</p>
                {showUz && <p className="mt-3 text-sm text-ink-soft"><span className="font-semibold text-primary-strong">O&lsquo;zbekcha:</span> {card.uzbek}</p>}
                <p className="mt-3 text-sm italic text-ink-soft">&ldquo;{card.example}&rdquo;</p>
              </div>
            </button>
          </div>
          <div className="mt-5 flex items-center justify-between gap-2">
            <Button variant="secondary" onClick={() => go(-1)} aria-label={t("study.vocab.prevCard")}><ChevronLeft className="h-4 w-4" /></Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => mark("learning")}>{t("study.vocab.stillLearning")}</Button>
              <Button onClick={() => mark("mastered")}>{t("study.vocab.mastered")}</Button>
            </div>
            <Button variant="secondary" onClick={() => go(1)} aria-label={t("study.vocab.nextCard")}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      ) : (
        <Card className="divide-y divide-line">
          {deck.map((w) => (
            <div key={w.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:p-5">
              <div className="min-w-0 flex-1">
                <p className="font-serif text-xl font-semibold">{w.word} <span className="font-sans text-xs font-normal text-muted">{w.pos}</span></p>
                <p className="text-sm text-ink">{w.definition}</p>
                {showUz && <p className="text-sm text-ink-soft"><span className="font-medium text-primary-strong">O&lsquo;zbekcha:</span> {w.uzbek}</p>}
                <p className="mt-1 text-sm italic text-muted">&ldquo;{w.example}&rdquo;</p>
              </div>
              <div className="flex shrink-0 gap-1">
                {(["new", "learning", "mastered"] as VocabStatus[]).map((s) => (
                  <button key={s} type="button" onClick={() => setStatus(w.id, s)} aria-pressed={status(w) === s} className={cx("rounded-lg px-2.5 py-1 text-xs font-medium transition-colors", status(w) === s ? (s === "mastered" ? "bg-success-soft text-success" : s === "learning" ? "bg-warn-soft text-warn" : "bg-subtle text-ink") : "text-muted hover:bg-subtle")}>
                    {t(STATUS_LABEL[s])}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
