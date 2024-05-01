from flask import Flask, request
from flask_socketio import SocketIO
import sqlite3
import datetime
import uuid  # Import uuid module for generating UUIDs
from DatabaseHandler import *

app = Flask(__name__)
socketio = SocketIO(app)

# Database Initialization
db = DatabaseHandler("./PYTHON/DATABASE/TestDatabase.db")
userDB = DatabaseHandler("./PYTHON/DATABASE/Users.db")
conversationsDatabase = DatabaseHandler("./PYTHON/DATABASE/ChatConversations.db")
questionnaireDatabase1 = DatabaseHandler("./PYTHON/QUESTIONNAIRE_DATABASES/Questionnaire_Name.db")
connectionLogDB = DatabaseHandler("./PYTHON/DATABASE/ConnectionLog.db")
interactionLogsDB = DatabaseHandler("./PYTHON/DATABASE/InteractionsDatabase.db")

# Dictionary to store connected users
connected_users = {}

# Connection event
@socketio.on('connect')
def handle_connect():
    print(f'Client connected')
    # Get the username from the client
    username = request.args.get('username')
    # Retrieve UUID from the database based on the username
    fetchedUsername, fetchedUUID = userDB.fetch_informatiom_from_user('users', username)
    
    if fetchedUUID:
        # Store the user in the connected_users dictionary
        connected_users[request.sid] = {'username': username, 'user_uuid': fetchedUUID}
        # Broadcast the new user information to all clients
        socketio.emit('new_user_connected', {'userUUID': fetchedUUID, 'username': username}, broadcast=True)
    else:
        print(f'User not found: {username}')
        # If user not found, send an event to the client
        socketio.emit('user_not_found', {'username': username}, room=request.sid)

# Disconnection event
@socketio.on('disconnect')
def handle_disconnect():
    if request.sid in connected_users:
        username = connected_users[request.sid]['username']
        user_uuid = connected_users[request.sid]['user_uuid']
        # Remove the user from the connected_users dictionary
        del connected_users[request.sid]
        # Broadcast the disconnection to all clients
        socketio.emit('user_disconnected', {'userUUID': user_uuid, 'username': username}, broadcast=True)
        print(f'Client disconnected: {username}')
    else:
        print(f'Unknown client disconnected: {request.sid}')


# Modify your fetchUserUUID function to emit the user UUID to the client
@socketio.on('fetch_user_uuid')
def fetch_user_uuid(username):
    fetchedUsername, fetchedUUID = userDB.fetch_informatiom_from_user('users', username)
    
    if fetchedUUID:
        # Emit the fetched UUID to the client
        socketio.emit('user_uuid_fetched', {'userUUID': fetchedUUID})
    else:
        print(f'User not found: {username}')
        # If user not found, emit an event to the client
        socketio.emit('user_uuid_not_found', {'username': username})

@socketio.on('fetch_user_information')
def handle_fetch_user_information(username):
    fetchedUsername, fetchedUUID = userDB.fetch_informatiom_from_user('users', username)
    print(f'Fetched Username: {fetchedUsername} UUID: {fetchedUUID}')
    socketio.emit('user_information_fetched', {'fetchedUsername': fetchedUsername, 'fetchedUUID': fetchedUUID, 'session_id': fetchedUUID})  # Emit session_id as well

# Login event
@socketio.on('login')
def handle_login(username):
    """
    Handles login behaviour to retrieve the users password and UUID,
    then emits both to the client.
    """
    user_data = userDB.retrieve_user_data('users', username)  # Fetch user data including password and UUID
    print('Recieving Login Request from', username)
    if user_data:
        user_password = user_data['password']
        user_uuid = user_data['uuid']
        socketio.emit('user_credentials', {'password': user_password, 'uuid': user_uuid}, room=request.sid)
    else:
        socketio.emit('user_credentials', {'error': 'User not found'}, room=request.sid)

@socketio.on('logout')
def handle_logout():
    print('Handle logout')

@socketio.on("create_account")
def handle_account_creation(data):
    """
    Handles account creation from the react front-end signup screen
    """
    # Data values for account creation
    # Universally Unique Identifier to separate different users
    uuid = data.get('uuid')
    username = data.get('username')  # Account Username
    email = data.get('email')  # Account Email
    # Account Password - Hashed through the front-end
    password = data.get('password')
    stage = 1
    dateOfBirth = data.get('dateOfBirth')  # Account date of birth
    accountCreatedTime = datetime.datetime.now().strftime(
        '%Y-%m-%d %H:%M:%S')  # Account creation time

    accountToCreate = {'UUID': uuid, 'Username': username, 'Email': email, 'Password': password, 'Stage': stage,
                       'DateOfBirth': dateOfBirth, 'AccountCreatedTime': accountCreatedTime}
    userDB.create_user_account('users', accountToCreate)
    print(
        f'User Account: \n {uuid} , {username} , {email} , {password} , {stage} , {dateOfBirth} , {accountCreatedTime} \n Created Successfully!')

@socketio.on('check_tutorial_completion')
def handle_tutorial_completion(UUID):
    """
    Check whether the user has completed the tutorial
    """
    completedTutorial = userDB.check_tutorial_completion('users', UUID)
    socketio.emit('return_tutorial_completion', {'CompletedTutorial': completedTutorial}, room=request.sid)

# Client Message event
@socketio.on('message_from_client')
def handle_message(data):
    """
    Works as a conversation logger as we retrieve the message sent by the user and then inserts
    that data into the conversation logging database
    """
    uuid = data.get('UUID')
    username = data.get('Username')
    message = data.get('Message')
    messageId = data.get('MessageID')
    isSystemMessage = data.get('IsSystemMessage')
    messageType = data.get('MessageType')
    print(f'Message from client({uuid}): {message}')

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
    
    dataToSend = {'UID': uuid, 'UserName': "YoWhaddup",
                  'PromScore': 20, 'AnotherPromScore': 40, 'Timestamp': timestamp}
    db.insert_data('userData', dataToSend)
    conversationsDatabase.insert_data('chat_conversations', conversationToLog)

@socketio.on('questionnaire_question_answered')
def handle_questionnaire_answered(data):
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

    questionnaireDatabase1.insert_data('QuestionnaireName1', questionnaireAnswertoLog)

@socketio.on('finished_questionnaire')
def handle_questionnaire_finished(data):
    uuid = data.get('UUID')
    questionnaireDatabase1.calculate_stage_score("QuestionnaireName1", uuid)

@socketio.on('connection_log')
def handle_connection_log(data):
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

    connectionLogDB.insert_data('connectionLog', connectionLogData)

@socketio.on('interaction_log')
def handle_interaction_log(data):
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

    interactionLogsDB.insert_data('interactionLogs', interactionLogData)

if __name__ == '__main__':
    # You can change the port as needed
    socketio.run(app, host='172.31.156.122', port=5006, debug=True)
    # 130.225.198.128
    # 172.31.157.55
    # 172.31.157.12
