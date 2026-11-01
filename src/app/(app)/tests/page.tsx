"use client";

import { useState } from "react";
import { ArrowUpRight, BadgeCheck, Info, ShieldAlert, Sparkles } from "lucide-react";
import { Badge, Card, EmptyState, LinkButton, PageHeader, Segmented, Toggle, cx } from "@/components/ui";
import { RESOURCES, type Resource } from "@/data/resources";
import { useT } from "@/i18n/useT";
import { trList, type MsgKey } from "@/i18n";

const ACCESS: Record<Resource["access"], MsgKey> = { Free: "tests.accessFree", Paid: "tests.accessPaid", "Free (some paid options)": "tests.accessSome" };

/** Resource text in the interface language (names of providers and products stay as they are). */
function useResourceText(r: Resource) {
  const { t, lang } = useT();
  const field = (f: "name" | "testType" | "registration" | "cta" | "description" | "note") => {
    const key = `tests.res.${r.id}.${f}` as MsgKey;
    const v = t(key);
    return v === key ? (r[f] ?? "") : v;
  };
  const details = trList(`tests.res.${r.id}.details`, lang);
  return { name: field("name"), testType: field("testType"), registration: field("registration"), cta: field("cta"), description: field("description"), note: field("note"), details: details.length ? details : r.details };
}

function ResourceCard({ r }: { r: Resource }) {
  const official = r.category === "official";
  const featured = r.id === "bluebook";
  const { t } = useT();
  const x = useResourceText(r);
  return (
    <Card as="article" className={cx("flex flex-col p-5 sm:p-6", featured && "md:col-span-2", official ? "border-primary/25" : "border-warn/30")}>
      <div className="flex flex-wrap items-center gap-2">
        {official ? (
          <Badge tone="primary"><BadgeCheck className="h-3 w-3" /> {t("tests.officialBadge")}</Badge>
        ) : (
          <Badge tone="warn"><ShieldAlert className="h-3 w-3" /> {t("tests.thirdBadge")}</Badge>
        )}
        <Badge tone={r.access === "Paid" ? "danger" : "success"}>{t(ACCESS[r.access])}</Badge>
      </div>
      <h3 className={cx("mt-3 font-serif font-semibold leading-snug text-ink", featured ? "text-2xl" : "text-xl")}>{x.name}</h3>
      <p className="mt-1.5 text-sm text-ink-soft">{x.description}</p>

      <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">{t("tests.provider")}</dt><dd className="text-ink">{r.provider}</dd></div>
        <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">{t("tests.testType")}</dt><dd className="text-ink">{x.testType}</dd></div>
        <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">{t("tests.access")}</dt><dd className="text-ink">{t(ACCESS[r.access])}</dd></div>
        <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">{t("tests.registration")}</dt><dd className="text-ink">{x.registration}</dd></div>
      </dl>

      <ul className="mt-4 space-y-1.5 text-sm text-ink-soft">
        {x.details.map((d) => <li key={d} className="flex gap-2"><span className={cx("mt-2 h-1 w-1 shrink-0 rounded-full", official ? "bg-primary" : "bg-warn")} />{d}</li>)}
      </ul>
      {x.note && (
        <p className="mt-4 flex gap-2 rounded-xl bg-subtle px-4 py-3 text-sm text-ink-soft"><Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{x.note}</p>
      )}
      <div className="mt-auto pt-5">
        <LinkButton href={r.url} external variant={official ? "primary" : "secondary"} size={featured ? "lg" : "md"}>
          {x.cta} <ArrowUpRight className="h-4 w-4" />
        </LinkButton>
        <p className="mt-2 break-all text-xs text-muted">{r.url.replace(/^https:\/\//, "")}</p>
      </div>
    </Card>
  );
}

export default function TestsPage() {
  const [cat, setCat] = useState<"all" | "official" | "third-party">("all");
  const [noReg, setNoReg] = useState(false);
  const { t } = useT();
  const match = (r: Resource) => (!noReg || r.registrationRequired === false);
  const official = RESOURCES.filter((r) => r.category === "official" && match(r));
  const third = RESOURCES.filter((r) => r.category === "third-party" && match(r));

  return (
    <div>
      <PageHeader eyebrow={t("tests.eyebrow")} title={t("tests.title")} description={t("tests.description")} />

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented value={cat} onChange={setCat} options={[{ value: "all", label: t("tests.filterAll") }, { value: "official", label: t("tests.filterOfficial") }, { value: "third-party", label: t("tests.filterThird") }]} />
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <Toggle checked={noReg} onChange={setNoReg} label={t("tests.noAccountLabel")} /> {t("tests.noAccount")}
        </label>
      </div>

      {cat !== "third-party" && (
        <section aria-labelledby="official-h" className="rounded-3xl border border-primary/25 bg-primary-soft/40 p-4 sm:p-6">
          <div className="mb-5 flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-strong text-white dark:text-[#1b1512]"><BadgeCheck className="h-5 w-5" /></div>
            <div>
              <h2 id="official-h" className="font-serif text-2xl font-semibold">{t("tests.officialTitle")}</h2>
              <p className="text-sm text-ink-soft">{t("tests.officialBody")}</p>
            </div>
          </div>
          {official.length ? <div className="grid gap-4 md:grid-cols-2">{official.map((r) => <ResourceCard key={r.id} r={r} />)}</div> : <EmptyState icon={<Info className="h-5 w-5" />} title={t("tests.noMatches")} body={t("tests.noOfficial")} />}
        </section>
      )}

      {cat !== "official" && (
        <section aria-labelledby="third-h" className={cx("rounded-3xl border border-warn/30 bg-warn-soft/40 p-4 sm:p-6", cat === "all" && "mt-10")}>
          <div className="mb-5 flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-warn text-white dark:text-[#1b1512]"><ShieldAlert className="h-5 w-5" /></div>
            <div>
              <h2 id="third-h" className="font-serif text-2xl font-semibold">{t("tests.thirdTitle")}</h2>
              <p className="text-sm text-ink-soft">{t("tests.thirdBodyA")}<strong className="text-ink">{t("tests.thirdBodyStrong")}</strong>{t("tests.thirdBodyB")}</p>
            </div>
          </div>
          {third.length ? <div className="grid gap-4 md:grid-cols-2">{third.map((r) => <ResourceCard key={r.id} r={r} />)}</div> : <EmptyState icon={<Info className="h-5 w-5" />} title={t("tests.noMatches")} body={t("tests.noThird")} />}
        </section>
      )}

      <Card className="mt-10 p-5 sm:p-6">
        <div className="flex gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-warn" />
          <div className="text-sm text-ink-soft">
            <p className="font-semibold text-ink">{t("tests.aboutTitle")}</p>
            <p className="mt-1">{t("tests.aboutBody")}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
