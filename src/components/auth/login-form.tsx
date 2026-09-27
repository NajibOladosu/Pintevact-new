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
  const [method, setMethod] = useState<"password" | "link">("password");
  const [state, action, pending] = useActionState(signIn, {});
  const [linkState, linkAction, linkPending] = useActionState(sendMagicLink, {});

  const message = state.message ?? error;
  return (
    <div>
      <div role="tablist" aria-label="Sign-in method" className="relative mb-7 grid grid-cols-2 gap-1 rounded-full border border-line p-1">
        <span aria-hidden className={cn("absolute inset-y-1 left-1 w-[calc(50%-6px)] rounded-full bg-fg transition-transform duration-500 ease-[var(--ease-soft)]", method === "link" && "translate-x-[calc(100%+4px)]")} />
        {(["password", "link"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={method === m}
            onClick={() => setMethod(m)}
            className={cn("relative z-10 rounded-full py-2 text-[0.8125rem] font-semibold transition-colors duration-300", method === m ? "text-bg" : "text-muted hover:text-fg")}
          >
            {m === "password" ? "Password" : "Email me a link"}
          </button>
        ))}
      </div>

      {method === "password" ? (
        <form action={action} noValidate aria-label="Sign in with email and password" className="animate-enter space-y-5">
          {message ? (
            <p role="alert" className="rounded-[0.85rem] border border-danger/40 px-4 py-3 text-sm text-danger">
              {message}
            </p>
          ) : null}
          <input type="hidden" name="next" value={next ?? ""} />
          <div>
            <Label htmlFor="signin-email">Email address</Label>
            <Input id="signin-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" defaultValue={state.values?.email} aria-invalid={!!state.errors?.email} aria-describedby="signin-email-error" />
            <FieldError id="signin-email-error" message={state.errors?.email} />
          </div>
          <div>
            <Label htmlFor="signin-password">Password</Label>
            <PasswordInput id="signin-password" name="password" autoComplete="current-password" placeholder="Your password" aria-invalid={!!state.errors?.password} aria-describedby="signin-password-error" />
            <FieldError id="signin-password-error" message={state.errors?.password} />
            <Link href="/forgot-password" className="mt-3 inline-block text-[0.8125rem] text-muted underline-offset-4 hover:text-fg hover:underline">
              Forgot your password?
            </Link>
          </div>
          <Button type="submit" size="lg" loading={pending} className="group w-full rounded-[0.9rem]">
            Sign in <ArrowUpRight size={15} aria-hidden className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Button>
        </form>
      ) : linkState.ok ? (
        <p role="status" className="animate-enter rounded-[1.1rem] bg-violet p-5 text-on-violet">
          {linkState.message}
        </p>
      ) : (
        <form action={linkAction} noValidate aria-label="Email me a sign-in link" className="animate-enter space-y-5">
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
          <Button type="submit" size="lg" loading={linkPending} className="group w-full rounded-[0.9rem]">
            Send my sign-in link <ArrowUpRight size={15} aria-hidden className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Button>
        </form>
      )}
    </div>
  );
}
