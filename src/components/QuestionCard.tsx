"use client";

import { useState } from "react";
import { Check, CheckCircle2, NotebookPen, RotateCcw, XCircle } from "lucide-react";
import type { Question } from "@/data/content-types";
import { Badge, Button, Input, cx } from "@/components/ui";
import { uid, useStore } from "@/lib/store";
import { checkNumeric } from "@/lib/metrics";
import { todayKey } from "@/lib/date";
import type { Difficulty, Subject } from "@/lib/types";
import { useT } from "@/i18n/useT";
import type { MsgKey } from "@/i18n";

const LETTERS = ["A", "B", "C", "D", "E"];
const LEVEL_LABEL: Record<Question["level"], MsgKey> = { easy: "study.question.easy", medium: "study.question.medium", hard: "study.question.hard", sat: "study.question.sat" };
const LEVEL_TONE = { easy: "success", medium: "primary", hard: "rose", sat: "warn" } as const;

export function QuestionCard({ q, index, subject, topic }: { q: Question; index: number; subject: Subject; topic: string }) {
  const { state, update } = useStore();
  const { t } = useT();
  const [selected, setSelected] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [inputError, setInputError] = useState<MsgKey | "">("");
  const [saved, setSaved] = useState(false);
  const prior = state.exercises[q.id];
  const isMC = Boolean(q.choices);

  const submit = () => {
    let ok: boolean;
    if (isMC) {
      if (selected == null) {
        setInputError("study.question.chooseFirst");
        return;
      }
      ok = selected === q.correct;
    } else {
      if (!text.trim()) {
        setInputError("study.question.enterFirst");
        return;
      }
      if (!/^-?[\d./\s−-]+$/.test(text.trim())) {
        setInputError("study.question.numberOnly");
        return;
      }
      ok = checkNumeric(text, q.accept ?? []);
    }
    setInputError("");
    setResult(ok ? "correct" : "incorrect");
    update((s) => {
      const prev = s.exercises[q.id];
      return { ...s, exercises: { ...s.exercises, [q.id]: { correct: Boolean(prev?.correct) || ok, attempts: (prev?.attempts ?? 0) + 1, lastAt: new Date().toISOString() } } };
    });
  };

  const reset = () => {
    setSelected(null);
    setText("");
    setResult(null);
    setSaved(false);
  };

  const saveToNotebook = () => {
    const yourAnswer = isMC ? `${LETTERS[selected ?? 0]}) ${q.choices?.[selected ?? 0]}` : text;
    const difficulty: Difficulty = q.level === "sat" ? "medium" : q.level;
    const question = [q.passage, q.passage2, q.prompt, q.choices?.map((c, i) => `${LETTERS[i]}) ${c}`).join("\n")].filter(Boolean).join("\n\n");
    update((s) => ({
      ...s,
      errors: [
        { id: uid(), question, subject, topic, difficulty, whyWrong: t("errors.saved.whyWrong", { answer: yourAnswer }), correctAnswer: q.answerText, explanation: q.explanation, date: todayKey(), reviewed: false, source: t("errors.saved.source"), retryCount: 0 },
        ...s.errors,
      ],
    }));
    setSaved(true);
  };

  return (
    <article className="rounded-2xl border border-line bg-card p-5 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-muted">{t("study.question.number", { n: index + 1 })}</span>
        <Badge tone={LEVEL_TONE[q.level]}>{t(LEVEL_LABEL[q.level])}</Badge>
        {prior?.correct && (
          <Badge tone="success">
            <Check className="h-3 w-3" /> {t("study.question.solved")}
          </Badge>
        )}
      </div>

      {q.passage && <p className="mb-3 whitespace-pre-line rounded-xl bg-subtle p-4 text-[15px] leading-relaxed text-ink">{q.passage}</p>}
      {q.passage2 && <p className="mb-3 whitespace-pre-line rounded-xl bg-subtle p-4 text-[15px] leading-relaxed text-ink">{q.passage2}</p>}
      {q.table && (
        <div className="mb-3 overflow-x-auto">
          <table className="w-full min-w-[280px] border-collapse overflow-hidden rounded-xl text-sm">
            <thead>
              <tr className="bg-primary-soft text-primary-strong">
                {q.table.headers.map((h, i) => (
                  <th key={i} className="border border-line px-3 py-2 text-left font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {q.table.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((c, j) => (
                    <td key={j} className={cx("border border-line px-3 py-2", j === 0 && "font-medium")}>
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-[15px] font-medium leading-relaxed text-ink">{q.prompt}</p>

      {isMC ? (
        <div className="mt-4 grid gap-2" role="radiogroup">
          {q.choices!.map((c, i) => {
            const isSel = selected === i;
            const showCorrect = result && i === q.correct;
            const showWrong = result === "incorrect" && isSel;
            return (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={isSel}
                disabled={Boolean(result)}
                onClick={() => setSelected(i)}
                className={cx(
                  "flex items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                  showCorrect ? "border-success bg-success-soft" : showWrong ? "border-danger bg-danger-soft" : isSel ? "border-primary bg-primary-soft" : "border-line hover:border-line-strong hover:bg-subtle",
                )}
              >
                <span className={cx("grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs font-semibold", isSel || showCorrect ? "border-transparent bg-card" : "border-line-strong")}>{LETTERS[i]}</span>
                <span className="pt-0.5 text-ink">{c}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 max-w-xs">
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={t("study.question.yourAnswer")} inputMode="decimal" disabled={Boolean(result)} onKeyDown={(e) => e.key === "Enter" && !result && submit()} aria-label={t("study.question.yourAnswer")} />
        </div>
      )}
      {inputError && <p className="mt-2 text-xs text-danger">{t(inputError)}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {!result ? (
          <Button onClick={submit}>{t("study.question.check")}</Button>
        ) : (
          <Button variant="secondary" onClick={reset}>
            <RotateCcw className="h-4 w-4" /> {t("study.question.tryAgain")}
          </Button>
        )}
        {result === "incorrect" && (
          <Button variant="soft" onClick={saveToNotebook} disabled={saved}>
            <NotebookPen className="h-4 w-4" /> {saved ? t("study.question.saved") : t("study.question.save")}
          </Button>
        )}
      </div>

      {result && (
        <div className={cx("animate-fade-up mt-4 rounded-xl border p-4 text-sm leading-relaxed", result === "correct" ? "border-success/30 bg-success-soft" : "border-danger/30 bg-danger-soft")}>
          <p className="mb-1 flex items-center gap-2 font-semibold text-ink">
            {result === "correct" ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-danger" />}
            {result === "correct" ? t("study.question.correct") : t("study.question.notQuite", { answer: q.answerText })}
          </p>
          <p className="text-ink-soft">{q.explanation}</p>
        </div>
      )}
    </article>
  );
}
