"""
Measurement model - Audio frequency response measurements
"""
from sqlalchemy import Column, Integer, String, ForeignKey, JSON, DateTime, func
from app.database import Base

class Measurement(Base):
    __tablename__ = "measurements"
    
    id = Column(Integer, primary_key=True, index=True)
    user_equipment_id = Column(Integer, ForeignKey("user_equipment.id"), nullable=False)
    
    # Frequency response data (JSON array)
    # Example: [{"frequency": 20, "spl": 85.5}, {"frequency": 25, "spl": 87.2}, ...]
    frequency_response = Column(JSON, nullable=False)
    
    # Measurement type
    measurement_type = Column(String(50), default="pink_noise")  # pink_noise, sine_sweep
    
    # Timestamp
    measured_at = Column(DateTime, server_default=func.now())
    
    def __repr__(self):
        return f"<Measurement(id={self.id}, equipment_id={self.user_equipment_id}, type={self.measurement_type})>"
