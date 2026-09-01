"""
Car model - Indian car models database
"""
from sqlalchemy import Column, Integer, String, JSON
from app.database import Base

class Car(Base):
    __tablename__ = "cars"
    
    id = Column(Integer, primary_key=True, index=True)
    make = Column(String(50), nullable=False, index=True)  # Maruti, Hyundai, etc.
    model = Column(String(100), nullable=False, index=True)  # Swift, Creta, etc.
    year = Column(Integer, nullable=True)
    
    # Factory audio specifications
    factory_head_unit = Column(String(100), nullable=True)
    front_speaker_size = Column(String(20), nullable=True)  # e.g., "6.5 inch"
    rear_speaker_size = Column(String(20), nullable=True)
    tweeter_location = Column(String(50), nullable=True)  # e.g., "A-pillar", "Door"
    
    # Additional specs stored as JSON
    specs = Column(JSON, nullable=True)  # door dimensions, deck size, etc.
    
    def __repr__(self):
        return f"<Car(id={self.id}, make={self.make}, model={self.model}, year={self.year})>"
