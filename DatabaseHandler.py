import sqlite3

class DatabaseHandler:

    def __init__(self, databaseName):
        self.connection = sqlite3.connect(databaseName, check_same_thread=False)
        self.cursor = self.connection.cursor()
    
    def insert_data(self, table_name, data):
        with self.connection as connection:
            cursor = connection.cursor()

            # Convert dict_keys to a list, and then slice it to skip the first column
            columns = ', '.join(list(data.keys()))
            placeholders = ', '.join(['?' for _ in list(data.values())])
            values = tuple(list(data.values()))

            insert_query = f"INSERT INTO {table_name} ({columns}) VALUES ({placeholders})"
            
            cursor.execute(insert_query, values)
            connection.commit()

    def close_database(self):
        self.connection.close()