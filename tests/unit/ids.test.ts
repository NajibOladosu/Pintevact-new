import { describe, expect, it } from "vitest";
import { stableUuid, UUID_RE } from "@/lib/ids";

describe("stableUuid", () => {
  it("is deterministic", () => expect(stableUuid("course:x")).toBe(stableUuid("course:x")));
  it("produces valid v4-shaped UUIDs", () => {
    for (const k of ["a", "course:meet-your-mind", "lesson:foo/bar", ""]) expect(stableUuid(k)).toMatch(UUID_RE);
  });
  it("differs across keys", () => {
    const ids = new Set(Array.from({ length: 2000 }, (_, i) => stableUuid(`k${i}`)));
    expect(ids.size).toBe(2000);
  });
});
