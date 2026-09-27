export const PROTECTED_PREFIXES = ["/dashboard", "/learn", "/reflections", "/achievements", "/account", "/admin"] as const;
export const GUEST_ONLY = ["/signin", "/signup", "/forgot-password"] as const;

function matches(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => matches(pathname, p));
}

export function isGuestOnlyPath(pathname: string) {
  return GUEST_ONLY.some((p) => matches(pathname, p));
}

/** Decide what the proxy should do for a request. Pure for testability. */
export function routeDecision(pathname: string, search: string, signedIn: boolean): { redirect: string } | null {
  if (!signedIn && isProtectedPath(pathname)) {
    return { redirect: `/signin?next=${encodeURIComponent(pathname + search)}` };
  }
  if (signedIn && isGuestOnlyPath(pathname)) {
    return { redirect: "/dashboard" };
  }
  return null;
}
