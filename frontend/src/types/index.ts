export type ExpenseType = 'lodging' | 'airfare' | 'cab' | 'meals' | 'fuel' | 'parking' | 'train' | 'other';
export type ValidationStatus = 'AUTO_ACCEPTED' | 'NEEDS_REVIEW' | 'APPROVED' | 'REJECTED';
export type PolicyStatus = 'OK' | 'VIOLATION';
export type DuplicateStatus = 'CLEAN' | 'PROBABLE_DUPLICATE' | 'CONFIRMED_DUPLICATE';
export type ITCEligibility = 'ELIGIBLE' | 'BLOCKED_SECTION_17_5_B' | 'SLAB_INELIGIBLE' | 'MISSING_BUYER_GSTIN' | 'EXEMPT' | 'UNKNOWN';

export interface TaxLine {
  line_id?: string;
  description: string;
  hsn_sac?: string;
  taxable_amount: number;
  cgst_rate: number;
  cgst_amount: number;
  sgst_rate: number;
  sgst_amount: number;
  igst_rate: number;
  igst_amount: number;
  itc_eligibility: ITCEligibility;
  itc_reversal_reason?: string;
}

export interface AnomalyFlag {
  code: string;
  severity: 'INFO' | 'WARNING' | 'ERROR';
  message: string;
}

export interface Merchant {
  name: string;
  normalized_key?: string;
  gstin?: string;
  gstin_checksum_valid: boolean;
  address?: string;
  city?: string;
  state_code?: string;
  category?: string;
}

export interface Buyer {
  company_name?: string;
  gstin?: string;
  is_buyer_gstin_present: boolean;
  is_buyer_name_matched?: boolean;
}

export interface Expense {
  id: string;
  org_id: string;
  trip_id: string;
  document_id?: string;
  traveller_id?: string;
  traveller_name?: string;
  merchant: Merchant;
  buyer: Buyer;
  invoice_number?: string;
  receipt_number?: string;
  booking_reference?: string;
  transaction_date: string;
  expense_type: ExpenseType;
  original_currency: string;
  original_amount: number;
  base_currency: string;
  converted_amount: number;
  fx_rate: number;
  fx_date?: string;
  payment_method?: string;
  subtotal: number;
  tax_total: number;
  round_off?: number;
  tax_lines: TaxLine[];
  itc_claimable: number;
  itc_blocked: number;
  itc_status: string;
  document_confidence: number;
  field_confidences?: Record<string, number>;
  deterministic_math_passed: boolean;
  validation_status: ValidationStatus;
  policy_status: PolicyStatus;
  duplicate_status: DuplicateStatus;
  anomaly_flags: AnomalyFlag[];
  review_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at?: string;
}

export interface Trip {
  id: string;
  org_id: string;
  project_id?: string;
  project_title?: string;
  rfq_reference?: string;
  traveller_id: string;
  traveller_name: string;
  title: string;
  purpose: string;
  origin: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget_limit: number;
  total_spend: number;
  itc_claimable_total: number;
  itc_blocked_total: number;
  itc_at_risk_total: number;
  status: string;
  expense_count: number;
  created_at?: string;
}

export interface SuprocProject {
  id: string;
  org_id: string;
  rfq_reference: string;
  title: string;
  budget_amount: number;
  currency: string;
  status: string;
}

export interface DashboardSummary {
  total_spend_month: number;
  itc_eligible_month: number;
  itc_blocked_month: number;
  itc_at_risk_month: number;
  pending_review_count: number;
  duplicate_count: number;
  policy_violation_count: number;
  active_trips_count: number;
  active_projects_count: number;
}

export interface AuditEvent {
  id: string;
  org_id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  actor_user_id?: string;
  actor_name?: string;
  details: Record<string, any>;
  created_at: string;
}
