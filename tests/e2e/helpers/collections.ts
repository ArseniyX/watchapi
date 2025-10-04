import { Page, expect } from "@playwright/test";

/**
 * Helper function to create a new collection
 */
export async function createCollection(
  page: Page,
  name?: string,
): Promise<void> {
  // Wait for collections sidebar to be loaded by checking for search input or create button
  const searchOrButton = page.locator(
    'input[placeholder*="Search collections"], [data-testid="create-collection-button"]',
  );
  await searchOrButton.first().waitFor({ timeout: 15000 });

  // Wait for and click the create collection button
  await page.waitForSelector('[data-testid="create-collection-button"]', {
    timeout: 10000,
    state: "visible",
  });
  await page.click('[data-testid="create-collection-button"]');

  // Wait for collection to appear in sidebar
  await page.waitForSelector('text="New Collection"');

  // If custom name provided, rename it
  if (name) {
    // TODO: Implement collection renaming when feature is available
  }
}

/**
 * Helper function to create a new endpoint
 */
export async function createEndpoint(
  page: Page,
  collectionName: string,
  endpointData?: {
    name?: string;
    url?: string;
    method?: string;
  },
): Promise<void> {
  // Navigate to collections page
  await page.goto("/app/collections");

  // Find the collection and hover over it
  const collection = page.locator(`text="${collectionName}"`);
  await collection.hover();

  // Click the "+" button to add endpoint
  await page.click(`text="${collectionName}" >> .. >> button:has-text("+")`);

  // Wait for new endpoint to appear
  await page.waitForSelector('text="New Request"');

  // If endpoint data provided, configure it
  if (endpointData) {
    // Click on the newly created endpoint
    await page.click('text="New Request"');

    // Fill in endpoint details
    if (endpointData.name) {
      await page.fill('input[name="name"]', endpointData.name);
    }
    if (endpointData.url) {
      await page.fill('input[name="url"]', endpointData.url);
    }
    if (endpointData.method) {
      await page.selectOption('select[name="method"]', endpointData.method);
    }

    // Save changes
    await page.click('button:has-text("Save")');
  }
}

/**
 * Helper function to delete an endpoint
 */
export async function deleteEndpoint(
  page: Page,
  endpointName: string,
): Promise<void> {
  // Navigate to collections page
  await page.goto("/app/collections");

  // Find the endpoint and hover over it
  const endpoint = page.locator(`text="${endpointName}"`);
  await endpoint.hover();

  // Click the trash icon
  await endpoint.locator('.. >> button[title*="Delete"]').click();

  // Confirm deletion in dialog
  await page.click('button:has-text("Delete")');

  // Wait for success toast
  await page.waitForSelector('text="Endpoint deleted successfully"');
}

/**
 * Helper function to delete a collection
 */
export async function deleteCollection(
  page: Page,
  collectionName: string,
): Promise<void> {
  // Navigate to collections page
  await page.goto("/app/collections");

  // Find the collection and hover over it
  const collection = page.locator(`text="${collectionName}"`);
  await collection.hover();

  // Click the trash icon
  await collection.locator('.. >> button[title*="Delete"]').click();

  // Confirm deletion in dialog
  await page.click('button:has-text("Delete")');

  // Wait for success toast
  await page.waitForSelector('text="Collection deleted successfully"');
}

/**
 * Helper to count endpoints in a collection
 */
export async function countEndpoints(
  page: Page,
  collectionName: string,
): Promise<number> {
  await page.goto("/app/collections");

  // Ensure collection is expanded
  const collection = page.locator(`text="${collectionName}"`);
  const chevron = collection.locator(".. >> svg");
  const isExpanded = await chevron.getAttribute("class");

  if (!isExpanded?.includes("ChevronDown")) {
    await collection.click();
  }

  // Count child endpoints
  const endpoints = await page
    .locator(`text="${collectionName}" >> .. >> .. >> [role="listitem"]`)
    .count();

  return endpoints;
}
