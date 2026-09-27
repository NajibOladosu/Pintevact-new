import { createHash } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";


import { getPlaybackSource, signBunnyUrl } from "@/lib/bunny";

function b64url(input: string) {
  return createHash("sha256").update(input).digest("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

describe("signBunnyUrl", () => {
  it("signs single files with a query token", () => {
    const url = signBunnyUrl("https://vz-1.b-cdn.net/abc/thumbnail.jpg", "secret", 1700000000);
    expect(url).toBe(`https://vz-1.b-cdn.net/abc/thumbnail.jpg?token=${b64url("secret/abc/thumbnail.jpg1700000000")}&expires=1700000000`);
  });

  it("signs directories with an embedded path token", () => {
    const url = signBunnyUrl("https://vz-1.b-cdn.net/abc/playlist.m3u8", "secret", 1700000000, { directory: true, pathAllowed: "/abc/" });
    const token = b64url("secret/abc/1700000000token_path=/abc/");
    expect(url).toBe(`https://vz-1.b-cdn.net/bcdn_token=${token}&token_path=%2Fabc%2F&expires=1700000000/abc/playlist.m3u8`);
  });

  it("never emits base64 padding or unsafe characters", () => {
    for (let i = 0; i < 50; i++) {
      const url = signBunnyUrl(`https://h.b-cdn.net/v${i}/playlist.m3u8`, `k${i}`, 1700000000 + i);
      const token = new URL(url).searchParams.get("token")!;
      expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    }
  });
});

describe("getPlaybackSource", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("reports a lesson without a video as unavailable", () => {
    expect(getPlaybackSource(null)).toEqual({ kind: "unavailable", reason: "no-video" });
  });

  it("reports streaming as unavailable when Bunny is not configured", () => {
    vi.stubEnv("BUNNY_STREAM_CDN_HOSTNAME", "");
    expect(getPlaybackSource("vid")).toEqual({ kind: "unavailable", reason: "not-configured" });
  });

  it("returns signed HLS + poster when configured", () => {
    vi.stubEnv("BUNNY_STREAM_CDN_HOSTNAME", "vz-9.b-cdn.net");
    vi.stubEnv("BUNNY_STREAM_TOKEN_KEY", "key");
    vi.stubEnv("BUNNY_STREAM_TOKEN_TTL", "60");
    const src = getPlaybackSource("vid", 1_700_000_000_000);
    expect(src.kind).toBe("hls");
    if (src.kind !== "hls") return;
    expect(src.src).toContain("https://vz-9.b-cdn.net/bcdn_token=");
    expect(src.src).toContain("&expires=1700000060/vid/playlist.m3u8");
    expect(src.poster).toContain("/vid/thumbnail.jpg?token=");
  });

  it("accepts a full origin for self-hosted HLS", () => {
    vi.stubEnv("BUNNY_STREAM_CDN_HOSTNAME", "http://127.0.0.1:4010/");
    vi.stubEnv("BUNNY_STREAM_TOKEN_KEY", "");
    expect(getPlaybackSource("vid")).toEqual({ kind: "hls", src: "http://127.0.0.1:4010/vid/playlist.m3u8", poster: "http://127.0.0.1:4010/vid/thumbnail.jpg" });
  });
});
