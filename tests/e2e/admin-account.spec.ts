import { expect, test } from "@playwright/test";
import { signInAsNewUser } from "./helpers";
import { admin, uniqueEmail } from "../support/supabase";
import { linkIn, waitForEmail } from "../support/mailpit";

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

test.describe("admin emails", () => {
  test("admins write and send the Thursday letter, and subscribers can unsubscribe", async ({ page }) => {
    const reader = uniqueEmail("reader");
    await admin().from("newsletter_subscribers").insert({ email: reader });
    const me = await signInAsNewUser(page, { role: "admin" });
    await page.goto("/admin/emails");
    await expect(page.getByRole("heading", { name: "Write the Thursday letter" })).toBeVisible();

    const subject = `Letter ${Date.now()}`;
    const letter = page.locator("form").filter({ has: page.locator("#letter-subject") });
    await letter.getByLabel("Subject line").fill(subject);
    await letter.getByLabel("Headline").fill("The space between");
    await letter.getByLabel("The idea").fill("First thought.\n\nSecond thought.");
    await letter.getByLabel("This week's experiment").fill("Pause for one breath before you answer.");

    await letter.getByRole("button", { name: "Send test to me" }).click();
    await expect(letter.getByText(`Test sent to ${me.email}.`)).toBeVisible();
    await waitForEmail(me.email, new RegExp(`\\[Test\\] ${subject}`));

    page.once("dialog", (d) => d.accept());
    await letter.getByRole("button", { name: /^Send to \d+ subscribers?$/ }).click();
    await expect(letter.getByText(/^Issue \d+ sent to \d+ subscribers?/)).toBeVisible();
    await expect(page.getByText(subject)).toBeVisible();

    const mail = await waitForEmail(reader, new RegExp(subject));
    await page.goto(linkIn(mail, /\/unsubscribe\?t=n\./).replace(/^https?:\/\/[^/]+/, ""));
    await page.getByRole("button", { name: /unsubscribe/i }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("You're off the Thursday list.");
    const { data } = await admin().from("newsletter_subscribers").select("unsubscribed_at").eq("email", reader).single();
    expect(data?.unsubscribed_at).not.toBeNull();
  });
});
