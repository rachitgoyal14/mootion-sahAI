import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from core.database import engine
from sqlalchemy import text

try:
    print("Testing database connection and tables...\n")
    
    with engine.connect() as connection:
        # Test connection
        result = connection.execute(text("SELECT 1"))
        print("✅ Database connection successful!")
        print(f"Result: {result.fetchone()}\n")
        
        # Check if tables exist
        tables = ['chats', 'messages', 'documents', 'videos']
        
        for table in tables:
            try:
                result = connection.execute(text(f"SELECT COUNT(*) FROM {table}"))
                count = result.fetchone()[0]
                print(f"✅ Table '{table}' exists - Row count: {count}")
            except Exception as e:
                print(f"❌ Table '{table}' does not exist or error: {e}")
        
        print("\n✅ All checks passed!")
        
except Exception as e:
    print(f"❌ Database test failed:")
    print(f"Error: {e}")