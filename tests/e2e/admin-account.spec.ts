import { expect, test } from "@playwright/test";
import { signIn, signUp, uniqueEmail } from "./helpers";

test.describe("account & admin", () => {
  test("learners can update their profile and delete their account", async ({ page }) => {
    await signUp(page, { name: "Old Name" });
    await page.goto("/account");
    await page.getByLabel("Name").fill("New Name");
    await page.getByLabel("Headline").fill("Recovering overthinker");
    await page.getByRole("button", { name: "Save profile" }).click();
    await expect(page.getByText("Profile saved.")).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("New Name");

    await page.getByRole("button", { name: "Delete my account" }).click();
    await expect(page.getByText('Type "DELETE" to confirm.')).toBeVisible();
    await page.getByLabel(/to confirm/).fill("DELETE");
    await page.getByRole("button", { name: "Delete my account" }).click();
    await expect(page).toHaveURL(/\/\?deleted=1/);
  });

  test("students cannot open admin", async ({ page }) => {
    await signUp(page);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("admins can edit a course", async ({ page }) => {
    await signIn(page, `admin@${uniqueEmail("x").split("@")[0]}.test`);
    await expect(page).toHaveURL(/\/dashboard/);
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Admin", level: 1 })).toBeVisible();
    await expect(page.getByText("Integrations")).toBeVisible();
    await page.goto("/admin/courses/habit-architecture");
    await page.getByLabel("Subtitle").fill("Design your environment so good habits run themselves.");
    await page.getByRole("button", { name: "Save course" }).click();
    await expect(page.getByText("Course saved.")).toBeVisible();
    await page.goto("/courses/habit-architecture");
    await expect(page.getByText("Design your environment so good habits run themselves.")).toBeVisible();
    await page.goto("/admin/users");
    await expect(page.getByRole("table")).toBeVisible();
  });
});
