import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/simple-forms";
import { AuthHeading } from "@/components/auth/auth-frame";

export const metadata: Metadata = { title: "Choose a new password" };

export default function ResetPasswordPage() {
  return (
    <>
      <AuthHeading eyebrow="Almost there" title="Choose a new password." lead="Use at least 8 characters, including a letter and a number." />
      <ResetPasswordForm />
    </>
  );
}
