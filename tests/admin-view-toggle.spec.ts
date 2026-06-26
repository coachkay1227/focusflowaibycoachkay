import { test, expect } from "@playwright/test";

/**
 * E2E: Admin "View as user" toggle.
 * Verifies the gold banner appears, sessionStorage flips, and exiting restores.
 * Skipped unless ADMIN_EMAIL / ADMIN_PASSWORD env vars are set in CI.
 */
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

test.describe("admin view toggle", () => {
  test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, "Admin credentials not provided");

  test("flips userView and shows banner", async ({ page }) => {
    await page.goto("/auth");
    await page.getByLabel(/email/i).fill(ADMIN_EMAIL!);
    await page.getByLabel(/password/i).fill(ADMIN_PASSWORD!);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/dashboard/);

    // Find and click the admin-view toggle (round icon on mobile, labeled on desktop)
    const toggle = page.getByRole("button", { name: /view as user|user view/i }).first();
    await toggle.click();

    // Gold banner should appear
    await expect(page.getByText(/USER VIEW ACTIVE/i)).toBeVisible();

    // sessionStorage should reflect the toggle
    const flag = await page.evaluate(() => sessionStorage.getItem("admin-user-view"));
    expect(flag).toBe("true");

    // Exit user view
    await page.getByRole("button", { name: /exit user view/i }).click();
    await expect(page.getByText(/USER VIEW ACTIVE/i)).not.toBeVisible();

    const flagAfter = await page.evaluate(() => sessionStorage.getItem("admin-user-view"));
    expect(flagAfter).toBe("false");
  });
});