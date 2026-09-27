import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notify } from "@/lib/notifications";
import { safeRedirect } from "@/lib/utils";

/** Verifies email links (signup, magic link, recovery, email change, invite) and starts a session. */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeRedirect(searchParams.get("next"));

  if (tokenHash && type) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      if ((type === "email" || type === "signup") && data.user?.email) {
        await notify.welcome({ email: data.user.email, name: data.user.user_metadata?.full_name ?? null }).catch(console.error);
      }
      return NextResponse.redirect(new URL(next, request.url));
    }
  }
  return NextResponse.redirect(new URL(`/signin?error=${encodeURIComponent("That link is invalid or has expired. Please request a new one.")}`, request.url));
}
