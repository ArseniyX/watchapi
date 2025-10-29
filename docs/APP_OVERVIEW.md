# API Monitoring Platform Documentation

## Purpose

The API Monitoring Platform gives product and reliability teams a central
dashboard for tracking uptime, latency, and failure trends across critical API
endpoints. It pairs scheduled checks with alerting workflows so teams can spot
issues quickly and collaborate on remediation.

## Architecture Overview

- **Frontend:** Next.js 14 App Router with React Server Components, Tailwind CSS,
  and Radix UI primitives for a responsive dashboard experience.
- **API Layer:** tRPC routers under `src/server/modules/*` expose typed
  procedures backed by Prisma models. The schema-first pattern lives alongside
  services and repositories to keep validation, typing, and business logic
  tightly scoped.
- **Background Jobs:** Scheduler jobs (e.g., monitoring checks, alert fan-out)
  run inside the same workspace, toggled with the `ENABLE_CRON` environment
  flag.
- **Persistence:** Prisma ORM connects to the backing database and maintains
  model definitions in `prisma/schema.prisma`.
- **Observability:** Datadog agent configuration resides in `datadog-agent.yaml`
  to align metrics and alerting between infrastructure and application checks.

## Key Directories

```
src/
├── app/                 # App Router routes, layouts, and loading states
├── components/          # Reusable UI building blocks (charts, icons, menus)
├── emails/              # Transactional email templates
├── lib/                 # Shared utilities, DTOs, and themes
├── server/modules/      # Feature folders (router, service, repository, tests)
├── store/               # Client-side state stores (Zustand)
└── jobs/                # Background workers (cron, queues)
```

Additional notable paths:

- `prisma/` – Prisma schema, migrations, and seed helpers.
- `packages/cli/` – Automation CLI; run commands with `pnpm --filter cli <cmd>`.
- `tests/e2e/` – Playwright journeys covering critical flows.
- `docs/` – Project runbooks and architectural references (this folder).

## Environment & Configuration

1. Copy `.env.example` to `.env.local` and supply database, auth, email, and
   third-party keys.
2. Populate production secrets via the hosting provider; never commit real
   credentials.
3. Ensure `ENABLE_CRON`, email transport, and Datadog values are set before
   deploying scheduled jobs.

## Development Workflow

```bash
pnpm install        # Sync dependencies
pnpm dev            # Start Next.js dev server (http://localhost:3000)
pnpm lint           # ESLint rules
pnpm type-check     # TypeScript project references
pnpm test           # Vitest unit/integration suites
pnpm test:e2e       # Playwright journeys
pnpm build && pnpm start  # Production build + serve
```

Helpful tips:

- Run `pnpm pretty` before committing to apply Prettier formatting.
- Favor `rg` for code search to keep the monorepo fast.
- Background jobs require the `ENABLE_CRON` flag; disable locally if not needed.

## Testing Strategy

- **Unit & Integration:** Vitest specs live alongside modules in
  `src/server/modules/*/__tests__`. Target ≥80% coverage on touched code and
  keep schemas in sync with tests.
- **Component/UI:** Testing Library with happy-dom supports client logic.
- **End-to-End:** Playwright scripts under `tests/e2e/*.spec.ts` exercise core
  customer journeys. Use `pnpm test:e2e:headed` for debugging.

## Deployment Notes

- GitHub Actions workflow `.github/workflows/deploy.yml` builds the Next.js app
  and runs quality gates before releasing.
- Confirm `pnpm lint`, `pnpm test`, and any Prisma migrations have succeeded
  before merging.
- Review `datadog-agent.yaml` when schema or monitoring changes impact metrics.

## Additional Resources

- `README.md` – High-level project description and roadmap.
- `docs/SCHEMA_PATTERN.md` – Guidance on the schema-first module approach.
- `MANUAL_FLOWS.md` / `E2E_TEST_FLOWS.md` – Manual and automated validation
  checklists.
- `BACKEND.md` – Deep dive into server services and integrations.
- `MARKETING.md` – Landing page and messaging reference.

Keep this document updated as new modules, workflows, or infrastructure changes
land in the repository.
