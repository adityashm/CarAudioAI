"""
Equipment model - Audio equipment catalog (Indian market)
"""
from sqlalchemy import Column, Integer, String, JSON, Text
from app.database import Base

class Equipment(Base):
    __tablename__ = "equipment"
    
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(50), nullable=False, index=True)  # dsp, amplifier, speaker, subwoofer
    brand = Column(String(50), nullable=False, index=True)  # Pioneer, Sony, JBL, etc.
    model = Column(String(100), nullable=False)
    
    # Technical specifications (JSON)
    specs = Column(JSON, nullable=False)
    # Example for DSP: {"channels": 8, "eq_bands": 31, "time_alignment": true}
    # Example for Amp: {"channels": 4, "rms_power": 100, "impedance": "2-8 ohm"}
    # Example for Speaker: {"size": "6.5", "type": "component", "frequency_response": "50-20000", "impedance": 4, "rms": 100}
    
    # Pricing (INR)
    price_inr = Column(Integer, nullable=True)
    
    # Purchase links
    amazon_link = Column(Text, nullable=True)
    flipkart_link = Column(Text, nullable=True)
    
    def __repr__(self):
        return f"<Equipment(id={self.id}, category={self.category}, brand={self.brand}, model={self.model})>"
