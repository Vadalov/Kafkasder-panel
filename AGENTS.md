# AGENTS.md - Dernek Yönetim Sistemi Development Guide

## Build & Test Commands

- **Dev server:** `npm run dev` (Next.js on port 3000)
- **Build:** `npm run build`
- **Lint:** `npm run lint:check` | Fix: `npm run lint:fix`
- **Format:** `npm run format:check` | Fix: `npm run format`
- **Type check:** `npm run typecheck`
- **Unit tests:** `npm test` (Vitest) | Single test: `npm test -- src/__tests__/file.test.ts`
- **E2E tests:** `npm run e2e` (Playwright) | Watch: `npm run e2e --ui`
- **Coverage:** `npm run test:coverage`
- **Convex:** `npm run convex:dev` (backend database)

## Architecture & Codebase Structure

**Next.js 16 + React 19 + Convex** - Turkish non-profit management platform.

**Key directories:**

- `src/app/` - Next.js App Router (pages, API routes)
- `src/components/` - React UI components (ui/ for Radix UI base, layouts/ for page structures)
- `src/lib/` - Utilities (validation, formatters, API clients)
- `src/hooks/` - Custom React hooks
- `src/stores/` - Zustand state management
- `src/types/` - TypeScript type definitions
- `src/__tests__/` - Unit tests with mocks
- `convex/` - Convex backend: schema, queries, mutations (see schema.ts for 15+ tables)
- `e2e/` - Playwright end-to-end tests
- `docs/` - Documentation

**Core modules:** Users/Auth (RBAC), Beneficiaries, Donations, Scholarships, Finance, Tasks, Meetings, Messaging, Analytics, System Settings.

**Database:** Convex (real-time sync). Tables: users, beneficiaries, donations, scholarships, finance_records, tasks, meetings, messages, audit_logs, etc.

**Key APIs:** TanStack Query (caching), Zustand (client state), Sentry (error tracking).

## Code Style & Guidelines

**TypeScript:** Strict mode enabled. Use `const` (ESLint enforces `prefer-const`), avoid `var`, no `any` except tests/scripts.

**Imports:** Use path aliases (`@/*`, `@/components/*`, `@/lib/*`, etc. from tsconfig.json). Order: external packages → relative imports.

**Formatting:** Prettier (100 char line width, 2 spaces, single quotes, trailing commas, semicolons).

**Components:** React functional components, hooks-based. Radix UI for accessible components. Tailwind CSS for styling.

**Validation:** Zod for all form/API inputs. CSRF protection on forms. Input sanitization with DOMPurify.

**Error handling:** Custom error types in `convex/errors.ts`. Use try-catch, validate responses, log with Sentry.

**Naming:** camelCase for vars/functions, PascalCase for components/types, SCREAMING_SNAKE_CASE for constants.

**Conventions:** Tests in `__tests__/` or `.test.ts`/`.spec.ts` files. Convex files in `convex/` follow object syntax with validators.

**Special:** Codacy rules enforced (see `.cursor/rules/codacy.mdc`) - run `codacy_cli_analyze` after edits.
