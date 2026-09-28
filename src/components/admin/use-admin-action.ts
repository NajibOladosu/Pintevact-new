"use client";

import { useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import type { ActionResult } from "@/lib/admin/action";

/**
 * Runs an admin server action with a pending state, toasts the outcome and refreshes the page data.
 * Resolves to the result so callers can react (navigate, reset a form).
 */
export function useAdminAction() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();
  const run = useCallback(
    <T,>(action: () => Promise<ActionResult<T>>, opts: { refresh?: boolean; quiet?: boolean } = {}) =>
      new Promise<ActionResult<T>>((resolve) => {
        startTransition(async () => {
          let res: ActionResult<T>;
          try {
            res = await action();
          } catch (err) {
            // redirect() from a server action lands here as a navigation, not an error.
            if (err && typeof err === "object" && "digest" in err) throw err;
            res = { ok: false, error: "Couldn't reach the server. Check your connection and try again." };
          }
          if (!res.ok) toast({ title: res.error, tone: "error" });
          else if (res.message && !opts.quiet) toast({ title: res.message, tone: "success" });
          if (res.ok && opts.refresh !== false) router.refresh();
          resolve(res);
        });
      }),
    [router, toast],
  );
  return { run, pending };
}
