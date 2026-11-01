"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Calculator, Search, Sigma, ArrowUpRight } from "lucide-react";
import { AiLabel, Badge, Card, EmptyState, Input, LinkButton, PageHeader, ProgressBar, Segmented } from "@/components/ui";
import { DESMOS_TIPS, MATH_DOMAINS, MATH_TOPICS } from "@/data/math";
import { useStore } from "@/lib/store";
import { mastery } from "@/lib/metrics";
import type { MathDomainId } from "@/data/content-types";
import { useT } from "@/i18n/useT";
import { EnglishNote } from "@/components/EnglishNote";

export default function MathPage() {
  const { state } = useStore();
  const { t: tt } = useT();
  const [q, setQ] = useState("");
  const [domain, setDomain] = useState<"all" | MathDomainId>("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return MATH_TOPICS.filter((t) => (domain === "all" || t.domain === domain) && (!needle || [t.title, t.summary, ...t.keywords].join(" ").toLowerCase().includes(needle)));
  }, [q, domain]);

  return (
    <div>
      <PageHeader eyebrow={tt("study.learn")} title={tt("study.math.title")} description={tt("study.math.description")} action={<AiLabel />} />
      <EnglishNote />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tt("study.math.searchPh")} className="pl-9" aria-label={tt("study.math.searchLabel")} />
        </div>
        <Segmented size="sm" value={domain} onChange={setDomain} options={[{ value: "all", label: tt("common.all") }, ...MATH_DOMAINS.map((d) => ({ value: d.id, label: d.title.split(" ")[0] === "Problem-Solving" ? "PSDA" : d.title.split(" and ")[0] }))]} />
      </div>

      {filtered.length === 0 && <EmptyState icon={<Search className="h-5 w-5" />} title={tt("study.math.noMatch")} body={tt("study.math.noMatchBody")} />}

      <div className="space-y-8">
        {MATH_DOMAINS.filter((d) => filtered.some((t) => t.domain === d.id)).map((d) => {
          const topics = filtered.filter((t) => t.domain === d.id);
          const dm = mastery(MATH_TOPICS.filter((t) => t.domain === d.id).flatMap((t) => t.questions), state);
          return (
            <section key={d.id}>
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-semibold">{d.title}</h2>
                  <p className="text-sm text-muted">{d.description}</p>
                </div>
                <div className="flex items-center gap-3 sm:w-64">
                  <Badge>{d.weight}</Badge>
                  <ProgressBar value={dm.pct} label={tt("study.math.mastery", { title: d.title })} />
                  <span className="text-xs tabular-nums text-muted">{dm.pct}%</span>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {topics.map((t) => {
                  const m = mastery(t.questions, state);
                  return (
                    <Link key={t.id} href={`/math/${t.id}`} className="group">
                      <Card className="h-full p-5 transition-all group-hover:-translate-y-0.5 group-hover:border-primary/50">
                        <div className="flex items-start gap-3">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-strong"><Sigma className="h-4 w-4" /></div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-serif text-lg font-semibold leading-snug">{t.title}</h3>
                            <p className="mt-1 line-clamp-2 text-sm text-muted">{t.summary}</p>
                            <div className="mt-3 flex items-center gap-3">
                              <ProgressBar value={m.pct} label={tt("study.math.mastery", { title: t.title })} />
                              <span className="whitespace-nowrap text-xs tabular-nums text-muted">{tt("study.math.masteredOf", { done: m.correct, total: m.total })}</span>
                            </div>
                          </div>
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

      <section id="desmos" className="mt-12 scroll-mt-24">
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-line bg-subtle/60 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-card text-primary-strong shadow-soft"><Calculator className="h-5 w-5" /></div>
              <div>
                <h2 className="font-serif text-2xl font-semibold">{tt("study.math.desmosTitle")}</h2>
                <p className="text-sm text-muted">{tt("study.math.desmosBody")}</p>
              </div>
            </div>
            <LinkButton href="https://www.desmos.com/calculator" external variant="secondary" size="sm">{tt("study.math.desmosOpen")} <ArrowUpRight className="h-3.5 w-3.5" /></LinkButton>
          </div>
          <div className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
            {DESMOS_TIPS.map((tip, i) => (
              <div key={tip.title} className="bg-card p-5">
                <p className="text-xs font-semibold text-primary">{tt("study.math.tip", { n: i + 1 })}</p>
                <h3 className="mt-1 font-semibold text-ink">{tip.title}</h3>
                <p className="mt-1.5 text-sm text-ink-soft">{tip.body}</p>
                <p className="mt-3 rounded-lg bg-subtle px-3 py-2 font-mono text-xs text-ink-soft">{tip.tryIt}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
