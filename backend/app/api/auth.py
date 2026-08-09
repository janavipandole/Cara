from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt, JWTError
import os
from fastapi import Response
from ..database import get_db
from .. import models
from ..schemas import UserRegister, UserLogin, Token, UserOut, ForgotPasswordRequest, ResetPasswordRequest
from ..limiter import limiter
from PIL import Image, ImageDraw
import io
import base64
import random
import secrets
import hashlib
from collections import OrderedDict
import logging
import smtplib
from email.message import EmailMessage
import hmac

# In-memory tracking of failed attempts with an LRU bound to prevent OOM DOS attacks
failed_login_attempts = OrderedDict()
MAX_TRACKED_EMAILS = 1000

SECRET_KEY = os.environ.get("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError(
        "SECRET_KEY environment variable is not set. "
        "Add SECRET_KEY=<your-secret> to your .env file before starting the server."
    )
ALGORITHM  = "HS256"
ACCESS_TOKEN_MINUTES = 15
REFRESH_TOKEN_DAYS = 7
COOKIE_SAMESITE = "lax"
COOKIE_PATH = "/"

# email -> currently valid refresh token jti (rotation / revoke store)
active_refresh_jtis: dict[str, str] = {}

logger = logging.getLogger(__name__)

# -- Email delivery settings (stdlib SMTP; all optional) --
SMTP_HOST = os.environ.get("SMTP_HOST", "")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USERNAME = os.environ.get("SMTP_USERNAME", "")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")
SMTP_FROM = os.environ.get("SMTP_FROM", "Cara <noreply@cara.example.com>")
SMTP_USE_TLS = os.environ.get("SMTP_USE_TLS", "true").lower() in ("1", "true", "yes")
APP_BASE_URL = os.environ.get("APP_BASE_URL", "http://localhost:8000")

pwd    = CryptContext(schemes=["bcrypt"], deprecated="auto")
router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def captcha_answer_digest(answer: str) -> str:
    """HMAC the captcha answer so JWT payloads never carry the plaintext code."""
    return hmac.new(
        SECRET_KEY.encode("utf-8"),
        answer.strip().upper().encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def cookie_secure() -> bool:
    return os.environ.get("COOKIE_SECURE", "true").lower() in ("1", "true", "yes")


# -- Helper: build JWT --
def create_access_token(email: str, token_version: int = 0) -> str:
    return jwt.encode(
        {
            "sub": email,
            "type": "access",
            "token_version": token_version,
            "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_MINUTES)
        },
        SECRET_KEY,
        algorithm=ALGORITHM
    )

def create_refresh_token(email: str) -> str:
    jti = secrets.token_urlsafe(32)
    token = jwt.encode(
        {
            "sub": email,
            "type": "refresh",
            "jti": jti,
            "exp": datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_DAYS),
        },
        SECRET_KEY,
        algorithm=ALGORITHM,
    )
    active_refresh_jtis[email] = jti
    return token

def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    secure = cookie_secure()
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        secure=secure,
        samesite=COOKIE_SAMESITE,
        path=COOKIE_PATH,
        max_age=ACCESS_TOKEN_MINUTES * 60,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=secure,
        samesite=COOKIE_SAMESITE,
        path=COOKIE_PATH,
        max_age=REFRESH_TOKEN_DAYS * 24 * 60 * 60,
    )

def clear_auth_cookies(response: Response):
    # Flags must match set_cookie or browsers may keep the session cookies.
    secure = cookie_secure()
    for key in ("access_token", "refresh_token"):
        response.delete_cookie(
            key,
            path=COOKIE_PATH,
            secure=secure,
            samesite=COOKIE_SAMESITE,
        )

def revoke_refresh_token(email: str | None):
    if email:
        active_refresh_jtis.pop(email, None)

def assert_refresh_jti(email: str, jti: str | None):
    expected = active_refresh_jtis.get(email)
    if not jti or not expected or not hmac.compare_digest(expected, jti):
        raise HTTPException(401, "Invalid or revoked refresh token.")

# -- Helper: get current user from token --
def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
) -> models.User:
    auth_header = request.headers.get("Authorization", "")
    token = None

    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1]
    else:
        cookie_token = request.cookies.get("access_token")
        if cookie_token and cookie_token.startswith("Bearer "):
            token = cookie_token.split(" ", 1)[1]

    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(401, "Invalid token type.")
        email: str = payload.get("sub")
        if not email:
            raise HTTPException(401, "Invalid token payload.")
    except JWTError:
        raise HTTPException(401, "Invalid or expired token.")

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(404, "User not found.")
    if not user.is_active:
        raise HTTPException(403, "Account is deactivated.")
    if payload.get("token_version") != user.token_version:
        # The token was issued before a password reset for this account.
        raise HTTPException(401, "Token has been revoked.")
    return user


# -- Register --
@router.post("/register", response_model=Token, status_code=201)
@limiter.limit("5/minute")
def register(request: Request, response: Response, payload: UserRegister, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == payload.email).first():
        raise HTTPException(409, "Email already registered.")
    if db.query(models.User).filter(models.User.username == payload.username).first():
        raise HTTPException(409, "Username already taken.")

    user = models.User(
        username        = payload.username,
        email           = payload.email,
        hashed_password = pwd.hash(payload.password),
        role            = "USER",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(user.email, user.token_version)
    refresh_token = create_refresh_token(user.email)
    
    set_auth_cookies(response, access_token, refresh_token)

    return Token(
        access_token = access_token,
        token_type   = "bearer",
        user         = UserOut.model_validate(user)
    )


# -- Captcha --
@router.get("/captcha")
def get_captcha():
    chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    code = ''.join(random.choices(chars, k=5))
    
    img = Image.new('RGB', (160, 50), color=(243, 243, 243))
    d = ImageDraw.Draw(img)
    # Simple text drawing since specific fonts might not be installed
    d.text((40, 20), code, fill=(8, 129, 120))
    
    for _ in range(5):
        d.line([(random.randint(0,160), random.randint(0,50)), 
                (random.randint(0,160), random.randint(0,50))], fill=(100,100,100), width=1)
                
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    
    token = jwt.encode(
        {
            "captcha_hash": captcha_answer_digest(code),
            "exp": datetime.now(timezone.utc) + timedelta(minutes=5),
        },
        SECRET_KEY,
        algorithm=ALGORITHM,
    )
    return {"captcha_image": f"data:image/png;base64,{img_str}", "captcha_token": token}


# -- Login --
@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
def login(request: Request, response: Response, payload: UserLogin, db: Session = Depends(get_db)):
    email_hash = hashlib.sha256(payload.email.encode('utf-8')).hexdigest()
    attempts = failed_login_attempts.get(email_hash, 0)
    
    if attempts >= 1:
        if not payload.captcha_token or not payload.captcha_answer:
            raise HTTPException(403, "Security captcha required.")
        try:
            token_payload = jwt.decode(payload.captcha_token, SECRET_KEY, algorithms=[ALGORITHM])
            expected = token_payload.get("captcha_hash")
            if not expected or not hmac.compare_digest(
                expected, captcha_answer_digest(payload.captcha_answer or "")
            ):
                raise HTTPException(403, "Invalid security code.")
        except JWTError:
            raise HTTPException(403, "Invalid or expired security code.")

    user = db.query(models.User).filter(models.User.email == payload.email).first()

    if not user or not pwd.verify(payload.password, user.hashed_password):
        failed_login_attempts[email_hash] = attempts + 1
        failed_login_attempts.move_to_end(email_hash)
        
        # Enforce LRU bounds to prevent memory leaks from massive bot networks
        if len(failed_login_attempts) > MAX_TRACKED_EMAILS:
            failed_login_attempts.popitem(last=False)
            
        raise HTTPException(401, "Invalid email or password.")

    if not user.is_active:
        raise HTTPException(403, "Account is deactivated.")

    failed_login_attempts.pop(email_hash, None)

    access_token = create_access_token(user.email, user.token_version)
    refresh_token = create_refresh_token(user.email)
    
    set_auth_cookies(response, access_token, refresh_token)

    return Token(
        access_token = access_token,
        token_type   = "bearer",
        user         = UserOut.model_validate(user)
    )

@router.post("/refresh")
def refresh_access_token(request: Request, response: Response, db: Session = Depends(get_db)):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(401, "Invalid token type.")
        email: str = payload.get("sub")
        if not email:
            raise HTTPException(401, "Invalid token.")
        assert_refresh_jti(email, payload.get("jti"))
    except JWTError:
        raise HTTPException(401, "Invalid or expired refresh token.")

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user or not user.is_active:
        raise HTTPException(401, "User not found or inactive.")

    access_token = create_access_token(user.email, user.token_version)
    new_refresh_token = create_refresh_token(user.email)
    set_auth_cookies(response, access_token, new_refresh_token)
    return {"message": "Token refreshed successfully"}

def send_password_reset_email(recipient: str, token: str) -> bool:
    """Send a password reset email with a one-click reset link.

    Returns False when SMTP is not configured so callers can fall back to
    returning the token to the client (the flow the frontend already uses).
    """
    if not SMTP_HOST:
        return False

    reset_link = f"{APP_BASE_URL.rstrip('/')}/forgotPassword.html?token={token}"
    subject = "Cara - Reset your password"
    text = (
        "Hi,\n\n"
        "We received a request to reset your password. Click the link below "
        f"to choose a new password (valid for 1 hour):\n\n{reset_link}\n\n"
        "If you didn't request this, you can safely ignore this email.\n\n"
        "- The Cara Team"
    )
    html = (
        "<p>We received a request to reset your password. Click the link below "
        "to choose a new password (valid for 1 hour):</p>"
        f'<p><a href="{reset_link}">Reset my password</a></p>'
        "<p>If you didn't request this, you can safely ignore this email.</p>"
    )

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = SMTP_FROM
    msg["To"] = recipient
    msg.set_content(text)
    msg.add_alternative(html, subtype="html")

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
            if SMTP_USE_TLS:
                server.starttls()
            if SMTP_USERNAME:
                server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
        logger.info("Password reset email sent to %s", recipient)
        return True
    except Exception as exc:  # never break the reset flow on delivery failure
        logger.warning("Failed to send password reset email: %s", exc)
        return False

@router.post("/forgot-password")
@limiter.limit("5/minute")
def forgot_password(
    request: Request,
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user:
        return {"message": "If the email exists, a reset link has been sent"}

    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)

    reset_token = models.PasswordResetToken(
        user_id=user.id,
        token=token,
        expires_at=expires_at,
    )
    db.add(reset_token)
    db.commit()

    # Deliver the reset link. When SMTP is configured the email is sent with a
    # link containing the token; otherwise the token is returned so the app's
    # existing client-side flow (forgotPassword.js) can complete the reset.
    email_sent = send_password_reset_email(user.email, token)

    return {
        "message": "If the email exists, a reset link has been sent",
        "reset_token": token,
        "email_sent": email_sent,
    }


@router.post("/reset-password")
@limiter.limit("5/minute")
def reset_password(
    request: Request,
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    reset_token = (
        db.query(models.PasswordResetToken)
        .filter(
            models.PasswordResetToken.token == payload.token,
            models.PasswordResetToken.used == False,
            models.PasswordResetToken.expires_at > datetime.now(timezone.utc),
        )
        .first()
    )
    if not reset_token:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user = db.query(models.User).filter(models.User.id == reset_token.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = pwd.hash(payload.new_password)
    user.token_version += 1
    reset_token.used = True
    # Invalidate outstanding sessions so a stolen refresh token cannot outlive the reset.
    revoke_refresh_token(user.email)
    db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.user_id == user.id,
        models.PasswordResetToken.used == False,
        models.PasswordResetToken.id != reset_token.id,
    ).update({"used": True})
    db.commit()

    return {"message": "Password has been reset successfully"}


@router.post("/logout")
def logout(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if token:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            if payload.get("type") == "refresh":
                revoke_refresh_token(payload.get("sub"))
        except JWTError:
            pass
    clear_auth_cookies(response)
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user