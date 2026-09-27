import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, LabelHTMLAttributes, TextareaHTMLAttributes } from "react";

const field =
  "w-full rounded-[10px] border border-line-strong bg-raised px-3.5 text-fg placeholder:text-subtle transition-colors focus:border-fg focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-accent/25 aria-[invalid=true]:border-danger";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(field, "h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(field, "min-h-28 py-3 leading-relaxed", className)} {...props} />;
}

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-2 block text-sm font-medium text-fg", className)} {...props} />;
}

export function FieldError({ id, message }: { id?: string; message?: string | null }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-2 text-sm text-danger">
      {message}
    </p>
  );
}
