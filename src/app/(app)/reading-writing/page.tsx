"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpen, Library, Search, SpellCheck2, ArrowRight } from "lucide-react";
import { AiLabel, Badge, Card, CardHeader, EmptyState, Input, PageHeader, ProgressBar, Segmented } from "@/components/ui";
import { GRAMMAR_LESSONS, RW_DOMAINS, RW_SKILLS } from "@/data/rw";
import { VOCAB } from "@/data/vocab";
import { useStore } from "@/lib/store";
import { mastery } from "@/lib/metrics";
import { useT } from "@/i18n/useT";
import { EnglishNote } from "@/components/EnglishNote";
import type { RWDomainId } from "@/data/content-types";

export default function RWPage() {
  const { state } = useStore();
  const { t } = useT();
  const [q, setQ] = useState("");
  const [domain, setDomain] = useState<"all" | RWDomainId>("all");
  const needle = q.trim().toLowerCase();
  const filtered = useMemo(() => RW_SKILLS.filter((s) => (domain === "all" || s.domain === domain) && (!needle || [s.title, s.summary, ...s.keywords].join(" ").toLowerCase().includes(needle))), [needle, domain]);
  const grammar = GRAMMAR_LESSONS.filter((g) => !needle || [g.title, g.rule].join(" ").toLowerCase().includes(needle));
  const mastered = VOCAB.filter((w) => state.vocab[w.id] === "mastered").length;

  return (
    <div>
      <PageHeader eyebrow={t("study.learn")} title={t("study.rw.title")} description={t("study.rw.description")} action={<AiLabel />} />
      <EnglishNote />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("study.rw.searchPh")} className="pl-9" aria-label={t("study.rw.searchLabel")} />
        </div>
        <Segmented size="sm" value={domain} onChange={setDomain} options={[{ value: "all", label: t("common.all") }, { value: "info", label: "Info & Ideas" }, { value: "craft", label: "Craft" }, { value: "expression", label: "Expression" }, { value: "conventions", label: "Conventions" }]} />
      </div>

      <Link href="/vocabulary" className="group mb-8 block">
        <Card className="flex items-center gap-4 p-5 transition-colors group-hover:border-primary/50">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-rose-soft text-rose"><Library className="h-5 w-5" /></div>
          <div className="min-w-0 flex-1">
            <p className="font-serif text-lg font-semibold">{t("study.rw.vocabTitle")}</p>
            <p className="text-sm text-muted">{t("study.rw.vocabBody", { count: VOCAB.length, mastered })}</p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted transition-transform group-hover:translate-x-0.5" />
        </Card>
      </Link>

      {filtered.length === 0 && grammar.length === 0 && <EmptyState icon={<Search className="h-5 w-5" />} title={t("study.rw.nothing")} body={t("study.math.noMatchBody")} />}

      <div className="space-y-8">
        {RW_DOMAINS.filter((d) => filtered.some((s) => s.domain === d.id)).map((d) => {
          const dm = mastery(RW_SKILLS.filter((s) => s.domain === d.id).flatMap((s) => s.questions), state);
          return (
            <section key={d.id}>
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-semibold">{d.title}</h2>
                  <p className="text-sm text-muted">{d.description}</p>
                </div>
                <div className="flex items-center gap-3 sm:w-64">
                  <Badge>{d.weight}</Badge>
                  <ProgressBar value={dm.pct} tone="rose" label={t("study.math.mastery", { title: d.title })} />
                  <span className="text-xs tabular-nums text-muted">{dm.pct}%</span>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.filter((s) => s.domain === d.id).map((s) => {
                  const m = mastery(s.questions, state);
                  return (
                    <Link key={s.id} href={`/reading-writing/${s.id}`} className="group">
                      <Card className="h-full p-5 transition-all group-hover:-translate-y-0.5 group-hover:border-primary/50">
                        <div className="mb-2 grid h-9 w-9 place-items-center rounded-xl bg-rose-soft text-rose"><BookOpen className="h-4 w-4" /></div>
                        <h3 className="font-serif text-lg font-semibold leading-snug">{s.title}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-muted">{s.summary}</p>
                        <div className="mt-3 flex items-center gap-3">
                          <ProgressBar value={m.pct} tone="rose" label={t("study.math.mastery", { title: s.title })} />
                          <span className="whitespace-nowrap text-xs tabular-nums text-muted">{m.correct}/{m.total}</span>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {grammar.length > 0 && (domain === "all" || domain === "conventions") && (
        <Card id="grammar" className="mt-10 scroll-mt-24">
          <CardHeader icon={<SpellCheck2 className="h-4 w-4" />} title={t("study.rw.grammarTitle")} subtitle={t("study.rw.grammarSub")} />
          <div className="grid gap-4 px-5 pb-6 pt-4 sm:px-6 md:grid-cols-2">
            {grammar.map((g) => (
              <div key={g.id} className="rounded-xl border border-line p-4">
                <h3 className="font-semibold text-ink">{g.title}</h3>
                <p className="mt-1.5 text-sm text-ink-soft">{g.rule}</p>
                <p className="mt-3 rounded-lg bg-success-soft px-3 py-2 text-sm text-ink"><span className="mr-1 font-semibold text-success">✓</span>{g.correct}</p>
                <p className="mt-2 rounded-lg bg-danger-soft px-3 py-2 text-sm text-ink"><span className="mr-1 font-semibold text-danger">✗</span>{g.incorrect}</p>
                <p className="mt-2 text-xs text-muted"><span className="font-semibold">{t("study.rw.tipLabel")}</span> {g.tip}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
