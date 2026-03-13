import os
import uuid
from fastapi import UploadFile

def find_sadtaker_video(folder:str):
    for file in os.listdir(folder):
        if file.endswith(".mp4"):
            return os.path.join(folder,file)
        
    return None

def save_file(upload_file: UploadFile, base_dir: str)->str:
    os.makedirs(base_dir,exist_ok=True)
    ext = os.path.splitext(upload_file.filename)[1]
    unique_name = f"{uuid.uuid4()}ext"
    file_path = os.path.join(base_dir,unique_name)

    with open(file_path,"wb") as f:
        f.write(upload_file.file.read())

    return file_path