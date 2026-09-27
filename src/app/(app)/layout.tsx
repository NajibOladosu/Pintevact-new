import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { MobileTabBar, SidebarNav } from "@/components/app/app-nav";
import { UserMenu } from "@/components/app/user-menu";
import { XpChip } from "@/components/app/xp-chip";
import { requireViewer } from "@/lib/auth/session";
import { getLearnerSnapshot } from "@/lib/learner";
import { isDemoMode } from "@/lib/env";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const viewer = await requireViewer();
  const snap = await getLearnerSnapshot(viewer.id);
  const isAdmin = viewer.profile.role === "admin";
  return (
    <div className="theme-night min-h-dvh bg-night text-paper">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/10 bg-night px-4 py-6 lg:flex">
        <Logo href="/dashboard" tone="paper" className="px-3" />
        <div className="mt-10 flex-1">
          <SidebarNav isAdmin={isAdmin} />
        </div>
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-iris/30 to-ember/20 p-5">
          <p className="eyebrow text-lucid">Mind prompt</p>
          <p className="mt-2 font-display text-lg italic leading-snug">What did you avoid today — and what were you protecting?</p>
          <Link href="/reflections" className="mt-3 inline-block text-sm font-semibold text-paper underline underline-offset-4">
            Open your vault →
          </Link>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-white/10 bg-night/85 px-4 backdrop-blur sm:px-6 lg:px-10">
          <div className="lg:hidden">
            <Logo href="/dashboard" tone="paper" />
          </div>
          <div className="hidden text-sm text-mist lg:block">
            {isDemoMode() ? <span className="rounded-full border border-dashed border-iris px-3 py-1">Demo mode · data resets on restart</span> : null}
          </div>
          <div className="flex items-center gap-3">
            <XpChip xp={snap.stats.totalXp} level={snap.level.level} levelName={snap.level.name} percent={snap.level.percent} streak={snap.streak} />
            <UserMenu name={viewer.profile.fullName} email={viewer.email} isAdmin={isAdmin} />
          </div>
        </header>
        <main id="main" className="px-4 pb-28 pt-8 sm:px-6 lg:px-10 lg:pb-16">
          {children}
        </main>
      </div>
      <MobileTabBar />
    </div>
  );
}
