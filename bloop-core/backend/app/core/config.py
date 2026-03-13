import os
from dotenv import load_dotenv
load_dotenv()

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))

SADTALKER_DIR = os.path.join(BASE_DIR, "ai_models", "SadTalker")
DATA_DIR = os.path.join(BASE_DIR, "data")
DOCUMENT_UPLOAD_DIR = os.path.join(DATA_DIR, "documents")
AUDIO_DIR = os.path.join(DATA_DIR,"audio/answers")

VECTOR_DB_DIR = os.path.join(BASE_DIR, "backend", "app", "vectorstore", "chroma_db")

INPUT_IMAGE_DIR = os.path.join(DATA_DIR, "input_images")
INPUT_AUDIO_DIR = os.path.join(DATA_DIR, "input_audio")
OUTPUT_VIDEO_DIR = os.path.join(DATA_DIR, "generated_videos")

os.makedirs(INPUT_IMAGE_DIR, exist_ok=True)
os.makedirs(INPUT_AUDIO_DIR, exist_ok=True)
os.makedirs(OUTPUT_VIDEO_DIR, exist_ok=True)
os.makedirs(DOCUMENT_UPLOAD_DIR, exist_ok=True)
os.makedirs(VECTOR_DB_DIR, exist_ok=True)

# ==============================
# DATABASE
# ==============================
NEON_DATABASE_URL = os.getenv("NEON_DB_URL")

# ==============================
# API KEYS (ENVIRONMENT VARIABLES)
# ==============================


class Settings:
    GROQ_API_KEY: str
    ASSEMBLYAI_API_KEY: str
    NEON_DB_URL: str

    def __init__(self):
        self.GROQ_API_KEY = os.getenv("GROQ_API_KEY")
        self.ASSEMBLYAI_API_KEY = os.getenv("ASSEMBLYAI_API_KEY")
        self.NEON_DB_URL = os.getenv("NEON_DB_URL")

        missing = []
        if not self.GROQ_API_KEY:
            missing.append("GROQ_API_KEY")
        if not self.ASSEMBLYAI_API_KEY:
            missing.append("ASSEMBLYAI_API_KEY")
        if not self.NEON_DB_URL:
            missing.append("NEON_DB_URL")

        if missing:
            raise RuntimeError(
                f"Missing required environment variables: {', '.join(missing)}"
            )

settings = Settings()