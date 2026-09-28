import { spawn, type ChildProcess } from "node:child_process";
import { local } from "./local-services";

/**
 * Integration global setup: starts the Bunny stand-in (tests/support/video-server.mjs) unless
 * one is already running, and stops it afterwards.
 */
export default async function setup() {
  const up = () => fetch(`${local.videoOrigin}/health`).then((r) => r.ok, () => false);
  if (await up()) return;
  const child: ChildProcess = spawn(process.execPath, ["tests/support/video-server.mjs"], { stdio: "ignore" });
  for (let i = 0; i < 50 && !(await up()); i++) await new Promise((r) => setTimeout(r, 100));
  return () => {
    child.kill();
  };
}
