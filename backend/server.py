from fastapi import FastAPI, APIRouter, Request, Response, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import base64
import httpx
import bcrypt
import asyncio
import time
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
from datetime import datetime, timezone, timedelta
from collections import defaultdict

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'car_license')]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

try:
    import stripe
    HAS_STRIPE = True
except ImportError:
    stripe = None
    HAS_STRIPE = False

# --- data.gov.il API config ---
VEHICLE_RESOURCE_ID = "053cea08-09bc-40ec-8f7a-156f0677aff3"
MOTORCYCLE_RESOURCE_ID = "bf9df4e2-d90d-4c0a-a400-19e15af8e95f"
DISABILITY_RESOURCE_ID = "c8b9f9c8-4612-4068-934f-d4acd2e3c06e"
THEFT_RESOURCE_ID = "8ef60e16-ca5f-463f-8555-c49b10640d2f"
PRICE_LIST_RESOURCE_ID = "39f455bf-6db0-4926-859d-017f34eacbcb"
DATA_GOV_BASE = "https://data.gov.il/api/3/action/datastore_search"

# Depreciation rates per year
DEPRECIATION_RATES = [0.15, 0.12, 0.10, 0.08, 0.07, 0.06]  # years 1-6, then 5% per year after

# ========== IN-MEMORY CACHE ==========
_cache: Dict[str, dict] = {}
CACHE_TTL = 300  # 5 minutes

def cache_get(key: str):
    entry = _cache.get(key)
    if entry and time.time() - entry["ts"] < CACHE_TTL:
        return entry["data"]
    if entry:
        del _cache[key]
    return None

def cache_set(key: str, data):
    # Limit cache size to prevent memory issues
    if len(_cache) > 5000:
        oldest_keys = sorted(_cache, key=lambda k: _cache[k]["ts"])[:1000]
        for k in oldest_keys:
            del _cache[k]
    _cache[key] = {"data": data, "ts": time.time()}

# ========== RATE LIMITING (AI scans) ==========
_ai_rate: Dict[str, dict] = {}  # user_id -> {count, reset_time}
AI_DAILY_LIMIT = 10

def check_ai_rate_limit(user_id: str, plan: str) -> bool:
    """Returns True if allowed, False if rate limited. Pro users are unlimited."""
    if plan == "pro":
        return True
    now = time.time()
    entry = _ai_rate.get(user_id)
    if not entry or now > entry["reset"]:
        _ai_rate[user_id] = {"count": 1, "reset": now + 86400}
        return True
    if entry["count"] >= AI_DAILY_LIMIT:
        return False
    entry["count"] += 1
    return True

def get_ai_remaining(user_id: str, plan: str) -> int:
    if plan == "pro":
        return -1  # unlimited
    entry = _ai_rate.get(user_id)
    if not entry or time.time() > entry["reset"]:
        return AI_DAILY_LIMIT
    return max(0, AI_DAILY_LIMIT - entry["count"])

# ========== RETRY HELPER ==========
async def fetch_with_retry(client: httpx.AsyncClient, url: str, params: dict, retries: int = 3) -> httpx.Response:
    """Fetch with exponential backoff retry."""
    for attempt in range(retries):
        try:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            return resp
        except httpx.HTTPStatusError as e:
            # Don't retry on 404 (resource removed) or other client errors
            if e.response.status_code < 500:
                raise
            if attempt == retries - 1:
                raise
            wait = (2 ** attempt) * 0.5
            logger.warning(f"Retry {attempt + 1}/{retries} after {wait}s: {e}")
            await asyncio.sleep(wait)
        except (httpx.RequestError, httpx.TimeoutException) as e:
            if attempt == retries - 1:
                raise
            wait = (2 ** attempt) * 0.5
            logger.warning(f"Retry {attempt + 1}/{retries} after {wait}s: {e}")
            await asyncio.sleep(wait)

# ========== VEHICLE HEALTH SCORE ==========
def calculate_vehicle_score(vehicle: dict, theft_data: list, test_valid: Optional[bool], age: int) -> dict:
    """Calculate overall vehicle health score 0-100."""
    score = 100
    factors = []

    # Theft check (-50 if stolen)
    if len(theft_data) > 0:
        score -= 50
        factors.append({"name": "גניבה", "impact": -50, "status": "danger"})
    else:
        factors.append({"name": "גניבה", "impact": 0, "status": "good"})

    # Test validity (-20 if expired, -10 if unknown)
    if test_valid is False:
        score -= 20
        factors.append({"name": "טסט", "impact": -20, "status": "danger"})
    elif test_valid is None:
        score -= 10
        factors.append({"name": "טסט", "impact": -10, "status": "warning"})
    else:
        factors.append({"name": "טסט", "impact": 0, "status": "good"})

    # Age penalty (gradual, max -20)
    if age > 0:
        age_penalty = min(20, age * 2)
        score -= age_penalty
        status = "good" if age <= 3 else "warning" if age <= 8 else "danger"
        factors.append({"name": "גיל", "impact": -age_penalty, "status": status})
    else:
        factors.append({"name": "גיל", "impact": 0, "status": "good"})

    # Ownership (government/company cars slightly better)
    baalut = vehicle.get("baalut", "")
    if "ממשלתי" in str(baalut) or "ציבורי" in str(baalut):
        factors.append({"name": "בעלות", "impact": 0, "status": "good"})
    else:
        factors.append({"name": "בעלות", "impact": 0, "status": "neutral"})

    score = max(0, min(100, score))
    label = "מצוין" if score >= 80 else "טוב" if score >= 60 else "בינוני" if score >= 40 else "נמוך"
    color = "emerald" if score >= 80 else "blue" if score >= 60 else "amber" if score >= 40 else "red"

    return {"score": score, "label": label, "color": color, "factors": factors}

# --- Pydantic Models ---
class UserOut(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    plan: str = "free"
    created_at: Optional[str] = None

class SearchHistoryItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    plate: str
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    searched_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    source: str = "manual"

class FavoriteItem(BaseModel):
    plate: str
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    color: Optional[str] = None
    test_expiry: Optional[str] = None
    added_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class WatchlistItem(BaseModel):
    plate: str
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    alert_types: List[str] = Field(default_factory=lambda: ["theft", "test_expiry"])
    added_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CompareRequest(BaseModel):
    plates: List[str]

# --- Auth Helpers ---
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

async def get_current_user(request: Request) -> Optional[dict]:
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            session_token = auth_header[7:]
    if not session_token:
        return None
    session_doc = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session_doc:
        return None
    expires_at = session_doc.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        return None
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if user_doc:
        user_doc.pop("password_hash", None)
    return user_doc

async def require_auth(request: Request) -> dict:
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

def _create_session_cookie(response: Response, session_token: str):
    response.set_cookie(
        key="session_token",
        value=session_token,
        path="/",
        secure=True,
        httponly=True,
        samesite="none",
        max_age=7 * 24 * 3600
    )

# --- Email/Password Auth Models ---
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

# --- Auth Endpoints ---
@api_router.get("/auth/session")
async def exchange_session(session_id: str, response: Response):
    # Google OAuth via Emergent has been removed.
    # To add Google OAuth, set up Google Cloud Console credentials
    # and implement the OAuth2 flow directly.
    raise HTTPException(status_code=503, detail="Google OAuth is not configured. Please use email/password login.")

    email = data["email"]
    name = data.get("name", "")
    picture = data.get("picture", "")
    session_token = data.get("session_token", str(uuid.uuid4()))

    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one({"email": email}, {"$set": {"name": name, "picture": picture}})
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "plan": "free",
            "created_at": datetime.now(timezone.utc).isoformat()
        })

    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    response.set_cookie(
        key="session_token",
        value=session_token,
        path="/",
        secure=True,
        httponly=True,
        samesite="none",
        max_age=7 * 24 * 3600
    )

    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if user_doc:
        user_doc.pop("password_hash", None)
    return user_doc

# --- Email/Password Auth ---
@api_router.post("/auth/register")
async def register(body: RegisterRequest, response: Response):
    email = body.email.strip().lower()
    name = body.name.strip()
    password = body.password

    if len(password) < 6:
        raise HTTPException(status_code=400, detail="הסיסמה חייבת להכיל לפחות 6 תווים")
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="אימייל לא תקין")
    if not name:
        raise HTTPException(status_code=400, detail="שם נדרש")

    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=409, detail="אימייל כבר רשום. נסה להתחבר.")

    user_id = f"user_{uuid.uuid4().hex[:12]}"
    password_hash = hash_password(password)

    await db.users.insert_one({
        "user_id": user_id,
        "email": email,
        "name": name,
        "password_hash": password_hash,
        "picture": "",
        "plan": "free",
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    session_token = str(uuid.uuid4())
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    _create_session_cookie(response, session_token)

    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    user_doc.pop("password_hash", None)
    return user_doc

@api_router.post("/auth/login")
async def login_email(body: LoginRequest, response: Response):
    email = body.email.strip().lower()
    password = body.password

    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="אימייל או סיסמה שגויים")

    password_hash = user.get("password_hash")
    if not password_hash:
        raise HTTPException(status_code=401, detail="חשבון זה משתמש בהתחברות עם Google")

    if not verify_password(password, password_hash):
        raise HTTPException(status_code=401, detail="אימייל או סיסמה שגויים")

    session_token = str(uuid.uuid4())
    await db.user_sessions.insert_one({
        "user_id": user["user_id"],
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    _create_session_cookie(response, session_token)

    user.pop("password_hash", None)
    return user

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await require_auth(request)
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie(key="session_token", path="/", secure=True, httponly=True, samesite="none")
    return {"message": "Logged out"}

# --- Vehicle Search Endpoints ---
@api_router.get("/vehicle/search")
async def search_vehicle(plate: str):
    plate_clean = ''.join(filter(str.isdigit, plate))
    if not plate_clean or len(plate_clean) < 5 or len(plate_clean) > 8:
        raise HTTPException(status_code=400, detail="Invalid plate number")

    # Check cache
    cache_key = f"vehicle:{plate_clean}"
    cached = cache_get(cache_key)
    if cached:
        return cached

    plate_num = int(plate_clean)
    async with httpx.AsyncClient(timeout=15.0) as http_client:
        resp = await fetch_with_retry(http_client, DATA_GOV_BASE, {
            "resource_id": VEHICLE_RESOURCE_ID,
            "filters": f'{{"mispar_rechev":{plate_num}}}',
            "limit": 1
        })
    data = resp.json()
    records = data.get("result", {}).get("records", [])
    if not records:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    result = {"vehicle": records[0]}
    cache_set(cache_key, result)
    return result

@api_router.get("/vehicle/theft")
async def check_theft(plate: str):
    plate_clean = ''.join(filter(str.isdigit, plate))
    if not plate_clean:
        raise HTTPException(status_code=400, detail="Invalid plate number")

    plate_num = int(plate_clean)
    try:
        async with httpx.AsyncClient(timeout=15.0) as http_client:
            resp = await fetch_with_retry(http_client, DATA_GOV_BASE, {
                "resource_id": THEFT_RESOURCE_ID,
                "filters": f'{{"MISPAR_RECHEV":{plate_num}}}',
                "limit": 1
            })
        data = resp.json()
        records = data.get("result", {}).get("records", [])
        return {"stolen": len(records) > 0, "records": records}
    except Exception as e:
        logger.warning(f"Theft API unavailable: {e}")
        return {"stolen": False, "records": [], "unavailable": True}

@api_router.get("/vehicle/disability")
async def check_disability(plate: str):
    plate_clean = ''.join(filter(str.isdigit, plate))
    if not plate_clean:
        raise HTTPException(status_code=400, detail="Invalid plate number")

    plate_num = int(plate_clean)
    async with httpx.AsyncClient(timeout=15.0) as http_client:
        resp = await fetch_with_retry(http_client, DATA_GOV_BASE, {
            "resource_id": DISABILITY_RESOURCE_ID,
            "filters": f'{{"MISPAR RECHEV":{plate_num}}}',
            "limit": 1
        })
    data = resp.json()
    records = data.get("result", {}).get("records", [])
    result = {"has_disability_tag": len(records) > 0}
    if records:
        rec = records[0]
        result["issue_date"] = rec.get("TAARICH HAFAKAT TAG")
        result["tag_type"] = rec.get("SUG TAV")
    return result

@api_router.get("/vehicle/full")
async def full_vehicle_check(plate: str):
    plate_clean = ''.join(filter(str.isdigit, plate))
    if not plate_clean or len(plate_clean) < 5 or len(plate_clean) > 8:
        raise HTTPException(status_code=400, detail="Invalid plate number")

    # Check cache
    cache_key = f"full:{plate_clean}"
    cached = cache_get(cache_key)
    if cached:
        return cached

    plate_num = int(plate_clean)
    async with httpx.AsyncClient(timeout=15.0) as http_client:
        # Search vehicles, motorcycles, theft, and disability in parallel
        # Use return_exceptions=True so one failing API doesn't crash everything
        vehicle_resp, motorcycle_resp, theft_resp, disability_resp = await asyncio.gather(
            fetch_with_retry(http_client, DATA_GOV_BASE, {"resource_id": VEHICLE_RESOURCE_ID, "filters": f'{{"mispar_rechev":{plate_num}}}', "limit": 1}),
            fetch_with_retry(http_client, DATA_GOV_BASE, {"resource_id": MOTORCYCLE_RESOURCE_ID, "filters": f'{{"mispar_rechev":{plate_num}}}', "limit": 1}),
            fetch_with_retry(http_client, DATA_GOV_BASE, {"resource_id": THEFT_RESOURCE_ID, "filters": f'{{"MISPAR_RECHEV":{plate_num}}}', "limit": 1}),
            fetch_with_retry(http_client, DATA_GOV_BASE, {"resource_id": DISABILITY_RESOURCE_ID, "filters": f'{{"MISPAR RECHEV":{plate_num}}}', "limit": 1}),
            return_exceptions=True,
        )

    vehicle_data = vehicle_resp.json().get("result", {}).get("records", []) if not isinstance(vehicle_resp, Exception) else []
    motorcycle_data = motorcycle_resp.json().get("result", {}).get("records", []) if not isinstance(motorcycle_resp, Exception) else []
    theft_data = theft_resp.json().get("result", {}).get("records", []) if not isinstance(theft_resp, Exception) else []
    disability_data = disability_resp.json().get("result", {}).get("records", []) if not isinstance(disability_resp, Exception) else []

    # Log any failed API calls
    for name, resp in [("vehicle", vehicle_resp), ("motorcycle", motorcycle_resp), ("theft", theft_resp), ("disability", disability_resp)]:
        if isinstance(resp, Exception):
            logger.warning(f"{name} API call failed: {resp}")

    is_motorcycle = False
    vehicle_record = None

    if vehicle_data:
        vehicle_record = vehicle_data[0]
    elif motorcycle_data:
        vehicle_record = motorcycle_data[0]
        is_motorcycle = True
    else:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    # Build disability info
    disability_info = {"has_disability_tag": len(disability_data) > 0}
    if disability_data:
        rec = disability_data[0]
        disability_info["issue_date"] = rec.get("TAARICH HAFAKAT TAG")
        disability_info["tag_type"] = rec.get("SUG TAV")

    # Fetch price list if it's a regular vehicle (not motorcycle)
    price_info = None
    if not is_motorcycle and vehicle_record:
        tozeret_cd = vehicle_record.get("tozeret_cd")
        degem_cd = vehicle_record.get("degem_cd")
        shnat_yitzur = vehicle_record.get("shnat_yitzur")
        if tozeret_cd and degem_cd and shnat_yitzur:
            try:
                async with httpx.AsyncClient(timeout=10.0) as http_client:
                    price_resp = await fetch_with_retry(http_client, DATA_GOV_BASE, {
                        "resource_id": PRICE_LIST_RESOURCE_ID,
                        "filters": f'{{"tozeret_cd":{tozeret_cd},"degem_cd":{degem_cd},"shnat_yitzur":{shnat_yitzur}}}',
                        "limit": 5
                    })
                price_records = price_resp.json().get("result", {}).get("records", [])
                if price_records:
                    price_info = _calculate_vehicle_value(price_records, shnat_yitzur)
            except Exception as e:
                logger.warning(f"Price lookup failed: {e}")

    # Calculate test validity
    test_valid = None
    tokef_dt = vehicle_record.get("tokef_dt")
    if tokef_dt:
        try:
            from datetime import date
            expiry = datetime.fromisoformat(str(tokef_dt).replace("Z", "+00:00")) if "T" in str(tokef_dt) else datetime.strptime(str(tokef_dt)[:10], "%Y-%m-%d")
            test_valid = expiry.date() > date.today() if hasattr(expiry, 'date') else expiry > datetime.now()
        except Exception:
            pass

    # Calculate vehicle age
    shnat = vehicle_record.get("shnat_yitzur")
    age = (datetime.now().year - int(shnat)) if shnat else 0

    # Calculate health score
    health_score = calculate_vehicle_score(vehicle_record, theft_data, test_valid, age)

    result = {
        "vehicle": vehicle_record,
        "is_motorcycle": is_motorcycle,
        "theft": {"stolen": len(theft_data) > 0, "records": theft_data, "unavailable": isinstance(theft_resp, Exception)},
        "disability": disability_info,
        "price": price_info,
        "health_score": health_score
    }

    cache_set(cache_key, result)
    return result


def _calculate_vehicle_value(price_records, shnat_yitzur):
    """Calculate estimated vehicle value based on price list and depreciation."""
    current_year = datetime.now().year
    age = current_year - int(shnat_yitzur)
    if age < 0:
        age = 0

    prices = []
    importers = set()
    for rec in price_records:
        mehir = rec.get("mehir")
        if mehir and isinstance(mehir, (int, float)) and mehir > 0:
            prices.append({
                "original_price": int(mehir),
                "importer": rec.get("shem_yevuan", ""),
                "trim": rec.get("kinuy_mishari", ""),
                "model_type": rec.get("sug_degem", "")
            })
            if rec.get("shem_yevuan"):
                importers.add(rec.get("shem_yevuan"))

    if not prices:
        return None

    # Calculate depreciation
    total_depreciation = 0.0
    for year in range(age):
        if year < len(DEPRECIATION_RATES):
            total_depreciation += (1 - total_depreciation) * DEPRECIATION_RATES[year]
        else:
            total_depreciation += (1 - total_depreciation) * 0.05

    # Get min/max original prices
    min_original = min(p["original_price"] for p in prices)
    max_original = max(p["original_price"] for p in prices)

    # Calculate estimated values
    min_estimated = int(min_original * (1 - total_depreciation))
    max_estimated = int(max_original * (1 - total_depreciation))

    # Apply ±10% range
    low_range = int(min_estimated * 0.9)
    high_range = int(max_estimated * 1.1)

    return {
        "original_price_min": min_original,
        "original_price_max": max_original,
        "estimated_low": low_range,
        "estimated_high": high_range,
        "age_years": age,
        "depreciation_pct": round(total_depreciation * 100, 1),
        "importers": list(importers),
        "trims": [p["trim"] for p in prices if p["trim"]],
        "record_count": len(prices)
    }

# --- AI Plate Recognition ---
@api_router.post("/vehicle/ai-recognize")
async def ai_recognize_plate(request: Request, file: UploadFile = File(...)):
    # Rate limit check
    user = await get_current_user(request)
    if user:
        plan = user.get("plan", "free")
        if not check_ai_rate_limit(user["user_id"], plan):
            raise HTTPException(status_code=429, detail="הגעת למגבלת סריקות AI ביום. שדרג ל-Pro לסריקות ללא הגבלה.")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    image_base64 = base64.b64encode(contents).decode("utf-8")

    gemini_key = os.environ.get("GEMINI_API_KEY")
    if not gemini_key:
        raise HTTPException(status_code=500, detail="AI service not configured")

    mime_type = file.content_type or "image/jpeg"
    if mime_type not in ("image/jpeg", "image/png", "image/webp", "image/gif", "image/heic"):
        mime_type = "image/jpeg"

    prompt = "Look at this image and find the Israeli license plate number. Israeli plates have 7 or 8 digits. Return ONLY the raw digits, nothing else. If no plate found, return NOT_FOUND."
    body = {
        "contents": [{
            "parts": [
                {"text": prompt},
                {"inlineData": {"mimeType": mime_type, "data": image_base64}}
            ]
        }]
    }

    models = ["gemini-2.5-flash", "gemini-2.0-flash"]

    for model in models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={gemini_key}"
        for attempt in range(2):
            try:
                async with httpx.AsyncClient(timeout=30.0) as http:
                    resp = await http.post(url, json=body)
                if resp.status_code in (503, 429):
                    await asyncio.sleep(1.5 * (attempt + 1))
                    continue
                if resp.status_code != 200:
                    break  # try next model
                result = resp.json()
                text = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                digits = ''.join(filter(str.isdigit, text))
                if "NOT_FOUND" in text or not digits:
                    return {"success": False, "plate": None, "message": "No license plate detected"}
                if len(digits) >= 7:
                    digits = digits[:8]
                    remaining = get_ai_remaining(user["user_id"], user.get("plan", "free")) if user else AI_DAILY_LIMIT - 1
                    return {"success": True, "plate": digits, "ai_remaining": remaining}
                return {"success": False, "plate": None, "message": "No valid plate number detected"}
            except Exception as e:
                logger.warning(f"Gemini {model} attempt {attempt+1} error: {e}")
                if attempt < 1:
                    await asyncio.sleep(1.5)

    raise HTTPException(status_code=500, detail="AI recognition failed - all models busy")

# --- Vehicle Compare ---
@api_router.post("/vehicle/compare")
async def compare_vehicles(body: CompareRequest):
    if len(body.plates) < 2 or len(body.plates) > 3:
        raise HTTPException(status_code=400, detail="יש לבחור 2-3 רכבים להשוואה")

    results = []
    for plate in body.plates:
        plate_clean = ''.join(filter(str.isdigit, plate))
        if not plate_clean or len(plate_clean) < 5 or len(plate_clean) > 8:
            results.append({"plate": plate, "error": "מספר לוחית לא תקין"})
            continue
        try:
            # Reuse full_vehicle_check logic via direct call
            from starlette.datastructures import QueryParams
            data = await full_vehicle_check(plate_clean)
            results.append({"plate": plate_clean, "data": data})
        except HTTPException as e:
            results.append({"plate": plate_clean, "error": e.detail})
        except Exception as e:
            results.append({"plate": plate_clean, "error": str(e)})

    return {"comparisons": results}

# --- Search History ---
@api_router.get("/history")
async def get_history(request: Request):
    user = await require_auth(request)
    items = await db.search_history.find(
        {"user_id": user["user_id"]}, {"_id": 0}
    ).sort("searched_at", -1).to_list(100)
    return {"history": items}

@api_router.post("/history")
async def add_history(request: Request, item: SearchHistoryItem):
    user = await require_auth(request)
    doc = item.model_dump()
    doc["user_id"] = user["user_id"]
    await db.search_history.insert_one(doc)
    return {"message": "Added to history"}

@api_router.delete("/history/{item_id}")
async def delete_history_item(item_id: str, request: Request):
    user = await require_auth(request)
    await db.search_history.delete_one({"id": item_id, "user_id": user["user_id"]})
    return {"message": "Deleted"}

@api_router.delete("/history")
async def clear_history(request: Request):
    user = await require_auth(request)
    await db.search_history.delete_many({"user_id": user["user_id"]})
    return {"message": "History cleared"}

# --- Favorites ---
@api_router.get("/favorites")
async def get_favorites(request: Request):
    user = await require_auth(request)
    items = await db.favorites.find(
        {"user_id": user["user_id"]}, {"_id": 0}
    ).sort("added_at", -1).to_list(100)
    return {"favorites": items}

@api_router.post("/favorites")
async def add_favorite(request: Request, item: FavoriteItem):
    user = await require_auth(request)
    doc = item.model_dump()
    doc["user_id"] = user["user_id"]
    existing = await db.favorites.find_one({"user_id": user["user_id"], "plate": item.plate})
    if existing:
        return {"message": "Already in favorites"}
    await db.favorites.insert_one(doc)
    return {"message": "Added to favorites"}

@api_router.delete("/favorites/{plate}")
async def remove_favorite(plate: str, request: Request):
    user = await require_auth(request)
    await db.favorites.delete_one({"plate": plate, "user_id": user["user_id"]})
    return {"message": "Removed from favorites"}

# --- Watchlist ---
@api_router.get("/watchlist")
async def get_watchlist(request: Request):
    user = await require_auth(request)
    items = await db.watchlist.find(
        {"user_id": user["user_id"]}, {"_id": 0}
    ).sort("added_at", -1).to_list(50)
    return {"watchlist": items}

@api_router.post("/watchlist")
async def add_to_watchlist(request: Request, item: WatchlistItem):
    user = await require_auth(request)
    existing = await db.watchlist.find_one({"user_id": user["user_id"], "plate": item.plate})
    if existing:
        return {"message": "Already watching this vehicle"}
    doc = item.model_dump()
    doc["user_id"] = user["user_id"]
    doc["id"] = str(uuid.uuid4())
    await db.watchlist.insert_one(doc)
    return {"message": "Added to watchlist"}

@api_router.delete("/watchlist/{plate}")
async def remove_from_watchlist(plate: str, request: Request):
    user = await require_auth(request)
    await db.watchlist.delete_one({"plate": plate, "user_id": user["user_id"]})
    return {"message": "Removed from watchlist"}

@api_router.get("/watchlist/check")
async def check_watchlist_alerts(request: Request):
    """Check all watchlist vehicles for alerts (theft, test expiry)."""
    user = await require_auth(request)
    items = await db.watchlist.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(50)
    alerts = []
    for item in items:
        plate = item.get("plate")
        if not plate:
            continue
        try:
            plate_num = int(''.join(filter(str.isdigit, plate)))
            async with httpx.AsyncClient(timeout=10.0) as http_client:
                checks = []
                if "theft" in item.get("alert_types", []):
                    checks.append(fetch_with_retry(http_client, DATA_GOV_BASE, {
                        "resource_id": THEFT_RESOURCE_ID,
                        "filters": f'{{"MISPAR_RECHEV":{plate_num}}}',
                        "limit": 1
                    }))
                else:
                    checks.append(asyncio.coroutine(lambda: None)() if False else asyncio.sleep(0))

                results = await asyncio.gather(*checks, return_exceptions=True)

                # Check theft
                if "theft" in item.get("alert_types", []) and not isinstance(results[0], Exception):
                    try:
                        theft_records = results[0].json().get("result", {}).get("records", [])
                        if theft_records:
                            alerts.append({
                                "plate": plate,
                                "type": "theft",
                                "message": f"רכב {plate} מדווח כגנוב!",
                                "severity": "danger"
                            })
                    except Exception:
                        pass
        except Exception as e:
            logger.warning(f"Watchlist check failed for {plate}: {e}")

    return {"alerts": alerts, "checked": len(items)}

# --- Stats ---
@api_router.get("/stats")
async def get_stats():
    total_searches = await db.search_history.count_documents({})
    total_users = await db.users.count_documents({})
    return {"total_searches": max(total_searches, 1247), "total_users": max(total_users, 850), "total_vehicles": 4200000}

# --- Stripe Subscription ---

# Fixed subscription packages — amounts defined server-side only
PRO_PLAN = {"id": "pro_monthly", "name": "Pro Monthly", "amount": 5.00, "currency": "usd"}
PRO_ANNUAL_PLAN = {"id": "pro_annual", "name": "Pro Annual", "amount": 48.00, "currency": "usd"}

class CreateCheckoutRequest(BaseModel):
    origin_url: str
    plan_type: str = "monthly"  # "monthly" or "annual"

@api_router.post("/checkout/create")
async def create_checkout_session(body: CreateCheckoutRequest, request: Request):
    user = await require_auth(request)
    if not HAS_STRIPE:
        raise HTTPException(status_code=503, detail="Payment integration is not available")

    stripe_api_key = os.environ.get("STRIPE_API_KEY")
    if not stripe_api_key:
        raise HTTPException(status_code=500, detail="Payment service not configured")
    stripe.api_key = stripe_api_key

    plan = PRO_ANNUAL_PLAN if body.plan_type == "annual" else PRO_PLAN
    subscription_days = 365 if body.plan_type == "annual" else 30

    origin = body.origin_url.rstrip("/")
    success_url = f"{origin}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/pricing"

    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[{
            "price_data": {
                "currency": plan["currency"],
                "product_data": {"name": plan["name"]},
                "unit_amount": int(plan["amount"] * 100),
            },
            "quantity": 1,
        }],
        mode="payment",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": user["user_id"],
            "plan": "pro",
            "package_id": plan["id"],
            "subscription_days": str(subscription_days)
        }
    )

    await db.payment_transactions.insert_one({
        "session_id": session.id,
        "user_id": user["user_id"],
        "amount": plan["amount"],
        "currency": plan["currency"],
        "package_id": plan["id"],
        "payment_status": "pending",
        "status": "initiated",
        "subscription_days": subscription_days,
        "metadata": {"plan": "pro"},
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    return {"url": session.url, "session_id": session.id}

@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str, request: Request):
    user = await require_auth(request)
    if not HAS_STRIPE:
        raise HTTPException(status_code=503, detail="Payment integration is not available")

    stripe_api_key = os.environ.get("STRIPE_API_KEY")
    if not stripe_api_key:
        raise HTTPException(status_code=500, detail="Payment service not configured")
    stripe.api_key = stripe_api_key

    try:
        session = stripe.checkout.Session.retrieve(session_id)
    except Exception as e:
        logger.error(f"Checkout status error: {e}")
        raise HTTPException(status_code=404, detail="Checkout session not found")

    payment_status = session.payment_status or "unpaid"
    tx = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if tx and tx.get("payment_status") != "paid":
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {
                "payment_status": payment_status,
                "status": session.status,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        if payment_status == "paid":
            sub_days = tx.get("subscription_days", 30)
            subscription_end = (datetime.now(timezone.utc) + timedelta(days=sub_days)).isoformat()
            await db.users.update_one(
                {"user_id": tx["user_id"]},
                {"$set": {"plan": "pro", "subscription_id": session_id, "subscription_end": subscription_end}}
            )
            logger.info(f"User {tx['user_id']} upgraded to Pro")

    return {
        "status": session.status,
        "payment_status": payment_status,
        "amount_total": session.amount_total,
        "currency": session.currency
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    sig = request.headers.get("Stripe-Signature", "")

    stripe_api_key = os.environ.get("STRIPE_API_KEY")
    webhook_secret = os.environ.get("STRIPE_WEBHOOK_SECRET")
    if not stripe_api_key or not HAS_STRIPE:
        return {"status": "error", "message": "Payment integration unavailable"}
    stripe.api_key = stripe_api_key

    try:
        if webhook_secret:
            event = stripe.Webhook.construct_event(body, sig, webhook_secret)
        else:
            import json as _json
            event = _json.loads(body)

        if event.get("type") == "checkout.session.completed":
            sess = event["data"]["object"]
            session_id = sess["id"]
            ps = sess.get("payment_status", "")
            if ps == "paid":
                tx = await db.payment_transactions.find_one({"session_id": session_id})
                if tx and tx.get("payment_status") != "paid":
                    await db.payment_transactions.update_one(
                        {"session_id": session_id},
                        {"$set": {"payment_status": "paid", "status": "complete", "updated_at": datetime.now(timezone.utc).isoformat()}}
                    )
                    sub_days = tx.get("subscription_days", 30)
                    subscription_end = (datetime.now(timezone.utc) + timedelta(days=sub_days)).isoformat()
                    await db.users.update_one(
                        {"user_id": tx["user_id"]},
                        {"$set": {"plan": "pro", "subscription_id": session_id, "subscription_end": subscription_end}}
                    )
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}

@api_router.get("/subscription")
async def get_subscription(request: Request):
    user = await require_auth(request)
    return {
        "plan": user.get("plan", "free"),
        "subscription_id": user.get("subscription_id"),
        "subscription_end": user.get("subscription_end")
    }

@api_router.post("/subscription/cancel")
async def cancel_subscription(request: Request):
    user = await require_auth(request)
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"plan": "free", "subscription_id": None, "subscription_end": None}}
    )
    return {"message": "Subscription cancelled", "plan": "free"}

# --- Statistics Endpoints (sample-based aggregation) ---
async def _fetch_sample(fields: str = "", limit: int = 5000, offset: int = 0):
    """Fetch a sample of vehicles for statistics aggregation."""
    params = {"resource_id": VEHICLE_RESOURCE_ID, "limit": limit, "offset": offset}
    if fields:
        params["fields"] = fields
    async with httpx.AsyncClient(timeout=30.0) as http_client:
        resp = await fetch_with_retry(http_client, DATA_GOV_BASE, params)
    return resp.json().get("result", {}).get("records", [])

def _aggregate(records, field):
    """Count occurrences of a field value."""
    counts = defaultdict(int)
    for r in records:
        val = r.get(field)
        if val:
            counts[str(val)] += 1
    return sorted([{"name": k, "count": v} for k, v in counts.items()], key=lambda x: -x["count"])

@api_router.get("/statistics/popular-manufacturers")
async def popular_manufacturers():
    cache_key = "stats:popular_mfr"
    cached = cache_get(cache_key)
    if cached:
        return cached
    try:
        records = await _fetch_sample("tozeret_nm", 10000)
        agg = _aggregate(records, "tozeret_nm")[:15]
        result = {"manufacturers": [{"tozeret_nm": a["name"], "count": a["count"]} for a in agg]}
        cache_set(cache_key, result)
        return result
    except Exception as e:
        logger.warning(f"Statistics API error: {e}")
        return {"manufacturers": [], "error": str(e)}

@api_router.get("/statistics/fuel-distribution")
async def fuel_distribution():
    cache_key = "stats:fuel_dist"
    cached = cache_get(cache_key)
    if cached:
        return cached
    try:
        records = await _fetch_sample("sug_delek_nm", 10000)
        agg = _aggregate(records, "sug_delek_nm")[:10]
        result = {"fuel_types": [{"sug_delek_nm": a["name"], "count": a["count"]} for a in agg]}
        cache_set(cache_key, result)
        return result
    except Exception as e:
        logger.warning(f"Fuel stats error: {e}")
        return {"fuel_types": [], "error": str(e)}

@api_router.get("/statistics/year-distribution")
async def year_distribution():
    cache_key = "stats:year_dist"
    cached = cache_get(cache_key)
    if cached:
        return cached
    try:
        records = await _fetch_sample("shnat_yitzur", 10000)
        agg = _aggregate(records, "shnat_yitzur")
        # Filter to 2000+
        filtered = [a for a in agg if a["name"].isdigit() and int(a["name"]) >= 2000]
        filtered.sort(key=lambda x: -int(x["name"]))
        result = {"years": [{"shnat_yitzur": int(a["name"]), "count": a["count"]} for a in filtered[:30]]}
        cache_set(cache_key, result)
        return result
    except Exception as e:
        logger.warning(f"Year stats error: {e}")
        return {"years": [], "error": str(e)}

@api_router.get("/statistics/color-distribution")
async def color_distribution():
    cache_key = "stats:color_dist"
    cached = cache_get(cache_key)
    if cached:
        return cached
    try:
        records = await _fetch_sample("tzeva_rechev", 10000)
        agg = _aggregate(records, "tzeva_rechev")[:15]
        result = {"colors": [{"tzeva_rechev": a["name"], "count": a["count"]} for a in agg]}
        cache_set(cache_key, result)
        return result
    except Exception as e:
        logger.warning(f"Color stats error: {e}")
        return {"colors": [], "error": str(e)}


# --- Encyclopedia Endpoints ---
@api_router.get("/encyclopedia/manufacturers")
async def list_manufacturers():
    cache_key = "enc:manufacturers"
    cached = cache_get(cache_key)
    if cached:
        return cached
    try:
        records = await _fetch_sample("tozeret_cd,tozeret_nm", 10000)
        # Aggregate by manufacturer
        mfr_map = {}
        for r in records:
            cd = r.get("tozeret_cd")
            nm = r.get("tozeret_nm")
            if cd and nm:
                key = str(cd)
                if key not in mfr_map:
                    mfr_map[key] = {"tozeret_cd": cd, "tozeret_nm": nm, "vehicle_count": 0}
                mfr_map[key]["vehicle_count"] += 1
        manufacturers = sorted(mfr_map.values(), key=lambda x: -x["vehicle_count"])[:80]
        result = {"manufacturers": manufacturers}
        cache_set(cache_key, result)
        return result
    except Exception as e:
        logger.warning(f"Encyclopedia manufacturers error: {e}")
        return {"manufacturers": [], "error": str(e)}

@api_router.get("/encyclopedia/models")
async def list_models(manufacturer_code: int):
    cache_key = f"enc:models:{manufacturer_code}"
    cached = cache_get(cache_key)
    if cached:
        return cached
    try:
        async with httpx.AsyncClient(timeout=20.0) as http_client:
            resp = await fetch_with_retry(http_client, DATA_GOV_BASE, {
                "resource_id": VEHICLE_RESOURCE_ID,
                "filters": f'{{"tozeret_cd":{manufacturer_code}}}',
                "fields": "degem_nm,degem_cd,kinuy_mishari,shnat_yitzur",
                "limit": 1000
            })
        records = resp.json().get("result", {}).get("records", [])
        # Aggregate by model
        model_map = {}
        for r in records:
            key = f"{r.get('degem_cd')}_{r.get('kinuy_mishari','')}"
            if key not in model_map:
                model_map[key] = {
                    "degem_nm": r.get("degem_nm"),
                    "degem_cd": r.get("degem_cd"),
                    "kinuy_mishari": r.get("kinuy_mishari", ""),
                    "years": set(),
                    "count": 0
                }
            model_map[key]["count"] += 1
            yr = r.get("shnat_yitzur")
            if yr:
                model_map[key]["years"].add(yr)
        models = []
        for m in sorted(model_map.values(), key=lambda x: -x["count"]):
            m["years"] = sorted(m["years"])
            models.append(m)
        result = {"models": models[:100]}
        cache_set(cache_key, result)
        return result
    except Exception as e:
        logger.warning(f"Encyclopedia models error: {e}")
        return {"models": [], "error": str(e)}

@api_router.get("/encyclopedia/model-details")
async def model_details(manufacturer_code: int, model_code: int):
    cache_key = f"enc:detail:{manufacturer_code}:{model_code}"
    cached = cache_get(cache_key)
    if cached:
        return cached
    try:
        async with httpx.AsyncClient(timeout=15.0) as http_client:
            resp = await fetch_with_retry(http_client, DATA_GOV_BASE, {
                "resource_id": VEHICLE_RESOURCE_ID,
                "filters": f'{{"tozeret_cd":{manufacturer_code},"degem_cd":{model_code}}}',
                "limit": 20
            })
        records = resp.json().get("result", {}).get("records", [])
        result = {"vehicles": records}
        cache_set(cache_key, result)
        return result
    except Exception as e:
        logger.warning(f"Model details error: {e}")
        return {"vehicles": [], "error": str(e)}


# --- Similar Vehicles ---
@api_router.get("/vehicle/similar")
async def find_similar_vehicles(plate: str):
    plate_clean = ''.join(filter(str.isdigit, plate))
    if not plate_clean:
        raise HTTPException(status_code=400, detail="Invalid plate number")
    cache_key = f"similar:{plate_clean}"
    cached = cache_get(cache_key)
    if cached:
        return cached
    plate_num = int(plate_clean)
    try:
        async with httpx.AsyncClient(timeout=15.0) as http_client:
            resp = await fetch_with_retry(http_client, DATA_GOV_BASE, {
                "resource_id": VEHICLE_RESOURCE_ID,
                "filters": f'{{"mispar_rechev":{plate_num}}}',
                "limit": 1
            })
            records = resp.json().get("result", {}).get("records", [])
            if not records:
                raise HTTPException(status_code=404, detail="Vehicle not found")
            vehicle = records[0]
            tozeret_cd = vehicle.get("tozeret_cd")
            shnat = vehicle.get("shnat_yitzur", 2020)
            # Find similar: same manufacturer
            similar_resp = await fetch_with_retry(http_client, DATA_GOV_BASE, {
                "resource_id": VEHICLE_RESOURCE_ID,
                "filters": f'{{"tozeret_cd":{tozeret_cd}}}',
                "fields": "degem_nm,kinuy_mishari,shnat_yitzur,sug_delek_nm,tzeva_rechev",
                "limit": 20
            })
            similar_records = similar_resp.json().get("result", {}).get("records", [])
            # Filter to within 2 years and deduplicate
            seen = set()
            similar = []
            for r in similar_records:
                yr = r.get("shnat_yitzur", 0)
                if abs(yr - shnat) <= 2:
                    key = f"{r.get('degem_nm')}_{yr}"
                    if key not in seen:
                        seen.add(key)
                        similar.append(r)
                if len(similar) >= 10:
                    break
            result = {
                "source": {"tozeret_nm": vehicle.get("tozeret_nm"), "degem_nm": vehicle.get("degem_nm"), "shnat_yitzur": shnat},
                "similar": similar
            }
            cache_set(cache_key, result)
            return result
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"Similar vehicles error: {e}")
        return {"source": None, "similar": [], "error": str(e)}


# Include router and middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def seed_demo_pro_user():
    """Seed a demo Pro user with email/password on startup."""
    demo_email = "pro@rechev.il"
    demo_password = "pro123456"
    demo_name = "Pro User"

    existing = await db.users.find_one({"email": demo_email}, {"_id": 0})
    if existing:
        # Update password hash if needed
        if not existing.get("password_hash") or not verify_password(demo_password, existing.get("password_hash", "")):
            await db.users.update_one(
                {"email": demo_email},
                {"$set": {"password_hash": hash_password(demo_password), "plan": "pro",
                          "subscription_end": (datetime.now(timezone.utc) + timedelta(days=365)).isoformat()}}
            )
        logger.info(f"Demo Pro user exists: {demo_email}")
    else:
        user_id = f"user_demo_pro"
        await db.users.insert_one({
            "user_id": user_id,
            "email": demo_email,
            "name": demo_name,
            "password_hash": hash_password(demo_password),
            "picture": "",
            "plan": "pro",
            "subscription_id": "demo_subscription",
            "subscription_end": (datetime.now(timezone.utc) + timedelta(days=365)).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"Created demo Pro user: {demo_email} / {demo_password}")

    # Create unique email index
    try:
        await db.users.create_index("email", unique=True)
    except Exception:
        pass

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
