/**
 * Tests for useFormProgress hook
 */

import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFormProgress } from '@/components/kumbara/hooks/useFormProgress';

describe('useFormProgress', () => {
  describe('calculateProgress', () => {
    it('should return 0 when all fields are empty', () => {
      const { result } = renderHook(() => useFormProgress());
      const requiredFields = ['field1', 'field2', 'field3'];
      const values = { field1: '', field2: '', field3: '' };

      const progress = result.current.calculateProgress(values, requiredFields);
      expect(progress).toBe(0);
    });

    it('should return 100 when all fields are filled', () => {
      const { result } = renderHook(() => useFormProgress());
      const requiredFields = ['field1', 'field2', 'field3'];
      const values = { field1: 'value1', field2: 'value2', field3: 'value3' };

      const progress = result.current.calculateProgress(values, requiredFields);
      expect(progress).toBe(100);
    });

    it('should return 50 when half of the fields are filled', () => {
      const { result } = renderHook(() => useFormProgress());
      const requiredFields = ['field1', 'field2'];
      const values = { field1: 'value1', field2: '' };

      const progress = result.current.calculateProgress(values, requiredFields);
      expect(progress).toBe(50);
    });

    it('should return 33 when 1 of 3 fields are filled', () => {
      const { result } = renderHook(() => useFormProgress());
      const requiredFields = ['field1', 'field2', 'field3'];
      const values = { field1: 'value1', field2: '', field3: '' };

      const progress = result.current.calculateProgress(values, requiredFields);
      expect(progress).toBe(33); // Rounded
    });

    it('should treat 0 as a valid filled value', () => {
      const { result } = renderHook(() => useFormProgress());
      const requiredFields = ['amount', 'count'];
      const values = { amount: 0, count: 0 };

      const progress = result.current.calculateProgress(values, requiredFields);
      expect(progress).toBe(100); // 0 is a valid number
    });

    it('should treat false as a valid filled value', () => {
      const { result } = renderHook(() => useFormProgress());
      const requiredFields = ['isActive', 'isVerified'];
      const values = { isActive: false, isVerified: false };

      const progress = result.current.calculateProgress(values, requiredFields);
      expect(progress).toBe(100); // false is a valid boolean
    });

    it('should treat null and undefined as empty', () => {
      const { result } = renderHook(() => useFormProgress());
      const requiredFields = ['field1', 'field2', 'field3', 'field4'];
      const values = { field1: null, field2: undefined, field3: '', field4: 'value' };

      const progress = result.current.calculateProgress(values, requiredFields);
      expect(progress).toBe(25); // Only field4 is filled
    });

    it('should handle empty required fields array', () => {
      const { result } = renderHook(() => useFormProgress());
      const requiredFields: string[] = [];
      const values = { field1: 'value' };

      const progress = result.current.calculateProgress(values, requiredFields);
      expect(progress).toBe(0); // No required fields = 0% (avoid division by zero)
    });

    it('should handle missing fields in values object', () => {
      const { result } = renderHook(() => useFormProgress());
      const requiredFields = ['field1', 'field2', 'field3'];
      const values = { field1: 'value1' }; // field2 and field3 missing

      const progress = result.current.calculateProgress(values, requiredFields);
      expect(progress).toBe(33); // Only 1 out of 3 filled
    });

    it('should round progress to nearest integer', () => {
      const { result } = renderHook(() => useFormProgress());
      const requiredFields = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
      const values = { a: '1', b: '2', c: '', d: '', e: '', f: '', g: '' };

      const progress = result.current.calculateProgress(values, requiredFields);
      // 2/7 = 28.57%, should round to 29
      expect(progress).toBe(29);
    });
  });

  describe('memoization', () => {
    it('should return stable function reference', () => {
      const { result, rerender } = renderHook(() => useFormProgress());
      const firstCalculateProgress = result.current.calculateProgress;

      rerender();

      expect(result.current.calculateProgress).toBe(firstCalculateProgress);
    });
  });
});
