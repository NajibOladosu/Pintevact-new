import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { signUp } from "./helpers";

const publicPages = ["/", "/courses", "/courses/emotional-alchemy", "/pricing", "/discover", "/about", "/contact", "/journal", "/login", "/signup"];

async function seriousViolations(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).disableRules(["color-contrast"]).analyze();
  return results.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(", ")}`);
}

test.describe("accessibility", () => {
  test.skip(({ browserName }) => browserName !== "chromium");

  for (const path of publicPages) {
    test(`no serious axe violations on ${path}`, async ({ page }) => {
      await page.goto(path);
      expect(await seriousViolations(page)).toEqual([]);
    });
  }

  test("no serious axe violations in the app", async ({ page }) => {
    await signUp(page);
    for (const path of ["/dashboard", "/learn", "/learn/meet-your-mind/the-elephant-and-the-rider", "/reflections", "/achievements", "/account"]) {
      await page.goto(path);
      expect(await seriousViolations(page), path).toEqual([]);
    }
  });
});
