import { describe, expect, it } from "vitest";
import { formatDuration, formatMinutes, formatPrice, initials, safeRedirect, slugify, clamp } from "@/lib/utils";

describe("formatDuration", () => {
  it("formats minutes and seconds", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(3725)).toBe("1:02:05");
  });
  it("never goes negative", () => expect(formatDuration(-10)).toBe("0:00"));
});

describe("formatMinutes", () => {
  it("rounds to minutes and hours", () => {
    expect(formatMinutes(420)).toBe("7 min");
    expect(formatMinutes(3600)).toBe("1h");
    expect(formatMinutes(5400)).toBe("1h 30m");
  });
});

describe("formatPrice", () => {
  it("shows Free for zero", () => expect(formatPrice(0)).toBe("Free"));
  it("drops cents for whole amounts", () => expect(formatPrice(7900)).toBe("$79"));
  it("keeps cents otherwise", () => expect(formatPrice(2950)).toBe("$29.50"));
});

describe("slugify / initials / clamp", () => {
  it("slugifies", () => expect(slugify("  Émotional Alchemy! 101 ")).toBe("emotional-alchemy-101"));
  it("gets initials", () => {
    expect(initials("Ada Lovelace")).toBe("AL");
    expect(initials("cher")).toBe("C");
    expect(initials(null)).toBe("?");
  });
  it("clamps", () => {
    expect(clamp(5, 0, 3)).toBe(3);
    expect(clamp(-1, 0, 3)).toBe(0);
  });
});

describe("safeRedirect", () => {
  it("allows relative paths", () => expect(safeRedirect("/learn/x")).toBe("/learn/x"));
  it("blocks protocol-relative and absolute URLs", () => {
    expect(safeRedirect("//evil.com")).toBe("/dashboard");
    expect(safeRedirect("https://evil.com")).toBe("/dashboard");
    expect(safeRedirect("/\\evil.com")).toBe("/dashboard");
    expect(safeRedirect(null, "/")).toBe("/");
  });
});
