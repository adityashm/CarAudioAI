"""
Configuration settings for CarAudioAI backend
Loads environment variables and provides application settings
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os

class Settings(BaseSettings):
    """Application settings"""
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost/caraudio_dev"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:8081",  # Expo dev server
        "http://localhost:19000",
        "http://localhost:19001",
        "http://localhost:19002",
        "exp://192.168.*.*:*",  # Expo LAN
    ]
    
    # Twilio (Phone Authentication - FREE $50 with GitHub Student Pack)
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_VERIFY_SERVICE_SID: str = ""
    TWILIO_FROM_PHONE: str = ""  # Your Twilio phone number
    
    # Razorpay (Indian Payments)
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = ""
    
    # DigitalOcean Spaces (S3-compatible - FREE with $200 credit)
    SPACES_REGION: str = "blr1"  # Bangalore datacenter
    SPACES_ENDPOINT: str = "https://blr1.digitaloceanspaces.com"
    SPACES_KEY: str = ""
    SPACES_SECRET: str = ""
    SPACES_BUCKET: str = "caraudio-files"
    
    # Sentry (Error Tracking - FREE for students)
    SENTRY_DSN: str = ""
    SENTRY_ENVIRONMENT: str = "development"
    
    # Subscription Plans (in INR)
    FREE_TIER_FEATURES: List[str] = ["basic_eq", "1_car", "limited_measurements"]
    PRO_MONTHLY_PRICE: int = 99
    PRO_YEARLY_PRICE: int = 999
    
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

settings = Settings()
