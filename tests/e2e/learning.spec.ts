import { expect, test } from "@playwright/test";
import { signUp } from "./helpers";

test.describe("interactive learning", () => {
  test("a full lesson: checkpoints pause the video, answers earn XP, completion lights a star", async ({ page }) => {
    test.setTimeout(240_000);
    await signUp(page, { next: "/learn/meet-your-mind" });
    await expect(page.getByRole("heading", { name: "Meet Your Mind" })).toBeVisible();

    await page.clock.install();
    await page.goto("/learn/meet-your-mind/the-elephant-and-the-rider");
    await expect(page.getByTestId("simulated-stage")).toBeVisible();

    const card = page.getByTestId("interaction-card");
    await page.getByRole("button", { name: "Play", exact: true }).first().click();

    // 0:45 poll
    await page.clock.runFor(50_000);
    await expect(card).toContainText("which one feels more in charge");
    await card.getByRole("button", { name: /They take turns/ }).click();
    await expect(card.getByText(/learners have answered/)).toBeVisible();
    await expect(card.getByText("+10 XP")).toBeVisible();
    await card.getByRole("button", { name: /Continue/ }).click();

    // 3:00 required quiz
    await page.clock.runFor(140_000);
    await expect(card).toContainText("A bat and a ball cost");
    await card.getByRole("button", { name: /^B/ }).click();
    await expect(card.getByText("Spot on.")).toBeVisible();
    await card.getByRole("button", { name: /Continue/ }).click();

    // 5:00 reflection
    await page.clock.runFor(130_000);
    await expect(card).toContainText("Describe a recent moment");
    await card.getByRole("textbox").fill("I bought shoes I didn't need after a stressful call.");
    await card.getByRole("button", { name: "Save reflection" }).click();
    await card.getByRole("button", { name: /Continue/ }).click();

    // Finish the video
    await page.clock.runFor(130_000);
    const done = page.getByRole("dialog", { name: "Lesson complete" });
    await expect(done).toBeVisible();
    await expect(done).toContainText("+50 XP");
    await expect(done.getByRole("link", { name: /Next lesson/ })).toHaveAttribute("href", "/learn/meet-your-mind/your-brain-is-a-prediction-machine");

    // Reflection lands in the vault, progress on the dashboard
    await page.goto("/reflections");
    await expect(page.getByText("I bought shoes I didn't need")).toBeVisible();
    await page.goto("/dashboard");
    await expect(page.getByText("1 lesson finished")).toBeVisible();
    await page.goto("/achievements");
    await expect(page.getByText("First Light")).toBeVisible();
  });

  test("timestamped notes can be added from the player and seen in the vault", async ({ page }) => {
    await signUp(page);
    await page.goto("/learn/meet-your-mind/your-brain-is-a-prediction-machine?t=30");
    await page.getByRole("tab", { name: /Notes/ }).click();
    await page.getByLabel(/Note at/).fill("Predictions shape perception");
    await page.getByRole("button", { name: "Save note" }).click();
    await expect(page.getByRole("tabpanel").getByText("Predictions shape perception").or(page.locator("aside").getByText("Predictions shape perception"))).toBeVisible();
    await page.goto("/reflections");
    await page.getByRole("tab", { name: /notes/i }).click();
    await expect(page.getByText("Predictions shape perception")).toBeVisible();
    await expect(page.getByRole("link", { name: "0:30" })).toBeVisible();
  });

  test("checkpoints can be opened from the moments list", async ({ page }) => {
    await signUp(page);
    await page.goto("/learn/meet-your-mind/your-brain-is-a-prediction-machine");
    await page.locator("aside").getByRole("button", { name: /Mind fact/ }).click();
    const card = page.getByTestId("interaction-card");
    await expect(card).toContainText("Your brain uses about 20%");
    await card.getByRole("button", { name: "Got it" }).click();
    await expect(card.getByText("+5 XP")).toBeVisible();
  });

  test("paid lessons are locked without access but previews are open", async ({ page }) => {
    await signUp(page);
    await page.goto("/learn/emotional-alchemy");
    await expect(page.getByText("You're previewing this course.")).toBeVisible();
    await page.goto("/learn/emotional-alchemy/the-body-keeps-the-score-card");
    await expect(page).toHaveURL(/\/courses\/emotional-alchemy\?locked=1/);
    await page.goto("/learn/emotional-alchemy/emotional-granularity");
    await expect(page.getByTestId("player")).toBeVisible();
  });
});
