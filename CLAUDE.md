# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

API Monitoring Platform - A Next.js application for monitoring API endpoints with real-time performance tracking, alerting, and team collaboration. Built with tRPC for type-safe APIs and Prisma ORM with SQLite (dev) / PostgreSQL (prod).

## Commands

### Development
```bash
pnpm dev              # Start Next.js dev server on localhost:3000
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
```

### Testing
```bash
pnpm test             # Run tests in watch mode
pnpm test:run         # Run tests once
pnpm test:ui          # Open Vitest UI
```

### Database (Prisma)
```bash
npx prisma generate   # Generate Prisma client (outputs to src/generated/prisma)
npx prisma migrate dev # Create and apply migrations
npx prisma studio     # Open database GUI
npx prisma db push    # Push schema changes without migrations (dev only)
```

## Architecture

### Backend Structure (tRPC + Prisma)

The backend follows a modular architecture with domain-driven design:

```
src/server/
├── app.ts                  # Main tRPC router aggregating all modules
├── trpc.ts                 # tRPC config, context, procedures (publicProcedure, protectedProcedure, adminProcedure)
├── database/               # Prisma client initialization
├── scheduler.ts            # node-cron scheduler for monitoring checks (runs when ENABLE_CRON=true)
└── modules/
    ├── shared/
    │   ├── base.repository.ts   # Abstract base class for repositories
    │   └── email.service.ts     # Email notifications via nodemailer
    └── [domain]/
        ├── index.ts             # Module initialization and exports
        ├── [domain].router.ts   # tRPC router with procedures
        ├── [domain].service.ts  # Business logic
        └── [domain].repository.ts  # Data access layer (extends BaseRepository)
```

**Module Pattern**: Each domain module (user, auth, api-endpoint, monitoring, collection, organization) has:
- **Router**: tRPC procedures (query/mutation) with input validation (Zod schemas)
- **Service**: Business logic, orchestrates repositories, handles domain rules
- **Repository**: Direct Prisma queries, data access only (extends BaseRepository)

**Key Modules**:
- `auth`: JWT-based authentication, bcrypt password hashing, OAuth support (GitHub, Google)
- `api-endpoint`: CRUD for API endpoints to monitor (HTTP method, headers, intervals, expected status)
- `monitoring`: Executes checks against endpoints, records results (status, response time, errors)
- `collection`: Groups related API endpoints
- `organization`: Multi-tenancy with team management and role-based access

### Frontend Structure (Next.js App Router)

```
src/app/
├── page.tsx                # Landing page (marketing site)
├── layout.tsx              # Root layout with providers
├── (auth)/                 # Auth route group (login, signup)
├── app/                    # Dashboard application
│   ├── page.tsx           # Dashboard overview
│   ├── collections/       # API collections management
│   ├── monitoring/        # Real-time monitoring views
│   ├── analytics/         # Analytics and reporting
│   ├── alerts/            # Alert configuration
│   └── team/              # Team management
└── privacy/, terms/       # Legal pages

src/components/
├── ui/                    # shadcn/ui base components (Button, Card, Dialog, etc.)
├── *-chart.tsx           # Recharts visualizations
├── app-sidebar.tsx       # Dashboard navigation
└── [feature].tsx         # Landing page sections (hero, features, pricing, etc.)
```

**State Management**:
- tRPC React Query hooks for server state (`trpc.apiEndpoint.getAll.useQuery()`)
- Zustand for client state (if needed)
- React Hook Form + Zod for form handling

### Database Schema (Prisma)

**Custom Configuration**: Prisma client generated to `src/generated/prisma` (not default `node_modules/.prisma`). Import from `@/generated/prisma`, not `@prisma/client`.

**Core Models**:
- `User` → Authentication (local/OAuth), role-based access (USER, ADMIN, SUPER_ADMIN)
- `Organization` → Multi-tenancy with OrganizationMember for team access
- `Collection` → Logical grouping of API endpoints
- `ApiEndpoint` → URLs to monitor with configuration (method, headers, interval, timeout)
- `MonitoringCheck` → Check execution results (status, response time, errors)
- `Alert` → Alert rules with conditions (response time, status code, uptime)
- `AlertNotification` → Notification channels (email, webhook, Slack, Discord)

**Key Relationships**:
- ApiEndpoint → MonitoringCheck (one-to-many): each endpoint has historical check results
- ApiEndpoint → Alert (one-to-many): multiple alert rules per endpoint
- Organization → ApiEndpoint (one-to-many): endpoints belong to organizations
- Collection → ApiEndpoint (one-to-many): collections group endpoints

### Authentication & Authorization

**JWT-based**: Tokens issued by auth module, validated in tRPC context (trpc.ts)

**Procedures**:
- `publicProcedure`: No authentication required
- `protectedProcedure`: Requires valid JWT, ctx.user available
- `adminProcedure`: Requires ADMIN or SUPER_ADMIN role

**Context**: JWT payload decoded in `createTRPCContext`, user object attached to context for protected routes.

### Monitoring System

**Scheduler** (`scheduler.ts`):
- Runs every minute to check active API endpoints
- Auto-starts when `ENABLE_CRON=true` in environment
- Daily cleanup job removes checks older than 30 days

**Check Execution** (`monitoring.service`):
- Fetches active endpoints, executes HTTP requests
- Records: status (SUCCESS/FAILURE/TIMEOUT/ERROR), response time, status code, errors
- Triggers alerts when conditions met

### Import Paths

**Absolute imports** use `@/` prefix:
- `@/components/ui/button` → src/components/ui/button
- `@/lib/utils` → src/lib/utils
- `@/server/app` → src/server/app
- `@/generated/prisma` → src/generated/prisma (Prisma client)

### Environment Variables

Key variables (see `.env.example`):
- `DATABASE_URL`: SQLite (dev) or PostgreSQL (prod)
- `JWT_SECRET`: For JWT token signing
- `ENABLE_CRON`: Set to "true" to enable monitoring scheduler
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET`: For NextAuth.js
- OAuth: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- `DEFAULT_CHECK_INTERVAL`, `MAX_TIMEOUT`: Monitoring defaults

### Testing

- **Framework**: Vitest with happy-dom environment
- **Location**: Tests colocated in `__tests__` directories within modules
- **Pattern**: Service layer tests (business logic), not full integration tests
- **Setup**: `vitest.setup.mjs` for global test configuration
