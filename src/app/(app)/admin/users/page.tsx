import type { Metadata } from "next";
import { AdminNav } from "@/components/app/admin-nav";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth/session";
import { getStore } from "@/lib/data";
import { setUserRole } from "../actions";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · Learners" };

export default async function AdminUsersPage() {
  const admin = await requireAdmin();
  const users = await getStore().adminListUsers();
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <AdminNav active="users" />
      <div className="overflow-x-auto rounded-2xl border border-line bg-raised">
        <table className="w-full min-w-[44rem] text-left">
          <thead className="text-sm text-muted">
            <tr className="border-b border-line">
              <th className="p-4 font-normal">Learner</th>
              <th className="p-4 font-normal">Joined</th>
              <th className="p-4 font-normal">Courses</th>
              <th className="p-4 font-normal">XP</th>
              <th className="p-4 font-normal">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="p-4">
                  <p className="font-medium">{u.fullName ?? "-"}</p>
                  <p className="text-sm text-muted">{u.email}</p>
                </td>
                <td className="p-4 text-muted">{formatDate(u.createdAt)}</td>
                <td className="p-4 font-mono">{u.enrollments}</td>
                <td className="p-4 font-mono text-accent-ink">{u.xp.toLocaleString()}</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Badge tone={u.role === "admin" ? "accent" : "neutral"}>{u.role}</Badge>
                    {u.id !== admin.id ? (
                      <form action={setUserRole}>
                        <input type="hidden" name="userId" value={u.id} />
                        <input type="hidden" name="role" value={u.role === "admin" ? "student" : "admin"} />
                        <button type="submit" className="text-sm font-semibold text-muted underline-offset-4 hover:text-fg hover:underline">
                          {u.role === "admin" ? "Revoke admin" : "Make admin"}
                        </button>
                      </form>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
