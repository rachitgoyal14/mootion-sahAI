from app.core.database import SessionLocal
from app.core.deps import get_db
from app.services.chapter_service import get_class_chapter

db = SessionLocal()
# I need a user object. It just checks role = 'teacher'.
class MockUser:
    id = "test-teacher-id"
    role = "teacher"

user = MockUser()
try:
    response = get_class_chapter(db, user, class_id="959a0341-567d-4557-905e-5f42590229e2", chapter_id="4e9c51ec-c3eb-4024-bb64-ae1db4848aff")
    for topic in response["topics"]:
        if topic["id"] == "f8b589de-0da9-4163-817f-492407f8bc88":
            for asset in topic["assets"]:
                print(f"Asset ID: {asset['id']}")
                print(f"External URL: {asset['external_url']}")
except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()
