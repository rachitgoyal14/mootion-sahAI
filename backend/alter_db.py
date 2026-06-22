from app.core.database import engine
from sqlalchemy import text
with engine.begin() as conn:
    conn.execute(text("ALTER TABLE assignment_recipients ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending';"))
