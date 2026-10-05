from __future__ import annotations
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class RoleEnum(str, Enum):
    TRAVELLER = "traveller"
    REVIEWER = "reviewer"
    FINANCE_ADMIN = "finance_admin"

class ExpenseTypeEnum(str, Enum):
    LODGING = "lodging"
    AIRFARE = "airfare"
    CAB = "cab"
    MEALS = "meals"
    FUEL = "fuel"
    PARKING = "parking"
    TRAIN = "train"
    OTHER = "other"

class ValidationStatusEnum(str, Enum):
    AUTO_ACCEPTED = "AUTO_ACCEPTED"
    NEEDS_REVIEW = "NEEDS_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class PolicyStatusEnum(str, Enum):
    OK = "OK"
    VIOLATION = "VIOLATION"

class DuplicateStatusEnum(str, Enum):
    CLEAN = "CLEAN"
    PROBABLE_DUPLICATE = "PROBABLE_DUPLICATE"
    CONFIRMED_DUPLICATE = "CONFIRMED_DUPLICATE"

class ITCEligibilityEnum(str, Enum):
    ELIGIBLE = "ELIGIBLE"
    BLOCKED_SECTION_17_5_B = "BLOCKED_SECTION_17_5_B"
    SLAB_INELIGIBLE = "SLAB_INELIGIBLE"
    MISSING_BUYER_GSTIN = "MISSING_BUYER_GSTIN"
    EXEMPT = "EXEMPT"
    UNKNOWN = "UNKNOWN"

# Tax Line Model
class TaxLineSchema(BaseModel):
    line_id: Optional[str] = None
    description: str = "Standard Line"
    hsn_sac: Optional[str] = None
    taxable_amount: float = 0.0
    cgst_rate: float = 0.0
    cgst_amount: float = 0.0
    sgst_rate: float = 0.0
    sgst_amount: float = 0.0
    igst_rate: float = 0.0
    igst_amount: float = 0.0
    itc_eligibility: ITCEligibilityEnum = ITCEligibilityEnum.ELIGIBLE
    itc_reversal_reason: Optional[str] = None

# Anomaly Flag Model
class AnomalyFlag(BaseModel):
    code: str
    severity: str = "WARNING"  # INFO, WARNING, ERROR
    message: str

# Merchant Model
class MerchantSchema(BaseModel):
    name: str
    normalized_key: Optional[str] = None
    gstin: Optional[str] = None
    gstin_checksum_valid: bool = False
    address: Optional[str] = None
    city: Optional[str] = None
    state_code: Optional[str] = None
    category: Optional[str] = None

# Buyer Model
class BuyerSchema(BaseModel):
    company_name: Optional[str] = None
    gstin: Optional[str] = None
    is_buyer_gstin_present: bool = False
    is_buyer_name_matched: bool = False

# Normalized Expense Model
class ExpenseSchema(BaseModel):
    id: str
    org_id: str
    trip_id: str
    document_id: Optional[str] = None
    traveller_id: Optional[str] = None
    traveller_name: Optional[str] = None
    merchant: MerchantSchema
    buyer: BuyerSchema
    invoice_number: Optional[str] = None
    receipt_number: Optional[str] = None
    booking_reference: Optional[str] = None
    transaction_date: str
    expense_type: ExpenseTypeEnum
    original_currency: str = "INR"
    original_amount: float
    base_currency: str = "INR"
    converted_amount: float
    fx_rate: float = 1.0
    fx_date: Optional[str] = None
    payment_method: str = "personal_card"
    
    subtotal: float = 0.0
    tax_total: float = 0.0
    round_off: float = 0.0
    tax_lines: List[TaxLineSchema] = Field(default_factory=list)
    
    itc_claimable: float = 0.0
    itc_blocked: float = 0.0
    itc_status: str = "UNKNOWN"
    
    document_confidence: float = 0.95
    field_confidences: Dict[str, float] = Field(default_factory=dict)
    deterministic_math_passed: bool = True
    
    validation_status: ValidationStatusEnum = ValidationStatusEnum.NEEDS_REVIEW
    policy_status: PolicyStatusEnum = PolicyStatusEnum.OK
    duplicate_status: DuplicateStatusEnum = DuplicateStatusEnum.CLEAN
    anomaly_flags: List[AnomalyFlag] = Field(default_factory=list)
    
    review_notes: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[str] = None
    created_at: Optional[str] = None

# Trip Model
class TripSchema(BaseModel):
    id: str
    org_id: str
    project_id: Optional[str] = None
    project_title: Optional[str] = None
    rfq_reference: Optional[str] = None
    traveller_id: str
    traveller_name: str
    title: str
    purpose: str
    origin: str
    destination: str
    start_date: str
    end_date: str
    budget_limit: float = 0.0
    total_spend: float = 0.0
    itc_claimable_total: float = 0.0
    itc_blocked_total: float = 0.0
    itc_at_risk_total: float = 0.0
    status: str = "open"
    expense_count: int = 0
    created_at: Optional[str] = None

# Suproc Project Model
class SuprocProjectSchema(BaseModel):
    id: str
    org_id: str
    rfq_reference: str
    title: str
    budget_amount: float
    currency: str = "INR"
    status: str = "active"

# Document Model
class DocumentSchema(BaseModel):
    id: str
    org_id: str
    trip_id: Optional[str] = None
    filename: str
    mime_type: str
    file_size_bytes: int
    sha256_hash: str
    perceptual_hash: Optional[str] = None
    storage_path: str
    source_channel: str = "upload"
    classification: Optional[str] = None
    created_at: Optional[str] = None

# Policy Config
class PolicyConfigSchema(BaseModel):
    max_daily_meals_cap: float = 2000.0
    max_hotel_nightly_cap: float = 5000.0
    require_receipt_above: float = 200.0
    prohibit_alcohol: bool = True
    trip_window_tolerance_days: int = 0
    require_buyer_gstin_for_itc: bool = True

# Review Correction Payload
class ReviewCorrectionPayload(BaseModel):
    merchant_name: Optional[str] = None
    merchant_gstin: Optional[str] = None
    transaction_date: Optional[str] = None
    original_amount: Optional[float] = None
    subtotal: Optional[float] = None
    tax_total: Optional[float] = None
    expense_type: Optional[ExpenseTypeEnum] = None
    tax_lines: Optional[List[TaxLineSchema]] = None
    notes: Optional[str] = None

# Audit Event
class AuditEventSchema(BaseModel):
    id: str
    org_id: str
    entity_type: str
    entity_id: str
    action: str
    actor_user_id: Optional[str] = "SYSTEM"
    actor_name: Optional[str] = "TripProof System"
    details: Dict[str, Any] = Field(default_factory=dict)
    created_at: str

# Executive Dashboard Summary KPI
class DashboardSummaryKPI(BaseModel):
    total_spend_month: float
    itc_eligible_month: float
    itc_blocked_month: float
    itc_at_risk_month: float
    pending_review_count: int
    duplicate_count: int
    policy_violation_count: int
    active_trips_count: int
    active_projects_count: int
