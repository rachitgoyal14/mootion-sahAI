from __future__ import annotations

from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.models import Session as AuthSession, User
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    hash_refresh_token,
    verify_password,
)


router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    login_id: str = Field(min_length=3, max_length=64)
    full_name: str = Field(min_length=1, max_length=255)
    role: str = Field(pattern="^(teacher|student)$")
    password: str = Field(min_length=8, max_length=128)
    preferred_language: str = Field(default="english")


class LoginRequest(BaseModel):
    login_id: str = Field(min_length=3, max_length=64)
    password: str = Field(min_length=1, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    user_id: str


class RefreshRequest(BaseModel):
    refresh_token: str


def _issue_tokens(db: Session, user: User) -> TokenResponse:
    access_token = create_access_token(str(user.id), user.role)
    refresh_token = create_refresh_token()
    expires_at = datetime.now(timezone.utc) + timedelta(days=30)

    db.add(
        AuthSession(
            user_id=user.id,
            refresh_token_hash=hash_refresh_token(refresh_token),
            expires_at=expires_at,
        )
    )
    db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        role=user.role,
        user_id=str(user.id),
    )


@router.post("/register", response_model=TokenResponse)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    existing_user = db.scalar(select(User).where(User.login_id == request.login_id))
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="login_id already exists")

    user = User(
        login_id=request.login_id,
        role=request.role,
        full_name=request.full_name,
        password_hash=hash_password(request.password),
        preferred_language=request.preferred_language,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return _issue_tokens(db, user)


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.login_id == request.login_id))
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    return _issue_tokens(db, user)


@router.post("/refresh", response_model=TokenResponse)
def refresh(request: RefreshRequest, db: Session = Depends(get_db)):
    session_row = db.scalar(select(AuthSession).where(AuthSession.refresh_token_hash == hash_refresh_token(request.refresh_token)))
    if not session_row or session_row.revoked_at is not None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user = db.get(User, session_row.user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    session_row.revoked_at = datetime.now(timezone.utc)
    db.commit()

    return _issue_tokens(db, user)


@router.post("/logout")
def logout(request: RefreshRequest, db: Session = Depends(get_db)):
    session_row = db.scalar(select(AuthSession).where(AuthSession.refresh_token_hash == hash_refresh_token(request.refresh_token)))
    if not session_row or session_row.revoked_at is not None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    session_row.revoked_at = datetime.now(timezone.utc)
    db.commit()
    return {"ok": True}
