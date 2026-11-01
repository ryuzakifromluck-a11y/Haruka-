"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { nextMonday, todayKey } from "@/lib/date";
import type { AppState, PetPrefs, Settings } from "@/lib/types";
import { isLanguage, languageFromCookie, setCurrentLanguage, type Language } from "@/i18n/core";

const STORAGE_KEY = "haruka-sat-journey:v1";

export type SyncStatus = "loading" | "local" | "saving" | "saved" | "error";

export function defaultSettings(): Settings {
  return {
    planStartDate: nextMonday(todayKey()),
    examDate: null,
    dailyGoalMinutes: 270,
    theme: "system",
    // A language picked on the sign-in page carries over to a fresh account.
    language: (typeof document !== "undefined" && languageFromCookie(document.cookie)) || "en",
    showUzbek: true,
    notifications: { dailyReminder: false, reminderTime: "16:00", timerAlerts: true, weeklyReview: true },
  };
}

export function defaultPet(): PetPrefs {
  return { species: "cat", coats: {}, names: {}, visible: true, sound: false, size: "m", position: null };
}

export function defaultState(): AppState {
  return {
    version: 1,
    settings: defaultSettings(),
    completedTasks: {},
    customTasks: {},
    sessions: [],
    errors: [],
    tests: [],
    exercises: {},
    vocab: {},
    timer: null,
    pet: defaultPet(),
    updatedAt: new Date(0).toISOString(),
  };
}

/** Merge stored data onto defaults so new fields never break old saves. */
function normalize(raw: unknown): AppState {
  const base = defaultState();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<AppState>;
  return {
    ...base,
    ...r,
    settings: {
      ...base.settings,
      ...(r.settings ?? {}),
      language: isLanguage(r.settings?.language) ? r.settings.language : base.settings.language,
      notifications: { ...base.settings.notifications, ...(r.settings?.notifications ?? {}) },
    },
    completedTasks: r.completedTasks ?? {},
    customTasks: r.customTasks ?? {},
    sessions: Array.isArray(r.sessions) ? r.sessions : [],
    errors: Array.isArray(r.errors) ? r.errors : [],
    tests: Array.isArray(r.tests) ? r.tests : [],
    exercises: r.exercises ?? {},
    vocab: r.vocab ?? {},
    timer: r.timer ?? null,
    pet: { ...base.pet, ...(r.pet ?? {}), coats: { ...(r.pet?.coats ?? {}) }, names: { ...(r.pet?.names ?? {}) } },
    version: 1,
  };
}

function readLocal(): AppState | null {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? normalize(JSON.parse(s)) : null;
  } catch {
    return null;
  }
}

function writeLocal(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem("haruka-theme", state.settings.theme);
  } catch {
    /* storage unavailable */
  }
}

interface StoreValue {
  state: AppState;
  ready: boolean;
  mode: "cloud" | "local";
  sync: SyncStatus;
  userEmail: string | null;
  update: (fn: (s: AppState) => AppState) => void;
  replace: (s: AppState) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children, mode, userEmail, initialLanguage = "en" }: { children: ReactNode; mode: "cloud" | "local"; userEmail: string | null; initialLanguage?: Language }) {
  // Start in the language the server rendered with (from the cookie) so hydration matches.
  const [state, setState] = useState<AppState>(() => {
    const s = defaultState();
    return { ...s, settings: { ...s.settings, language: initialLanguage } };
  });
  const [ready, setReady] = useState(false);
  const [sync, setSync] = useState<SyncStatus>("loading");
  const userIdRef = useRef<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loaded = useRef(false);

  // Keep plain helpers (dates, durations, plan text) on the current language
  // before children render, so a switch applies instantly everywhere.
  const language = state.settings.language;
  setCurrentLanguage(language);
  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = language;
    try {
      document.cookie = `haruka-lang=${language}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      /* cookies blocked */
    }
  }, [language, ready]);

  // Initial load: local cache first, then cloud (if configured).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const local = readLocal();
      if (mode === "local") {
        setState(local ?? defaultState());
        setSync("local");
        setReady(true);
        loaded.current = true;
        return;
      }
      const supabase = getBrowserSupabase();
      try {
        if (!supabase) throw new Error("Supabase not configured");
        const { data: userData } = await supabase.auth.getUser();
        const uid = userData.user?.id;
        if (!uid) throw new Error("Not signed in");
        userIdRef.current = uid;
        const { data, error } = await supabase.from("study_state").select("data, updated_at").eq("user_id", uid).maybeSingle();
        if (error) throw error;
        let next: AppState;
        if (data?.data) {
          const remote = normalize(data.data);
          // Prefer whichever copy is newer (e.g. offline edits on this device).
          next = local && local.updatedAt > remote.updatedAt ? local : remote;
        } else {
          next = local ?? defaultState();
        }
        if (cancelled) return;
        setState(next);
        writeLocal(next);
        setSync("saved");
        if (!data?.data || next === local) await pushRemote(next);
      } catch (e) {
        console.error("Failed to load cloud data", e);
        if (cancelled) return;
        setState(local ?? defaultState());
        setSync("error");
      } finally {
        if (!cancelled) {
          setReady(true);
          loaded.current = true;
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const pushRemote = useCallback(async (s: AppState) => {
    const supabase = getBrowserSupabase();
    const uid = userIdRef.current;
    if (!supabase || !uid) return;
    setSync("saving");
    const { error } = await supabase.from("study_state").upsert({ user_id: uid, data: s, updated_at: new Date().toISOString() });
    setSync(error ? "error" : "saved");
    if (error) console.error("Cloud save failed", error.message);
  }, []);

  const persist = useCallback(
    (s: AppState) => {
      writeLocal(s);
      if (mode !== "cloud") return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      setSync("saving");
      saveTimer.current = setTimeout(() => void pushRemote(s), 700);
    },
    [mode, pushRemote],
  );

  const update = useCallback(
    (fn: (s: AppState) => AppState) => {
      setState((prev) => {
        const next = { ...fn(prev), updatedAt: new Date().toISOString() };
        if (loaded.current) persist(next);
        return next;
      });
    },
    [persist],
  );

  const replace = useCallback((s: AppState) => update(() => normalize(s)), [update]);

  // Flush pending saves when the tab is hidden or closed.
  useEffect(() => {
    const flush = () => {
      if (saveTimer.current && mode === "cloud") {
        clearTimeout(saveTimer.current);
        saveTimer.current = null;
        setState((s) => {
          void pushRemote(s);
          return s;
        });
      }
    };
    const onVis = () => document.visibilityState === "hidden" && flush();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", flush);
    };
  }, [mode, pushRemote]);

  const value = useMemo(() => ({ state, ready, mode, sync, userEmail, update, replace }), [state, ready, mode, sync, userEmail, update, replace]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export { normalize as normalizeState };
