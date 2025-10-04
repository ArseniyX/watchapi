import { beforeAll, afterAll, afterEach } from "vitest";

// Mock environment variables
beforeAll(() => {
  process.env.DATABASE_URL = "file:./test.db";
  process.env.JWT_SECRET = "test-secret-key-for-testing-only";
  process.env.NODE_ENV = "test";
});

afterAll(() => {
  // Cleanup
});

afterEach(() => {
  // Reset any mocks or state between tests
});
