import tempfile
import os
import assemblyai as aai

from core.config import settings


class STTService:
    """
    Generic Speech-to-Text service.
    Currently backed by AssemblyAI.
    Can be reused across the entire system.
    """

    def __init__(self):
        if not settings.ASSEMBLYAI_API_KEY:
            raise ValueError("ASSEMBLYAI_API_KEY not set")

        aai.settings.api_key = settings.ASSEMBLYAI_API_KEY
        self.transcriber = aai.Transcriber()

    def transcribe(self, audio_file) -> str:
        """
        Transcribes an uploaded audio file into text.

        Parameters:
        - audio_file: FastAPI UploadFile or file-like object

        Returns:
        - transcript text (str)
        """

        tmp_path = self._save_temp_audio(audio_file)

        try:
            transcript = self.transcriber.transcribe(tmp_path)

            if transcript.status == aai.TranscriptStatus.error:
                raise RuntimeError(
                    f"STT failed: {transcript.error}"
                )

            return transcript.text.strip()

        finally:
            self._cleanup(tmp_path)

    def _save_temp_audio(self, audio_file) -> str:
        """
        Saves uploaded audio to a temporary file.
        """
        suffix = self._infer_suffix(audio_file)

        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            audio_file.file.seek(0)
            tmp.write(audio_file.file.read())
            return tmp.name

    def _cleanup(self, path: str):
        """
        Deletes temporary audio file.
        """
        if os.path.exists(path):
            os.remove(path)

    def _infer_suffix(self, audio_file) -> str:
        """
        Infers file extension from content type.
        """
        content_type = audio_file.content_type or ""

        if "wav" in content_type:
            return ".wav"
        if "webm" in content_type:
            return ".webm"
        if "mpeg" in content_type or "mp3" in content_type:
            return ".mp3"

        return ".wav"  
