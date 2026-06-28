import os
import re
import zipfile
import shutil
import uuid
import json
import time
import httpx
import chromadb
from pypdf import PdfReader
from dotenv import load_dotenv
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Load environment variables
load_dotenv(dotenv_path="../backend/.env")

AZURE_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_DEPLOYMENT = "text-embedding-3-small"

SUBJECTS_DIR = "../subjects_data"
TEMP_EXTRACT_DIR = "./temp_extract"
CHROMA_DB_DIR = "../backend/chroma_db"

# Initialize ChromaDB client
chroma_client = chromadb.PersistentClient(path=CHROMA_DB_DIR)

# Clean Azure Endpoint URL
azure_base_url = AZURE_ENDPOINT.rstrip("/")
if azure_base_url.endswith("/openai/v1"):
    azure_base_url = azure_base_url[:-10]
elif azure_base_url.endswith("/openai"):
    azure_base_url = azure_base_url[:-7]

azure_headers = {
    "api-key": AZURE_KEY,
    "Content-Type": "application/json"
}
azure_embed_url = f"{azure_base_url}/openai/deployments/{AZURE_DEPLOYMENT}/embeddings?api-version=2023-05-15"

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,
    chunk_overlap=150
)

def clean_extracted_title(title):
    if not title:
        return title
    title = re.sub(r"\d+CHAPTER", "", title, flags=re.IGNORECASE)
    title = re.sub(r"CHAPTER\s+\d+", "", title, flags=re.IGNORECASE)
    title = re.sub(r"\d+\s*CHAPTER", "", title, flags=re.IGNORECASE)
    
    stop_phrases = [
        "In this chapter", "Numbers are used", "If you ask", "Children sit in", 
        "n Class", "You have seen", "ow do we", "We have used", "In the previous",
        "We have", "In Class"
    ]
    for phrase in stop_phrases:
        if phrase in title:
            title = title.split(phrase)[0]
            
    title = re.sub(r"\s+", " ", title)
    title = title.strip(" .,-–—")
    
    if len(title) > 80 and "." in title:
        title = title.split(".")[0]
        
    return title.strip()

def extract_chapter_metadata(pdf_path, file_name):
    reader = PdfReader(pdf_path)
    
    chapter_num = None
    match = re.search(r"(\d+)\.pdf$", file_name.lower())
    if match:
        digits = match.group(1)
        if len(digits) >= 2:
            chapter_num = int(digits[-2:])
        else:
            chapter_num = int(digits)
    else:
        base_name = file_name.lower()[:-4]
        if base_name.endswith("ps") or base_name.endswith("pre") or "prelim" in base_name:
            return 0, "Preliminary Section / Index"
        elif base_name.endswith("ans") or base_name.endswith("an") or "answer" in base_name:
            return 99, "Answers"
        else:
            return -1, file_name[:-4]
    
    chapter_title = None
    try:
        first_page_text = reader.pages[0].extract_text()
        if first_page_text:
            lines = [l.strip() for l in first_page_text.split("\n") if l.strip()]
            candidate_lines = []
            for line in lines[:8]:
                if line.isdigit():
                    continue
                if "ncert" in line.lower() or "republished" in line.lower() or "rationalised" in line.lower() or "not to be" in line.lower():
                    continue
                if len(line) < 3:
                    continue
                candidate_lines.append(line)
            
            if candidate_lines:
                title_parts = []
                for line in candidate_lines[:3]:
                    if re.match(r"^\d+\.\d+", line) or re.match(r"^\d+\s+[A-Z]", line):
                        break
                    if re.match(r"^chapter\s+\d+", line.lower()) or line.lower().strip() == "chapter":
                        continue
                    title_parts.append(line)
                
                if title_parts:
                    chapter_title = " ".join(title_parts)
    except Exception as e:
        pass
        
    chapter_title = clean_extracted_title(chapter_title)
    
    if not chapter_title:
        chapter_title = f"Chapter {chapter_num}" if chapter_num else file_name[:-4]
        
    if chapter_title and len(chapter_title) > 200:
        chapter_title = chapter_title[:197] + "..."
        
    return chapter_num, chapter_title

def get_collection_name(filename: str) -> str:
    # Remove .zip extension
    name = filename[:-4]
    # Remove _part1, _part2, etc.
    for part in ["_part1", "_part2", "_part_1", "_part_2", "part1", "part2"]:
        if name.endswith(part):
            name = name[:-len(part)]
    
    # Standardize subject names
    if name.endswith("_maths"):
        name = name[:-6] + "_mathematics"
    elif name.endswith("_math"):
        name = name[:-5] + "_mathematics"
    
    match = re.match(r"^class(\d+)(.*)$", name)
    if match:
        grade = match.group(1)
        sub = match.group(2).strip("_")
        return f"class_{grade}_{sub}"
    
    return name

def ensure_chroma_collection(collection_name: str):
    try:
        collection = chroma_client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"}
        )
        print(f"Collection '{collection_name}' checked/created in Chroma.")
        return collection
    except Exception as e:
        print(f"Failed to ensure Chroma collection '{collection_name}': {e}")
        return None

def embed_texts(texts: list[str], client: httpx.Client) -> list[list[float]]:
    if not texts:
        return []
    
    retries = 3
    for attempt in range(retries):
        try:
            res = client.post(azure_embed_url, json={"input": texts}, headers=azure_headers, timeout=30.0)
            if res.status_code == 200:
                res_data = res.json()
                sorted_data = sorted(res_data["data"], key=lambda x: x["index"])
                return [item["embedding"] for item in sorted_data]
            elif res.status_code == 429:
                sleep_time = (attempt + 1) * 5
                print(f"Rate limited by Azure. Sleeping for {sleep_time}s...")
                time.sleep(sleep_time)
            else:
                print(f"Azure embedding error (status {res.status_code}): {res.text}")
                raise RuntimeError("Azure Embedding API failed")
        except Exception as e:
            if attempt == retries - 1:
                raise e
            time.sleep(2)
    return []

def process_pdf(pdf_path: str, collection, grade: str, subject: str, client: httpx.Client, batch_size=100):
    file_name = os.path.basename(pdf_path)
    
    # Extract metadata
    chapter_num, chapter_title = extract_chapter_metadata(pdf_path, file_name)
    reader = PdfReader(pdf_path)
    total_pages = len(reader.pages)
    print(f"  Processing '{file_name}' ({total_pages} pages) -> Ch {chapter_num}: '{chapter_title}'...")
    
    chunks_acc = []
    points_uploaded = 0
    
    for page_idx in range(total_pages):
        try:
            page_text = reader.pages[page_idx].extract_text()
            if not page_text or not page_text.strip():
                continue
            
            sub_chunks = text_splitter.split_text(page_text)
            for chunk_idx, chunk in enumerate(sub_chunks):
                chunks_acc.append({
                    "text": chunk,
                    "metadata": {
                        "text": chunk,
                        "class": grade,
                        "subject": subject,
                        "chapter_file": file_name,
                        "chapter_number": chapter_num if chapter_num is not None else -1,
                        "chapter_title": chapter_title if chapter_title is not None else "",
                        "page_number": page_idx + 1,
                        "chunk_index": chunk_idx
                    }
                })
                
                if len(chunks_acc) >= batch_size:
                    process_batch(collection, chunks_acc, client)
                    points_uploaded += len(chunks_acc)
                    chunks_acc = []
        except Exception as e:
            print(f"    Error reading page {page_idx + 1} of {file_name}: {e}")
            
    if chunks_acc:
        process_batch(collection, chunks_acc, client)
        points_uploaded += len(chunks_acc)
        
    return points_uploaded

def process_batch(collection, batch: list[dict], client: httpx.Client):
    texts = [item["text"] for item in batch]
    embeddings = embed_texts(texts, client)
    
    ids = [str(uuid.uuid4()) for _ in batch]
    metadatas = [item["metadata"] for item in batch]
    documents = [item["text"] for item in batch]
    
    collection.add(
        ids=ids,
        embeddings=embeddings,
        metadatas=metadatas,
        documents=documents
    )

def main():
    if not os.path.exists(SUBJECTS_DIR):
        print(f"Error: subjects_data directory '{SUBJECTS_DIR}' not found.")
        return
        
    zip_files = [f for f in os.listdir(SUBJECTS_DIR) if f.endswith(".zip")]
    zip_files.sort()
    
    print(f"Found {len(zip_files)} zip files to ingest.")
    
    status_log = {}
    if os.path.exists("ingestion_status.json"):
        try:
            with open("ingestion_status.json", "r") as f:
                status_log = json.load(f)
        except Exception:
            pass
    
    with httpx.Client(limits=httpx.Limits(max_connections=10, max_keepalive_connections=5)) as client:
        for zip_idx, zip_file in enumerate(zip_files):
            # Check if already completed in status log
            if zip_file in status_log and status_log[zip_file].get("status") == "completed":
                print(f"\n[{zip_idx + 1}/{len(zip_files)}] Zip file '{zip_file}' already completed in status log. Skipping.")
                continue

            collection_name = get_collection_name(zip_file)
            print(f"\n[{zip_idx + 1}/{len(zip_files)}] Checking '{zip_file}' for collection '{collection_name}'...")
            
            parts = collection_name.split("_")
            grade = parts[1]
            subject = "_".join(parts[2:])
            
            collection = ensure_chroma_collection(collection_name)
            if not collection:
                print(f"Skipping {zip_file} due to collection check/create error.")
                continue
                
            print(f"Ingesting '{zip_file}'...")
            zip_path = os.path.join(SUBJECTS_DIR, zip_file)
            if os.path.exists(TEMP_EXTRACT_DIR):
                shutil.rmtree(TEMP_EXTRACT_DIR)
            os.makedirs(TEMP_EXTRACT_DIR)
            
            try:
                with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                    zip_ref.extractall(TEMP_EXTRACT_DIR)
            except Exception as e:
                print(f"Failed to unzip {zip_file}: {e}")
                continue
                
            pdf_paths = []
            for root_dir, _, files in os.walk(TEMP_EXTRACT_DIR):
                for f in files:
                    if f.lower().endswith(".pdf") and not f.startswith("._"):
                        pdf_paths.append(os.path.join(root_dir, f))
            
            pdf_paths.sort()
            print(f"Found {len(pdf_paths)} PDFs in {zip_file}")
            
            total_points = 0
            for pdf_path in pdf_paths:
                try:
                    points_count = process_pdf(pdf_path, collection, grade, subject, client)
                    total_points += points_count
                except Exception as e:
                    print(f"Failed to process PDF '{pdf_path}': {e}")
                    
            print(f"Finished ingesting '{zip_file}'. Total points upserted: {total_points}")
            status_log[zip_file] = {
                "collection_name": collection_name,
                "grade": grade,
                "subject": subject,
                "points_count": total_points,
                "status": "completed"
            }
            
            shutil.rmtree(TEMP_EXTRACT_DIR)
            
            with open("ingestion_status.json", "w") as f:
                json.dump(status_log, f, indent=2)
                
    print("\nIngestion Complete! Summary saved to 'ingestion_status.json'.")

if __name__ == "__main__":
    main()
