"""
TuningProfile model - AI-generated tuning configurations
"""
from sqlalchemy import Column, Integer, Float, ForeignKey, JSON, Text, DateTime, func
from app.database import Base

class TuningProfile(Base):
    __tablename__ = "tuning_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_equipment_id = Column(Integer, ForeignKey("user_equipment.id"), nullable=False)
    
    # Crossover settings (JSON)
    # Example: {"tweeter": {"type": "highpass", "frequency": 3500, "slope": 24}, ...}
    crossover_settings = Column(JSON, nullable=True)
    
    # Parametric EQ settings (JSON array)
    # Example: [{"band": 1, "frequency": 63, "gain": -3.5, "q": 1.2}, ...]
    eq_settings = Column(JSON, nullable=True)
    
    # Time alignment (JSON)
    # Example: {"tweeter_left": 0.5, "woofer_left": 1.2, "subwoofer": 3.5} in milliseconds
    time_alignment = Column(JSON, nullable=True)
    
    # Gain structure (JSON)
    # Example: {"master": 0, "front": -2, "rear": -6, "sub": -3} in dB
    gain_settings = Column(JSON, nullable=True)
    
    # DSP configuration file URL (S3)
    dsp_file_url = Column(Text, nullable=True)
    
    # Improvement score (percentage)
    improvement_score = Column(Float, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    
    def __repr__(self):
        return f"<TuningProfile(id={self.id}, equipment_id={self.user_equipment_id}, score={self.improvement_score})>"
