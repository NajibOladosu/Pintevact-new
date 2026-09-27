import { Slot } from "./slot";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

const variants = {
  /** Signal orange pill: the main call to action. */
  primary: "rounded-full bg-accent text-on-accent hover:bg-accent-hover",
  /** Near-black block button, as used on cards and forms. */
  secondary: "rounded-[0.9rem] bg-fg text-bg hover:bg-fg/85",
  /** Paper-white button for dark and orange surfaces. */
  light: "rounded-[0.9rem] bg-raised text-fg hover:bg-bg",
  outline: "rounded-full border border-line-strong text-fg hover:border-fg",
  ghost: "rounded-full text-muted hover:bg-fg/5 hover:text-fg",
  violet: "rounded-full bg-violet text-on-violet hover:bg-[#46248a]",
  danger: "rounded-full border border-danger/60 text-danger hover:bg-danger hover:text-bg",
} as const;

const sizes = {
  sm: "h-10 px-4 text-[0.8125rem]",
  md: "h-12 px-6 text-sm",
  lg: "h-[3.25rem] px-7 text-[0.9375rem]",
  icon: "h-11 w-11 p-0",
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
    "inline-flex select-none items-center justify-center gap-2.5 whitespace-nowrap font-semibold tracking-[0.005em] transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50",
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
