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
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 left-1/2 z-[100] flex w-[min(92vw,380px)] -translate-x-1/2 flex-col gap-2 sm:left-auto sm:right-4 sm:translate-x-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto animate-rise rounded-2xl border-2 border-ink p-4 text-ink shadow-hard",
              t.tone === "success" && "bg-lucid",
              t.tone === "error" && "bg-ember",
              t.tone === "xp" && "bg-iris text-white",
              (!t.tone || t.tone === "default") && "bg-paper",
            )}
          >
            <p className="font-semibold">{t.title}</p>
            {t.description ? <p className="mt-0.5 text-sm opacity-80">{t.description}</p> : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
