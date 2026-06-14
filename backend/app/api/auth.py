from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.auth import (
    LoginRequest,
    OAuthCallbackResponse,
    OAuthStartRequest,
    OAuthStartResponse,
    RefreshRequest,
    RegisterRequest,
    UserResponse,
    TokenResponse,
)
from app.core.deps import get_current_user
from app.services.auth_service import (
    google_callback_login,
    google_start_url,
    logout_user,
    login_user,
    refresh_user_tokens,
    register_user,
)


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    return register_user(db, request)


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    return login_user(db, request)


@router.post("/refresh", response_model=TokenResponse)
def refresh(request: RefreshRequest, db: Session = Depends(get_db)):
    return refresh_user_tokens(db, request)


@router.post("/logout")
def logout(request: RefreshRequest, db: Session = Depends(get_db)):
    return logout_user(db, request)


@router.post("/google/start", response_model=OAuthStartResponse)
def google_start(request: OAuthStartRequest, db: Session = Depends(get_db)):
    return OAuthStartResponse(authorization_url=google_start_url(db, request))


@router.get("/google/callback", response_model=OAuthCallbackResponse)
async def google_callback(code: str, state: str, db: Session = Depends(get_db)):
    return await google_callback_login(db, code=code, state=state)


@router.get("/me", response_model=UserResponse)
def me(user=Depends(get_current_user)):
    return UserResponse(
        user_id=str(user.id),
        login_id=user.login_id,
        role=user.role,
        full_name=user.full_name,
        preferred_language=user.preferred_language,
        onboarding_completed=user.onboarding_completed,
    )
