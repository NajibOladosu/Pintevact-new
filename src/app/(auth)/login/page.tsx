import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { GoogleButton } from "@/components/auth/google-button";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  return (
    <>
      <p className="eyebrow text-ember">Welcome back</p>
      <h1 className="mt-3 text-5xl leading-none sm:text-6xl">
        Your mind <span className="display-italic">missed you.</span>
      </h1>
      <p className="mb-8 mt-4 text-ink-2">Sign in to pick up exactly where you left off.</p>
      <GoogleButton next={next} />
      <LoginForm next={next} error={error} />
      <p className="mt-8 text-center text-ink-2">
        New here?{" "}
        <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"} className="font-semibold text-ink underline underline-offset-4">
          Create a free account
        </Link>
      </p>
    </>
  );
}
