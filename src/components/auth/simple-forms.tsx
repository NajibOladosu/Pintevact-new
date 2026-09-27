"use client";

import { useActionState } from "react";
import { requestPasswordReset, resendConfirmation, updatePassword } from "@/app/(auth)/actions";
import { ArrowUpRight } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { PasswordInput } from "./password-input";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, {});
  if (state.ok)
    return (
      <p role="status" className="rounded-[1.1rem] bg-violet p-5 text-on-violet">
        {state.message}
      </p>
    );
  return (
    <form action={action} noValidate className="space-y-5">
      {state.message ? <p role="alert" className="rounded-[0.85rem] border border-danger/40 px-4 py-3 text-sm text-danger">{state.message}</p> : null}
      <div>
        <Label htmlFor="email">Email address</Label>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" aria-invalid={!!state.errors?.email} aria-describedby="email-error" />
        <FieldError id="email-error" message={state.errors?.email} />
      </div>
      <Button type="submit" size="lg" loading={pending} className="w-full rounded-[0.9rem]">
        Send reset link <ArrowUpRight size={15} aria-hidden className="arrow-nudge" />
      </Button>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, {});
  return (
    <form action={action} noValidate className="space-y-5">
      {state.message ? <p role="alert" className="rounded-[0.85rem] border border-danger/40 px-4 py-3 text-sm text-danger">{state.message}</p> : null}
      <div>
        <Label htmlFor="password">New password</Label>
        <PasswordInput id="password" name="password" autoComplete="new-password" showStrength aria-invalid={!!state.errors?.password} aria-describedby="password-error" />
        <FieldError id="password-error" message={state.errors?.password} />
      </div>
      <div>
        <Label htmlFor="confirm">Confirm new password</Label>
        <PasswordInput id="confirm" name="confirm" autoComplete="new-password" aria-invalid={!!state.errors?.confirm} aria-describedby="confirm-error" />
        <FieldError id="confirm-error" message={state.errors?.confirm} />
      </div>
      <Button type="submit" size="lg" loading={pending} className="w-full rounded-[0.9rem]">
        Save new password <ArrowUpRight size={15} aria-hidden className="arrow-nudge" />
      </Button>
    </form>
  );
}

export function ResendConfirmationForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(resendConfirmation, {});
  return (
    <form action={action} className="mt-6">
      <input type="hidden" name="email" value={email} />
      <Button type="submit" variant="outline" loading={pending} disabled={state.ok}>
        {state.ok ? "Sent ✓" : "Resend the email"}
      </Button>
      {state.message ? <p className="mt-3 text-sm text-muted" role="status">{state.message}</p> : null}
    </form>
  );
}
