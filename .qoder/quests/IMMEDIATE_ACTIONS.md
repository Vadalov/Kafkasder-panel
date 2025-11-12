# Immediate Actions Required

**Date:** November 12, 2025  
**Priority:** CRITICAL

## ⚠️ Type Check Required

After enabling TypeScript strict mode, you MUST run type checking:

```bash
npm run typecheck
```

**Expected:** TypeScript errors will appear due to `noImplicitAny: true`

**Action:** Fix errors one by one, or temporarily disable strict mode for gradual migration.

---

## 🔧 Quick Fixes Needed

### 1. Update Shared Validators Export

Add to `src/lib/validations/index.ts` (or create if missing):

```typescript
export * from './shared-validators';
export * from './beneficiary';
export * from './task';
export * from './message';
// ... other validators
```

### 2. Test Account Lockout

```bash
# Test the login route
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrong"}'

# Repeat 5 times to trigger lockout
```

### 3. Update Password Validation in Forms

For any password change/registration forms, import and use:

```typescript
import { validatePasswordStrength } from '@/lib/auth/password-strength';
import { passwordSchema } from '@/lib/validations/shared-validators';

// In your form
const schema = z.object({
  password: passwordSchema,
  // ...
});

// For real-time feedback
const handlePasswordChange = (value: string) => {
  const result = validatePasswordStrength(value);
  setPasswordFeedback(result.feedback);
  setPasswordScore(result.score);
};
```

---

## 🚨 Breaking Change Warning

**Password Requirements Changed**

**Before:** 6+ characters  
**After:** 8+ chars, uppercase, lowercase, number, special character

**Impact:**

- New user registrations will require strong passwords
- Existing users can still login with old passwords
- On password change, new requirements apply

**Mitigation:**

1. Add password strength indicator to UI
2. Show requirements clearly
3. Consider grace period for existing users

---

## ✅ Verification Steps

Run these commands to verify changes:

```bash
# 1. Type check
npm run typecheck

# 2. Lint check
npm run lint

# 3. Run tests
npm test

# 4. Build check
npm run build
```

**Expected Results:**

- Type check: May show errors (fix gradually)
- Lint: Should pass
- Tests: Should pass
- Build: Should succeed

---

## 📝 Next Steps Priority Order

### Today (2-3 hours)

1. ✅ **Run type checker** - identify TypeScript errors
2. ✅ **Fix critical type errors** - focus on breaking changes
3. ✅ **Test login flow** - verify account lockout works
4. ✅ **Update one form** - test `useStandardForm` hook

### Tomorrow (3-4 hours)

5. 🔄 **Replace analytics mock data** - use real Convex queries
6. 🔄 **Replace financial mock data** - connect to real data
7. 🔄 **Add password strength UI** - show requirements to users

### This Week (4-6 hours)

8. 🔄 **Fix accessibility issues** - ARIA labels, keyboard nav
9. 🔄 **Refactor validations** - use atomic validators
10. 🔄 **Update documentation** - reflect changes

---

## 🐛 Known Issues to Monitor

### 1. TypeScript Strict Mode

**Issue:** May break existing code with implicit `any` types  
**Solution:** Fix incrementally, use `// @ts-expect-error` temporarily  
**Status:** Expected

### 2. Account Lockout Memory Store

**Issue:** Lockout data stored in memory (lost on restart)  
**Solution:** Move to Redis/Database in production  
**Status:** TODO for production

### 3. Password Validation on Existing Users

**Issue:** Old weak passwords still work  
**Solution:** Force password change on next login (optional)  
**Status:** Design decision needed

---

## 🔄 Rollback Instructions

If critical issues arise:

### Rollback TypeScript Strict Mode

```bash
git checkout HEAD -- tsconfig.json
```

### Disable Account Lockout

In `src/app/api/auth/login/route.ts`:

```typescript
// Comment out these lines:
// if (isAccountLocked(email)) { ... }
// recordLoginAttempt(email, false);
// recordLoginAttempt(email, true);
```

### Revert Password Requirements

In password forms:

```typescript
// Use weak schema temporarily
import { weakPasswordSchema } from '@/lib/validations/shared-validators';
```

---

## 📞 Support

**Issues?** Check:

1. Implementation summary: `.qoder/quests/implementation-summary.md`
2. Design document: `.qoder/quests/full-code-review.md`
3. Code comments in new files

**Questions?**

- Review atomic validators: `src/lib/validations/shared-validators.ts`
- Check form hook usage: `src/hooks/useStandardForm.ts`
- See lockout logic: `src/lib/auth/account-lockout.ts`

---

## ✨ Quick Wins

Use these immediately for benefits:

### 1. Simplify Any Form

```typescript
// Before: 50+ lines of boilerplate
const form = useForm({ ... });
const mutation = useMutation({ ... });
// ... lots of error handling

// After: 5 lines
const { form, handleSubmit, isSubmitting } = useStandardForm({
  schema: mySchema,
  mutationFn: myMutation,
  queryKey: ['myData'],
});
```

### 2. Reuse Validation

```typescript
// Before: Define phone validation everywhere
const phoneSchema = z.string().regex(/.../).optional();

// After: Import once
import { phoneSchema } from '@/lib/validations/shared-validators';
```

### 3. Password Strength in UI

```typescript
import { validatePasswordStrength, getPasswordStrengthLabel, getPasswordStrengthColor } from '@/lib/auth/password-strength';

const { score, feedback } = validatePasswordStrength(password);
<div className={getPasswordStrengthColor(score)}>
  {getPasswordStrengthLabel(score)}
</div>
```

---

**Last Updated:** November 12, 2025  
**Status:** Phase 1 Partially Complete (5/12 tasks done)
