import { Page } from "@playwright/test";

/**
 * Helper function to sign up a new user
 */
export async function signUp(
  page: Page,
  email: string,
  password: string,
  name: string = "Test User",
): Promise<void> {
  await page.goto("/signup");

  // Fill in all required fields with pressSequentially for better compatibility
  await page.locator('input[name="name"]').click();
  await page.locator('input[name="name"]').fill(name);

  await page.locator('input[name="email"]').click();
  await page.locator('input[name="email"]').fill(email);

  await page.locator('input[name="password"]').click();
  await page.locator('input[name="password"]').fill(password);

  // Check the terms checkbox
  await page.locator("#terms").click();

  const submitSelector = 'button[type="submit"]';
  const submitButton = page.locator(submitSelector);
  await submitButton.waitFor({ state: "visible" });
  await page.waitForFunction(
    (selector) => {
      const button = document.querySelector<HTMLButtonElement>(selector);
      return !!button && !button.disabled;
    },
    submitSelector,
  );
  await submitButton.click();

  await page.waitForURL(/.*\/app(\/.*)?$/, {
    timeout: 20000,
    waitUntil: "commit",
  });
}

/**
 * Helper function to log in an existing user
 */
export async function login(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto("/login");

  await page.locator('input[name="email"]').click();
  await page.locator('input[name="email"]').fill(email);

  await page.locator('input[name="password"]').click();
  await page.locator('input[name="password"]').fill(password);

  const submitSelector = 'button[type="submit"]';
  const submitButton = page.locator(submitSelector);
  await submitButton.waitFor({ state: "visible" });
  await page.waitForFunction(
    (selector) => {
      const button = document.querySelector<HTMLButtonElement>(selector);
      return !!button && !button.disabled;
    },
    submitSelector,
  );
  await submitButton.click();

  await page.waitForURL(/.*\/app(\/.*)?$/, {
    timeout: 20000,
    waitUntil: "commit",
  });
}

/**
 * Helper function to log out
 */
export async function logout(page: Page): Promise<void> {
  // Click user profile dropdown
  await page.click('[data-testid="user-profile-dropdown"]');
  // Click logout button
  await page.click('text="Sign Out"');
  // Wait for redirect to login or home
  await page.waitForURL(/\/(login|)$/);
}

/**
 * Generate a unique test email
 */
export function generateTestEmail(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `test-${timestamp}-${random}@watchapi.test`;
}

/**
 * Standard test password
 */
export const TEST_PASSWORD = "test123456";
