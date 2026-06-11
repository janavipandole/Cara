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

SECRET_KEY = os.environ["SECRET_KEY"] #set it in .env 
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


# -- Login --
@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
def login(request: Request, payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()

    if not user or not pwd.verify(payload.password, user.hashed_password):
        raise HTTPException(401, "Invalid email or password.")

    if not user.is_active:
        raise HTTPException(403, "Account is deactivated.")

    return Token(
        access_token = create_token(user.email),
        token_type   = "bearer",
        user         = UserOut.model_validate(user)
    )


@router.get("/me", response_model=UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user