"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, ArrowRight, BookMarked, Compass, ListChecks, MessageSquareQuote } from "lucide-react";
import { AiLabel, Card, CardHeader, LinkButton, PageHeader, ProgressBar } from "@/components/ui";
import { QuestionCard } from "@/components/QuestionCard";
import { RW_BY_ID, RW_DOMAINS, RW_SKILLS } from "@/data/rw";
import { useStore } from "@/lib/store";
import { mastery } from "@/lib/metrics";
import { useT } from "@/i18n/useT";
import { EnglishNote } from "@/components/EnglishNote";

export default function RWSkillPage() {
  const { skill: id } = useParams<{ skill: string }>();
  const skill = RW_BY_ID[id];
  const { state } = useStore();
  const { t } = useT();
  if (!skill) notFound();
  const domain = RW_DOMAINS.find((d) => d.id === skill.domain)!;
  const m = mastery(skill.questions, state);
  const idx = RW_SKILLS.findIndex((s) => s.id === id);
  const prev = RW_SKILLS[idx - 1];
  const next = RW_SKILLS[idx + 1];

  return (
    <div>
      <Link href="/reading-writing" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ArrowLeft className="h-4 w-4" /> {t("study.rw.title")}</Link>
      <PageHeader eyebrow={domain.title} title={skill.title} description={skill.summary} />
      <EnglishNote />

      <Card className="mb-6 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <p className="mb-1.5 text-sm font-medium">{t("study.topic.masteryLine", { done: m.correct, total: m.total })}</p>
          <ProgressBar value={m.pct} tone="rose" label={t("study.topic.skillMastery")} />
        </div>
        <LinkButton href="https://satsuitequestionbank.collegeboard.org/" external variant="secondary" size="sm">{t("study.topic.moreOfficial")}</LinkButton>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader icon={<BookMarked className="h-4 w-4" />} title={t("study.topic.lesson")} />
          <div className="space-y-3 px-5 pb-6 pt-4 text-[15px] leading-relaxed text-ink-soft sm:px-6">
            {skill.overview.map((p, i) => <p key={i}>{p}</p>)}
            <div className="rounded-xl bg-subtle p-4">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink"><MessageSquareQuote className="h-4 w-4 text-primary" /> {t("study.topic.looksLike")}</p>
              <ul className="space-y-1 text-sm italic">{skill.looksLike.map((l) => <li key={l}>&ldquo;{l}&rdquo;</li>)}</ul>
            </div>
          </div>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader icon={<Compass className="h-4 w-4" />} title={t("study.topic.strategy")} />
            <ol className="space-y-2 px-5 pb-6 pt-4 text-sm text-ink-soft sm:px-6">
              {skill.strategies.map((s, i) => (
                <li key={i} className="flex gap-3"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary-soft text-[11px] font-semibold text-primary-strong">{i + 1}</span>{s}</li>
              ))}
            </ol>
          </Card>
          <Card>
            <CardHeader icon={<AlertTriangle className="h-4 w-4" />} title={t("study.topic.traps")} />
            <ul className="space-y-2 px-5 pb-6 pt-4 text-sm text-ink-soft sm:px-6">
              {skill.traps.map((trap) => <li key={trap} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-rose" />{trap}</li>)}
            </ul>
          </Card>
        </div>
      </div>

      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <ListChecks className="h-5 w-5 text-primary" />
          <h2 className="font-serif text-2xl font-semibold">{t("study.topic.practice")}</h2>
          <AiLabel />
        </div>
        <div className="space-y-4">
          {skill.questions.map((q, i) => <QuestionCard key={q.id} q={q} index={i} subject="rw" topic={skill.title} />)}
        </div>
      </section>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-between">
        {prev ? <Link href={`/reading-writing/${prev.id}`} className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink"><ArrowLeft className="h-4 w-4" /> {prev.title}</Link> : <span />}
        {next && <Link href={`/reading-writing/${next.id}`} className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink">{next.title} <ArrowRight className="h-4 w-4" /></Link>}
      </div>
    </div>
  );
}
