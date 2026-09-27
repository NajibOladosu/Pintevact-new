// Serves the HLS fixtures in tests/fixtures/video the way Bunny's CDN would (with CORS), for the e2e player tests.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../fixtures/video/", import.meta.url));
const port = Number(process.env.VIDEO_PORT ?? 4010);
const types = { ".m3u8": "application/vnd.apple.mpegurl", ".m4s": "video/iso.segment", ".mp4": "video/mp4", ".jpg": "image/jpeg" };

createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const path = normalize(decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname)).replace(/^([/\\])+/, "");
  if (path === "" || path === "health") return res.writeHead(200).end("ok");
  try {
    const body = await readFile(join(root, path));
    res.writeHead(200, { "Content-Type": types[extname(path)] ?? "application/octet-stream", "Cache-Control": "no-store" });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
}).listen(port, "127.0.0.1", () => console.log(`video fixtures on http://127.0.0.1:${port}`));
