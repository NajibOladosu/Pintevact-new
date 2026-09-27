import { expect, type Page } from "@playwright/test";

let counter = 0;
export function uniqueEmail(prefix = "learner") {
  return `${prefix}.${Date.now()}.${process.pid}.${counter++}@e2e.test`;
}

/** Signs up a fresh learner (demo mode accepts any valid credentials). */
export async function signUp(page: Page, opts: { email?: string; name?: string; next?: string } = {}) {
  const email = opts.email ?? uniqueEmail();
  await page.goto(opts.next ? `/signup?next=${encodeURIComponent(opts.next)}` : "/signup");
  await page.getByLabel("What should we call you?").fill(opts.name ?? "E2E Learner");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("mindful123");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Create my free account" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/signup"));
  return email;
}

export async function signIn(page: Page, email: string, next?: string) {
  await page.goto(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("anything1");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

export async function openMobileMenuIfNeeded(page: Page) {
  const toggle = page.getByRole("button", { name: "Open menu" });
  if (await toggle.isVisible()) await toggle.click();
}

export async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}
