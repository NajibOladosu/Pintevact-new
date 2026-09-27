import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/simple-forms";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <>
      <p className="eyebrow text-ember">Password reset</p>
      <h1 className="mt-3 text-5xl leading-none sm:text-6xl">
        Memory is <span className="display-italic">reconstructive.</span>
      </h1>
      <p className="mb-8 mt-4 text-ink-2">So are passwords. Enter your email and we&apos;ll send you a link to choose a new one.</p>
      <ForgotPasswordForm />
      <p className="mt-8 text-center text-ink-2">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-ink underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
