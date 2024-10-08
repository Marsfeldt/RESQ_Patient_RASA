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
    },
    pingInterval: 25000, // Intervalle des pings (en millisecondes) pour maintenir la connexion
    pingTimeout: 60000   // Durée avant de considérer que la connexion est perdue (en millisecondes)
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

    // Event to handle password reset request
    socket.on('reset_password', (mail) => {
        console.log('Etape_2.1')
        console.log(`Password reset request for: ${mail}`);

        // Recherche l'utilisateur dans la base de données
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465, // Port for SSL
            secure: true, // Use SSL
            auth: {
                user: 'resq.reset.passord@gmail.com',
                pass: 'pfqj cgst nwkf zmxb', // Utilise ici un App Password si 2FA est activé
            },
        });
        function generatePassword(length) {
            return crypto.randomBytes(Math.ceil(length / 2))
                .toString('hex') // Convertir en chaîne hexadécimale
                .slice(0, length); // Tronquer à la longueur souhaitée
        }

        async function sendResetPasswordEmail(email, username, db) {
            // 1. Générer un nouveau mot de passe aléatoire
            const newPassword = generatePassword(5);

            // 2. Hacher le mot de passe avec bcrypt (10 tours)
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

            // 3. Mettre à jour la base de données avec le mot de passe haché
            try {
                 userDB.run('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);
                 console.log('password succes change');
            } catch (error) {
                console.error('Error updating password in the database:', error);
                return { status: 'error', error: 'Failed to update password in the database' };
            }

            // 4. Configurer et envoyer l'email avec le nouveau mot de passe
            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'resq.reset.passord@gmail.com',
                    pass: 'pfqj cgst nwkf zmxb', // App password recommandé
                },
            });

            const mailOptions = {
                from: 'resq.reset.passord@gmail.com',
                to: email,
                subject: 'Your New Password',
                text: `Hello ${username},\n\nYour new password is: ${newPassword}\n\nPlease log in and change it as soon as possible.\n\nBest regards,\nYour App Team`,
            };

            // 5. Envoyer l'email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                    return { status: 'error', error: 'Failed to send email' };
                }
                console.log('Email sent:', info.response);
                return { status: 'ok', message: 'New password email sent' };
            });
        }

        // Recherche dans la base de données et envoi de l'email
        userDB.get('SELECT UUID, Username, Email FROM users WHERE email = ?', [mail], (err, row) => {
            if (err) {
                // Si une erreur de base de données survient, l'afficher et renvoyer une réponse d'erreur
                console.error('Database error:', err.message);
                socket.emit('reset_password_response', { error: 'Database error' });
            } else if (row) {
                // Si un utilisateur est trouvé, afficher le UUID et le Username
                console.log(`User found: UUID = ${row.UUID}, Username = ${row.Username}, Email = ${row.Email}`);

                // Envoi de l'email à l'utilisateur
                sendResetPasswordEmail(row.Email, row.Username, row.UUID);

                // Renvoie l'UUID et le Username dans la réponse au client
                socket.emit('reset_password_response', { UUID: row.UUID, username: row.Username, success: true });
            } else {
                // Si aucun utilisateur n'est trouvé, afficher un message approprié
                console.log('User not found');
                socket.emit('reset_password_response', { error: 'User not found' });
            }
        });

    });
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
    socket.on('send_message_to_rasa', async (message) => {
        try {
            const response = await axios.post('http://localhost:5005/webhooks/rest/webhook', {
                sender: socket.id,
                message: message,
            });
            socket.emit('rasa_response', response.data);
        } catch (error) {
            console.error('Error communicating with RASA:', error);
            socket.emit('rasa_error', { error: 'RASA server communication failed' });
        }
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
