import { signInWithGoogle } from "@/app/(auth)/actions";

export function GoogleButton({ next }: { next?: string }) {
  if (process.env.NEXT_PUBLIC_AUTH_GOOGLE !== "true") return null;
  return (
    <form action={signInWithGoogle} className="mb-6">
      <input type="hidden" name="next" value={next ?? ""} />
      <button type="submit" className="flex h-11 w-full items-center justify-center gap-3 rounded-[10px] border border-line-strong bg-raised font-medium transition-colors hover:border-fg">
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
          <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.7 4-5.5 4-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.3 12 2.3 6.7 2.3 2.4 6.6 2.4 12s4.3 9.7 9.6 9.7c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12Z" />
        </svg>
        Continue with Google
      </button>
      <p className="mt-6 flex items-center gap-4 text-sm text-subtle before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">or</p>
    </form>
  );
}
