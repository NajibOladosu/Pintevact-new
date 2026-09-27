import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "@/components/icons";
import { ResendConfirmationForm } from "@/components/auth/simple-forms";
import { AuthSwapLine, swapLinkClass } from "@/components/auth/auth-frame";

export const metadata: Metadata = { title: "Check your email" };

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams;
  return (
    <div>
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-on-accent">
        <MailCheck size={24} />
      </span>
      <span className="eyebrow mb-3.5 mt-8 text-accent-ink">One more step</span>
      <h1 className="text-[clamp(2.1rem,3.2vw,3rem)] font-semibold leading-[1.02] tracking-[-0.04em]">Check your inbox.</h1>
      <p className="mt-3.5 text-sm leading-relaxed text-muted">
        We sent a confirmation link to {email ? <strong className="font-semibold text-fg">{email}</strong> : "your email"}. Click it to activate your account and start learning.
      </p>
      {email ? <ResendConfirmationForm email={email} /> : null}
      <AuthSwapLine>
        Wrong address?{" "}
        <Link href="/signup" className={swapLinkClass}>
          Sign up again
        </Link>
      </AuthSwapLine>
    </div>
  );
}
