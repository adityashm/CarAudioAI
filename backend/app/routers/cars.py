"""
Cars API Router - Fetch Indian Car specifications and cabin acoustic geometries
"""
import json
import os
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.schemas.tuning import CarResponse

router = APIRouter()

DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "indian_cars.json")

def load_cars_data():
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

@router.get("", response_model=List[CarResponse])
async def list_cars(make: Optional[str] = Query(None, description="Filter by brand/make (e.g. Skoda, Maruti)")):
    """List all supported cars and their audio specifications"""
    cars = load_cars_data()
    if make:
        cars = [c for c in cars if c.get("make", "").lower() == make.lower()]
    return cars

@router.get("/{make}/{model}", response_model=CarResponse)
async def get_car_by_make_model(make: str, model: str):
    """Get detailed acoustic geometry and specs for a specific car model (e.g. Skoda Kylaq)"""
    cars = load_cars_data()
    for car in cars:
        if car.get("make", "").lower() == make.lower() and car.get("model", "").lower() == model.lower():
            return car
    raise HTTPException(status_code=404, detail=f"Car {make} {model} not found in database")
