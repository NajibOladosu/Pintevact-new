import { expect, test } from "@playwright/test";
import { expectNoHorizontalScroll, openMobileMenuIfNeeded } from "./helpers";

test.describe("public site", () => {
  test("home page tells the story and links to courses", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Pintevact/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Finally understand why you");
    await expect(page.getByText("Videos that talk back")).toBeVisible();
    await expectNoHorizontalScroll(page);
    await openMobileMenuIfNeeded(page);
    await page.getByRole("link", { name: "Courses" }).first().click();
    await expect(page).toHaveURL(/\/courses$/);
  });

  test("hero demo player pauses to ask a question", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("the video paused for you")).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: "5 cents" }).click();
    await expect(page.getByText(/Your rider stepped in/)).toBeVisible();
  });

  test("interaction showcase switches tabs", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: /Live polls/ }).click();
    await expect(page.getByRole("tabpanel")).toContainText("See how your mind compares");
  });

  test("catalog filters by category and search", async ({ page }) => {
    await page.goto("/courses");
    await expect(page.getByText("7 courses")).toBeVisible();
    await page.getByRole("button", { name: "Relationships" }).click();
    await expect(page.getByText("1 course", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Attachment & You" })).toBeVisible();
    await page.getByRole("button", { name: "All" }).click();
    await page.getByPlaceholder(/Search/).fill("zzzz");
    await expect(page.getByText("Nothing matches — yet.")).toBeVisible();
    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(page.getByText("7 courses")).toBeVisible();
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
    await expect(page.getByText("Lost in thought?")).toBeVisible();
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
      await page.locator("main button").filter({ hasText: /^B/ }).first().click();
    }
    await expect(page.getByRole("heading", { name: "The Feeler" })).toBeVisible();
    await expect(page.getByText("Recommended for you")).toBeVisible();
    await expect(page.getByRole("link", { name: "See the course" })).toHaveAttribute("href", "/courses/emotional-alchemy");
  });

  test("journal lists and opens articles", async ({ page }) => {
    await page.goto("/journal");
    await page.getByRole("link", { name: /spotlight effect/i }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("spotlight effect");
    await expect(page.getByText("Try this")).toBeVisible();
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
