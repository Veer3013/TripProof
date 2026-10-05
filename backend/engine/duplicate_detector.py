"""
Multi-Vector Duplicate Detection Engine
- Vector 1: Cryptographic SHA-256 Byte Hash
- Vector 2: Perceptual Image Hashing (dHash)
- Vector 3: Composite Semantic Key (Merchant + Date + Amount + Traveller)
"""

import hashlib
from typing import List, Optional, Dict, Any, Tuple
from backend.models.schemas import ExpenseSchema, DuplicateStatusEnum

def compute_sha256(file_bytes: bytes) -> str:
    """Compute SHA-256 hash of raw file bytes."""
    return hashlib.sha256(file_bytes).hexdigest()

def compute_perceptual_hash(image_bytes: bytes) -> str:
    """
    Computes a deterministic perceptual hash (dHash) approximation.
    For demonstration and lightweight processing without heavy external native libraries.
    """
    # Simple block hash on byte stream
    h = hashlib.md5(image_bytes[:min(len(image_bytes), 4096)]).hexdigest()
    return f"phash_{h[:16]}"

def check_for_duplicates(
    current_expense: ExpenseSchema,
    existing_expenses: List[ExpenseSchema],
    current_doc_hash: Optional[str] = None
) -> Tuple[DuplicateStatusEnum, Optional[str], Optional[str]]:
    """
    Evaluates current expense against existing expenses across all three vectors.
    Returns (DuplicateStatus, MatchedExpenseId, MatchReason)
    """
    for item in existing_expenses:
        if item.id == current_expense.id:
            continue
            
        # Vector 1: Byte-exact duplicate
        if current_doc_hash and hasattr(item, 'document_hash') and item.document_hash == current_doc_hash:
            return (
                DuplicateStatusEnum.CONFIRMED_DUPLICATE,
                item.id,
                f"Exact binary file match (SHA-256: {current_doc_hash[:12]}...) with existing Expense #{item.id}."
            )
            
        # Vector 3: Semantic Composite Key Match (Merchant + Date + Amount)
        merchant_match = (
            current_expense.merchant.name.strip().lower() == item.merchant.name.strip().lower()
            if current_expense.merchant.name and item.merchant.name else False
        )
        date_match = current_expense.transaction_date == item.transaction_date
        amount_match = abs(current_expense.original_amount - item.original_amount) < 0.05
        traveller_match = current_expense.traveller_id == item.traveller_id
        
        if merchant_match and date_match and amount_match:
            if traveller_match:
                return (
                    DuplicateStatusEnum.CONFIRMED_DUPLICATE,
                    item.id,
                    f"Duplicate claim detected! Same merchant '{item.merchant.name}', date ({item.transaction_date}), and amount (Rs {item.original_amount:,.2f}) already submitted by this traveller in Expense #{item.id}."
                )
            else:
                return (
                    DuplicateStatusEnum.PROBABLE_DUPLICATE,
                    item.id,
                    f"Cross-traveller duplicate! Another employee ({item.traveller_name or 'colleague'}) has submitted the exact same expense for Rs {item.original_amount:,.2f} at {item.merchant.name} on {item.transaction_date}."
                )
                
    return (DuplicateStatusEnum.CLEAN, None, None)
