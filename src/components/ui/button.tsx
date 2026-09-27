import { Slot } from "./slot";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

const variants = {
  primary: "bg-accent text-on-accent hover:bg-accent-hover",
  secondary: "bg-fg text-bg hover:bg-fg/85",
  outline: "border border-line-strong text-fg hover:border-fg hover:bg-fg/[0.03]",
  ghost: "text-muted hover:bg-fg/5 hover:text-fg",
  violet: "bg-violet text-on-violet hover:bg-violet/90",
  danger: "border border-danger/60 text-danger hover:bg-danger hover:text-bg",
} as const;

const sizes = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-[0.95rem]",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10 p-0",
} as const;

export type ButtonVariant = keyof typeof variants;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: keyof typeof sizes;
  asChild?: boolean;
  loading?: boolean;
};

export function buttonClasses({ variant = "primary", size = "md", className }: { variant?: ButtonVariant; size?: keyof typeof sizes; className?: string } = {}) {
  return cn(
    "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-[10px] font-medium transition-[background-color,border-color,color,transform] duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button({ variant, size, asChild, loading, className, children, disabled, ...props }: ButtonProps) {
  const classes = buttonClasses({ variant, size, className });
  if (asChild) return <Slot className={classes}>{children}</Slot>;
  return (
    <button className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden /> : null}
      {children}
    </button>
  );
}
