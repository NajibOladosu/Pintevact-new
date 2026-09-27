import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { isDemoMode } from "@/lib/env";
import { DEMO_SESSION_COOKIE } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  if (isDemoMode()) {
    (await cookies()).delete(DEMO_SESSION_COOKIE);
  } else {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
