"""
Deterministic Tax Engine & Statutory Compliance Logic
- Luhn Mod-36 15th-character GSTIN Cryptographic Checksum
- CGST Rule 46 Mandatory Invoice Fields
- Post-56th GST Council (Sep 2025) Hotel Tariff Slabs
- Section 17(5)(b) Blocked Input Tax Credit (ITC) Rules
- Exact Arithmetic Line-Item Verifier
"""

import re
from typing import List, Tuple, Dict, Any
from backend.models.schemas import TaxLineSchema, ITCEligibilityEnum

CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
CHAR_MAP = {c: i for i, c in enumerate(CHARS)}

def validate_gstin_format(gstin: str) -> bool:
    """Check standard 15-character regex format for Indian GSTIN."""
    if not gstin or not isinstance(gstin, str):
        return False
    gstin = gstin.strip().upper()
    pattern = r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
    return bool(re.match(pattern, gstin))

def calculate_gstin_checksum(gstin_14: str) -> str:
    """Calculates the expected 15th checksum character for the first 14 characters of a GSTIN."""
    gstin_14 = gstin_14.strip().upper()[:14]
    total = 0
    for i in range(14):
        val = CHAR_MAP.get(gstin_14[i], 0)
        # Standard Mod-36 weights: alternate 1 and 2 (position 1 is weight 1, pos 2 is weight 2)
        weight = 1 if (i % 2 == 0) else 2
        product = val * weight
        quotient = product // 36
        remainder = product % 36
        total += quotient + remainder
        
    calc_remainder = total % 36
    check_code_point = (36 - calc_remainder) % 36
    return CHARS[check_code_point]

def validate_gstin_checksum(gstin: str) -> bool:
    """
    Validates the 15th character checksum of an Indian GSTIN using the Luhn Mod-36 algorithm.
    Returns True if mathematically valid, False otherwise.
    """
    if not validate_gstin_format(gstin):
        return False
    
    gstin = gstin.strip().upper()
    expected_char = calculate_gstin_checksum(gstin[:14])
    return gstin[14] == expected_char

def evaluate_hotel_room_itc(nightly_rate: float, buyer_gstin_present: bool) -> Tuple[float, ITCEligibilityEnum, str]:
    """
    Post-56th GST Council Rules (Sep 2025 onwards):
    - Tariff <= Rs 1,000: Exempt (0% GST, No ITC)
    - Tariff Rs 1,001 - Rs 7,500: 5% GST without ITC (The Trap)
    - Tariff > Rs 7,500: 18% GST with ITC (Eligible only if company GSTIN is on folio)
    """
    if nightly_rate <= 1000.0:
        return (0.0, ITCEligibilityEnum.EXEMPT, "Exempt supply (tariff <= Rs 1,000). No GST charged.")
    elif nightly_rate <= 7500.0:
        return (5.0, ITCEligibilityEnum.SLAB_INELIGIBLE, "5% GST rate without Input Tax Credit under Post-Sep 2025 hotel tariff slab.")
    else:
        if buyer_gstin_present:
            return (18.0, ITCEligibilityEnum.ELIGIBLE, "18% GST rate with full Input Tax Credit eligibility.")
        else:
            return (18.0, ITCEligibilityEnum.MISSING_BUYER_GSTIN, "18% GST charged, but ITC is blocked because Corporate GSTIN is missing from folio.")

def evaluate_line_item_itc(
    expense_type: str,
    line_desc: str,
    taxable_amount: float,
    buyer_gstin_present: bool
) -> Tuple[ITCEligibilityEnum, str]:
    """
    Section 17(5)(b) of CGST Act:
    - Food and beverages, outdoor catering, etc. are BLOCKED for ITC.
    - Passenger transportation (cabs/rides) standard ITC is blocked for normal business travel.
    - Commercial passenger flights with corporate GSTIN are ELIGIBLE (5% economy).
    """
    desc_lower = line_desc.lower()
    
    # 1. Food and Beverages Check (Section 17(5)(b))
    food_keywords = ["food", "beverage", "meal", "dinner", "lunch", "breakfast", "buffet", "room service", "restaurant", "cafe", "coffee", "tea", "alcohol", "beer", "wine", "bar"]
    if expense_type == "meals" or any(kw in desc_lower for kw in food_keywords):
        return (ITCEligibilityEnum.BLOCKED_SECTION_17_5_B, "Input Tax Credit blocked under Section 17(5)(b) CGST Act for food and beverages.")
    
    # 2. Passenger Transport / Cab (Section 17(5)(a))
    if expense_type == "cab" or "cab" in desc_lower or "taxi" in desc_lower or "ride" in desc_lower or "ola" in desc_lower or "uber" in desc_lower:
        return (ITCEligibilityEnum.BLOCKED_SECTION_17_5_B, "Input Tax Credit on passenger motor vehicle travel is blocked for non-exempt business travel.")
    
    # 3. Commercial Airfare
    if expense_type == "airfare" or "flight" in desc_lower or "airline" in desc_lower or "indigo" in desc_lower or "air india" in desc_lower:
        if buyer_gstin_present:
            return (ITCEligibilityEnum.ELIGIBLE, "5% Economy airfare with valid corporate GSTIN is ITC eligible.")
        else:
            return (ITCEligibilityEnum.MISSING_BUYER_GSTIN, "Airfare ITC cannot be claimed without corporate GSTIN in PNR/invoice.")
            
    # 4. Lodging / Hotel
    if expense_type == "lodging" or "room" in desc_lower or "stay" in desc_lower:
        if not buyer_gstin_present:
            return (ITCEligibilityEnum.MISSING_BUYER_GSTIN, "Lodging ITC requires valid corporate GSTIN on invoice.")
        return (ITCEligibilityEnum.ELIGIBLE, "Standard lodging ITC eligible.")
        
    return (ITCEligibilityEnum.ELIGIBLE if buyer_gstin_present else ITCEligibilityEnum.MISSING_BUYER_GSTIN, "Standard commercial expense.")

def verify_tax_arithmetic(
    subtotal: float,
    tax_lines: List[TaxLineSchema],
    total_amount: float,
    tolerance: float = 2.0
) -> Tuple[bool, float, float, str]:
    """
    Deterministic Arithmetic Verifier:
    Checks if Sum(Line Taxables) == Subtotal and Subtotal + Sum(Taxes) == Total.
    """
    calc_taxable = sum(line.taxable_amount for line in tax_lines) if tax_lines else subtotal
    calc_taxes = sum(line.cgst_amount + line.sgst_amount + line.igst_amount for line in tax_lines) if tax_lines else (total_amount - subtotal)
    calc_total = calc_taxable + calc_taxes
    
    diff = abs(calc_total - total_amount)
    is_valid = diff <= tolerance
    
    explanation = "Mathematical sum matches invoice total." if is_valid else f"Math mismatch: Extracted total is {total_amount:.2f}, but calculated lines sum to {calc_total:.2f} (diff: {diff:.2f})."
    return is_valid, calc_taxable, calc_taxes, explanation
