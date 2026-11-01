"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Circle, Eye, NotebookPen, Pencil, Plus, RotateCcw, Trash2, XCircle } from "lucide-react";
import { Badge, Button, Card, EmptyState, Field, Input, Modal, PageHeader, Segmented, Select, Textarea, Toggle, cx } from "@/components/ui";
import { useStore, uid } from "@/lib/store";
import { formatDate, isValidDateKey, todayKey } from "@/lib/date";
import { MATH_TOPICS } from "@/data/math";
import { RW_SKILLS } from "@/data/rw";
import type { Difficulty, ErrorEntry, Subject } from "@/lib/types";
import { useT } from "@/i18n/useT";
import type { MsgKey } from "@/i18n";

const SUBJECT_LABEL: Record<Subject, MsgKey> = { math: "common.kind.math", rw: "common.kind.rw" };
const DIFF_LABEL: Record<Difficulty, MsgKey> = { easy: "study.question.easy", medium: "study.question.medium", hard: "study.question.hard" };
const DIFF_TONE = { easy: "success", medium: "primary", hard: "rose" } as const;

type Draft = Omit<ErrorEntry, "id" | "retryCount" | "reviewed"> & { reviewed: boolean };

function emptyDraft(): Draft {
  return { question: "", subject: "math", topic: "", difficulty: "medium", whyWrong: "", correctAnswer: "", explanation: "", date: todayKey(), reviewed: false, source: "" };
}

function ErrorForm({ initial, onSave, onCancel }: { initial: Draft; onSave: (d: Draft) => void; onCancel: () => void }) {
  const [d, setD] = useState<Draft>(initial);
  const { t } = useT();
  const [errors, setErrors] = useState<Record<string, MsgKey>>({});
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));
  const topicOptions = d.subject === "math" ? MATH_TOPICS.map((x) => x.title) : RW_SKILLS.map((s) => s.title);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, MsgKey> = {};
    if (d.question.trim().length < 3) er.question = "errors.form.errQuestion";
    if (!d.topic.trim()) er.topic = "errors.form.errTopic";
    if (!d.correctAnswer.trim()) er.correctAnswer = "errors.form.errCorrect";
    if (d.whyWrong.trim().length < 3) er.whyWrong = "errors.form.errWhy";
    if (!isValidDateKey(d.date)) er.date = "errors.form.errDate";
    else if (d.date > todayKey()) er.date = "errors.form.errFuture";
    setErrors(er);
    if (Object.keys(er).length === 0) onSave({ ...d, question: d.question.trim(), topic: d.topic.trim(), correctAnswer: d.correctAnswer.trim(), whyWrong: d.whyWrong.trim(), explanation: d.explanation.trim() });
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Field label={t("errors.form.question")} htmlFor="e-q" error={errors.question && t(errors.question)}>
        <Textarea id="e-q" value={d.question} onChange={(e) => set("question", e.target.value)} invalid={Boolean(errors.question)} placeholder={t("errors.form.questionPh")} maxLength={4000} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={t("errors.form.subject")} htmlFor="e-s">
          <Select id="e-s" value={d.subject} onChange={(e) => setD((x) => ({ ...x, subject: e.target.value as Subject, topic: "" }))}>
            <option value="math">{t("common.kind.math")}</option>
            <option value="rw">{t("common.kind.rw")}</option>
          </Select>
        </Field>
        <Field label={t("errors.form.difficulty")} htmlFor="e-d">
          <Select id="e-d" value={d.difficulty} onChange={(e) => set("difficulty", e.target.value as Difficulty)}>
            <option value="easy">{t("study.question.easy")}</option>
            <option value="medium">{t("study.question.medium")}</option>
            <option value="hard">{t("study.question.hard")}</option>
          </Select>
        </Field>
        <Field label={t("errors.form.date")} htmlFor="e-date" error={errors.date && t(errors.date)}>
          <Input id="e-date" type="date" value={d.date} max={todayKey()} onChange={(e) => set("date", e.target.value)} invalid={Boolean(errors.date)} />
        </Field>
      </div>
      <Field label={t("errors.form.topic")} htmlFor="e-t" error={errors.topic && t(errors.topic)} hint={t("errors.form.topicHint")}>
        <Input id="e-t" list="topic-options" value={d.topic} onChange={(e) => set("topic", e.target.value)} invalid={Boolean(errors.topic)} maxLength={80} />
        <datalist id="topic-options">{topicOptions.map((o) => <option key={o} value={o} />)}</datalist>
      </Field>
      <Field label={t("errors.form.whyWrong")} htmlFor="e-w" error={errors.whyWrong && t(errors.whyWrong)}>
        <Textarea id="e-w" value={d.whyWrong} onChange={(e) => set("whyWrong", e.target.value)} invalid={Boolean(errors.whyWrong)} placeholder={t("errors.form.whyWrongPh")} maxLength={1000} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("errors.form.correctAnswer")} htmlFor="e-c" error={errors.correctAnswer && t(errors.correctAnswer)}>
          <Input id="e-c" value={d.correctAnswer} onChange={(e) => set("correctAnswer", e.target.value)} invalid={Boolean(errors.correctAnswer)} maxLength={300} />
        </Field>
        <Field label={t("errors.form.source")} htmlFor="e-src">
          <Input id="e-src" value={d.source ?? ""} onChange={(e) => set("source", e.target.value)} placeholder={t("errors.form.sourcePh")} maxLength={80} />
        </Field>
      </div>
      <Field label={t("errors.form.explanation")} htmlFor="e-x" hint={t("errors.form.explanationHint")}>
        <Textarea id="e-x" value={d.explanation} onChange={(e) => set("explanation", e.target.value)} maxLength={3000} />
      </Field>
      <label className="flex items-center gap-3 text-sm">
        <Toggle checked={d.reviewed} onChange={(v) => set("reviewed", v)} label={t("errors.markReviewed")} /> {t("errors.reviewed")}
      </label>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={onCancel}>{t("common.action.cancel")}</Button>
        <Button type="submit">{t("errors.form.save")}</Button>
      </div>
    </form>
  );
}

function RetryMode({ entries, onClose }: { entries: ErrorEntry[]; onClose: () => void }) {
  const { update } = useStore();
  const [ids] = useState(() => entries.map((e) => e.id));
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<Record<string, "correct" | "incorrect">>({});
  const { state } = useStore();
  const { t } = useT();
  const entry = state.errors.find((e) => e.id === ids[i]);
  const done = i >= ids.length;

  const record = (r: "correct" | "incorrect") => {
    if (!entry) return;
    update((s) => ({ ...s, errors: s.errors.map((e) => (e.id === entry.id ? { ...e, retryCount: e.retryCount + 1, lastRetried: todayKey(), lastRetryResult: r, reviewed: r === "correct" ? true : e.reviewed } : e)) }));
    setResults((x) => ({ ...x, [entry.id]: r }));
    setRevealed(false);
    setI((x) => x + 1);
  };

  if (done || !entry) {
    const right = Object.values(results).filter((r) => r === "correct").length;
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
        <p className="mt-3 font-serif text-2xl font-semibold">{t("errors.run.complete")}</p>
        <p className="mt-1 text-sm text-muted">{t("errors.run.summary", { right, total: Object.keys(results).length })}</p>
        <Button className="mt-5" onClick={onClose}>{t("errors.run.done")}</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted">
        <span className="tabular-nums">{i + 1} / {ids.length}</span>
        <Badge>{t(SUBJECT_LABEL[entry.subject])}</Badge>
        <Badge tone="primary">{entry.topic}</Badge>
        <Badge tone={DIFF_TONE[entry.difficulty]}>{t(DIFF_LABEL[entry.difficulty])}</Badge>
      </div>
      <p className="whitespace-pre-line rounded-xl bg-subtle p-4 text-[15px] leading-relaxed text-ink">{entry.question}</p>
      <p className="mt-3 text-sm text-muted">{t("errors.run.solveFirst")}</p>
      {revealed ? (
        <div className="animate-fade-up mt-4 space-y-3">
          <div className="rounded-xl border border-success/30 bg-success-soft p-4 text-sm">
            <p className="font-semibold text-ink">{t("errors.run.correctAnswer", { answer: entry.correctAnswer })}</p>
            {entry.explanation && <p className="mt-1 whitespace-pre-line text-ink-soft">{entry.explanation}</p>}
          </div>
          <p className="rounded-xl bg-subtle p-4 text-sm text-ink-soft"><span className="font-semibold text-ink">{t("errors.run.lastTime")}</span>{entry.whyWrong}</p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => record("correct")}><CheckCircle2 className="h-4 w-4" /> {t("errors.run.gotIt")}</Button>
            <Button variant="secondary" onClick={() => record("incorrect")}><XCircle className="h-4 w-4" /> {t("errors.run.stillWrong")}</Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex gap-2">
          <Button onClick={() => setRevealed(true)}><Eye className="h-4 w-4" /> {t("errors.run.reveal")}</Button>
          <Button variant="ghost" onClick={() => { setI((x) => x + 1); setRevealed(false); }}>{t("errors.run.skip")}</Button>
        </div>
      )}
    </div>
  );
}

function ErrorsInner() {
  const { state, update } = useStore();
  const { t } = useT();
  const params = useSearchParams();
  const [subject, setSubject] = useState<"all" | Subject>("all");
  const [topic, setTopic] = useState<string>(params.get("topic") ?? "all");
  const [difficulty, setDifficulty] = useState<"all" | Difficulty>("all");
  const [unreviewed, setUnreviewed] = useState(false);
  const [editing, setEditing] = useState<ErrorEntry | null>(null);
  const [adding, setAdding] = useState(false);
  const [retry, setRetry] = useState<ErrorEntry[] | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const topics = useMemo(() => Array.from(new Set(state.errors.map((e) => e.topic))).sort(), [state.errors]);
  const filtered = state.errors
    .filter((e) => (subject === "all" || e.subject === subject) && (topic === "all" || e.topic === topic) && (difficulty === "all" || e.difficulty === difficulty) && (!unreviewed || !e.reviewed))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const unrevCount = state.errors.filter((e) => !e.reviewed).length;

  const save = (d: Draft) => {
    if (editing) update((s) => ({ ...s, errors: s.errors.map((e) => (e.id === editing.id ? { ...e, ...d } : e)) }));
    else update((s) => ({ ...s, errors: [{ ...d, id: uid(), retryCount: 0 }, ...s.errors] }));
    setEditing(null);
    setAdding(false);
  };
  const toggleReviewed = (id: string) => update((s) => ({ ...s, errors: s.errors.map((e) => (e.id === id ? { ...e, reviewed: !e.reviewed } : e)) }));
  const remove = (id: string) => {
    update((s) => ({ ...s, errors: s.errors.filter((e) => e.id !== id) }));
    setConfirmDelete(null);
  };
  const startRetry = () => {
    const pool = filtered.filter((e) => !e.reviewed);
    setRetry(pool.length ? pool : filtered);
  };

  return (
    <div>
      <PageHeader
        eyebrow={t("errors.eyebrow")}
        title={t("errors.title")}
        description={t("errors.description")}
        action={
          <>
            <Button variant="secondary" onClick={startRetry} disabled={filtered.length === 0}><RotateCcw className="h-4 w-4" /> {t("errors.retry")}</Button>
            <Button onClick={() => setAdding(true)}><Plus className="h-4 w-4" /> {t("errors.add")}</Button>
          </>
        }
      />

      <Card className="mb-6 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Segmented size="sm" value={subject} onChange={setSubject} options={[{ value: "all", label: t("errors.allSubjects") }, { value: "math", label: t("common.kind.math") }, { value: "rw", label: t("common.kind.rw") }]} />
            <Select value={topic} onChange={(e) => setTopic(e.target.value)} className="h-9 max-w-[200px] text-xs" aria-label={t("errors.filterTopic")}>
              <option value="all">{t("errors.allTopics")}</option>
              {topics.map((o) => <option key={o} value={o}>{o}</option>)}
              {topic !== "all" && !topics.includes(topic) && <option value={topic}>{topic}</option>}
            </Select>
            <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value as "all" | Difficulty)} className="h-9 max-w-[170px] text-xs" aria-label={t("errors.filterDifficulty")}>
              <option value="all">{t("errors.allDifficulties")}</option>
              <option value="easy">{t("study.question.easy")}</option>
              <option value="medium">{t("study.question.medium")}</option>
              <option value="hard">{t("study.question.hard")}</option>
            </Select>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <Toggle checked={unreviewed} onChange={setUnreviewed} label={t("errors.unreviewedLabel")} /> {t("errors.unreviewedOnly", { n: unrevCount })}
          </label>
        </div>
      </Card>

      {state.errors.length === 0 ? (
        <EmptyState icon={<NotebookPen className="h-5 w-5" />} title={t("errors.emptyTitle")} body={t("errors.emptyBody")} action={<Button onClick={() => setAdding(true)}><Plus className="h-4 w-4" /> {t("errors.addFirst")}</Button>} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<NotebookPen className="h-5 w-5" />} title={t("errors.noMatchTitle")} body={t("errors.noMatchBody")} />
      ) : (
        <div className="space-y-3">
          {filtered.map((e) => (
            <Card as="article" key={e.id} className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <button type="button" onClick={() => toggleReviewed(e.id)} className="flex items-center gap-1.5 self-start text-xs font-medium" aria-label={e.reviewed ? t("errors.markUnreviewed") : t("errors.markReviewed")}>
                  {e.reviewed ? <CheckCircle2 className="h-5 w-5 text-success" /> : <Circle className="h-5 w-5 text-muted" />}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{t(SUBJECT_LABEL[e.subject])}</Badge>
                    <Badge tone="primary">{e.topic}</Badge>
                    <Badge tone={DIFF_TONE[e.difficulty]}>{t(DIFF_LABEL[e.difficulty])}</Badge>
                    <Badge tone={e.reviewed ? "success" : "warn"}>{e.reviewed ? t("errors.reviewed") : t("errors.needsReview")}</Badge>
                    <span className="text-xs text-muted">{formatDate(e.date)}{e.source ? ` · ${e.source}` : ""}</span>
                  </div>
                  <p className="mt-2 line-clamp-4 whitespace-pre-line text-sm text-ink">{e.question}</p>
                  <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    <p className="rounded-lg bg-danger-soft px-3 py-2 text-ink-soft"><span className="font-semibold text-ink">{t("errors.whyWrong")}</span>{e.whyWrong}</p>
                    <p className="rounded-lg bg-success-soft px-3 py-2 text-ink-soft"><span className="font-semibold text-ink">{t("errors.correct")}</span>{e.correctAnswer}</p>
                  </div>
                  {e.explanation && <p className="mt-2 line-clamp-3 text-sm text-muted">{e.explanation}</p>}
                  {e.retryCount > 0 && <p className="mt-2 text-xs text-muted">{t("errors.retried", { n: e.retryCount })}<span className={e.lastRetryResult === "correct" ? "text-success" : "text-danger"}>{e.lastRetryResult === "correct" ? t("errors.resultCorrect") : t("errors.resultIncorrect")}</span></p>}
                </div>
                <div className="flex shrink-0 gap-1 self-end sm:self-start">
                  <Button variant="ghost" size="sm" onClick={() => setRetry([e])} aria-label={t("errors.retryOne")}><RotateCcw className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditing(e)} aria-label={t("common.action.edit")}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(e.id)} aria-label={t("common.action.delete")}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              {confirmDelete === e.id && (
                <div className={cx("mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-danger-soft px-4 py-3 text-sm")}>
                  <span>{t("errors.confirmDelete")}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(null)}>{t("common.action.cancel")}</Button>
                    <Button size="sm" variant="danger" onClick={() => remove(e.id)}>{t("common.action.delete")}</Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal open={adding || Boolean(editing)} onClose={() => { setAdding(false); setEditing(null); }} title={editing ? t("errors.editTitle") : t("errors.addTitle")} wide>
        <ErrorForm key={editing?.id ?? "new"} initial={editing ? { ...editing } : emptyDraft()} onSave={save} onCancel={() => { setAdding(false); setEditing(null); }} />
      </Modal>
      <Modal open={Boolean(retry)} onClose={() => setRetry(null)} title={t("errors.retryTitle")} wide>
        {retry && <RetryMode entries={retry} onClose={() => setRetry(null)} />}
      </Modal>
    </div>
  );
}

export default function ErrorsPage() {
  return (
    <Suspense>
      <ErrorsInner />
    </Suspense>
  );
}
