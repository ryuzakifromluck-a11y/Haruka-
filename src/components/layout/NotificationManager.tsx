"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { getDay, planPosition, taskStats } from "@/lib/plan";
import { todayKey } from "@/lib/date";
import { elapsedMs } from "@/lib/timer";
import { tr, trn } from "@/i18n";

function notify(title: string, body: string, tag: string) {
  try {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    new Notification(title, { body, tag, icon: "/icon.svg" });
  } catch {
    /* some browsers only allow notifications from a service worker */
  }
}

function once(key: string): boolean {
  try {
    if (localStorage.getItem(key)) return false;
    localStorage.setItem(key, "1");
    return true;
  } catch {
    return false;
  }
}

/** In-browser reminders. They work while the site is open in a tab (no server push). */
export function NotificationManager() {
  const { state, ready } = useStore();
  const { notifications, planStartDate, language: lang } = state.settings;

  useEffect(() => {
    if (!ready) return;
    const check = () => {
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const today = todayKey();
      if (hhmm < notifications.reminderTime) return;
      const pos = planPosition(planStartDate, today);
      if (pos.status !== "active") return;
      const day = getDay(pos.week, pos.day, lang);
      if (!day) return;
      if (notifications.weeklyReview && day.isRest && once(`notif-weekly-${today}`)) {
        notify(tr("timer.notif.weeklyTitle", undefined, lang), tr("timer.notif.weeklyBody", { n: pos.week }, lang), "weekly");
        return;
      }
      if (notifications.dailyReminder && !day.isRest) {
        const s = taskStats(day.tasks, state.completedTasks);
        if (s.done < s.total && once(`notif-daily-${today}`)) {
          notify(tr("timer.notif.dailyTitle", undefined, lang), trn("timer.notif.dailyBody", s.total - s.done, { title: day.title }, lang), "daily");
        }
      }
    };
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, [ready, notifications, planStartDate, state.completedTasks, lang]);

  // Timer target reached
  const timer = state.timer;
  useEffect(() => {
    if (!ready || !timer?.startedAt || !notifications.timerAlerts) return;
    const remaining = timer.targetMinutes * 60_000 - elapsedMs(timer, Date.now());
    if (remaining <= 0) return;
    const id = setTimeout(() => {
      notify(tr(timer.mode === "break" ? "timer.notif.breakOver" : "timer.notif.focusDone", undefined, lang), tr(timer.mode === "break" ? "timer.notif.breakOverBody" : "timer.notif.focusDoneBody", undefined, lang), "timer");
    }, remaining);
    return () => clearTimeout(id);
  }, [ready, timer, notifications.timerAlerts, lang]);

  return null;
}
