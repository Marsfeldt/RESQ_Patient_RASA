import sqlite3

class DatabaseHandler:

    def __init__(self, databaseName):
        self.connection = sqlite3.connect(databaseName, check_same_thread=False)
        self.cursor = self.connection.cursor()
    
    def insert_data(self, tableName, data):
        with self.connection as connection:
            cursor = connection.cursor()

            # Convert dict_keys to a list, and then slice it to skip the first column
            columns = ', '.join(list(data.keys()))
            placeholders = ', '.join(['?' for _ in list(data.values())])
            values = tuple(list(data.values()))

            insertQuery = f"INSERT INTO {tableName} ({columns}) VALUES ({placeholders})"
            
            cursor.execute(insertQuery, values)
            connection.commit()
    
    def create_user_account(self, tableName, accountInfo):
        with self.connection as connection:
            cursor = connection.cursor()

            # Convert dict_keys to a list, and then slice it to skip the first column
            columns = ', '.join(list(accountInfo.keys()))
            placeholders = ', '.join(['?' for _ in list(accountInfo.values())])
            values = tuple(list(accountInfo.values()))

            insertQuery = f"INSERT INTO {tableName} ({columns}) VALUES ({placeholders})"
            
            cursor.execute(insertQuery, values)
            connection.commit()

    def retrieve_password_from_username(self, tableName, username):
        with self.connection as connection:
            cursor = connection.cursor()
            cursor.execute(f"SELECT password FROM {tableName} WHERE username = ?", (username,))
            result = cursor.fetchone()
            if result:
                return result[0]  # Assuming the password is in the first column of the user_table
            else:
                return None
            
    def fetch_informatiom_from_user(self, tableName, username):
        with self.connection as connection:
            cursor = connection.cursor()
            cursor.execute(f'SELECT username, uuid FROM {tableName} where username = ?', (username,))
            result = cursor.fetchall()
            for row in result:
                fetchedUsername = row[0]
                fetchedUUID = row[1]
            return fetchedUsername, fetchedUUID

    def fetch_questionnaire_results_from_user(self, tableName, username):
        with self.connection as connection:
            cursor = connection.cursor()
            cursor.execute(f'SELECT UserResponse, QuestionText uuid FROM {tableName} where username = ?', (username,))

            rows = cursor.fetchall()

            questionnaireTotal = 0
            for row in rows:
                print(f"Datapoint: {row[0]}")
                questionnaireTotal += int(row[0])
                print(f"Questionnaire Total:", questionnaireTotal)


    def fetch_userStage_from_user(self, tableName, username):
        with self.connection as connection:
            cursor = connection.cursor()
            cursor.execute(f'SELECT stage FROM {tableName} where username = ?', (username,))
            stage = cursor.fetchone()
            return stage

    def close_database(self):
        self.connection.close()
