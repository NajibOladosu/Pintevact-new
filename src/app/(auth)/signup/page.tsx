import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { GoogleButton } from "@/components/auth/google-button";
import { AuthHeading, AuthSwapLine, swapLinkClass } from "@/components/auth/auth-frame";

export const metadata: Metadata = { title: "Create your account" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <>
      <AuthHeading eyebrow="A little space for your mind" title="Come as you are." lead="Create your free account. Keep your progress, save your reflections, and start Meet Your Mind in under a minute." />
      <GoogleButton next={next} />
      <SignupForm next={next} />
      <AuthSwapLine>
        Already with us?{" "}
        <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className={swapLinkClass}>
          Sign in
        </Link>
      </AuthSwapLine>
    </>
  );
}
