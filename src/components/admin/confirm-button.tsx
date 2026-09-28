"use client";

import { useId, useRef, type ReactNode } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * A button that asks before doing something destructive, in a native modal <dialog>
 * (focus is trapped and Escape cancels).
 */
export function ConfirmButton({
  title,
  body,
  confirmLabel,
  onConfirm,
  children,
  tone = "danger",
  ...button
}: Omit<ButtonProps, "onClick" | "title"> & { title: string; body?: ReactNode; confirmLabel: string; onConfirm: () => void; tone?: "danger" | "primary" }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  return (
    <>
      <Button type="button" {...button} onClick={() => ref.current?.showModal()}>
        {children}
      </Button>
      <dialog ref={ref} aria-labelledby={titleId} className="m-auto w-[min(92vw,28rem)] rounded-[1.6rem] bg-raised p-0 text-fg shadow-frame ring-1 ring-line backdrop:bg-frame/60 backdrop:backdrop-blur-sm">
        <form method="dialog" className="p-6 sm:p-7">
          <h2 id={titleId} className="text-xl font-semibold tracking-[-0.03em]">
            {title}
          </h2>
          {body ? <div className="mt-3 text-sm leading-relaxed text-muted">{body}</div> : null}
          <div className="mt-7 flex flex-wrap justify-end gap-2">
            <Button type="submit" variant="ghost" size="sm" autoFocus>
              Cancel
            </Button>
            <Button type="submit" size="sm" variant={tone === "danger" ? "danger" : "primary"} className={cn(tone === "danger" && "bg-danger text-bg hover:bg-danger/90")} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
