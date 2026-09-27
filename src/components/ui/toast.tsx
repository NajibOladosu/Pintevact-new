"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Toast = { id: number; title: string; description?: string; tone?: "default" | "success" | "error" | "xp" };
type ToastApi = { toast: (t: Omit<Toast, "id">) => void };

const ToastContext = createContext<ToastApi>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-3), { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4200);
  }, []);
  const api = useMemo(() => ({ toast }), [toast]);
  return (
    <ToastContext.Provider value={api}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 left-1/2 z-[100] flex w-[min(92vw,360px)] -translate-x-1/2 flex-col gap-2 sm:left-auto sm:right-4 sm:translate-x-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto animate-enter rounded-[1.1rem] border px-4 py-3 shadow-card",
              t.tone === "xp" ? "border-transparent bg-violet text-on-violet" : t.tone === "error" ? "border-danger/40 bg-raised text-fg" : "border-line bg-raised text-fg",
            )}
          >
            <p className="text-sm font-medium">{t.title}</p>
            {t.description ? <p className={cn("mt-0.5 text-sm", t.tone === "xp" ? "text-on-violet-muted" : "text-muted")}>{t.description}</p> : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
