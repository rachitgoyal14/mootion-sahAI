from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.models import CurriculumPlan, User
from app.repositories.curriculum_repository import (
    create_curriculum_plan,
    get_curriculum_plan,
    list_curriculum_plans_for_class,
    update_curriculum_plan,
)
from app.repositories.onboarding_repository import get_teacher_class_membership
from app.schemas.curriculum import (
    CurriculumCreateRequest,
    CurriculumListItem,
    CurriculumRoadmapData,
    CurriculumResponse,
    CurriculumUpdateRequest,
)


SUPPORTED_SOURCE_TYPES = {"manual", "syllabus", "document", "subject", "ncert"}


def _ensure_teacher_has_access(db: Session, user: User, class_id: str) -> None:
    membership = get_teacher_class_membership(db, str(user.id), class_id)
    if not membership:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")


def create_class_curriculum(
    db: Session,
    user: User,
    class_id: str,
    request: CurriculumCreateRequest,
) -> CurriculumResponse:
    _ensure_teacher_has_access(db, user, class_id)

    curriculum_payload = request.curriculum_data.model_copy(update={"title": request.title})

    if curriculum_payload.source_type not in SUPPORTED_SOURCE_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported source type")

    if curriculum_payload.source_type != "manual":
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="AI curriculum generation is not enabled yet")

    curriculum = create_curriculum_plan(
        db,
        CurriculumPlan(
            class_id=class_id,
            created_by_teacher_id=user.id,
            title=curriculum_payload.title,
            source_type=curriculum_payload.source_type,
            source_text=curriculum_payload.source_text,
            source_subject=curriculum_payload.source_subject,
            document_id=curriculum_payload.document_id,
            curriculum_data=curriculum_payload.model_dump(),
            status=request.status,
        ),
    )

    return CurriculumResponse(
        curriculum_id=str(curriculum.id),
        class_id=str(curriculum.class_id),
        title=curriculum.title,
        source_type=curriculum.source_type,
        source_text=curriculum.source_text,
        source_subject=curriculum.source_subject,
        document_id=curriculum.document_id,
        curriculum_data=CurriculumRoadmapData.model_validate(curriculum.curriculum_data),
        status=curriculum.status,
    )


def list_class_curricula(db: Session, user: User, class_id: str) -> list[CurriculumListItem]:
    _ensure_teacher_has_access(db, user, class_id)
    curricula = list_curriculum_plans_for_class(db, class_id)
    return [
        CurriculumListItem(
            curriculum_id=str(curriculum.id),
            class_id=str(curriculum.class_id),
            title=curriculum.title,
            source_type=curriculum.source_type,
            status=curriculum.status,
        )
        for curriculum in curricula
    ]


def get_class_curriculum(db: Session, user: User, class_id: str, curriculum_id: str) -> CurriculumResponse:
    _ensure_teacher_has_access(db, user, class_id)
    curriculum = get_curriculum_plan(db, curriculum_id)
    if not curriculum or str(curriculum.class_id) != class_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Curriculum not found")

    return CurriculumResponse(
        curriculum_id=str(curriculum.id),
        class_id=str(curriculum.class_id),
        title=curriculum.title,
        source_type=curriculum.source_type,
        source_text=curriculum.source_text,
        source_subject=curriculum.source_subject,
        document_id=curriculum.document_id,
        curriculum_data=CurriculumRoadmapData.model_validate(curriculum.curriculum_data),
        status=curriculum.status,
    )


def update_class_curriculum(
    db: Session,
    user: User,
    class_id: str,
    curriculum_id: str,
    request: CurriculumUpdateRequest,
) -> CurriculumResponse:
    _ensure_teacher_has_access(db, user, class_id)
    curriculum = get_curriculum_plan(db, curriculum_id)
    if not curriculum or str(curriculum.class_id) != class_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Curriculum not found")

    if request.title is not None:
        curriculum.title = request.title
    if request.curriculum_data is not None:
        curriculum.curriculum_data = request.curriculum_data.model_copy(update={"title": request.title or request.curriculum_data.title}).model_dump()
    if request.status is not None:
        curriculum.status = request.status

    curriculum = update_curriculum_plan(db, curriculum)

    return CurriculumResponse(
        curriculum_id=str(curriculum.id),
        class_id=str(curriculum.class_id),
        title=curriculum.title,
        source_type=curriculum.source_type,
        source_text=curriculum.source_text,
        source_subject=curriculum.source_subject,
        document_id=curriculum.document_id,
        curriculum_data=CurriculumRoadmapData.model_validate(curriculum.curriculum_data),
        status=curriculum.status,
    )
