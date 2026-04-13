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
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- data.gov.il API config ---
VEHICLE_RESOURCE_ID = "053cea08-09bc-40ec-8f7a-156f0677aff3"
MOTORCYCLE_RESOURCE_ID = "bf9df4e2-d90d-4c0a-a400-19e15af8e95f"
DISABILITY_RESOURCE_ID = "c8b9f9c8-4612-4068-934f-d4acd2e3c06e"
THEFT_RESOURCE_ID = "8ef60e16-ca5f-463f-8555-c49b10640d2f"
PRICE_LIST_RESOURCE_ID = "39f455bf-6db0-4926-859d-017f34eacbcb"
DATA_GOV_BASE = "https://data.gov.il/api/3/action/datastore_search"

# Depreciation rates per year
DEPRECIATION_RATES = [0.15, 0.12, 0.10, 0.08, 0.07, 0.06]  # years 1-6, then 5% per year after

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

# --- Auth Helpers ---
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
    return user_doc

async def require_auth(request: Request) -> dict:
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

# --- Auth Endpoints ---
@api_router.get("/auth/session")
async def exchange_session(session_id: str, response: Response):
    async with httpx.AsyncClient() as http_client:
        resp = await http_client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session")
        data = resp.json()

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
    return user_doc

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

    plate_num = int(plate_clean)
    async with httpx.AsyncClient(timeout=15.0) as http_client:
        resp = await http_client.get(
            DATA_GOV_BASE,
            params={
                "resource_id": VEHICLE_RESOURCE_ID,
                "filters": f'{{"mispar_rechev":{plate_num}}}',
                "limit": 1
            }
        )
    data = resp.json()
    records = data.get("result", {}).get("records", [])
    if not records:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return {"vehicle": records[0]}

@api_router.get("/vehicle/theft")
async def check_theft(plate: str):
    plate_clean = ''.join(filter(str.isdigit, plate))
    if not plate_clean:
        raise HTTPException(status_code=400, detail="Invalid plate number")

    plate_num = int(plate_clean)
    async with httpx.AsyncClient(timeout=15.0) as http_client:
        resp = await http_client.get(
            DATA_GOV_BASE,
            params={
                "resource_id": THEFT_RESOURCE_ID,
                "filters": f'{{"MISPAR_RECHEV":{plate_num}}}',
                "limit": 1
            }
        )
    data = resp.json()
    records = data.get("result", {}).get("records", [])
    return {"stolen": len(records) > 0, "records": records}

@api_router.get("/vehicle/disability")
async def check_disability(plate: str):
    plate_clean = ''.join(filter(str.isdigit, plate))
    if not plate_clean:
        raise HTTPException(status_code=400, detail="Invalid plate number")

    plate_num = int(plate_clean)
    async with httpx.AsyncClient(timeout=15.0) as http_client:
        resp = await http_client.get(
            DATA_GOV_BASE,
            params={
                "resource_id": DISABILITY_RESOURCE_ID,
                "filters": f'{{"MISPAR RECHEV":{plate_num}}}',
                "limit": 1
            }
        )
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

    plate_num = int(plate_clean)
    async with httpx.AsyncClient(timeout=15.0) as http_client:
        # Search vehicles, motorcycles, theft, and disability in parallel
        vehicle_resp, motorcycle_resp, theft_resp, disability_resp = await asyncio.gather(
            http_client.get(DATA_GOV_BASE, params={"resource_id": VEHICLE_RESOURCE_ID, "filters": f'{{"mispar_rechev":{plate_num}}}', "limit": 1}),
            http_client.get(DATA_GOV_BASE, params={"resource_id": MOTORCYCLE_RESOURCE_ID, "filters": f'{{"mispar_rechev":{plate_num}}}', "limit": 1}),
            http_client.get(DATA_GOV_BASE, params={"resource_id": THEFT_RESOURCE_ID, "filters": f'{{"MISPAR_RECHEV":{plate_num}}}', "limit": 1}),
            http_client.get(DATA_GOV_BASE, params={"resource_id": DISABILITY_RESOURCE_ID, "filters": f'{{"MISPAR RECHEV":{plate_num}}}', "limit": 1}),
        )

    vehicle_data = vehicle_resp.json().get("result", {}).get("records", [])
    motorcycle_data = motorcycle_resp.json().get("result", {}).get("records", [])
    theft_data = theft_resp.json().get("result", {}).get("records", [])
    disability_data = disability_resp.json().get("result", {}).get("records", [])

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
                    price_resp = await http_client.get(
                        DATA_GOV_BASE,
                        params={
                            "resource_id": PRICE_LIST_RESOURCE_ID,
                            "filters": f'{{"tozeret_cd":{tozeret_cd},"degem_cd":{degem_cd},"shnat_yitzur":{shnat_yitzur}}}',
                            "limit": 5
                        }
                    )
                price_records = price_resp.json().get("result", {}).get("records", [])
                if price_records:
                    price_info = _calculate_vehicle_value(price_records, shnat_yitzur)
            except Exception as e:
                logger.warning(f"Price lookup failed: {e}")

    return {
        "vehicle": vehicle_record,
        "is_motorcycle": is_motorcycle,
        "theft": {"stolen": len(theft_data) > 0, "records": theft_data},
        "disability": disability_info,
        "price": price_info
    }


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
async def ai_recognize_plate(file: UploadFile = File(...)):
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    image_base64 = base64.b64encode(contents).decode("utf-8")

    from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="AI service not configured")

    chat = LlmChat(
        api_key=api_key,
        session_id=f"plate-{uuid.uuid4().hex[:8]}",
        system_message="You are a license plate recognition system for Israeli vehicles."
    )
    chat.with_model("gemini", "gemini-2.5-flash")

    image_content = ImageContent(image_base64=image_base64)
    user_message = UserMessage(
        text="Look at this image and find the Israeli license plate number. Israeli plates have 7 or 8 digits. Return ONLY the raw digits, nothing else. If no plate found, return NOT_FOUND.",
        file_contents=[image_content]
    )

    try:
        response = await chat.send_message(user_message)
        plate_text = response.strip()
        digits = ''.join(filter(str.isdigit, plate_text))

        if not digits or plate_text == "NOT_FOUND":
            return {"success": False, "plate": None, "message": "No license plate detected"}

        return {"success": True, "plate": digits}
    except Exception as e:
        logger.error(f"AI recognition error: {e}")
        # Fallback to gemini-2.0-flash
        try:
            chat2 = LlmChat(
                api_key=api_key,
                session_id=f"plate-fallback-{uuid.uuid4().hex[:8]}",
                system_message="You are a license plate recognition system for Israeli vehicles."
            )
            chat2.with_model("gemini", "gemini-2.5-flash-image")
            response = await chat2.send_message(user_message)
            plate_text = response.strip()
            digits = ''.join(filter(str.isdigit, plate_text))
            if not digits or plate_text == "NOT_FOUND":
                return {"success": False, "plate": None, "message": "No license plate detected"}
            return {"success": True, "plate": digits}
        except Exception as e2:
            logger.error(f"AI fallback error: {e2}")
            raise HTTPException(status_code=500, detail="AI recognition failed")

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

# --- Stats ---
@api_router.get("/stats")
async def get_stats():
    total_searches = await db.search_history.count_documents({})
    total_users = await db.users.count_documents({})
    return {"total_searches": max(total_searches, 1247), "total_users": max(total_users, 850), "total_vehicles": 4200000}

# --- Stripe Subscription ---
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

# Fixed subscription packages — amounts defined server-side only
PRO_PLAN = {"id": "pro_monthly", "name": "Pro Monthly", "amount": 5.00, "currency": "usd"}

class CreateCheckoutRequest(BaseModel):
    origin_url: str

@api_router.post("/checkout/create")
async def create_checkout_session(body: CreateCheckoutRequest, request: Request):
    user = await require_auth(request)

    stripe_api_key = os.environ.get("STRIPE_API_KEY")
    if not stripe_api_key:
        raise HTTPException(status_code=500, detail="Payment service not configured")

    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)

    origin = body.origin_url.rstrip("/")
    success_url = f"{origin}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/pricing"

    checkout_request = CheckoutSessionRequest(
        amount=PRO_PLAN["amount"],
        currency=PRO_PLAN["currency"],
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": user["user_id"],
            "plan": "pro",
            "package_id": PRO_PLAN["id"]
        }
    )

    session = await stripe_checkout.create_checkout_session(checkout_request)

    # Create payment_transactions record BEFORE redirect
    await db.payment_transactions.insert_one({
        "session_id": session.session_id,
        "user_id": user["user_id"],
        "amount": PRO_PLAN["amount"],
        "currency": PRO_PLAN["currency"],
        "package_id": PRO_PLAN["id"],
        "payment_status": "pending",
        "status": "initiated",
        "metadata": {"plan": "pro"},
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str, request: Request):
    user = await require_auth(request)

    stripe_api_key = os.environ.get("STRIPE_API_KEY")
    if not stripe_api_key:
        raise HTTPException(status_code=500, detail="Payment service not configured")

    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)

    try:
        checkout_status = await stripe_checkout.get_checkout_status(session_id)
    except Exception as e:
        logger.error(f"Checkout status error: {e}")
        raise HTTPException(status_code=404, detail="Checkout session not found")

    # Update transaction record — only process once
    tx = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if tx and tx.get("payment_status") != "paid":
        new_status = checkout_status.payment_status
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {
                "payment_status": new_status,
                "status": checkout_status.status,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )

        # If paid, upgrade user to pro
        if new_status == "paid":
            subscription_end = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
            await db.users.update_one(
                {"user_id": tx["user_id"]},
                {"$set": {
                    "plan": "pro",
                    "subscription_id": session_id,
                    "subscription_end": subscription_end
                }}
            )
            logger.info(f"User {tx['user_id']} upgraded to Pro")

    return {
        "status": checkout_status.status,
        "payment_status": checkout_status.payment_status,
        "amount_total": checkout_status.amount_total,
        "currency": checkout_status.currency
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature", "")

    stripe_api_key = os.environ.get("STRIPE_API_KEY")
    if not stripe_api_key:
        raise HTTPException(status_code=500, detail="Payment service not configured")

    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)

    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        logger.info(f"Webhook event: {webhook_response.event_type}, session: {webhook_response.session_id}")

        if webhook_response.payment_status == "paid" and webhook_response.session_id:
            tx = await db.payment_transactions.find_one(
                {"session_id": webhook_response.session_id}, {"_id": 0}
            )
            if tx and tx.get("payment_status") != "paid":
                await db.payment_transactions.update_one(
                    {"session_id": webhook_response.session_id},
                    {"$set": {
                        "payment_status": "paid",
                        "status": "complete",
                        "webhook_event_id": webhook_response.event_id,
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }}
                )
                subscription_end = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
                await db.users.update_one(
                    {"user_id": tx["user_id"]},
                    {"$set": {
                        "plan": "pro",
                        "subscription_id": webhook_response.session_id,
                        "subscription_end": subscription_end
                    }}
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

# Include router and middleware
import asyncio
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
