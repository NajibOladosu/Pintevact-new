import { expect, test } from "@playwright/test";
import { createUser, signInAsNewUser } from "./helpers";
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

  test("admins get the overview with integrations and recent activity", async ({ page }) => {
    await signInAsNewUser(page, { role: "admin" });
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Admin", level: 1 })).toBeVisible();
    await expect(page.getByText("Integrations")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Recent admin activity" })).toBeVisible();
  });
});

test.describe("admin course studio", () => {
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");

  test("create a course, upload its cover and a video, add checkpoints, reorder, duplicate, preview and delete", async ({ page }) => {
    await signInAsNewUser(page, { role: "admin" });
    const title = `Studio ${Date.now()}`;
    await page.goto("/admin/courses");
    await page.getByLabel("New course").fill(title);
    await page.getByRole("button", { name: "Create draft" }).click();
    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
    const courseUrl = page.url();

    await page.getByLabel("Subtitle").fill("Built end to end in the admin.");
    await page.getByRole("button", { name: "Save course" }).click();
    await expect(page.getByText("Course saved.")).toBeVisible();

    await page.locator("#cover-file").setInputFiles({ name: "cover.png", mimeType: "image/png", buffer: png });
    await expect(page.getByText("Cover updated.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Replace cover" })).toBeVisible();

    // First lesson: the editor opens straight away.
    await page.getByLabel("New lesson title").fill("Opening lesson");
    await page.getByRole("button", { name: "Add lesson" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Opening lesson" })).toBeVisible();

    // Upload a video to Bunny from the picker; it's attached when the upload finishes.
    await page.getByRole("button", { name: "Choose or upload" }).click();
    const picker = page.getByRole("dialog", { name: "Choose the lesson video" });
    await expect(picker.getByRole("button", { name: "Use Fixture 7 min" })).toBeVisible();
    await picker.locator("input[type=file]").setInputFiles({ name: "opening.mp4", mimeType: "video/mp4", buffer: Buffer.alloc(300 * 1024, 1) });
    await expect(page.getByText("Video attached.")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("opening", { exact: true })).toBeVisible();

    // A quiz checkpoint at one minute.
    await page.getByLabel("New checkpoint").selectOption("quiz");
    await page.getByRole("button", { name: "Add checkpoint" }).click();
    await page.getByLabel("At", { exact: true }).fill("1:00");
    await page.getByLabel("Question or prompt").fill("What does naming a feeling do?");
    await page.getByLabel("Answer 1", { exact: true }).fill("Calms the amygdala");
    await page.getByLabel("Answer 2", { exact: true }).fill("Nothing at all");
    await page.getByRole("form", { name: "New checkpoint" }).getByRole("button", { name: "Add checkpoint" }).click();
    await expect(page.getByText("Checkpoint added.")).toBeVisible();
    await expect(page.getByRole("button", { name: /Checkpoint at 1:00: What does naming a feeling do\?/ })).toBeVisible();

    // Second lesson, then move it above the first with the keyboard.
    await page.goto(courseUrl);
    await page.getByLabel("New lesson title").fill("Warm-up");
    await page.getByRole("button", { name: "Add lesson" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Warm-up" })).toBeVisible();
    await page.goto(courseUrl);
    const curriculum = page.getByRole("list", { name: "Curriculum" });
    await expect(curriculum.getByRole("link", { name: "Warm-up" })).toBeVisible();
    await page.getByRole("button", { name: "Reorder Warm-up" }).focus();
    await page.keyboard.press("Space");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("Space");
    await expect(curriculum.getByRole("link").first()).toHaveText("Warm-up");
    await page.reload();
    await expect(curriculum.getByRole("link").first()).toHaveText("Warm-up");

    await page.getByRole("button", { name: "Duplicate Opening lesson" }).click();
    await expect(page.getByText("Lesson duplicated.")).toBeVisible();
    await expect(curriculum.getByRole("link", { name: "Opening lesson (copy)" })).toBeVisible();

    // Drafts can be previewed by admins only.
    const slug = new URL(courseUrl).pathname.split("/").pop()!;
    await page.goto(`/courses/${slug}`);
    await expect(page.getByText("Draft preview.")).toBeVisible();
    await expect(page.getByText("Built end to end in the admin.")).toBeVisible();

    await page.goto(courseUrl);
    await page.getByRole("button", { name: "Delete", exact: true }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Delete course" }).click();
    await expect(page).toHaveURL(/\/admin\/courses$/);
    await expect(page.getByRole("link", { name: title })).toHaveCount(0);
  });

  test("the video library lists Bunny videos and where they're used", async ({ page }) => {
    await signInAsNewUser(page, { role: "admin" });
    await page.goto("/admin/videos");
    await expect(page.getByRole("heading", { level: 1, name: "Video library" })).toBeVisible();
    const card = page.getByRole("article", { name: "Fixture 7 min" });
    await expect(card).toBeVisible();
    await card.getByRole("button", { name: "Rename" }).click();
    await card.getByLabel("Video name").fill("Fixture 7 min");
    await card.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Video renamed.")).toBeVisible();
  });

  test("admins manage a learner: grant a course, suspend and restore", async ({ page }) => {
    const learner = await createUser({ name: "Managed Learner" });
    await signInAsNewUser(page, { role: "admin" });
    await page.goto(`/admin/users?q=${encodeURIComponent(learner.email)}`);
    await page.getByRole("link", { name: /Managed Learner/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Managed Learner" })).toBeVisible();

    await page.getByLabel("Course to grant").selectOption({ label: "Emotional Alchemy" });
    await page.getByRole("button", { name: "Grant access" }).click();
    await expect(page.getByText("Course access granted.")).toBeVisible();
    await expect(page.getByText("Granted by admin")).toBeVisible();

    await page.getByRole("button", { name: "Suspend" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Suspend" }).click();
    await expect(page.getByText("Suspended", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Lift suspension" }).click();
    await expect(page.getByText("Suspension lifted.")).toBeVisible();
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
