import { AuthFrame } from "@/components/auth/auth-frame";
import { SettingsDock } from "@/components/settings-dock";
import { isDemoMode } from "@/lib/env";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const demoNote = isDemoMode() ? (
    <p className="mt-8 rounded-[0.85rem] border border-dashed border-line-strong px-4 py-3 text-[0.8125rem] leading-relaxed text-muted">
      <strong className="font-semibold text-fg">Demo mode.</strong> Any email and password works. Use <span className="font-medium text-fg">demo@pintevact.com</span> for sample progress, or an <span className="font-medium text-fg">admin@</span> address for admin.
    </p>
  ) : null;
  return (
    <>
      <AuthFrame demoNote={demoNote}>{children}</AuthFrame>
      <SettingsDock />
    </>
  );
}
