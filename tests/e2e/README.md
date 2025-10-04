# E2E Tests - Playwright

End-to-end tests for WatchAPI using Playwright.

## Setup

Playwright is already installed. If you need to reinstall browsers:

```bash
pnpm exec playwright install
```

## Running Tests

### Run all tests (headless)
```bash
pnpm test:e2e
```

### Run tests with UI mode (recommended for development)
```bash
pnpm test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
pnpm test:e2e:headed
```

### Debug tests
```bash
pnpm test:e2e:debug
```

### View test report
```bash
pnpm test:e2e:report
```

## Test Structure

```
tests/e2e/
├── helpers/          # Test utilities and helper functions
│   ├── auth.ts       # Authentication helpers (signup, login, logout)
│   └── collections.ts # Collection/endpoint management helpers
├── auth.spec.ts      # Authentication flow tests
└── collections.spec.ts # Collection & endpoint CRUD tests
```

## Test Coverage

### ✅ Authentication Tests (`auth.spec.ts`)
- Sign up flow (valid, invalid email, short password, duplicate email)
- Login flow (valid, invalid credentials, session persistence)
- Logout flow
- Protected routes (redirect unauthorized, allow authorized)

### ✅ Collections & Endpoints Tests (`collections.spec.ts`)
- Collection CRUD (create, delete with confirmation)
- Endpoint CRUD (create, delete with confirmation, view details)
- Plan limits (FREE plan 10 endpoint limit)
- Search & filter collections/endpoints
- Collections auto-expand on load

## Writing New Tests

1. Create a new `.spec.ts` file in `tests/e2e/`
2. Import helpers from `./helpers/`
3. Use `test.beforeEach()` to set up authentication if needed
4. Write descriptive test names

Example:
```typescript
import { test, expect } from "@playwright/test";
import { signUp, generateTestEmail, TEST_PASSWORD } from "./helpers/auth";

test.describe("My Feature", () => {
  test.beforeEach(async ({ page }) => {
    const email = generateTestEmail();
    await signUp(page, email, TEST_PASSWORD);
  });

  test("should do something", async ({ page }) => {
    await page.goto("/app/my-feature");
    await expect(page.locator("h1")).toContainText("My Feature");
  });
});
```

## Configuration

Tests are configured in `playwright.config.ts`:
- Base URL: `http://localhost:3000`
- Browser: Chromium (can add Firefox, WebKit)
- Auto-starts dev server before tests
- Takes screenshots on failure
- Records traces on first retry

## CI/CD Integration

For CI environments, Playwright will:
- Run in headless mode
- Retry failed tests 2 times
- Run tests sequentially (workers: 1)
- Generate HTML report

## Debugging Tips

1. **Use UI Mode**: `pnpm test:e2e:ui` - Best for development
2. **Use Debug Mode**: `pnpm test:e2e:debug` - Step through tests
3. **View Screenshots**: Check `test-results/` folder after failures
4. **View Traces**: Use `pnpm test:e2e:report` to see detailed traces

## Test Data

Tests use randomly generated emails to avoid conflicts:
- Email: `test-{timestamp}-{random}@watchapi.test`
- Password: `test123456`

## Best Practices

1. ✅ Use `test.beforeEach()` for common setup (auth, navigation)
2. ✅ Use helper functions for repetitive actions
3. ✅ Generate unique test data (emails, names)
4. ✅ Wait for elements to be visible before interacting
5. ✅ Use descriptive test names that explain what's being tested
6. ✅ Clean up test data when possible
7. ✅ Test both happy paths and error cases
8. ❌ Don't hardcode test data that might conflict
9. ❌ Don't rely on test execution order
10. ❌ Don't use arbitrary waits (`waitForTimeout`) unless necessary

## Troubleshooting

### Tests failing locally?
1. Make sure dev server is running: `pnpm dev`
2. Check database is migrated: `npx prisma migrate dev`
3. Clear browser storage between test runs

### Tests timing out?
- Increase timeout in `playwright.config.ts`
- Check if dev server started successfully
- Look for network errors in test output

### Selectors not working?
- Use Playwright Inspector: `pnpm test:e2e:debug`
- Add `data-testid` attributes to components for stable selectors
- Prefer user-facing selectors (text, labels) over CSS classes

## Future Tests to Add

Priority order (see `E2E_TEST_FLOWS.md`):

**P0 (Critical)**: Already implemented ✅
- Authentication flows
- Collection & endpoint CRUD
- Plan limits

**P1 (Important)**:
- [ ] Monitoring dashboard view
- [ ] Team management
- [ ] Billing page interactions

**P2 (Nice to have)**:
- [ ] Alerts creation and limits
- [ ] Analytics dashboard
- [ ] Onboarding checklist
- [ ] Error handling flows
