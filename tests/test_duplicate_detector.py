import pytest
from backend.engine.duplicate_detector import compute_sha256, check_for_duplicates
from backend.models.schemas import ExpenseSchema, MerchantSchema, BuyerSchema, ExpenseTypeEnum, DuplicateStatusEnum

def test_sha256_hashing():
    data1 = b"Sample receipt content 123"
    data2 = b"Sample receipt content 123"
    data3 = b"Different content"
    
    hash1 = compute_sha256(data1)
    hash2 = compute_sha256(data2)
    hash3 = compute_sha256(data3)
    
    assert hash1 == hash2
    assert hash1 != hash3

def test_semantic_duplicate_detection():
    exp1 = ExpenseSchema(
        id="exp_01",
        org_id="org_01",
        trip_id="trip_01",
        traveller_id="usr_rahul",
        merchant=MerchantSchema(name="Ola Cabs", gstin="29AABCA2233J1Z8"),
        buyer=BuyerSchema(),
        transaction_date="2026-08-14",
        expense_type=ExpenseTypeEnum.CAB,
        original_amount=850.0,
        converted_amount=850.0
    )
    
    # Same details, same traveler -> Confirmed duplicate
    exp2 = ExpenseSchema(
        id="exp_02",
        org_id="org_01",
        trip_id="trip_01",
        traveller_id="usr_rahul",
        merchant=MerchantSchema(name="Ola Cabs", gstin="29AABCA2233J1Z8"),
        buyer=BuyerSchema(),
        transaction_date="2026-08-14",
        expense_type=ExpenseTypeEnum.CAB,
        original_amount=850.0,
        converted_amount=850.0
    )
    
    status, match_id, reason = check_for_duplicates(exp2, [exp1])
    assert status == DuplicateStatusEnum.CONFIRMED_DUPLICATE
    assert match_id == "exp_01"
    
    # Different date -> Clean
    exp3 = exp2.model_copy()
    exp3.id = "exp_03"
    exp3.transaction_date = "2026-08-15"
    status, _, _ = check_for_duplicates(exp3, [exp1])
    assert status == DuplicateStatusEnum.CLEAN
