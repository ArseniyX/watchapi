# Schema Pattern Documentation

## Overview

This project uses a **schema-first approach** where Zod schemas serve as the single source of truth for both validation and TypeScript types.

## Benefits

✅ **Single Source of Truth** - Define once, use everywhere
✅ **Type Safety** - Automatic TypeScript type inference
✅ **Runtime Validation** - Zod validates at runtime
✅ **DRY Principle** - No duplicate type definitions
✅ **Better Error Messages** - Descriptive validation errors
✅ **Easy Refactoring** - Change schema, types update automatically

## File Structure

```
src/server/modules/[module]/
├── [module].schema.ts      ← Zod schemas + inferred types
├── [module].service.ts     ← Uses inferred types
├── [module].router.ts      ← Uses schemas for validation
├── [module].repository.ts
└── __tests__/
```

## Example Implementation

### 1. Create Schema File (`organization.schema.ts`)

```typescript
import { z } from "zod";

// Define Zod schema
export const createOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  slug: z.string().min(1, "Slug is required").optional(),
  description: z.string().optional(),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required").optional(),
  description: z.string().optional(),
});

// Infer TypeScript types from schemas
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
```

### 2. Use Types in Service (`organization.service.ts`)

```typescript
import {
  CreateOrganizationInput,
  UpdateOrganizationInput,
} from "./organization.schema";

export class OrganizationService {
  // Use inferred types - NO manual type definitions needed!
  async createOrganization(userId: string, data: CreateOrganizationInput) {
    // data is fully typed
    const slug = data.slug || this.generateSlug(data.name);
    // ...
  }

  async updateOrganization(
    userId: string,
    id: string,
    data: UpdateOrganizationInput,
  ) {
    // data is fully typed
    // ...
  }
}
```

### 3. Use Schemas in Router (`organization.router.ts`)

```typescript
import {
  createOrganizationSchema,
  updateOrganizationSchema,
} from "./organization.schema";

export const createOrganizationRouter = (service: OrganizationService) =>
  router({
    // Use schema directly for validation
    create: protectedProcedure
      .input(createOrganizationSchema) // ← Validates input
      .mutation(async ({ input, ctx }) => {
        // input is automatically typed!
        return service.createOrganization(ctx.user.id, input);
      }),

    update: protectedProcedure
      .input(z.object({ id: z.string() }).merge(updateOrganizationSchema))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        return service.updateOrganization(ctx.user.id, id, data);
      }),
  });
```

## Pattern Advantages

### Before (Manual Types)

```typescript
// ❌ Define types manually
export interface CreateOrganizationInput {
  name: string
  slug?: string
  description?: string
}

// ❌ Separate validation
async createOrganization(data: CreateOrganizationInput) {
  if (!data.name) throw new Error("Name required")
  if (data.name.length < 1) throw new Error("Name too short")
  // ...
}

// ❌ Duplicate schema in router
.input(z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
}))
```

### After (Schema-First)

```typescript
// ✅ Define schema once
export const createOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
})

// ✅ Infer type automatically
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>

// ✅ Use everywhere
async createOrganization(data: CreateOrganizationInput) {
  // Validation happens in router, type is guaranteed
}

// ✅ Use schema in router
.input(createOrganizationSchema)
```

## Common Patterns

### Optional Fields with Defaults

```typescript
export const createEndpointSchema = z.object({
  name: z.string().min(1),
  timeout: z.number().default(5000),
  interval: z.number().default(300000),
});
```

### Enums (Use Prisma Enums!)

```typescript
// ✅ CORRECT: Use Prisma enum as source of truth
import { OrganizationRole } from "@/generated/prisma";

export const updateMemberRoleSchema = z.object({
  role: z.nativeEnum(OrganizationRole), // ← Wraps Prisma enum
});

// ❌ WRONG: Don't duplicate enum definitions
export const updateMemberRoleSchema = z.object({
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]), // ← Now two sources of truth!
});

// Why use Prisma enums?
// 1. Database enforces enum at DB level
// 2. Single source of truth (schema.prisma)
// 3. TypeScript type safety from Prisma
// 4. Change once, updates everywhere
```

### Nested Objects

```typescript
export const createEndpointSchema = z.object({
  name: z.string(),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.string().optional(),
});
```

### Extending Schemas

```typescript
// Base schema
const baseSchema = z.object({ name: z.string() });

// Extended schema
const createSchema = baseSchema.extend({
  description: z.string().optional(),
});

// Or merge
const updateWithId = z.object({ id: z.string() }).merge(updateSchema);
```

## Migration Checklist

When applying this pattern to a module:

1. ✅ Create `[module].schema.ts`
2. ✅ Define Zod schemas
3. ✅ Export inferred types
4. ✅ Update service to use inferred types
5. ✅ Update router to use schemas
6. ✅ Remove old manual type definitions
7. ✅ Run tests to verify

## Applied To

- ✅ **organization** - Fully implemented with auto-slug generation
- ⏳ **collection** - TODO
- ⏳ **api-endpoint** - TODO
- ⏳ **monitoring** - TODO
- ⏳ **user** - TODO
- ⏳ **auth** - TODO

## Notes

- Schemas are the **single source of truth**
- Types are **automatically inferred**
- Validation happens **at runtime** in router
- TypeScript checks types **at compile time**
- Change schema once, everything updates
