import { test, expect } from "../playwright-fixture";

/**
 * End-to-end coverage for the 3 public assessment / starter-kit entry points.
 *
 * These tests verify two things at every step:
 *  1. The route renders its OWN flow (no silent fallback to the generic
 *     Personal Clarity quiz).
 *  2. Completing the flow surfaces the CTA tied to that path
 *     (Personal Reset / Business Reset / AI Reset).
 */

// ──────────────────────────────────────────────────────────────────────
// Personal Clarity Check — /clarity
// ──────────────────────────────────────────────────────────────────────
test.describe("Personal Clarity Check (/clarity)", () => {
  test("renders the Personal Clarity Check header (not a fallback)", async ({ page }) => {
    await page.goto("/clarity");
    await expect(page.getByText("Personal Clarity Check", { exact: false })).toBeVisible();
    // Must NOT show the Business assessment header
    await expect(page.getByText("BUSINESS CLARITY ASSESSMENT")).toHaveCount(0);
    // Must NOT show the Starter Kit header
    await expect(page.getByText("AI TRANSFORMATION · STARTER KIT")).toHaveCount(0);
  });
});

// ──────────────────────────────────────────────────────────────────────
// Business Clarity Assessment — /assessment
// ──────────────────────────────────────────────────────────────────────
test.describe("Business Clarity Assessment (/assessment)", () => {
  test("renders the Business assessment, not the personal quiz", async ({ page }) => {
    await page.goto("/assessment");
    await expect(page.getByText("BUSINESS CLARITY ASSESSMENT")).toBeVisible();
    await expect(page.getByText("Personal Clarity Check")).toHaveCount(0);
  });

  test("completing the assessment surfaces the 30-Day Business Reset CTA", async ({ page }) => {
    await page.goto("/assessment");
    await expect(page.getByText("BUSINESS CLARITY ASSESSMENT")).toBeVisible();

    // The flow is 18 questions × 4 options each. Always pick the first option
    // and advance. The final Continue button reads "Reveal My Clarity Profile".
    for (let i = 0; i < 18; i++) {
      // Pick first option for the current step
      const firstOption = page.locator("button.text-left.rounded-lg.border").first();
      await firstOption.click();

      const isLast = i === 17;
      const cta = isLast
        ? page.getByRole("button", { name: /Reveal My Clarity Profile/i })
        : page.getByRole("button", { name: /^Continue$/i });
      await cta.click();
    }

    // Result panel must show the Business Reset CTA — NOT the Personal Reset CTA.
    await expect(
      page.getByRole("button", { name: /Apply for the 30-Day Business Reset/i })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Apply for the 30-Day Personal Reset/i })
    ).toHaveCount(0);
  });
});

// ──────────────────────────────────────────────────────────────────────
// AI Transformation Starter Kit — /starter-kit
// ──────────────────────────────────────────────────────────────────────
test.describe("AI Transformation Starter Kit (/starter-kit)", () => {
  test("renders the starter-kit landing, not a clarity quiz", async ({ page }) => {
    await page.goto("/starter-kit");
    await expect(page.getByText("AI TRANSFORMATION · STARTER KIT")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Send Me the Starter Kit/i })
    ).toBeVisible();
    // No quiz UI from the clarity flow should appear
    await expect(page.getByText("Personal Clarity Check")).toHaveCount(0);
    await expect(page.getByText("BUSINESS CLARITY ASSESSMENT")).toHaveCount(0);
  });

  test("/ai-starter-kit redirects to /starter-kit", async ({ page }) => {
    await page.goto("/ai-starter-kit");
    await expect(page).toHaveURL(/\/starter-kit$/);
    await expect(page.getByText("AI TRANSFORMATION · STARTER KIT")).toBeVisible();
  });
});

// ──────────────────────────────────────────────────────────────────────
// Routing guards — no silent fallback to the default Personal quiz
// ──────────────────────────────────────────────────────────────────────
test.describe("Clarity route guards", () => {
  test("/clarity/mac-type-assessment redirects to /assessment", async ({ page }) => {
    await page.goto("/clarity/mac-type-assessment");
    await expect(page).toHaveURL(/\/assessment$/);
    await expect(page.getByText("BUSINESS CLARITY ASSESSMENT")).toBeVisible();
  });

  test("/clarity/kpi-roi-tracker redirects to /starter-kit", async ({ page }) => {
    await page.goto("/clarity/kpi-roi-tracker");
    await expect(page).toHaveURL(/\/starter-kit$/);
    await expect(page.getByText("AI TRANSFORMATION · STARTER KIT")).toBeVisible();
  });

  test("unknown moduleId redirects to canonical /clarity (no silent fallback)", async ({ page }) => {
    await page.goto("/clarity/this-module-does-not-exist");
    await expect(page).toHaveURL(/\/clarity$/);
    await expect(page.getByText("Personal Clarity Check", { exact: false })).toBeVisible();
  });

  test("/result without state redirects to /clarity (never renders empty result)", async ({ page }) => {
    await page.goto("/result");
    await expect(page).toHaveURL(/\/clarity$/);
  });
});
