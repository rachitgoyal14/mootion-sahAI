from fastapi import APIRouter
from services.quiz_service import generate_quiz

router = APIRouter(prefix="/quiz", tags=["Quiz"])

@router.get("/{document_id}")
def get_quiz(document_id: str, count: int = 5):
    return generate_quiz(document_id, count)
