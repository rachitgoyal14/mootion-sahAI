from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_student
from app.schemas.assignment import StudentAssignmentListItem, StudentAssignmentResponse
from app.schemas.student_actions import StudentAttemptSubmitRequest, StudentAttemptResponse, QuizSubmitRequest
from app.services.assignment_service import get_student_assignment, list_student_assignments
from app.services.student_actions_service import submit_student_attempt, submit_quiz_attempt


router = APIRouter(prefix="/students/classes/{class_id}/assignments", tags=["student-assignments"])


@router.get("", response_model=list[StudentAssignmentListItem])
def student_assignments(class_id: str, user=Depends(require_student), db: Session = Depends(get_db)):
    return list_student_assignments(db, user, class_id)


@router.get("/{assignment_id}", response_model=StudentAssignmentResponse)
def student_assignment_detail(class_id: str, assignment_id: str, user=Depends(require_student), db: Session = Depends(get_db)):
    return get_student_assignment(db, user, class_id, assignment_id)


@router.post("/{assignment_id}/submit", response_model=StudentAttemptResponse)
def submit_assignment_attempt(
    class_id: str,
    assignment_id: str,
    request: StudentAttemptSubmitRequest,
    user=Depends(require_student),
    db: Session = Depends(get_db),
):
    return submit_student_attempt(
        db=db,
        student=user,
        assignment_id=assignment_id,
        transcription_text=request.transcription_text,
        language=request.language,
    )


@router.post("/{assignment_id}/submit-quiz", response_model=StudentAttemptResponse)
def submit_quiz(
    class_id: str,
    assignment_id: str,
    request: QuizSubmitRequest,
    user=Depends(require_student),
    db: Session = Depends(get_db),
):
    return submit_quiz_attempt(
        db=db,
        student=user,
        assignment_id=assignment_id,
        score=request.score,
        total_questions=request.total_questions,
        answers=request.answers,
    )

