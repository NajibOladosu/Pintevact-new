import { Slot } from "./slot";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

const variants = {
  primary:
    "bg-ember text-ink border-2 border-ink shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
  lucid:
    "bg-lucid text-ink border-2 border-ink shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
  ink: "bg-ink text-paper border-2 border-ink hover:bg-ink-2",
  outline: "border-2 border-current bg-transparent hover:bg-ink hover:text-paper hover:border-ink",
  ghost: "bg-transparent hover:bg-ink/5 dark:hover:bg-white/10",
  glow: "bg-iris text-white shadow-glow hover:bg-iris-2 hover:text-ink",
  subtle: "bg-night-3 text-paper border border-white/10 hover:bg-night-4",
  danger: "bg-transparent text-ember border-2 border-ember hover:bg-ember hover:text-ink",
} as const;

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-[0.95rem]",
  lg: "h-14 px-8 text-lg",
  icon: "h-10 w-10 p-0",
} as const;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  asChild?: boolean;
  loading?: boolean;
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: { variant?: keyof typeof variants; size?: keyof typeof sizes; className?: string } = {}) {
  return cn(
    "inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-all duration-150 disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button({ variant, size, asChild, loading, className, children, disabled, ...props }: ButtonProps) {
  const classes = buttonClasses({ variant, size, className });
  if (asChild) {
    return <Slot className={classes}>{children}</Slot>;
  }
  return (
    <button className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
      ) : null}
      {children}
    </button>
  );
}
