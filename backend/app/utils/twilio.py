"""
Twilio utilities for phone authentication (OTP)
Using Twilio Verify API for secure OTP delivery
"""
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Initialize Twilio client
twilio_client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)


async def send_otp(phone_number: str) -> dict:
    """
    Send OTP to phone number using Twilio Verify
    
    Args:
        phone_number: Indian phone number with country code (+91xxxxxxxxxx)
    
    Returns:
        dict: {"success": bool, "message": str, "sid": str}
    """
    try:
        # Twilio Verify automatically generates and sends OTP
        verification = twilio_client.verify.v2.services(
            settings.TWILIO_VERIFY_SERVICE_SID
        ).verifications.create(
            to=phone_number,
            channel='sms'  # Can also use 'call' or 'whatsapp'
        )
        
        logger.info(f"OTP sent successfully to {phone_number}")
        
        return {
            "success": True,
            "message": "OTP sent successfully",
            "sid": verification.sid,
            "status": verification.status
        }
    
    except TwilioRestException as e:
        logger.error(f"Twilio error sending OTP: {e.msg}")
        return {
            "success": False,
            "message": f"Failed to send OTP: {e.msg}",
            "error_code": e.code
        }
    
    except Exception as e:
        logger.error(f"Unexpected error sending OTP: {str(e)}")
        return {
            "success": False,
            "message": "Failed to send OTP. Please try again.",
            "error": str(e)
        }


async def verify_otp(phone_number: str, otp_code: str) -> dict:
    """
    Verify OTP code for phone number
    
    Args:
        phone_number: Indian phone number with country code (+91xxxxxxxxxx)
        otp_code: 6-digit OTP code entered by user
    
    Returns:
        dict: {"success": bool, "message": str, "verified": bool}
    """
    try:
        verification_check = twilio_client.verify.v2.services(
            settings.TWILIO_VERIFY_SERVICE_SID
        ).verification_checks.create(
            to=phone_number,
            code=otp_code
        )
        
        if verification_check.status == "approved":
            logger.info(f"OTP verified successfully for {phone_number}")
            return {
                "success": True,
                "message": "Phone number verified successfully",
                "verified": True
            }
        else:
            logger.warning(f"Invalid OTP for {phone_number}")
            return {
                "success": False,
                "message": "Invalid OTP code",
                "verified": False
            }
    
    except TwilioRestException as e:
        logger.error(f"Twilio error verifying OTP: {e.msg}")
        return {
            "success": False,
            "message": f"Failed to verify OTP: {e.msg}",
            "verified": False,
            "error_code": e.code
        }
    
    except Exception as e:
        logger.error(f"Unexpected error verifying OTP: {str(e)}")
        return {
            "success": False,
            "message": "Failed to verify OTP. Please try again.",
            "verified": False,
            "error": str(e)
        }


def format_indian_phone(phone_number: str) -> str:
    """
    Format Indian phone number to international format
    
    Args:
        phone_number: Phone number (9876543210 or +919876543210)
    
    Returns:
        str: Formatted phone number (+919876543210)
    """
    # Remove spaces, dashes, parentheses
    cleaned = phone_number.replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
    
    # Add +91 if not present
    if not cleaned.startswith("+"):
        if cleaned.startswith("91"):
            cleaned = "+" + cleaned
        else:
            cleaned = "+91" + cleaned
    
    return cleaned


# Cost estimation helper (for monitoring)
def estimate_sms_cost(count: int = 1) -> dict:
    """
    Estimate Twilio SMS cost for India
    
    Args:
        count: Number of SMS to send
    
    Returns:
        dict: Cost estimation in USD and INR
    """
    cost_per_sms_usd = 0.0079  # Twilio India SMS rate
    cost_per_sms_inr = cost_per_sms_usd * 82  # Approximate conversion
    
    total_usd = count * cost_per_sms_usd
    total_inr = count * cost_per_sms_inr
    
    return {
        "count": count,
        "cost_per_sms_usd": cost_per_sms_usd,
        "cost_per_sms_inr": round(cost_per_sms_inr, 2),
        "total_usd": round(total_usd, 2),
        "total_inr": round(total_inr, 2),
        "credit_remaining_sms": int(50 / cost_per_sms_usd)  # $50 student credit
    }
