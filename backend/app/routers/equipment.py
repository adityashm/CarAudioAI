"""
Equipment API Router - Fetch audio hardware catalog (Head units, Amps, Speakers, Subwoofers)
"""
import json
import os
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.schemas.tuning import EquipmentItem

router = APIRouter()

DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "equipment.json")

def load_equipment_data():
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

@router.get("", response_model=List[EquipmentItem])
async def list_equipment(
    category: Optional[str] = Query(None, description="Filter by category (dsp, amplifier, speaker, subwoofer, head_unit)"),
    brand: Optional[str] = Query(None, description="Filter by brand (e.g. Sony, Nakamichi, MOCO, Pioneer)")
):
    """List audio equipment items with specs, pricing, and links"""
    items = load_equipment_data()
    if category:
        items = [i for i in items if i.get("category", "").lower() == category.lower()]
    if brand:
        items = [i for i in items if i.get("brand", "").lower() == brand.lower()]
    return items

@router.get("/categories")
async def list_categories():
    """List all available equipment categories"""
    items = load_equipment_data()
    categories = sorted(list(set(i.get("category") for i in items if i.get("category"))))
    return {"categories": categories}
