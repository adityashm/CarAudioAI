"""
UserEquipment model - User's car audio setup
Links user to their car and equipment configuration
"""
from sqlalchemy import Column, Integer, String, ForeignKey, ARRAY, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base

class UserEquipment(Base):
    __tablename__ = "user_equipment"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    car_id = Column(Integer, ForeignKey("cars.id"), nullable=False)
    
    # Equipment references
    dsp_id = Column(Integer, ForeignKey("equipment.id"), nullable=True)
    subwoofer_id = Column(Integer, ForeignKey("equipment.id"), nullable=True)
    
    # Arrays for multiple items
    amplifier_ids = Column(ARRAY(Integer), nullable=True)  # Can have multiple amps
    speaker_ids = Column(ARRAY(Integer), nullable=True)  # Front, rear speakers
    
    # User-defined name
    setup_name = Column(String(100), default="My Setup")
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    
    def __repr__(self):
        return f"<UserEquipment(id={self.id}, user_id={self.user_id}, setup={self.setup_name})>"
