from fastapi import APIRouter,UploadFile,File
from fastapi.responses import FileResponse
from services.sad_talker_service import run_sadtalker
from core.config import INPUT_IMAGE_DIR,INPUT_AUDIO_DIR,OUTPUT_VIDEO_DIR
from utils.file_utils import find_sadtaker_video
import os
import shutil
import uuid

router = APIRouter(prefix="/video",tags=["SadTalker Vdeo"])

@router.post("/generate")
async def generate_video(image: UploadFile = File(...), 
                        audio: UploadFile = File(...)
                    ):
    job_id = str(uuid.uuid4())
    image_path = os.path.join(INPUT_IMAGE_DIR, image.filename)
    audio_path = os.path.join(INPUT_AUDIO_DIR, audio.filename)

    with open(image_path,"wb") as img_file:
        shutil.copyfileobj(image.file,img_file)

    with open(audio_path,"wb") as audio_file:
        shutil.copyfileobj(audio.file,audio_file)

    job_id = run_sadtalker(image_path, audio_path,job_id)
    
    return {
        "status": "processing",
        "job_id": job_id
        }


@router.get("/status/{job_id}")

def get_video(job_id:str):
    job_dir = os.path.join(OUTPUT_VIDEO_DIR,job_id)

    if not os.path.exists(job_dir):
        return {"Status": "Notfound"}
    
    video = find_sadtaker_video(job_dir)

    if video:
        return {
            "status": "completed",
            "job_id": job_id
        }
    
    return {
        "status": "processsing",
        "job_id": job_id
    }

@router.get("/result/{job_id}")
def get_video(job_id: str):
    job_dir = os.path.join(OUTPUT_VIDEO_DIR, job_id)

    video_path = find_sadtaker_video(job_dir)
    if not video_path:
        return {"error": "Video not ready"}

    return FileResponse(
        video_path,
        media_type="video/mp4",
        filename="lesson_video.mp4"
    )