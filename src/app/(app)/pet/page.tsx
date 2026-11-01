"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Hand, Heart, Keyboard, Moon, MessageCircle, Move, RotateCcw } from "lucide-react";
import { Badge, Button, Card, CardHeader, Field, Input, PageHeader, Segmented, Toggle, cx } from "@/components/ui";
import { useStore } from "@/lib/store";
import type { PetSize, PetSpecies } from "@/lib/types";
import { PetCanvas, hasWebGL, loadEngine, useDarkClass } from "@/components/pet/PetCanvas";
import type { PetEngine } from "@/components/pet/engine";
import { EMOTIONS, PETS, SPECIES, coatFor, petName, type Emotion, type PetAction } from "@/components/pet/pets";
import { unlockAudio, sounds } from "@/components/pet/sound";
import { useT } from "@/i18n/useT";

const MOOD_ACTION: Partial<Record<Emotion, PetAction>> = { happy: "nod", excited: "jump", curious: "lookAround", surprised: "earTwitch", loved: "wiggle" };
const NAME_MAX = 16;

function usePortraits(coats: Record<PetSpecies, string>, dark: boolean) {
  const [shots, setShots] = useState<Record<string, string>>({});
  const key = SPECIES.map((s) => coats[s]).join("|") + (dark ? "-d" : "-l");
  useEffect(() => {
    let cancelled = false;
    if (!hasWebGL()) return;
    loadEngine().then(({ renderPortraits }) => {
      if (cancelled) return;
      try {
        const out = renderPortraits(
          SPECIES.map((s) => ({ key: s, species: s, coat: coatFor(s, coats[s]) })),
          dark,
        );
        setShots(out);
      } catch {
        /* keep placeholders */
      }
    });
    return () => {
      cancelled = true;
    };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return shots;
}

export default function PetPage() {
  const { state, update } = useStore();
  const { t } = useT();
  const pet = state.pet;
  const species = pet.species;
  const persona = PETS[species];
  const coat = coatFor(species, pet.coats[species]);
  const dark = useDarkClass();
  const coatsBySpecies = Object.fromEntries(SPECIES.map((s) => [s, coatFor(s, pet.coats[s]).id])) as Record<PetSpecies, string>;
  const portraits = usePortraits(coatsBySpecies, dark);
  const preview = useRef<PetEngine | null>(null);
  const [previewMood, setPreviewMood] = useState<Emotion>("happy");
  const [nameDraft, setNameDraft] = useState(pet.names[species] ?? "");
  const [nameError, setNameError] = useState(false);

  useEffect(() => {
    setNameDraft(pet.names[species] ?? "");
    setNameError(false);
  }, [species]); // eslint-disable-line react-hooks/exhaustive-deps

  const setPet = (patch: Partial<typeof pet>) => update((s) => ({ ...s, pet: { ...s.pet, ...patch } }));

  const onEngine = useCallback((e: PetEngine | null) => {
    preview.current = e;
    e?.setEmotion("happy");
  }, []);

  const tryMood = (m: Emotion) => {
    setPreviewMood(m);
    preview.current?.setSleeping(false);
    preview.current?.setEmotion(m);
    const a = species === "rabbit" && MOOD_ACTION[m] === "jump" ? "hop" : MOOD_ACTION[m];
    if (a) preview.current?.play(a);
    if (m === "loved" && pet.sound) sounds.love();
  };

  const saveName = (raw: string) => {
    const v = raw.replace(/[\u0000-\u001f<>]/g, "").trim();
    if (v.length > NAME_MAX) {
      setNameError(true);
      return;
    }
    setNameError(false);
    update((s) => ({ ...s, pet: { ...s.pet, names: { ...s.pet.names, [species]: v || undefined } } }));
  };

  const name = petName(species, pet.names);

  return (
    <div>
      <PageHeader title={t("pet.page.title")} description={t("pet.page.description")} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Preview */}
        <Card className="min-w-0 overflow-hidden lg:col-span-2">
          <div className="relative bg-gradient-to-b from-[var(--bg-grad-a)] to-[var(--bg-grad-b)] px-4 pt-4 dark:from-[#2a1f1a] dark:to-[#1f1814]">
            <PetCanvas key={species} species={species} coat={coat} onEngine={onEngine} yaw={0.45} className="mx-auto block h-64 w-64 sm:h-72 sm:w-72" />
          </div>
          <div className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-extrabold">{name}</h2>
              <span className="text-sm font-semibold text-muted">{t("pet.page.the", { species: t(`pet.species.${persona.species}.lower`) })}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {persona.traits.map((t) => (
                <Badge key={t} tone="primary">{t}</Badge>
              ))}
            </div>
            <p className="mt-3 text-sm text-ink-soft">{persona.summary}</p>
            <p className="mb-2 mt-5 text-sm font-bold text-ink-soft">{t("pet.page.tryMood")}</p>
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={t("pet.page.previewMood")}>
              {EMOTIONS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={previewMood === m.id}
                  onClick={() => tryMood(m.id)}
                  className={cx("rounded-full px-3 py-1.5 text-xs font-bold transition-colors", previewMood === m.id ? "bg-primary text-white dark:text-[#1b1512]" : "bg-subtle text-ink-soft hover:text-ink")}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <div className="min-w-0 space-y-5 lg:col-span-3">
          {/* Choose */}
          <Card>
            <CardHeader title={t("pet.page.choose")} subtitle={t("pet.page.chooseSub")} />
            <div role="radiogroup" aria-label={t("pet.page.petLabel")} className="grid grid-cols-2 gap-3 px-5 pb-5 pt-4 sm:grid-cols-4 sm:px-6 sm:pb-6">
              {SPECIES.map((s) => {
                const p = PETS[s];
                const active = s === species;
                return (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    aria-label={`${petName(s, pet.names)} · ${p.title}`}
                    onClick={() => setPet({ species: s })}
                    className={cx(
                      "relative flex flex-col items-center rounded-[22px] border-2 p-3 text-center transition-all",
                      active ? "border-primary bg-primary-soft shadow-soft" : "border-transparent bg-subtle hover:border-primary/40",
                    )}
                  >
                    {active && (
                      <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-primary text-white dark:text-[#1b1512]">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                    )}
                    {portraits[s] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={portraits[s]} alt="" className="h-24 w-24 object-contain" />
                    ) : (
                      <span className="h-24 w-24 animate-pulse rounded-full bg-card/70" />
                    )}
                    <span className="mt-1 text-sm font-extrabold text-ink">{p.title}</span>
                    <span className="text-[11px] font-semibold text-muted">{p.traits.slice(0, 2).join(" · ")}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Customize */}
          <Card>
            <CardHeader title={t("pet.page.customize", { name })} />
            <div className="space-y-5 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
              <div>
                <p className="mb-2 text-sm font-medium text-ink">{t("pet.page.coat")}</p>
                <div role="radiogroup" aria-label={t("pet.page.coatLabel")} className="flex flex-wrap gap-2">
                  {persona.coats.map((c) => {
                    const active = c.id === coat.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setPet({ coats: { ...pet.coats, [species]: c.id } })}
                        className={cx("flex items-center gap-2 rounded-full border-2 py-1 pl-1 pr-3 text-xs font-bold transition-colors", active ? "border-primary bg-primary-soft text-ink" : "border-line text-ink-soft hover:border-primary/40")}
                      >
                        <span className="h-6 w-6 rounded-full border border-black/10" style={{ background: `linear-gradient(135deg, ${c.body} 55%, ${c.belly} 55%)` }} />
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t("pet.page.name")} htmlFor="pet-name" error={nameError ? t("pet.page.nameTooLong", { n: NAME_MAX }) : undefined} hint={t("pet.page.nameHint", { name: persona.defaultName })}>
                  <Input
                    id="pet-name"
                    value={nameDraft}
                    maxLength={NAME_MAX + 4}
                    placeholder={persona.defaultName}
                    invalid={Boolean(nameError)}
                    onChange={(e) => setNameDraft(e.target.value)}
                    onBlur={() => saveName(nameDraft)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveName(nameDraft);
                    }}
                  />
                </Field>
                <div>
                  <p className="mb-1.5 text-sm font-medium text-ink">{t("pet.page.size")}</p>
                  <Segmented<PetSize> value={pet.size} onChange={(v) => setPet({ size: v })} options={[{ value: "s", label: t("pet.page.small") }, { value: "m", label: t("pet.page.medium") }, { value: "l", label: t("pet.page.large") }]} />
                </div>
              </div>

              <div className="divide-y divide-line rounded-2xl bg-subtle/60 px-4">
                <label className="flex items-center justify-between gap-4 py-3">
                  <span>
                    <span className="block text-sm font-bold text-ink">{t("pet.page.show")}</span>
                    <span className="block text-xs text-muted">{t("pet.page.showDesc")}</span>
                  </span>
                  <Toggle checked={pet.visible} onChange={(v) => setPet({ visible: v })} label={t("pet.page.show")} />
                </label>
                <label className="flex items-center justify-between gap-4 py-3">
                  <span>
                    <span className="block text-sm font-bold text-ink">{t("pet.page.sound")}</span>
                    <span className="block text-xs text-muted">{t("pet.page.soundDesc")}</span>
                  </span>
                  <Toggle
                    checked={pet.sound}
                    onChange={(v) => {
                      if (v) {
                        unlockAudio();
                        sounds.happy();
                      }
                      setPet({ sound: v });
                    }}
                    label={t("pet.page.sound")}
                  />
                </label>
              </div>

              <Button variant="secondary" onClick={() => setPet({ position: null, visible: true })}>
                <RotateCcw className="h-4 w-4" /> {t("pet.page.bringBack", { name })}
              </Button>
            </div>
          </Card>

          {/* How to play */}
          <Card>
            <CardHeader title={t("pet.page.howTo")} />
            <ul className="grid gap-3 px-5 pb-5 pt-4 text-sm sm:grid-cols-2 sm:px-6 sm:pb-6">
              {[
                { icon: Move, title: t("pet.page.how.move"), body: t("pet.page.how.moveBody") },
                { icon: Heart, title: t("pet.page.how.pet"), body: t("pet.page.how.petBody") },
                { icon: MessageCircle, title: t("pet.page.how.hi"), body: t("pet.page.how.hiBody") },
                { icon: Moon, title: t("pet.page.how.naps"), body: t("pet.page.how.napsBody") },
                { icon: Hand, title: t("pet.page.how.cheers"), body: t("pet.page.how.cheersBody") },
                { icon: Keyboard, title: t("pet.page.how.keys"), body: t("pet.page.how.keysBody") },
              ].map((x) => (
                <li key={x.title} className="flex gap-3 rounded-2xl bg-subtle/60 p-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-strong">
                    <x.icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block font-bold text-ink">{x.title}</span>
                    <span className="block text-ink-soft">{x.body}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
