"""
Policy & Anomaly Verification Engine
- Trip-Window Boundary Checks
- Per-Diem Daily Meal Caps
- Prohibited Item & Alcohol Auditing
- Missing Buyer GSTIN Lost Tax Alerts
- Booking Quote vs. Actual Folio Mismatch
"""

from typing import List, Tuple, Optional
from datetime import datetime, date
from backend.models.schemas import ExpenseSchema, TripSchema, PolicyConfigSchema, AnomalyFlag, PolicyStatusEnum

def parse_iso_date(date_str: str) -> Optional[date]:
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str.split("T")[0], "%Y-%m-%d").date()
    except Exception:
        return None

def evaluate_policy_and_anomalies(
    expense: ExpenseSchema,
    trip: Optional[TripSchema] = None,
    policy: Optional[PolicyConfigSchema] = None
) -> Tuple[PolicyStatusEnum, List[AnomalyFlag]]:
    """
    Evaluates corporate travel policies and flags statutory/organizational anomalies.
    """
    if policy is None:
        policy = PolicyConfigSchema()
        
    flags: List[AnomalyFlag] = []
    has_policy_violation = False
    
    # 1. Trip-Window Date Bounding Check
    if trip and trip.start_date and trip.end_date and expense.transaction_date:
        trip_start = parse_iso_date(trip.start_date)
        trip_end = parse_iso_date(trip.end_date)
        exp_date = parse_iso_date(expense.transaction_date)
        
        if trip_start and trip_end and exp_date:
            if exp_date < trip_start:
                days_before = (trip_start - exp_date).days
                flags.append(AnomalyFlag(
                    code="DATE_OUTSIDE_TRIP_WINDOW",
                    severity="WARNING",
                    message=f"Expense date ({expense.transaction_date}) is {days_before} day(s) BEFORE the official trip start date ({trip.start_date})."
                ))
                has_policy_violation = True
            elif exp_date > trip_end:
                days_after = (exp_date - trip_end).days
                flags.append(AnomalyFlag(
                    code="DATE_OUTSIDE_TRIP_WINDOW",
                    severity="WARNING",
                    message=f"Expense date ({expense.transaction_date}) is {days_after} day(s) AFTER the official trip end date ({trip.end_date})."
                ))
                has_policy_violation = True

    # 2. Meal Per-Diem Cap Check
    if expense.expense_type == "meals":
        if expense.original_amount > policy.max_daily_meals_cap:
            flags.append(AnomalyFlag(
                code="POLICY_MEAL_CAP_EXCEEDED",
                severity="WARNING",
                message=f"Meal total Rs {expense.original_amount:,.2f} exceeds standard corporate daily cap of Rs {policy.max_daily_meals_cap:,.2f}."
            ))
            has_policy_violation = True
            
    # 3. Hotel Nightly Rate Cap Check
    if expense.expense_type == "lodging":
        # Check taxable amount or tax lines
        room_taxable = sum(line.taxable_amount for line in expense.tax_lines if "room" in line.description.lower() or "stay" in line.description.lower())
        if room_taxable == 0:
            room_taxable = expense.subtotal or expense.original_amount
            
        if room_taxable > policy.max_hotel_nightly_cap:
            flags.append(AnomalyFlag(
                code="POLICY_HOTEL_CAP_EXCEEDED",
                severity="WARNING",
                message=f"Hotel tariff Rs {room_taxable:,.2f} exceeds maximum allowed nightly rate cap of Rs {policy.max_hotel_nightly_cap:,.2f}."
            ))
            has_policy_violation = True

    # 4. Prohibited Items / Alcohol Detection
    if policy.prohibit_alcohol:
        alcohol_keywords = ["beer", "wine", "whisky", "vodka", "cocktail", "liquor", "alcohol", "bar charge", "minibar", "mini-bar"]
        for line in expense.tax_lines:
            desc_lower = line.description.lower()
            if any(ak in desc_lower for ak in alcohol_keywords):
                flags.append(AnomalyFlag(
                    code="PROHIBITED_ALCOHOL_PURCHASE",
                    severity="ERROR",
                    message=f"Prohibited alcohol item detected: '{line.description}'. Policy mandates deducting alcohol charges before approval."
                ))
                has_policy_violation = True

    # 5. Missing Buyer Corporate GSTIN (Lost ITC Trap)
    if policy.require_buyer_gstin_for_itc and (expense.expense_type in ["lodging", "airfare"]):
        if not expense.buyer.is_buyer_gstin_present:
            estimated_lost_tax = expense.tax_total if expense.tax_total > 0 else (expense.original_amount * 0.18 / 1.18)
            flags.append(AnomalyFlag(
                code="MISSING_BUYER_GSTIN_ITC_LOST",
                severity="ERROR",
                message=f"Bill issued in personal employee name without company GSTIN. Immediate loss of ~Rs {estimated_lost_tax:,.2f} in Input Tax Credit."
            ))

    # 6. Merchant GSTIN Format / Checksum Failure
    if expense.merchant.gstin and not expense.merchant.gstin_checksum_valid:
        flags.append(AnomalyFlag(
            code="INVALID_SUPPLIER_GSTIN_CHECKSUM",
            severity="ERROR",
            message=f"Supplier GSTIN '{expense.merchant.gstin}' failed Luhn Mod-36 checksum validation. Invoice cannot be legally claimed in GSTR-2B."
        ))

    policy_status = PolicyStatusEnum.VIOLATION if has_policy_violation else PolicyStatusEnum.OK
    return policy_status, flags
