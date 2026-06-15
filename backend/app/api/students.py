from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_student
from app.schemas.auth import UserResponse
from app.schemas.onboarding import (
    ClassSummaryResponse,
    StudentJoinClassRequest,
    StudentJoinClassResponse,
    StudentLanguageRequest,
    StudentLanguageResponse,
)
from app.schemas.student_actions import (
    StudentDoubtCreateRequest,
    StudentDoubtResponse,
    QuotaResponse,
    PlaygroundGenerateRequest,
    PlaygroundGenerateResponse,
)
from app.services.onboarding_service import join_student_class, list_student_classes, set_student_language
from app.services.student_actions_service import (
    submit_student_doubt,
    get_or_create_quota,
    generate_playground_item,
)

router = APIRouter(prefix="/students", tags=["students"])


@router.get("/me", response_model=UserResponse)
def student_me(user=Depends(require_student)):
    return UserResponse(
        user_id=str(user.id),
        login_id=user.login_id,
        role=user.role,
        full_name=user.full_name,
        preferred_language=user.preferred_language,
        onboarding_completed=user.onboarding_completed,
    )


@router.post("/join-class", response_model=StudentJoinClassResponse)
def student_join_class(
    request: StudentJoinClassRequest,
    user=Depends(require_student),
    db: Session = Depends(get_db),
):
    return join_student_class(db, user, request)


@router.get("/classes", response_model=list[ClassSummaryResponse])
def student_classes(user=Depends(require_student), db: Session = Depends(get_db)):
    return list_student_classes(db, user)


@router.post("/language", response_model=StudentLanguageResponse)
def student_language(
    request: StudentLanguageRequest,
    user=Depends(require_student),
    db: Session = Depends(get_db),
):
    return set_student_language(db, user, request)


@router.post("/doubts", response_model=StudentDoubtResponse)
def create_doubt(
    request: StudentDoubtCreateRequest,
    user=Depends(require_student),
    db: Session = Depends(get_db),
):
    return submit_student_doubt(
        db=db,
        student=user,
        class_id=request.class_id,
        query_text=request.query_text,
        tried_before=request.tried_before,
        attempt_text=request.attempt_text,
    )


@router.get("/quotas", response_model=QuotaResponse)
def get_quotas(
    user=Depends(require_student),
    db: Session = Depends(get_db),
):
    q = get_or_create_quota(db, str(user.id))
    return QuotaResponse(
        doubt_videos_used_today=q.doubt_videos_used_today,
        playground_items_used_week=q.playground_items_used_week,
    )


@router.post("/playground/generate", response_model=PlaygroundGenerateResponse)
def generate_playground(
    request: PlaygroundGenerateRequest,
    user=Depends(require_student),
    db: Session = Depends(get_db),
):
    return generate_playground_item(
        db=db,
        student=user,
        topic=request.topic,
        asset_type=request.asset_type,
    )

