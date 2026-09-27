"use client";

import { useActionState } from "react";
import { changeEmail, changePassword, deleteAccount, updateProfile } from "@/app/(app)/account/actions";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { PasswordInput } from "@/components/auth/password-input";
import type { FormState } from "@/lib/validation";

function Status({ state }: { state: FormState }) {
  if (!state.message) return null;
  return (
    <p role={state.ok ? "status" : "alert"} className={state.ok ? "rounded-[10px] bg-violet-soft p-3 text-sm text-fg" : "rounded-[10px] border border-danger/40 p-3 text-sm text-danger"}>
      {state.message}
    </p>
  );
}

export function ProfileForm({ fullName, headline, emailOptIn }: { fullName: string; headline: string; emailOptIn: boolean }) {
  const [state, action, pending] = useActionState(updateProfile, {});
  return (
    <form action={action} className="space-y-5">
      <Status state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="fullName">Name</Label>
          <Input id="fullName" name="fullName" defaultValue={fullName} autoComplete="name" aria-invalid={!!state.errors?.fullName} />
          <FieldError message={state.errors?.fullName} />
        </div>
        <div>
          <Label htmlFor="headline">Headline</Label>
          <Input id="headline" name="headline" defaultValue={headline} placeholder="e.g. Recovering overthinker" />
        </div>
      </div>
      <label className="flex items-start gap-3 rounded-2xl border border-line p-4">
        <input type="checkbox" name="emailOptIn" defaultChecked={emailOptIn} className="mt-1 h-5 w-5 accent-[var(--accent)]" />
        <span>
          <span className="block font-semibold">Learning emails</span>
          <span className="text-sm text-muted">Streak reminders, weekly digests and new-course announcements. Receipts and security emails are always sent.</span>
        </span>
      </label>
      <Button type="submit" variant="primary" loading={pending}>
        Save profile
      </Button>
    </form>
  );
}

export function EmailForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(changeEmail, {});
  return (
    <form action={action} className="space-y-4">
      <Status state={state} />
      <div>
        <Label htmlFor="email">Email address</Label>
        <Input id="email" name="email" type="email" defaultValue={email} autoComplete="email" aria-invalid={!!state.errors?.email} />
        <FieldError message={state.errors?.email} />
      </div>
      <Button type="submit" variant="outline" loading={pending}>
        Change email
      </Button>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, {});
  return (
    <form action={action} className="space-y-4">
      <Status state={state} />
      <div>
        <Label htmlFor="current">Current password</Label>
        <PasswordInput id="current" name="current" autoComplete="current-password" aria-invalid={!!state.errors?.current} />
        <FieldError message={state.errors?.current} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="new-password">New password</Label>
          <PasswordInput id="new-password" name="password" autoComplete="new-password" showStrength aria-invalid={!!state.errors?.password} />
          <FieldError message={state.errors?.password} />
        </div>
        <div>
          <Label htmlFor="confirm-password">Confirm</Label>
          <PasswordInput id="confirm-password" name="confirm" autoComplete="new-password" aria-invalid={!!state.errors?.confirm} />
          <FieldError message={state.errors?.confirm} />
        </div>
      </div>
      <Button type="submit" variant="outline" loading={pending}>
        Update password
      </Button>
    </form>
  );
}

export function DeleteAccountForm() {
  const [state, action, pending] = useActionState(deleteAccount, {});
  return (
    <form action={action} className="space-y-4">
      <Status state={state} />
      <p className="text-muted">This permanently deletes your account, progress, reflections and notes, and cancels any membership. It cannot be undone.</p>
      <div>
        <Label htmlFor="confirm-delete">
          Type <code className="font-mono text-danger">DELETE</code> to confirm
        </Label>
        <Input id="confirm-delete" name="confirm" autoComplete="off" aria-invalid={!!state.errors?.confirm} className="max-w-xs" />
        <FieldError message={state.errors?.confirm} />
      </div>
      <Button type="submit" variant="danger" loading={pending}>
        Delete my account
      </Button>
    </form>
  );
}
