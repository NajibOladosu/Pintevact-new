import { describe, expect, it } from "vitest";
import { contactSchema, fieldErrors, loginSchema, resetSchema, signupSchema } from "@/lib/validation";
import { passwordStrength } from "@/lib/password-strength";

describe("auth validation", () => {
  it("normalises emails", () => {
    expect(loginSchema.parse({ email: "  Ada@Example.COM ", password: "x" }).email).toBe("ada@example.com");
  });
  it("enforces strong-enough passwords on signup", () => {
    const res = signupSchema.safeParse({ fullName: "Ada", email: "a@b.co", password: "short", terms: "on" });
    expect(res.success).toBe(false);
    if (!res.success) expect(fieldErrors(res.error).password).toMatch(/8 characters/);
    expect(signupSchema.safeParse({ fullName: "Ada", email: "a@b.co", password: "letters123", terms: "on" }).success).toBe(true);
  });
  it("requires accepting terms", () => {
    const res = signupSchema.safeParse({ fullName: "Ada", email: "a@b.co", password: "letters123" });
    expect(res.success).toBe(false);
    if (!res.success) expect(fieldErrors(res.error).terms).toBeTruthy();
  });
  it("checks password confirmation", () => {
    const res = resetSchema.safeParse({ password: "letters123", confirm: "letters124" });
    expect(res.success).toBe(false);
    if (!res.success) expect(fieldErrors(res.error).confirm).toBe("Passwords don't match");
  });
});

describe("contact validation", () => {
  it("rejects the honeypot", () => {
    expect(contactSchema.safeParse({ name: "Bot", email: "b@b.co", message: "hello there friend", company: "spam inc" }).success).toBe(false);
  });
  it("defaults topic", () => {
    expect(contactSchema.parse({ name: "Ada", email: "a@b.co", message: "hello there friend" }).topic).toBe("general");
  });
});

describe("passwordStrength", () => {
  it("scores passwords", () => {
    expect(passwordStrength("").score).toBe(0);
    expect(passwordStrength("abc").score).toBe(1);
    expect(passwordStrength("abcdefgh").label).toBe("Weak");
    expect(passwordStrength("Abcdefgh12!@xyz").score).toBe(4);
  });
});
