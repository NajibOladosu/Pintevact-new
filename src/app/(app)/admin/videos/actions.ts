"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { attempt, type ActionResult } from "@/lib/admin/action";
import { audit } from "@/lib/admin/audit";
import { AdminError, videoUsage } from "@/lib/admin/catalog";
import { BUNNY_STATUS, bunnyThumbnailUrl, createBunnyUpload, deleteBunnyVideo, getBunnyVideo, listBunnyVideoPage, renameBunnyVideo, type BunnyUpload } from "@/lib/bunny";

const guid = z.string().regex(/^[a-zA-Z0-9-]{1,64}$/, "Not a Bunny video ID");
const videoTitle = z.string().trim().min(1, "Give the video a name").max(200);

export type LibraryVideo = { guid: string; title: string; length: number; status: number; statusLabel: string; ready: boolean; failed: boolean; progress: number; uploadedAt: string | null; thumbnail: string | null; sizeBytes: number };

function toLibraryVideo(v: Awaited<ReturnType<typeof getBunnyVideo>>): LibraryVideo {
  const s = BUNNY_STATUS[v.status] ?? { label: "Unknown", ready: false };
  return {
    guid: v.guid,
    title: v.title,
    length: Math.round(v.length ?? 0),
    status: v.status,
    statusLabel: s.label,
    ready: s.ready,
    failed: !!s.failed,
    progress: v.encodeProgress ?? 0,
    uploadedAt: v.dateUploaded ?? null,
    thumbnail: s.ready ? bunnyThumbnailUrl(v) : null,
    sizeBytes: v.storageSize ?? 0,
  };
}

/** Library search for the lesson video picker. */
export async function searchVideos(search: string, page = 1): Promise<ActionResult<{ items: LibraryVideo[]; total: number }>> {
  await requireAdmin();
  return attempt(async () => {
    const res = await listBunnyVideoPage({ search: search.trim().slice(0, 100), page, perPage: 24 });
    return { items: res.items.map(toLibraryVideo), total: res.totalItems };
  });
}

export async function getVideo(id: string): Promise<ActionResult<LibraryVideo>> {
  await requireAdmin();
  return attempt(async () => toLibraryVideo(await getBunnyVideo(guid.parse(id))));
}

/** Creates the video in Bunny and returns a signed upload the browser uses to send the file directly. */
export async function startUpload(title: string): Promise<ActionResult<BunnyUpload>> {
  const admin = await requireAdmin();
  const res = await attempt(() => createBunnyUpload(videoTitle.parse(title)));
  if (res.ok) await audit(admin.id, "uploaded", "video", res.data!.videoId, title);
  return res;
}

export async function renameVideo(id: string, title: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const res = await attempt(() => renameBunnyVideo(guid.parse(id), videoTitle.parse(title)), "Video renamed.");
  if (res.ok) {
    await audit(admin.id, "renamed", "video", id, title);
    revalidatePath("/admin/videos");
  }
  return { ...res, data: undefined } as ActionResult;
}

/** Deleting is refused while lessons still play the video. */
export async function deleteVideo(id: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const res = await attempt(async () => {
    const used = (await videoUsage()).get(guid.parse(id)) ?? [];
    if (used.length) throw new AdminError(`${used.length === 1 ? `"${used[0].lessonTitle}" uses` : `${used.length} lessons use`} this video. Choose another video for ${used.length === 1 ? "it" : "them"} first.`);
    await deleteBunnyVideo(id);
  }, "Video deleted from Bunny Stream.");
  if (res.ok) {
    await audit(admin.id, "deleted", "video", id, "");
    revalidatePath("/admin/videos");
  }
  return { ...res, data: undefined } as ActionResult;
}
