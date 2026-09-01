"""
Pydantic Schemas for Car, Equipment, Auth, Payments, Measurements, and Tuning API
"""
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

# --- CAR & EQUIPMENT SCHEMAS ---
class CarVariantSpec(BaseModel):
    variant: str
    year: Optional[str] = None
    factory_head_unit: Optional[str] = None
    front_speaker_size: Optional[str] = "6.5 inch"
    rear_speaker_size: Optional[str] = "6.5 inch"
    tweeter_location: Optional[str] = "A-pillar"
    specs: Optional[Dict[str, Any]] = None

class CarResponse(BaseModel):
    make: str
    model: str
    variants: List[CarVariantSpec]

class EquipmentItem(BaseModel):
    category: str
    brand: str
    model: str
    specs: Dict[str, Any]
    price_inr: Optional[int] = None
    amazon_link: Optional[str] = None
    flipkart_link: Optional[str] = None

class EquipmentSetupInput(BaseModel):
    head_unit_brand: str = Field(default="Nakamichi")
    head_unit_model: str = Field(default="NAM5510")
    front_speakers: str = Field(default="Sony XS-162GS Component")
    rear_speakers: str = Field(default="Sony XS-162GS Coaxial")
    speakers_amplifier: str = Field(default="MOCO AF-04")
    subwoofer: str = Field(default="Pioneer TS-W307D4")
    subwoofer_enclosure_type: str = Field(default="ported")
    subwoofer_tuning_frequency_hz: float = Field(default=35.0)
    subwoofer_amplifier: str = Field(default="Sound Barrier SB-654")

# --- TUNING SCHEMAS ---
class TuningCalculationRequest(BaseModel):
    car_make: str = Field(default="Skoda")
    car_model: str = Field(default="Kylaq")
    car_variant: Optional[str] = Field(default="Prestige")
    equipment: EquipmentSetupInput = Field(default_factory=EquipmentSetupInput)
    sound_target_profile: str = Field(default="sql_punjabi_hiphop")
    listening_position: str = Field(default="driver_rhd")

class TuningCalculationResponse(BaseModel):
    car: str
    setup_summary: str
    sound_target: str
    head_unit_14_band_eq: Dict[str, Any]
    crossover_configuration: Dict[str, Any]
    time_alignment_and_phase: Dict[str, Any]
    amplifier_gain_and_dial_settings: Dict[str, Any]
    quick_action_checklist: List[str]
    pioneer_xml_preview: Optional[str] = None
    minidsp_json_preview: Optional[str] = None

# --- AUTH SCHEMAS ---
class SendOTPRequest(BaseModel):
    phone_number: str = Field(..., description="Phone number with country code, e.g. +919876543210")

class SendOTPResponse(BaseModel):
    success: bool
    message: str
    status: Optional[str] = "pending"

class VerifyOTPRequest(BaseModel):
    phone_number: str = Field(...)
    otp_code: str = Field(...)
    name: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    phone_number: str
    subscription_tier: str

class UserProfileResponse(BaseModel):
    id: int
    phone_number: str
    name: Optional[str] = None
    subscription_tier: str
    subscription_expires_at: Optional[str] = None

# --- PAYMENT SCHEMAS ---
class PaymentPlanItem(BaseModel):
    id: str
    name: str
    price_inr: int
    interval: str
    features: List[str]

class CreatePaymentOrderRequest(BaseModel):
    plan_id: str = Field(..., description="pro_monthly or pro_yearly")

class PaymentOrderResponse(BaseModel):
    order_id: str
    amount_inr: int
    currency: str = "INR"
    razorpay_key_id: str

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    plan_id: str

class VerifyPaymentResponse(BaseModel):
    success: bool
    message: str
    subscription_tier: str

# --- MEASUREMENT SCHEMAS ---
class FrequencyMeasurementPoint(BaseModel):
    frequency_hz: float
    spl_db: float

class MeasurementUploadRequest(BaseModel):
    car_id: Optional[int] = None
    measurement_type: str = Field(default="pink_noise", description="pink_noise or sine_sweep")
    raw_data: List[FrequencyMeasurementPoint]

class MeasurementResponse(BaseModel):
    id: int
    measurement_type: str
    total_data_points: int
    smoothed_data: List[FrequencyMeasurementPoint]
    peak_resonance_frequencies_hz: List[float]
    recommended_cuts: List[Dict[str, Any]]
