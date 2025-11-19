# GitHub Copilot Instructions for Kafkasder Panel

## 🎯 Overview

This repository is a modern non-profit association management system built with Next.js 16, React 19, and Convex.

## 💎 Premium Request Usage

**Important Update:** GitHub Copilot coding agent now uses fewer premium requests!

- ✅ **Each session uses just ONE premium request** (improved from previous usage)
- ✅ More cost-effective for all users
- ✅ Better resource optimization
- ✅ Allows more coding sessions per subscription

## 📚 Detailed Documentation

For comprehensive information about GitHub Copilot Agent Tasks in this repository, see:

- **[GITHUB_AGENT_TASK.md](../GITHUB_AGENT_TASK.md)** - Complete guide to using Copilot Agent Tasks
- **[CLAUDE.md](../CLAUDE.md)** - Repository-specific coding guidelines for AI assistants
- **[GEMINI.md](../GEMINI.md)** - Gemini CLI-specific features and integrations

## 🛠️ Quick Start for Copilot Tasks

### Creating Agent Tasks

Use the Agents Panel on GitHub.com to create tasks. Examples:

```
"Fix TypeScript errors in src/components"
"Update dependencies and fix breaking changes"
"Add JSDoc comments to API routes"
"Improve test coverage in src/lib"
```

### Best Practices

1. **Be Specific**: Clearly define what needs to be done
2. **Provide Context**: Include relevant error messages or file paths
3. **Keep Tasks Focused**: One task should address one specific issue
4. **Review PRs**: Always review Copilot-generated pull requests before merging

## 🏗️ Architecture Notes

- **Backend**: Convex (not Next.js API routes) - use Convex queries/mutations
- **Frontend**: Next.js 16 App Router with React 19
- **Styling**: Tailwind CSS 4 + Radix UI
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Auth**: Custom bcrypt-based authentication (not NextAuth)

## 🚨 Important Reminders

- **NO `console.log`** in production code - use `src/lib/logger.ts` instead
- **Convex functions** must use object syntax with `handler` property
- **Always validate** with Zod schemas from `src/lib/validations/`
- **Type safety** is enforced - TypeScript strict mode is enabled
- **Security first** - CSRF protection, rate limiting, input sanitization

## 🧪 Testing Commands

```bash
npm run typecheck    # TypeScript type checking
npm run lint         # ESLint
npm run test         # Unit tests
npm run test:e2e     # E2E tests
npm run build        # Production build
```

## 📝 Code Style

- Use TypeScript strict mode
- Prefer `const` over `let`, never `var`
- Use object shorthand
- Follow existing patterns in the codebase
- Add Zod validation for all inputs

## 🔗 Additional Resources

- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines
- [TESTING_GUIDE.md](../TESTING_GUIDE.md) - Comprehensive testing documentation
- [API_ROUTE_REFACTORING.md](../API_ROUTE_REFACTORING.md) - API architecture patterns

---

**Last Updated:** 2025-11-19

**Note:** This file provides guidance to GitHub Copilot when working on this repository. The premium request improvement (1 request per session) makes Copilot Agent Tasks more accessible and cost-effective for all contributors!
