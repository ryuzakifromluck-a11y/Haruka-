import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { StoreProvider } from "@/lib/store";
import { getServerSupabase } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/config";
import { AppReady } from "@/components/layout/AppReady";
import { cookies } from "next/headers";
import { LANG_COOKIE, isLanguage } from "@/i18n";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  let email: string | null = null;
  if (supabaseConfigured) {
    const supabase = await getServerSupabase();
    const { data } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
    email = data.user?.email ?? null;
  }
  const saved = (await cookies()).get(LANG_COOKIE)?.value;
  return (
    <StoreProvider mode={supabaseConfigured ? "cloud" : "local"} userEmail={email} initialLanguage={isLanguage(saved) ? saved : "en"}>
      <AppShell>
        <AppReady>{children}</AppReady>
      </AppShell>
    </StoreProvider>
  );
}
