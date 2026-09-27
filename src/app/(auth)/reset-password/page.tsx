import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/simple-forms";

export const metadata: Metadata = { title: "Choose a new password" };

export default function ResetPasswordPage() {
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Choose a new password</h1>
      <p className="mb-8 mt-2 text-muted">Use at least 8 characters, including a letter and a number.</p>
      <ResetPasswordForm />
    </>
  );
}
