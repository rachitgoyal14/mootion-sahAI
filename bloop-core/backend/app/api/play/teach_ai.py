from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import Optional
import uuid

from services.play.teach_ai_service import TeachAIService
from services.stt_service import STTService
from services.tts_service import text_to_speech

# -----------------------------------
# Router
# -----------------------------------

router = APIRouter(
    prefix="/play/teach-ai",
    tags=["Play | Teach AI"]
)

teach_ai_service = TeachAIService()
stt_service = STTService()

# -----------------------------------
# In-Memory Session Store (replace with Redis later)
# -----------------------------------

SESSION_STORE = {}

# -----------------------------------
# Schemas
# -----------------------------------

class TeachAIEvaluationResponse(BaseModel):
    scores: dict
    feedback: list[str]
    follow_up_question: Optional[str]
    passed: bool


class TeachAIResponsePayload(BaseModel):
    evaluation: TeachAIEvaluationResponse
    assistant_text: str
    audio_path: Optional[str]


# -----------------------------------
# 1️⃣ START SESSION — LLM INITIATES
# -----------------------------------

@router.post("/start-session")
async def teach_ai_start_session(
    concept_id: str = Form(...),
    level: str = Form("beginner"),
):
    """
    LLM initiates the Teach-AI conversation by asking
    the first question based on the concept.
    """

    session_id = str(uuid.uuid4())

    first_question = teach_ai_service.generate_first_question(
        concept_id=concept_id,
        level=level
    )

    SESSION_STORE[session_id] = {
        "concept_id": concept_id,
        "level": level,
        "turn": 1,
        "history": [
            {"role": "assistant", "content": first_question}
        ]
    }

    return {
        "session_id": session_id,
        "assistant_text": first_question
    }


# -----------------------------------
# 2️⃣ EVALUATE USER RESPONSE (TEXT / VOICE)
# -----------------------------------

@router.post(
    "/evaluate-response",
    response_model=TeachAIResponsePayload
)
async def teach_ai_evaluate_response(
    session_id: str = Form(...),
    explanation: Optional[str] = Form(None),
    audio: Optional[UploadFile] = File(None),
    voice_mode: bool = Form(False)
):
    """
    Evaluates the user's explanation (text or audio),
    generates feedback + follow-up question,
    and optionally returns TTS audio.
    """

    session = SESSION_STORE.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Invalid session ID")

    # -----------------------------------
    # 1️⃣ Resolve explanation (Text-first)
    # -----------------------------------

    if explanation and explanation.strip():
        final_explanation = explanation.strip()

    elif audio:
        final_explanation = stt_service.transcribe(audio)
        if not final_explanation:
            raise HTTPException(
                status_code=400,
                detail="STT failed to generate transcript"
            )
    else:
        raise HTTPException(
            status_code=400,
            detail="Either explanation text or audio is required"
        )

    # -----------------------------------
    # 2️⃣ LLM Evaluation
    # -----------------------------------

    evaluation = teach_ai_service.evaluate(
        concept_id=session["concept_id"],
        explanation=final_explanation,
        level=session["level"],
        history=session["history"]
    )

    # -----------------------------------
    # 3️⃣ Format Assistant Response (SINGLE SOURCE)
    # -----------------------------------

    assistant_text = teach_ai_service.format_response(evaluation)

    # -----------------------------------
    # 4️⃣ Update Session History
    # -----------------------------------

    session["history"].extend([
        {"role": "user", "content": final_explanation},
        {"role": "assistant", "content": assistant_text}
    ])
    session["turn"] += 1

    # -----------------------------------
    # 5️⃣ Optional TTS
    # -----------------------------------

    audio_path = None
    if voice_mode:
        audio_path = text_to_speech(assistant_text)

    return {
        "evaluation": evaluation,
        "assistant_text": assistant_text,
        "audio_path": audio_path
    }
