from flask import Flask, request, json
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import requests
import sqlite3
from DatabaseFunctions import DatabaseFunctions
import datetime

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

rasa_session = requests.Session()
rasa_endpoint = 'http://localhost:5005/webhooks/rest/webhook'

DATABASE_NAME = "RASA/interactionsDatabase.db"

dbf = DatabaseFunctions()


@socketio.on('connect')
def handle_connect():
    """
    Function to handle the individual socket connection from a client
    """
    client_sid = request.sid  # Get the session ID of the connected client
    print(f'Client connected {client_sid}')
    
    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    data = ("Connected", None, timestamp)
    dbf.insert_into_database(DATABASE_NAME, data)

@socketio.on('disconnect')
def handle_disconnect():
    """
    Function to handle the individual socket disconnection from a client
    """
    client_sid = request.sid  # Get the session ID of the connected client
    print(f'Client disconnected {client_sid}')

    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    data = (client_sid, "Disconnected", None, timestamp)
    dbf.insert_into_database(DATABASE_NAME, data)
 
@socketio.on('message')
def handle_message(data):
    """
    Function to handle the messages from the react front-end mobile application
    """
    try:
        response = send_to_rasa(data['text'])
        client_sid = request.sid  # Get the session ID of the connected client
        print(f'Received message from {client_sid}:', data)
        # You can broadcast the message to all connected clients if needed
        emit('message', {'text': response})
        timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        dataFromUser = (client_sid, "Send Message Button", str(data['text']), timestamp)
        dbf.insert_into_database(DATABASE_NAME, dataFromUser)
 
        timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        dataFromRasa = (None, "Rasa Response", str(response), timestamp)
        dbf.insert_into_database(DATABASE_NAME, dataFromRasa)
    except Exception as e:
        print(f'Error processing message: {str(e)}')

def send_to_rasa(message):
    """
    Function to handle communciation between the socket server and the RASA server
    So that we can send and revieve messages to and from RASA
    """
    payload = {'message': message}

    # Send the request using the session with connection pooling
    with rasa_session.post(rasa_endpoint, json=payload) as response:
        response_data = response.json()

    # Extract and return the chatbot's response
    if response_data:
        return response_data[0]['text']
    else:
        return 'No response from chatbot'

if __name__ == '__main__':
    socketio.run(app, port=6969, debug=True)