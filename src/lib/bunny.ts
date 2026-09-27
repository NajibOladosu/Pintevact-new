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

export type BunnyVideo = { guid: string; title: string; length: number; status: number; thumbnailFileName?: string };

/** Lists videos in the Stream library (admin tooling). */
export async function listBunnyVideos(search?: string): Promise<BunnyVideo[]> {
  const lib = env.bunnyLibraryId();
  const apiKey = env.bunnyApiKey();
  if (!lib || !apiKey) return [];
  const url = new URL(`https://video.bunnycdn.com/library/${lib}/videos`);
  url.searchParams.set("page", "1");
  url.searchParams.set("itemsPerPage", "100");
  url.searchParams.set("orderBy", "date");
  if (search) url.searchParams.set("search", search);
  const res = await fetch(url, { headers: { AccessKey: apiKey, accept: "application/json" }, cache: "no-store" });
  if (!res.ok) throw new Error(`Bunny API error ${res.status}`);
  const body = (await res.json()) as { items?: BunnyVideo[] };
  return body.items ?? [];
}
