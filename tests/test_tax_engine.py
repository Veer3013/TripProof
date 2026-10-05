import pytest
from backend.engine.tax_rules import (
    validate_gstin_format,
    validate_gstin_checksum,
    calculate_gstin_checksum,
    evaluate_hotel_room_itc,
    evaluate_line_item_itc,
    verify_tax_arithmetic
)
from backend.models.schemas import TaxLineSchema, ITCEligibilityEnum

def test_gstin_format():
    # Valid regex format
    assert validate_gstin_format("27AAACA1234A1ZK") is True
    assert validate_gstin_format("33AAACH7383J1ZF") is True
    assert validate_gstin_format("07AABCI4818H1ZN") is True
    
    # Invalid format
    assert validate_gstin_format("INVALID_GSTIN") is False
    assert validate_gstin_format("12345") is False
    assert validate_gstin_format(None) is False

def test_luhn_mod36_checksum():
    # True checksums calculated by Luhn Mod-36
    assert validate_gstin_checksum("27AAACA1234A1ZK") is True
    assert validate_gstin_checksum("33AAACH7383J1ZF") is True
    assert validate_gstin_checksum("07AABCI4818H1ZN") is True
    
    # Deliberate typo in 15th digit (OCR hallucination)
    assert validate_gstin_checksum("27AAACA1234A1Z9") is False
    assert validate_gstin_checksum("33AAACH7383J1Z0") is False

def test_post_sep2025_hotel_slabs():
    # Below Rs 1,000 -> Exempt
    rate, itc, reason = evaluate_hotel_room_itc(800.0, buyer_gstin_present=True)
    assert rate == 0.0
    assert itc == ITCEligibilityEnum.EXEMPT
    
    # Rs 1,001 - Rs 7,500 -> 5% No ITC (The Trap)
    rate, itc, reason = evaluate_hotel_room_itc(4500.0, buyer_gstin_present=True)
    assert rate == 5.0
    assert itc == ITCEligibilityEnum.SLAB_INELIGIBLE
    
    # Above Rs 7,500 -> 18% with ITC (when GSTIN present)
    rate, itc, reason = evaluate_hotel_room_itc(10000.0, buyer_gstin_present=True)
    assert rate == 18.0
    assert itc == ITCEligibilityEnum.ELIGIBLE
    
    # Above Rs 7,500 but missing buyer GSTIN -> Blocked
    rate, itc, reason = evaluate_hotel_room_itc(10000.0, buyer_gstin_present=False)
    assert rate == 18.0
    assert itc == ITCEligibilityEnum.MISSING_BUYER_GSTIN

def test_section_17_5_blocked_itc():
    # Food & beverage is blocked
    itc, _ = evaluate_line_item_itc("meals", "Dinner Buffet", 1200.0, True)
    assert itc == ITCEligibilityEnum.BLOCKED_SECTION_17_5_B
    
    # Cab is blocked
    itc, _ = evaluate_line_item_itc("cab", "Airport Ola Ride", 800.0, True)
    assert itc == ITCEligibilityEnum.BLOCKED_SECTION_17_5_B
    
    # Airfare with corporate GSTIN is eligible
    itc, _ = evaluate_line_item_itc("airfare", "Economy Airfare", 5000.0, True)
    assert itc == ITCEligibilityEnum.ELIGIBLE

def test_tax_arithmetic_verifier():
    lines = [
        TaxLineSchema(description="Room", taxable_amount=10000.0, cgst_amount=900.0, sgst_amount=900.0),
        TaxLineSchema(description="Food", taxable_amount=2000.0, cgst_amount=180.0, sgst_amount=180.0)
    ]
    # Sum: 12,000 + 2,160 = 14,160. Total: 14,160 -> True
    valid, _, _, _ = verify_tax_arithmetic(subtotal=12000.0, tax_lines=lines, total_amount=14160.0)
    assert valid is True
    
    # Math mismatch
    valid, _, _, expl = verify_tax_arithmetic(subtotal=12000.0, tax_lines=lines, total_amount=16000.0)
    assert valid is False
    assert "Math mismatch" in expl
