"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";

export function ThemeApplier() {
  const { state, ready } = useStore();
  const theme = state.settings.theme;
  const lang = state.settings.language;
  useEffect(() => {
    if (!ready) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && mq.matches);
      document.documentElement.classList.toggle("dark", dark);
    };
    apply();
    try {
      localStorage.setItem("haruka-theme", theme);
    } catch {}
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme, ready]);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}
