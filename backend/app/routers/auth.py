from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import auth
from app.database import get_db
from app.models import User
from app.schemas import LoginRequest, RegisterRequest, TokenResponse, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    email = body.email.lower()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(400, "An account with this email already exists")
    user = User(
        email=email,
        password_hash=auth.hash_password(body.password),
        display_name=body.display_name,
    )
    db.add(user)
    db.commit()
    return TokenResponse(access_token=auth.create_access_token(user.id), user=user)


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email.lower()).first()
    if user is None or not auth.verify_password(body.password, user.password_hash):
        raise HTTPException(401, "Incorrect email or password")
    return TokenResponse(access_token=auth.create_access_token(user.id), user=user)


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(auth.get_current_user)):
    return user
