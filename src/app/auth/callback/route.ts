import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getServerSupabase } from "@/lib/supabase/server";
import { isAllowed } from "@/lib/supabase/config";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  const supabase = await getServerSupabase();
  const fail = (reason: string) => NextResponse.redirect(new URL(`/login?error=${reason}`, url.origin));
  if (!supabase) return fail("not_configured");

  let error: unknown = null;
  if (code) {
    ({ error } = await supabase.auth.exchangeCodeForSession(code));
  } else if (tokenHash && type) {
    ({ error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type }));
  } else {
    return fail("invalid_link");
  }
  if (error) return fail("invalid_link");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAllowed(user.email)) {
    await supabase.auth.signOut();
    return fail("not_invited");
  }
  return NextResponse.redirect(new URL("/", url.origin));
}
