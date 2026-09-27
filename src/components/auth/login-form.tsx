"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signIn, sendMagicLink } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { PasswordInput } from "./password-input";
import { cn } from "@/lib/utils";

export function LoginForm({ next, error }: { next?: string; error?: string }) {
  const [mode, setMode] = useState<"password" | "link">("password");
  const [state, action, pending] = useActionState(signIn, {});
  const [linkState, linkAction, linkPending] = useActionState(sendMagicLink, {});

  const message = error ?? state.message;
  return (
    <div>
      <div role="tablist" aria-label="Sign-in method" className="mb-6 grid grid-cols-2 rounded-full border-2 border-ink p-1">
        {(["password", "link"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={cn("rounded-full py-2 text-sm font-semibold transition", mode === m ? "bg-ink text-paper" : "hover:bg-ink/5")}
          >
            {m === "password" ? "Password" : "Email me a link"}
          </button>
        ))}
      </div>

      {mode === "password" ? (
        <form action={action} noValidate className="space-y-5">
          {message ? (
            <p role="alert" className="rounded-2xl bg-ember/15 p-3 text-sm font-medium text-ember">
              {message}
            </p>
          ) : null}
          <input type="hidden" name="next" value={next ?? ""} />
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" defaultValue={state.values?.email} aria-invalid={!!state.errors?.email} aria-describedby="email-error" />
            <FieldError id="email-error" message={state.errors?.email} />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <Label htmlFor="password" className="mb-0">
                Password
              </Label>
              <Link href="/forgot-password" className="text-sm font-semibold text-ink-2 underline-offset-4 hover:underline">
                Forgot?
              </Link>
            </div>
            <PasswordInput id="password" name="password" autoComplete="current-password" aria-invalid={!!state.errors?.password} aria-describedby="password-error" />
            <FieldError id="password-error" message={state.errors?.password} />
          </div>
          <Button type="submit" size="lg" loading={pending} className="w-full">
            Sign in
          </Button>
        </form>
      ) : linkState.ok ? (
        <p role="status" className="rounded-2xl border-2 border-ink bg-lucid p-5 font-medium">
          {linkState.message}
        </p>
      ) : (
        <form action={linkAction} noValidate className="space-y-5">
          {linkState.message ? (
            <p role="alert" className="rounded-2xl bg-ember/15 p-3 text-sm font-medium text-ember">
              {linkState.message}
            </p>
          ) : null}
          <input type="hidden" name="next" value={next ?? ""} />
          <div>
            <Label htmlFor="link-email">Email</Label>
            <Input id="link-email" name="email" type="email" autoComplete="email" aria-invalid={!!linkState.errors?.email} aria-describedby="link-email-error" />
            <FieldError id="link-email-error" message={linkState.errors?.email} />
          </div>
          <Button type="submit" size="lg" loading={linkPending} className="w-full">
            Send my sign-in link
          </Button>
        </form>
      )}
    </div>
  );
}
