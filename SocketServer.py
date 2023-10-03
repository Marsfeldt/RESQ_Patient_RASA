from flask import Flask, render_template
from flask_socketio import SocketIO
import sqlite3
import datetime
from DatabaseHandler import *

app = Flask(__name__)
socketio = SocketIO(app)

# Database Initialization
db = DatabaseHandler("./PYTHON/DATABASE/TestDatabase.db")

# Connection event
@socketio.on('connect')
def handle_connect():
    print('Client connected')

# Disconnection event
@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

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
    socketio.run(app, host='172.24.223.90', port=5006, debug=True)  # You can change the port as needed
