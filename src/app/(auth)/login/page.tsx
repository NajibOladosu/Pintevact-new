import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { GoogleButton } from "@/components/auth/google-button";
import { AuthHeading, AuthSwapLine, swapLinkClass } from "@/components/auth/auth-frame";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  return (
    <>
      <AuthHeading eyebrow="Your next lesson" title="Welcome back." lead="Your answers, your reflections, your next lesson. All right where you left them." />
      <GoogleButton next={next} />
      <LoginForm next={next} error={error} />
      <AuthSwapLine>
        No account yet?{" "}
        <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"} className={swapLinkClass}>
          Sign up
        </Link>
      </AuthSwapLine>
    </>
  );
}
