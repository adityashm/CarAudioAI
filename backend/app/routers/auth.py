"""
Authentication API Router - Phone OTP login with Twilio Verify & JWT Bearer tokens
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.user import User
from app.schemas.tuning import (
    SendOTPRequest,
    SendOTPResponse,
    VerifyOTPRequest,
    TokenResponse,
    UserProfileResponse
)
from app.utils.twilio import format_indian_phone, send_otp, verify_otp

router = APIRouter()
security = HTTPBearer(auto_error=False)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization token required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        phone_number: str = payload.get("sub")
        if phone_number is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
        
    try:
        user = db.query(User).filter(User.phone_number == phone_number).first()
        if user:
            return user
    except Exception:
        pass
        
    # Return ephemeral user if DB table not yet seeded
    return User(id=1, phone_number=phone_number, subscription_tier="free")

@router.post("/send-otp", response_model=SendOTPResponse)
async def request_otp(req: SendOTPRequest):
    """
    Send OTP code to Indian phone number.
    In development mode without Twilio keys, returns success with mock verification code (123456).
    """
    formatted_phone = format_indian_phone(req.phone_number)
    
    if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN and settings.TWILIO_VERIFY_SERVICE_SID:
        result = await send_otp(formatted_phone)
        if result.get("success"):
            return SendOTPResponse(success=True, message="OTP sent successfully via SMS", status="sent")
        else:
            raise HTTPException(status_code=400, detail=result.get("message", "Failed to send OTP"))
            
    # Development fallback
    return SendOTPResponse(
        success=True,
        message="Development mode: OTP generated (Use code 123456)",
        status="development_mode"
    )

@router.post("/verify-otp", response_model=TokenResponse)
async def confirm_otp(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    """
    Verify 6-digit OTP code and return JWT access token.
    """
    formatted_phone = format_indian_phone(req.phone_number)
    is_verified = False
    
    if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN and settings.TWILIO_VERIFY_SERVICE_SID:
        result = await verify_otp(formatted_phone, req.otp_code)
        is_verified = result.get("verified", False)
    else:
        # Development mode: accept 123456
        if req.otp_code == "123456":
            is_verified = True
            
    if not is_verified:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP code")
        
    user_id = 1
    tier = "free"
    
    try:
        user = db.query(User).filter(User.phone_number == formatted_phone).first()
        if not user:
            user = User(
                phone_number=formatted_phone,
                name=req.name or "Car Audio Enthusiast",
                subscription_tier="free"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        user_id = user.id
        tier = user.subscription_tier or "free"
    except Exception:
        pass
        
    token = create_access_token(data={"sub": formatted_phone, "user_id": user_id, "tier": tier})
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user_id=user_id,
        phone_number=formatted_phone,
        subscription_tier=tier
    )

@router.get("/me", response_model=UserProfileResponse)
async def get_me(user: User = Depends(get_current_user)):
    """Get profile and subscription information of authenticated user"""
    return UserProfileResponse(
        id=user.id or 1,
        phone_number=user.phone_number,
        name=user.name,
        subscription_tier=user.subscription_tier or "free",
        subscription_expires_at=str(user.subscription_expires_at) if user.subscription_expires_at else None
    )
