from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from services.play.find_mistake_service import FindMistakeService

router = APIRouter(prefix="/play/find-mistake", tags=["Play | Find the Mistake"])

find_mistake_service = FindMistakeService()


# --------------------------------------------------
# Schemas
# --------------------------------------------------

class GenerateMistakeRequest(BaseModel):
    concept_id: str
    level: str
    mistake_type: Optional[str] = None  # code | latex | mermaid (optional)


class GenerateMistakeResponse(BaseModel):
    session_id: str
    artifact_type: str
    content: str
    metadata: Optional[dict] = None


class EvaluateMistakeRequest(BaseModel):
    session_id: str
    learner_fix: str
    explanation: Optional[str] = None


class EvaluateMistakeResponse(BaseModel):
    correct: bool
    feedback: list[str]
    follow_up_question: Optional[str]


# --------------------------------------------------
# 1️⃣ GENERATE MISTAKE
# --------------------------------------------------

@router.post("/generate", response_model=GenerateMistakeResponse)
async def generate_mistake(payload: GenerateMistakeRequest):
    """
    Generates a flawed artifact based on:
    - concept
    - level
    - mistake type (optional)
    """

    try:
        return find_mistake_service.generate(
            concept_id=payload.concept_id,
            level=payload.level,
            mistake_type=payload.mistake_type
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# --------------------------------------------------
# 2️⃣ EVALUATE LEARNER CORRECTION
# --------------------------------------------------

@router.post("/evaluate", response_model=EvaluateMistakeResponse)
async def evaluate_mistake(payload: EvaluateMistakeRequest):
    """
    Evaluates learner's correction against the stored flawed artifact.
    """

    try:
        return find_mistake_service.evaluate(
            session_id=payload.session_id,
            learner_fix=payload.learner_fix,
            explanation=payload.explanation
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
