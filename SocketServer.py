from flask import Flask, render_template
from flask_socketio import SocketIO
import sqlite3
import datetime
from DatabaseHandler import *

app = Flask(__name__)
socketio = SocketIO(app)

# Database Initialization
db = DatabaseHandler("./PYTHON/DATABASE/TestDatabase.db")
userDB = DatabaseHandler("./PYTHON/DATABASE/Users.db")
conversationsDatabase = DatabaseHandler(
    "./PYTHON/DATABASE/ChatConversations.db")

# Connection event
@socketio.on('connect')
def handle_connect():
    print(f'Client connected')

# Disconnection event
@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('fetch_user_information')
def handle_fetch_user_information(username):
    fetchedUsername, fetchedUUID = userDB.fetch_informatiom_from_user(
        'users', username)
    print(f'Fetched Username: {fetchedUsername} UUID: {fetchedUUID}')
    socketio.emit('user_information_fetched', {
                  'fetchedUsername': fetchedUsername, 'fetchedUUID': fetchedUUID})

# Login event
@socketio.on('login')
def handle_login(username):
    """
    Handles login behaviour to retrieve the users password, whereafter it through the front-end decrypts it
    and compares it with the users password to authorize their login credentials
    """
    userPassword = userDB.retrieve_password_from_username('users', username)
    if userPassword:
        socketio.emit('user_password', userPassword)
        # print(f'The Hashed Password: {userPassword}')
    else:
        socketio.emit('user_password', "User not found")

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
    dateOfBirth = data.get('dateOfBirth')  # Account date of birth
    accountCreatedTime = datetime.datetime.now().strftime(
        '%Y-%m-%d %H:%M:%S')  # Account creation time

    accountToCreate = {'UUID': uuid, 'Username': username, 'Email': email, 'Password': password,
                       'DateOfBirth': dateOfBirth, 'AccountCreatedTime': accountCreatedTime}
    userDB.create_user_account('users', accountToCreate)
    print(
        f'User Account: \n {uuid} , {username} , {email} , {password} , {dateOfBirth} , {accountCreatedTime} \n Created Successfully!')

# Client Message event
@socketio.on('message_from_client')
def handle_message(data):
    """
    Works as a conversation logger as we retrieve the message sent by the user and then inserts
    that data into the conversation logging database
    """
    uuid = data.get('uuid')
    username = data.get('username')
    message = data.get('message')
    messageId = data.get('messageId')
    isSystemMessage = data.get('isSystemMessage')
    messageType = data.get('messageType')
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

if __name__ == '__main__':
    # You can change the port as needed
    socketio.run(app, host='192.168.0.47', port=5006, debug=True)
