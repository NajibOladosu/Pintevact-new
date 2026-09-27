"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { PasswordInput } from "./password-input";

export function SignupForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(signUp, {});
  return (
    <form action={action} noValidate className="space-y-5">
      {state.message ? (
        <p role="alert" className="rounded-2xl bg-ember/15 p-3 text-sm font-medium text-ember">
          {state.message}
        </p>
      ) : null}
      <input type="hidden" name="next" value={next ?? ""} />
      <div>
        <Label htmlFor="fullName">What should we call you?</Label>
        <Input id="fullName" name="fullName" autoComplete="name" defaultValue={state.values?.fullName} aria-invalid={!!state.errors?.fullName} aria-describedby="fullName-error" />
        <FieldError id="fullName-error" message={state.errors?.fullName} />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" defaultValue={state.values?.email} aria-invalid={!!state.errors?.email} aria-describedby="email-error" />
        <FieldError id="email-error" message={state.errors?.email} />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <PasswordInput id="password" name="password" autoComplete="new-password" showStrength aria-invalid={!!state.errors?.password} aria-describedby="password-error" />
        <FieldError id="password-error" message={state.errors?.password} />
      </div>
      <div>
        <label className="flex items-start gap-3 text-sm text-ink-2">
          <input type="checkbox" name="terms" className="mt-0.5 h-5 w-5 shrink-0 rounded accent-[var(--color-ember)]" aria-describedby="terms-error" />
          <span>
            I agree to the{" "}
            <Link href="/terms" className="font-semibold underline underline-offset-2">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-semibold underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        <FieldError id="terms-error" message={state.errors?.terms} />
      </div>
      <Button type="submit" size="lg" loading={pending} className="w-full">
        Create my free account
      </Button>
    </form>
  );
}
