from __future__ import annotations

from datetime import datetime, timezone, timedelta
from secrets import token_urlsafe
from urllib.parse import urlencode

import httpx
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.models import OAuthAccount, OAuthState, User
from app.repositories.auth_repository import (
    create_oauth_account,
    create_oauth_state,
    delete_oauth_state,
    get_oauth_account_by_provider_user_id,
    get_oauth_state,
    get_user_by_login_id,
)
from app.core.security import hash_password


def build_google_authorization_url(db: Session, requested_role: str) -> str:
    if not settings.google_oauth_client_id:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Google OAuth is not configured")

    state = token_urlsafe(32)
    create_oauth_state(
        db,
        OAuthState(
            provider="google",
            requested_role=requested_role,
            state=state,
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=10),
        ),
    )

    params = urlencode(
        {
            "client_id": settings.google_oauth_client_id,
            "redirect_uri": settings.google_oauth_redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "state": state,
            "access_type": "offline",
            "prompt": "consent",
        }
    )
    return f"https://accounts.google.com/o/oauth2/v2/auth?{params}"


async def complete_google_oauth(db: Session, code: str, state: str) -> User:
    if not settings.google_oauth_client_id or not settings.google_oauth_client_secret:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Google OAuth is not configured")

    state_row = get_oauth_state(db, "google", state)
    if not state_row or state_row.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OAuth state")

    token_payload = {
        "code": code,
        "client_id": settings.google_oauth_client_id,
        "client_secret": settings.google_oauth_client_secret,
        "redirect_uri": settings.google_oauth_redirect_uri,
        "grant_type": "authorization_code",
    }

    async with httpx.AsyncClient(timeout=20) as client:
        token_response = await client.post("https://oauth2.googleapis.com/token", data=token_payload)
        if token_response.status_code != 200:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google token exchange failed")

        token_data = token_response.json()
        if not token_data.get("id_token"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google ID token missing")

        userinfo_response = await client.get(
            "https://openidconnect.googleapis.com/v1/userinfo",
            headers={"Authorization": f"Bearer {token_data['access_token']}"},
        )
        if userinfo_response.status_code != 200:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google profile fetch failed")

    profile = userinfo_response.json()
    provider_user_id = profile.get("sub")
    email = profile.get("email")
    full_name = profile.get("name") or email or "Google User"

    oauth_account = get_oauth_account_by_provider_user_id(db, "google", provider_user_id)
    if oauth_account:
        user = db.get(User, oauth_account.user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Linked user not found")
    else:
        user = get_user_by_login_id(db, email) if email else None
        if not user:
            user = User(
                login_id=email or provider_user_id,
                role=state_row.requested_role,
                full_name=full_name,
                password_hash=hash_password(token_urlsafe(24)),
                preferred_language="english",
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        create_oauth_account(
            db,
            OAuthAccount(
                user_id=user.id,
                provider="google",
                provider_user_id=provider_user_id,
                email=email,
            ),
        )

    delete_oauth_state(db, state_row)
    return user
