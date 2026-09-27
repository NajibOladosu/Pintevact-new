import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { GoogleButton } from "@/components/auth/google-button";

export const metadata: Metadata = { title: "Create your account" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <>
      <p className="eyebrow text-ember">Free forever · no card needed</p>
      <h1 className="mt-3 text-5xl leading-none sm:text-6xl">
        Meet the <span className="display-italic">real</span> you.
      </h1>
      <p className="mb-8 mt-4 text-ink-2">Create your account and start the free Meet Your Mind course in under a minute.</p>
      <GoogleButton next={next} />
      <SignupForm next={next} />
      <p className="mt-8 text-center text-ink-2">
        Already have an account?{" "}
        <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="font-semibold text-ink underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </>
  );
}
