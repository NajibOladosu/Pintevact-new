import { expect, type Page } from "@playwright/test";
import Stripe from "stripe";
import { createUser, TEST_PASSWORD, uniqueEmail } from "../support/supabase";
import { linkIn, waitForEmail } from "../support/mailpit";
import { local } from "../support/local-services";

export { createUser, uniqueEmail, TEST_PASSWORD };

/** The visible sign-in form (the sign-up form stays mounted under the art on desktop). */
export const signInForm = (page: Page) => page.getByRole("form", { name: "Sign in with email and password" });
export const signUpForm = (page: Page) => page.getByRole("form", { name: "Create your account" });

/** Full sign-up through the UI, including clicking the confirmation link from the real inbox. */
export async function signUp(page: Page, opts: { email?: string; name?: string; next?: string } = {}) {
  const email = opts.email ?? uniqueEmail();
  await page.goto(opts.next ? `/signup?next=${encodeURIComponent(opts.next)}` : "/signup");
  const form = signUpForm(page);
  await form.getByLabel("Full name").fill(opts.name ?? "E2E Learner");
  await form.getByLabel("Email address").fill(email);
  await form.getByLabel("Password", { exact: true }).fill(TEST_PASSWORD);
  await form.getByRole("checkbox").check();
  await form.getByRole("button", { name: "Create my free account" }).click();
  await expect(page).toHaveURL(/\/verify-email/);
  const mail = await waitForEmail(email, /confirm/i);
  await page.goto(linkIn(mail, /verify|confirm/));
  await page.waitForURL((url) => !url.pathname.startsWith("/verify") && !url.pathname.startsWith("/auth"));
  return email;
}

/** Creates a confirmed account directly, then signs in through the UI. */
export async function signInAsNewUser(page: Page, opts: { name?: string; role?: "student" | "admin"; next?: string } = {}) {
  const user = await createUser({ name: opts.name, role: opts.role });
  await signIn(page, user.email, opts.next);
  return user;
}

export async function signIn(page: Page, email: string, next?: string) {
  await page.goto(next ? `/signin?next=${encodeURIComponent(next)}` : "/signin");
  const form = signInForm(page);
  await form.getByLabel("Email address").fill(email);
  await form.getByLabel("Password", { exact: true }).fill(TEST_PASSWORD);
  await form.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/signin"));
}

/** Sends a signed Stripe event to the app, as Stripe does after a checkout. */
export async function deliverStripeEvent(page: Page, type: string, object: object) {
  const payload = JSON.stringify({ id: `evt_e2e_${Date.now()}_${Math.random().toString(36).slice(2)}`, object: "event", type, created: Math.floor(Date.now() / 1000), data: { object } });
  const signature = new Stripe(local.stripeSecretKey).webhooks.generateTestHeaderString({ payload, secret: local.stripeWebhookSecret });
  const res = await page.request.post("/api/stripe/webhook", { data: payload, headers: { "stripe-signature": signature, "content-type": "application/json" } });
  expect(res.ok()).toBe(true);
  return res.json();
}

export async function openMobileMenuIfNeeded(page: Page) {
  const toggle = page.getByRole("button", { name: "Open menu" });
  if (await toggle.isVisible()) await toggle.click();
}

export async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}
