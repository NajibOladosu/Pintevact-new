import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { ResendConfirmationForm } from "@/components/auth/simple-forms";

export const metadata: Metadata = { title: "Check your email" };

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams;
  return (
    <div className="text-center">
      <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-ink bg-lucid shadow-hard">
        <MailCheck size={34} />
      </span>
      <h1 className="mt-8 text-5xl leading-none">Check your inbox.</h1>
      <p className="mt-4 text-lg text-ink-2">
        We sent a confirmation link to {email ? <strong className="text-ink">{email}</strong> : "your email"}. Click it to activate your account and start learning.
      </p>
      {email ? <ResendConfirmationForm email={email} /> : null}
      <p className="mt-10 text-sm text-ink-3">
        Wrong address?{" "}
        <Link href="/signup" className="font-semibold underline underline-offset-4">
          Sign up again
        </Link>
      </p>
    </div>
  );
}
