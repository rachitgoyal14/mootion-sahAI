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
from app.schemas.student_actions import (
    ClassAnalyticsOverview,
    StudentDoubtResponse,
    TeacherDoubtRespondRequest,
)
from app.services.onboarding_service import (
    create_teacher_class,
    complete_teacher_onboarding,
    list_teacher_classes,
    setup_teacher_preferences,
)
from app.services.student_actions_service import (
    get_class_analytics_overview,
    get_chapter_analytics_drill,
    get_student_analytics_drill,
    list_class_doubts,
    respond_to_doubt,
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


@router.get("/classes/{class_id}/analytics/overview", response_model=ClassAnalyticsOverview)
def get_teacher_class_analytics(
    class_id: str,
    user=Depends(require_teacher),
    db: Session = Depends(get_db),
):
    return get_class_analytics_overview(db, user, class_id)


@router.get("/classes/{class_id}/chapters/{chapter_id}/analytics")
def get_teacher_chapter_analytics(
    class_id: str,
    chapter_id: str,
    user=Depends(require_teacher),
    db: Session = Depends(get_db),
):
    return get_chapter_analytics_drill(db, user, class_id, chapter_id)


@router.get("/students/{student_id}/analytics")
def get_teacher_student_analytics(
    student_id: str,
    user=Depends(require_teacher),
    db: Session = Depends(get_db),
):
    return get_student_analytics_drill(db, user, student_id)


@router.get("/classes/{class_id}/doubts", response_model=list[StudentDoubtResponse])
def get_teacher_class_doubts(
    class_id: str,
    user=Depends(require_teacher),
    db: Session = Depends(get_db),
):
    return list_class_doubts(db, class_id)


@router.post("/doubts/{doubt_id}/respond", response_model=StudentDoubtResponse)
def teacher_respond_doubt(
    doubt_id: str,
    request: TeacherDoubtRespondRequest,
    user=Depends(require_teacher),
    db: Session = Depends(get_db),
):
    return respond_to_doubt(
        db=db,
        teacher=user,
        doubt_id=doubt_id,
        response_text=request.response_text,
        voice_note_file_url=request.voice_note_file_url,
    )

