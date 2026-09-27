import { SettingsDock } from "@/components/settings-dock";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SettingsDock />
    </>
  );
}
