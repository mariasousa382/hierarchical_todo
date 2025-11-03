import sqlite3

db_path = 'instance/todo.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Show current users
print("Current users:")
cursor.execute("SELECT id, username FROM user")
users = cursor.fetchall()
for user in users:
    print(f"  {user[0]}: {user[1]}")

username_to_delete = 'demouser'

# Get user ID
cursor.execute("SELECT id FROM user WHERE username = ?", (username_to_delete,))
user_result = cursor.fetchone()

if user_result:
    user_id = user_result[0]
    
    # Show what will be deleted
    cursor.execute("SELECT COUNT(*) FROM todo_list WHERE user_id = ?", (user_id,))
    list_count = cursor.fetchone()[0]
    
    cursor.execute("""
        SELECT COUNT(*) FROM task 
        WHERE list_id IN (SELECT id FROM todo_list WHERE user_id = ?)
    """, (user_id,))
    task_count = cursor.fetchone()[0]
    
    print(f"\nDeleting user '{username_to_delete}'...")
    print(f"  - This will delete {list_count} list(s)")
    print(f"  - This will delete {task_count} task(s)")
    
    # Delete user (cascade will handle lists and tasks automatically)
    cursor.execute("DELETE FROM user WHERE username = ?", (username_to_delete,))
    conn.commit()
    print("✅ User and all associated data deleted!")
else:
    print(f"\n❌ User '{username_to_delete}' not found")

# Show remaining users
print("\nRemaining users:")
cursor.execute("SELECT id, username FROM user")
users = cursor.fetchall()
for user in users:
    print(f"  {user[0]}: {user[1]}")

conn.close()
print("\n✅ Done!")