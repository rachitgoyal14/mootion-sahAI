from __future__ import annotations

from pydantic import BaseModel, Field


class TeacherPreferenceOnboardingRequest(BaseModel):
    preferred_language: str = Field(default="english")


class TeacherPreferenceOnboardingResponse(BaseModel):
    preferred_language: str


class TeacherClassCreateRequest(BaseModel):
    grade: str = Field(min_length=1, max_length=16)
    subject: str = Field(min_length=1, max_length=255)


class TeacherClassCreateResponse(BaseModel):
    class_id: str
    class_code: str
    display_name: str
    grade: str
    subject: str


class ClassSummaryResponse(BaseModel):
    class_id: str
    class_code: str
    display_name: str
    grade: str
    subject: str


class TeacherOnboardingCompleteRequest(BaseModel):
    load_ncert: bool = True


class TeacherOnboardingCompleteResponse(BaseModel):
    onboarding_completed: bool
    ncert_requested: bool


class StudentJoinClassRequest(BaseModel):
    class_code: str = Field(min_length=3, max_length=32)


class StudentJoinClassResponse(BaseModel):
    class_id: str
    class_code: str
    display_name: str
    joined: bool


class StudentLanguageRequest(BaseModel):
    preferred_language: str = Field(default="english")


class StudentLanguageResponse(BaseModel):
    preferred_language: str
