import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { learnerUnsubscribeToken, newsletterUnsubscribeToken, parseUnsubscribeToken, unsubscribeLinks } from "@/lib/unsubscribe";

const userId = "5b0c1f9e-6a8d-4c1e-9d2a-3f4b5c6d7e8f";
const subscriber = "0f9e8d7c-6b5a-4d3c-8b2a-1f0e9d8c7b6a";

describe("unsubscribe tokens", () => {
  beforeEach(() => {
    vi.stubEnv("EMAIL_UNSUBSCRIBE_SECRET", "unit-test-secret");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://pintevact.test");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("round-trips a signed learner token", () => {
    expect(parseUnsubscribeToken(learnerUnsubscribeToken(userId))).toEqual({ kind: "learner", userId });
  });

  it("rejects a learner token signed for someone else or with another secret", () => {
    const [, , sig] = learnerUnsubscribeToken(userId).split(".");
    expect(parseUnsubscribeToken(`u.${subscriber}.${sig}`)).toBeNull();
    const token = learnerUnsubscribeToken(userId);
    vi.stubEnv("EMAIL_UNSUBSCRIBE_SECRET", "another-secret");
    expect(parseUnsubscribeToken(token)).toBeNull();
  });

  it("parses newsletter tokens and rejects junk", () => {
    expect(parseUnsubscribeToken(newsletterUnsubscribeToken(subscriber))).toEqual({ kind: "newsletter", token: subscriber });
    for (const junk of [null, "", "n.not-a-uuid", `n.${subscriber}.extra`, `u.${userId}`, `x.${userId}.abc`]) expect(parseUnsubscribeToken(junk)).toBeNull();
  });

  it("builds a confirmation link and RFC 8058 one-click headers", () => {
    const links = unsubscribeLinks(newsletterUnsubscribeToken(subscriber));
    expect(links.url).toBe(`https://pintevact.test/unsubscribe?t=n.${subscriber}`);
    expect(links.headers["List-Unsubscribe"]).toBe(`<https://pintevact.test/api/unsubscribe?t=n.${subscriber}>`);
    expect(links.headers["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
  });
});
