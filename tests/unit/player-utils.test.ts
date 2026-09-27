import { describe, expect, it } from "vitest";
import { accumulateWatched, crossedInteraction, currentChapter, nextInteraction, parseStartTime } from "@/components/player/player-utils";
import type { Interaction } from "@/lib/types";

const mk = (id: string, at: number): Interaction => ({ id, lessonId: "l", atSeconds: at, type: "insight", prompt: "p", body: "b", xp: 5, required: false });
const list = [mk("a", 10), mk("b", 20), mk("c", 30)];

describe("crossedInteraction", () => {
  it("fires when playback crosses a checkpoint", () => {
    expect(crossedInteraction(list, 9.6, 10.1, new Set())?.id).toBe("a");
  });
  it("ignores handled interactions", () => {
    expect(crossedInteraction(list, 9.6, 10.1, new Set(["a"]))).toBeNull();
  });
  it("does not fire on seeks or rewinds", () => {
    expect(crossedInteraction(list, 5, 25, new Set())).toBeNull();
    expect(crossedInteraction(list, 25, 19, new Set())).toBeNull();
  });
});

describe("helpers", () => {
  it("finds the current chapter", () => {
    const chapters = [{ atSeconds: 0, title: "A" }, { atSeconds: 60, title: "B" }];
    expect(currentChapter(chapters, 30)?.title).toBe("A");
    expect(currentChapter(chapters, 61)?.title).toBe("B");
  });
  it("finds the next pending interaction", () => {
    expect(nextInteraction(list, 12, new Set(["b"]))?.id).toBe("c");
    expect(nextInteraction(list, 31, new Set())).toBeNull();
  });
  it("only accumulates real playback", () => {
    expect(accumulateWatched(10, 5, 6)).toBe(11);
    expect(accumulateWatched(10, 5, 50)).toBe(10);
    expect(accumulateWatched(10, 6, 5)).toBe(10);
  });
  it("parses ?t= safely", () => {
    expect(parseStartTime("42", 100)).toBe(42);
    expect(parseStartTime("500", 100)).toBe(99);
    expect(parseStartTime("abc", 100)).toBeNull();
    expect(parseStartTime("-3", 100)).toBeNull();
    expect(parseStartTime(undefined, 100)).toBeNull();
  });
});

describe("fast playback", () => {
  it("counts larger steps as watching when the allowed step grows with the playback rate", () => {
    expect(crossedInteraction(list, 8, 12, new Set())).toBeNull();
    expect(crossedInteraction(list, 8, 12, new Set(), 2.5 * 2)?.id).toBe("a");
    expect(accumulateWatched(0, 8, 12)).toBe(0);
    expect(accumulateWatched(0, 8, 12, 5)).toBe(4);
  });
});
