import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Everything except static assets, images and webhook endpoints (which verify their own signatures).
    "/((?!_next/static|_next/image|favicon.ico|icon|api/stripe/webhook|api/hooks|api/cron|api/unsubscribe|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
