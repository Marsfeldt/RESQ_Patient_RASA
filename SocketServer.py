import logging
from flask import Flask, request
from flask_socketio import SocketIO
import sqlite3
import datetime
import uuid  # Import uuid module for generating UUIDs
import sys
import os

# Change the working directory to the specified path
os.chdir("C:/Users/jorda/Documents/Cesi/A4/MI_WORK/Project_RESQ_Patient_RASA/Project")

from DatabaseHandler import *

# Configure the logging settings
logging.basicConfig(
    filename='server_logs.log',  # Log file path
    level=logging.INFO,  # Log level: INFO
    format='%(asctime)s - %(levelname)s - %(message)s',  # Log format to include timestamp, log level, and message
)

# Initialize Flask application
app = Flask(__name__)
# Initialize Flask-SocketIO for WebSocket communication
socketio = SocketIO(app)

# Database Initialization
logging.info('Database Initialization START')  # Log the start of database initialization
# Initialize various database handlers with their respective database paths
db = DatabaseHandler("./PYTHON/DATABASE/TestDatabase.db")
userDB = DatabaseHandler("./PYTHON/DATABASE/Users.db")
conversationsDatabase = DatabaseHandler("./PYTHON/DATABASE/ChatConversations.db")
questionnaireDatabase1 = DatabaseHandler("./PYTHON/QUESTIONNAIRE_DATABASES/Questionnaire_Name.db")
connectionLogDB = DatabaseHandler("./PYTHON/DATABASE/ConnectionLog.db")
interactionLogsDB = DatabaseHandler("./PYTHON/DATABASE/InteractionsDatabase.db")

# Dictionary to store connected users
connected_users = {}

# Connection event handler
@socketio.on('connect')
def handle_connect():
    """
    Handle a new client connection.
    Retrieves the username from the request, checks user authentication,
    and broadcasts the new user connection to all clients.
    """
    username = request.args.get('username')
    logging.info(f'Client connected: {username} | Session ID: {request.sid}')

    # Fetch user information from the database
    fetchedUsername, fetchedUUID = userDB.fetch_informatiom_from_user('users', username)

    if fetchedUUID:
        # Store connected user information in the dictionary
        connected_users[request.sid] = {'username': username, 'user_uuid': fetchedUUID}
        # Notify all clients about the new user connection
        socketio.emit('new_user_connected', {'userUUID': fetchedUUID, 'username': username}, broadcast=True)
        logging.info(f'User authenticated: {username} with UUID: {fetchedUUID}')
    else:
        logging.warning(f'User not found: {username}')
        socketio.emit('user_not_found', {'username': username}, room=request.sid)

# Disconnection event handler
@socketio.on('disconnect')
def handle_disconnect():
    """
    Handle client disconnection.
    Removes the user from the connected_users dictionary and
    notifies all clients about the user disconnection.
    """
    if request.sid in connected_users:
        username = connected_users[request.sid]['username']
        user_uuid = connected_users[request.sid]['user_uuid']
        del connected_users[request.sid]
        socketio.emit('user_disconnected', {'userUUID': user_uuid, 'username': username}, broadcast=True)
        logging.info(f'Client disconnected: {username} | UUID: {user_uuid}')
    else:
        logging.warning(f'Unknown client disconnected: {request.sid}')

# Event handler to fetch user UUID
@socketio.on('fetch_user_uuid')
def fetch_user_uuid(username):
    """
    Handle the request to fetch a user's UUID.
    If the user is found in the database, the UUID is emitted back to the client.
    """
    logging.info(f'Fetching UUID for username: {username}')
    fetchedUsername, fetchedUUID = userDB.fetch_informatiom_from_user('users', username)

    if fetchedUUID:
        socketio.emit('user_uuid_fetched', {'userUUID': fetchedUUID})
        logging.info(f'UUID fetched: {fetchedUUID} for username: {username}')
    else:
        logging.warning(f'User not found: {username}')
        socketio.emit('user_uuid_not_found', {'username': username})

# Event handler to fetch user information
@socketio.on('fetch_user_information')
def handle_fetch_user_information(username):
    """
    Handle the request to fetch detailed user information.
    Fetches the username and UUID from the database and emits the information back to the client.
    """
    logging.info(f'Fetching information for username: {username}')
    fetchedUsername, fetchedUUID = userDB.fetch_informatiom_from_user('users', username)
    logging.info(f'Fetched Username: {fetchedUsername} UUID: {fetchedUUID}')
    socketio.emit('user_information_fetched',
                  {'fetchedUsername': fetchedUsername, 'fetchedUUID': fetchedUUID, 'session_id': fetchedUUID})

# Event handler for user login
@socketio.on('login')
def handle_login(username):
    """
    Handle user login requests.
    Retrieves user credentials from the database and sends them to the client.
    """
    logging.info(f'Login request received for username: {username}')
    user_data = userDB.retrieve_user_data('users', username)

    if user_data:
        user_password = user_data['password']
        user_uuid = user_data['uuid']
        socketio.emit('user_credentials', {'password': user_password, 'uuid': user_uuid}, room=request.sid)
        logging.info(f'User logged in: {username} | UUID: {user_uuid}')
    else:
        logging.warning(f'Login failed for username: {username}')
        socketio.emit('user_credentials', {'error': 'User not found'}, room=request.sid)

# Event handler for user logout
@socketio.on('logout')
def handle_logout():
    """
    Handle user logout requests.
    Logs the logout event.
    """
    logging.info(f'Logout request received | Session ID: {request.sid}')
    # Implement logout functionality here

# Event handler for account creation
@socketio.on("create_account")
def handle_account_creation(data):
    """
    Handle requests to create a new user account.
    Checks if the username already exists, and if not, creates the new account in the database.
    """
    try:
        logging.info(f"Account creation requested with data: {data}")
        uuid = data.get('uuid')
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        dateOfBirth = data.get('dateOfBirth')
        accountCreatedTime = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        # Check if username already exists
        existing_user = userDB.fetch_informatiom_from_user('users', username)
        if existing_user[0]:  # Assuming fetch_informatiom_from_user returns (username, uuid)
            logging.warning(f"User creation failed, username already exists: {username}")
            return {'status': 'error', 'error': 'Username already exists'}

        accountToCreate = {
            'UUID': uuid,
            'Username': username,
            'Email': email,
            'Password': password,
            'DateOfBirth': dateOfBirth,
            'AccountCreatedTime': accountCreatedTime
        }

        # Create the new user account in the database
        userDB.create_user_account('users', accountToCreate)
        logging.info(f"User account created: {accountToCreate}")

        # Return a success response
        return {'status': 'ok'}

    except Exception as e:
        logging.error(f"Account creation failed due to an error: {str(e)}")
        return {'status': 'error', 'error': str(e)}

# Event handler to check tutorial completion
@socketio.on('check_tutorial_completion')
def handle_tutorial_completion(UUID):
    """
    Handle requests to check if a user has completed the tutorial.
    The completion status is emitted back to the client.
    """
    logging.info(f'Checking tutorial completion for UUID: {UUID}')
    completedTutorial = userDB.check_tutorial_completion('users', UUID)
    socketio.emit('return_tutorial_completion', {'CompletedTutorial': completedTutorial}, room=request.sid)
    logging.info(f'Tutorial completion status for UUID {UUID}: {completedTutorial}')

# Event handler for messages from clients
@socketio.on('message_from_client')
def handle_message(data):
    """
    Handle incoming messages from a client.
    Logs the message and stores the conversation in the database.
    """
    logging.info(f"Message received from client: {data}")

    uuid = data.get('UUID')
    username = data.get('Username')
    message = data.get('Message')
    messageId = data.get('MessageID')
    isSystemMessage = data.get('IsSystemMessage')
    messageType = data.get('MessageType')
    logging.info(f'Message from client({uuid}): {message}')

    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    conversationToLog = {
        'UUID': uuid,
        'Username': username,
        'MessageID': messageId,
        'Message': message,
        'IsRead': 'True',
        'IsSystemMessage': isSystemMessage,
        'MessageType': messageType,
        'Timestamp': timestamp
    }

    # Example data insertion into a different table (probably for debugging or testing)
    db.insert_data('userData', {'UID': uuid, 'UserName': "YoWhaddup", 'PromScore': 20, 'AnotherPromScore': 40,
                                'Timestamp': timestamp})
    # Log the conversation into the database
    conversationsDatabase.insert_data('chat_conversations', conversationToLog)
    logging.info(f'Conversation logged: {conversationToLog}')

# Event handler for questionnaire responses
@socketio.on('questionnaire_question_answered')
def handle_questionnaire_answered(data):
    """
    Handle the submission of a questionnaire response.
    Logs the response and stores it in the questionnaire database.
    """
    logging.info(f"Questionnaire answer received: {data}")

    uuid = data.get('UUID')
    username = data.get('Username')
    userResponse = data.get('UserResponse')
    questionID = data.get('QuestionID')
    questionText = data.get('QuestionText')
    questionType = data.get('QuestionType')
    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    questionnaireAnswertoLog = {
        'UUID': uuid,
        'Username': username,
        'UserResponse': userResponse,
        'QuestionID': questionID,
        'QuestionText': questionText,
        'QuestionType': questionType,
        'Timestamp': timestamp
    }

    # Log the questionnaire answer in the database
    questionnaireDatabase1.insert_data('QuestionnaireName1', questionnaireAnswertoLog)
    logging.info(f'Questionnaire answer logged: {questionnaireAnswertoLog}')

# Event handler for finishing a questionnaire
@socketio.on('finished_questionnaire')
def handle_questionnaire_finished(data):
    """
    Handle the completion of a questionnaire.
    Calculates and logs the stage score for the completed questionnaire.
    """
    uuid = data.get('UUID')
    logging.info(f"Questionnaire finished for UUID: {uuid}")
    # Calculate the stage score for the user based on the questionnaire
    questionnaireDatabase1.calculate_stage_score("QuestionnaireName1", uuid)
    logging.info(f"Stage score calculated for UUID: {uuid}")

# Event handler for logging connection events
@socketio.on('connection_log')
def handle_connection_log(data):
    """
    Handle logging of connection events from clients.
    Logs and stores connection data in the connection log database.
    """
    logging.info(f"Connection log data received: {data}")

    uuid = data.get('UUID')
    username = data.get('Username')
    connection = data.get('Connection')
    connectionType = data.get('ConnectionType')
    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    connectionLogData = {
        'UUID': uuid,
        'Username': username,
        'Connection': connection,
        'ConnectionType': connectionType,
        'Timestamp': timestamp
    }

    # Log the connection data into the database
    connectionLogDB.insert_data('connectionLog', connectionLogData)
    logging.info(f'Connection log recorded: {connectionLogData}')

# Event handler for logging interaction events
@socketio.on('interaction_log')
def handle_interaction_log(data):
    """
    Handle logging of interaction events from clients.
    Logs and stores interaction data in the interaction log database.
    """
    logging.info(f"Interaction log data received: {data}")

    uuid = data.get('UUID')
    username = data.get('Username')
    interactionType = data.get('InteractionType')
    interactionOutput = data.get('InteractionOutput')
    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    interactionLogData = {
        'UUID': uuid,
        'Username': username,
        'InteractionType': interactionType,
        'InteractionOutput': interactionOutput,
        'Timestamp': timestamp
    }

    # Log the interaction data into the database
    interactionLogsDB.insert_data('interactionLogs', interactionLogData)
    logging.info(f'Interaction log recorded: {interactionLogData}')

# Run the Flask-SocketIO server
if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5006, debug=True, allow_unsafe_werkzeug=True)
    """
    Start the Flask-SocketIO server, listening on all available network interfaces on port 5006.
    Debug mode is enabled for development purposes.
    """
