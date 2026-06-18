import sys
import os

# Add backend to path so we can import app core models
sys.path.append("/Users/rachitgoyal/Desktop/hackathons/2026/13_wadhwani/mootion-wadhwani-aiiii/backend")

# Set the DATABASE_URL environment variable
os.environ["DATABASE_URL"] = "postgresql://neondb_owner:npg_73CZTLYUisSI@ep-snowy-poetry-aog2sln9-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

from app.core.database import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        print("Connecting to DB...")
        try:
            conn.execute(text("ALTER TABLE student_doubts ADD COLUMN IF NOT EXISTS messages JSONB;"))
            conn.commit()
            print("Successfully added messages column to student_doubts table!")
        except Exception as e:
            print("Error executing migration SQL:", e)

if __name__ == "__main__":
    migrate()
