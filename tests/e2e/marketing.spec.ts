import { expect, test } from "@playwright/test";
import { expectNoHorizontalScroll, openMobileMenuIfNeeded } from "./helpers";

test.describe("public site", () => {
  test("home page tells the story and links to courses", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Pintevact/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Know your own mind");
    await expect(page.getByText("Every lesson stops to ask about you.")).toBeVisible();
    // The catalogue is a route of two stops: the free course first, then the paid one.
    await expect(page.getByRole("heading", { name: "Two courses. One route inward." })).toBeVisible();
    await expect(page.getByRole("list", { name: "First lessons in Meet Your Mind" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Start free.*Meet Your Mind/ })).toHaveAttribute("href", "/courses/meet-your-mind");
    await expect(page.getByRole("link", { name: /View course.*Emotional Alchemy/ })).toHaveAttribute("href", "/courses/emotional-alchemy");
    await expectNoHorizontalScroll(page);
    await openMobileMenuIfNeeded(page);
    await page.getByRole("link", { name: "Courses" }).first().click();
    await expect(page).toHaveURL(/\/courses$/);
  });

  test("hero deck: answering flips the card and moves to the next one", async ({ page }) => {
    await page.goto("/");
    const deck = page.getByTestId("hero-deck");
    await deck.getByRole("button", { name: "5 cents", exact: true }).click();
    await expect(deck.getByText("Right. Your slow system stepped in.")).toBeVisible();
    await deck.getByRole("button", { name: /Next card/ }).click();
    await expect(deck.getByText("Right now, which one feels more in charge of your life?")).toBeVisible();
    await deck.getByRole("button", { name: "They take turns" }).click();
    await deck.getByRole("button", { name: /Next card/ }).click();
    await deck.getByRole("button", { name: "See what happens to it" }).click();
    await expect(deck.getByRole("link", { name: "Start free" })).toBeVisible();
  });

  test("theme toggle switches between light and dark", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/pricing");
    await expect(page.locator("html")).not.toHaveClass(/dark/);
    await page.getByRole("button", { name: "Show settings" }).click();
    await page.getByRole("button", { name: "Switch to dark theme" }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("catalog filters by category and search", async ({ page }) => {
    await page.goto("/courses");
    await expect(page.getByText("2 courses")).toBeVisible();
    await page.getByRole("button", { name: "Emotions" }).click();
    await expect(page.getByText("1 course", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Emotional Alchemy" })).toBeVisible();
    await page.getByRole("button", { name: "All" }).click();
    await page.getByPlaceholder(/Search/).fill("zzzz");
    await expect(page.getByText("No courses match those filters.")).toBeVisible();
    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(page.getByText("2 courses")).toBeVisible();
  });

  test("course detail shows curriculum and a guest call to action", async ({ page }) => {
    await page.goto("/courses/emotional-alchemy");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Emotional Alchemy");
    await expect(page.getByText("$79").first()).toBeVisible();
    await expect(page.getByText("Name It to Tame It")).toBeVisible();
    await expect(page.getByRole("link", { name: "Get Emotional Alchemy" })).toHaveAttribute("href", /\/signup\?next=/);
  });

  test("unknown course returns 404", async ({ page }) => {
    const res = await page.goto("/courses/not-a-course");
    expect(res?.status()).toBe(404);
    await expect(page.getByText("This page doesn't exist.")).toBeVisible();
  });

  test("pricing toggles billing interval", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByText("billed $240 yearly")).toBeVisible();
    await page.getByRole("radio", { name: /Monthly/ }).click();
    await expect(page.getByText("$29").first()).toBeVisible();
    await page.getByText("Is this therapy?").click();
    await expect(page.getByText(/isn't a substitute for professional mental-health care/)).toBeVisible();
  });

  test("mind quiz reveals an archetype and recommendation", async ({ page }) => {
    await page.goto("/discover");
    for (let i = 0; i < 6; i++) {
      await page.getByTestId("quiz-answer").nth(1).click();
    }
    await expect(page.getByRole("heading", { name: "The Feeler" })).toBeVisible();
    await expect(page.getByText("Recommended course")).toBeVisible();
    await expect(page.getByRole("link", { name: "See the course" })).toHaveAttribute("href", "/courses/emotional-alchemy");
  });

  test("archived journal redirects home", async ({ page }) => {
    await page.goto("/journal/some-post");
    await expect(page).toHaveURL(/\/$/);
  });

  test("contact form validates and submits", async ({ page }) => {
    await page.goto("/contact?topic=teams");
    await expect(page.getByLabel("What's it about?")).toHaveValue("teams");
    await page.getByRole("button", { name: /Send message/ }).click();
    await expect(page.getByText("Please enter your name")).toBeVisible();
    await page.getByLabel("Your name").fill("Ada");
    await page.getByLabel("Email", { exact: true }).fill("ada@example.com");
    await page.getByLabel("Message").fill("We would love Pintevact for our whole team.");
    await page.getByRole("button", { name: /Send message/ }).click();
    await expect(page.getByText("Message received.")).toBeVisible();
  });

  test("newsletter signup", async ({ page }) => {
    await page.goto("/about");
    await page.getByLabel("Email address").fill("reader@example.com");
    await page.getByRole("button", { name: /Subscribe/ }).click();
    await expect(page.getByText("You're in.")).toBeVisible();
  });

  test("legal pages and SEO files", async ({ page, request }) => {
    await page.goto("/terms");
    await expect(page.getByRole("heading", { name: "Terms of Service" })).toBeVisible();
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { name: "Privacy Policy" })).toBeVisible();
    expect((await request.get("/sitemap.xml")).status()).toBe(200);
    expect(await (await request.get("/robots.txt")).text()).toContain("Disallow: /dashboard");
  });
});
