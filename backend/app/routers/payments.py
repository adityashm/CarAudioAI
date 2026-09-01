"""
Payments API Router - Razorpay payments & Pro subscriptions (₹99/month, ₹999/year)
"""
import hmac
import hashlib
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.user import User
from app.models.payment import Payment
from app.routers.auth import get_current_user
from app.schemas.tuning import (
    PaymentPlanItem,
    CreatePaymentOrderRequest,
    PaymentOrderResponse,
    VerifyPaymentRequest,
    VerifyPaymentResponse
)

router = APIRouter()

SUBSCRIPTION_PLANS = [
    PaymentPlanItem(
        id="free",
        name="Free Tier",
        price_inr=0,
        interval="lifetime",
        features=["1 Car Profile", "Basic 14-Band Graphic EQ", "Standard Pink Noise Generator"]
    ),
    PaymentPlanItem(
        id="pro_monthly",
        name="Pro Monthly",
        price_inr=99,
        interval="month",
        features=[
            "Unlimited Cars & Audio Hardware Sets",
            "Advanced Linkwitz-Riley Crossover Matrix",
            "Millimeter-Accurate Time Alignment Delays",
            "Ported Box Subsonic Safety Protection",
            "Direct DSP File Export (Pioneer XML, MiniDSP JSON)"
        ]
    ),
    PaymentPlanItem(
        id="pro_yearly",
        name="Pro Yearly (Best Value)",
        price_inr=999,
        interval="year",
        features=[
            "Everything in Pro Monthly",
            "Installer Multi-Car Tuning Mode",
            "WhatsApp Tuning Report Generation",
            "2 Months Free"
        ]
    )
]

@router.get("/plans", response_model=List[PaymentPlanItem])
async def get_plans():
    """List available subscription plans in INR"""
    return SUBSCRIPTION_PLANS

@router.post("/create-order", response_model=PaymentOrderResponse)
async def create_order(
    req: CreatePaymentOrderRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a Razorpay order in INR"""
    plan = next((p for p in SUBSCRIPTION_PLANS if p.id == req.plan_id), None)
    if not plan or plan.price_inr <= 0:
        raise HTTPException(status_code=400, detail="Invalid plan selected")
        
    amount_in_paise = plan.price_inr * 100
    
    if settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET:
        try:
            import razorpay
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
            order = client.order.create({
                "amount": amount_in_paise,
                "currency": "INR",
                "receipt": f"rcpt_usr_{user.id or 1}_{plan.id}",
                "payment_capture": 1
            })
            order_id = order["id"]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Razorpay order creation failed: {str(e)}")
    else:
        # Development mode mock order
        order_id = f"order_mock_{plan.id}_{int(amount_in_paise)}"
        
    return PaymentOrderResponse(
        order_id=order_id,
        amount_inr=plan.price_inr,
        currency="INR",
        razorpay_key_id=settings.RAZORPAY_KEY_ID or "rzp_test_mock_key"
    )

@router.post("/verify", response_model=VerifyPaymentResponse)
async def verify_payment(
    req: VerifyPaymentRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify Razorpay payment signature and activate Pro subscription"""
    verified = False
    
    if settings.RAZORPAY_KEY_SECRET:
        msg = f"{req.razorpay_order_id}|{req.razorpay_payment_id}".encode("utf-8")
        generated_sig = hmac.new(settings.RAZORPAY_KEY_SECRET.encode("utf-8"), msg, hashlib.sha256).hexdigest()
        verified = hmac.compare_digest(generated_sig, req.razorpay_signature)
    else:
        # Development mode
        verified = True
        
    if not verified:
        raise HTTPException(status_code=400, detail="Invalid payment signature")
        
    try:
        if user and hasattr(user, "id") and user.id:
            user.subscription_tier = req.plan_id
            db.commit()
    except Exception:
        pass
        
    return VerifyPaymentResponse(
        success=True,
        message=f"Payment verified! Upgraded to {req.plan_id}.",
        subscription_tier=req.plan_id
    )
