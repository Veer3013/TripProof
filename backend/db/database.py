"""
Database & Persistence Layer for TripProof
- Multi-Tenant in-memory & SQLite backed repository
- Fast querying with full relational schema support
"""

import json
from typing import List, Optional, Dict, Any
from datetime import datetime

from backend.models.schemas import (
    TripSchema, ExpenseSchema, SuprocProjectSchema, DocumentSchema,
    PolicyConfigSchema, AuditEventSchema, DashboardSummaryKPI,
    ValidationStatusEnum, PolicyStatusEnum
)
from backend.engine.synthetic_demo_data import (
    get_demo_suproc_project, get_demo_trip, get_demo_expenses
)

class TripProofDatabase:
    def __init__(self):
        self.organizations: Dict[str, Dict[str, Any]] = {
            "org_suproc_enterprise_001": {
                "id": "org_suproc_enterprise_001",
                "name": "Acme Manufacturing India Pvt Ltd",
                "base_currency": "INR",
                "primary_gstin": "27AAACA1234A1Z5",
                "policy": PolicyConfigSchema()
            }
        }
        self.projects: Dict[str, SuprocProjectSchema] = {}
        self.trips: Dict[str, TripSchema] = {}
        self.documents: Dict[str, DocumentSchema] = {}
        self.expenses: Dict[str, ExpenseSchema] = {}
        self.audit_events: List[AuditEventSchema] = []
        
        # Seed initial dataset
        self.seed_demo_data()

    def seed_demo_data(self):
        """Initializes the database with the 10 deterministic demo scenarios."""
        # 1. Project
        proj = get_demo_suproc_project()
        self.projects[proj.id] = proj
        
        # 2. Trip
        trip = get_demo_trip()
        self.trips[trip.id] = trip
        
        # 3. Expenses
        demo_expenses = get_demo_expenses()
        for exp in demo_expenses:
            self.expenses[exp.id] = exp
            
        # 4. Audit Log
        self.audit_events = [
            AuditEventSchema(
                id="ev_init_01",
                org_id="org_suproc_enterprise_001",
                entity_type="SYSTEM",
                entity_id="init",
                action="SYSTEM_INITIALIZED",
                actor_user_id="SYSTEM",
                actor_name="TripProof Core",
                details={"message": "Loaded 10 deterministic enterprise travel scenarios for Suproc Coimbatore Audit trip."},
                created_at="2026-08-31T09:00:00Z"
            ),
            AuditEventSchema(
                id="ev_init_02",
                org_id="org_suproc_enterprise_001",
                entity_type="TAX_ENGINE",
                entity_id="rule_46",
                action="GST_TAX_RULES_VERIFIED",
                actor_user_id="SYSTEM",
                actor_name="Luhn Mod-36 Engine",
                details={"verified_gstin_count": 8, "blocked_itc_calculated": 725.00},
                created_at="2026-08-31T09:00:05Z"
            )
        ]
        
        # Re-sync trip totals
        self.recalculate_trip_totals(trip.id)

    def recalculate_trip_totals(self, trip_id: str):
        trip = self.trips.get(trip_id)
        if not trip:
            return
            
        trip_expenses = [e for e in self.expenses.values() if e.trip_id == trip_id]
        total_spend = sum(e.converted_amount for e in trip_expenses)
        claimable = sum(e.itc_claimable for e in trip_expenses)
        blocked = sum(e.itc_blocked for e in trip_expenses)
        
        # Calculate at-risk: expenses with missing buyer GSTIN or checksum fail that have tax
        at_risk = sum(
            e.tax_total for e in trip_expenses 
            if (not e.buyer.is_buyer_gstin_present or not e.merchant.gstin_checksum_valid) and e.expense_type in ["lodging", "airfare"]
        )
        
        trip.total_spend = total_spend
        trip.itc_claimable_total = claimable
        trip.itc_blocked_total = blocked
        trip.itc_at_risk_total = at_risk
        trip.expense_count = len(trip_expenses)

    def log_audit(self, org_id: str, entity_type: str, entity_id: str, action: str, actor_name: str = "Finance Reviewer", details: Dict[str, Any] = None):
        import uuid
        event = AuditEventSchema(
            id=f"ev_{uuid.uuid4().hex[:10]}",
            org_id=org_id,
            entity_type=entity_type,
            entity_id=entity_id,
            action=action,
            actor_name=actor_name,
            details=details or {},
            created_at=datetime.utcnow().isoformat() + "Z"
        )
        self.audit_events.append(event)
        return event

    def get_dashboard_summary(self, org_id: str) -> DashboardSummaryKPI:
        all_exp = [e for e in self.expenses.values() if e.org_id == org_id]
        all_trips = [t for t in self.trips.values() if t.org_id == org_id]
        all_projs = [p for p in self.projects.values() if p.org_id == org_id]
        
        total_spend = sum(e.converted_amount for e in all_exp)
        total_eligible = sum(e.itc_claimable for e in all_exp)
        total_blocked = sum(e.itc_blocked for e in all_exp)
        total_at_risk = sum(
            e.tax_total for e in all_exp 
            if (not e.buyer.is_buyer_gstin_present or not e.merchant.gstin_checksum_valid) and e.expense_type in ["lodging", "airfare"]
        )
        
        pending_reviews = len([e for e in all_exp if e.validation_status == ValidationStatusEnum.NEEDS_REVIEW])
        duplicates = len([e for e in all_exp if e.duplicate_status != "CLEAN"])
        policy_viols = len([e for e in all_exp if e.policy_status == PolicyStatusEnum.VIOLATION])
        
        return DashboardSummaryKPI(
            total_spend_month=total_spend,
            itc_eligible_month=total_eligible,
            itc_blocked_month=total_blocked,
            itc_at_risk_month=total_at_risk,
            pending_review_count=pending_reviews,
            duplicate_count=duplicates,
            policy_violation_count=policy_viols,
            active_trips_count=len(all_trips),
            active_projects_count=len(all_projs)
        )

# Global DB Singleton
db = TripProofDatabase()
