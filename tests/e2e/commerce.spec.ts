import { expect, test, type Page } from "@playwright/test";
import { catalog } from "@/content/catalog";
import { deliverStripeEvent, signInAsNewUser } from "./helpers";
import { waitForEmail } from "../support/mailpit";

const persuasion = catalog.find((c) => c.slug === "the-persuasion-lab")!;

/** Our checkout route answers with a redirect to the Stripe-hosted page; record where the browser is sent. */
function watchCheckout(page: Page) {
  let url = "";
  page.on("request", (request) => {
    if (new URL(request.url()).hostname === "checkout.stripe.com") url = request.url();
  });
  return () => url;
}

test.describe("payments", () => {
  test("buying a course: Stripe Checkout, then the webhook unlocks it and sends a receipt", async ({ page }) => {
    const user = await signInAsNewUser(page, { name: "Buyer" });
    const checkoutUrl = watchCheckout(page);

    await page.goto(`/courses/${persuasion.slug}`);
    await page.getByRole("button", { name: `Buy for $${persuasion.priceCents / 100}` }).click();
    await expect.poll(checkoutUrl).toContain("checkout.stripe.com");

    // Stripe confirms payment to the webhook, then returns the learner to the success URL.
    await deliverStripeEvent(page, "checkout.session.completed", {
      id: `cs_e2e_${Date.now()}`,
      object: "checkout.session",
      mode: "payment",
      payment_status: "paid",
      payment_intent: `pi_e2e_${Date.now()}`,
      amount_total: persuasion.priceCents,
      currency: "usd",
      metadata: { user_id: user.id, course_id: persuasion.id },
    });
    await page.goto(`/learn/${persuasion.slug}?purchased=1`);
    await expect(page.getByText("Unlocked!")).toBeVisible();
    await expect(page.getByText("You're previewing this course.")).toHaveCount(0);

    await page.goto("/account/billing");
    await expect(page.getByRole("cell", { name: persuasion.title })).toBeVisible();
    await expect(page.getByRole("cell", { name: `$${persuasion.priceCents / 100}` })).toBeVisible();
    await waitForEmail(user.email, /Your receipt/);
  });

  test("All-Access: subscription checkout, then every course opens", async ({ page }) => {
    const user = await signInAsNewUser(page, { name: "Member" });
    const checkoutUrl = watchCheckout(page);

    await page.goto("/pricing");
    await page.getByRole("radio", { name: /Monthly/ }).click();
    await page.getByRole("button", { name: "Unlock All-Access" }).click();
    await expect.poll(checkoutUrl).toContain("checkout.stripe.com");

    await deliverStripeEvent(page, "customer.subscription.created", {
      id: `sub_e2e_${Date.now()}`,
      object: "subscription",
      status: "active",
      customer: `cus_e2e_${Date.now()}`,
      cancel_at_period_end: false,
      metadata: { user_id: user.id },
      items: { data: [{ current_period_end: Math.floor(Date.now() / 1000) + 30 * 86_400, price: { id: "price_monthly", recurring: { interval: "month" } } }] },
    });

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
