import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { GoogleButton } from "@/components/auth/google-button";

export const metadata: Metadata = { title: "Create your account" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Create your free account</h1>
      <p className="mb-8 mt-2 text-muted">Start Meet Your Mind in under a minute. No card needed.</p>
      <GoogleButton next={next} />
      <SignupForm next={next} />
      <p className="mt-8 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="font-medium text-fg underline decoration-line-strong underline-offset-4 hover:decoration-fg">
          Sign in
        </Link>
      </p>
    </>
  );
}
