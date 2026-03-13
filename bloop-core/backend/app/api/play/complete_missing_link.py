from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Optional, List

from services.play.complete_missing_link_service import (
    CompleteMissingLinkService
)

router = APIRouter(
    prefix="/play/complete-missing-link",
    tags=["Play | Complete Missing Link"]
)

complete_missing_link_service = CompleteMissingLinkService()


# --------------------------------------------------
# Schemas
# --------------------------------------------------

class GenerateMissingLinkRequest(BaseModel):
    concept_id: str
    level: str
    category: str


class Slot(BaseModel):
    slot_id: str
    text: str


class Option(BaseModel):
    option_id: str
    text: str


class GenerateMissingLinkResponse(BaseModel):
    session_id: str
    structure: List[Slot]
    options: List[Option]


class EvaluateMissingLinkRequest(BaseModel):
    session_id: str
    answers: Dict[str, str]  # slot_id -> option_id


class EvaluateMissingLinkResponse(BaseModel):
    correct: bool
    feedback: List[str]
    follow_up_question: Optional[str]


# --------------------------------------------------
# 1️⃣ GENERATE PUZZLE
# --------------------------------------------------

@router.post("/generate", response_model=GenerateMissingLinkResponse)
async def generate_missing_link(payload: GenerateMissingLinkRequest):
    """
    Generates a drag-and-drop 'complete the missing link' puzzle.
    """

    try:
        return complete_missing_link_service.generate(
            concept_id=payload.concept_id,
            level=payload.level,
            category=payload.category
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# --------------------------------------------------
# 2️⃣ EVALUATE LEARNER ANSWERS
# --------------------------------------------------

@router.post("/evaluate", response_model=EvaluateMissingLinkResponse)
async def evaluate_missing_link(payload: EvaluateMissingLinkRequest):
    """
    Evaluates learner's filled slots against the stored solution.
    """

    try:
        return complete_missing_link_service.evaluate(
            session_id=payload.session_id,
            answers=payload.answers
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
