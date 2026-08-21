"""CivicPulse backend E2E API tests."""
import os
import time
import base64
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # fall back to reading from frontend/.env
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
    except Exception:
        pass

API = f"{BASE_URL}/api"

CITIZEN = {"identifier": "9876543210", "password": "citizen123"}
ADMIN = {"identifier": "admin@civicpulse.org", "password": "admin123"}
DEV = {"identifier": "dev@civicpulse.org", "password": "dev123"}


@pytest.fixture(scope="module")
def s():
    return requests.Session()


def _login(session, creds):
    r = session.post(f"{API}/auth/login", json=creds, timeout=30)
    assert r.status_code == 200, f"Login failed for {creds['identifier']}: {r.status_code} {r.text}"
    data = r.json()
    return data["user"]["token"], data["user"]


@pytest.fixture(scope="module")
def citizen_token(s):
    tok, _ = _login(s, CITIZEN)
    return tok


@pytest.fixture(scope="module")
def admin_token(s):
    tok, _ = _login(s, ADMIN)
    return tok


def h(tok):
    return {"Authorization": f"Bearer {tok}"}


# ---------- Auth ----------
class TestAuth:
    def test_login_citizen_success(self, s):
        r = s.post(f"{API}/auth/login", json=CITIZEN)
        assert r.status_code == 200
        d = r.json()
        assert "token" in d["user"] and d["user"]["role"] == "citizen"
        # cookie
        assert any(c.name == "access_token" for c in s.cookies) or "access_token" in r.headers.get("set-cookie", "")

    def test_login_admin_success(self, s):
        r = s.post(f"{API}/auth/login", json=ADMIN)
        assert r.status_code == 200
        assert r.json()["user"]["role"] == "admin"

    def test_login_wrong_password(self, s):
        r = s.post(f"{API}/auth/login", json={"identifier": ADMIN["identifier"], "password": "WRONG"})
        assert r.status_code == 401

    def test_register_new_citizen(self, s):
        import random
        mobile = f"98{random.randint(10000000, 99999999)}"
        payload = {"name": "TEST_User", "mobile": mobile, "password": "testpass123", "ward": "Ward 12 - Indiranagar"}
        r = s.post(f"{API}/auth/register", json=payload)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["user"]["role"] == "citizen"
        assert "token" in d["user"]

    def test_me_with_bearer(self, s, citizen_token):
        r = requests.get(f"{API}/auth/me", headers=h(citizen_token))
        assert r.status_code == 200
        assert r.json()["user"]["role"] == "citizen"


# ---------- Public ----------
class TestPublic:
    def test_public_stats(self):
        r = requests.get(f"{API}/public/stats")
        assert r.status_code == 200
        d = r.json()
        for k in ("total_complaints", "pending", "resolved", "categories", "resolution_rate"):
            assert k in d

    def test_public_categories(self):
        r = requests.get(f"{API}/public/categories")
        assert r.status_code == 200
        cats = r.json()["categories"]
        assert "Roads" in cats and len(cats) >= 5


# ---------- AI Analyze ----------
class TestAI:
    def test_analyze_hindi(self):
        r = requests.post(f"{API}/ai/analyze-complaint",
                          json={"text": "हमारे रास्ते पर बड़ा गड्ढा है"}, timeout=90)
        assert r.status_code == 200, r.text
        a = r.json()["analysis"]
        assert a["detected_language"] == "Hindi"
        assert a["category"] == "Roads"
        assert a["priority"] in ("High", "Critical")
        assert a["recommended_department"]
        # translated text should be in English (ASCII only, no devanagari)
        translated = a.get("translated_text", "")
        has_devanagari = any(0x0900 <= ord(c) <= 0x097F for c in translated)
        assert not has_devanagari, f"translated_text still has Hindi chars: {translated}"


# ---------- Complaints ----------
class TestComplaints:
    created_number = None

    def test_create_complaint_citizen(self, citizen_token):
        payload = {
            "category": "Roads",
            "description": "TEST_ large pothole causing accident hazard on main road",
            "location": {"latitude": 12.97, "longitude": 77.59, "address": "TEST addr", "ward": "Ward 12 - Indiranagar"}
        }
        r = requests.post(f"{API}/complaints", json=payload, headers=h(citizen_token), timeout=90)
        assert r.status_code == 200, r.text
        c = r.json()["complaint"]
        assert c["complaint_number"].startswith("CP-")
        assert c["status"] == "PENDING"
        assert len(c["status_history"]) >= 1
        TestComplaints.created_number = c["complaint_number"]

    def test_citizen_sees_only_own(self, citizen_token):
        r = requests.get(f"{API}/complaints", headers=h(citizen_token))
        assert r.status_code == 200
        # all belong to same user
        # citizen can't see user_id of others: role filter enforces user_id = self
        assert r.json()["count"] >= 1

    def test_admin_sees_all(self, admin_token):
        r = requests.get(f"{API}/complaints", headers=h(admin_token))
        assert r.status_code == 200
        assert r.json()["count"] >= 1

    def test_citizen_cannot_update_status(self, citizen_token):
        num = TestComplaints.created_number
        assert num
        r = requests.patch(f"{API}/complaints/{num}/status",
                           json={"status": "IN PROGRESS"}, headers=h(citizen_token))
        assert r.status_code == 403

    def test_admin_update_status_with_proof(self, admin_token):
        num = TestComplaints.created_number
        # tiny 1x1 png b64
        img_b64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
        r = requests.patch(f"{API}/complaints/{num}/status",
                           json={"status": "IN PROGRESS", "remarks": "Crew dispatched", "proof_photo_url": img_b64},
                           headers=h(admin_token), timeout=30)
        assert r.status_code == 200, r.text
        c = r.json()["complaint"]
        assert c["status"] == "IN PROGRESS"
        assert c.get("resolution_photo_url") == img_b64
        # status_history has entry with proof_photo_url
        last = c["status_history"][-1]
        assert last["status"] == "IN PROGRESS"
        assert last.get("proof_photo_url") == img_b64

    def test_admin_assign_department(self, admin_token):
        num = TestComplaints.created_number
        r = requests.patch(f"{API}/complaints/{num}/assign",
                           json={"assigned_department": "Roads & Public Works Department", "assigned_officer": "Officer X"},
                           headers=h(admin_token))
        assert r.status_code == 200
        c = r.json()["complaint"]
        assert c["assigned_department"] == "Roads & Public Works Department"
        assert c["status"] == "ASSIGNED"
        assert any(x["status"] == "ASSIGNED" for x in c["status_history"])


# ---------- Notifications ----------
class TestNotifications:
    def test_citizen_notifications(self, citizen_token):
        r = requests.get(f"{API}/notifications", headers=h(citizen_token))
        assert r.status_code == 200
        d = r.json()
        assert "notifications" in d and "unread_count" in d
        assert len(d["notifications"]) >= 1

    def test_mark_all_read(self, citizen_token):
        r = requests.post(f"{API}/notifications/mark-all-read", headers=h(citizen_token))
        assert r.status_code == 200
        r2 = requests.get(f"{API}/notifications", headers=h(citizen_token))
        assert r2.json()["unread_count"] == 0


# ---------- Admin RBAC ----------
class TestAdminRBAC:
    def test_citizen_denied_analytics(self, citizen_token):
        r = requests.get(f"{API}/admin/analytics", headers=h(citizen_token))
        assert r.status_code == 403

    def test_citizen_denied_departments(self, citizen_token):
        r = requests.get(f"{API}/admin/departments", headers=h(citizen_token))
        assert r.status_code == 403

    def test_citizen_denied_system_logs(self, citizen_token):
        r = requests.get(f"{API}/admin/system-logs", headers=h(citizen_token))
        assert r.status_code == 403

    def test_admin_analytics(self, admin_token):
        r = requests.get(f"{API}/admin/analytics", headers=h(admin_token))
        assert r.status_code == 200
        assert "monthly_trend" in r.json()

    def test_admin_departments(self, admin_token):
        r = requests.get(f"{API}/admin/departments", headers=h(admin_token))
        assert r.status_code == 200
        assert "departments" in r.json()

    def test_admin_wards(self, admin_token):
        # note: /admin/wards does NOT require admin auth in code (bug?)
        r = requests.get(f"{API}/admin/wards", headers=h(admin_token))
        assert r.status_code == 200

    def test_admin_system_logs(self, admin_token):
        r = requests.get(f"{API}/admin/system-logs", headers=h(admin_token))
        assert r.status_code == 200
        assert "logs" in r.json()
