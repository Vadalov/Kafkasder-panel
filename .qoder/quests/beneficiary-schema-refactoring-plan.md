# Beneficiary Schema Refactoring Plan

## Current State

### File: `src/lib/validations/beneficiary.ts` (498 lines)

**Duplicated Validators (Lines 37-93):**

- `tcKimlikNoSchema` - TC Identity validation with algorithm
- `phoneSchema` - Phone number validation
- `emailSchema` - Email validation
- `pastDateSchema` - Past date validation
- `calculateAge` - Age calculation helper

**Duplication with `shared-validators.ts`:**
These validators are duplicates of:

- `tcKimlikNoSchema` → `shared-validators.ts:tcKimlikNoSchema`
- `phoneSchema` → `shared-validators.ts:phoneSchema`
- `emailSchema` → `shared-validators.ts:emailSchema`
- `pastDateSchema` → `shared-validators.ts:dateSchema`
- Turkish name validation patterns → `shared-validators.ts:turkishNameSchema`

## Schemas to Refactor

### 1. Quick Add Schema (Lines 96-128)

**Current:** 33 lines with local validators  
**Target:** ~15 lines using shared validators  
**Savings:** ~18 lines (55%)

### 2. Main Beneficiary Schema (Lines 131-498)

**Current:** 367 lines with duplicated field validations  
**Target:** ~200 lines using shared validators  
**Savings:** ~167 lines (45%)

## Refactoring Steps

### Phase 1: Replace Local Validators (v1.1.0)

```typescript
// BEFORE (current):
const tcKimlikNoSchema = z
  .string()
  .length(11, 'TC Kimlik No 11 haneli olmalıdır')
  .regex(/^\d{11}$/, 'TC Kimlik No sadece rakam içermelidir')
  .refine((value) => {
    /* algorithm */
  }, 'Geçersiz TC Kimlik No');

// AFTER (proposed):
import {
  tcKimlikNoSchema,
  phoneSchema,
  emailSchema,
  dateSchema,
  turkishNameSchema,
  addressSchema,
  citySchema,
  districtSchema,
  neighborhoodSchema,
} from './shared-validators';
```

### Phase 2: Refactor Quick Add Schema

```typescript
// BEFORE:
export const quickAddBeneficiarySchema = z.object({
  firstName: z
    .string()
    .min(2, 'Ad en az 2 karakter olmalıdır')
    .max(50, 'Ad en fazla 50 karakter olmalıdır')
    .regex(/^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/, 'Ad sadece harf içerebilir'),
  lastName: z
    .string()
    .min(2, 'Soyad en az 2 karakter olmalıdır')
    .max(50, 'Soyad en fazla 50 karakter olmalıdır')
    .regex(/^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/, 'Soyad sadece harf içerebilir'),
  // ... more duplicated fields
});

// AFTER:
export const quickAddBeneficiarySchema = z.object({
  firstName: turkishNameSchema,
  lastName: turkishNameSchema,
  nationality: nationalitySchema,
  birthDate: dateSchema.optional(),
  identityNumber: tcKimlikNoSchema.optional(),
  mobilePhone: phoneSchema.optional(),
  email: emailSchema,
  // ... clean and concise
});
```

### Phase 3: Refactor Main Schema

**Fields to Replace:**

1. **Name Fields** (4 occurrences)
   - `firstName`, `lastName`, `fatherName`, `motherName`
   - Replace with `turkishNameSchema`

2. **Phone Fields** (3 occurrences)
   - `mobilePhone`, `landlinePhone`, `internationalPhone`
   - Replace with `phoneSchema`

3. **Address Fields** (5 occurrences)
   - `address`, `city`, `district`, `neighborhood`, `country`
   - Replace with `addressSchema`, `citySchema`, `districtSchema`, etc.

4. **Identity Fields**
   - `identityNumber`, `passportNumber`, `refugeeNumber`
   - Replace with `tcKimlikNoSchema` or create specialized validators

## Estimated Impact

### Code Reduction

- **Current Total:** 498 lines
- **After Refactoring:** ~290 lines
- **Lines Saved:** ~208 lines (42% reduction)

### Maintainability Benefits

1. **Single Source of Truth**
   - All validation rules in `shared-validators.ts`
   - Changes propagate to all forms automatically

2. **Consistency**
   - Same validation messages across all forms
   - Uniform error handling

3. **Testing**
   - Validators tested once in `shared-validators.test.ts`
   - No need to duplicate tests

4. **Readability**
   - Schemas become declaration of structure
   - Less implementation noise

## Implementation Priority

**Status:** Deferred to v1.1.0  
**Priority:** Medium  
**Estimated Effort:** 2-3 hours  
**Risk:** Low (backward compatible)

### Recommended Approach

1. Create feature branch `refactor/beneficiary-schemas`
2. Replace validators incrementally
3. Run full test suite after each change
4. Update any form components using the schemas
5. Verify all beneficiary forms work correctly
6. Deploy to staging for QA testing
7. Merge to main after approval

## Related Files to Update

After refactoring `beneficiary.ts`, these files may need updates:

- `src/components/forms/AdvancedBeneficiaryForm.tsx`
- `src/components/forms/BeneficiaryFormWizard.tsx`
- `src/app/(dashboard)/yardim/ihtiyac-sahipleri/[id]/page.tsx`
- `src/app/(dashboard)/yardim/ihtiyac-sahipleri/yeni/page.tsx`

## Testing Checklist

- [ ] Quick add form validation
- [ ] Full beneficiary form validation
- [ ] Edit existing beneficiary
- [ ] TC Kimlik No algorithm validation
- [ ] Phone number format validation
- [ ] Email validation
- [ ] Date validation
- [ ] Address validation
- [ ] Form submission with valid data
- [ ] Form submission with invalid data
- [ ] Error message display
- [ ] All beneficiary types (refugee, local, etc.)

## Notes

This refactoring will significantly improve code maintainability and reduce duplication by ~40%. The work is well-suited for v1.1.0 as it requires careful testing but provides clear benefits without changing functionality.

## References

- Atomic Validators: `src/lib/validations/shared-validators.ts`
- Original Schema: `src/lib/validations/beneficiary.ts`
- Design Document: `.qoder/quests/full-code-review.md` (Section 3.1)
- TODO Tracking: `docs/TODO.md` (v1.1.0 Quality Improvements)
