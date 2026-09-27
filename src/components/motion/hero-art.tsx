"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * The papercut backdrop: drifts slowly on its own and shifts a few pixels against the pointer,
 * so the layers read as depth. Static under reduced motion.
 */
export function HeroArt({ className, position = "70% 50%", strength = 18 }: { className?: string; position?: string; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !window.matchMedia("(pointer: fine)").matches) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = host.getBoundingClientRect();
        el.style.setProperty("--par-x", `${(((e.clientX - r.left) / r.width - 0.5) * -strength).toFixed(1)}px`);
        el.style.setProperty("--par-y", `${(((e.clientY - r.top) / r.height - 0.5) * -strength).toFixed(1)}px`);
      });
    };
    const onLeave = () => {
      el.style.setProperty("--par-x", "0px");
      el.style.setProperty("--par-y", "0px");
    };
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [strength]);

  return (
    <div aria-hidden className={cn("absolute -inset-6 -z-10 overflow-hidden", className)}>
      <div ref={ref} className="hero-art absolute inset-0 bg-[url(/art/papercut.webp)] bg-cover will-change-transform" style={{ backgroundPosition: position }} />
    </div>
  );
}
