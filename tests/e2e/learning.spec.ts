import { expect, test } from "@playwright/test";
import { signInAsNewUser } from "./helpers";

test.describe("interactive learning", () => {
  test("a full lesson: the stream pauses at checkpoints, answers earn XP, completion is recorded", async ({ page }) => {
    test.setTimeout(300_000);
    await signInAsNewUser(page, { next: "/learn/meet-your-mind" });
    await expect(page.getByRole("heading", { name: "Meet Your Mind" })).toBeVisible();

    await page.goto("/learn/meet-your-mind/the-elephant-and-the-rider");
    const video = page.getByTestId("player").locator("video");
    await expect(video).toHaveAttribute("poster", /e2e-420\/thumbnail\.jpg/);

    const card = page.getByTestId("interaction-card");
    await page.getByRole("button", { name: "Play", exact: true }).first().click();
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime), { timeout: 20_000 }).toBeGreaterThan(0);
    // Watch at 6x so the seven-minute lesson plays in about a minute; every second still counts as watched.
    const speedUp = () => video.evaluate((v: HTMLVideoElement) => {
      v.defaultPlaybackRate = 6;
      v.playbackRate = 6;
    });
    await speedUp();

    // 0:45 poll: the real stream pauses here.
    await expect(card).toContainText("which one feels more in charge", { timeout: 30_000 });
    expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
    await card.getByRole("button", { name: /They take turns/ }).click();
    await expect(card.getByText(/learners have answered/)).toBeVisible();
    await expect(card.getByText("+10 XP")).toBeVisible();
    await card.getByRole("button", { name: /Continue/ }).click();

    // Earning XP refreshes the page data; the stream must keep playing at the same speed.
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.playbackRate)).toBe(6);

    // 3:00 required quiz
    await expect(card).toContainText("A bat and a ball cost", { timeout: 60_000 });
    await card.getByRole("button", { name: /^B/ }).click();
    await expect(card.getByText("Spot on.")).toBeVisible();
    await card.getByRole("button", { name: /Continue/ }).click();

    // 5:00 reflection
    await expect(card).toContainText("Describe a recent moment", { timeout: 60_000 });
    await card.getByRole("textbox").fill("I bought shoes I didn't need after a stressful call.");
    await card.getByRole("button", { name: "Save reflection" }).click();
    await card.getByRole("button", { name: /Continue/ }).click();

    // The stream ends and the lesson completes.
    const done = page.getByRole("dialog", { name: "Lesson complete" });
    await expect(done).toBeVisible({ timeout: 90_000 });
    await expect(done).toContainText("+50 XP");
    await expect(done.getByRole("link", { name: /Next lesson/ })).toHaveAttribute("href", "/learn/meet-your-mind/your-brain-is-a-prediction-machine");

    await page.goto("/reflections");
    await expect(page.getByText("I bought shoes I didn't need")).toBeVisible();
    await page.goto("/dashboard");
    await expect(page.getByText("1 lesson finished")).toBeVisible();
    await page.goto("/achievements");
    await expect(page.getByText("First Light")).toBeVisible();
  });

  test("timestamped notes can be added from the player and seen in the vault", async ({ page }) => {
    await signInAsNewUser(page);
    await page.goto("/learn/meet-your-mind/your-brain-is-a-prediction-machine?t=30");
    await page.getByRole("tab", { name: /Notes/ }).click();
    await page.getByLabel(/Note at/).fill("Predictions shape perception");
    await page.getByRole("button", { name: "Save note" }).click();
    // The draft clears only once the server has stored the note.
    await expect(page.getByLabel(/Note at/)).toHaveValue("");
    await expect(page.getByRole("status").filter({ hasText: "Note saved" })).toBeVisible();
    await page.goto("/reflections");
    await page.getByRole("tab", { name: /notes/i }).click();
    await expect(page.getByText("Predictions shape perception")).toBeVisible();
    await expect(page.getByRole("link", { name: "0:30" })).toBeVisible();
  });

  test("checkpoints can be opened from the moments list", async ({ page }) => {
    await signInAsNewUser(page);
    await page.goto("/learn/meet-your-mind/your-brain-is-a-prediction-machine");
    await page.locator("aside").getByRole("button", { name: /Mind fact/ }).click();
    const card = page.getByTestId("interaction-card");
    await expect(card).toContainText("Your brain uses about 20%");
    await card.getByRole("button", { name: "Got it" }).click();
    await expect(card.getByText("+5 XP")).toBeVisible();
  });

  test("paid lessons are locked without access but previews are open", async ({ page }) => {
    await signInAsNewUser(page);
    await page.goto("/learn/emotional-alchemy");
    await expect(page.getByText("You're previewing this course.")).toBeVisible();
    await page.goto("/learn/emotional-alchemy/the-body-keeps-the-score-card");
    await expect(page).toHaveURL(/\/courses\/emotional-alchemy\?locked=1/);
    await page.goto("/learn/emotional-alchemy/emotional-granularity");
    await expect(page.getByTestId("player")).toBeVisible();
  });
});
