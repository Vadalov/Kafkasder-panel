# GitHub Copilot Instructions for Kafkasder Panel

## Project Overview

**Kafkasder Panel** is a modern non-profit association management system built with:
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Backend**: Appwrite (serverless backend platform)
- **UI**: Tailwind CSS 4 + Radix UI components
- **State Management**: Zustand + TanStack Query
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Authentication**: Appwrite Auth + Custom bcrypt-based system

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

#### Appwrite Configuration
```typescript
// src/lib/appwrite/config.ts
import { appwriteConfig, getCollectionId } from '@/lib/appwrite/config';

// Collection IDs are defined in appwriteConfig.collections
const collectionId = getCollectionId('beneficiaries');
```

#### Appwrite Client Usage

**Client-side (Browser):**
```typescript
// src/lib/appwrite/client.ts
import { client, databases, storage } from '@/lib/appwrite/client';

// List documents
const response = await databases.listDocuments(
  databaseId,
  collectionId,
  [Query.limit(10), Query.equal('status', 'active')]
);
```

**Server-side (API Routes):**
```typescript
// src/lib/appwrite/server.ts
import { serverClient, getServerDatabases } from '@/lib/appwrite/server';
import { appwriteConfig, getCollectionId } from '@/lib/appwrite/config';
import { Query } from 'appwrite';

const databases = getServerDatabases();
const collectionId = getCollectionId('beneficiaries');

// List documents
const response = await databases.listDocuments(
  appwriteConfig.databaseId,
  collectionId,
  [Query.limit(10), Query.equal('status', 'active')]
);
```

#### Appwrite API Helper Pattern
```typescript
// Use the unified API helper from src/lib/appwrite/api.ts
import {
  listDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
} from '@/lib/appwrite/api';
import { appwriteConfig } from '@/lib/appwrite/config';

// List
const { documents, total } = await listDocuments('beneficiaries', {
  limit: 20,
  page: 1,
  status: 'active',
});

// Get by ID
const document = await getDocument('beneficiaries', documentId);

// Create
const newDoc = await createDocument('beneficiaries', {
  name: 'John Doe',
  status: 'active',
});

// Update
const updated = await updateDocument('beneficiaries', documentId, {
  name: 'Jane Doe',
});

// Delete
await deleteDocument('beneficiaries', documentId);
```

#### API Routes Pattern
```typescript
// src/app/api/[resource]/route.ts
import { buildApiRoute } from '@/lib/api/middleware';
import { resourceSchema } from '@/lib/validations/resource';
import {
  listDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
} from '@/lib/appwrite/api';

export const GET = buildApiRoute({
  requireModule: 'resourceName',
  allowedMethods: ['GET'],
  rateLimit: { maxRequests: 100, windowMs: 60000 },
})(async (request) => {
  const { searchParams } = new URL(request.url);
  const params = normalizeQueryParams(searchParams);
  const { documents, total } = await listDocuments('resourceName', params);
  return successResponse({ data: documents, total });
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
  
  const created = await createDocument('resourceName', validated.data);
  return successResponse(created, 'Created', 201);
});

export const PUT = buildApiRoute({
  requireModule: 'resourceName',
  allowedMethods: ['PUT'],
  rateLimit: { maxRequests: 20, windowMs: 60000 },
})(async (request) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return errorResponse('ID required', 400);
  
  const { data, error } = await parseBody(request);
  if (error) return errorResponse(error, 400);
  
  const validated = resourceSchema.safeParse(data);
  if (!validated.success) {
    return errorResponse(validated.error, 400);
  }
  
  const updated = await updateDocument('resourceName', id, validated.data);
  return successResponse(updated);
});

export const DELETE = buildApiRoute({
  requireModule: 'resourceName',
  allowedMethods: ['DELETE'],
  rateLimit: { maxRequests: 10, windowMs: 60000 },
})(async (request) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return errorResponse('ID required', 400);
  
  await deleteDocument('resourceName', id);
  return successResponse(null, 'Deleted', 200);
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
      ? (data) => resources.update(initialData.$id, data)
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

// Get by ID (Appwrite uses $id)
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
@/stores/*        → ./src/stores/*
@/types/*        → ./src/types/*
```

## Appwrite Collections

Collections are defined in `src/lib/appwrite/config.ts`. Available collections:

- **User Management**: `users`, `userSessions`, `twoFactorSettings`, `trustedDevices`
- **Core**: `beneficiaries`, `dependents`, `consents`, `bankAccounts`
- **Aid/Donations**: `donations`, `aidApplications`, `scholarships`, `scholarshipApplications`, `scholarshipPayments`
- **Finance**: `financeRecords`
- **Communication**: `messages`, `communicationLogs`, `workflowNotifications`
- **Meetings & Tasks**: `meetings`, `meetingDecisions`, `meetingActionItems`, `tasks`
- **Partners**: `partners`
- **Documents**: `files`, `documentVersions`
- **Security/Audit**: `securityEvents`, `auditLogs`, `rateLimitLog`
- **System**: `systemSettings`, `themePresets`, `parameters`

Use `getCollectionId('collectionName')` to get the collection ID.

## Adding New Features

### 1. New Resource/Entity

1. **Add Collection ID** - Update `src/lib/appwrite/config.ts`
   ```typescript
   collections: {
     // ... existing collections
     myResource: 'my_resource',
   }
   ```

2. **Create Appwrite Collection** - In Appwrite Console:
   - Create collection with ID matching config
   - Add attributes (fields)
   - Set permissions
   - Create indexes if needed

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
   - Use `listDocuments`, `getDocument`, `createDocument`, `updateDocument`, `deleteDocument` from `@/lib/appwrite/api`
   - Implement GET, POST, PUT, DELETE handlers

5. **API Client** - Add to `src/lib/api/crud-factory.ts`
   ```typescript
   export const myResource = createCrudOperations<MyResource>('myResource', 'myResource');
   ```

6. **Types** - Add to `src/types/database.ts` or create `src/types/myResource.ts`
   - Note: Appwrite documents have `$id`, `$createdAt`, `$updatedAt` fields

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

## Appwrite Query Patterns

```typescript
import { Query } from 'appwrite';

// Limit results
Query.limit(10)

// Pagination
Query.offset(20)  // Skip first 20

// Filtering
Query.equal('status', 'active')
Query.notEqual('status', 'inactive')
Query.greaterThan('amount', 100)
Query.lessThan('amount', 1000)
Query.between('amount', 100, 1000)

// Search
Query.search('name', 'john')

// Ordering
Query.orderAsc('createdAt')
Query.orderDesc('createdAt')

// Multiple conditions
[
  Query.equal('status', 'active'),
  Query.greaterThan('amount', 100),
  Query.orderDesc('createdAt'),
  Query.limit(10),
]
```

## Security Best Practices

1. **CSRF Protection** - Always enabled via middleware
2. **Rate Limiting** - Configure per endpoint
3. **Input Sanitization** - Use `@/lib/sanitization` (DOMPurify)
4. **Authentication** - Check via `requireModuleAccess`
5. **Appwrite Permissions** - Set collection permissions in Appwrite Console
6. **API Key Security** - Never expose `APPWRITE_API_KEY` to client
7. **Audit Logging** - Log important actions

## Environment Variables

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your-database-id
APPWRITE_API_KEY=your-api-key  # Server-side only

# Storage Buckets
NEXT_PUBLIC_APPWRITE_BUCKET_DOCUMENTS=documents
NEXT_PUBLIC_APPWRITE_BUCKET_AVATARS=avatars
NEXT_PUBLIC_APPWRITE_BUCKET_RECEIPTS=receipts
```

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

## Appwrite Document Structure

Appwrite documents automatically include:
- `$id` - Document ID
- `$createdAt` - Creation timestamp
- `$updatedAt` - Update timestamp
- `$collectionId` - Collection ID
- `$databaseId` - Database ID
- `$permissions` - Permission array

Always use `$id` instead of `id` when working with Appwrite documents.

## Documentation References

- **[CLAUDE.md](../CLAUDE.md)** - Complete AI assistant guide with detailed patterns
- **[docs/api-patterns.md](../docs/api-patterns.md)** - API route standards
- **[docs/appwrite-migration.md](../docs/appwrite-migration.md)** - Appwrite migration guide
- **[docs/appwrite-mcp-guide.md](../docs/appwrite-mcp-guide.md)** - Appwrite MCP integration
- **[docs/testing.md](../docs/testing.md)** - Testing guidelines
- **[CONTRIBUTING.md](../CONTRIBUTING.md)** - Contribution guidelines
- **[SECURITY.md](../SECURITY.md)** - Security policies

## Important Files

| File | Purpose |
|------|---------|
| `src/lib/appwrite/config.ts` | Appwrite configuration and collection IDs |
| `src/lib/appwrite/client.ts` | Client-side Appwrite SDK |
| `src/lib/appwrite/server.ts` | Server-side Appwrite SDK (with API key) |
| `src/lib/appwrite/api.ts` | Unified Appwrite API helper functions |
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
- ✅ Appwrite collection IDs from config
- ✅ Use `$id` for document IDs (not `id`)
- ✅ Follows existing patterns
- ✅ Tests added for new features

## Turkish Language Support

This project uses Turkish language for:
- UI labels and messages
- Database field names (when appropriate)
- Comments and documentation (mixed Turkish/English)

When adding new features, maintain consistency with existing Turkish terminology.

---

**Remember**: Always follow existing patterns. When in doubt, check similar implementations in the codebase. Use Appwrite's Query builder for efficient database queries.