"use client";

import { tr } from "@/i18n";
import { useEffect, useRef, useState } from "react";
import type { PetSpecies } from "@/lib/types";
import type { Coat } from "./pets";
import type { PetEngine } from "./engine";

/** Watches the `dark` class that ThemeApplier puts on <html>. */
export function useDarkClass() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const el = document.documentElement;
    const read = () => setDark(el.classList.contains("dark"));
    read();
    const mo = new MutationObserver(read);
    mo.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);
  return dark;
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const read = () => setReduced(mq.matches);
    read();
    mq.addEventListener("change", read);
    return () => mq.removeEventListener("change", read);
  }, []);
  return reduced;
}

let enginePromise: Promise<typeof import("./engine")> | null = null;
export function loadEngine() {
  enginePromise ??= import("./engine");
  return enginePromise;
}

export function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * A transparent canvas that hosts one animated 3D pet. The parent drives it
 * through the engine handed to `onEngine`.
 */
export function PetCanvas({
  species,
  coat,
  className,
  onEngine,
  yaw,
}: {
  species: PetSpecies;
  coat: Coat;
  className?: string;
  onEngine?: (e: PetEngine | null) => void;
  yaw?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<PetEngine | null>(null);
  const dark = useDarkClass();
  const reduced = useReducedMotion();
  const [failed, setFailed] = useState(false);
  const initial = useRef({ species, coat, dark, yaw });
  const onEngineRef = useRef(onEngine);
  onEngineRef.current = onEngine;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (!hasWebGL()) {
      setFailed(true);
      return;
    }
    let cancelled = false;
    let ro: ResizeObserver | null = null;
    loadEngine()
      .then(({ PetEngine }) => {
        if (cancelled) return;
        const i = initial.current;
        const engine = new PetEngine(canvas, { species: i.species, coat: i.coat, dark: document.documentElement.classList.contains("dark"), reducedMotion: reduced, yaw: i.yaw });
        engineRef.current = engine;
        ro = new ResizeObserver(() => engine.resize(canvas.clientWidth || 1, canvas.clientHeight || 1));
        ro.observe(canvas);
        engine.start();
        onEngineRef.current?.(engine);
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      ro?.disconnect();
      engineRef.current?.dispose();
      engineRef.current = null;
      onEngineRef.current?.(null);
    };
    // Recreate only when reduced-motion changes; other props update in place.
  }, [reduced]);

  useEffect(() => {
    engineRef.current?.setPet(species, coat);
  }, [species, coat]);

  useEffect(() => {
    engineRef.current?.setTheme(dark);
  }, [dark]);

  if (failed)
    return (
      <div className={className} role="img" aria-label={tr("pet.page.noWebglLabel")}>
        <div className="grid h-full w-full place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary-strong">{tr("pet.page.noWebgl")}</div>
      </div>
    );
  return <canvas ref={ref} className={className} aria-hidden />;
}
