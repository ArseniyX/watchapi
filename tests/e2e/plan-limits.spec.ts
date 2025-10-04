import { test, expect } from "@playwright/test";
import { signUp, generateTestEmail, TEST_PASSWORD } from "./helpers/auth";
import { createCollection } from "./helpers/collections";

test.describe("Plan Limits & Upgrade Flow", () => {
  // Setup: Create a user before each test
  test.beforeEach(async ({ page }) => {
    const email = generateTestEmail();
    await signUp(page, email, TEST_PASSWORD);
  });

  test.describe("Endpoint Limit Enforcement", () => {
    test("should block FREE user from creating more than 10 endpoints", async ({
      page,
    }) => {
      await page.goto("/app/collections");

      // Step 1: Create a collection
      await createCollection(page);

      let successfulCreations = 0;
      let limitReached = false;

      // Step 2: Attempt to create 11 endpoints (FREE plan limit is 10)
      for (let i = 0; i < 11; i++) {
        await page.locator('text="New Collection"').hover();
        await page.waitForTimeout(300);

        // Click add endpoint button
        await page.click('[data-testid="add-endpoint-button"]');
        await page.waitForTimeout(800);

        // Check if error toast appeared (plan limit)
        const errorToast = page.locator('text=/Plan limit reached/i');
        const hasError = await errorToast.isVisible();

        if (hasError) {
          limitReached = true;
          console.log(`Limit reached at attempt ${i + 1}`);
          break;
        }

        successfulCreations++;
      }

      // Step 3: Verify limit was enforced
      expect(limitReached).toBe(true);

      // Step 4: Verify we created exactly 10 endpoints (or close to it)
      const finalCount = await page
        .locator('aside >> text="New Request"')
        .count();
      expect(finalCount).toBeLessThanOrEqual(10);
      expect(finalCount).toBeGreaterThanOrEqual(8); // Allow for some timing variance

      // Step 5: Verify error message is visible
      const errorToast = page.locator('text=/Plan limit reached.*FREE/i');
      await expect(errorToast).toBeVisible({ timeout: 2000 });
    });
  });

  test.describe("Billing Page", () => {
    test("should display billing page with current plan and upgrade options", async ({
      page,
    }) => {
      // Step 1: Click "Billing" in sidebar
      await page.goto("/app");
      await page.waitForLoadState("networkidle");

      const billingLink = page.locator('a[href="/app/billing"]');
      await billingLink.click();

      // Step 2: Verify billing page loads
      await page.waitForURL("/app/billing");
      await expect(page).toHaveURL("/app/billing");

      // Step 3: Verify "Current Plan" card shows FREE plan
      const currentPlanHeading = page.locator(
        'div[data-slot="card-title"]:has-text("Current Plan")',
      );
      await expect(currentPlanHeading).toBeVisible();

      // Verify FREE plan is shown as current in the badge
      const freePlanBadge = page.getByText("FREE", { exact: true });
      await expect(freePlanBadge).toBeVisible();

      // Step 4: Verify 4 plan cards displayed (Free, Starter, Pro, Enterprise)
      const planNames = ["Free", "Starter", "Pro", "Enterprise"];
      for (const planName of planNames) {
        const planCard = page.locator(`text="${planName}"`);
        await expect(planCard).toBeVisible();
      }

      // Step 5: Verify current plan (Free) shows "Current Plan" button
      const currentPlanButton = page.locator('button:has-text("Current Plan")');
      await expect(currentPlanButton).toBeVisible();
      await expect(currentPlanButton).toBeDisabled();

      // Step 6: Verify other plans show "Upgrade" or "Contact Sales" buttons
      const upgradeButtons = page.locator('button:has-text("Upgrade")');
      const contactSalesButtons = page.locator(
        'button:has-text("Contact Sales")',
      );

      const upgradeCount = await upgradeButtons.count();
      const contactSalesCount = await contactSalesButtons.count();

      // Should have at least 2 upgrade buttons (Starter, Pro)
      expect(upgradeCount).toBeGreaterThanOrEqual(2);

      // Enterprise should have Contact Sales button
      expect(contactSalesCount).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe("Upgrade Flow (Coming Soon)", () => {
    test("should show coming soon dialog when attempting to upgrade", async ({
      page,
    }) => {
      // Step 1: Navigate to billing page
      await page.goto("/app/billing");
      await page.waitForLoadState("networkidle");

      // Step 2: Click "Upgrade" on Starter plan
      const starterUpgradeButton = page
        .locator('div:has-text("Starter") >> button:has-text("Upgrade")')
        .first();
      await starterUpgradeButton.click();

      // Step 3: Verify "Coming Soon" dialog appears
      const comingSoonDialog = page.locator('text="Coming Soon"');
      await expect(comingSoonDialog).toBeVisible({ timeout: 5000 });

      // Step 4: Verify dialog shows contact email
      const contactEmail = page.locator('text="billing@watchapi.dev"');
      await expect(contactEmail).toBeVisible();

      // Step 5: Verify "Contact Us" button with mailto link
      const contactUsButton = page.locator(
        'a[href="mailto:billing@watchapi.dev"]:has-text("Contact Us")',
      );
      await expect(contactUsButton).toBeVisible();

      // Step 6: Close dialog using the Close button
      const closeButton = page.locator('button:has-text("Close")').first();
      await closeButton.click();

      // Wait for dialog to close
      await expect(comingSoonDialog).not.toBeVisible({ timeout: 3000 });

      // Step 7: Verify user remains on FREE plan
      // Reload page to verify plan hasn't changed
      await page.reload();
      await page.waitForLoadState("networkidle");

      // Verify the "Current Plan" button is still visible (FREE plan unchanged)
      const currentPlanBtn = page.locator('button:has-text("Current Plan")');
      await expect(currentPlanBtn).toBeVisible();
      await expect(currentPlanBtn).toBeDisabled();
    });

    test("should show coming soon dialog for Pro plan upgrade", async ({
      page,
    }) => {
      await page.goto("/app/billing");
      await page.waitForLoadState("networkidle");

      // Click "Upgrade" on Pro plan
      const proUpgradeButton = page
        .locator('div:has-text("Pro") >> button:has-text("Upgrade")')
        .first();
      await proUpgradeButton.click();

      // Verify Coming Soon dialog
      const comingSoonDialog = page.locator('text="Coming Soon"');
      await expect(comingSoonDialog).toBeVisible({ timeout: 5000 });

      const contactEmail = page.locator('text="billing@watchapi.dev"');
      await expect(contactEmail).toBeVisible();
    });

    test("should show contact option for Enterprise plan", async ({ page }) => {
      await page.goto("/app/billing");
      await page.waitForLoadState("networkidle");

      // Click "Contact Sales" on Enterprise plan
      const enterpriseContactButton = page
        .locator('button:has-text("Contact Sales")')
        .first();
      await enterpriseContactButton.click();

      // Verify Coming Soon dialog appears (same as other plans)
      const comingSoonDialog = page.locator('text="Coming Soon"');
      await expect(comingSoonDialog).toBeVisible({ timeout: 5000 });

      // Should show contact email
      const contactEmail = page.locator('text="billing@watchapi.dev"');
      await expect(contactEmail).toBeVisible();
    });
  });
});
