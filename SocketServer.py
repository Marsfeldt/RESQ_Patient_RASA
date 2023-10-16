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

# Connection event
@socketio.on('connect')
def handle_connect():
    print('Client connected')

# Disconnection event
@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('login')
def handle_login(username):
    print('Retrieving password...')
    userPassword = userDB.retrieve_password_from_username('users', username)
    print('Password retrieved successfully!')
    if userPassword:
        socketio.emit('user_password', userPassword)
        #print(f'The Hashed Password: {userPassword}')
    else:
        socketio.emit('user_password', "User not found")

@socketio.on('logout')
def handle_logout():
    print('Handle logout')

@socketio.on("create_account")
def handle_account_creation(data):
    # Data values for account creation
    uuid = data.get('uuid')
    username = data.get('username')
    email = data.get('email')
    password = data.get('password') # Remember to hash the password important for security reasons
    dateOfBirth = data.get('dateOfBirth')
    accountCreatedTime = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    

    accountToCreate = {'UUID': uuid, 'Username': username, 'Email': email, 'Password': password, 'DateOfBirth': dateOfBirth, 'AccountCreatedTime': accountCreatedTime}
    userDB.create_user_account('users', accountToCreate)
    print(f'User Account: \n {uuid} , {username} , {email} , {password} , {dateOfBirth} , {accountCreatedTime} \n Created Successfully!')

# Client Message event
@socketio.on('message_from_client')
def handle_message(data):
    uuid = data.get('uuid')
    message = data.get('message')
    print(f'Message from client({uuid}): {message}')

    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    dataToSend = {'UID': uuid, 'UserName': "YoWhaddup", 'PromScore': 20, 'AnotherPromScore': 40, 'Timestamp': timestamp}
    db.insert_data('userData', dataToSend)

if __name__ == '__main__':

    # 172.24.222.4
    socketio.run(app, host='172.24.222.4', port=5006, debug=True)  # You can change the port as needed
