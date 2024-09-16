// Import necessary modules
const express = require('express');
const { Server } = require('socket.io');
const axios = require('axios');
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing
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

    /**
     * Handle login event from front-end
     * Expects a username to be sent from the client
     */
    socket.on('login', (username) => {
        console.log(`Login request received from: ${username}`);

        // Fetch user data from the database
        userDB.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
            if (err) {
                console.error('Database error: ', err.message);
                socket.emit('user_credentials', { error: 'Database error' });
            } else if (row) {
                const receivedHash = row.password;

                // Send back hashed password and UUID to front-end for comparison
                socket.emit('user_credentials', { password: receivedHash, uuid: row.uuid });
            } else {
                // Handle case where user is not found
                socket.emit('user_credentials', { error: 'User not found' });
            }
        });
    });

    /**
     * Handle account creation from front-end
     * Expects user registration data to be sent from the client
     */
    socket.on('create_account', (data, callback) => {
        const { uuid, username, email, password, dateOfBirth } = data;
        console.log('Account creation request received from:', uuid);

        // Check if the username already exists in the database
        userDB.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
            if (err) {
                console.error('Database error:', err.message);
                callback({ status: 'error', error: 'Database error' });
            } else if (row) {
                // If a user with this username already exists, return an error
                console.log('Username already exists:', username);
                callback({ status: 'error', error: 'Username already exists' });
            } else {
                // Hash the user's password before saving it
                bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
                    if (hashErr) {
                        console.error('Error hashing password:', hashErr);
                        callback({ status: 'error', error: 'Password hashing error' });
                    } else {
                        // Insert the new user into the database
                        const insertQuery = `
                            INSERT INTO users (uuid, username, email, password, dateOfBirth, AccountCreatedTime)
                            VALUES (?, ?, ?, ?, ?, ?)
                        `;
                        const params = [uuid, username, email, hashedPassword, dateOfBirth, new Date().toISOString()];

                        console.log('Executing query:', insertQuery);
                        console.log('With params:', params);

                        userDB.run(insertQuery, params, function (insertErr) {
                            if (insertErr) {
                                // Log detailed error message
                                console.error('Database insert error:', insertErr.message);
                                callback({ status: 'error', error: 'Database insert error' });
                            } else {
                                console.log('Account created successfully for:', username);
                                callback({ status: 'ok' });
                            }
                        });
                    }
                });
            }
        });
    });


    /**
     * Handle check_tutorial_completion event from front-end
     * Expects a UUID to be sent from the client
     */
    socket.on('check_tutorial_completion', (userUUID) => {
        console.log(`Checking tutorial completion for user: ${userUUID}`);

        // Fetch tutorial completion status from the database
        userDB.get('SELECT CompletedTutorial FROM users WHERE uuid = ?', [userUUID], (err, row) => {
            if (err) {
                console.error('Database error: ', err.message);
                socket.emit('tutorial_check_failed', { error: 'Database error' });
            } else if (row) {
                // Send back the completion status to the client
                socket.emit('return_tutorial_completion', { CompletedTutorial: row.CompletedTutorial });
            } else {
                socket.emit('return_tutorial_completion', { CompletedTutorial: null });
            }
        });
    });

    /**
     * Example event: forward message to RASA server
     * This event forwards a message from the client to the RASA chatbot server
     */
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

    /**
     * Example event: log interactions
     * Logs interactions for analytics or debugging
     */
    socket.on('interaction_log', (interactionData) => {
        console.log(`Logging interaction: ${interactionData.InteractionType} by ${interactionData.Username}`);
        // Logic to store interaction data in the database (implement as needed)
        // e.g., connectionLogDB.insert(interactionData)
    });

    // Handle disconnection event
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

// Start the server and listen on port 5006
httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
