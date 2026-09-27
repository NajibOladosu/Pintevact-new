"use client";

import { useFormStatus } from "react-dom";
import { signInWithGoogle } from "@/app/(auth)/actions";

export function AuthDivider({ children }: { children: React.ReactNode }) {
  return <p className="my-7 flex items-center gap-4 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">{children}</p>;
}

function GoogleSubmit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending || undefined}
      className="group flex h-12 w-full items-center justify-center gap-2.5 rounded-[0.85rem] border border-line bg-raised text-[0.875rem] font-medium transition-[border-color,background-color,transform] duration-200 hover:border-fg hover:bg-fg/[0.03] active:scale-[0.985] disabled:opacity-60"
    >
      <svg viewBox="0 0 24 24" className="h-[1.1rem] w-[1.1rem] transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110" aria-hidden>
        <path fill="#4285F4" d="M21.6 12.23c0-.68-.06-1.36-.18-2.02H12v3.83h5.4a4.6 4.6 0 0 1-2 3.03v2.5h3.23c1.9-1.75 2.97-4.32 2.97-7.34Z" />
        <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.23-2.5c-.9.6-2.05.95-3.39.95-2.6 0-4.81-1.76-5.6-4.12H3.07v2.58A10 10 0 0 0 12 22Z" />
        <path fill="#FBBC05" d="M6.4 13.9a6 6 0 0 1 0-3.8V7.52H3.07a10 10 0 0 0 0 8.96L6.4 13.9Z" />
        <path fill="#EA4335" d="M12 5.98c1.47 0 2.79.5 3.83 1.5l2.86-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.93 5.52L6.4 10.1C7.19 7.74 9.4 5.98 12 5.98Z" />
      </svg>
      {pending ? "Opening Google…" : label}
    </button>
  );
}

/** Sign in or sign up with Google through Supabase OAuth. New Google users get an account on first sign-in. */
export function GoogleButton({ next, label = "Continue with Google" }: { next?: string | null; label?: string }) {
  return (
    <form action={signInWithGoogle}>
      <input type="hidden" name="next" value={next ?? ""} />
      <GoogleSubmit label={label} />
      <AuthDivider>Or continue with email</AuthDivider>
    </form>
  );
}
