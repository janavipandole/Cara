from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt, JWTError
import os
from fastapi import Response
from app.database import get_db
from app import models
from app.schemas import UserRegister, UserLogin, Token, UserOut
from app.limiter import auth_limiter

from PIL import Image, ImageDraw
import io
import base64
import random
from collections import OrderedDict

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

pwd    = CryptContext(schemes=["bcrypt"], deprecated="auto")
router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


# -- Helper: build JWT --
def create_access_token(email: str) -> str:
    return jwt.encode(
        {
            "sub": email,
            "type": "access",
            "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_MINUTES)
        },
        SECRET_KEY,
        algorithm=ALGORITHM
    )

def create_refresh_token(email: str) -> str:
    return jwt.encode(
        {
            "sub": email,
            "type": "refresh",
            "exp": datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_DAYS)
        },
        SECRET_KEY,
        algorithm=ALGORITHM
    )

def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=ACCESS_TOKEN_MINUTES * 60
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=REFRESH_TOKEN_DAYS * 24 * 60 * 60
    )

# -- Helper: get current user from token --
def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
) -> models.User:
    token = request.cookies.get("access_token")
    if not token or not token.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = token.split(" ")[1]
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(401, "Invalid token type.")
        email: str = payload.get("sub")
        token_type = payload.get("type")
        if not email or token_type != "access":
            raise HTTPException(401, "Invalid token payload.")
    except JWTError:
        raise HTTPException(401, "Invalid or expired token.")

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(404, "User not found.")
    return user


# -- Register --
@router.post("/register", response_model=Token, status_code=201)
@auth_limiter.limit(os.getenv("RATE_LIMIT_AUTH", "10/minute"))
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

    access_token = create_access_token(user.email)
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
        {"captcha_answer": code, "exp": datetime.now(timezone.utc) + timedelta(minutes=5)},
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    return {"captcha_image": f"data:image/png;base64,{img_str}", "captcha_token": token}


# -- Login --
@router.post("/login", response_model=Token)
@auth_limiter.limit(os.getenv("RATE_LIMIT_AUTH", "10/minute"))
def login(request: Request, response: Response, payload: UserLogin, db: Session = Depends(get_db)):
    attempts = failed_login_attempts.get(payload.email, 0)
    
    if attempts >= 1:
        if not payload.captcha_token or not payload.captcha_answer:
            raise HTTPException(403, "Security captcha required.")
        try:
            token_payload = jwt.decode(payload.captcha_token, SECRET_KEY, algorithms=[ALGORITHM])
            expected = token_payload.get("captcha_answer")
            if not expected or expected.upper() != payload.captcha_answer.upper():
                raise HTTPException(403, "Invalid security code.")
        except JWTError:
            raise HTTPException(403, "Invalid or expired security code.")

    user = db.query(models.User).filter(models.User.email == payload.email).first()

    if not user or not pwd.verify(payload.password, user.hashed_password):
        # Only track failed attempts for valid emails to prevent botnets from 
        # flushing the LRU cache with random dummy emails (cache padding attack).
        if user:
            failed_login_attempts[payload.email] = attempts + 1
            failed_login_attempts.move_to_end(payload.email)
            
            # Enforce LRU bounds to prevent memory leaks from massive bot networks
            if len(failed_login_attempts) > MAX_TRACKED_EMAILS:
                failed_login_attempts.popitem(last=False)
            
        raise HTTPException(401, "Invalid email or password.")

    if not user.is_active:
        raise HTTPException(403, "Account is deactivated.")

    failed_login_attempts.pop(payload.email, None)

    access_token = create_access_token(user.email)
    refresh_token = create_refresh_token(user.email)
    
    set_auth_cookies(response, access_token, refresh_token)

    return Token(
        access_token = access_token,
        token_type   = "bearer",
        user         = UserOut.model_validate(user)
    )

@router.post("/refresh")
def refresh_token(request: Request, response: Response, db: Session = Depends(get_db)):
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
    except JWTError:
        raise HTTPException(401, "Invalid or expired refresh token.")
        
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user or not user.is_active:
        raise HTTPException(401, "User not found or inactive.")
        
    access_token = create_access_token(user.email)
    # Issue a new access token while keeping the same refresh token
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=ACCESS_TOKEN_MINUTES * 60
    )
    return {"message": "Token refreshed successfully"}

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user