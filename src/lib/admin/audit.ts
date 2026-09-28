import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/* eslint-disable @typescript-eslint/no-explicit-any -- PostgREST rows */

export type AuditTarget = "course" | "module" | "lesson" | "checkpoint" | "video" | "user" | "newsletter";

export type AuditEntry = { id: number; actor: string; action: string; targetType: AuditTarget; targetId: string | null; summary: string; createdAt: string };

/** Records what an admin changed. Never blocks the action it describes. */
export async function audit(actorId: string, action: string, targetType: AuditTarget, targetId: string | null, summary: string) {
  const { error } = await createAdminClient().from("admin_audit_log").insert({ actor_id: actorId, action, target_type: targetType, target_id: targetId, summary: summary.slice(0, 300) });
  if (error) console.error("[audit]", error.message);
}

export async function recentAudit(limit = 12): Promise<AuditEntry[]> {
  const { data, error } = await createAdminClient()
    .from("admin_audit_log")
    .select("id, action, target_type, target_id, summary, created_at, profiles(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return ((data ?? []) as any[]).map((r) => ({
    id: r.id,
    actor: r.profiles?.full_name || r.profiles?.email || "Someone",
    action: r.action,
    targetType: r.target_type,
    targetId: r.target_id,
    summary: r.summary,
    createdAt: r.created_at,
  }));
}
