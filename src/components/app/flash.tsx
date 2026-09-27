"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";

const messages: Record<string, { title: string; description?: string; tone: "success" | "xp" | "default" | "error" }> = {
  welcome: { title: "Welcome to Pintevact ✦", description: "Your constellation starts here. Begin with Meet Your Mind.", tone: "xp" },
  password: { title: "Password updated", tone: "success" },
  purchased: { title: "Unlocked!", description: "The course is now in your library. Enjoy the journey.", tone: "success" },
  membership: { title: "All-Access activated", description: "Every course is now yours.", tone: "xp" },
  canceled: { title: "Checkout canceled", description: "No charge was made.", tone: "default" },
  saved: { title: "Saved", tone: "success" },
  email: { title: "Email change requested", description: "Confirm the change from the link we sent.", tone: "default" },
};

/** Shows a one-time toast for ?welcome=1, ?purchased=1 etc., then cleans the URL. */
export function Flash() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const shown = useRef(false);
  useEffect(() => {
    if (shown.current) return;
    const key = Object.keys(messages).find((k) => params.has(k));
    if (!key) return;
    shown.current = true;
    toast(messages[key]);
    const next = new URLSearchParams(params);
    next.delete(key);
    router.replace(next.size ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [params, pathname, router, toast]);
  return null;
}
