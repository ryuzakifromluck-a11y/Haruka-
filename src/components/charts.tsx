"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";
import { formatDate, formatMinutes, weekdayName } from "@/lib/date";
import { useT } from "@/i18n/useT";

type Colors = { c1: string; c2: string; grid: string; muted: string; ink: string; card: string; line: string; subtle: string };

/** Reads chart colors from CSS tokens and refreshes them when the theme class changes. */
function useChartColors(): Colors {
  const read = (): Colors => {
    if (typeof window === "undefined") return { c1: "#2f9e5b", c2: "#e0662a", grid: "#f5e5da", muted: "#7d726a", ink: "#2f2a26", card: "#fff", line: "#ebd3c3", subtle: "#fff5ee" };
    const s = getComputedStyle(document.documentElement);
    const v = (n: string) => s.getPropertyValue(n).trim();
    return { c1: v("--chart-1"), c2: v("--chart-2"), grid: v("--line"), muted: v("--muted"), ink: v("--ink"), card: v("--card"), line: v("--line-strong"), subtle: v("--subtle") };
  };
  const [c, setC] = useState<Colors>(read);
  useEffect(() => {
    setC(read());
    const obs = new MutationObserver(() => setC(read()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return c;
}

function TipBox({ title, rows }: { title: string; rows: { label: string; value: string; color?: string; dashed?: boolean }[] }) {
  return (
    <div className="rounded-xl border border-line bg-card px-3 py-2 text-xs shadow-soft">
      <p className="mb-1 font-semibold text-ink">{title}</p>
      {rows.map((r) => (
        <p key={r.label} className="flex items-center gap-2 text-ink-soft">
          {r.color && <span className="inline-block h-0.5 w-3" style={{ background: r.color, borderTop: r.dashed ? `2px dashed ${r.color}` : undefined }} />}
          <span>{r.label}</span>
          <span className="ml-auto pl-3 font-semibold tabular-nums text-ink">{r.value}</span>
        </p>
      ))}
    </div>
  );
}

export function ActivityChart({ data, goal, height = 192 }: { data: { key: string; minutes: number }[]; goal?: number; height?: number }) {
  const c = useChartColors();
  const { t } = useT();
  const rows = data.map((d) => ({ ...d, label: weekdayName(d.key, "short").slice(0, 2) }));
  const top = Math.max(goal ?? 0, ...rows.map((r) => r.minutes), 60);
  return (
    <div className="w-full" style={{ height }} role="img" aria-label={t("progress.chart.activity")}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 14, right: 4, left: 4, bottom: 0 }} barCategoryGap="38%">
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: c.muted, fontSize: 11, fontWeight: 700 }} />
          <YAxis hide domain={[0, top]} />
          {goal ? <ReferenceLine y={goal} stroke={c.c2} strokeDasharray="4 4" strokeWidth={1.5} label={{ value: `${t("progress.chart.goal")}: ${formatMinutes(goal)}`, position: "insideTopLeft", fill: c.muted, fontSize: 10, fontWeight: 700 }} /> : null}
          <Tooltip cursor={false} content={({ active, payload }) => (active && payload?.length ? <TipBox title={formatDate((payload[0].payload as { key: string }).key, { weekday: "long", month: "short", day: "numeric" })} rows={[{ label: t("progress.chart.focused"), value: formatMinutes(Number(payload[0].value)) }]} /> : null)} />
          <Bar dataKey="minutes" fill={c.c1} radius={[8, 8, 8, 8]} maxBarSize={16} background={{ fill: c.subtle, radius: 8 }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export interface ScorePoint {
  date: string;
  official: number | null;
  unofficial: number | null;
  provider: string;
}

export function ScoreChart({ data, field = "Total", target, range }: { data: ScorePoint[]; field?: string; target?: number; range: [number, number] }) {
  const { t } = useT();
  const c = useChartColors();
  const hasUnofficial = data.some((d) => d.unofficial != null);
  const values = data.flatMap((d) => [d.official, d.unofficial]).filter((v): v is number => v != null);
  const ref = target ?? values[0] ?? range[0];
  const min = Math.max(range[0], Math.floor((Math.min(...values, ref) - 60) / 100) * 100);
  const max = Math.min(range[1], Math.ceil((Math.max(...values, ref) + 40) / 100) * 100);
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-ink-soft">
        <span className="flex items-center gap-2">
          <svg width="22" height="10" aria-hidden>
            <line x1="0" y1="5" x2="22" y2="5" stroke={c.c1} strokeWidth="2" />
            <circle cx="11" cy="5" r="4" fill={c.c1} stroke={c.card} strokeWidth="2" />
          </svg>
          {t("progress.chart.official")}
        </span>
        {hasUnofficial && (
          <span className="flex items-center gap-2">
            <svg width="22" height="10" aria-hidden>
              <line x1="0" y1="5" x2="22" y2="5" stroke={c.c2} strokeWidth="2" strokeDasharray="4 3" />
              <rect x="7" y="1" width="8" height="8" fill={c.c2} stroke={c.card} strokeWidth="2" />
            </svg>
            {t("progress.chart.unofficial")}
          </span>
        )}
        {target != null && (
          <span className="flex items-center gap-2">
            <svg width="22" height="10" aria-hidden>
              <line x1="0" y1="5" x2="22" y2="5" stroke={c.muted} strokeWidth="1.5" strokeDasharray="2 3" />
            </svg>
            {t("progress.chart.target", { n: target })}
          </span>
        )}
      </div>
      <div className="h-64 w-full" role="img" aria-label={t("progress.chart.historyLabel", { field })}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.map((d, i) => ({ ...d, idx: i }))} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={c.grid} />
            <XAxis dataKey="idx" tickFormatter={(i: number) => (data[i] ? formatDate(data[i].date, { month: "short", day: "numeric" }) : "")} tickLine={false} axisLine={false} tick={{ fill: c.muted, fontSize: 11 }} />
            <YAxis domain={[min, max]} ticks={Array.from({ length: Math.floor((max - min) / 100) + 1 }, (_, i) => min + i * 100)} tickLine={false} axisLine={false} tick={{ fill: c.muted, fontSize: 11 }} width={48} />
            {target != null && <ReferenceLine y={target} stroke={c.muted} strokeDasharray="2 3" />}
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as ScorePoint;
                const rows = [] as { label: string; value: string; color?: string; dashed?: boolean }[];
                if (p.official != null) rows.push({ label: t("progress.chart.officialShort"), value: String(p.official), color: c.c1 });
                if (p.unofficial != null) rows.push({ label: t("progress.chart.unofficialShort"), value: String(p.unofficial), color: c.c2, dashed: true });
                rows.push({ label: t("progress.chart.provider"), value: p.provider });
                return <TipBox title={formatDate(p.date)} rows={rows} />;
              }}
            />
            <Line type="monotone" dataKey="official" stroke={c.c1} strokeWidth={2} connectNulls dot={{ r: 4.5, fill: c.c1, stroke: c.card, strokeWidth: 2 }} activeDot={{ r: 6, stroke: c.card, strokeWidth: 2 }} isAnimationActive={false} />
            {hasUnofficial && (
              <Line
                type="monotone"
                dataKey="unofficial"
                stroke={c.c2}
                strokeWidth={2}
                strokeDasharray="5 4"
                connectNulls
                isAnimationActive={false}
                dot={(props: { cx?: number; cy?: number; index?: number; value?: number | null }) => (props.value == null || props.cx == null || props.cy == null ? <g key={props.index} /> : <rect key={props.index} x={props.cx - 4.5} y={props.cy - 4.5} width={9} height={9} fill={c.c2} stroke={c.card} strokeWidth={2} />)}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function WeeklyTasksChart({ data }: { data: { week: number; pct: number }[] }) {
  const c = useChartColors();
  const { t } = useT();
  return (
    <div className="h-44 w-full" role="img" aria-label={t("progress.chart.byWeek")}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barCategoryGap="18%">
          <CartesianGrid vertical={false} stroke={c.grid} />
          <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fill: c.muted, fontSize: 10 }} interval={0} tickFormatter={(w: number) => (w % 2 === 1 ? t("progress.chart.weekShort", { n: w }) : "")} />
          <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: c.muted, fontSize: 11 }} tickFormatter={(v: number) => `${v}%`} ticks={[0, 25, 50, 75, 100]} width={40} />
          <Tooltip cursor={{ fill: c.subtle }} content={({ active, payload }) => (active && payload?.length ? <TipBox title={t("common.week", { n: (payload[0].payload as { week: number }).week })} rows={[{ label: t("progress.chart.tasksDone"), value: `${payload[0].value}%` }]} /> : null)} />
          <Bar dataKey="pct" fill={c.c1} radius={[6, 6, 6, 6]} maxBarSize={18} background={{ fill: c.subtle, radius: 6 }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
