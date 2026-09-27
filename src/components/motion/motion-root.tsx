"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Site-wide motion wiring, mounted once in the root layout.
 * - Elements marked `data-reveal` start visible; once JS runs they arrive as they scroll into view.
 * - Elements marked `data-magnetic` lean toward a fine pointer.
 * - Elements marked `data-spotlight` expose the pointer position as --mx / --my.
 * - Elements marked `data-tilt` tilt a few degrees toward the pointer.
 * Every effect is skipped under prefers-reduced-motion (reveals fall back to a plain fade in CSS).
 */
export function MotionRoot() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("motion-ready");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.shown = "true";
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    const pending = document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-shown])");
    pending.forEach((el) => {
      // Anything already on screen shows immediately, so the first paint never flashes empty.
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92 && r.bottom > 0) el.dataset.shown = "true";
      else io.observe(el);
    });
    return () => io.disconnect();
  }, [pathname]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (reduce.matches || !fine.matches) return;

    let frame = 0;
    let last: PointerEvent | null = null;
    const active = new Set<HTMLElement>();

    const apply = () => {
      frame = 0;
      const e = last;
      if (!e) return;
      const target = e.target instanceof Element ? e.target : null;

      const magnet = target?.closest<HTMLElement>("[data-magnetic]") ?? null;
      const tilt = target?.closest<HTMLElement>("[data-tilt]") ?? null;
      const spot = target?.closest<HTMLElement>("[data-spotlight]") ?? null;

      for (const el of active) {
        if (el !== magnet && el !== tilt && el !== spot) {
          el.style.removeProperty("--mag-x");
          el.style.removeProperty("--mag-y");
          el.style.removeProperty("--tilt-x");
          el.style.removeProperty("--tilt-y");
          el.dataset.pointer = "out";
          active.delete(el);
        }
      }
      if (magnet) {
        const r = magnet.getBoundingClientRect();
        const strength = Number(magnet.dataset.magnetic || 0.22);
        magnet.style.setProperty("--mag-x", `${((e.clientX - (r.left + r.width / 2)) * strength).toFixed(1)}px`);
        magnet.style.setProperty("--mag-y", `${((e.clientY - (r.top + r.height / 2)) * strength).toFixed(1)}px`);
        active.add(magnet);
      }
      if (tilt) {
        const r = tilt.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        tilt.style.setProperty("--tilt-x", `${(-py * 6).toFixed(2)}deg`);
        tilt.style.setProperty("--tilt-y", `${(px * 8).toFixed(2)}deg`);
        tilt.dataset.pointer = "in";
        active.add(tilt);
      }
      if (spot) {
        const r = spot.getBoundingClientRect();
        spot.style.setProperty("--mx", `${e.clientX - r.left}px`);
        spot.style.setProperty("--my", `${e.clientY - r.top}px`);
        spot.dataset.pointer = "in";
        active.add(spot);
      }
    };

    const onMove = (e: PointerEvent) => {
      last = e;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      last = null;
      for (const el of active) {
        el.style.removeProperty("--mag-x");
        el.style.removeProperty("--mag-y");
        el.style.removeProperty("--tilt-x");
        el.style.removeProperty("--tilt-y");
        el.dataset.pointer = "out";
      }
      active.clear();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return null;
}
