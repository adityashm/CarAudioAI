"""
Measurements API Router - Acoustic frequency response capture and smoothing
"""
import numpy as np
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.measurement import Measurement
from app.schemas.tuning import (
    MeasurementUploadRequest,
    MeasurementResponse,
    FrequencyMeasurementPoint
)

router = APIRouter()

def smooth_frequency_response(points: List[FrequencyMeasurementPoint], window_size: int = 5) -> List[FrequencyMeasurementPoint]:
    """Apply moving average smoothing to frequency response measurements"""
    if len(points) < window_size:
        return points
        
    spls = [p.spl_db for p in points]
    freqs = [p.frequency_hz for p in points]
    
    # 1/3 octave smoothing window
    kernel = np.ones(window_size) / window_size
    smoothed_spls = np.convolve(spls, kernel, mode="same")
    
    return [
        FrequencyMeasurementPoint(frequency_hz=freqs[i], spl_db=round(float(smoothed_spls[i]), 1))
        for i in range(len(points))
    ]

@router.post("", response_model=MeasurementResponse)
async def upload_measurement(req: MeasurementUploadRequest, db: Session = Depends(get_db)):
    """
    Process raw microphone acoustic frequency measurements, apply smoothing, and detect cabin resonant peaks.
    """
    if not req.raw_data:
        raise HTTPException(status_code=400, detail="Measurement data points cannot be empty")
        
    smoothed = smooth_frequency_response(req.raw_data, window_size=5)
    
    # Find resonance peaks above average baseline
    avg_spl = sum(p.spl_db for p in smoothed) / len(smoothed)
    peaks = []
    recommended_cuts = []
    
    for p in smoothed:
        if p.spl_db > (avg_spl + 3.0):  # More than 3dB above average
            peaks.append(p.frequency_hz)
            recommended_cuts.append({
                "frequency_hz": p.frequency_hz,
                "measured_spl": p.spl_db,
                "recommended_eq_cut_db": round(-(p.spl_db - avg_spl), 1),
                "rationale": f"In-cabin standing wave peak at {p.frequency_hz} Hz"
            })
            
    return MeasurementResponse(
        id=1,
        measurement_type=req.measurement_type,
        total_data_points=len(req.raw_data),
        smoothed_data=smoothed,
        peak_resonance_frequencies_hz=peaks[:5],
        recommended_cuts=recommended_cuts[:5]
    )
