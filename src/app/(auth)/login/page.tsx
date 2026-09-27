import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { GoogleButton } from "@/components/auth/google-button";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
      <p className="mb-8 mt-2 text-muted">Pick up exactly where you left off.</p>
      <GoogleButton next={next} />
      <LoginForm next={next} error={error} />
      <p className="mt-8 text-center text-sm text-muted">
        New here?{" "}
        <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"} className="font-medium text-fg underline decoration-line-strong underline-offset-4 hover:decoration-fg">
          Create a free account
        </Link>
      </p>
    </>
  );
}
