import { tr, trList } from "@/i18n";
import type { PetSpecies } from "@/lib/types";

/** Everything here is plain data so the selection UI never has to load the 3D engine. */

export type Emotion = "happy" | "excited" | "curious" | "sleepy" | "sad" | "surprised" | "relaxed" | "loved";
export const EMOTIONS: { id: Emotion; label: string }[] = [
  { id: "happy", get label() { return tr("pet.emotion.happy"); } },
  { id: "excited", get label() { return tr("pet.emotion.excited"); } },
  { id: "curious", get label() { return tr("pet.emotion.curious"); } },
  { id: "sleepy", get label() { return tr("pet.emotion.sleepy"); } },
  { id: "sad", get label() { return tr("pet.emotion.sad"); } },
  { id: "surprised", get label() { return tr("pet.emotion.surprised"); } },
  { id: "relaxed", get label() { return tr("pet.emotion.relaxed"); } },
  { id: "loved", get label() { return tr("pet.emotion.loved"); } },
];

export type PetAction =
  | "jump"
  | "hop"
  | "spin"
  | "stretch"
  | "groom"
  | "earTwitch"
  | "lookAround"
  | "wiggle"
  | "tailChase"
  | "pounce"
  | "nod"
  | "walk";

export interface Coat {
  id: string;
  label: string;
  body: string;
  belly: string;
  accent: string; // inner ears, nose
  detail: string; // ear tips, paws, tail tip
}

export interface Reaction {
  emotion: Emotion;
  action?: PetAction;
}

export interface Personality {
  species: PetSpecies;
  defaultName: string;
  title: string;
  traits: string[];
  summary: string;
  /** Mood the pet drifts back to when nothing is happening. */
  restingEmotion: Emotion;
  /** 0..1: how lively body motion is. */
  energy: number;
  /** 0..1: how strongly the head follows the cursor. */
  curiosity: number;
  /** Seconds between idle habits [min, max]. */
  idleEvery: [number, number];
  idle: { action: PetAction; emotion?: Emotion; weight: number }[];
  click: Reaction[];
  petted: PetAction;
  drag: Reaction;
  drop: Reaction;
  /** Seconds without any input before the pet dozes off. */
  sleepAfter: number;
  lines: {
    hello: string[];
    click: string[];
    idle: string[];
    back: string[];
    drag: string[];
    drop: string[];
    wake: string[];
    win: string[];
    poke: string[];
  };
  coats: Coat[];
}

const LINE_KEYS = ["hello", "click", "idle", "back", "drag", "drop", "wake", "win", "poke"] as const;

/** Speech-bubble lines in the current interface language. */
function speciesLines(species: PetSpecies): Personality["lines"] {
  return Object.fromEntries(LINE_KEYS.map((k) => [k, trList(`pet.lines.${species}.${k}`)])) as Personality["lines"];
}

export const PETS: Record<PetSpecies, Personality> = {
  cat: {
    species: "cat",
    defaultName: "Mochi",
    get title() { return tr("pet.species.cat.title"); },
    get traits() { return trList("pet.species.cat.traits"); },
    get summary() { return tr("pet.species.cat.summary"); },
    restingEmotion: "relaxed",
    energy: 0.35,
    curiosity: 1,
    idleEvery: [9, 18],
    idle: [
      { action: "stretch", emotion: "relaxed", weight: 3 },
      { action: "groom", emotion: "relaxed", weight: 3 },
      { action: "lookAround", emotion: "curious", weight: 3 },
      { action: "earTwitch", weight: 2 },
      { action: "walk", emotion: "curious", weight: 1 },
      { action: "spin", emotion: "happy", weight: 1 },
    ],
    click: [
      { emotion: "curious", action: "earTwitch" },
      { emotion: "happy", action: "nod" },
      { emotion: "relaxed", action: "groom" },
    ],
    petted: "wiggle",
    drag: { emotion: "surprised" },
    drop: { emotion: "relaxed", action: "groom" },
    sleepAfter: 60,
    get lines() { return speciesLines("cat"); },
    coats: [
      { id: "ginger", get label() { return tr("pet.coats.cat.ginger"); }, body: "#f0a160", belly: "#fff1e2", accent: "#f7a3a8", detail: "#d9783b" },
      { id: "grey", get label() { return tr("pet.coats.cat.grey"); }, body: "#a9adb8", belly: "#f1f2f5", accent: "#f2a7b3", detail: "#7d828f" },
      { id: "black", get label() { return tr("pet.coats.cat.black"); }, body: "#3a3637", belly: "#5a5455", accent: "#e893a0", detail: "#262324" },
      { id: "cream", get label() { return tr("pet.coats.cat.cream"); }, body: "#f3dfc4", belly: "#fffaf2", accent: "#f4a9ad", detail: "#cfae86" },
    ],
  },
  dog: {
    species: "dog",
    defaultName: "Biscuit",
    get title() { return tr("pet.species.dog.title"); },
    get traits() { return trList("pet.species.dog.traits"); },
    get summary() { return tr("pet.species.dog.summary"); },
    restingEmotion: "happy",
    energy: 0.9,
    curiosity: 0.8,
    idleEvery: [6, 12],
    idle: [
      { action: "jump", emotion: "excited", weight: 3 },
      { action: "tailChase", emotion: "excited", weight: 2 },
      { action: "lookAround", emotion: "curious", weight: 2 },
      { action: "nod", emotion: "happy", weight: 2 },
      { action: "walk", emotion: "happy", weight: 2 },
    ],
    click: [
      { emotion: "excited", action: "jump" },
      { emotion: "happy", action: "tailChase" },
      { emotion: "excited", action: "spin" },
    ],
    petted: "jump",
    drag: { emotion: "excited" },
    drop: { emotion: "happy", action: "jump" },
    sleepAfter: 120,
    get lines() { return speciesLines("dog"); },
    coats: [
      { id: "golden", get label() { return tr("pet.coats.dog.golden"); }, body: "#e2b268", belly: "#fff1d6", accent: "#2e2522", detail: "#c08a42" },
      { id: "choc", get label() { return tr("pet.coats.dog.choc"); }, body: "#8a5a3e", belly: "#d8b597", accent: "#2b201c", detail: "#5e3b28" },
      { id: "dalmatian", get label() { return tr("pet.coats.dog.dalmatian"); }, body: "#f4f1ec", belly: "#ffffff", accent: "#2b2626", detail: "#3b3536" },
      { id: "shiba", get label() { return tr("pet.coats.dog.shiba"); }, body: "#e5884a", belly: "#fff6ea", accent: "#2b2321", detail: "#fff6ea" },
    ],
  },
  rabbit: {
    species: "rabbit",
    defaultName: "Yuki",
    get title() { return tr("pet.species.rabbit.title"); },
    get traits() { return trList("pet.species.rabbit.traits"); },
    get summary() { return tr("pet.species.rabbit.summary"); },
    restingEmotion: "relaxed",
    energy: 0.55,
    curiosity: 0.6,
    idleEvery: [7, 14],
    idle: [
      { action: "hop", emotion: "happy", weight: 3 },
      { action: "earTwitch", emotion: "curious", weight: 4 },
      { action: "groom", emotion: "relaxed", weight: 2 },
      { action: "lookAround", emotion: "curious", weight: 2 },
    ],
    click: [
      { emotion: "surprised", action: "hop" },
      { emotion: "curious", action: "earTwitch" },
      { emotion: "happy", action: "nod" },
    ],
    petted: "hop",
    drag: { emotion: "surprised" },
    drop: { emotion: "curious", action: "earTwitch" },
    sleepAfter: 80,
    get lines() { return speciesLines("rabbit"); },
    coats: [
      { id: "snow", get label() { return tr("pet.coats.rabbit.snow"); }, body: "#f5f2ef", belly: "#ffffff", accent: "#f5a9b6", detail: "#e3dcd6" },
      { id: "caramel", get label() { return tr("pet.coats.rabbit.caramel"); }, body: "#c99a72", belly: "#f6e7d6", accent: "#f3a6ae", detail: "#a87a54" },
      { id: "grey", get label() { return tr("pet.coats.rabbit.grey"); }, body: "#9fa2a8", belly: "#e7e8eb", accent: "#efa3b0", detail: "#81848b" },
      { id: "choc", get label() { return tr("pet.coats.rabbit.choc"); }, body: "#6e5243", belly: "#b99c8b", accent: "#e897a3", detail: "#523a2e" },
    ],
  },
  fox: {
    species: "fox",
    defaultName: "Kitsune",
    get title() { return tr("pet.species.fox.title"); },
    get traits() { return trList("pet.species.fox.traits"); },
    get summary() { return tr("pet.species.fox.summary"); },
    restingEmotion: "curious",
    energy: 0.7,
    curiosity: 0.9,
    idleEvery: [7, 13],
    idle: [
      { action: "pounce", emotion: "excited", weight: 3 },
      { action: "lookAround", emotion: "curious", weight: 3 },
      { action: "wiggle", emotion: "happy", weight: 2 },
      { action: "spin", emotion: "excited", weight: 1 },
      { action: "walk", emotion: "curious", weight: 2 },
    ],
    click: [
      { emotion: "excited", action: "pounce" },
      { emotion: "curious", action: "lookAround" },
      { emotion: "happy", action: "wiggle" },
    ],
    petted: "wiggle",
    drag: { emotion: "excited" },
    drop: { emotion: "curious", action: "lookAround" },
    sleepAfter: 100,
    get lines() { return speciesLines("fox"); },
    coats: [
      { id: "red", get label() { return tr("pet.coats.fox.red"); }, body: "#e2763c", belly: "#fff4e8", accent: "#2b2220", detail: "#2f2523" },
      { id: "arctic", get label() { return tr("pet.coats.fox.arctic"); }, body: "#eef0f3", belly: "#ffffff", accent: "#4a4d55", detail: "#b9c0cc" },
      { id: "silver", get label() { return tr("pet.coats.fox.silver"); }, body: "#7b7f8a", belly: "#e8e9ec", accent: "#2b2a2e", detail: "#2f2f34" },
      { id: "sand", get label() { return tr("pet.coats.fox.sand"); }, body: "#e6c08a", belly: "#fff7ea", accent: "#4a3a2e", detail: "#b58550" },
    ],
  },
};

export const SPECIES: PetSpecies[] = ["cat", "dog", "rabbit", "fox"];

export function coatFor(species: PetSpecies, coatId: string | undefined): Coat {
  const list = PETS[species].coats;
  return list.find((c) => c.id === coatId) ?? list[0];
}

export function petName(species: PetSpecies, names: Partial<Record<PetSpecies, string>>): string {
  return names[species]?.trim() || PETS[species].defaultName;
}

export function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export function pickWeighted<T extends { weight: number }>(list: T[]): T {
  const total = list.reduce((a, x) => a + x.weight, 0);
  let r = Math.random() * total;
  for (const x of list) {
    r -= x.weight;
    if (r <= 0) return x;
  }
  return list[list.length - 1];
}

export const SIZE_PX: Record<"s" | "m" | "l", number> = { s: 110, m: 140, l: 176 };
