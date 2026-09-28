import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/app/admin-nav";
import { Download, Search } from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { listUsers } from "@/lib/admin/users";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · Learners" };

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string; role?: string; page?: string; deleted?: string }> }) {
  await requireAdmin();
  const { q = "", role: roleParam, page: pageParam, deleted } = await searchParams;
  const role = roleParam === "admin" || roleParam === "student" ? roleParam : "all";
  const { rows, total, page, pages } = await listUsers({ q, role, page: Number(pageParam) || 1 });
  const link = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (role !== "all") params.set("role", role);
    if (p > 1) params.set("page", String(p));
    return `/admin/users${params.size ? `?${params}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <AdminNav
        active="users"
        title="Learners"
        actions={
          <a href="/admin/users/export" className={buttonClasses({ variant: "outline", size: "sm" })} download>
            <Download size={15} aria-hidden /> Export CSV
          </a>
        }
      />
      {deleted ? (
        <p role="status" className="rounded-[1.2rem] bg-raised p-4 text-sm ring-1 ring-line">
          Account deleted.
        </p>
      ) : null}
      <form className="flex flex-col gap-3 sm:flex-row" role="search">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" aria-hidden />
          <input type="search" name="q" defaultValue={q} aria-label="Search learners" placeholder="Search by name or email" className="h-11 w-full rounded-[0.85rem] border border-line bg-raised pl-10 pr-4 focus:border-accent focus:outline-none" />
        </div>
        <select name="role" defaultValue={role} aria-label="Role" className="h-11 rounded-[0.85rem] border border-line bg-raised px-3 text-sm">
          <option value="all">Everyone</option>
          <option value="student">Learners</option>
          <option value="admin">Admins</option>
        </select>
        <button type="submit" className={buttonClasses({ variant: "secondary", size: "sm", className: "h-11" })}>
          Search
        </button>
      </form>
      <p className="tabular text-sm text-muted">
        {total.toLocaleString()} {total === 1 ? "person" : "people"}
        {q ? ` matching "${q}"` : ""}
      </p>
      <div className="overflow-x-auto rounded-[1.6rem] bg-raised ring-1 ring-line">
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
          <tbody className="divide-y divide-line">
            {rows.map((u) => (
              <tr key={u.id} className="transition-colors hover:bg-fg/[0.03]">
                <td className="p-4">
                  <Link href={`/admin/users/${u.id}`} className="flex items-center gap-3">
                    <Avatar name={u.fullName ?? u.email} size={36} />
                    <span className="min-w-0">
                      <span className="block truncate font-medium hover:text-accent-ink">{u.fullName ?? u.email}</span>
                      <span className="block truncate text-sm text-subtle">{u.email}</span>
                    </span>
                  </Link>
                </td>
                <td className="tabular p-4 text-sm text-muted">{formatDate(u.createdAt)}</td>
                <td className="tabular p-4">{u.courses}</td>
                <td className="tabular p-4">{u.xp.toLocaleString()}</td>
                <td className="p-4">{u.role === "admin" ? <Badge tone="violet">Admin</Badge> : <span className="text-sm text-muted">Learner</span>}</td>
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted">
                  Nobody matches.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {pages > 1 ? (
        <nav aria-label="Pages" className="flex items-center justify-center gap-3 text-sm">
          {page > 1 ? <Link href={link(page - 1)} className={buttonClasses({ variant: "outline", size: "sm" })}>Previous</Link> : null}
          <span className="tabular text-muted">
            Page {page} of {pages}
          </span>
          {page < pages ? <Link href={link(page + 1)} className={buttonClasses({ variant: "outline", size: "sm" })}>Next</Link> : null}
        </nav>
      ) : null}
    </div>
  );
}
