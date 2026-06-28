from app.core.database import SessionLocal
from app.core.models import ChapterAsset

db = SessionLocal()
bad_assets = db.query(ChapterAsset).filter(ChapterAsset.external_url.like('%/simulations//simulations/%')).all()
print(f"Found {len(bad_assets)} bad assets with double wrapping.")
for a in bad_assets:
    print(a.id, a.external_url)

