// Import necessary modules
const express = require('express');
const { Server } = require('socket.io');
const axios = require('axios');
const path = require('path');

// Import the database connections from the correct path
const { userDB, chatConversationsDB, connectionLogDB, interactionsDatabaseDB, testDatabaseDB } = require('./database/connectionDB');

// Create an Express application
const app = express();

// Create a server using Express
const httpServer = require('http').createServer(app);

// Initialize Socket.IO for real-time communication
const io = new Server(httpServer, {
    cors: {
        origin: "*",  // Allow all origins for development purposes
        methods: ["GET", "POST"]
    }
});

// Port configuration
const PORT = 5006;

// Middleware to parse JSON bodies
app.use(express.json());

// Route to check if the server is running
app.get('/', (req, res) => {
    res.send("Server is running!");
});

// Socket.IO connection event
io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Example event: handle client login
    socket.on('login', (username) => {
        console.log(`Login request from: ${username}`);

        // Fetch user info from the database
        userDB.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
            if (err) {
                console.error('Database error: ', err.message);
                socket.emit('login_failed', { error: 'Database error' });
            } else if (row) {
                socket.emit('login_success', { userData: row });
            } else {
                socket.emit('login_failed', { error: 'User not found' });
            }
        });
    });

    // Example event: forward message to RASA
    socket.on('send_message_to_rasa', (message) => {
        console.log(`Message from client: ${message}`);

        // Send message to RASA server
        axios.post('http://localhost:5005/webhooks/rest/webhook', {
            sender: socket.id, // You can replace this with user ID
            message: message
        }).then((response) => {
            console.log('Response from RASA:', response.data);
            socket.emit('rasa_response', response.data);
        }).catch((error) => {
            console.error('Error communicating with RASA:', error);
            socket.emit('rasa_error', { error: 'RASA server communication failed' });
        });
    });

    // Disconnect event
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

// Start the server and listen on port 5006
httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
