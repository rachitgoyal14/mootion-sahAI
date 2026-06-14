from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_teacher
from app.schemas.curriculum import CurriculumCreateRequest, CurriculumListItem, CurriculumResponse, CurriculumUpdateRequest
from app.services.curriculum_service import create_class_curriculum, get_class_curriculum, list_class_curricula, update_class_curriculum


router = APIRouter(prefix="/teachers/classes/{class_id}/curriculum", tags=["curriculum"])


@router.post("", response_model=CurriculumResponse)
def create_curriculum(class_id: str, request: CurriculumCreateRequest, user=Depends(require_teacher), db: Session = Depends(get_db)):
    return create_class_curriculum(db, user, class_id, request)


@router.get("", response_model=list[CurriculumListItem])
def list_curriculum(class_id: str, user=Depends(require_teacher), db: Session = Depends(get_db)):
    return list_class_curricula(db, user, class_id)


@router.get("/{curriculum_id}", response_model=CurriculumResponse)
def get_curriculum(class_id: str, curriculum_id: str, user=Depends(require_teacher), db: Session = Depends(get_db)):
    return get_class_curriculum(db, user, class_id, curriculum_id)


@router.put("/{curriculum_id}", response_model=CurriculumResponse)
def edit_curriculum(class_id: str, curriculum_id: str, request: CurriculumUpdateRequest, user=Depends(require_teacher), db: Session = Depends(get_db)):
    return update_class_curriculum(db, user, class_id, curriculum_id, request)
