import sqlite3

conn = sqlite3.connect('backend/mootion.db')
cursor = conn.cursor()
cursor.execute("SELECT type, name, sql FROM sqlite_master WHERE type='trigger'")
triggers = cursor.fetchall()

if not triggers:
    print("No triggers found in the database.")
else:
    for t in triggers:
        print(f"Trigger {t[1]}: {t[2]}")

cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='sessions'")
table = cursor.fetchone()
print(f"Sessions table schema: {table[0] if table else 'Not found'}")
conn.close()
