import { requireAdmin } from "@/lib/auth/session";
import { audit } from "@/lib/admin/audit";
import { exportUsersCsv } from "@/lib/admin/users";

export async function GET() {
  const admin = await requireAdmin();
  const csv = await exportUsersCsv();
  await audit(admin.id, "exported", "user", null, "Learner list (CSV)");
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="pintevact-learners-${date}.csv"`, "Cache-Control": "no-store" },
  });
}
