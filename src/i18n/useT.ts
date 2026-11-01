"use client";

import { useCallback, useMemo } from "react";
import { useStore } from "@/lib/store";
import { tr, trn, type Language, type MsgKey, type PluralKey, type Vars } from "./index";

/** Translation hook: re-renders instantly when the language changes. */
export function useT() {
  const { state, update } = useStore();
  const lang = state.settings.language;
  const t = useCallback((key: MsgKey, vars?: Vars) => tr(key, vars, lang), [lang]);
  const tn = useCallback((key: PluralKey, n: number, vars?: Vars) => trn(key, n, vars, lang), [lang]);
  const setLanguage = useCallback(
    (l: Language) => update((s) => ({ ...s, settings: { ...s.settings, language: l } })),
    [update],
  );
  return useMemo(() => ({ lang, t, tn, setLanguage }), [lang, t, tn, setLanguage]);
}
