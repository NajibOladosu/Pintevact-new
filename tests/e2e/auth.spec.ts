import { expect, test } from "@playwright/test";
import { createUser, signIn, signInAsNewUser, signInForm, signUp, signUpForm } from "./helpers";
import { linkIn, waitForEmail } from "../support/mailpit";

test.describe("authentication", () => {
  test("sign in and sign up are one page: switching slides the art without navigating", async ({ page, isMobile }) => {
    await page.goto("/signin");
    await expect(signInForm(page)).toBeVisible();
    const marker = await page.evaluate(() => ((window as unknown as { __stay: number }).__stay = Math.random()));

    await page.getByRole("navigation", { name: "Account" }).getByRole("link", { name: "Sign up" }).click();
    await expect(page).toHaveURL(/\/signup$/);
    await expect(signUpForm(page)).toBeVisible();
    await expect(page).toHaveTitle(/Create your account/);
    // Same document: no reload happened.
    expect(await page.evaluate(() => (window as unknown as { __stay: number }).__stay)).toBe(marker);

    await page.goBack();
    await expect(page).toHaveURL(/\/signin$/);
    await expect(signInForm(page)).toBeVisible();
    if (!isMobile) await expect(page.getByRole("form", { name: "Create your account" })).toBeHidden();
  });

  test("the wordmark and account switch sit exactly where they are on the home page", async ({ page, isMobile }) => {
    test.skip(isMobile, "The home header shows a menu button on phones.");
    await page.goto("/");
    const home = { logo: await page.getByRole("link", { name: "Pintevact home" }).boundingBox(), pill: await page.getByRole("link", { name: "Sign in" }).first().boundingBox() };
    await page.goto("/signin");
    const auth = { logo: await page.getByRole("link", { name: "Pintevact home" }).boundingBox(), pill: await page.getByRole("navigation", { name: "Account" }).getByRole("link", { name: "Sign in" }).boundingBox() };
    for (const k of ["logo", "pill"] as const) {
      expect(Math.abs(auth[k]!.x - home[k]!.x)).toBeLessThanOrEqual(1);
      expect(Math.abs(auth[k]!.y - home[k]!.y)).toBeLessThanOrEqual(1);
    }
  });

  test("sign up validates input", async ({ page }) => {
    await page.goto("/signup");
    const form = signUpForm(page);
    await form.getByLabel("Email address").fill("not-an-email");
    await form.getByLabel("Password", { exact: true }).fill("short");
    await expect(form.getByText("Too short")).toBeVisible();
    await form.getByRole("button", { name: "Create my free account" }).click();
    await expect(form.getByText("Tell us what to call you")).toBeVisible();
    await expect(form.getByText("Enter a valid email address")).toBeVisible();
    await expect(form.getByText("Use at least 8 characters")).toBeVisible();
    await expect(form.getByText("Please accept the terms to continue")).toBeVisible();
  });

  test("sign up, confirm from the inbox, land on the dashboard", async ({ page }) => {
    await signUp(page, { name: "Maya Angelou" });
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Maya");
    await expect(page.getByText("Start with Meet Your Mind.")).toBeVisible();
  });

  test("protected pages redirect to sign in and back", async ({ page }) => {
    await page.goto("/reflections");
    await expect(page).toHaveURL(/\/signin\?next=%2Freflections/);
    const user = await createUser();
    await signIn(page, user.email, "/reflections");
    await expect(page).toHaveURL(/\/reflections$/);
  });

  test("wrong passwords are rejected", async ({ page }) => {
    const user = await createUser();
    await page.goto("/signin");
    const form = signInForm(page);
    await form.getByLabel("Email address").fill(user.email);
    await form.getByLabel("Password", { exact: true }).fill("not-the-password");
    await form.getByRole("button", { name: "Sign in" }).click();
    await expect(form.getByRole("alert")).toContainText("don't match");
  });

  test("signed-in users skip auth pages and can sign out", async ({ page }) => {
    await signInAsNewUser(page);
    await page.goto("/signin");
    await expect(page).toHaveURL(/\/dashboard/);
    await page.getByRole("button", { name: "Open user menu" }).click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();
    await expect(page).toHaveURL("/");
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/signin/);
  });

  test("password reset by email", async ({ page }) => {
    const user = await createUser();
    await page.goto("/forgot-password");
    await page.getByLabel("Email address").fill(user.email);
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.getByText(`If an account exists for ${user.email}`)).toBeVisible();
    const mail = await waitForEmail(user.email, /reset/i);
    await page.goto(linkIn(mail, /verify|confirm/));
    await expect(page).toHaveURL(/\/reset-password/);
    await page.getByLabel("New password", { exact: true }).fill("brand-new-pass-1");
    await page.getByLabel("Confirm new password").fill("brand-new-pass-1");
    await page.getByRole("button", { name: "Save new password" }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("magic link sign in", async ({ page }) => {
    const user = await createUser();
    await page.goto("/signin");
    await page.getByRole("tab", { name: "Email me a link" }).click();
    const form = page.getByRole("form", { name: "Email me a sign-in link" });
    await form.getByRole("button", { name: "Send my sign-in link" }).click();
    await expect(form.getByText("Enter a valid email address")).toBeVisible();
    await form.getByLabel("Email address").fill(user.email);
    await form.getByRole("button", { name: "Send my sign-in link" }).click();
    await expect(page.getByText(`We sent a sign-in link to ${user.email}`)).toBeVisible();
    const mail = await waitForEmail(user.email, /magic|sign/i);
    await page.goto(linkIn(mail, /verify|confirm/));
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("Continue with Google hands off to Google's consent screen", async ({ page }) => {
    // The app redirects to Supabase Auth, which redirects on to Google. Record where the browser is sent.
    // Keep only the first Google request: with the fake e2e client ID, Google then bounces to its own
    // error page, which carries client_id but no redirect_uri.
    let authorizeUrl: URL | null = null;
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (!authorizeUrl && url.hostname === "accounts.google.com") authorizeUrl = url;
    });
    await page.goto("/signup?next=%2Flearn");
    await page.getByRole("region", { name: "Sign up" }).getByRole("button", { name: "Sign up with Google" }).click();
    await expect.poll(() => authorizeUrl?.hostname).toBe("accounts.google.com");
    expect(authorizeUrl!.searchParams.get("client_id")).toBe("pintevact-e2e.apps.googleusercontent.com");
    expect(authorizeUrl!.searchParams.get("redirect_uri")).toContain("/auth/v1/callback");
  });

  test("old /login links still work and open redirects are blocked", async ({ page }) => {
    await page.goto("/login?next=%2Flearn");
    await expect(page).toHaveURL(/\/signin\?next=%2Flearn/);
    const user = await createUser();
    await signIn(page, user.email, "//evil.example.com");
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
