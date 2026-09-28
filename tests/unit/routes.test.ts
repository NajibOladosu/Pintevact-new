import { describe, expect, it } from "vitest";
import { isProtectedPath, routeDecision } from "@/lib/auth/routes";

describe("route guards", () => {
  it("detects protected paths without false positives", () => {
    expect(isProtectedPath("/dashboard")).toBe(true);
    expect(isProtectedPath("/learn/x/y")).toBe(true);
    expect(isProtectedPath("/learning-styles")).toBe(false);
    expect(isProtectedPath("/courses")).toBe(false);
  });
  it("redirects guests to login with next param", () => {
    expect(routeDecision("/learn/a", "?t=1", false)).toEqual({ redirect: "/signin?next=%2Flearn%2Fa%3Ft%3D1" });
  });
  it("redirects signed-in users away from auth pages", () => {
    expect(routeDecision("/signin", "", true)).toEqual({ redirect: "/dashboard" });
    expect(routeDecision("/reset-password", "", true)).toBeNull();
  });
  it("sends signed-in users from the home page to the dashboard", () => {
    expect(routeDecision("/", "", true)).toEqual({ redirect: "/dashboard" });
  });
  it("lets everyone see public pages", () => {
    expect(routeDecision("/", "", false)).toBeNull();
    expect(routeDecision("/pricing", "", true)).toBeNull();
  });
});
