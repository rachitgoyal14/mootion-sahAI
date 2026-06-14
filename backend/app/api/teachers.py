from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_teacher
from app.schemas.auth import UserResponse
from app.schemas.onboarding import (
    ClassSummaryResponse,
    TeacherClassCreateRequest,
    TeacherClassCreateResponse,
    TeacherOnboardingCompleteRequest,
    TeacherOnboardingCompleteResponse,
    TeacherPreferenceOnboardingRequest,
    TeacherPreferenceOnboardingResponse,
)
from app.services.onboarding_service import (
    create_teacher_class,
    complete_teacher_onboarding,
    list_teacher_classes,
    setup_teacher_preferences,
)

router = APIRouter(prefix="/teachers", tags=["teachers"])


@router.get("/me", response_model=UserResponse)
def teacher_me(user=Depends(require_teacher)):
    return UserResponse(
        user_id=str(user.id),
        login_id=user.login_id,
        role=user.role,
        full_name=user.full_name,
        preferred_language=user.preferred_language,
        onboarding_completed=user.onboarding_completed,
    )


@router.post("/onboarding/preferences", response_model=TeacherPreferenceOnboardingResponse)
def teacher_onboarding_preferences(
    request: TeacherPreferenceOnboardingRequest,
    user=Depends(require_teacher),
    db: Session = Depends(get_db),
):
    return setup_teacher_preferences(db, user, request)


@router.post("/classes", response_model=TeacherClassCreateResponse)
def teacher_create_class(
    request: TeacherClassCreateRequest,
    user=Depends(require_teacher),
    db: Session = Depends(get_db),
):
    return create_teacher_class(db, user, request)


@router.get("/classes", response_model=list[ClassSummaryResponse])
def teacher_classes(user=Depends(require_teacher), db: Session = Depends(get_db)):
    return list_teacher_classes(db, user)


@router.post("/onboarding/complete", response_model=TeacherOnboardingCompleteResponse)
def teacher_onboarding_complete(
    request: TeacherOnboardingCompleteRequest,
    user=Depends(require_teacher),
    db: Session = Depends(get_db),
):
    return complete_teacher_onboarding(db, user, request)
