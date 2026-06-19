import zipfile
import io
import re
import os
from pypdf import PdfReader

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

def extract_chapter_metadata(pdf_path_or_file, file_name):
    reader = PdfReader(pdf_path_or_file)
    
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
        if base_name.endswith("ps"):
            return 0, "Preliminary Section / Index"
        elif base_name.endswith("ans"):
            return 99, "Answers"
    
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

# Test on Class 6 Maths
zip_path = "../subjects_data/class6_maths.zip"
with zipfile.ZipFile(zip_path, 'r') as zip_ref:
    pdf_files = [f for f in zip_ref.namelist() if f.endswith(".pdf")]
    print("Class 6 Maths:")
    for f in pdf_files[:5]:
        pdf_bytes = zip_ref.read(f)
        num, title = extract_chapter_metadata(io.BytesIO(pdf_bytes), f)
        print(f"  File: {f} -> Ch: {num}, Title: '{title}'")

# Test on Class 10 Science
zip_path = "../subjects_data/class10_science.zip"
if os.path.exists(zip_path):
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        pdf_files = [f for f in zip_ref.namelist() if f.endswith(".pdf")]
        print("Class 10 Science:")
        for f in pdf_files[:5]:
            pdf_bytes = zip_ref.read(f)
            num, title = extract_chapter_metadata(io.BytesIO(pdf_bytes), f)
            print(f"  File: {f} -> Ch: {num}, Title: '{title}'")
