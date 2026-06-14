from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.models import OAuthAccount, OAuthState, Session as AuthSession, User


def get_user_by_login_id(db: Session, login_id: str) -> User | None:
    return db.scalar(select(User).where(User.login_id == login_id))


def get_user_by_id(db: Session, user_id: str) -> User | None:
    return db.get(User, user_id)


def create_user(db: Session, user: User) -> User:
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_session(db: Session, session_row: AuthSession) -> AuthSession:
    db.add(session_row)
    db.commit()
    db.refresh(session_row)
    return session_row


def get_session_by_refresh_hash(db: Session, refresh_token_hash: str) -> AuthSession | None:
    return db.scalar(select(AuthSession).where(AuthSession.refresh_token_hash == refresh_token_hash))


def revoke_session(db: Session, session_row: AuthSession) -> None:
    session_row.revoked_at = datetime.now(timezone.utc)
    db.commit()


def create_oauth_state(db: Session, oauth_state: OAuthState) -> OAuthState:
    db.add(oauth_state)
    db.commit()
    db.refresh(oauth_state)
    return oauth_state


def get_oauth_state(db: Session, provider: str, state: str) -> OAuthState | None:
    return db.scalar(select(OAuthState).where(OAuthState.provider == provider, OAuthState.state == state))


def delete_oauth_state(db: Session, oauth_state: OAuthState) -> None:
    db.delete(oauth_state)
    db.commit()


def get_oauth_account_by_provider_user_id(db: Session, provider: str, provider_user_id: str) -> OAuthAccount | None:
    return db.scalar(
        select(OAuthAccount).where(
            OAuthAccount.provider == provider,
            OAuthAccount.provider_user_id == provider_user_id,
        )
    )


def create_oauth_account(db: Session, oauth_account: OAuthAccount) -> OAuthAccount:
    db.add(oauth_account)
    db.commit()
    db.refresh(oauth_account)
    return oauth_account
