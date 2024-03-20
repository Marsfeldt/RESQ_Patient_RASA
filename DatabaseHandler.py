import sqlite3


class DatabaseHandler:

    def __init__(self, databaseName):
        self.connection = sqlite3.connect(
            databaseName, check_same_thread=False)
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

    def retrieve_user_data(self, tableName, username):
        with self.connection as connection:
            cursor = connection.cursor()
            cursor.execute(
                f"SELECT password, uuid FROM {tableName} WHERE username = ?", (username,))
            result = cursor.fetchone()
            if result:
                password, uuid = result
                return {'password': password, 'uuid': uuid}
            else:
                return None

    def retrieve_password_from_username(self, tableName, username):
        with self.connection as connection:
            cursor = connection.cursor()
            cursor.execute(
                f"SELECT password FROM {tableName} WHERE username = ?", (username,))
            result = cursor.fetchone()
            if result:
                # Assuming the password is in the first column of the user_table
                return result[0]
            else:
                return None

    def fetch_informatiom_from_user(self, tableName, username):
        with self.connection as connection:
            cursor = connection.cursor()
            cursor.execute(
                f'SELECT username, uuid FROM {tableName} where username = ?', (username,))
            result = cursor.fetchone()
            if result:
                fetchedUsername, fetchedUUID = result
                return fetchedUsername, fetchedUUID
            else:
                return None, None

    def fetch_questionnaire_results_from_user(self, tableName, username):
        with self.connection as connection:
            cursor = connection.cursor()
            cursor.execute(
                f'SELECT UserResponse, QuestionText uuid FROM {tableName} where username = ?', (username,))

            rows = cursor.fetchall()

            questionnaireTotal = 0
            for row in rows:
                print(f"Datapoint: {row[0]}")
                questionnaireTotal += int(row[0])
                print(f"Questionnaire Total:", questionnaireTotal)

    def fetch_userStage_from_uuid(self, tableName, uuid):
        with self.connection as connection:
            cursor = connection.cursor()
            cursor.execute(
                f'SELECT stage FROM {tableName} where UUID = ?', (uuid,))
            stage = cursor.fetchone()
            return stage
        
    def calculate_stage_score(self, tableName, uuid):
        with self.connection as connection:
            cursor = connection.cursor()
            cursor.execute(f'SELECT UserResponse FROM {tableName} WHERE UUID = ?', (uuid,))
            rows = cursor.fetchall()

            clean_numbers = [int(row[0]) for row in rows]

            number_mapping = {
                1: -2,
                2: -1,
                3: 0,
                4: 1,
                5: 2
            }

            # Use list comprehension to apply the mapping
            mapped_numbers = [number_mapping[num] for num in clean_numbers]

            PC_SCORE = mapped_numbers[0] + mapped_numbers[2] + mapped_numbers[5] + mapped_numbers[9]
            C_SCORE = mapped_numbers[1] + mapped_numbers[3] + mapped_numbers[6] + mapped_numbers[10]
            A_SCORE = mapped_numbers[4] + mapped_numbers[7] + mapped_numbers[8] + mapped_numbers[11]

            listOfStages = [
                ["Precontemplation", PC_SCORE],
                ["Contemplation", C_SCORE],
                ["Action", A_SCORE]
            ]

            # Find the maximum score
            max_score = max(stage[1] for stage in listOfStages)

            # Find the stage(s) with the maximum score
            max_stage_names = [stage[0] for stage in listOfStages if stage[1] == max_score]

            print('======== RESULTS ========')
            print(f'PC_SCORE: {PC_SCORE}')
            print(f'C_SCORE: {C_SCORE}')
            print(f'A_SCORE: {A_SCORE}')
            print(f'Participant should be in stage {max_stage_names} with a score of {max_score}')
            print('======== RESULTS ========')


    def close_database(self):
        self.connection.close()