from __future__ import annotations

from pydantic import BaseModel, Field


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


class OAuthStartResponse(BaseModel):
    authorization_url: str


class OAuthStartRequest(BaseModel):
    role: str = Field(pattern="^(teacher|student)$")


class OAuthCallbackResponse(TokenResponse):
    pass


class UserResponse(BaseModel):
    user_id: str
    login_id: str
    role: str
    full_name: str
    preferred_language: str
    onboarding_completed: bool
