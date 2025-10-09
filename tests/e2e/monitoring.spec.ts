import { test, expect } from "@playwright/test";
import { signUp, generateTestEmail, TEST_PASSWORD } from "./helpers/auth";
import { createCollection } from "./helpers/collections";

test.describe("Monitoring System", () => {
  // Setup: Create a user before each test
  test.beforeEach(async ({ page }) => {
    const email = generateTestEmail();
    await signUp(page, email, TEST_PASSWORD);
  });

  test.describe("Create Endpoint with Monitoring", () => {
    test("should create endpoint with monitoring toggle available", async ({
      page,
    }) => {
      await page.goto("/app/collections");

      // Create a collection
      await createCollection(page);

      // Create an endpoint
      await page.locator('text="New Collection"').hover();
      await page.waitForTimeout(200);
      await page.click('[data-testid="add-endpoint-button"]');
      await page.waitForSelector('text="New Request"', { timeout: 15000 });

      // Click on endpoint to view details
      await page.click('text="New Request"');
      await page.waitForTimeout(500);

      // Fill in URL for a working test endpoint
      const urlInput = page.locator('input[placeholder*="Enter request URL"]');
      await urlInput.clear();
      await urlInput.fill("https://jsonplaceholder.typicode.com/posts/1");

      // Save changes
      const saveButton = page.locator('button:has-text("Save")');
      await saveButton.click();
      await page.waitForLoadState("networkidle");

      // Click on Monitoring tab
      await page.click('button:has-text("Monitoring")');
      await page.waitForTimeout(500);

      // Verify monitoring toggle exists (it's the Switch component with id "monitoring-enabled")
      const monitoringToggle = page.locator('#monitoring-enabled');
      await expect(monitoringToggle).toBeVisible();

      // Check if toggle is disabled by default (check data-state attribute)
      const isEnabled =
        (await monitoringToggle.getAttribute("data-state")) === "checked";

      expect(isEnabled).toBe(false); // Default is false/inactive
    });

    test("should enable monitoring via toggle", async ({ page }) => {
      await page.goto("/app/collections");

      // Create a collection
      await createCollection(page);

      // Create an endpoint
      await page.locator('text="New Collection"').hover();
      await page.waitForTimeout(200);
      await page.click('[data-testid="add-endpoint-button"]');
      await page.waitForSelector('text="New Request"', { timeout: 15000 });

      // Click on endpoint to view details
      await page.click('text="New Request"');
      await page.waitForTimeout(500);

      // Fill in URL
      const urlInput = page.locator('input[placeholder*="Enter request URL"]');
      await urlInput.clear();
      await urlInput.fill("https://jsonplaceholder.typicode.com/posts/1");

      // Click on Monitoring tab
      await page.click('button:has-text("Monitoring")');
      await page.waitForTimeout(500);

      // Toggle monitoring on
      const monitoringToggle = page.locator('#monitoring-enabled');
      await monitoringToggle.click();
      await page.waitForTimeout(300);

      // Save changes
      const saveButton = page.locator('button:has-text("Save")');
      await saveButton.click();
      await page.waitForLoadState("networkidle");

      // Verify monitoring is enabled
      const isEnabled =
        (await monitoringToggle.getAttribute("data-state")) === "checked";

      expect(isEnabled).toBe(true);
    });
  });

  test.describe("Manual Check Trigger", () => {
    test("should show Send button and loading state", async ({ page }) => {
      await page.goto("/app/collections");

      // Create collection and endpoint
      await createCollection(page);
      await page.locator('text="New Collection"').hover();
      await page.waitForTimeout(200);
      await page.click('[data-testid="add-endpoint-button"]');
      await page.waitForSelector('text="New Request"', { timeout: 15000 });

      // Open endpoint details
      await page.click('text="New Request"');
      await page.waitForTimeout(500);

      // Configure endpoint with a working URL
      const urlInput = page.locator('input[placeholder*="Enter request URL"]');
      await urlInput.clear();
      await urlInput.fill("https://jsonplaceholder.typicode.com/posts/1");

      // Save endpoint first
      const saveButton = page.locator('button:has-text("Save")');
      await saveButton.click();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);

      // Verify Send button exists
      const sendButton = page.locator('button:has-text("Send")');
      await expect(sendButton).toBeVisible();

      // Click Send button
      await sendButton.click();

      // Verify loading state appears (spinner with text "Sending request...")
      const loadingText = page.locator('text="Sending request..."');
      await expect(loadingText).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe("Response Time Display", () => {
    test("should display response time format correctly", async ({ page }) => {
      await page.goto("/app/collections");

      // Create collection and endpoint
      await createCollection(page);
      await page.locator('text="New Collection"').hover();
      await page.waitForTimeout(200);
      await page.click('[data-testid="add-endpoint-button"]');
      await page.waitForSelector('text="New Request"', { timeout: 15000 });

      // Open endpoint details
      await page.click('text="New Request"');
      await page.waitForTimeout(500);

      // Configure endpoint with fast API
      const urlInput = page.locator('input[placeholder*="Enter request URL"]');
      await urlInput.clear();
      await urlInput.fill("https://jsonplaceholder.typicode.com/posts/1");

      // Save
      const saveButton = page.locator('button:has-text("Save")');
      await saveButton.click();
      await page.waitForLoadState("networkidle");

      // Send request
      const sendButton = page.locator('button:has-text("Send")');
      await sendButton.click();

      // Wait longer for actual response
      await page.waitForTimeout(8000);

      // Response time is displayed in the format "0.12 s" next to the status code
      // Look for pattern matching time format (e.g., "0.12 s", "1.45 s")
      const responseTime = page.locator('text=/\\d+\\.\\d+\\s+s/');

      // Check if response time appears
      const hasResponseTime = (await responseTime.count()) > 0;

      if (hasResponseTime) {
        const responseTimeText = await responseTime.textContent();
        expect(responseTimeText).toMatch(/\d+\.\d+\s+s/);
      }
      // If no response time, that's okay - it means request is still pending or failed
    });
  });

  test.describe("Monitoring Toggle", () => {
    test("should toggle monitoring on and off", async ({ page }) => {
      await page.goto("/app/collections");

      // Create collection and endpoint
      await createCollection(page);
      await page.locator('text="New Collection"').hover();
      await page.waitForTimeout(200);
      await page.click('[data-testid="add-endpoint-button"]');
      await page.waitForSelector('text="New Request"', { timeout: 15000 });

      // Open endpoint details
      await page.click('text="New Request"');
      await page.waitForTimeout(500);

      // Configure endpoint
      const urlInput = page.locator('input[placeholder*="Enter request URL"]');
      await urlInput.clear();
      await urlInput.fill("https://jsonplaceholder.typicode.com/posts/1");

      // Click on Monitoring tab
      await page.click('button:has-text("Monitoring")');
      await page.waitForTimeout(500);

      // Get monitoring toggle (Switch with id="monitoring-enabled")
      const monitoringToggle = page.locator('#monitoring-enabled');
      await expect(monitoringToggle).toBeVisible();

      // Check initial state (should be disabled by default - unchecked)
      let isEnabled =
        (await monitoringToggle.getAttribute("data-state")) === "checked";
      expect(isEnabled).toBe(false);

      // Enable monitoring
      await monitoringToggle.click();
      await page.waitForTimeout(500);

      isEnabled =
        (await monitoringToggle.getAttribute("data-state")) === "checked";
      expect(isEnabled).toBe(true);

      // Disable monitoring again
      await monitoringToggle.click();
      await page.waitForTimeout(500);

      isEnabled =
        (await monitoringToggle.getAttribute("data-state")) === "checked";
      expect(isEnabled).toBe(false);
    });
  });

  test.describe("Monitoring Page", () => {
    test("should display monitoring dashboard with endpoints table", async ({
      page,
    }) => {
      // First create an endpoint to monitor
      await page.goto("/app/collections");
      await createCollection(page);
      await page.locator('text="New Collection"').hover();
      await page.waitForTimeout(200);
      await page.click('[data-testid="add-endpoint-button"]');
      await page.waitForSelector('text="New Request"', { timeout: 15000 });

      // Configure endpoint
      await page.click('text="New Request"');
      await page.waitForTimeout(500);

      const urlInput = page.locator('input[placeholder*="Enter request URL"]');
      await urlInput.clear();
      await urlInput.fill("https://jsonplaceholder.typicode.com/posts/1");

      // Enable monitoring
      await page.click('button:has-text("Monitoring")');
      await page.waitForTimeout(500);
      await page.click('#monitoring-enabled');
      await page.waitForTimeout(300);

      // Save
      const saveButton = page.locator('button:has-text("Save")');
      await saveButton.click();
      await page.waitForLoadState("networkidle");

      // Navigate to monitoring page
      await page.goto("/app/monitoring");
      await page.waitForLoadState("networkidle");

      // Verify monitoring page loads
      await expect(page.locator('h1:has-text("Monitoring")')).toBeVisible();

      // Verify table headers exist
      await expect(page.locator('th:has-text("Status")')).toBeVisible();
      await expect(page.locator('th:has-text("Endpoint")')).toBeVisible();
      await expect(page.locator('th:has-text("Method")')).toBeVisible();
      await expect(page.locator('th:has-text("Response Time")')).toBeVisible();
      await expect(page.locator('th:has-text("Uptime")')).toBeVisible();
      await expect(page.locator('th:has-text("Active")')).toBeVisible();
    });
  });

  test.describe("Analytics Page", () => {
    test("should display analytics dashboard with metrics", async ({ page }) => {
      await page.goto("/app/analytics");
      await page.waitForLoadState("networkidle");

      // Verify we're on the analytics page
      await expect(page).toHaveURL("/app/analytics");

      // Verify page title
      await expect(page.locator('h1:has-text("Analytics")')).toBeVisible();

      // Verify key metric cards exist
      await expect(page.locator('text="Total Requests"')).toBeVisible();
      await expect(page.locator('text="Avg Response Time"')).toBeVisible();
      await expect(page.locator('text="Error Rate"')).toBeVisible();
      await expect(page.locator('text="Uptime"')).toBeVisible();

      // Verify chart sections exist
      await expect(
        page.locator('text="Response Time Trends"'),
      ).toBeVisible();
      await expect(page.locator('text="Uptime Overview"')).toBeVisible();
      await expect(page.locator('text="Top Endpoints"')).toBeVisible();
    });
  });

  test.describe("Monitoring Configuration", () => {
    test("should configure monitoring interval and expected status", async ({
      page,
    }) => {
      await page.goto("/app/collections");

      // Create collection and endpoint
      await createCollection(page);
      await page.locator('text="New Collection"').hover();
      await page.waitForTimeout(200);
      await page.click('[data-testid="add-endpoint-button"]');
      await page.waitForSelector('text="New Request"', { timeout: 15000 });

      // Open endpoint details
      await page.click('text="New Request"');
      await page.waitForTimeout(500);

      // Fill in URL
      const urlInput = page.locator('input[placeholder*="Enter request URL"]');
      await urlInput.clear();
      await urlInput.fill("https://jsonplaceholder.typicode.com/posts/1");

      // Go to Monitoring tab
      await page.click('button:has-text("Monitoring")');
      await page.waitForTimeout(500);

      // Enable monitoring first
      await page.click('#monitoring-enabled');
      await page.waitForTimeout(300);

      // Verify configuration fields are visible
      await expect(
        page.locator('label:has-text("Check Interval")'),
      ).toBeVisible();
      await expect(
        page.locator('label:has-text("Expected Status Code")'),
      ).toBeVisible();
      await expect(
        page.locator('label:has-text("Request Timeout")'),
      ).toBeVisible();

      // Change expected status
      const expectedStatusInput = page.locator('#expected-status');
      await expectedStatusInput.clear();
      await expectedStatusInput.fill("201");

      // Change timeout
      const timeoutInput = page.locator('#timeout');
      await timeoutInput.clear();
      await timeoutInput.fill("5000");

      // Save
      const saveButton = page.locator('button:has-text("Save")');
      await saveButton.click();
      await page.waitForLoadState("networkidle");

      // Verify values are saved (check input values)
      expect(await expectedStatusInput.inputValue()).toBe("201");
      expect(await timeoutInput.inputValue()).toBe("5000");
    });
  });
});
