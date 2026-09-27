import { expect, test } from "@playwright/test";
import { signInAsNewUser } from "./helpers";
import { admin } from "../support/supabase";

test.describe("account & admin", () => {
  test("learners can update their profile and delete their account", async ({ page }) => {
    const user = await signInAsNewUser(page, { name: "Old Name" });
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
    const { data } = await admin().auth.admin.getUserById(user.id);
    expect(data.user).toBeNull();
  });

  test("students cannot open admin", async ({ page }) => {
    await signInAsNewUser(page);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("admins can edit a course", async ({ page }) => {
    await signInAsNewUser(page, { role: "admin" });
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Admin", level: 1 })).toBeVisible();
    await expect(page.getByText("Integrations")).toBeVisible();

    await page.goto("/admin/courses/habit-architecture");
    const subtitle = page.getByLabel("Subtitle");
    const original = await subtitle.inputValue();
    const edited = `Design your environment so good habits run themselves. (${Date.now()})`;
    await subtitle.fill(edited);
    await page.getByRole("button", { name: "Save course" }).click();
    await expect(page.getByText("Course saved.")).toBeVisible();
    await page.goto("/courses/habit-architecture");
    await expect(page.getByText(edited)).toBeVisible();

    await page.goto("/admin/courses/habit-architecture");
    await page.getByLabel("Subtitle").fill(original);
    await page.getByRole("button", { name: "Save course" }).click();
    await expect(page.getByText("Course saved.")).toBeVisible();

    await page.goto("/admin/users");
    await expect(page.getByRole("table")).toBeVisible();
  });
});
