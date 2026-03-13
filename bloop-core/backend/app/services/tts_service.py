import os
import uuid
import azure.cognitiveservices.speech as speechsdk
from dotenv import load_dotenv
from core.config import AUDIO_DIR

load_dotenv()

AZURE_SPEECH_KEY = os.getenv("AZURE_SPEECH_KEY")
AZURE_SPEECH_REGION = os.getenv("AZURE_SPEECH_REGION")

os.makedirs(AUDIO_DIR, exist_ok=True)


def text_to_speech(text: str,job_id:str) -> str:
    if not AZURE_SPEECH_KEY or not AZURE_SPEECH_REGION:
        raise RuntimeError("Azure Speech credentials not configured")

    filename = f"{uuid.uuid4()}.wav"
    audio_path = os.path.join(AUDIO_DIR, filename)

    speech_config = speechsdk.SpeechConfig(
        subscription=AZURE_SPEECH_KEY,
        region=AZURE_SPEECH_REGION
    )

    # 🔹 Choose a good neural voice
    speech_config.speech_synthesis_voice_name = "en-US-DerekMultilingualNeural"

    audio_config = speechsdk.audio.AudioOutputConfig(
        filename=audio_path
    )

    synthesizer = speechsdk.SpeechSynthesizer(
        speech_config=speech_config,
        audio_config=audio_config
    )

    result = synthesizer.speak_text_async(text).get()

    if result.reason != speechsdk.ResultReason.SynthesizingAudioCompleted:
        raise RuntimeError(
            f"TTS failed: {result.reason}"
        )

    return audio_path
