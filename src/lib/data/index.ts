import "server-only";
import { cache } from "react";
import { createSupabaseStore } from "./supabase-store";
import type { Store } from "./store";

export type { Store, Viewer, AccessInfo } from "./store";

/** One store per request. */
export const getStore = cache((): Store => createSupabaseStore());

export const getViewer = cache(async () => getStore().getViewer());

export const getCourses = cache(async () => getStore().listCourses());

export const getCourse = cache(async (slug: string) => getStore().getCourse(slug));
