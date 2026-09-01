"""
Payment model - Razorpay transaction history
"""
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from app.database import Base

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Razorpay transaction details
    razorpay_payment_id = Column(String(100), unique=True, nullable=True)
    razorpay_order_id = Column(String(100), nullable=True)
    razorpay_signature = Column(String(255), nullable=True)
    
    # Payment details
    amount_inr = Column(Integer, nullable=False)  # Amount in paise (100 paise = 1 rupee)
    status = Column(String(50), default="pending")  # pending, captured, failed, refunded
    
    # Subscription info
    subscription_tier = Column(String(20), nullable=True)  # pro_monthly, pro_yearly
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    
    def __repr__(self):
        return f"<Payment(id={self.id}, user_id={self.user_id}, amount={self.amount_inr/100}, status={self.status})>"
