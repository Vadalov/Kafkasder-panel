/**
 * Tests for FamilyInfoStep component
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { useForm, FormProvider } from 'react-hook-form';
import { FamilyInfoStep } from '@/components/forms/beneficiary-steps/FamilyInfoStep';
import type { BeneficiaryFormData } from '@/lib/validations/beneficiary';

describe('FamilyInfoStep', () => {
  const renderWithForm = (defaultValues?: Partial<BeneficiaryFormData>) => {
    const methods = useForm<BeneficiaryFormData>({
      defaultValues: {
        firstName: '',
        lastName: '',
        nationality: 'TC',
        mernisCheck: false,
        category: 'individual',
        fundRegion: 'domestic',
        fileConnection: 'none',
        familyMemberCount: 0,
        children_count: 0,
        orphan_children_count: 0,
        elderly_count: 0,
        disabled_count: 0,
        ...defaultValues,
      } as BeneficiaryFormData,
    });

    const result = render(
      <FormProvider {...methods}>
        <FamilyInfoStep />
      </FormProvider>
    );

    return { ...result, methods };
  };

  it('should render the section title with icon', () => {
    renderWithForm();
    expect(screen.getByText('Aile Bilgileri')).toBeInTheDocument();
    expect(screen.getByText(/Aile Bilgileri/i).closest('.flex')).toContainHTML('Users');
  });

  it('should render family member count field', () => {
    renderWithForm();
    expect(screen.getByLabelText(/Aile Birey Sayısı/i)).toBeInTheDocument();
  });

  it('should render children count field', () => {
    renderWithForm();
    expect(screen.getByLabelText(/Çocuk Sayısı/i)).toBeInTheDocument();
  });

  it('should render orphan children count field', () => {
    renderWithForm();
    expect(screen.getByLabelText(/Yetim Çocuk Sayısı/i)).toBeInTheDocument();
  });

  it('should render elderly count field', () => {
    renderWithForm();
    expect(screen.getByLabelText(/Yaşlı Sayısı/i)).toBeInTheDocument();
  });

  it('should render disabled count field', () => {
    renderWithForm();
    expect(screen.getByLabelText(/Engelli Sayısı/i)).toBeInTheDocument();
  });

  it('should allow numeric input in family member count', async () => {
    const user = userEvent.setup();
    const { methods } = renderWithForm();

    const input = screen.getByLabelText(/Aile Birey Sayısı/i);
    await user.clear(input);
    await user.type(input, '5');

    expect(methods.getValues('familyMemberCount')).toBe(5);
  });

  it('should allow numeric input in children count', async () => {
    const user = userEvent.setup();
    const { methods } = renderWithForm();

    const input = screen.getByLabelText(/Çocuk Sayısı/i);
    await user.clear(input);
    await user.type(input, '3');

    expect(methods.getValues('children_count')).toBe(3);
  });

  it('should allow zero values', async () => {
    const user = userEvent.setup();
    const { methods } = renderWithForm();

    const input = screen.getByLabelText(/Aile Birey Sayısı/i);
    await user.clear(input);
    await user.type(input, '0');

    expect(methods.getValues('familyMemberCount')).toBe(0);
  });

  it('should have numeric input type for count fields', () => {
    renderWithForm();

    const familyInput = screen.getByLabelText(/Aile Birey Sayısı/i) as HTMLInputElement;
    const childrenInput = screen.getByLabelText(/Çocuk Sayısı/i) as HTMLInputElement;

    expect(familyInput.type).toBe('number');
    expect(childrenInput.type).toBe('number');
  });

  it('should display pre-filled values correctly', () => {
    renderWithForm({
      familyMemberCount: 6,
      children_count: 2,
      orphan_children_count: 1,
      elderly_count: 2,
      disabled_count: 0,
    });

    expect(screen.getByLabelText(/Aile Birey Sayısı/i)).toHaveValue(6);
    expect(screen.getByLabelText(/Çocuk Sayısı/i)).toHaveValue(2);
    expect(screen.getByLabelText(/Yetim Çocuk Sayısı/i)).toHaveValue(1);
    expect(screen.getByLabelText(/Yaşlı Sayısı/i)).toHaveValue(2);
    expect(screen.getByLabelText(/Engelli Sayısı/i)).toHaveValue(0);
  });

  it('should be wrapped in a Card component', () => {
    const { container } = renderWithForm();

    // Check for card-like structure (className patterns may vary)
    const cardElement = container.querySelector('[class*="card"]') ||
                        container.querySelector('[class*="border"]');
    expect(cardElement).toBeInTheDocument();
  });
});
