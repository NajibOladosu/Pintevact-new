import "server-only";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/data";

export async function requireViewer(next?: string) {
  const viewer = await getViewer();
  if (!viewer) redirect(next ? `/signin?next=${encodeURIComponent(next)}` : "/signin");
  return viewer;
}

export async function requireAdmin() {
  const viewer = await requireViewer("/admin");
  if (viewer.profile.role !== "admin") redirect("/dashboard");
  return viewer;
}
