import sqlite3


class DatabaseHandler:
    def __init__(self, databaseName):
        # Initialize the database connection and cursor for executing SQL commands
        self.connection = sqlite3.connect(databaseName, check_same_thread=False)
        self.cursor = self.connection.cursor()

    def insert_data(self, tableName, data):
        # Insert data into the specified table
        with self.connection as connection:
            cursor = connection.cursor()

            # Generate the column names and placeholders for the SQL query
            columns = ', '.join(list(data.keys()))
            placeholders = ', '.join(['?' for _ in list(data.values())])
            values = tuple(list(data.values()))

            # Prepare the SQL insert query
            insertQuery = f"INSERT INTO {tableName} ({columns}) VALUES ({placeholders})"

            # Execute the query and commit the transaction
            cursor.execute(insertQuery, values)
            connection.commit()

    def create_user_account(self, tableName, accountInfo):
        # Create a new user account by inserting account information into the specified table
        with self.connection as connection:
            cursor = connection.cursor()

            # Generate the column names and placeholders for the SQL query
            columns = ', '.join(list(accountInfo.keys()))
            placeholders = ', '.join(['?' for _ in list(accountInfo.values())])
            values = tuple(list(accountInfo.values()))

            # Prepare the SQL insert query
            insertQuery = f"INSERT INTO {tableName} ({columns}) VALUES ({placeholders})"

            # Execute the query and commit the transaction
            cursor.execute(insertQuery, values)
            connection.commit()

    def retrieve_user_data(self, tableName, username):
        # Retrieve user data (password and uuid) from the specified table based on the username
        with self.connection as connection:
            cursor = connection.cursor()
            cursor.execute(f"SELECT password, uuid FROM {tableName} WHERE username = ?", (username,))
            result = cursor.fetchone()
            if result:
                password, uuid = result
                return {'password': password, 'uuid': uuid}
            else:
                return None

    def check_tutorial_completion(self, tableName, uuid):
        # Check if the user has completed the tutorial based on their uuid
        with self.connection as connection:
            cursor = connection.cursor()
            cursor.execute(f"SELECT CompletedTutorial FROM {tableName} WHERE UUID = ?", (uuid,))
            result = cursor.fetchone()
            if result:
                # Extract the completion status from the result
                completedTutorial = result[0]
                return completedTutorial
            else:
                return None

    def retrieve_password_from_username(self, tableName, username):
        # Retrieve the password for a user based on their username
        with self.connection as connection:
            cursor = connection.cursor()
            cursor.execute(f"SELECT password FROM {tableName} WHERE username = ?", (username,))
            result = cursor.fetchone()
            if result:
                return result[0]
            else:
                return None

    def fetch_informatiom_from_user(self, tableName, username):
        # Fetch username and uuid for a user based on their username
        with self.connection as connection:
            cursor = connection.cursor()
            cursor.execute(f'SELECT username, uuid FROM {tableName} WHERE username = ?', (username,))
            result = cursor.fetchone()
            if result:
                fetchedUsername, fetchedUUID = result
                return fetchedUsername, fetchedUUID
            else:
                return None, None

    def fetch_questionnaire_results_from_user(self, tableName, username):
        # Fetch and calculate questionnaire results for a user based on their username
        with self.connection as connection:
            cursor = connection.cursor()
            cursor.execute(f'SELECT UserResponse, QuestionText uuid FROM {tableName} WHERE username = ?', (username,))
            rows = cursor.fetchall()

            questionnaireTotal = 0
            for row in rows:
                # Aggregate the questionnaire responses
                print(f"Datapoint: {row[0]}")
                questionnaireTotal += int(row[0])
                print(f"Questionnaire Total:", questionnaireTotal)

    def fetch_userStage_from_uuid(self, tableName, uuid):
        # Fetch the user's stage based on their uuid
        with self.connection as connection:
            cursor = connection.cursor()
            cursor.execute(f'SELECT stage FROM {tableName} WHERE UUID = ?', (uuid,))
            stage = cursor.fetchone()
            return stage

    def fetch_variable_from_uuid(self, table_name, variable_name, uuid):
        # Fetch a specific variable for a user based on their uuid
        query = f"SELECT {variable_name} FROM {table_name} WHERE UUID = ?"
        self.cursor.execute(query, (uuid,))
        result = self.cursor.fetchone()
        if result[0] is None: #changed result to result[0] to avoid issues with return int(result[0])
            print(f"No {variable_name} found for UUID {uuid}")
            return None

        return int(result[0])

    def fetch_user_identification_variables(self, tableName, uuid):
        # Fetch username and stage for a user based on their uuid
        with self.connection as connection:
            cursor = connection.cursor()
            cursor.execute(f'SELECT Username, Stage FROM {tableName} WHERE UUID = ?', (uuid,))
            result = cursor.fetchone()
            if result:
                return result  # Return fetched values (username and stage)
            else:
                return None  # Handle case where no result is found

    def transition_user_stage(self, talbeName, uuid, newStage):
        # Update the user's stage based on their uuid
        with self.connection as connection:
            cursor = connection.cursor()
            cursor.execute(f'UPDATE {talbeName} SET Stage = {newStage} WHERE UUID = ?', (uuid,))

    def update_tutorial_completion(self, talbeName, uuid, newState):
        # Update the tutorial completion status for a user based on their uuid
        with self.connection as connection:
            cursor = connection.cursor()
            cursor.execute(f'UPDATE {talbeName} SET CompletedTutorial = {newState} WHERE UUID = ?', (uuid,))

    def calculate_stage_score(self, tableName, uuid):
        # Calculate the stage score for a user based on their responses
        with self.connection as connection:
            cursor = connection.cursor()
            cursor.execute(f'SELECT UserResponse FROM {tableName} WHERE UUID = ?', (uuid,))
            rows = cursor.fetchall()
            print(f"results test:{[row[0] for row in rows]}")
            # Clean and map the user responses to scores
            clean_numbers = [int(row[0]) for row in rows]
            number_mapping = {
                1: -2,
                2: -1,
                3: 0,
                4: 1,
                5: 2
            }

            mapped_numbers = [number_mapping[num] for num in clean_numbers]

            # Calculate scores for different stages
            PC_SCORE = mapped_numbers[0] + mapped_numbers[2] + mapped_numbers[5] + mapped_numbers[9]
            C_SCORE = mapped_numbers[1] + mapped_numbers[3] + mapped_numbers[6] + mapped_numbers[10]
            A_SCORE = mapped_numbers[4] + mapped_numbers[7] + mapped_numbers[8] + mapped_numbers[11]

            listOfStages = [
                ["Precontemplation", PC_SCORE],
                ["Contemplation", C_SCORE],
                ["Action", A_SCORE]
            ]

            # Find the stage with the highest score
            max_score = max(stage[1] for stage in listOfStages)
            max_stage_names = [stage[0] for stage in listOfStages if stage[1] == max_score]

            stage_mapping = {
                "Precontemplation": 1,
                "Contemplation": 2,
                "Preparation": 3,
                "Action": 4,
                "Maintenance": 5
            }

            # Map the stage name to its corresponding number
            max_stage_number = [stage_mapping[stage_name] for stage_name in max_stage_names]
            clean_int_max_stage = max_stage_number[0] if max_stage_number else None

            # Output the results
            print('======== RESULTS ========')
            print(f'PC_SCORE: {PC_SCORE}')
            print(f'C_SCORE: {C_SCORE}')
            print(f'A_SCORE: {A_SCORE}')
            print(f'Participant should be in stage {max_stage_names} with a score of {max_score}')
            print(f'Stage Number {clean_int_max_stage}')
            print('======== RESULTS ========')

            # Update the user's stage in the database
            RESQDB = DatabaseHandler("./DATA/DATABASE/RESQ.db")
            RESQDB.transition_user_stage("users", uuid, clean_int_max_stage)

    def fetch_user_responses(self, tableName, uuid):
        # Fetch user responses based on their uuid
        with self.connection as connection:
            cursor = connection.cursor()
            cursor.execute(f'SELECT UserResponse FROM {tableName} WHERE UUID = ?', (uuid,))
            results = cursor.fetchall()
            user_responses = [result[0].lower() for result in results]  # Convert to lower case
            return user_responses

    def close_database(self):
        # Close the database connection
        self.connection.close()

# Uncomment the following lines to test the database handler
    #questionnaireDatabase1 = DatabaseHandler("./PYTHON/QUESTIONNAIRE_DATABASES/Questionnaire_Name.db")
    #questionnaireDatabase1.calculate_stage_score("QuestionnaireName1", "HB0iFCHQJd3PRv0KAAAL")