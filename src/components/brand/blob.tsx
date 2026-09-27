import { cn } from "@/lib/utils";

export function Blob({ className }: { className?: string }) {
  return <div aria-hidden className={cn("pointer-events-none absolute animate-float blur-2xl", className)} style={{ borderRadius: "var(--radius-blob)" }} />;
}
