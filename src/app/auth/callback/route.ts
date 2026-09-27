import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeRedirect } from "@/lib/utils";

/**
 * Landing point for OAuth and email links. Exchanges a PKCE code when present; links that were already
 * verified by /auth/confirm arrive here with a live session and are simply forwarded.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = safeRedirect(request.nextUrl.searchParams.get("next"));
  const supabase = await createClient();
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, request.url));
  } else {
    const { data } = await supabase.auth.getClaims();
    if (data?.claims?.sub) return NextResponse.redirect(new URL(next, request.url));
  }
  return NextResponse.redirect(new URL(`/signin?error=${encodeURIComponent("We couldn't sign you in. Please try again.")}`, request.url));
}
