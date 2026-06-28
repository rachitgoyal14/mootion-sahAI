import zipfile
import io
from pypdf import PdfReader

zip_path = "../subjects_data/class6_maths.zip"
with zipfile.ZipFile(zip_path, 'r') as zip_ref:
    # Find a PDF file
    pdf_files = [f for f in zip_ref.namelist() if f.endswith(".pdf")]
    if not pdf_files:
        print("No PDF files found")
    else:
        first_pdf = pdf_files[0]
        print(f"Reading {first_pdf} from zip...")
        pdf_bytes = zip_ref.read(first_pdf)
        pdf_file = io.BytesIO(pdf_bytes)
        
        reader = PdfReader(pdf_file)
        print(f"Total pages: {len(reader.pages)}")
        first_page_text = reader.pages[0].extract_text()
        print("First 200 characters of first page:")
        print(first_page_text[:200])
