import { Logo } from "@/components/brand/logo";
import { StationLine } from "@/components/brand/station-line";
import { ThemeToggle } from "@/components/theme-toggle";
import { isDemoMode } from "@/lib/env";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_minmax(0,34rem)]">
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-5 py-5 sm:px-8">
          <Logo />
          <ThemeToggle />
        </div>
        <main id="main" className="flex flex-1 items-center justify-center px-5 pb-16 pt-6 sm:px-8">
          <div className="w-full max-w-sm">
            {isDemoMode() ? (
              <p className="mb-8 rounded-[10px] border border-dashed border-line-strong p-3 text-sm text-muted">
                <strong className="font-medium text-fg">Demo mode.</strong> Any email and password works. Use <code className="font-mono text-fg">demo@pintevact.com</code> for sample progress, or an <code className="font-mono text-fg">admin@</code> address for admin.
              </p>
            ) : null}
            {children}
          </div>
        </main>
      </div>
      <aside className="relative hidden flex-col justify-end overflow-hidden bg-violet p-12 text-on-violet lg:flex">
        <div className="rounded-2xl bg-on-violet/[0.06] p-8 ring-1 ring-on-violet/10">
          <p className="text-sm text-on-violet-muted">Checkpoint, Meet Your Mind</p>
          <p className="mt-3 text-2xl font-semibold leading-snug tracking-tight">Name one activity that makes you lose track of time. What value might it be honoring?</p>
          <StationLine
            className="mt-10 [--line-strong:rgb(248_242_234/0.25)] [--bg:var(--violet)]"
            stations={[
              { id: "1", state: "done" },
              { id: "2", state: "done" },
              { id: "3", state: "current" },
              { id: "4", state: "ahead" },
            ]}
          />
        </div>
        <p className="mt-6 text-sm text-on-violet-muted">Every lesson stops to ask about you. Your answers stay private.</p>
      </aside>
    </div>
  );
}
