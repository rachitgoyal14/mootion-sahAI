import zipfile
import os

zip_path = "../subjects_data/class6_maths.zip"
with zipfile.ZipFile(zip_path, 'r') as zip_ref:
    file_list = zip_ref.namelist()
    print(f"Total files in zip: {len(file_list)}")
    print("First 15 files:")
    for f in file_list[:15]:
        print(f" - {f}")
