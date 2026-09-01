"""
User model - Stores user accounts with phone authentication
"""
from sqlalchemy import Column, Integer, String, DateTime, func
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(15), unique=True, nullable=False, index=True)
    firebase_uid = Column(String(128), unique=True, nullable=True)
    name = Column(String(100), nullable=True)
    
    # Subscription info
    subscription_tier = Column(String(20), default="free")  # free, pro_monthly, pro_yearly
    subscription_expires_at = Column(DateTime, nullable=True)
    
    # Razorpay customer ID
    razorpay_customer_id = Column(String(100), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<User(id={self.id}, phone={self.phone_number}, tier={self.subscription_tier})>"
