import subprocess
import uuid
import os
import sys
from core.config import SADTALKER_DIR, INPUT_IMAGE_DIR, INPUT_AUDIO_DIR, OUTPUT_VIDEO_DIR


def run_sadtalker(image_path: str , audio_path: str,job_id: str)-> None:
    # job_id = str(uuid.uuid4())
    output_dir = os.path.join(OUTPUT_VIDEO_DIR, job_id)
    os.makedirs(output_dir, exist_ok=True)

    cmd = [
        "python",
        "inference.py",
        "--driven_audio", audio_path,
        "--source_image", image_path,
        "--result_dir", output_dir,
        "--enhancer", "gfpgan" 

    ]

    subprocess.Popen(cmd, cwd=SADTALKER_DIR,shell=True)

    return job_id
