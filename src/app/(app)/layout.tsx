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
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line px-3 py-5 lg:flex">
        <Logo href="/dashboard" className="px-3" />
        <div className="mt-8 flex-1">
          <SidebarNav isAdmin={isAdmin} />
        </div>
        {isDemoMode() ? <p className="px-3 text-xs text-subtle">Demo mode. Data resets when the server restarts.</p> : null}
      </aside>
      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-line bg-bg/85 px-4 backdrop-blur sm:px-6 lg:px-10">
          <div className="lg:hidden">
            <Logo href="/dashboard" />
          </div>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-1.5">
            <XpChip xp={snap.stats.totalXp} level={snap.level.level} levelName={snap.level.name} streak={snap.streak} />
            <ThemeToggle />
            <UserMenu name={viewer.profile.fullName} email={viewer.email} isAdmin={isAdmin} />
          </div>
        </header>
        <main id="main" className="px-4 pb-28 pt-8 sm:px-6 lg:px-10 lg:pb-16 lg:pt-10">
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
