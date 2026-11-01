"use client";

import { tr } from "@/i18n";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { useStore } from "@/lib/store";
import { cx } from "@/components/ui";
import type { PetPrefs } from "@/lib/types";
import { PetCanvas } from "./PetCanvas";
import type { PetEngine } from "./engine";
import { PETS, SIZE_PX, coatFor, petName, pick, pickWeighted, type Emotion, type PetAction } from "./pets";
import { sounds, unlockAudio } from "./sound";
import { PetChatWindow, placeChat, usePetChat, type ChatView } from "./PetChat";

const LAST_SEEN_KEY = "haruka-pet-last-seen";
const MARGIN = 8;

interface Heart {
  id: number;
  x: number;
  dx: number;
  r: number;
  size: number;
  delay: number;
  tone: number;
}

function viewport() {
  return { w: window.innerWidth, h: window.innerHeight, lg: window.innerWidth >= 1024 };
}

function sizeFor(prefs: PetPrefs) {
  const base = SIZE_PX[prefs.size] ?? SIZE_PX.m;
  return Math.round(window.innerWidth < 640 ? base * 0.8 : base);
}

function bounds(size: number) {
  const v = viewport();
  const bottom = v.lg ? MARGIN : 84; // keep clear of the mobile bottom bar
  return { minX: MARGIN, minY: MARGIN + 4, maxX: Math.max(MARGIN, v.w - size - MARGIN), maxY: Math.max(MARGIN, v.h - size - bottom) };
}

function clampPos(x: number, y: number, size: number) {
  const b = bounds(size);
  return { x: Math.min(b.maxX, Math.max(b.minX, x)), y: Math.min(b.maxY, Math.max(b.minY, y)) };
}

function resolvePos(prefs: PetPrefs, size: number) {
  const b = bounds(size);
  if (!prefs.position) return { x: b.maxX - (viewport().lg ? 20 : 4), y: b.maxY - (viewport().lg ? 16 : 0) };
  return clampPos(b.minX + prefs.position.x * (b.maxX - b.minX), b.minY + prefs.position.y * (b.maxY - b.minY), size);
}

function toFraction(x: number, y: number, size: number) {
  const b = bounds(size);
  const fx = b.maxX > b.minX ? (x - b.minX) / (b.maxX - b.minX) : 1;
  const fy = b.maxY > b.minY ? (y - b.minY) / (b.maxY - b.minY) : 1;
  return { x: Math.round(Math.min(1, Math.max(0, fx)) * 1000) / 1000, y: Math.round(Math.min(1, Math.max(0, fy)) * 1000) / 1000 };
}

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}

/** The floating companion that lives on every page. */
export function PetCompanion() {
  const { state, ready } = useStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Let the page paint first; the 3D pet is a nice-to-have, never a blocker.
    const w = window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(() => setMounted(true), { timeout: 1500 });
    else setTimeout(() => setMounted(true), 600);
  }, []);
  if (!ready || !mounted || !state.pet.visible) return null;
  return <Companion />;
}

function Companion() {
  const { state, update } = useStore();
  const prefs = state.pet;
  const species = prefs.species;
  const persona = PETS[species];
  const coat = coatFor(species, prefs.coats[species]);
  const name = petName(species, prefs.names);
  const pathname = usePathname();

  const boxRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<PetEngine | null>(null);
  const [size, setSize] = useState(() => sizeFor(prefs));
  const sizeRef = useRef(size);
  sizeRef.current = size;
  const pos = useRef(resolvePos(prefs, size));
  const target = useRef({ ...pos.current });
  const [placed, setPlaced] = useState({ ...pos.current });

  const [bubble, setBubble] = useState<{ text: string; id: number } | null>(null);
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [sleeping, setSleeping] = useState(false);
  const [mood, setMoodLabel] = useState<Emotion>(persona.restingEmotion);
  const [dragging, setDragging] = useState(false);

  // Latest values for long-lived listeners
  const live = useRef({ persona, prefs, name, focus: false });
  live.current = { persona, prefs, name, focus: Boolean(state.timer && state.timer.mode === "focus" && state.timer.startedAt) };

  const timers = useRef<{ mood?: ReturnType<typeof setTimeout>; bubble?: ReturnType<typeof setTimeout> }>({});
  const sleepState = useRef({ sleeping: false, sleepy: false, lastInput: Date.now() });
  const dragState = useRef({ active: false, pending: false, pointerId: -1, type: "mouse", sx: 0, sy: 0, ox: 0, oy: 0, vx: 0, lastX: 0, moved: false, rubbing: false, longPress: undefined as ReturnType<typeof setTimeout> | undefined });
  const rub = useRef({ lastX: 0, lastY: 0, dir: 0, travel: 0, flips: [] as number[], lastPet: 0, lastSound: 0 });
  const pokes = useRef<number[]>([]);
  const heartId = useRef(0);
  const busyUntil = useRef(0);
  // The AI chat (set up below, used by the click handler and speech bubbles)
  const chatApi = useRef<{ open: () => void; view: ChatView }>({ open: () => {}, view: "closed" });

  // ---------- helpers ----------
  const applyTransform = useCallback(() => {
    const el = boxRef.current;
    if (el) el.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
  }, []);

  const resting = useCallback((): Emotion => (live.current.focus ? "relaxed" : live.current.persona.restingEmotion), []);

  const setMood = useCallback(
    (e: Emotion, ms?: number) => {
      engineRef.current?.setEmotion(e);
      setMoodLabel(e);
      if (timers.current.mood) clearTimeout(timers.current.mood);
      if (ms) {
        timers.current.mood = setTimeout(() => {
          if (sleepState.current.sleeping) return;
          const r = resting();
          engineRef.current?.setEmotion(r);
          setMoodLabel(r);
        }, ms);
      }
    },
    [resting],
  );

  const say = useCallback((text: string, ms = 2800) => {
    if (chatApi.current.view === "open") return; // the chat window does the talking
    if (timers.current.bubble) clearTimeout(timers.current.bubble);
    setBubble({ text, id: Date.now() });
    timers.current.bubble = setTimeout(() => setBubble(null), ms);
  }, []);

  const play = useCallback((a: PetAction | undefined, dir?: number) => {
    if (!a) return;
    engineRef.current?.play(a, dir ?? (Math.random() < 0.5 ? -1 : 1));
    busyUntil.current = Date.now() + 1500;
  }, []);

  const sound = useCallback((kind: keyof typeof sounds) => {
    if (live.current.prefs.sound) sounds[kind]();
  }, []);

  // ---------- AI chat ----------
  const chat = usePetChat({
    species,
    name,
    lang: state.settings.language,
    onThinking: () => {
      setMood("curious");
      play("lookAround");
    },
    onReply: () => {
      setMood("happy", 3200);
      play("nod");
    },
  });
  chatApi.current = { open: chat.open, view: chat.view };
  useEffect(() => {
    if (chat.view === "open") setBubble(null);
  }, [chat.view]);
  // A different pet means a different conversation.
  const closeChat = chat.close;
  useEffect(() => closeChat(), [species, closeChat]);

  const burstHearts = useCallback((n: number) => {
    const s = sizeRef.current;
    const add: Heart[] = Array.from({ length: n }, (_, i) => ({
      id: ++heartId.current,
      x: s * rand(0.25, 0.75),
      dx: rand(-36, 36),
      r: rand(-22, 22),
      size: rand(14, 24),
      delay: i * 70 + rand(0, 60),
      tone: Math.floor(rand(0, 3)),
    }));
    setHearts((h) => [...h.slice(-24), ...add]);
    const ids = new Set(add.map((h) => h.id));
    setTimeout(() => setHearts((h) => h.filter((x) => !ids.has(x.id))), 2300);
  }, []);

  const savePosition = useCallback(() => {
    const f = toFraction(pos.current.x, pos.current.y, sizeRef.current);
    update((s) => ({ ...s, pet: { ...s.pet, position: f } }));
  }, [update]);

  const wake = useCallback(
    (gentle = false) => {
      const ss = sleepState.current;
      if (!ss.sleeping && !ss.sleepy) return;
      const wasAsleep = ss.sleeping;
      ss.sleeping = false;
      ss.sleepy = false;
      setSleeping(false);
      engineRef.current?.setSleeping(false);
      if (wasAsleep && !gentle) {
        setMood("surprised", 900);
        setTimeout(() => {
          setMood("happy", 2600);
          say(pick(live.current.persona.lines.wake));
        }, 900);
      } else setMood(resting());
    },
    [resting, say, setMood],
  );

  // ---------- reactions ----------
  const onClick = useCallback(() => {
    const now = Date.now();
    if (sleepState.current.sleeping) {
      wake();
      chatApi.current.open();
      return;
    }
    chatApi.current.open();
    pokes.current = [...pokes.current.filter((t) => now - t < 3000), now];
    if (pokes.current.length >= 5) {
      pokes.current = [];
      setMood("sad", 4200);
      say(pick(live.current.persona.lines.poke), 3200);
      return;
    }
    const r = pick(live.current.persona.click);
    setMood(r.emotion, 2800);
    play(r.action);
    sound("boop");
    if (Math.random() < 0.55) say(pick(live.current.persona.lines.click));
  }, [play, say, setMood, sound, wake]);

  const onPetted = useCallback(() => {
    const now = Date.now();
    const rb = rub.current;
    if (sleepState.current.sleeping || sleepState.current.sleepy) wake(true);
    if (now - rb.lastPet < 900) {
      // still petting: keep the love going
      setMood("loved", 3800);
      burstHearts(2);
      rb.lastPet = now;
      return;
    }
    rb.lastPet = now;
    setMood("loved", 4400);
    play(live.current.persona.petted);
    burstHearts(7);
    say(tr("pet.loveYou"), 2600);
    if (now - rb.lastSound > 1800) {
      sound("love");
      rb.lastSound = now;
    }
  }, [burstHearts, play, say, setMood, sound, wake]);

  /** Back-and-forth movement detector: needs several direction changes within a short window. */
  const feedRub = useCallback(
    (x: number, y: number, touch: boolean) => {
      const rb = rub.current;
      const dx = x - rb.lastX;
      const dy = y - rb.lastY;
      rb.lastX = x;
      rb.lastY = y;
      const d = touch && Math.abs(dy) > Math.abs(dx) ? dy : dx;
      if (Math.abs(d) < 1.5) return;
      const sign = Math.sign(d);
      const now = Date.now();
      if (sign !== rb.dir) {
        if (rb.dir !== 0 && rb.travel > 10) rb.flips.push(now);
        rb.dir = sign;
        rb.travel = 0;
      }
      rb.travel += Math.abs(d);
      rb.flips = rb.flips.filter((t) => now - t < 1300);
      if (rb.flips.length >= 4) {
        rb.flips = [];
        onPetted();
      }
    },
    [onPetted],
  );

  // ---------- engine ready: greet ----------
  const onEngine = useCallback(
    (e: PetEngine | null) => {
      engineRef.current = e;
      if (!e) return;
      e.setEmotion(resting());
      let last = 0;
      try {
        last = Number(localStorage.getItem(LAST_SEEN_KEY) || 0);
        localStorage.setItem(LAST_SEEN_KEY, String(Date.now()));
      } catch {
        /* storage blocked */
      }
      const away = Date.now() - last;
      if (!last) {
        setTimeout(() => {
          setMood("happy", 3000);
          play("nod");
          say(pick(live.current.persona.lines.hello), 3400);
        }, 500);
      } else if (away > 15 * 60_000) {
        setTimeout(() => {
          setMood("excited", 3200);
          play(live.current.persona.species === "rabbit" ? "hop" : "jump");
          say(pick(live.current.persona.lines.back), 3200);
        }, 500);
      }
    },
    [play, resting, say, setMood],
  );

  // ---------- species / size changes ----------
  useEffect(() => {
    engineRef.current?.setEmotion(resting());
    setMoodLabel(resting());
  }, [species, resting]);

  useEffect(() => {
    const s = sizeFor(prefs);
    setSize(s);
    pos.current = clampPos(pos.current.x, pos.current.y, s);
    target.current = { ...pos.current };
    applyTransform();
    setPlaced({ ...pos.current });
  }, [prefs.size, applyTransform]); // eslint-disable-line react-hooks/exhaustive-deps

  // Position reset from the pet page (position set back to null)
  useEffect(() => {
    if (prefs.position === null && !dragState.current.active) {
      pos.current = resolvePos(prefs, sizeRef.current);
      target.current = { ...pos.current };
      applyTransform();
      setPlaced({ ...pos.current });
    }
  }, [prefs.position, applyTransform]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- window-level listeners ----------
  useEffect(() => {
    applyTransform();
    let lookRaf = 0;
    let lastLook = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      sleepState.current.lastInput = Date.now();
      if (sleepState.current.sleeping && e.pointerType === "mouse") {
        // only wake from sleep when the cursor comes close
        const cx = pos.current.x + sizeRef.current / 2;
        const cy = pos.current.y + sizeRef.current / 2;
        if (Math.hypot(e.clientX - cx, e.clientY - cy) < sizeRef.current * 1.4) wake();
      } else if (sleepState.current.sleepy) wake(true);
      if (e.pointerType !== "mouse") return;
      lastLook = { x: e.clientX, y: e.clientY };
      if (lookRaf) return;
      lookRaf = requestAnimationFrame(() => {
        lookRaf = 0;
        const s = sizeRef.current;
        const cx = pos.current.x + s / 2;
        const cy = pos.current.y + s * 0.4;
        const k = live.current.persona.curiosity;
        engineRef.current?.setLook(((lastLook.x - cx) / (window.innerWidth * 0.45)) * k, ((lastLook.y - cy) / (window.innerHeight * 0.45)) * k);
      });
    };
    const onInput = () => {
      sleepState.current.lastInput = Date.now();
      if (sleepState.current.sleepy) wake(true);
    };
    const onLeave = () => engineRef.current?.setLook(null);
    let hiddenAt = 0;
    const onVis = () => {
      if (document.hidden) {
        hiddenAt = Date.now();
        try {
          localStorage.setItem(LAST_SEEN_KEY, String(Date.now()));
        } catch {
          /* ignore */
        }
      } else if (hiddenAt && Date.now() - hiddenAt > 60_000) {
        sleepState.current.lastInput = Date.now();
        if (sleepState.current.sleeping) wake(true);
        setTimeout(() => {
          setMood("excited", 3000);
          play(live.current.persona.species === "rabbit" ? "hop" : "jump");
          say(pick(live.current.persona.lines.back), 3000);
        }, 300);
      }
    };
    const onResize = () => {
      const s = sizeFor(live.current.prefs);
      setSize(s);
      pos.current = resolvePos(live.current.prefs, s);
      target.current = { ...pos.current };
      applyTransform();
      setPlaced({ ...pos.current });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("keydown", onInput);
    window.addEventListener("wheel", onInput, { passive: true });
    window.addEventListener("touchstart", onInput, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("resize", onResize);
    const seen = setInterval(() => {
      try {
        if (!document.hidden) localStorage.setItem(LAST_SEEN_KEY, String(Date.now()));
      } catch {
        /* ignore */
      }
    }, 30_000);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("keydown", onInput);
      window.removeEventListener("wheel", onInput);
      window.removeEventListener("touchstart", onInput);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
      clearInterval(seen);
      if (lookRaf) cancelAnimationFrame(lookRaf);
    };
  }, [applyTransform, play, say, setMood, wake]);

  // ---------- idle habits + falling asleep ----------
  useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout>;
    const scheduleIdle = () => {
      const [a, b] = live.current.persona.idleEvery;
      idleTimer = setTimeout(runIdle, rand(a, b) * 1000);
    };
    const runIdle = () => {
      const ss = sleepState.current;
      if (!document.hidden && !ss.sleeping && !ss.sleepy && !dragState.current.active && Date.now() > busyUntil.current) {
        const p = live.current.persona;
        const habit = pickWeighted(p.idle);
        if (habit.action === "walk") {
          const s = sizeRef.current;
          const b = bounds(s);
          let dir = Math.random() < 0.5 ? -1 : 1;
          if (pos.current.x + dir * 40 > b.maxX || pos.current.x + dir * 40 < b.minX) dir = -dir;
          const nx = clampPos(pos.current.x + dir * rand(24, 56), pos.current.y, s);
          const el = boxRef.current;
          if (el) {
            el.style.transition = "transform 1.6s cubic-bezier(0.45, 0, 0.3, 1)";
            pos.current = nx;
            target.current = { ...nx };
            applyTransform();
            setTimeout(() => {
              if (boxRef.current) boxRef.current.style.transition = "";
              setPlaced({ ...pos.current });
              savePosition();
            }, 1650);
          }
          play("walk", dir);
        } else play(habit.action);
        if (habit.emotion) setMood(habit.emotion, 3600);
        if (Math.random() < (live.current.focus ? 0.06 : 0.22)) say(pick(p.lines.idle));
      }
      scheduleIdle();
    };
    scheduleIdle();
    const sleepCheck = setInterval(() => {
      const ss = sleepState.current;
      if (dragState.current.active || document.hidden) return;
      const idle = (Date.now() - ss.lastInput) / 1000;
      const limit = live.current.persona.sleepAfter;
      if (!ss.sleepy && !ss.sleeping && idle > limit) {
        ss.sleepy = true;
        setMood("sleepy");
      } else if (ss.sleepy && !ss.sleeping && idle > limit + 8) {
        ss.sleeping = true;
        ss.sleepy = false;
        setSleeping(true);
        setBubble(null);
        engineRef.current?.setSleeping(true);
      }
    }, 2000);
    return () => {
      clearTimeout(idleTimer);
      clearInterval(sleepCheck);
    };
  }, [applyTransform, play, savePosition, say, setMood]);

  // ---------- contextual reactions to study progress ----------
  const progressRef = useRef<{ tasks: number; sessions: number; timer: boolean } | null>(null);
  const taskCount = Object.keys(state.completedTasks).length;
  const sessionCount = state.sessions.length;
  const timerRunning = Boolean(state.timer && state.timer.mode === "focus" && state.timer.startedAt);
  useEffect(() => {
    const prev = progressRef.current;
    progressRef.current = { tasks: taskCount, sessions: sessionCount, timer: timerRunning };
    if (!prev) return;
    if (taskCount > prev.tasks || sessionCount > prev.sessions) {
      if (sleepState.current.sleeping) wake(true);
      setMood("excited", 3200);
      play(live.current.persona.species === "rabbit" ? "hop" : live.current.persona.species === "fox" ? "pounce" : "jump");
      say(pick(live.current.persona.lines.win));
      sound("happy");
    } else if (timerRunning && !prev.timer) {
      setMood("relaxed");
      say(tr("pet.focusQuiet"), 2600);
    }
  }, [taskCount, sessionCount, timerRunning, play, say, setMood, sound, wake]);

  // Curious glance on page changes
  const firstPath = useRef(true);
  useEffect(() => {
    if (firstPath.current) {
      firstPath.current = false;
      return;
    }
    if (sleepState.current.sleeping || Math.random() > 0.35) return;
    play("lookAround");
    setMood("curious", 2600);
  }, [pathname, play, setMood]);

  // ---------- pointer interaction on the pet ----------
  const followRaf = useRef(0);
  const follow = useCallback(() => {
    const d = dragState.current;
    const prevX = pos.current.x;
    pos.current.x += (target.current.x - pos.current.x) * 0.35;
    pos.current.y += (target.current.y - pos.current.y) * 0.35;
    d.vx = d.vx * 0.7 + ((pos.current.x - prevX) * 60) * 0.3;
    engineRef.current?.setDragging(d.active, d.vx);
    applyTransform();
    const settled = Math.abs(target.current.x - pos.current.x) < 0.3 && Math.abs(target.current.y - pos.current.y) < 0.3;
    if (d.active || !settled) followRaf.current = requestAnimationFrame(follow);
    else {
      followRaf.current = 0;
      pos.current = { ...target.current };
      applyTransform();
      engineRef.current?.setDragging(false, 0);
    }
  }, [applyTransform]);

  const beginDrag = useCallback(() => {
    const d = dragState.current;
    if (d.active) return;
    d.active = true;
    setDragging(true);
    if (boxRef.current) boxRef.current.style.transition = "";
    document.body.style.userSelect = "none";
    if (sleepState.current.sleeping) wake(true);
    const r = live.current.persona.drag;
    setMood(r.emotion);
    if (Math.random() < 0.5) say(pick(live.current.persona.lines.drag), 1800);
    if (!followRaf.current) followRaf.current = requestAnimationFrame(follow);
  }, [follow, say, setMood, wake]);

  const endDrag = useCallback(() => {
    const d = dragState.current;
    if (!d.active) return;
    d.active = false;
    setDragging(false);
    document.body.style.userSelect = "";
    target.current = clampPos(target.current.x, target.current.y, sizeRef.current);
    if (!followRaf.current) followRaf.current = requestAnimationFrame(follow);
    setTimeout(() => {
      pos.current = { ...target.current };
      setPlaced({ ...pos.current });
      savePosition();
    }, 260);
    const r = live.current.persona.drop;
    setMood(r.emotion, 3000);
    setTimeout(() => play(r.action), 200);
    if (Math.random() < 0.5) say(pick(live.current.persona.lines.drop), 2200);
  }, [follow, play, savePosition, say, setMood]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const d = dragState.current;
    sleepState.current.lastInput = Date.now();
    if (live.current.prefs.sound) unlockAudio();
    d.pending = true;
    d.moved = false;
    d.rubbing = false;
    d.pointerId = e.pointerId;
    d.type = e.pointerType;
    d.sx = e.clientX;
    d.sy = e.clientY;
    d.ox = e.clientX - pos.current.x;
    d.oy = e.clientY - pos.current.y;
    rub.current.lastX = e.clientX;
    rub.current.lastY = e.clientY;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    if (e.pointerType === "touch") {
      // Touch: press and hold to pick up; quick rubbing counts as petting.
      d.longPress = setTimeout(() => {
        if (d.pending && !d.rubbing) {
          beginDrag();
          try {
            navigator.vibrate?.(12);
          } catch {
            /* ignore */
          }
        }
      }, 280);
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragState.current;
    if (d.active) {
      e.preventDefault();
      target.current = clampPos(e.clientX - d.ox, e.clientY - d.oy, sizeRef.current);
      return;
    }
    if (d.pending && e.pointerId === d.pointerId) {
      const dist = Math.hypot(e.clientX - d.sx, e.clientY - d.sy);
      if (d.type !== "touch") {
        if (dist > 5) {
          d.moved = true;
          beginDrag();
          target.current = clampPos(e.clientX - d.ox, e.clientY - d.oy, sizeRef.current);
        }
      } else {
        if (dist > 8) {
          d.moved = true;
          d.rubbing = true;
          if (d.longPress) clearTimeout(d.longPress);
        }
        if (d.rubbing) feedRub(e.clientX, e.clientY, true);
      }
      return;
    }
    if (e.pointerType === "mouse" && e.buttons === 0) feedRub(e.clientX, e.clientY, false);
  };

  const finishPointer = (e: React.PointerEvent, cancelled = false) => {
    const d = dragState.current;
    if (d.longPress) clearTimeout(d.longPress);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    if (d.active) endDrag();
    else if (d.pending && !d.moved && !cancelled) onClick();
    d.pending = false;
    d.rubbing = false;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 64 : 24;
    const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    } else if (e.key.toLowerCase() === "p") {
      onPetted();
    } else if (moves[e.key]) {
      e.preventDefault();
      const [dx, dy] = moves[e.key];
      pos.current = clampPos(pos.current.x + dx, pos.current.y + dy, sizeRef.current);
      target.current = { ...pos.current };
      applyTransform();
      setPlaced({ ...pos.current });
      savePosition();
    }
  };

  useEffect(
    () => () => {
      if (followRaf.current) cancelAnimationFrame(followRaf.current);
      if (timers.current.mood) clearTimeout(timers.current.mood);
      if (timers.current.bubble) clearTimeout(timers.current.bubble);
      document.body.style.userSelect = "";
    },
    [],
  );

  // Bubble placement: flip below when near the top, hug the nearest edge horizontally.
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const below = placed.y < 90;
  const align = placed.x < 70 ? "left" : placed.x > vw - size - 70 ? "right" : "center";

  return (
    <>
    <PetChatWindow name={name} species={species} chat={chat} placement={placeChat(placed, size)} />
    <div
      ref={boxRef}
      className="fixed left-0 top-0 z-[35] print:hidden"
      style={{ width: size, height: size, transform: `translate3d(${placed.x}px, ${placed.y}px, 0)` }}
      data-testid="pet-companion"
      data-mood={mood}
      data-sleeping={sleeping ? "true" : "false"}
    >
      {bubble && (
        <div
          key={bubble.id}
          role="status"
          className={cx(
            "pet-pop pointer-events-none absolute z-10 w-max max-w-[210px] rounded-2xl border border-line bg-card px-3 py-2 text-[13px] font-bold leading-snug text-ink shadow-soft",
            below ? "top-[calc(100%-6px)]" : "bottom-[calc(100%-10px)]",
            align === "center" && "left-1/2 -translate-x-1/2",
            align === "left" && "left-1",
            align === "right" && "right-1",
          )}
          data-testid="pet-bubble"
        >
          {bubble.text}
        </div>
      )}
      {hearts.map((h) => (
        <span
          key={h.id}
          aria-hidden
          className="pet-heart pointer-events-none absolute z-10"
          style={{ left: h.x, top: size * 0.22, width: h.size, height: h.size, animationDelay: `${h.delay}ms`, "--dx": `${h.dx}px`, "--r": `${h.r}deg` } as CSSProperties}
        >
          <svg viewBox="0 0 24 24" width={h.size} height={h.size}>
            <defs>
              <linearGradient id={`ph${h.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={["#ff8fb1", "#ff9e7a", "#ff7aa8"][h.tone]} />
                <stop offset="1" stopColor={["#f2557f", "#f26b5b", "#e64c8b"][h.tone]} />
              </linearGradient>
            </defs>
            <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.9 4.5 6.6 4.5c2.1 0 3.7 1.2 5.4 3.2 1.7-2 3.3-3.2 5.4-3.2 3.7 0 5.7 3.9 4.2 7.3C19.5 16.4 12 21 12 21z" fill={`url(#ph${h.id})`} stroke="#fff" strokeOpacity=".7" strokeWidth="1.2" />
          </svg>
        </span>
      ))}
      {sleeping && (
        <div aria-hidden className="pointer-events-none absolute right-[18%] top-[6%] font-extrabold text-primary-strong">
          <span className="pet-z absolute text-sm">z</span>
          <span className="pet-z absolute left-2 -top-2 text-base" style={{ animationDelay: "0.8s" }}>z</span>
          <span className="pet-z absolute left-4 -top-4 text-lg" style={{ animationDelay: "1.6s" }}>Z</span>
        </div>
      )}
      <div
        role="button"
        tabIndex={0}
        aria-label={tr("pet.aria", { name, species: tr(`pet.species.${persona.species}.lower`), mood: sleeping ? tr("pet.asleep") : tr(`pet.mood.${mood}`) })}
        className={cx("relative h-full w-full touch-none select-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary/50", dragging ? "cursor-grabbing" : "cursor-grab")}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => finishPointer(e)}
        onPointerCancel={(e) => finishPointer(e, true)}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse" && !dragState.current.active) rub.current.flips = [];
        }}
        onKeyDown={onKeyDown}
        onContextMenu={(e) => e.preventDefault()}
        style={{ WebkitTouchCallout: "none" } as CSSProperties}
      >
        <PetCanvas species={species} coat={coat} onEngine={onEngine} className="pointer-events-none h-full w-full" />
      </div>
    </div>
    </>
  );
}
