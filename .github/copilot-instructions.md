# GitHub Copilot Instructions for Kafkasder Panel

## Project Overview

**Kafkasder Panel** is a modern non-profit association management system built with:
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Backend**: Convex (serverless database) or Appwrite
- **UI**: Tailwind CSS 4 + Radix UI components
- **State Management**: Zustand + TanStack Query
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Authentication**: Custom bcrypt-based system

## Core Principles

### 1. Type Safety First
- **NEVER use `any` type** - Use proper TypeScript types or `unknown`
- Enable strict mode in TypeScript
- Use Zod schemas for runtime validation
- Type all function parameters and return values

### 2. Logging Standards
- **NEVER use `console.log`** - Always use `@/lib/logger`
  ```typescript
  import { logger } from '@/lib/logger';
  logger.info('User logged in', { userId });
  logger.error('Failed to save', error, { context });
  ```

### 3. Validation Requirements
- **ALL inputs must be validated** with Zod schemas
- Use existing validation schemas from `@/lib/validations/`
- Validate both client-side and server-side
  ```typescript
  import { beneficiarySchema } from '@/lib/validations/beneficiary';
  const result = beneficiarySchema.safeParse(data);
  if (!result.success) {
    return errorResponse(result.error, 400);
  }
  ```

### 4. Code Style
- Prefer `const` over `let` (never use `var`)
- Use object shorthand: `{ name }` instead of `{ name: name }`
- Mark unused variables with `_` prefix: `const _unused = ...`
- Maximum line length: 100 characters
- Follow ESLint and Prettier rules

## Architecture Patterns

### Backend Structure

#### Convex Functions (if using Convex)
```typescript
import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// Query pattern
export const list = query({
  args: { 
    status: v.optional(v.string()),
    page: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Implementation
    return results;
  },
});

// Mutation pattern
export const create = mutation({
  args: {
    name: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    // Implementation
    return createdId;
  },
});
```

#### API Routes Pattern
```typescript
// src/app/api/[resource]/route.ts
import { buildApiRoute } from '@/lib/api/middleware';
import { resourceSchema } from '@/lib/validations/resource';

export const GET = buildApiRoute({
  requireModule: 'resourceName',
  allowedMethods: ['GET'],
  rateLimit: { maxRequests: 100, windowMs: 60000 },
})(async (request) => {
  const { searchParams } = new URL(request.url);
  const params = normalizeQueryParams(searchParams);
  const response = await convexResource.list(params);
  return successResponse(response);
});

export const POST = buildApiRoute({
  requireModule: 'resourceName',
  allowedMethods: ['POST'],
  rateLimit: { maxRequests: 20, windowMs: 60000 },
})(async (request) => {
  const { data, error } = await parseBody(request);
  if (error) return errorResponse(error, 400);
  
  const validated = resourceSchema.safeParse(data);
  if (!validated.success) {
    return errorResponse(validated.error, 400);
  }
  
  const created = await convexResource.create(validated.data);
  return successResponse(created, 'Created', 201);
});
```

### Frontend Patterns

#### Form Pattern
```typescript
import { useStandardForm } from '@/hooks/useStandardForm';
import { resourceSchema } from '@/lib/validations/resource';
import { resources } from '@/lib/api/crud-factory';

function ResourceForm({ initialData, onSuccess }) {
  const form = useStandardForm({
    defaultValues: initialData || { name: '', status: 'active' },
    schema: resourceSchema,
    mutationFn: initialData
      ? (data) => resources.update(initialData._id, data)
      : resources.create,
    queryKey: ['resources'],
    onSuccess,
    resetOnSuccess: !initialData,
  });

  return (
    <form onSubmit={form.handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

#### API Client Usage
```typescript
import { resources } from '@/lib/api/crud-factory';

// List with filters
const { data } = await resources.getAll({ 
  filters: { status: 'active' },
  page: 1,
  limit: 20 
});

// Get by ID
const item = await resources.getById(id);

// Create
const newItem = await resources.create({ name: 'New Item' });

// Update
await resources.update(id, { name: 'Updated' });

// Delete
await resources.delete(id);
```

#### Component Pattern
```typescript
import type { ComponentProps } from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function Button({ 
  label, 
  onClick, 
  variant = 'primary',
  disabled = false 
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'px-4 py-2 rounded',
        variant === 'primary' && 'bg-blue-500 text-white',
        variant === 'secondary' && 'bg-gray-200 text-gray-800',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {label}
    </button>
  );
}
```

## Path Aliases

Always use path aliases instead of relative paths:

```typescript
@/*              → ./src/*
@/components/*   → ./src/components/*
@/lib/*          → ./src/lib/*
@/hooks/*        → ./src/hooks/*
@/stores/*       → ./src/stores/*
@/types/*        → ./src/types/*
@/convex/*       → ./convex/* (if using Convex)
```

## Adding New Features

### 1. New Resource/Entity

1. **Schema** - Define in `convex/schema.ts` (if using Convex)
   ```typescript
   myResource: defineTable({
     name: v.string(),
     status: v.string(),
     createdAt: v.number(),
   }).index('by_status', ['status']);
   ```

2. **Convex Functions** - Create `convex/myResource.ts`
   - `list` query
   - `get` query
   - `create` mutation
   - `update` mutation
   - `delete` mutation

3. **Validation Schema** - Create `src/lib/validations/myResource.ts`
   ```typescript
   import { z } from 'zod';
   export const myResourceSchema = z.object({
     name: z.string().min(1),
     status: z.enum(['active', 'inactive']),
   });
   ```

4. **API Route** - Create `src/app/api/myResource/route.ts`
   - Use `buildApiRoute` middleware
   - Implement GET, POST, PUT, DELETE handlers

5. **API Client** - Add to `src/lib/api/crud-factory.ts`
   ```typescript
   export const myResource = createCrudOperations<MyResource>('myResource', 'myResource');
   ```

6. **Types** - Add to `src/types/database.ts` or create `src/types/myResource.ts`

### 2. New Component

1. Create component in appropriate directory:
   - `src/components/ui/` - Basic UI components
   - `src/components/forms/` - Form components
   - `src/components/[feature]/` - Feature-specific components

2. Use TypeScript for props
3. Add JSDoc comments for complex components
4. Export from index file if in a directory

### 3. New Hook

1. Create in `src/hooks/`
2. Use TypeScript generics when appropriate
3. Follow naming: `use[FeatureName]`
4. Document with JSDoc

## Security Best Practices

1. **CSRF Protection** - Always enabled via middleware
2. **Rate Limiting** - Configure per endpoint
3. **Input Sanitization** - Use `@/lib/sanitization` (DOMPurify)
4. **Authentication** - Check via `requireModuleAccess`
5. **Audit Logging** - Log important actions

## Testing

### Unit Tests
```typescript
// src/__tests__/lib/myFunction.test.ts
import { describe, it, expect } from 'vitest';
import { myFunction } from '@/lib/myFunction';

describe('myFunction', () => {
  it('should work correctly', () => {
    expect(myFunction(input)).toBe(expected);
  });
});
```

### E2E Tests
```typescript
// e2e/feature.spec.ts
import { test, expect } from '@playwright/test';

test('feature works', async ({ page }) => {
  await page.goto('/feature');
  await expect(page.locator('h1')).toContainText('Feature');
});
```

## Common Commands

```bash
# Development
npm run dev              # Next.js dev server
npm run convex:dev       # Convex backend (if using)

# Code Quality
npm run typecheck        # TypeScript check
npm run lint             # ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Prettier format

# Testing
npm run test             # Unit tests (watch)
npm run test:run         # Unit tests (once)
npm run test:e2e         # E2E tests

# Build
npm run build            # Production build
```

## Error Handling

Always use proper error handling:

```typescript
try {
  const result = await someOperation();
  return successResponse(result);
} catch (error) {
  logger.error('Operation failed', error, { context });
  return errorResponse(
    error instanceof Error ? error.message : 'Unknown error',
    500
  );
}
```

## Documentation References

- **[CLAUDE.md](../CLAUDE.md)** - Complete AI assistant guide with detailed patterns
- **[docs/api-patterns.md](../docs/api-patterns.md)** - API route standards
- **[docs/testing.md](../docs/testing.md)** - Testing guidelines
- **[CONTRIBUTING.md](../CONTRIBUTING.md)** - Contribution guidelines
- **[SECURITY.md](../SECURITY.md)** - Security policies

## Important Files

| File | Purpose |
|------|---------|
| `convex/schema.ts` | Database schema (if using Convex) |
| `src/lib/api/crud-factory.ts` | API client factory |
| `src/lib/api/middleware.ts` | API route middleware |
| `src/lib/validations/` | Zod validation schemas |
| `src/hooks/useStandardForm.ts` | Standard form hook |
| `src/stores/authStore.ts` | Authentication state |
| `src/lib/logger.ts` | Logging utility |

## Code Review Checklist

When generating code, ensure:
- ✅ No `console.log` statements
- ✅ All inputs validated with Zod
- ✅ TypeScript types properly defined
- ✅ Error handling implemented
- ✅ Logging added for important operations
- ✅ Path aliases used (`@/...`)
- ✅ Follows existing patterns
- ✅ Tests added for new features

## Turkish Language Support

This project uses Turkish language for:
- UI labels and messages
- Database field names (when appropriate)
- Comments and documentation (mixed Turkish/English)

When adding new features, maintain consistency with existing Turkish terminology.

---

**Remember**: Always follow existing patterns. When in doubt, check similar implementations in the codebase.