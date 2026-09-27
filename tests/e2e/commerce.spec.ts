import { expect, test } from "@playwright/test";
import { signUp } from "./helpers";

test.describe("payments (demo checkout)", () => {
  test("buying a course unlocks it and records the purchase", async ({ page }) => {
    await signUp(page);
    await page.goto("/courses/the-persuasion-lab");
    await page.getByRole("button", { name: /Buy for \$99/ }).click();
    await expect(page).toHaveURL(/\/learn\/the-persuasion-lab/);
    await expect(page.getByText("Unlocked!")).toBeVisible();
    await expect(page.getByText("You're previewing this course.")).toHaveCount(0);
    await page.goto("/account/billing");
    await expect(page.getByRole("cell", { name: "The Persuasion Lab" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "$99" })).toBeVisible();
  });

  test("All-Access membership unlocks every course", async ({ page }) => {
    await signUp(page);
    await page.goto("/pricing");
    await page.getByRole("radio", { name: /Monthly/ }).click();
    await page.getByRole("button", { name: "Unlock All-Access" }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText("All-Access activated")).toBeVisible();
    await page.goto("/learn/shadow-work");
    await expect(page.getByText("You're previewing this course.")).toHaveCount(0);
    await page.goto("/account/billing");
    await expect(page.getByText("All-Access, Monthly")).toBeVisible();
    await page.goto("/pricing");
    await expect(page.getByRole("link", { name: "Manage membership" })).toBeVisible();
  });

  test("guests are sent to sign up before buying", async ({ page }) => {
    await page.goto("/courses/deep-focus-mind");
    await page.getByRole("link", { name: "Get Deep Focus Mind" }).click();
    await expect(page).toHaveURL(/\/signup\?next=%2Fcourses%2Fdeep-focus-mind/);
  });
});
