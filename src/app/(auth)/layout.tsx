import { Logo } from "@/components/brand/logo";
import { Constellation } from "@/components/brand/constellation";
import { AuthQuote } from "@/components/auth/auth-quote";
import { isDemoMode } from "@/lib/env";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.05fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-night p-12 lg:flex">
        <Constellation className="absolute inset-0 h-full w-full text-mist" count={55} seed={17} />
        <div className="absolute -bottom-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-iris/30 blur-3xl" aria-hidden />
        <Logo tone="paper" className="relative" />
        <div className="relative max-w-lg">
          <AuthQuote />
        </div>
        <p className="eyebrow relative text-mist">Interactive psychology · Evidence-based · Private by design</p>
      </aside>
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-5 lg:hidden">
          <Logo />
        </div>
        <main id="main" className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10">
          <div className="w-full max-w-md">
            {isDemoMode() ? (
              <p className="mb-6 rounded-2xl border-2 border-dashed border-iris bg-iris/10 p-3 text-sm text-ink-2">
                <strong>Demo mode:</strong> Supabase isn&apos;t configured, so any email & password works. Use <code className="font-mono">demo@pintevact.com</code> for a pre-filled account or <code className="font-mono">admin@…</code> for admin.
              </p>
            ) : null}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
