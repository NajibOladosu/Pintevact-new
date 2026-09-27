import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/simple-forms";
import { AuthHeading, AuthSwapLine, swapLinkClass } from "@/components/auth/auth-frame";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthHeading eyebrow="It happens" title="Reset your password." lead="Enter your email and we'll send you a link to choose a new one." />
      <ForgotPasswordForm />
      <AuthSwapLine>
        Remembered it?{" "}
        <Link href="/login" className={swapLinkClass}>
          Back to sign in
        </Link>
      </AuthSwapLine>
    </>
  );
}
