from flask import Flask, request, jsonify
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
def hello():
    return 'Hello, World!'

@socketio.on('user_uttered')
def handle_user_message(message):
    # Handle the user's message (e.g., log it, send it to Rasa)
    # You can also store the message in the database here
    print('Received user message:', message)
    
    # Send the message to Rasa (assuming Rasa is also connected through Socket.IO)
    socketio.emit('user_uttered', message, namespace='/rasa')

@socketio.on('bot_uttered')
def handle_bot_response(response):
    # Handle the bot's response (e.g., log it, send it to the React Native app)
    # You can also store the bot's response in the database here
    print('Received bot response:', response)
    
    # Send the response to the React Native app
    socketio.emit('bot_uttered', response)

if __name__ == '__main__':
    socketio.run(app, debug=True)