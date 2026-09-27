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
      <div role="tablist" aria-label="Sign-in method" className="mb-6 grid grid-cols-2 rounded-[10px] bg-sunken p-1">
        {(["password", "link"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={cn("rounded-lg py-2 text-sm font-medium transition-colors", mode === m ? "bg-raised text-fg shadow-[0_1px_2px_rgb(17_16_28/0.12)]" : "text-muted hover:text-fg")}
          >
            {m === "password" ? "Password" : "Email me a link"}
          </button>
        ))}
      </div>

      {mode === "password" ? (
        <form action={action} noValidate className="space-y-5">
          {message ? (
            <p role="alert" className="rounded-[10px] border border-danger/40 p-3 text-sm text-danger">
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
              <Link href="/forgot-password" className="text-sm text-muted underline-offset-4 hover:text-fg hover:underline">
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
        <p role="status" className="rounded-[10px] bg-violet p-5 text-on-violet">
          {linkState.message}
        </p>
      ) : (
        <form action={linkAction} noValidate className="space-y-5">
          {linkState.message ? (
            <p role="alert" className="rounded-[10px] border border-danger/40 p-3 text-sm text-danger">
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
