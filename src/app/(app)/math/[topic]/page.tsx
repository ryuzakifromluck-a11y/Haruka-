"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, BookMarked, FunctionSquare, Lightbulb, ListChecks } from "lucide-react";
import { AiLabel, Badge, Card, CardHeader, LinkButton, PageHeader, ProgressBar } from "@/components/ui";
import { QuestionCard } from "@/components/QuestionCard";
import { MATH_BY_ID, MATH_DOMAINS, MATH_TOPICS } from "@/data/math";
import { useStore } from "@/lib/store";
import { mastery } from "@/lib/metrics";
import { useT } from "@/i18n/useT";
import { EnglishNote } from "@/components/EnglishNote";

const QBANK = "https://satsuitequestionbank.collegeboard.org/";

export default function MathTopicPage() {
  const { topic: id } = useParams<{ topic: string }>();
  const topic = MATH_BY_ID[id];
  const { state } = useStore();
  const { t } = useT();
  if (!topic) notFound();
  const domain = MATH_DOMAINS.find((d) => d.id === topic.domain)!;
  const m = mastery(topic.questions, state);
  const idx = MATH_TOPICS.findIndex((t) => t.id === id);
  const prev = MATH_TOPICS[idx - 1];
  const next = MATH_TOPICS[idx + 1];
  const groups = [
    { label: t("study.topic.exercises"), qs: topic.questions.filter((q) => q.level !== "sat") },
    { label: t("study.topic.satStyle"), qs: topic.questions.filter((q) => q.level === "sat") },
  ];

  return (
    <div>
      <Link href="/math" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ArrowLeft className="h-4 w-4" /> {t("study.math.title")}</Link>
      <PageHeader eyebrow={domain.title} title={topic.title} description={topic.summary} />
      <EnglishNote />

      <Card className="mb-6 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <p className="mb-1.5 text-sm font-medium">{t("study.topic.masteryLine", { done: m.correct, total: m.total })}</p>
          <ProgressBar value={m.pct} label={t("study.topic.topicMastery")} />
        </div>
        <LinkButton href={QBANK} external variant="secondary" size="sm">{t("study.topic.moreOfficial")}</LinkButton>
      </Card>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <Card>
            <CardHeader icon={<BookMarked className="h-4 w-4" />} title={t("study.topic.overview")} />
            <div className="space-y-3 px-5 pb-6 pt-4 text-[15px] leading-relaxed text-ink-soft sm:px-6">
              {topic.overview.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </Card>
          <Card>
            <CardHeader icon={<Lightbulb className="h-4 w-4" />} title={t("study.topic.examples")} />
            <div className="space-y-4 px-5 pb-6 pt-4 sm:px-6">
              {topic.examples.map((ex, i) => (
                <div key={i} className="rounded-xl border border-line p-4">
                  <p className="text-sm font-semibold text-ink">{t("study.topic.example", { n: i + 1 })}</p>
                  <p className="mt-1 text-[15px] text-ink">{ex.problem}</p>
                  <ol className="mt-3 space-y-1.5 border-l-2 border-primary-soft pl-4 text-sm text-ink-soft">
                    {ex.steps.map((s, j) => <li key={j}><span className="mr-1.5 text-xs font-semibold text-primary">{j + 1}.</span>{s}</li>)}
                  </ol>
                  <p className="mt-3 text-sm"><span className="font-semibold text-ink">{t("study.topic.answer")}</span><span className="text-ink-soft">{ex.answer}</span></p>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="lg:sticky lg:top-8">
            <CardHeader icon={<FunctionSquare className="h-4 w-4" />} title={t("study.topic.formulas")} />
            <ul className="space-y-3 px-5 pb-6 pt-4 sm:px-6">
              {topic.formulas.map((f) => (
                <li key={f.name} className="rounded-xl bg-subtle px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">{f.name}</p>
                  <p className="mt-1 font-mono text-sm text-ink">{f.expr}</p>
                  {f.note && <p className="mt-1 text-xs text-muted">{f.note}</p>}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {groups.map((g) => (
        <section key={g.label} className="mt-8">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" />
            <h2 className="font-serif text-2xl font-semibold">{g.label}</h2>
            <AiLabel />
          </div>
          <div className="space-y-4">
            {g.qs.map((q) => <QuestionCard key={q.id} q={q} index={topic.questions.indexOf(q)} subject="math" topic={topic.title} />)}
          </div>
        </section>
      ))}

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-between">
        {prev ? <Link href={`/math/${prev.id}`} className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink"><ArrowLeft className="h-4 w-4" /> {prev.title}</Link> : <span />}
        {next && <Link href={`/math/${next.id}`} className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink">{next.title} <ArrowRight className="h-4 w-4" /></Link>}
      </div>
      <p className="mt-6 text-xs text-muted"><Badge tone="warn">{t("study.topic.note")}</Badge> {t("study.topic.originalNote")}</p>
    </div>
  );
}
