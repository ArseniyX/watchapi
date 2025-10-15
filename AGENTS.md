# Repository Guidelines

## Project Structure & Module Organization
The Next.js app lives in `src/`: `src/app` holds App Router views and `src/components` holds shared UI. Domain logic, tRPC routers, and jobs are grouped by feature in `src/server/modules/*` with colocated tests in `__tests__`. Client state sits in `src/store`, transactional emails in `src/emails`, and Prisma schemas in `prisma/`. Playwright journeys live in `tests/e2e`. The automation CLI resides in `packages/cli`; run `pnpm --filter cli ...` for package tasks. Docs and runbooks stay in `docs/`, static assets in `public/`.

## Build, Test, and Development Commands
- `pnpm install` — sync dependencies after pulling.
- `pnpm dev` — start the Next.js dev server on http://localhost:3000.
- `pnpm build` / `pnpm start` — create the production bundle and serve it.
- `pnpm lint` / `pnpm type-check` — enforce ESLint rules and TypeScript safety.
- `pnpm test` / `pnpm test:coverage` — run Vitest with optional coverage.
- `pnpm test:e2e` — execute Playwright suites; add `:headed` or `:ui` when debugging.
- `pnpm prisma migrate dev` — apply local Prisma schema changes and generate SQL.

## Coding Style & Naming Conventions
Prettier (see `.prettierrc`) enforces 2-space indents, double quotes, and trailing commas; run `pnpm pretty` before committing. Follow ESLint guidance from `eslint.config.mjs`. Components and modules use PascalCase (e.g., `AlertTimeline.tsx`), hooks/utilities use camelCase (e.g., `useAlertsStore`). Keep server modules domain-focused and export typed DTOs from `src/lib`.

## Testing Guidelines
Unit and integration specs live beside services in `src/server/modules/*/__tests__` and use `*.test.ts` naming. Prefer Vitest with Testing Library for React logic, relying on happy-dom for browser APIs. When shipping a feature, extend Playwright coverage under `tests/e2e/*.spec.ts` to capture the user path. Target ≥80% coverage on touched code and update snapshots deliberately.

## Commit & Pull Request Guidelines
Follow Conventional Commit prefixes (`feat`, `fix`, `refactor`, `chore`) and scope titles to the touched module. Keep body text wrapped near 72 characters. PRs should state purpose, link the tracking ticket, include screenshots or Loom for UI changes, and confirm `pnpm lint`, `pnpm test`, and needed migrations. Call out risks or follow-up tasks before requesting review.

## Security & Configuration Tips
Copy `.env.example` to `.env.local` and provide secrets before `pnpm dev`. Keep credentials out of version control and store production values with the hosting provider. After Prisma changes, review `datadog-agent.yaml` to align alerting or metrics.
