import { expect, test } from "@playwright/test";
import { signIn, signUp, uniqueEmail } from "./helpers";

test.describe("authentication", () => {
  test("protected pages redirect to login and back", async ({ page }) => {
    await page.goto("/reflections");
    await expect(page).toHaveURL(/\/login\?next=%2Freflections/);
    await signIn(page, uniqueEmail(), "/reflections");
    await expect(page).toHaveURL(/\/reflections$/);
    await expect(page.getByRole("heading", { name: /Reflection/ })).toBeVisible();
  });

  test("signup validates input", async ({ page }) => {
    await page.goto("/signup");
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel("Password", { exact: true }).fill("short");
    await expect(page.getByText("Too short")).toBeVisible();
    await page.getByRole("button", { name: "Create my free account" }).click();
    await expect(page.getByText("Tell us what to call you")).toBeVisible();
    await expect(page.getByText("Enter a valid email address")).toBeVisible();
    await expect(page.getByText("Use at least 8 characters")).toBeVisible();
    await expect(page.getByText("Please accept the terms to continue")).toBeVisible();
  });

  test("signup lands on the dashboard with a welcome", async ({ page }) => {
    await signUp(page, { name: "Maya Angelou" });
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Maya");
    await expect(page.getByText("Welcome to Pintevact", { exact: true })).toBeVisible();
    await expect(page.getByText("Start with Meet Your Mind.")).toBeVisible();
  });

  test("signed-in users skip auth pages and can sign out", async ({ page }) => {
    await signUp(page);
    await page.goto("/login");
    await expect(page).toHaveURL(/\/dashboard/);
    await page.getByRole("button", { name: "Open user menu" }).click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();
    await expect(page).toHaveURL("/");
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("forgot password never reveals whether an account exists", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByLabel("Email").fill("someone@example.com");
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.getByText(/If an account exists for someone@example.com/)).toBeVisible();
  });

  test("magic link tab", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("tab", { name: "Email me a link" }).click();
    await page.getByRole("button", { name: "Send my sign-in link" }).click();
    await expect(page.getByText("Enter a valid email address")).toBeVisible();
  });

  test("open redirects are blocked", async ({ page }) => {
    await signIn(page, uniqueEmail(), "//evil.example.com");
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
