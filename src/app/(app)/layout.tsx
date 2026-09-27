import { Suspense } from "react";
import { Logo } from "@/components/brand/logo";
import { MobileTabBar, SidebarNav } from "@/components/app/app-nav";
import { UserMenu } from "@/components/app/user-menu";
import { XpChip } from "@/components/app/xp-chip";
import { Flash } from "@/components/app/flash";
import { ThemeToggle } from "@/components/theme-toggle";
import { requireViewer } from "@/lib/auth/session";
import { getLearnerSnapshot } from "@/lib/learner";
import { isDemoMode } from "@/lib/env";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const viewer = await requireViewer();
  const snap = await getLearnerSnapshot(viewer.id);
  const isAdmin = viewer.profile.role === "admin";
  return (
    <div className="min-h-dvh">
      {/* Dark rail, floating inside the page like the frames on the public site. */}
      <aside className="fixed inset-y-3 left-3 z-30 hidden w-64 flex-col rounded-[2rem] bg-frame ring-1 ring-line-on-frame px-4 py-6 text-on-frame shadow-frame lg:flex">
        <Logo href="/dashboard" className="px-3 text-on-frame" />
        <div className="mt-10 flex-1">
          <SidebarNav isAdmin={isAdmin} />
        </div>
        <div className="rounded-[1.3rem] bg-on-frame/[0.06] p-4 ring-1 ring-line-on-frame">
          <p className="eyebrow text-on-frame-muted">{snap.level.name}</p>
          <p className="mt-2.5 text-sm">
            Level {snap.level.level} · <span className="tabular">{snap.stats.totalXp.toLocaleString()} XP</span>
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-on-frame/10">
            <div className="h-full rounded-full bg-accent" style={{ width: `${snap.level.percent}%` }} />
          </div>
          {isDemoMode() ? <p className="mt-4 text-[0.72rem] leading-relaxed text-on-frame-muted">Demo mode. Data resets when the server restarts.</p> : null}
        </div>
      </aside>
      <div className="lg:pl-[17.5rem]">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between gap-4 bg-bg/80 px-4 backdrop-blur-xl sm:px-6 lg:bg-transparent lg:px-10 lg:backdrop-blur-none">
          <div className="lg:hidden">
            <Logo href="/dashboard" />
          </div>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-1 rounded-full bg-raised p-1 shadow-pill ring-1 ring-line">
            <XpChip xp={snap.stats.totalXp} level={snap.level.level} levelName={snap.level.name} streak={snap.streak} />
            <ThemeToggle className="h-10 w-10 rounded-full" />
            <UserMenu name={viewer.profile.fullName} email={viewer.email} isAdmin={isAdmin} />
          </div>
        </header>
        <main id="main" className="px-4 pb-32 pt-4 sm:px-6 lg:px-10 lg:pb-16 lg:pt-6">
          <Suspense>
            <Flash />
          </Suspense>
          {children}
        </main>
      </div>
      <MobileTabBar />
    </div>
  );
}
