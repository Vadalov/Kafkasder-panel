/**
 * Form completion progress tracking hook
 * Extracted from KumbaraForm for reusability
 */

import { useMemo } from 'react';
import { useWatch, type Control } from 'react-hook-form';

interface UseFormProgressOptions<T> {
  control: Control<T>;
  requiredFieldNames: readonly (keyof T)[];
}

export function useFormProgress<T>({ control, requiredFieldNames }: UseFormProgressOptions<T>) {
  const watchedFields = useWatch({
    control,
    name: requiredFieldNames as any,
  });

  const progress = useMemo(() => {
    const fieldValues = Array.isArray(watchedFields) ? watchedFields : [watchedFields];

    const completedFields = fieldValues.filter((value) => {
      return value !== undefined && value !== null && value !== '';
    });

    return Math.round((completedFields.length / requiredFieldNames.length) * 100);
  }, [watchedFields, requiredFieldNames]);

  return progress;
}
