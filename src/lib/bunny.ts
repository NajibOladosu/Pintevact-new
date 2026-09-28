import "server-only";
import { createHash } from "node:crypto";
import { env, isBunnyConfigured } from "@/lib/env";
import type { PlaybackSource } from "@/lib/types";

/**
 * Bunny CDN token authentication (SHA-256, v2).
 * https://docs.bunny.net/docs/cdn-token-authentication
 *
 * For HLS we sign a *directory* token (token_path=/{videoId}/) so the playlist,
 * renditions and every .ts segment are authorised by a single token embedded in the path.
 */
export function signBunnyUrl(
  url: string,
  securityKey: string,
  expires: number,
  opts: { directory?: boolean; pathAllowed?: string; userIp?: string } = {},
) {
  const parsed = new URL(url);
  const params = new URLSearchParams(parsed.search);
  let signaturePath: string;
  if (opts.pathAllowed) {
    signaturePath = opts.pathAllowed;
    params.set("token_path", signaturePath);
  } else {
    signaturePath = decodeURIComponent(parsed.pathname);
  }
  params.sort();
  let parameterData = "";
  let parameterDataUrl = "";
  params.forEach((value, key) => {
    if (value === "") return;
    if (parameterData.length > 0) parameterData += "&";
    parameterData += `${key}=${value}`;
    parameterDataUrl += `&${key}=${encodeURIComponent(value)}`;
  });
  const hashableBase = securityKey + signaturePath + expires + (opts.userIp ?? "") + parameterData;
  const token = createHash("sha256")
    .update(hashableBase)
    .digest("base64")
    .replace(/\n/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
  if (opts.directory) {
    return `${parsed.protocol}//${parsed.host}/bcdn_token=${token}${parameterDataUrl}&expires=${expires}${parsed.pathname}`;
  }
  return `${parsed.protocol}//${parsed.host}${parsed.pathname}?token=${token}${parameterDataUrl}&expires=${expires}`;
}

export type { PlaybackSource };

/** The pull-zone host, e.g. "vz-abc.b-cdn.net". A full origin ("http://127.0.0.1:4010") is accepted for local HLS fixtures. */
export function cdnOrigin(hostname: string) {
  const trimmed = hostname.trim().replace(/\/$/, "");
  return /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/** Resolve a signed, time-limited stream URL for a lesson video. */
export function getPlaybackSource(videoId: string | null, now = Date.now()): PlaybackSource {
  if (!videoId) return { kind: "unavailable", reason: "no-video" };
  if (!isBunnyConfigured()) return { kind: "unavailable", reason: "not-configured" };

  const origin = cdnOrigin(env.bunnyCdnHostname());
  const key = env.bunnyTokenKey();
  const playlist = `${origin}/${videoId}/playlist.m3u8`;
  const thumbnail = `${origin}/${videoId}/thumbnail.jpg`;
  if (!key) return { kind: "hls", src: playlist, poster: thumbnail };

  const expires = Math.floor(now / 1000) + env.bunnyTokenTtl();
  return {
    kind: "hls",
    src: signBunnyUrl(playlist, key, expires, { directory: true, pathAllowed: `/${videoId}/` }),
    poster: signBunnyUrl(thumbnail, key, expires),
  };
}

/* ------------------------------------------------------------------ */
/*  Stream library API (admin): https://docs.bunny.net/reference/video */
/* ------------------------------------------------------------------ */

/** Bunny's encoding states. */
export const BUNNY_STATUS: Record<number, { label: string; ready: boolean; failed?: boolean }> = {
  0: { label: "Waiting for upload", ready: false },
  1: { label: "Uploaded", ready: false },
  2: { label: "Processing", ready: false },
  3: { label: "Encoding", ready: false },
  4: { label: "Ready", ready: true },
  5: { label: "Encoding failed", ready: false, failed: true },
  6: { label: "Upload failed", ready: false, failed: true },
  7: { label: "Ready", ready: true },
  8: { label: "Ready", ready: true },
};

export type BunnyVideo = {
  guid: string;
  title: string;
  /** Seconds. */
  length: number;
  status: number;
  encodeProgress?: number;
  dateUploaded?: string;
  storageSize?: number;
  width?: number;
  height?: number;
  thumbnailFileName?: string;
};

export type BunnyVideoPage = { items: BunnyVideo[]; totalItems: number; page: number; perPage: number };

export class BunnyError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function bunnyApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const lib = env.bunnyLibraryId();
  const apiKey = env.bunnyApiKey();
  if (!lib || !apiKey) throw new BunnyError("Bunny Stream is not configured (BUNNY_STREAM_LIBRARY_ID, BUNNY_STREAM_API_KEY)", 503);
  const res = await fetch(`${env.bunnyApiBase()}/library/${encodeURIComponent(lib)}${path}`, {
    ...init,
    headers: { AccessKey: apiKey, accept: "application/json", ...(init.body ? { "content-type": "application/json" } : {}), ...init.headers },
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new BunnyError(`Bunny API ${init.method ?? "GET"} ${path} failed (${res.status})${detail ? `: ${detail.slice(0, 200)}` : ""}`, res.status);
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

/** One page of the Stream library, newest first. */
export async function listBunnyVideoPage(opts: { page?: number; perPage?: number; search?: string } = {}): Promise<BunnyVideoPage> {
  const page = Math.max(1, opts.page ?? 1);
  const perPage = Math.min(100, Math.max(1, opts.perPage ?? 24));
  const params = new URLSearchParams({ page: String(page), itemsPerPage: String(perPage), orderBy: "date" });
  if (opts.search) params.set("search", opts.search);
  const body = await bunnyApi<{ items?: BunnyVideo[]; totalItems?: number }>(`/videos?${params}`);
  return { items: body.items ?? [], totalItems: body.totalItems ?? body.items?.length ?? 0, page, perPage };
}

/** Lists up to 100 videos (lesson video pickers). Empty when the library isn't configured. */
export async function listBunnyVideos(search?: string): Promise<BunnyVideo[]> {
  if (!env.bunnyLibraryId() || !env.bunnyApiKey()) return [];
  return (await listBunnyVideoPage({ perPage: 100, search })).items;
}

export function getBunnyVideo(guid: string) {
  return bunnyApi<BunnyVideo>(`/videos/${encodeURIComponent(guid)}`);
}

export function renameBunnyVideo(guid: string, title: string) {
  return bunnyApi<unknown>(`/videos/${encodeURIComponent(guid)}`, { method: "POST", body: JSON.stringify({ title }) });
}

export function deleteBunnyVideo(guid: string) {
  return bunnyApi<unknown>(`/videos/${encodeURIComponent(guid)}`, { method: "DELETE" });
}

export type BunnyUpload = { endpoint: string; videoId: string; libraryId: string; signature: string; expires: number };

/**
 * Creates the video record and signs a TUS upload so the browser sends the file straight to Bunny
 * (large files never pass through our server). The signature is SHA-256 of
 * library id + API key + expiry + video id, and expires after `ttlSeconds`.
 */
export async function createBunnyUpload(title: string, ttlSeconds = 60 * 60 * 6, now = Date.now()): Promise<BunnyUpload> {
  const video = await bunnyApi<BunnyVideo>("/videos", { method: "POST", body: JSON.stringify({ title }) });
  const libraryId = env.bunnyLibraryId();
  const expires = Math.floor(now / 1000) + ttlSeconds;
  return { endpoint: `${env.bunnyApiBase()}/tusupload`, videoId: video.guid, libraryId, expires, signature: tusSignature(libraryId, env.bunnyApiKey(), expires, video.guid) };
}

export function tusSignature(libraryId: string, apiKey: string, expires: number, videoId: string) {
  return createHash("sha256").update(`${libraryId}${apiKey}${expires}${videoId}`).digest("hex");
}

/** A thumbnail URL for the admin library, signed when token authentication is on. */
export function bunnyThumbnailUrl(video: Pick<BunnyVideo, "guid" | "thumbnailFileName">, now = Date.now()) {
  if (!env.bunnyCdnHostname()) return null;
  const url = `${cdnOrigin(env.bunnyCdnHostname())}/${video.guid}/${video.thumbnailFileName || "thumbnail.jpg"}`;
  const key = env.bunnyTokenKey();
  return key ? signBunnyUrl(url, key, Math.floor(now / 1000) + env.bunnyTokenTtl()) : url;
}
