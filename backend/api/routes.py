"""
Complete RESTful API Routes for TripProof
Handles ingestion, extraction, validation, split-screen review, audit logs, and exports.
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query, Response
from fastapi.responses import HTMLResponse, StreamingResponse
from typing import List, Optional
import io
import uuid

from backend.models.schemas import (
    TripSchema, ExpenseSchema, SuprocProjectSchema, DocumentSchema,
    ReviewCorrectionPayload, AuditEventSchema, DashboardSummaryKPI,
    ValidationStatusEnum, PolicyStatusEnum
)
from backend.db.database import db
from backend.engine.extractor import process_document_extraction
from backend.engine.duplicate_detector import compute_sha256, check_for_duplicates
from backend.engine.policy_engine import evaluate_policy_and_anomalies
from backend.engine.tax_rules import validate_gstin_checksum, verify_tax_arithmetic, evaluate_line_item_itc
from backend.engine.audit_pack import generate_audit_html, generate_accounting_csv, create_trip_audit_pack_zip
from backend.config import DEFAULT_ORG_ID

router = APIRouter(prefix="/api/v1")

# 1. Health & Status
@router.get("/health")
def get_health():
    return {
        "status": "healthy",
        "app": "TripProof",
        "version": "1.0.0",
        "suproc_ecosystem": "ACTIVE",
        "tax_engine": "Luhn Mod-36 Active (Rule 46 Compliant)"
    }

# 2. Organization & Settings
@router.get("/orgs/current")
def get_current_organization():
    return db.organizations.get(DEFAULT_ORG_ID)

# 3. Dashboard Analytics
@router.get("/dashboard/summary", response_model=DashboardSummaryKPI)
def get_dashboard_summary():
    return db.get_dashboard_summary(DEFAULT_ORG_ID)

# 4. Suproc Projects
@router.get("/projects", response_model=List[SuprocProjectSchema])
def list_suproc_projects():
    return list(db.projects.values())

# 5. Trips Management
@router.get("/trips", response_model=List[TripSchema])
def list_trips():
    return list(db.trips.values())

@router.post("/trips", response_model=TripSchema)
def create_trip(trip_data: TripSchema):
    db.trips[trip_data.id] = trip_data
    db.log_audit(
        org_id=DEFAULT_ORG_ID,
        entity_type="TRIP",
        entity_id=trip_data.id,
        action="TRIP_CREATED",
        details={"title": trip_data.title, "project_id": trip_data.project_id}
    )
    return trip_data

@router.get("/trips/{trip_id}")
def get_trip_details(trip_id: str):
    trip = db.trips.get(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    expenses = [e for e in db.expenses.values() if e.trip_id == trip_id]
    project = db.projects.get(trip.project_id)
    
    return {
        "trip": trip,
        "project": project,
        "expenses": expenses,
        "expense_count": len(expenses)
    }

# 6. Expenses Register & Filtering
@router.get("/expenses", response_model=List[ExpenseSchema])
def list_expenses(
    trip_id: Optional[str] = None,
    validation_status: Optional[str] = None,
    policy_status: Optional[str] = None,
    itc_status: Optional[str] = None
):
    results = list(db.expenses.values())
    if trip_id:
        results = [e for e in results if e.trip_id == trip_id]
    if validation_status:
        results = [e for e in results if e.validation_status.value == validation_status]
    if policy_status:
        results = [e for e in results if e.policy_status.value == policy_status]
    if itc_status:
        results = [e for e in results if e.itc_status == itc_status]
    return results

@router.get("/expenses/{expense_id}", response_model=ExpenseSchema)
def get_expense_by_id(expense_id: str):
    exp = db.expenses.get(expense_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Expense not found")
    return exp

# 7. Document Ingestion & Live Extraction
@router.post("/documents/upload", response_model=ExpenseSchema)
async def upload_document(
    file: UploadFile = File(...),
    trip_id: str = Form("trip_coimbatore_audit_2026"),
    traveller_id: str = Form("usr_rahul_sharma"),
    traveller_name: str = Form("Rahul Sharma")
):
    file_bytes = await file.read()
    file_sha256 = compute_sha256(file_bytes)
    
    doc_id = f"doc_{uuid.uuid4().hex[:10]}"
    doc_schema = DocumentSchema(
        id=doc_id,
        org_id=DEFAULT_ORG_ID,
        trip_id=trip_id,
        filename=file.filename,
        mime_type=file.content_type or "image/jpeg",
        file_size_bytes=len(file_bytes),
        sha256_hash=file_sha256,
        storage_path=f"storage/uploads/{doc_id}_{file.filename}",
        source_channel="upload"
    )
    db.documents[doc_id] = doc_schema

    # Run extraction pipeline
    extracted_expense = process_document_extraction(
        document_id=doc_id,
        org_id=DEFAULT_ORG_ID,
        trip_id=trip_id,
        traveller_id=traveller_id,
        traveller_name=traveller_name,
        file_name=file.filename,
        file_bytes=file_bytes,
        mime_type=file.content_type or "image/jpeg"
    )

    # Multi-Vector Duplicate Check
    existing = list(db.expenses.values())
    dup_status, dup_match_id, dup_reason = check_for_duplicates(
        current_expense=extracted_expense,
        existing_expenses=existing,
        current_doc_hash=file_sha256
    )
    extracted_expense.duplicate_status = dup_status
    if dup_reason:
        extracted_expense.anomaly_flags.append({
            "code": "DUPLICATE_CLAIM_MATCH",
            "severity": "ERROR",
            "message": dup_reason
        })
        extracted_expense.validation_status = ValidationStatusEnum.NEEDS_REVIEW

    # Policy & Anomaly Check
    trip = db.trips.get(trip_id)
    policy_stat, flags = evaluate_policy_and_anomalies(extracted_expense, trip)
    extracted_expense.policy_status = policy_stat
    extracted_expense.anomaly_flags.extend(flags)
    
    if flags:
        extracted_expense.validation_status = ValidationStatusEnum.NEEDS_REVIEW

    # Save to database
    db.expenses[extracted_expense.id] = extracted_expense
    db.recalculate_trip_totals(trip_id)
    
    db.log_audit(
        org_id=DEFAULT_ORG_ID,
        entity_type="EXPENSE",
        entity_id=extracted_expense.id,
        action="DOCUMENT_UPLOADED_AND_EXTRACTED",
        actor_name=traveller_name,
        details={
            "filename": file.filename,
            "merchant": extracted_expense.merchant.name,
            "amount": extracted_expense.original_amount,
            "validation_status": extracted_expense.validation_status.value
        }
    )

    return extracted_expense

# 8. Human-in-the-Loop Smart Review Queue
@router.get("/review/queue", response_model=List[ExpenseSchema])
def get_review_queue():
    """Returns all expenses needing review, prioritized by Money-at-Risk."""
    queue = [e for e in db.expenses.values() if e.validation_status == ValidationStatusEnum.NEEDS_REVIEW]
    
    # Priority function: Total Amount * (1 - Confidence) + Lost ITC risk + Policy breach
    def calculate_priority(exp: ExpenseSchema) -> float:
        risk = exp.original_amount * (1.0 - exp.document_confidence)
        if exp.policy_status == PolicyStatusEnum.VIOLATION:
            risk += 500.0
        if not exp.buyer.is_buyer_gstin_present and exp.expense_type in ["lodging", "airfare"]:
            risk += exp.tax_total or 1000.0
        return risk

    queue.sort(key=calculate_priority, reverse=True)
    return queue

# 9. Review Correction & Live Math Recalculation
@router.patch("/expenses/{expense_id}", response_model=ExpenseSchema)
def review_and_correct_expense(expense_id: str, payload: ReviewCorrectionPayload):
    exp = db.expenses.get(expense_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Expense not found")

    # Apply corrections
    if payload.merchant_name is not None:
        exp.merchant.name = payload.merchant_name
    if payload.merchant_gstin is not None:
        exp.merchant.gstin = payload.merchant_gstin
        exp.merchant.gstin_checksum_valid = validate_gstin_checksum(payload.merchant_gstin)
        # Clear invalid checksum anomaly if now valid
        if exp.merchant.gstin_checksum_valid:
            exp.anomaly_flags = [f for f in exp.anomaly_flags if f.code != "INVALID_SUPPLIER_GSTIN_CHECKSUM"]
            
    if payload.transaction_date is not None:
        exp.transaction_date = payload.transaction_date
    if payload.original_amount is not None:
        exp.original_amount = payload.original_amount
        exp.converted_amount = payload.original_amount * exp.fx_rate
    if payload.subtotal is not None:
        exp.subtotal = payload.subtotal
    if payload.tax_total is not None:
        exp.tax_total = payload.tax_total
    if payload.expense_type is not None:
        exp.expense_type = payload.expense_type
    if payload.tax_lines is not None:
        exp.tax_lines = payload.tax_lines
        
    if payload.notes:
        exp.review_notes = payload.notes

    # Re-evaluate Deterministic Math & ITC
    math_passed, _, _, _ = verify_tax_arithmetic(exp.subtotal, exp.tax_lines, exp.original_amount)
    exp.deterministic_math_passed = math_passed

    # Re-calculate ITC sums
    itc_claimable = sum(tl.cgst_amount + tl.sgst_amount + tl.igst_amount for tl in exp.tax_lines if tl.itc_eligibility.value == "ELIGIBLE")
    itc_blocked = sum(tl.cgst_amount + tl.sgst_amount + tl.igst_amount for tl in exp.tax_lines if tl.itc_eligibility.value != "ELIGIBLE")
    exp.itc_claimable = round(itc_claimable, 2)
    exp.itc_blocked = round(itc_blocked, 2)
    exp.itc_status = "ELIGIBLE" if itc_claimable > 0 and itc_blocked == 0 else (
        "PARTIALLY_ELIGIBLE" if itc_claimable > 0 and itc_blocked > 0 else "BLOCKED"
    )

    db.recalculate_trip_totals(exp.trip_id)
    
    db.log_audit(
        org_id=DEFAULT_ORG_ID,
        entity_type="EXPENSE",
        entity_id=exp.id,
        action="HUMAN_REVIEW_CORRECTION",
        actor_name="Finance Reviewer",
        details={"fields_updated": list(payload.model_dump(exclude_unset=True).keys())}
    )

    return exp

# 10. Approval & Rejection Handlers
@router.post("/expenses/{expense_id}/approve")
def approve_expense(expense_id: str, notes: Optional[str] = None):
    exp = db.expenses.get(expense_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Expense not found")
        
    exp.validation_status = ValidationStatusEnum.APPROVED
    exp.reviewed_by = "Finance Controller"
    if notes:
        exp.review_notes = notes
        
    db.recalculate_trip_totals(exp.trip_id)
    db.log_audit(
        org_id=DEFAULT_ORG_ID,
        entity_type="EXPENSE",
        entity_id=exp.id,
        action="EXPENSE_APPROVED_FOR_ERP",
        actor_name="Finance Controller",
        details={"approved_amount": exp.converted_amount, "itc_claimable": exp.itc_claimable}
    )
    return {"status": "success", "message": f"Expense #{expense_id} approved for Suproc ERP Core."}

@router.post("/expenses/{expense_id}/reject")
def reject_expense(expense_id: str, reason: str = Form("Policy or Duplicate Violation")):
    exp = db.expenses.get(expense_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Expense not found")
        
    exp.validation_status = ValidationStatusEnum.REJECTED
    exp.review_notes = f"Rejected: {reason}"
    db.recalculate_trip_totals(exp.trip_id)
    
    db.log_audit(
        org_id=DEFAULT_ORG_ID,
        entity_type="EXPENSE",
        entity_id=exp.id,
        action="EXPENSE_REJECTED",
        actor_name="Finance Controller",
        details={"rejection_reason": reason}
    )
    return {"status": "success", "message": f"Expense #{expense_id} rejected."}

# 11. Anomalies & Duplicates View
@router.get("/anomalies")
def get_anomalies():
    all_expenses = list(db.expenses.values())
    duplicates = [e for e in all_expenses if e.duplicate_status != "CLEAN"]
    policy_violations = [e for e in all_expenses if e.policy_status == PolicyStatusEnum.VIOLATION]
    itc_at_risk = [
        e for e in all_expenses 
        if (not e.buyer.is_buyer_gstin_present or not e.merchant.gstin_checksum_valid) and e.expense_type in ["lodging", "airfare"]
    ]
    return {
        "duplicates": duplicates,
        "policy_violations": policy_violations,
        "itc_at_risk": itc_at_risk
    }

# 12. Audit Ledger
@router.get("/audit/events", response_model=List[AuditEventSchema])
def list_audit_events():
    return sorted(db.audit_events, key=lambda x: x.created_at, reverse=True)

# 13. 1-Click Interactive Demo Seed Reset
@router.post("/demo/reset-seed")
def reset_demo_seed():
    db.seed_demo_data()
    return {
        "status": "success",
        "message": "Loaded 10 deterministic enterprise travel scenarios for Suproc Coimbatore Audit.",
        "trip_id": "trip_coimbatore_audit_2026",
        "scenario_count": 10
    }

# 14. Audit Pack Downloads
@router.get("/trips/{trip_id}/audit-report.html")
def download_audit_report_html(trip_id: str):
    trip = db.trips.get(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    project = db.projects.get(trip.project_id)
    expenses = [e for e in db.expenses.values() if e.trip_id == trip_id]
    
    html = generate_audit_html(trip, project, expenses, db.audit_events)
    return HTMLResponse(content=html)

@router.get("/trips/{trip_id}/audit-pack")
def download_audit_pack_zip(trip_id: str):
    trip = db.trips.get(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    project = db.projects.get(trip.project_id)
    expenses = [e for e in db.expenses.values() if e.trip_id == trip_id]
    
    zip_bytes = create_trip_audit_pack_zip(trip, project, expenses, db.audit_events)
    return StreamingResponse(
        io.BytesIO(zip_bytes),
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename=AUDIT_PACK_{trip_id}.zip"}
    )

# 15. Accounting CSV Export
@router.get("/export/accounting.csv")
def download_accounting_csv():
    expenses = list(db.expenses.values())
    csv_str = generate_accounting_csv(expenses)
    return Response(
        content=csv_str,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=TRIPPROOF_ACCOUNTING_LEDGER.csv"}
    )
