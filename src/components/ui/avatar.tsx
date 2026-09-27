import { cn, initials } from "@/lib/utils";

const palette = ["bg-ember", "bg-lucid", "bg-iris", "bg-tide", "bg-sun", "bg-blush"];

export function Avatar({ name, src, size = 40, className }: { name?: string | null; src?: string | null; size?: number; className?: string }) {
  const hue = palette[(name ?? "?").split("").reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length];
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-ink font-display font-bold text-ink", hue, className)}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        initials(name)
      )}
    </span>
  );
}
