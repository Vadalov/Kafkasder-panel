/**
 * Enhanced Beneficiary Types based on KafkasDer categorization system
 */

/**
 * Beneficiary Category - High-level need classification
 */
export type BeneficiaryCategory =
  | 'need_based_family' // İhtiyaç Sahibi Aile - Families requiring assistance
  | 'refugee_family' // Mülteci Aile - Refugee or displaced families
  | 'orphan_family'; // Yetim Ailesi - Families with orphaned children

/**
 * Beneficiary Type - Individual role in assistance
 */
export type BeneficiaryType =
  | 'primary_person' // İhtiyaç Sahibi Kişi - Primary beneficiary/head of household
  | 'dependent'; // Bakmakla Yükümlü Olunan Kişi - Dependent family member

/**
 * Relationship types for dependent beneficiaries
 */
export type RelationshipType =
  | 'spouse'
  | 'child'
  | 'parent'
  | 'sibling'
  | 'grandparent'
  | 'grandchild'
  | 'other';

/**
 * Application workflow stages
 */
export type ApplicationStage =
  | 'submission' // Application submitted
  | 'review' // Under review and verification
  | 'assignment' // Assignment decision made
  | 'delivery' // Aid delivery in progress
  | 'followup'; // Follow-up and monitoring

/**
 * Application status within each stage
 */
export type ApplicationStatus =
  | 'pending'
  | 'in_progress'
  | 'approved'
  | 'rejected'
  | 'on_hold'
  | 'completed';

/**
 * Category configuration for UI display
 */
export interface CategoryConfig {
  id: BeneficiaryCategory;
  label: string;
  labelTr: string;
  description: string;
  descriptionTr: string;
  icon: string;
  color: string;
}

export const BENEFICIARY_CATEGORIES: Record<BeneficiaryCategory, CategoryConfig> = {
  need_based_family: {
    id: 'need_based_family',
    label: 'Need-Based Family',
    labelTr: 'İhtiyaç Sahibi Aile',
    description: 'Families requiring financial or material assistance',
    descriptionTr: 'Maddi veya finansal yardıma ihtiyacı olan aileler',
    icon: 'Users',
    color: 'blue',
  },
  refugee_family: {
    id: 'refugee_family',
    label: 'Refugee Family',
    labelTr: 'Mülteci Aile',
    description: 'Refugee or displaced families',
    descriptionTr: 'Göç etmiş veya sığınmacı aileler',
    icon: 'Globe',
    color: 'orange',
  },
  orphan_family: {
    id: 'orphan_family',
    label: 'Orphan Family',
    labelTr: 'Yetim Ailesi',
    description: 'Families with orphaned children',
    descriptionTr: 'Öksüz/yetim çocuklu aileler',
    icon: 'Heart',
    color: 'red',
  },
};

/**
 * Type configuration for UI display
 */
export interface TypeConfig {
  id: BeneficiaryType;
  label: string;
  labelTr: string;
  description: string;
  descriptionTr: string;
}

export const BENEFICIARY_TYPES: Record<BeneficiaryType, TypeConfig> = {
  primary_person: {
    id: 'primary_person',
    label: 'Primary Person',
    labelTr: 'İhtiyaç Sahibi Kişi',
    description: 'Primary beneficiary or head of household',
    descriptionTr: 'Başvuru sahibi veya aile reisi',
  },
  dependent: {
    id: 'dependent',
    label: 'Dependent',
    labelTr: 'Bakmakla Yükümlü Olunan Kişi',
    description: 'Family member dependent on primary beneficiary',
    descriptionTr: 'Ana yararlanıcıya bağımlı aile üyesi',
  },
};

/**
 * Enhanced beneficiary with categorization
 */
export interface EnhancedBeneficiary {
  _id: string;
  _creationTime: number;
  name: string;
  tc_no: string;
  phone: string;
  email?: string;
  birth_date?: string;
  gender?: string;
  nationality?: string;

  // Enhanced categorization
  category?: BeneficiaryCategory;
  beneficiary_type?: BeneficiaryType;
  primary_beneficiary_id?: string;
  relationship?: RelationshipType;

  // Statistics
  application_count?: number;
  aid_count?: number;
  orphan_count?: number;
  dependent_count?: number;
  last_assignment?: string;

  // Location
  address: string;
  city: string;
  district: string;
  neighborhood: string;

  // Family composition
  family_size: number;
  children_count?: number;
  orphan_children_count?: number;
  elderly_count?: number;
  disabled_count?: number;

  // Status
  status: 'TASLAK' | 'AKTIF' | 'PASIF' | 'SILINDI';
  approval_status?: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
}

/**
 * Application workflow record
 */
export interface ApplicationWorkflow {
  _id: string;
  _creationTime: number;
  beneficiary_id: string;
  application_type: string;
  stage: ApplicationStage;
  status: ApplicationStatus;
  assigned_to?: string;
  notes?: string;
  documents?: string[];
  created_by: string;
  updated_by?: string;
  updated_at?: string;
  completed_at?: string;
}

/**
 * Dependent relationship record
 */
export interface DependentRelationship {
  _id: string;
  primary_beneficiary_id: string;
  dependent_beneficiary_id: string;
  relationship: RelationshipType;
  is_primary_caregiver: boolean;
  created_at: string;
}

/**
 * Filter options for beneficiary listing
 */
export interface BeneficiaryFilter {
  category?: BeneficiaryCategory[];
  beneficiary_type?: BeneficiaryType[];
  nationality?: string[];
  city?: string[];
  district?: string[];
  status?: ('TASLAK' | 'AKTIF' | 'PASIF' | 'SILINDI')[];
  approval_status?: ('pending' | 'approved' | 'rejected')[];
  age_min?: number;
  age_max?: number;
  application_count_min?: number;
  aid_count_min?: number;
  has_orphans?: boolean;
  search?: string;
}

/**
 * Utility functions
 */

export function getCategoryConfig(category: BeneficiaryCategory): CategoryConfig {
  return BENEFICIARY_CATEGORIES[category];
}

export function getTypeConfig(type: BeneficiaryType): TypeConfig {
  return BENEFICIARY_TYPES[type];
}

export function getCategoryLabel(
  category: BeneficiaryCategory,
  locale: 'en' | 'tr' = 'tr'
): string {
  const config = BENEFICIARY_CATEGORIES[category];
  return locale === 'tr' ? config.labelTr : config.label;
}

export function getTypeLabel(type: BeneficiaryType, locale: 'en' | 'tr' = 'tr'): string {
  const config = BENEFICIARY_TYPES[type];
  return locale === 'tr' ? config.labelTr : config.label;
}

export function getRelationshipLabel(
  relationship: RelationshipType,
  locale: 'en' | 'tr' = 'tr'
): string {
  const labels: Record<RelationshipType, { en: string; tr: string }> = {
    spouse: { en: 'Spouse', tr: 'Eş' },
    child: { en: 'Child', tr: 'Çocuk' },
    parent: { en: 'Parent', tr: 'Ebeveyn' },
    sibling: { en: 'Sibling', tr: 'Kardeş' },
    grandparent: { en: 'Grandparent', tr: 'Büyükanne/Büyükbaba' },
    grandchild: { en: 'Grandchild', tr: 'Torun' },
    other: { en: 'Other', tr: 'Diğer' },
  };
  return labels[relationship][locale];
}

export function isPrimaryBeneficiary(beneficiary: EnhancedBeneficiary): boolean {
  return !beneficiary.beneficiary_type || beneficiary.beneficiary_type === 'primary_person';
}

export function isDependent(beneficiary: EnhancedBeneficiary): boolean {
  return beneficiary.beneficiary_type === 'dependent';
}

export function hasOrphans(beneficiary: EnhancedBeneficiary): boolean {
  return (beneficiary.orphan_count ?? 0) > 0 || (beneficiary.orphan_children_count ?? 0) > 0;
}

export function calculateAge(birthDate: string): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}
