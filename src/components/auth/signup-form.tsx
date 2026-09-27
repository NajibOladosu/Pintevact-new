"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp } from "@/app/(auth)/actions";
import { ArrowUpRight } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { PasswordInput } from "./password-input";

export function SignupForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(signUp, {});
  return (
    <form action={action} noValidate aria-label="Create your account" className="space-y-5">
      {state.message ? (
        <p role="alert" className="rounded-[0.85rem] border border-danger/40 px-4 py-3 text-sm text-danger">
          {state.message}
        </p>
      ) : null}
      <input type="hidden" name="next" value={next ?? ""} />
      <div>
        <Label htmlFor="signup-name">Full name</Label>
        <Input id="signup-name" name="fullName" autoComplete="name" placeholder="What should we call you?" defaultValue={state.values?.fullName} aria-invalid={!!state.errors?.fullName} aria-describedby="signup-name-error" />
        <FieldError id="signup-name-error" message={state.errors?.fullName} />
      </div>
      <div>
        <Label htmlFor="signup-email">Email address</Label>
        <Input id="signup-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" defaultValue={state.values?.email} aria-invalid={!!state.errors?.email} aria-describedby="signup-email-error" />
        <FieldError id="signup-email-error" message={state.errors?.email} />
      </div>
      <div>
        <Label htmlFor="signup-password">Password</Label>
        <PasswordInput id="signup-password" name="password" autoComplete="new-password" placeholder="At least 8 characters" showStrength aria-invalid={!!state.errors?.password} aria-describedby="signup-password-error" />
        <FieldError id="signup-password-error" message={state.errors?.password} />
      </div>
      <div>
        <label className="flex items-start gap-3 text-[0.8125rem] text-muted">
          <input type="checkbox" name="terms" className="mt-px h-[1.1rem] w-[1.1rem] shrink-0 rounded accent-[var(--accent)]" aria-describedby="signup-terms-error" />
          <span>
            I accept the{" "}
            <Link href="/terms" className="text-fg underline decoration-fg/30 underline-offset-2 hover:decoration-fg">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-fg underline decoration-fg/30 underline-offset-2 hover:decoration-fg">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        <FieldError id="signup-terms-error" message={state.errors?.terms} />
      </div>
      <Button type="submit" size="lg" loading={pending} className="group w-full rounded-[0.9rem]">
        Create my free account <ArrowUpRight size={15} aria-hidden className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </Button>
    </form>
  );
}
