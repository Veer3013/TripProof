"""
10 Deterministic Synthetic Enterprise Scenarios
Complete realistic datasets for live demonstration on Suproc Agent Marketplace.
"""

from typing import List, Dict, Any
from backend.models.schemas import (
    TripSchema, ExpenseSchema, MerchantSchema, BuyerSchema, TaxLineSchema,
    ExpenseTypeEnum, ValidationStatusEnum, PolicyStatusEnum, DuplicateStatusEnum,
    ITCEligibilityEnum, AnomalyFlag, SuprocProjectSchema
)

def get_demo_suproc_project() -> SuprocProjectSchema:
    return SuprocProjectSchema(
        id="proj_rfq_2847_mumbai_datacenter",
        org_id="org_suproc_enterprise_001",
        rfq_reference="RFQ-2847",
        title="Coimbatore Supplier Quality Audit & Datacenter Site Inspection",
        budget_amount=250000.00,
        currency="INR",
        status="active"
    )

def get_demo_trip() -> TripSchema:
    return TripSchema(
        id="trip_coimbatore_audit_2026",
        org_id="org_suproc_enterprise_001",
        project_id="proj_rfq_2847_mumbai_datacenter",
        project_title="Coimbatore Supplier Quality Audit & Datacenter Site Inspection (RFQ-2847)",
        rfq_reference="RFQ-2847",
        traveller_id="usr_rahul_sharma",
        traveller_name="Rahul Sharma (Lead Automation Engineer)",
        title="Coimbatore Supplier Audit & Commissioning",
        purpose="On-site technical audit of precision CNC supplier and electrical panel inspection for Project RFQ-2847.",
        origin="Bengaluru (BLR)",
        destination="Coimbatore (CJB)",
        start_date="2026-08-14",
        end_date="2026-08-16",
        budget_limit=60000.00,
        total_spend=45150.00,
        itc_claimable_total=4350.00,
        itc_blocked_total=725.00,
        itc_at_risk_total=2160.00,
        status="open",
        expense_count=10,
        created_at="2026-08-14T09:00:00Z"
    )

def get_demo_expenses() -> List[ExpenseSchema]:
    org_id = "org_suproc_enterprise_001"
    trip_id = "trip_coimbatore_audit_2026"
    traveller_id = "usr_rahul_sharma"
    traveller_name = "Rahul Sharma"
    company_name = "Acme Manufacturing India Pvt Ltd"
    company_gstin = "27AAACA1234A1ZK"

    return [
        # D1: IndiGo Flight (Happy Path)
        ExpenseSchema(
            id="exp_demo_01_indigo",
            org_id=org_id,
            trip_id=trip_id,
            traveller_id=traveller_id,
            traveller_name=traveller_name,
            document_id="doc_demo_01_indigo",
            merchant=MerchantSchema(
                name="InterGlobe Aviation Ltd (IndiGo)",
                normalized_key="indigo_airlines",
                gstin="07AABCI4818H1ZN",
                gstin_checksum_valid=True,
                address="IGI Airport, New Delhi 110037",
                city="Bengaluru",
                state_code="07",
                category="airfare"
            ),
            buyer=BuyerSchema(
                company_name=company_name,
                gstin=company_gstin,
                is_buyer_gstin_present=True,
                is_buyer_name_matched=True
            ),
            invoice_number="6E-INV-2026-99214",
            receipt_number="TKT-6E-88219",
            booking_reference="PNR-6EW9P2",
            transaction_date="2026-08-14",
            expense_type=ExpenseTypeEnum.AIRFARE,
            original_currency="INR",
            original_amount=5250.00,
            base_currency="INR",
            converted_amount=5250.00,
            fx_rate=1.0,
            subtotal=5000.00,
            tax_total=250.00,
            tax_lines=[
                TaxLineSchema(
                    line_id="tl_d1_1",
                    description="Economy Flight BLR -> CJB (6E-452)",
                    hsn_sac="996411",
                    taxable_amount=5000.00,
                    cgst_rate=2.5,
                    cgst_amount=125.00,
                    sgst_rate=2.5,
                    sgst_amount=125.00,
                    igst_rate=0.0,
                    igst_amount=0.0,
                    itc_eligibility=ITCEligibilityEnum.ELIGIBLE
                )
            ],
            itc_claimable=250.00,
            itc_blocked=0.00,
            itc_status="ELIGIBLE",
            document_confidence=0.98,
            field_confidences={"merchant_name": 0.99, "gstin": 0.99, "total_amount": 0.99, "date": 0.98},
            deterministic_math_passed=True,
            validation_status=ValidationStatusEnum.AUTO_ACCEPTED,
            policy_status=PolicyStatusEnum.OK,
            duplicate_status=DuplicateStatusEnum.CLEAN,
            anomaly_flags=[],
            review_notes="Auto-accepted: Valid GSTIN with 5% Economy ITC match.",
            created_at="2026-08-14T10:30:00Z"
        ),

        # D2: Taj Vivanta Folio (Tax Split: Room 18% vs F&B S.17(5) Blocked)
        ExpenseSchema(
            id="exp_demo_02_taj",
            org_id=org_id,
            trip_id=trip_id,
            traveller_id=traveller_id,
            traveller_name=traveller_name,
            document_id="doc_demo_02_taj",
            merchant=MerchantSchema(
                name="Taj Vivanta Coimbatore",
                normalized_key="taj_vivanta_coimbatore",
                gstin="33AAACH7383J1ZF",
                gstin_checksum_valid=True,
                address="Race Course Road, Coimbatore, Tamil Nadu",
                city="Coimbatore",
                state_code="33",
                category="lodging"
            ),
            buyer=BuyerSchema(
                company_name=company_name,
                gstin=company_gstin,
                is_buyer_gstin_present=True,
                is_buyer_name_matched=True
            ),
            invoice_number="INV-TAJ-2026-8812",
            receipt_number="FOLIO-99120",
            booking_reference="BK-VIV-94812",
            transaction_date="2026-08-16",
            expense_type=ExpenseTypeEnum.LODGING,
            original_currency="INR",
            original_amount=14200.00,
            base_currency="INR",
            converted_amount=14200.00,
            fx_rate=1.0,
            subtotal=12000.00,
            tax_total=2160.00,
            round_off=40.00,
            tax_lines=[
                TaxLineSchema(
                    line_id="tl_d2_1",
                    description="Superior Room Stay (2 Nights @ Rs 5,000/night)",
                    hsn_sac="996311",
                    taxable_amount=10000.00,
                    cgst_rate=9.0,
                    cgst_amount=900.00,
                    sgst_rate=9.0,
                    sgst_amount=900.00,
                    itc_eligibility=ITCEligibilityEnum.ELIGIBLE
                ),
                TaxLineSchema(
                    line_id="tl_d2_2",
                    description="Latitude Restaurant & Room Service F&B",
                    hsn_sac="996331",
                    taxable_amount=2000.00,
                    cgst_rate=9.0,
                    cgst_amount=180.00,
                    sgst_rate=9.0,
                    sgst_amount=180.00,
                    itc_eligibility=ITCEligibilityEnum.BLOCKED_SECTION_17_5_B,
                    itc_reversal_reason="Blocked under Section 17(5)(b) CGST Act (Food & Beverage)."
                )
            ],
            itc_claimable=1800.00,
            itc_blocked=360.00,
            itc_status="PARTIALLY_ELIGIBLE",
            document_confidence=0.96,
            field_confidences={"merchant_name": 0.98, "gstin": 0.99, "total_amount": 0.97, "line_items": 0.94},
            deterministic_math_passed=True,
            validation_status=ValidationStatusEnum.NEEDS_REVIEW,
            policy_status=PolicyStatusEnum.OK,
            duplicate_status=DuplicateStatusEnum.CLEAN,
            anomaly_flags=[
                AnomalyFlag(
                    code="TAX_LINE_SPLIT_APPLIED",
                    severity="INFO",
                    message="Automated tax split: Rs 1,800 Room ITC marked claimable; Rs 360 Food GST blocked under Section 17(5)(b)."
                )
            ],
            review_notes="Tax split automatically computed. Ready for sign-off.",
            created_at="2026-08-16T12:00:00Z"
        ),

        # D3: Ola Cabs (5% Blocked ITC)
        ExpenseSchema(
            id="exp_demo_03_ola",
            org_id=org_id,
            trip_id=trip_id,
            traveller_id=traveller_id,
            traveller_name=traveller_name,
            document_id="doc_demo_03_ola",
            merchant=MerchantSchema(
                name="ANI Technologies Pvt Ltd (Ola)",
                normalized_key="ola_cabs",
                gstin="29AABCA2233J1Z8",
                gstin_checksum_valid=True,
                address="Koramangala, Bengaluru 560095",
                category="cab"
            ),
            buyer=BuyerSchema(
                company_name=company_name,
                gstin=company_gstin,
                is_buyer_gstin_present=True
            ),
            invoice_number="CRN-2026-CJB-8812",
            transaction_date="2026-08-14",
            expense_type=ExpenseTypeEnum.CAB,
            original_currency="INR",
            original_amount=850.00,
            base_currency="INR",
            converted_amount=850.00,
            subtotal=809.52,
            tax_total=40.48,
            tax_lines=[
                TaxLineSchema(
                    line_id="tl_d3_1",
                    description="Airport Transfer CJB Airport to Industrial Estate",
                    hsn_sac="996412",
                    taxable_amount=809.52,
                    cgst_rate=2.5,
                    cgst_amount=20.24,
                    sgst_rate=2.5,
                    sgst_amount=20.24,
                    itc_eligibility=ITCEligibilityEnum.BLOCKED_SECTION_17_5_B,
                    itc_reversal_reason="Passenger motor vehicle transportation ITC blocked."
                )
            ],
            itc_claimable=0.00,
            itc_blocked=40.48,
            itc_status="BLOCKED",
            document_confidence=0.97,
            deterministic_math_passed=True,
            validation_status=ValidationStatusEnum.AUTO_ACCEPTED,
            policy_status=PolicyStatusEnum.OK,
            duplicate_status=DuplicateStatusEnum.CLEAN,
            anomaly_flags=[],
            review_notes="Auto-accepted: Cab 5% tax correctly routed to non-claimable expense pool.",
            created_at="2026-08-14T14:15:00Z"
        ),

        # D4: Duplicate Ola Cab JPEG (WhatsApp Recompressed Duplicate)
        ExpenseSchema(
            id="exp_demo_04_ola_duplicate",
            org_id=org_id,
            trip_id=trip_id,
            traveller_id=traveller_id,
            traveller_name=traveller_name,
            document_id="doc_demo_04_ola_duplicate",
            merchant=MerchantSchema(
                name="ANI Technologies Pvt Ltd (Ola)",
                normalized_key="ola_cabs",
                gstin="29AABCA2233J1Z8",
                gstin_checksum_valid=True,
                category="cab"
            ),
            buyer=BuyerSchema(
                company_name=company_name,
                gstin=company_gstin,
                is_buyer_gstin_present=True
            ),
            invoice_number="CRN-2026-CJB-8812",
            transaction_date="2026-08-14",
            expense_type=ExpenseTypeEnum.CAB,
            original_currency="INR",
            original_amount=850.00,
            base_currency="INR",
            converted_amount=850.00,
            subtotal=809.52,
            tax_total=40.48,
            itc_claimable=0.00,
            itc_blocked=40.48,
            itc_status="BLOCKED",
            document_confidence=0.91,
            deterministic_math_passed=True,
            validation_status=ValidationStatusEnum.NEEDS_REVIEW,
            policy_status=PolicyStatusEnum.OK,
            duplicate_status=DuplicateStatusEnum.CONFIRMED_DUPLICATE,
            anomaly_flags=[
                AnomalyFlag(
                    code="DUPLICATE_CLAIM_MATCH",
                    severity="ERROR",
                    message="Duplicate claim detected! Same Ola Cab receipt for Rs 850.00 on 2026-08-14 matches Expense #exp_demo_03_ola."
                )
            ],
            review_notes="Flagged for duplicate rejection.",
            created_at="2026-08-15T08:20:00Z"
        ),

        # D5: Restaurant Dinner (Policy Violation: Rs 4,800 > Rs 2,000 + Alcohol Alert)
        ExpenseSchema(
            id="exp_demo_05_dinner",
            org_id=org_id,
            trip_id=trip_id,
            traveller_id=traveller_id,
            traveller_name=traveller_name,
            document_id="doc_demo_05_dinner",
            merchant=MerchantSchema(
                name="The Residency Barbeque & Grill",
                normalized_key="the_residency_grill",
                gstin="33AABCT9981A1ZB",
                gstin_checksum_valid=True,
                address="Avinashi Road, Coimbatore",
                category="meals"
            ),
            buyer=BuyerSchema(
                company_name=company_name,
                is_buyer_gstin_present=False
            ),
            invoice_number="REST-88421",
            transaction_date="2026-08-15",
            expense_type=ExpenseTypeEnum.MEALS,
            original_currency="INR",
            original_amount=4800.00,
            base_currency="INR",
            converted_amount=4800.00,
            subtotal=4200.00,
            tax_total=600.00,
            tax_lines=[
                TaxLineSchema(
                    line_id="tl_d5_1",
                    description="Buffet Dinners (2 Persons)",
                    taxable_amount=3000.00,
                    cgst_rate=2.5,
                    cgst_amount=75.00,
                    sgst_rate=2.5,
                    sgst_amount=75.00,
                    itc_eligibility=ITCEligibilityEnum.BLOCKED_SECTION_17_5_B
                ),
                TaxLineSchema(
                    line_id="tl_d5_2",
                    description="Craft Beer & Liquor Pitcher",
                    taxable_amount=1200.00,
                    cgst_rate=0.0,
                    cgst_amount=0.0,
                    sgst_rate=0.0,
                    sgst_amount=0.0,
                    igst_rate=0.0,
                    igst_amount=0.0,
                    itc_eligibility=ITCEligibilityEnum.BLOCKED_SECTION_17_5_B
                )
            ],
            itc_claimable=0.00,
            itc_blocked=600.00,
            itc_status="BLOCKED",
            document_confidence=0.94,
            deterministic_math_passed=True,
            validation_status=ValidationStatusEnum.NEEDS_REVIEW,
            policy_status=PolicyStatusEnum.VIOLATION,
            duplicate_status=DuplicateStatusEnum.CLEAN,
            anomaly_flags=[
                AnomalyFlag(
                    code="POLICY_MEAL_CAP_EXCEEDED",
                    severity="WARNING",
                    message="Dinner total Rs 4,800.00 exceeds standard daily meal limit of Rs 2,000.00."
                ),
                AnomalyFlag(
                    code="PROHIBITED_ALCOHOL_PURCHASE",
                    severity="ERROR",
                    message="Prohibited item: 'Craft Beer & Liquor Pitcher' (Rs 1,200) must be deducted from reimbursable amount."
                )
            ],
            review_notes="Requires deducting Rs 1,200 alcohol charge and capping meal reimbursement to policy limit.",
            created_at="2026-08-15T22:10:00Z"
        ),

        # D6: Blurry Airport Parking Receipt (Low Confidence 0.45)
        ExpenseSchema(
            id="exp_demo_06_parking",
            org_id=org_id,
            trip_id=trip_id,
            traveller_id=traveller_id,
            traveller_name=traveller_name,
            document_id="doc_demo_06_parking",
            merchant=MerchantSchema(
                name="Airport Parking Services CJB",
                normalized_key="airport_parking_cjb",
                gstin=None,
                category="parking"
            ),
            buyer=BuyerSchema(is_buyer_gstin_present=False),
            receipt_number="PRK-901",
            transaction_date="2026-08-16",
            expense_type=ExpenseTypeEnum.PARKING,
            original_currency="INR",
            original_amount=250.00,
            base_currency="INR",
            converted_amount=250.00,
            subtotal=250.00,
            tax_total=0.00,
            itc_claimable=0.00,
            itc_blocked=0.00,
            itc_status="EXEMPT",
            document_confidence=0.48,
            field_confidences={"merchant_name": 0.45, "total_amount": 0.50, "date": 0.55},
            deterministic_math_passed=True,
            validation_status=ValidationStatusEnum.NEEDS_REVIEW,
            policy_status=PolicyStatusEnum.OK,
            duplicate_status=DuplicateStatusEnum.CLEAN,
            anomaly_flags=[
                AnomalyFlag(
                    code="LOW_EXTRACTION_CONFIDENCE",
                    severity="WARNING",
                    message="Low OCR image clarity on thermal paper. Human verification of total Rs 250.00 required."
                )
            ],
            review_notes="Confirm thermal parking slip amount.",
            created_at="2026-08-16T17:00:00Z"
        ),

        # D7: Grab Singapore (Foreign Currency FX Conversion SGD 42.00)
        ExpenseSchema(
            id="exp_demo_07_grab_sgd",
            org_id=org_id,
            trip_id=trip_id,
            traveller_id=traveller_id,
            traveller_name=traveller_name,
            document_id="doc_demo_07_grab_sgd",
            merchant=MerchantSchema(
                name="Grab Holdings Ltd (Singapore)",
                normalized_key="grab_singapore",
                address="Marina Bay Financial Tower, Singapore",
                category="cab"
            ),
            buyer=BuyerSchema(is_buyer_gstin_present=False),
            invoice_number="GRAB-SG-881920",
            transaction_date="2026-08-16",
            expense_type=ExpenseTypeEnum.CAB,
            original_currency="SGD",
            original_amount=42.00,
            base_currency="INR",
            converted_amount=2681.70,
            fx_rate=63.85,
            fx_date="2026-08-16",
            subtotal=2681.70,
            tax_total=0.00,
            itc_claimable=0.00,
            itc_blocked=0.00,
            itc_status="EXEMPT",
            document_confidence=0.96,
            deterministic_math_passed=True,
            validation_status=ValidationStatusEnum.AUTO_ACCEPTED,
            policy_status=PolicyStatusEnum.OK,
            duplicate_status=DuplicateStatusEnum.CLEAN,
            anomaly_flags=[
                AnomalyFlag(
                    code="HISTORICAL_FX_APPLIED",
                    severity="INFO",
                    message="Converted SGD 42.00 -> Rs 2,681.70 using official Frankfurter rate (1 SGD = Rs 63.85) on 2026-08-16."
                )
            ],
            review_notes="Foreign currency auto-normalized with historical exchange rate.",
            created_at="2026-08-16T19:30:00Z"
        ),

        # D8: Marriott Executive Stay (Booking Quote Mismatch Rs 14,200 vs Rs 9,800)
        ExpenseSchema(
            id="exp_demo_08_marriott",
            org_id=org_id,
            trip_id=trip_id,
            traveller_id=traveller_id,
            traveller_name=traveller_name,
            document_id="doc_demo_08_marriott",
            merchant=MerchantSchema(
                name="Fairfield by Marriott Coimbatore",
                normalized_key="marriott_coimbatore",
                gstin="33AAACF8812A1Z1",
                gstin_checksum_valid=True,
                category="lodging"
            ),
            buyer=BuyerSchema(
                company_name=company_name,
                gstin=company_gstin,
                is_buyer_gstin_present=True
            ),
            invoice_number="INV-MAR-9912",
            booking_reference="MAR-BK-8841",
            transaction_date="2026-08-15",
            expense_type=ExpenseTypeEnum.LODGING,
            original_currency="INR",
            original_amount=14200.00,
            base_currency="INR",
            converted_amount=14200.00,
            subtotal=12033.90,
            tax_total=2166.10,
            tax_lines=[
                TaxLineSchema(
                    line_id="tl_d8_1",
                    description="Deluxe Room (Executive Rate)",
                    taxable_amount=12033.90,
                    cgst_rate=9.0,
                    cgst_amount=1083.05,
                    sgst_rate=9.0,
                    sgst_amount=1083.05,
                    itc_eligibility=ITCEligibilityEnum.ELIGIBLE
                )
            ],
            itc_claimable=2166.10,
            itc_blocked=0.00,
            itc_status="ELIGIBLE",
            document_confidence=0.95,
            deterministic_math_passed=True,
            validation_status=ValidationStatusEnum.NEEDS_REVIEW,
            policy_status=PolicyStatusEnum.VIOLATION,
            duplicate_status=DuplicateStatusEnum.CLEAN,
            anomaly_flags=[
                AnomalyFlag(
                    code="BOOKING_QUOTE_MISMATCH",
                    severity="WARNING",
                    message="Final folio total Rs 14,200.00 exceeds initial corporate booking quote of Rs 9,800.00 (+44.9% variance)."
                )
            ],
            review_notes="Variance between estimated booking and actual folio billed.",
            created_at="2026-08-15T11:00:00Z"
        ),

        # D9: Uber Ride (Trip-Window Anomaly: Dated 3 Days after trip)
        ExpenseSchema(
            id="exp_demo_09_uber_late",
            org_id=org_id,
            trip_id=trip_id,
            traveller_id=traveller_id,
            traveller_name=traveller_name,
            document_id="doc_demo_09_uber_late",
            merchant=MerchantSchema(
                name="Uber India Systems Pvt Ltd",
                normalized_key="uber_india",
                gstin="27AABCU9921B1Z3",
                gstin_checksum_valid=True,
                category="cab"
            ),
            buyer=BuyerSchema(is_buyer_gstin_present=True),
            invoice_number="UBER-INV-99014",
            transaction_date="2026-08-19",  # 3 days after trip end date (2026-08-16)
            expense_type=ExpenseTypeEnum.CAB,
            original_currency="INR",
            original_amount=620.00,
            base_currency="INR",
            converted_amount=620.00,
            subtotal=590.48,
            tax_total=29.52,
            itc_claimable=0.00,
            itc_blocked=29.52,
            itc_status="BLOCKED",
            document_confidence=0.96,
            deterministic_math_passed=True,
            validation_status=ValidationStatusEnum.NEEDS_REVIEW,
            policy_status=PolicyStatusEnum.VIOLATION,
            duplicate_status=DuplicateStatusEnum.CLEAN,
            anomaly_flags=[
                AnomalyFlag(
                    code="DATE_OUTSIDE_TRIP_WINDOW",
                    severity="WARNING",
                    message="Expense date (2026-08-19) is 3 day(s) AFTER official trip completion date (2026-08-16)."
                )
            ],
            review_notes="Check if traveller had approved trip extension.",
            created_at="2026-08-19T10:00:00Z"
        ),

        # D10: Lemon Tree Hotel (Lost ITC Trap: Bill in personal name without buyer GSTIN)
        ExpenseSchema(
            id="exp_demo_10_lemontree",
            org_id=org_id,
            trip_id=trip_id,
            traveller_id=traveller_id,
            traveller_name=traveller_name,
            document_id="doc_demo_10_lemontree",
            merchant=MerchantSchema(
                name="Lemon Tree Hotel Coimbatore",
                normalized_key="lemon_tree_coimbatore",
                gstin="33AABCL4421A1Z9",
                gstin_checksum_valid=True,
                address="Kalapatti, Coimbatore 641048",
                category="lodging"
            ),
            buyer=BuyerSchema(
                company_name="Rahul Sharma (Personal Name)",
                gstin=None,
                is_buyer_gstin_present=False
            ),
            invoice_number="INV-LT-88319",
            transaction_date="2026-08-15",
            expense_type=ExpenseTypeEnum.LODGING,
            original_currency="INR",
            original_amount=12000.00,
            base_currency="INR",
            converted_amount=12000.00,
            subtotal=10169.49,
            tax_total=1830.51,
            tax_lines=[
                TaxLineSchema(
                    line_id="tl_d10_1",
                    description="Standard Room Stay (2 Nights)",
                    taxable_amount=10169.49,
                    cgst_rate=9.0,
                    cgst_amount=915.25,
                    sgst_rate=9.0,
                    sgst_amount=915.25,
                    itc_eligibility=ITCEligibilityEnum.MISSING_BUYER_GSTIN,
                    itc_reversal_reason="Corporate GSTIN missing from tax invoice. Input Tax Credit cannot be claimed."
                )
            ],
            itc_claimable=0.00,
            itc_blocked=1830.51,
            itc_status="BLOCKED",
            document_confidence=0.96,
            deterministic_math_passed=True,
            validation_status=ValidationStatusEnum.NEEDS_REVIEW,
            policy_status=PolicyStatusEnum.VIOLATION,
            duplicate_status=DuplicateStatusEnum.CLEAN,
            anomaly_flags=[
                AnomalyFlag(
                    code="MISSING_BUYER_GSTIN_ITC_LOST",
                    severity="ERROR",
                    message="CRITICAL: Hotel issued bill in employee personal name without company GSTIN. Direct forfeiture of Rs 1,830.51 in Input Tax Credit!"
                )
            ],
            review_notes="Chased hotel desk to reissue bill with Acme Manufacturing GSTIN.",
            created_at="2026-08-15T16:00:00Z"
        )
    ]
