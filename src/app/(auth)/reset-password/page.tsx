import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/simple-forms";

export const metadata: Metadata = { title: "Choose a new password" };

export default function ResetPasswordPage() {
  return (
    <>
      <p className="eyebrow text-ember">Almost there</p>
      <h1 className="mt-3 text-5xl leading-none sm:text-6xl">
        A fresh <span className="display-italic">start.</span>
      </h1>
      <p className="mb-8 mt-4 text-ink-2">Choose a new password with at least 8 characters, including a letter and a number.</p>
      <ResetPasswordForm />
    </>
  );
}
