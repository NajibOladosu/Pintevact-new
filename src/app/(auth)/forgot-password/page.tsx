import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/simple-forms";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Reset your password</h1>
      <p className="mb-8 mt-2 text-muted">Enter your email and we&apos;ll send you a link to choose a new one.</p>
      <ForgotPasswordForm />
      <p className="mt-8 text-center text-sm text-muted">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-fg underline decoration-line-strong underline-offset-4 hover:decoration-fg">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
