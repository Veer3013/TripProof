from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_api_health():
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["app"] == "TripProof"

def test_dashboard_summary():
    res = client.get("/api/v1/dashboard/summary")
    assert res.status_code == 200
    data = res.json()
    assert "total_spend_month" in data
    assert data["pending_review_count"] > 0
    assert data["active_trips_count"] > 0

def test_list_trips_and_details():
    res = client.get("/api/v1/trips")
    assert res.status_code == 200
    trips = res.json()
    assert len(trips) > 0
    
    trip_id = trips[0]["id"]
    res_detail = client.get(f"/api/v1/trips/{trip_id}")
    assert res_detail.status_code == 200
    detail = res_detail.json()
    assert "trip" in detail
    assert "expenses" in detail
    assert len(detail["expenses"]) == 10  # 10 deterministic demo scenarios

def test_review_queue_and_correction():
    res = client.get("/api/v1/review/queue")
    assert res.status_code == 200
    queue = res.json()
    assert len(queue) > 0
    
    exp_id = queue[0]["id"]
    
    # Send a patch correction
    patch_res = client.patch(
        f"/api/v1/expenses/{exp_id}",
        json={
            "merchant_name": "Corrected Merchant Name",
            "notes": "Reviewed and verified"
        }
    )
    assert patch_res.status_code == 200
    updated = patch_res.json()
    assert updated["merchant"]["name"] == "Corrected Merchant Name"

def test_approve_expense():
    res = client.get("/api/v1/expenses")
    expenses = res.json()
    exp_id = expenses[0]["id"]
    
    appr_res = client.post(f"/api/v1/expenses/{exp_id}/approve", params={"notes": "ERP Signoff OK"})
    assert appr_res.status_code == 200
    assert appr_res.json()["status"] == "success"

def test_audit_pack_generation():
    res = client.get("/api/v1/trips/trip_coimbatore_audit_2026/audit-report.html")
    assert res.status_code == 200
    assert "TRIPPROOF &times; SUPROC" in res.text
    
    res_csv = client.get("/api/v1/export/accounting.csv")
    assert res_csv.status_code == 200
    assert "Expense_ID" in res_csv.text
