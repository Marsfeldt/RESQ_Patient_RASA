import socketio
import uuid

sio = socketio.Client()

# Event handler for successful connection
@sio.event
def connect():
    print("Connected to Rasa socket server")

@sio.event
def disconnect():
    print("Disconnected from Rasa socket server")

# Event handler for receiving bot messages
@sio.on("bot_uttered")
def handle_bot_message(data):
    print(f"\n Bot Response: {data['text']}")

# Connect to the Rasa socket server
sio.connect("http://localhost:5005")

# Function to establish a session and get a session ID
def establish_session():
    # Generate a unique session ID (e.g., using UUID)
    session_id = str(uuid.uuid4())
    # Send a session request to the Rasa server
    sio.emit("session_request", {"session_id": session_id})
    print(f"User Connection was Established with the following session id: {session_id}")
    return session_id

# Establish a session
session_id = establish_session()