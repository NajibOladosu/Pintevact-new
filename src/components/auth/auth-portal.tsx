"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback } from "react";
import type { AccountMode } from "@/components/brand/account-pill";
import { AuthHeading, AuthPanel, AuthShell, AuthSwapLine, authHrefs, swapLinkClass, useDocumentTitle } from "./auth-frame";
import { GoogleButton } from "./google-button";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";

/**
 * Sign in and sign up as one page. Both forms stay mounted; switching modes only changes the URL
 * (history push, no navigation), so the artwork slides across instead of the page reloading.
 */
export function AuthPortal({ next, error }: { next?: string; error?: string }) {
  const pathname = usePathname();
  const mode: AccountMode = pathname.startsWith("/signup") ? "signup" : "signin";
  const hrefs = authHrefs(next);

  const switchTo = useCallback(
    (m: AccountMode) => {
      if (m === mode) return;
      window.history.pushState(null, "", hrefs[m]);
    },
    [mode, hrefs],
  );

  useDocumentTitle(mode === "signin" ? "Sign in · Pintevact" : "Create your account · Pintevact");

  const swap = (m: AccountMode, text: string) => (
    <Link
      href={hrefs[m]}
      className={swapLinkClass}
      onClick={(e) => {
        e.preventDefault();
        switchTo(m);
      }}
    >
      {text}
    </Link>
  );

  return (
    <AuthShell mode={mode} artSide={mode === "signin" ? "right" : "left"} onSwitch={switchTo} next={next}>
      <AuthPanel side="left" active={mode === "signin"} label="Sign in">
        <AuthHeading eyebrow="Your next lesson" title="Welcome back." lead="Your answers, your reflections, your next lesson. All right where you left them." as={mode === "signin" ? "h1" : "h2"} />
        <GoogleButton next={next} label="Continue with Google" />
        <LoginForm next={next} error={error} />
        <AuthSwapLine>No account yet? {swap("signup", "Sign up")}</AuthSwapLine>
      </AuthPanel>
      <AuthPanel side="right" active={mode === "signup"} label="Sign up">
        <AuthHeading eyebrow="A little space for your mind" title="Come as you are." lead="Create your free account. Keep your progress, save your reflections, and start Meet Your Mind in under a minute." as={mode === "signup" ? "h1" : "h2"} />
        <GoogleButton next={next} label="Sign up with Google" />
        <SignupForm next={next} />
        <AuthSwapLine>Already with us? {swap("signin", "Sign in")}</AuthSwapLine>
      </AuthPanel>
    </AuthShell>
  );
}
