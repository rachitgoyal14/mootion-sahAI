from fastapi import APIRouter
from services.flashcard_service import generate_flashcards

router = APIRouter(prefix="/flashcards",tags=["Flashcards"])

@router.get("/{document_id}")
def get_flashcards(document_id:str, count: int =10):
    return generate_flashcards(document_id,count)

