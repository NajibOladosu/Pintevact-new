import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { isDemoMode } from "@/lib/env";
import { DEMO_SESSION_COOKIE } from "@/lib/auth/routes";
import { createDemoStore, type DemoSession } from "./demo-store";
import { createSupabaseStore } from "./supabase-store";
import type { Store } from "./store";

export type { Store, Viewer, AccessInfo } from "./store";

export function decodeDemoSession(raw: string | undefined): DemoSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as DemoSession;
    return parsed && typeof parsed.id === "string" && typeof parsed.email === "string" ? parsed : null;
  } catch {
    return null;
  }
}

export function encodeDemoSession(session: DemoSession) {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

async function readDemoSession() {
  const store = await cookies();
  return decodeDemoSession(store.get(DEMO_SESSION_COOKIE)?.value);
}

/** One store per request. */
export const getStore = cache((): Store => (isDemoMode() ? createDemoStore(readDemoSession) : createSupabaseStore()));

export const getViewer = cache(async () => getStore().getViewer());

export const getCourses = cache(async () => getStore().listCourses());

export const getCourse = cache(async (slug: string) => getStore().getCourse(slug));
