import "server-only";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { fieldErrors } from "@/lib/validation";
import { AdminError } from "./catalog";

export type ActionResult<T = void> = { ok: true; message?: string; data?: T } | { ok: false; error: string; errors?: Record<string, string> };

/** Runs an admin mutation and turns failures into messages the UI can show. */
export async function attempt<T>(fn: () => Promise<T>, message?: string): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, message, data };
  } catch (err) {
    if (err instanceof AdminError) return { ok: false, error: err.message };
    if (err instanceof ZodError) return { ok: false, error: err.issues[0]?.message ?? "Check the form", errors: fieldErrors(err) };
    // Next's redirect()/notFound() work by throwing; let them through.
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("[admin]", err);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

/** Catalogue edits show up on every public page, so refresh the whole tree. */
export function refreshCatalog() {
  revalidatePath("/", "layout");
}
