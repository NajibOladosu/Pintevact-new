import { getViewer } from "@/lib/data";
import { HeaderShell } from "./header-shell";

export const marketingNav = [
  { href: "/courses", label: "Courses" },
  { href: "/discover", label: "Mind quiz" },
  { href: "/pricing", label: "Pricing" },
  { href: "/journal", label: "Journal" },
  { href: "/about", label: "About" },
];

export async function SiteHeader() {
  const viewer = await getViewer().catch(() => null);
  return <HeaderShell items={marketingNav} signedIn={Boolean(viewer)} />;
}
