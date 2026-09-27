"use client";

import { useActionState } from "react";
import { ArrowUpRight, Check } from "@/components/icons";
import { subscribeNewsletter } from "@/app/(marketing)/actions";

export function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribeNewsletter, {});
  if (state.ok) {
    return (
      <p role="status" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-fg">
        <Check size={16} className="text-accent-ink" /> {state.message}
      </p>
    );
  }
  return (
    <form action={action} className="mt-6 max-w-md" noValidate>
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <div className="flex gap-2">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          placeholder="you@curious.mind"
          aria-invalid={Boolean(state.errors?.email)}
          className="h-12 min-w-0 flex-1 rounded-full border border-line bg-raised px-5 text-fg placeholder:text-muted/65 focus:border-accent focus:outline-none focus-visible:outline-none"
        />
        <button type="submit" disabled={pending} className="inline-flex h-12 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-60">
          {pending ? "Joining…" : "Subscribe"} <ArrowUpRight size={14} />
        </button>
      </div>
      {state.errors?.email || state.message ? (
        <p role="alert" className="mt-2 text-sm text-danger">
          {state.errors?.email ?? state.message}
        </p>
      ) : null}
    </form>
  );
}
