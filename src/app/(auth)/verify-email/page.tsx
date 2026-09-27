import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "@/components/icons";
import { ResendConfirmationForm } from "@/components/auth/simple-forms";

export const metadata: Metadata = { title: "Check your email" };

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams;
  return (
    <div className="text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet text-on-violet">
        <MailCheck size={26} />
      </span>
      <h1 className="mt-8 text-3xl font-semibold tracking-tight">Check your inbox.</h1>
      <p className="mt-4 text-lg text-muted">
        We sent a confirmation link to {email ? <strong className="font-medium text-fg">{email}</strong> : "your email"}. Click it to activate your account and start learning.
      </p>
      {email ? <ResendConfirmationForm email={email} /> : null}
      <p className="mt-10 text-sm text-subtle">
        Wrong address?{" "}
        <Link href="/signup" className="font-semibold underline underline-offset-4">
          Sign up again
        </Link>
      </p>
    </div>
  );
}
