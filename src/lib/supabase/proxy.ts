import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env, isDemoMode } from "@/lib/env";
import { DEMO_SESSION_COOKIE, routeDecision } from "@/lib/auth/routes";

/** Refreshes the Supabase session cookie and applies optimistic route guards. */
export async function updateSession(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isDemoMode()) {
    const decision = routeDecision(pathname, search, Boolean(request.cookies.get(DEMO_SESSION_COOKIE)?.value));
    return decision ? NextResponse.redirect(new URL(decision.redirect, request.url)) : NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(env.supabaseUrl(), env.supabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });

  // Do not run code between createServerClient and getClaims — it refreshes the session.
  const { data } = await supabase.auth.getClaims();
  const decision = routeDecision(pathname, search, Boolean(data?.claims?.sub));
  if (decision) {
    const redirect = NextResponse.redirect(new URL(decision.redirect, request.url));
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }
  return response;
}
