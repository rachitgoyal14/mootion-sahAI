from fastapi import APIRouter
from fastapi.responses import FileResponse
from services.tts_service import text_to_speech
import uuid

router = APIRouter(prefix="/tts", tags=["TTS"])

@router.post("/answer")
def speak_answer(text: str):
    job_id = str(uuid.uuid4())
    audio_path = text_to_speech(text,job_id)

    return FileResponse(
        audio_path,
        media_type="audio/wav",
        filename="answer.wav"
    )