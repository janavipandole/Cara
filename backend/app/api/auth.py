from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt, JWTError
import os
from app.database import get_db
from app import models
from app.schemas import UserRegister, UserLogin, Token, UserOut
from app.limiter import limiter
from PIL import Image, ImageDraw
import io
import base64
import random

# In-memory tracking of failed attempts by email to enforce captcha
failed_login_attempts = {}

SECRET_KEY = os.environ.get("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError(
        "SECRET_KEY environment variable is not set. "
        "Add SECRET_KEY=<your-secret> to your .env file before starting the server."
    )
ALGORITHM  = "HS256"
TOKEN_DAYS = 7

pwd    = CryptContext(schemes=["bcrypt"], deprecated="auto")
router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# -- Helper: build JWT --
def create_token(email: str) -> str:
    return jwt.encode(
        {
            "sub": email,
            "exp": datetime.now(timezone.utc) + timedelta(days=TOKEN_DAYS)
        },
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# -- Helper: get current user from token --
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> models.User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            raise HTTPException(401, "Invalid token.")
    except JWTError:
        raise HTTPException(401, "Invalid or expired token.")

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(404, "User not found.")
    return user


# -- Register --
@router.post("/register", response_model=Token, status_code=201)
@limiter.limit("5/minute")
def register(request: Request, payload: UserRegister, db: Session = Depends(get_db)):
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

    return Token(
        access_token = create_token(user.email),
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
@limiter.limit("5/minute")
def login(request: Request, payload: UserLogin, db: Session = Depends(get_db)):
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
        failed_login_attempts[payload.email] = attempts + 1
        raise HTTPException(401, "Invalid email or password.")

    if not user.is_active:
        raise HTTPException(403, "Account is deactivated.")

    failed_login_attempts.pop(payload.email, None)

    return Token(
        access_token = create_token(user.email),
        token_type   = "bearer",
        user         = UserOut.model_validate(user)
    )


@router.get("/me", response_model=UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user