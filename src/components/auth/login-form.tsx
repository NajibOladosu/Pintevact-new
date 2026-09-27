"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signIn, sendMagicLink } from "@/app/(auth)/actions";
import { ArrowUpRight } from "@/components/icons";
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
      <div role="tablist" aria-label="Sign-in method" className="mb-7 grid grid-cols-2 gap-1 rounded-full border border-line p-1">
        {(["password", "link"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={cn("rounded-full py-2 text-[0.8125rem] font-semibold transition-colors", mode === m ? "bg-fg text-bg" : "text-muted hover:text-fg")}
          >
            {m === "password" ? "Password" : "Email me a link"}
          </button>
        ))}
      </div>

      {mode === "password" ? (
        <form action={action} noValidate className="space-y-5">
          {message ? (
            <p role="alert" className="rounded-[0.85rem] border border-danger/40 px-4 py-3 text-sm text-danger">
              {message}
            </p>
          ) : null}
          <input type="hidden" name="next" value={next ?? ""} />
          <div>
            <Label htmlFor="email">Email address</Label>
            <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" defaultValue={state.values?.email} aria-invalid={!!state.errors?.email} aria-describedby="email-error" />
            <FieldError id="email-error" message={state.errors?.email} />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <PasswordInput id="password" name="password" autoComplete="current-password" placeholder="Your password" aria-invalid={!!state.errors?.password} aria-describedby="password-error" />
            <FieldError id="password-error" message={state.errors?.password} />
            <Link href="/forgot-password" className="mt-3 inline-block text-[0.8125rem] text-muted underline-offset-4 hover:text-fg hover:underline">
              Forgot your password?
            </Link>
          </div>
          <Button type="submit" size="lg" loading={pending} className="w-full rounded-[0.9rem]">
            Sign in <ArrowUpRight size={15} aria-hidden />
          </Button>
        </form>
      ) : linkState.ok ? (
        <p role="status" className="rounded-[1.1rem] bg-violet p-5 text-on-violet">
          {linkState.message}
        </p>
      ) : (
        <form action={linkAction} noValidate className="space-y-5">
          {linkState.message ? (
            <p role="alert" className="rounded-[0.85rem] border border-danger/40 px-4 py-3 text-sm text-danger">
              {linkState.message}
            </p>
          ) : null}
          <input type="hidden" name="next" value={next ?? ""} />
          <div>
            <Label htmlFor="link-email">Email address</Label>
            <Input id="link-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" aria-invalid={!!linkState.errors?.email} aria-describedby="link-email-error" />
            <FieldError id="link-email-error" message={linkState.errors?.email} />
          </div>
          <Button type="submit" size="lg" loading={linkPending} className="w-full rounded-[0.9rem]">
            Send my sign-in link <ArrowUpRight size={15} aria-hidden />
          </Button>
        </form>
      )}
    </div>
  );
}
