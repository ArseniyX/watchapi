import { test, expect } from "@playwright/test";
import { signUp, login, generateTestEmail, TEST_PASSWORD } from "./helpers/auth";

test.describe("Authentication Flow", () => {
  test.describe("Sign Up", () => {
    test("should allow new user to sign up successfully", async ({ page }) => {
      const email = generateTestEmail();

      await page.goto("/signup");

      // Fill in sign up form
      await page.fill('input[name="name"]', "Test User");
      await page.fill('input[name="email"]', email);
      await page.fill('input[name="password"]', TEST_PASSWORD);
      await page.click('#terms');

      // Submit form and wait for navigation
      await Promise.all([
        page.waitForURL("/app", { timeout: 10000 }),
        page.click('button[type="submit"]'),
      ]);

      // Verify redirect to dashboard
      await expect(page).toHaveURL("/app");

      // Verify user is logged in by checking for sidebar
      await expect(
        page.locator('[data-testid="app-sidebar"]'),
      ).toBeVisible();
    });

    test("should show error for invalid email", async ({ page }) => {
      await page.goto("/signup");

      await page.fill('input[name="name"]', "Test User");
      await page.fill('input[name="email"]', "invalid-email");
      await page.fill('input[name="password"]', TEST_PASSWORD);
      await page.click('#terms');

      // HTML5 validation should prevent submission
      // Button should still be enabled but browser validation blocks submission
      await page.click('button[type="submit"]');

      // Should stay on signup page due to validation
      await expect(page).toHaveURL("/signup");
    });

    test("should show error for short password", async ({ page }) => {
      await page.goto("/signup");

      await page.fill('input[name="name"]', "Test User");
      await page.fill('input[name="email"]', generateTestEmail());
      await page.fill('input[name="password"]', "123"); // Too short
      await page.click('#terms');
      await page.click('button[type="submit"]');

      // Should show error toast from backend
      await expect(
        page.locator('text=/password.*least.*6|too short/i'),
      ).toBeVisible({ timeout: 10000 });
    });

    test("should show error for duplicate email", async ({ page }) => {
      const email = generateTestEmail();

      // First sign up
      await signUp(page, email, TEST_PASSWORD);

      // Clear session
      await page.context().clearCookies();
      await page.evaluate(() => localStorage.clear());

      // Try to sign up again with same email
      await page.goto("/signup");
      await page.fill('input[name="name"]', "Test User");
      await page.fill('input[name="email"]', email);
      await page.fill('input[name="password"]', TEST_PASSWORD);
      await page.click('#terms');
      await page.click('button[type="submit"]');

      // Should show error toast
      await expect(
        page.locator('text=/Email already exists|already registered/i'),
      ).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("Login", () => {
    test("should allow existing user to login successfully", async ({
      page,
    }) => {
      const email = generateTestEmail();

      // First create an account
      await signUp(page, email, TEST_PASSWORD);

      // Clear storage to simulate logout
      await page.context().clearCookies();
      await page.evaluate(() => localStorage.clear());

      // Now try to log in
      await page.goto("/login");
      await page.fill('input[name="email"]', email);
      await page.fill('input[name="password"]', TEST_PASSWORD);
      await page.click('button[type="submit"]');

      // Should redirect to dashboard
      await expect(page).toHaveURL("/app");
    });

    test("should show error for invalid credentials", async ({ page }) => {
      await page.goto("/login");

      await page.fill('input[name="email"]', "nonexistent@example.com");
      await page.fill('input[name="password"]', "wrongpassword");
      await page.click('button[type="submit"]');

      // Should show error toast (check for title specifically)
      await expect(
        page.locator('text="Login failed"').first(),
      ).toBeVisible();
    });

    test("should persist session after page refresh", async ({ page }) => {
      const email = generateTestEmail();

      // Sign up
      await signUp(page, email, TEST_PASSWORD);

      // Refresh the page
      await page.reload();
      await page.waitForLoadState("networkidle");

      // Should still be on dashboard (logged in)
      await expect(page).toHaveURL("/app");
      // Check for sidebar or user profile dropdown (use first() to avoid strict mode violation)
      await expect(
        page
          .locator(
            '[data-testid="user-profile-dropdown"], [data-testid="app-sidebar"]',
          )
          .first(),
      ).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("Logout", () => {
    test("should allow user to logout successfully", async ({ page }) => {
      const email = generateTestEmail();

      // Sign up
      await signUp(page, email, TEST_PASSWORD);

      // Find and click logout button (adjust selector based on your UI)
      // This might be in a dropdown menu
      const userMenu = page.locator('[data-testid="user-profile-dropdown"]');
      await userMenu.click();

      await page.click('text="Sign Out"');

      // Should redirect to login or home page
      await expect(page).toHaveURL(/\/(login|)$/);

      // Try to access protected route
      await page.goto("/app");

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe("Protected Routes", () => {
    test("should redirect unauthenticated users to login", async ({ page }) => {
      // Try to access protected routes without authentication
      const protectedRoutes = [
        "/app",
        "/app/collections",
        "/app/monitoring",
        "/app/alerts",
        "/app/analytics",
        "/app/team",
        "/app/billing",
      ];

      for (const route of protectedRoutes) {
        await page.goto(route);
        await expect(page).toHaveURL(/\/login/);
      }
    });

    test("should allow authenticated users to access protected routes", async ({
      page,
    }) => {
      const email = generateTestEmail();
      await signUp(page, email, TEST_PASSWORD);

      const protectedRoutes = [
        "/app",
        "/app/collections",
        "/app/monitoring",
        "/app/alerts",
        "/app/analytics",
        "/app/team",
        "/app/billing",
      ];

      for (const route of protectedRoutes) {
        await page.goto(route);
        await expect(page).toHaveURL(route);
      }
    });
  });
});
