from app.core.database import SessionLocal
from app.core.models import ChapterTopic, ChapterTopicAsset

db = SessionLocal()
topic_id = 'f8b589de-0da9-4163-817f-492407f8bc88'
topic = db.query(ChapterTopic).filter(ChapterTopic.id == topic_id).one_or_none()
if not topic:
    print("Topic not found")
else:
    for asset in topic.assets:
        print(f"Asset {asset.id}: type={asset.asset_type}, url={asset.external_url}")

