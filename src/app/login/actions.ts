"use server";

import { headers } from "next/headers";
import { getServerSupabase } from "@/lib/supabase/server";
import { isAllowed, supabaseConfigured } from "@/lib/supabase/config";

export interface LoginState {
  status: "idle" | "sent" | "error";
  /** Message code; the form shows it in the visitor's language. */
  message: "" | "notConfigured" | "badEmail" | "sent" | "rateLimited";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendMagicLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!supabaseConfigured) {
    return { status: "error", message: "notConfigured" };
  }
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return { status: "error", message: "badEmail" };
  }

  // Same response whether or not the address is invited, so the allowlist can't be probed.
  const generic: LoginState = { status: "sent", message: "sent" };

  if (!isAllowed(email)) return generic;

  const supabase = await getServerSupabase();
  if (!supabase) return { status: "error", message: "notConfigured" };

  const h = await headers();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) {
    // Rate limits are the most common error; show a helpful but non-revealing message.
    if (error.status === 429) return { status: "error", message: "rateLimited" };
    console.error("signInWithOtp failed:", error.message);
    return generic;
  }
  return generic;
}
