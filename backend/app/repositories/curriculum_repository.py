from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.models import CurriculumPlan


def create_curriculum_plan(db: Session, curriculum: CurriculumPlan) -> CurriculumPlan:
    db.add(curriculum)
    db.commit()
    db.refresh(curriculum)
    return curriculum


def get_curriculum_plan(db: Session, curriculum_id: str) -> CurriculumPlan | None:
    return db.get(CurriculumPlan, curriculum_id)


def list_curriculum_plans_for_class(db: Session, class_id: str) -> list[CurriculumPlan]:
    statement = select(CurriculumPlan).where(CurriculumPlan.class_id == class_id).order_by(CurriculumPlan.updated_at.desc())
    return list(db.scalars(statement).all())


def update_curriculum_plan(db: Session, curriculum: CurriculumPlan) -> CurriculumPlan:
    db.commit()
    db.refresh(curriculum)
    return curriculum
