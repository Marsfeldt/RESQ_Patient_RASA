import sqlite3

connection = sqlite3.connect("PYTHON/DATABASE/TestDatabase.db")
cursor = connection.cursor()

user_id = "the_coolest_of_ids"
cursor.execute("SELECT PromScore FROM userData WHERE UID = ?", (user_id,))
result = cursor.fetchone()

if result:
    uid = result[0]
    print(f"User's PromScore is {uid}")
else:
    print(f"No score associated with this id")


connection.close()