// Import necessary modules
const express = require('express');
const { Server } = require('socket.io');
const axios = require('axios');
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing
const nodemailer = require('nodemailer'); // For sending emails
const crypto = require('crypto'); // For generating reset tokens
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

/**
 * Handle password reset request
 * Expects a username to be sent from the front-end
 */
app.post('/forgot-password', (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ status: 'error', error: 'Username is required' });
    }

    // Check if the user exists in the database
    userDB.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ status: 'error', error: 'Database error' });
        }

        if (!row) {
            return res.status(404).json({ status: 'error', error: 'User not found' });
        }

        // Generate a password reset token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Token expiration time (e.g., 1 hour)
        const expirationTime = new Date(Date.now() + 3600000); // 1 hour from now

        // Save the token and expiration time to the database
        const updateQuery = `UPDATE users SET resetToken = ?, resetTokenExpires = ? WHERE username = ?`;
        const params = [resetToken, expirationTime.toISOString(), username];

        userDB.run(updateQuery, params, function (updateErr) {
            if (updateErr) {
                console.error('Database update error:', updateErr.message);
                return res.status(500).json({ status: 'error', error: 'Database update error' });
            }

            // Set up the email transport (using nodemailer)
            const transporter = nodemailer.createTransport({
                service: 'Gmail', // or any other email service
                auth: {
                    user: 'your-email@gmail.com',
                    pass: 'your-email-password',
                },
            });

            const mailOptions = {
                from: 'your-email@gmail.com',
                to: row.email, // The user's email from the database
                subject: 'Password Reset',
                text: `You requested a password reset. Use this token: ${resetToken}. This token will expire in 1 hour.`,
            };

            // Send the email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                    return res.status(500).json({ status: 'error', error: 'Failed to send email' });
                }
                console.log('Email sent:', info.response);
                return res.json({ status: 'ok', message: 'Password reset email sent' });
            });
        });
    });
});

/**
 * Handle password reset confirmation (setting new password)
 * Expects a reset token and new password from the front-end
 */
// Route for handling the new password confirmation
app.post('/reset-password', (req, res) => {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
        return res.status(400).json({ status: 'error', error: 'Token and new password are required' });
    }

    // Check if the reset token exists and has not expired
    userDB.get(
        'SELECT * FROM users WHERE resetToken = ? AND resetTokenExpires > ?',
        [resetToken, new Date().toISOString()],
        (err, row) => {
            if (err) {
                console.error('Database error:', err.message);
                return res.status(500).json({ status: 'error', error: 'Database error' });
            }

            if (!row) {
                return res.status(400).json({ status: 'error', error: 'Invalid or expired token' });
            }

            // Hash the new password before saving it
            bcrypt.hash(newPassword, 10, (hashErr, hashedPassword) => {
                if (hashErr) {
                    console.error('Error hashing password:', hashErr);
                    return res.status(500).json({ status: 'error', error: 'Password hashing error' });
                }

                // Update the user's password in the database and remove the reset token
                const updatePasswordQuery = `
                    UPDATE users
                    SET password = ?, resetToken = NULL, resetTokenExpires = NULL
                    WHERE username = ?
                `;
                const params = [hashedPassword, row.username];

                userDB.run(updatePasswordQuery, params, function (updateErr) {
                    if (updateErr) {
                        console.error('Database update error:', updateErr.message);
                        return res.status(500).json({ status: 'error', error: 'Database update error' });
                    }

                    console.log('Password reset successfully for:', row.username);
                    return res.json({ status: 'ok', message: 'Password reset successfully' });
                });
            });
        }
    );
});

/**
 * Handle user logout request
 * Expects the user's socket ID to disconnect the socket
 */
app.post('/logout', (req, res) => {
    const { socketId } = req.body;

    if (!socketId) {
        return res.status(400).json({ status: 'error', error: 'Socket ID is required' });
    }

    // Find and disconnect the socket
    const socketToDisconnect = io.sockets.sockets.get(socketId);
    if (socketToDisconnect) {
        socketToDisconnect.disconnect(true);
        console.log(`User with socket ID ${socketId} has been logged out.`);
        return res.json({ status: 'ok', message: 'Logout successful' });
    } else {
        console.log(`Socket with ID ${socketId} not found.`);
        return res.status(404).json({ status: 'error', error: 'Socket not found' });
    }
});

// Socket.IO connection event
io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    /**
     * Handle login event from front-end
     * Expects a username to be sent from the client
     */
    socket.on('login', (username) => {
        console.log(`Login request received for username: ${username}`);

        // Fetch user data from the database
        userDB.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
            if (err) {
                console.error('Database error: ', err.message);
                socket.emit('user_credentials', { error: 'Database error' });
            } else if (row) {
                console.log('User data retrieved from database:', row);
                const receivedHash = row.Password;
                console.log('Hashed password retrieved:', receivedHash);
                socket.emit('user_credentials', { password: receivedHash, uuid: row.UUID });
            } else {
                console.log('User not found in the database');
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
                        const params = [
                            uuid,
                            username,
                            email,
                            hashedPassword,
                            dateOfBirth,
                            new Date().toISOString(),
                        ];

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
        axios
            .post('http://localhost:5005/webhooks/rest/webhook', {
                sender: socket.id, // You can replace this with user ID
                message: message,
            })
            .then((response) => {
                console.log('Response from RASA:', response.data);
                socket.emit('rasa_response', response.data);
            })
            .catch((error) => {
                console.error('Error communicating with RASA:', error);
                socket.emit('rasa_error', { error: 'RASA server communication failed' });
            });
    });

    /**
     * Example event: log interactions
     * Logs interactions for analytics or debugging
     */
    socket.on('interaction_log', (interactionData) => {
        console.log(
            `Logging interaction: ${interactionData.InteractionType} by ${interactionData.Username}`
        );
        // Logic to store interaction data in the database (implement as needed)
        // e.g., connectionLogDB.insert(interactionData)
    });

    /**
     * Handle logout event from front-end
     */
    socket.on('logout', () => {
        console.log(`User logged out: ${socket.id}`);
        socket.disconnect(true);
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
