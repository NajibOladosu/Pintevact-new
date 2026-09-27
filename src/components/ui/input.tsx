import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, LabelHTMLAttributes, TextareaHTMLAttributes } from "react";

const field =
  "w-full rounded-2xl border-2 border-ink/15 bg-white/70 px-4 text-ink placeholder:text-ink-3/70 transition focus:border-ink focus:bg-white focus:outline-none focus:ring-4 focus:ring-lucid/60 aria-[invalid=true]:border-ember dark:border-white/10 dark:bg-night-3 dark:text-paper dark:placeholder:text-mist/50 dark:focus:border-iris dark:focus:ring-iris/30";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(field, "h-12", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(field, "min-h-28 py-3 leading-relaxed", className)} {...props} />;
}

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1.5 block text-sm font-semibold", className)} {...props} />;
}

export function FieldError({ id, message }: { id?: string; message?: string | null }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-sm font-medium text-ember">
      {message}
    </p>
  );
}
