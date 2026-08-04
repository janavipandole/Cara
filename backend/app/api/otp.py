from fastapi import APIRouter, HTTPException
from ..schemas import SendOTPRequest, VerifyOTPRequest
from ..limiter import limiter
from fastapi import Request
import random
import time

router = APIRouter()

# In-memory store for OTPs (phone -> {"code": code, "expires_at": timestamp})
otp_store = {}

@router.post("/send")
@limiter.limit("3/minute")
def send_otp(request: Request, payload: SendOTPRequest):
    phone = payload.phone.strip()
    if not phone:
        raise HTTPException(status_code=400, detail="Phone number is required")
    
    # Generate 6-digit OTP
    code = f"{random.randint(100000, 999999)}"
    
    # Store with 5 minute expiration
    otp_store[phone] = {
        "code": code,
        "expires_at": time.time() + 300
    }
    
    # Format according to WebOTP API requirements
    sms_message = f"Your Cara verification code is {code}.\n\n@cara.com #{code}"
    
    # In a real app, integrate with Twilio/SNS here.
    # For now, we just print to console for development verification.
    print(f"--- MOCK SMS SENT TO {phone} ---")
    print(sms_message)
    print("---------------------------------")
    
    return {"message": "OTP sent successfully"}

@router.post("/verify")
@limiter.limit("5/minute")
def verify_otp(request: Request, payload: VerifyOTPRequest):
    phone = payload.phone.strip()
    code = payload.code.strip()
    
    if phone not in otp_store:
        raise HTTPException(status_code=400, detail="No OTP found for this number")
        
    otp_data = otp_store[phone]
    if time.time() > otp_data["expires_at"]:
        del otp_store[phone]
        raise HTTPException(status_code=400, detail="OTP expired")
        
    if otp_data["code"] != code:
        raise HTTPException(status_code=400, detail="Invalid OTP")
        
    # Successfully verified, remove from store
    del otp_store[phone]
    return {"message": "Phone number verified successfully"}
