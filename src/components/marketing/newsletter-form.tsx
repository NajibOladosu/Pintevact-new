"use client";

import { useActionState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { subscribeNewsletter } from "@/app/(marketing)/actions";

export function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribeNewsletter, {});
  if (state.ok) {
    return (
      <p role="status" className="mt-8 inline-flex items-center gap-2 rounded-full bg-lucid px-5 py-3 font-semibold text-ink">
        <Check size={18} /> {state.message}
      </p>
    );
  }
  return (
    <form action={action} className="mt-8 max-w-md" noValidate>
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <div className="flex rounded-full border-2 border-white/20 bg-white/5 p-1.5 focus-within:border-lucid">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          placeholder="you@curious.mind"
          aria-invalid={Boolean(state.errors?.email)}
          className="min-w-0 flex-1 bg-transparent px-4 text-paper placeholder:text-mist/60 focus:outline-none"
        />
        <button type="submit" disabled={pending} className="inline-flex h-11 items-center gap-2 rounded-full bg-lucid px-5 font-semibold text-ink transition hover:bg-lucid-2 disabled:opacity-60">
          {pending ? "Joining…" : "Subscribe"} <ArrowRight size={16} />
        </button>
      </div>
      {state.errors?.email || state.message ? (
        <p role="alert" className="mt-2 pl-4 text-sm text-ember-2">
          {state.errors?.email ?? state.message}
        </p>
      ) : null}
    </form>
  );
}
