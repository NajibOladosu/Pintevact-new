// Stands in for Bunny in the e2e and integration suites:
//   - serves the HLS fixtures in tests/fixtures/video the way Bunny's CDN would (with CORS);
//   - under /bunny, implements the parts of the Bunny Stream API the admin uses: listing, creating,
//     renaming and deleting library videos, and TUS uploads signed like Bunny signs them.
import { createHash, randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { readdir, readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../fixtures/video/", import.meta.url));
const port = Number(process.env.VIDEO_PORT ?? 4010);
const types = { ".m3u8": "application/vnd.apple.mpegurl", ".m4s": "video/iso.segment", ".mp4": "video/mp4", ".jpg": "image/jpeg" };

export const BUNNY_LIBRARY_ID = "e2e-library";
export const BUNNY_API_KEY = "e2e-bunny-api-key";

/** The library starts with the three fixture videos, ready to play. */
const videos = new Map();
for (const dir of (await readdir(root, { withFileTypes: true })).filter((d) => d.isDirectory())) {
  const length = Number(dir.name.split("-").pop()) || 60;
  videos.set(dir.name, { guid: dir.name, title: `Fixture ${length / 60} min`, length, status: 4, encodeProgress: 100, dateUploaded: "2026-09-01T00:00:00Z", storageSize: 1_000_000, width: 1280, height: 720, thumbnailFileName: "thumbnail.jpg" });
}
const uploads = new Map();

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, HEAD, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Expose-Headers": "Location, Upload-Offset, Upload-Length, Tus-Resumable, Tus-Version, Tus-Max-Size",
};

const json = (res, status, body) => res.writeHead(status, { "Content-Type": "application/json" }).end(JSON.stringify(body));
const readBody = (req) => new Promise((resolve) => { const chunks = []; req.on("data", (c) => chunks.push(c)); req.on("end", () => resolve(Buffer.concat(chunks))); });

async function bunny(req, res, path, url) {
  // TUS uploads: authorised by a signature instead of the API key.
  if (path.startsWith("tusupload")) {
    res.setHeader("Tus-Resumable", "1.0.0");
    if (req.method === "OPTIONS") return res.writeHead(204, { "Tus-Version": "1.0.0" }).end();
    const id = path.split("/")[1];
    if (req.method === "POST" && !id) {
      const { authorizationsignature: sig, authorizationexpire: exp, videoid: videoId, libraryid: lib } = req.headers;
      const expected = createHash("sha256").update(`${lib}${BUNNY_API_KEY}${exp}${videoId}`).digest("hex");
      if (lib !== BUNNY_LIBRARY_ID || sig !== expected || Number(exp) * 1000 < Date.now() || !videos.has(videoId)) return res.writeHead(401).end("bad signature");
      const uploadId = randomUUID();
      uploads.set(uploadId, { videoId, length: Number(req.headers["upload-length"]), offset: 0 });
      return res.writeHead(201, { Location: `${url.origin}/bunny/tusupload/${uploadId}` }).end();
    }
    const upload = uploads.get(id);
    if (!upload) return res.writeHead(404).end();
    if (req.method === "HEAD") return res.writeHead(200, { "Upload-Offset": String(upload.offset), "Upload-Length": String(upload.length), "Cache-Control": "no-store" }).end();
    if (req.method === "PATCH") {
      const body = await readBody(req);
      if (Number(req.headers["upload-offset"]) !== upload.offset) return res.writeHead(409).end();
      upload.offset += body.length;
      if (upload.offset >= upload.length) Object.assign(videos.get(upload.videoId), { status: 4, encodeProgress: 100, length: 420, storageSize: upload.length, width: 1920, height: 1080 });
      return res.writeHead(204, { "Upload-Offset": String(upload.offset) }).end();
    }
    return res.writeHead(405).end();
  }

  const match = path.match(/^library\/([^/]+)\/videos(?:\/([^/]+))?$/);
  if (!match) return res.writeHead(404).end();
  if (match[1] !== BUNNY_LIBRARY_ID || req.headers.accesskey !== BUNNY_API_KEY) return json(res, 401, { message: "Unauthorized" });
  const guid = match[2] && decodeURIComponent(match[2]);

  if (!guid && req.method === "GET") {
    const search = (url.searchParams.get("search") ?? "").toLowerCase();
    const page = Number(url.searchParams.get("page") ?? 1);
    const per = Number(url.searchParams.get("itemsPerPage") ?? 100);
    const all = [...videos.values()].filter((v) => v.title.toLowerCase().includes(search)).sort((a, b) => b.dateUploaded.localeCompare(a.dateUploaded));
    return json(res, 200, { totalItems: all.length, currentPage: page, itemsPerPage: per, items: all.slice((page - 1) * per, page * per) });
  }
  if (!guid && req.method === "POST") {
    const { title } = JSON.parse((await readBody(req)).toString() || "{}");
    const video = { guid: randomUUID(), title: title || "Untitled", length: 0, status: 0, encodeProgress: 0, dateUploaded: new Date().toISOString(), storageSize: 0, thumbnailFileName: "thumbnail.jpg" };
    videos.set(video.guid, video);
    return json(res, 200, video);
  }
  const video = guid && videos.get(guid);
  if (!video) return json(res, 404, { message: "Video not found" });
  if (req.method === "GET") return json(res, 200, video);
  if (req.method === "POST") {
    const { title } = JSON.parse((await readBody(req)).toString() || "{}");
    if (title) video.title = title;
    return json(res, 200, { success: true });
  }
  if (req.method === "DELETE") {
    videos.delete(guid);
    return json(res, 200, { success: true });
  }
  return res.writeHead(405).end();
}

createServer(async (req, res) => {
  for (const [k, v] of Object.entries(cors)) res.setHeader(k, v);
  const url = new URL(req.url ?? "/", `http://127.0.0.1:${port}`);
  const path = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, "");
  if (path === "" || path === "health") return res.writeHead(200).end("ok");
  if (path === "bunny" || path.startsWith("bunny/")) return bunny(req, res, path.slice("bunny/".length), url);
  if (req.method === "OPTIONS") return res.writeHead(204).end();
  // Every video gets the same poster; segments come from the fixture folders.
  const file = path.endsWith("/thumbnail.jpg") ? "thumbnail.jpg" : path;
  try {
    const body = await readFile(join(root, file));
    res.writeHead(200, { "Content-Type": types[extname(file)] ?? "application/octet-stream", "Cache-Control": "no-store" });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
}).listen(port, "127.0.0.1", () => console.log(`video fixtures on http://127.0.0.1:${port}, Bunny Stream API on /bunny`));
