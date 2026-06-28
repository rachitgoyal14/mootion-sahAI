import zipfile
import os

zips = ["class10_maths.zip", "class10_science.zip", "class11_biology.zip", "class12_biology.zip"]
for z in zips:
    zip_path = os.path.join("../subjects_data", z)
    if os.path.exists(zip_path):
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            pdfs = [f for f in zip_ref.namelist() if f.endswith(".pdf")]
            print(f"{z} has {len(pdfs)} PDFs:")
            for p in pdfs[:5]:
                print(f" - {p}")
            if len(pdfs) > 5:
                print(f" ... and {len(pdfs) - 5} more")
