"""
Pydantic Schemas for Car, Equipment, and Audio Tuning API
"""
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

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
