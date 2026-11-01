"use client";

import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { Badge, Checkbox, cx } from "@/components/ui";
import { useStore } from "@/lib/store";
import { formatMinutes } from "@/lib/date";
import type { PlanTask } from "@/lib/plan";
import { useT } from "@/i18n/useT";
import type { MsgKey } from "@/i18n";

const KIND: Record<PlanTask["kind"], { label: MsgKey; tone: "primary" | "rose" | "warn" | "neutral" }> = {
  math: { label: "common.kind.math", tone: "primary" },
  rw: { label: "common.kind.rwShort", tone: "rose" },
  timed: { label: "common.kind.timedShort", tone: "warn" },
  review: { label: "common.kind.review", tone: "neutral" },
};

export function useTaskToggle() {
  const { update } = useStore();
  return (id: string, done: boolean) =>
    update((s) => {
      const completedTasks = { ...s.completedTasks };
      if (done) completedTasks[id] = new Date().toISOString();
      else delete completedTasks[id];
      return { ...s, completedTasks };
    });
}

export function TaskRow({ task, compact }: { task: PlanTask; compact?: boolean }) {
  const { state } = useStore();
  const { t } = useT();
  const toggle = useTaskToggle();
  const done = Boolean(state.completedTasks[task.id]);
  const kind = KIND[task.kind];
  return (
    <div className={cx("flex gap-3 rounded-xl border border-line p-3.5 transition-colors sm:p-4", done ? "bg-subtle/60" : "bg-card")}>
      <Checkbox checked={done} onChange={(v) => toggle(task.id, v)} label={t(done ? "common.markNotDone" : "common.markDone", { title: task.title })} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={cx("text-sm font-semibold text-ink", done && "text-muted line-through decoration-line-strong")}>{task.title}</p>
          <Badge tone={kind.tone}>{t(kind.label)}</Badge>
          {task.optional && <Badge>{t("common.optional")}</Badge>}
          <span className="inline-flex items-center gap-1 text-xs text-muted">
            <Clock className="h-3 w-3" /> {formatMinutes(task.minutes)}
          </span>
        </div>
        {!compact && <p className="mt-1 text-sm text-ink-soft">{task.objective}</p>}
        <p className={cx("text-sm text-muted", compact ? "mt-0.5 line-clamp-2" : "mt-1.5")}>
          <span className="font-medium text-ink-soft">{t("plan.practiceLabel")}</span>
          {task.assignment}
        </p>
        {task.link && (
          <div className="mt-2">
            {task.link.external ? (
              <a href={task.link.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-primary-strong hover:underline">
                {task.link.label} <ArrowUpRight className="h-3 w-3" /><span className="sr-only"> {t("common.newTab")}</span>
              </a>
            ) : (
              <Link href={task.link.href} className="inline-flex items-center gap-1 text-xs font-medium text-primary-strong hover:underline">
                {task.link.label} →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
