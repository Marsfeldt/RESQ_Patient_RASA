// server.js

// Import necessary modules
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const cors = require('cors');

// Import database connections
const {
  userDB,
  chatConversationsDB,
  connectionLogDB,
  interactionsDatabaseDB,
  testDatabaseDB,
} = require('./database/connectionDB');

// Create an Express application
const app = express();

// Create a server using Express
const httpServer = http.createServer(app);

// Initialize Socket.IO for real-time communication
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Allow all origins for development purposes
    methods: ['GET', 'POST'],
  },
  pingInterval: 25000, // Ping interval to maintain the connection
  pingTimeout: 60000, // Duration before considering the connection lost
});

// Port configuration
const PORT = 5006;

// Middleware to parse JSON bodies and handle CORS
app.use(cors());
app.use(express.json());

// Route to check if the server is running
app.get('/', (req, res) => {
  res.send('Server is running!');
});

/**
 * Handle password reset request
 * Expects a username to be sent from the front-end
 */
app.post('/forgot-password', (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res
      .status(400)
      .json({ status: 'error', error: 'Username is required' });
  }

  // Check if the user exists in the database
  userDB.get(
    'SELECT * FROM users WHERE username = ?',
    [username],
    (err, row) => {
      if (err) {
        console.error('Database error:', err.message);
        return res
          .status(500)
          .json({ status: 'error', error: 'Database error' });
      }

      if (!row) {
        return res
          .status(404)
          .json({ status: 'error', error: 'User not found' });
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
          return res
            .status(500)
            .json({ status: 'error', error: 'Database update error' });
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
            return res
              .status(500)
              .json({ status: 'error', error: 'Failed to send email' });
          }
          console.log('Email sent:', info.response);
          return res.json({
            status: 'ok',
            message: 'Password reset email sent',
          });
        });
      });
    }
  );
});

/**
 * Handle user registration
 * Expects username, email, password, and dateOfBirth from the front-end
 */
app.post('/register', (req, res) => {
  const { username, email, password, dateOfBirth } = req.body;

  // Valider les données reçues
  if (!username || !email || !password || !dateOfBirth) {
    return res.status(400).json({ status: 'error', error: 'All fields are required' });
  }

  // Vérifier si le nom d'utilisateur existe déjà
  userDB.get('SELECT * FROM users WHERE Username = ?', [username], (err, row) => {
    if (err) {
      console.error('Erreur de base de données:', err.message);
      return res.status(500).json({ status: 'error', error: 'Database error' });
    }

    if (row) {
      // Le nom d'utilisateur existe déjà
      return res.status(400).json({ status: 'error', error: 'Username already exists' });
    }

    // Hacher le mot de passe
    bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
      if (hashErr) {
        console.error('Erreur lors du hachage du mot de passe:', hashErr);
        return res.status(500).json({ status: 'error', error: 'Error hashing password' });
      }

      // Générer un UUID
      const uuid = crypto.randomUUID();

      // Insérer le nouvel utilisateur dans la base de données
      const insertQuery = `
        INSERT INTO users (uuid, Username, Email, Password, dateOfBirth, AccountCreatedTime)
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

      userDB.run(insertQuery, params, function (insertErr) {
        if (insertErr) {
          console.error('Erreur lors de l\'insertion dans la base de données:', insertErr.message);
          return res.status(500).json({ status: 'error', error: 'Database insert error' });
        }

        console.log('Compte créé avec succès pour :', username);
        return res.json({ status: 'ok' });
      });
    });
  });
});


/**
 * Handle password reset confirmation (setting new password)
 * Expects a reset token and new password from the front-end
 */
app.post('/reset-password', (req, res) => {
  const { resetToken, newPassword } = req.body;

  if (!resetToken || !newPassword) {
    return res
      .status(400)
      .json({ status: 'error', error: 'Token and new password are required' });
  }

  // Check if the reset token exists and has not expired
  userDB.get(
    'SELECT * FROM users WHERE resetToken = ? AND resetTokenExpires > ?',
    [resetToken, new Date().toISOString()],
    (err, row) => {
      if (err) {
        console.error('Database error:', err.message);
        return res
          .status(500)
          .json({ status: 'error', error: 'Database error' });
      }

      if (!row) {
        return res
          .status(400)
          .json({ status: 'error', error: 'Invalid or expired token' });
      }

      // Hash the new password before saving it
      bcrypt.hash(newPassword, 10, (hashErr, hashedPassword) => {
        if (hashErr) {
          console.error('Error hashing password:', hashErr);
          return res
            .status(500)
            .json({ status: 'error', error: 'Password hashing error' });
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
            return res
              .status(500)
              .json({ status: 'error', error: 'Database update error' });
          }

          console.log('Password reset successfully for:', row.username);
          return res.json({
            status: 'ok',
            message: 'Password reset successfully',
          });
        });
      });
    }
  );
});

/**
 * Handle user login request
 * Expects username and password from the front-end
 */
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Adjust the SQL query if necessary
  userDB.get('SELECT * FROM users WHERE Username = ?', [username], (err, row) => {
    if (err) {
      console.error('Erreur de base de données:', err.message);
      return res.status(500).json({ status: 'error', error: 'Database error' });
    }

    if (!row) {
      // If the user does not exist
      return res.status(401).json({ status: 'error', error: 'Invalid username or password' });
    }

    // Check that 'row.Password' is not undefined
    if (!row.Password) {
      console.error('Le mot de passe haché est undefined.');
      return res.status(500).json({ status: 'error', error: 'Password not found in database' });
    }

    // Compares the password with the stored hash
    bcrypt.compare(password, row.Password, (compareErr, isMatch) => {
      if (compareErr) {
        console.error('Erreur lors de la comparaison des mots de passe:', compareErr);
        return res.status(500).json({ status: 'error', error: 'Internal error' });
      }

      if (isMatch) {
        // If the password is correct, return the user’s UUID
        return res.json({ status: 'ok', userUUID: row.uuid });
      } else {
        // If the password is incorrect
        return res.status(401).json({ status: 'error', error: 'Invalid username or password' });
      }
    });
  });
});


/**
 * Handle user logout request
 * Expects the user's socket ID to disconnect the socket
 */
app.post('/logout', (req, res) => {
  const { socketId } = req.body;

  if (!socketId) {
    return res
      .status(400)
      .json({ status: 'error', error: 'Socket ID is required' });
  }

  // Find and disconnect the socket
  const socketToDisconnect = io.sockets.sockets.get(socketId);
  if (socketToDisconnect) {
    socketToDisconnect.disconnect(true);
    console.log(`User with socket ID ${socketId} has been logged out.`);
    return res.json({ status: 'ok', message: 'Logout successful' });
  } else {
    console.log(`Socket with ID ${socketId} not found.`);
    return res
      .status(404)
      .json({ status: 'error', error: 'Socket not found' });
  }
});

// Socket.IO connection event
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

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
        // Username already exists
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

            userDB.run(insertQuery, params, function (insertErr) {
              if (insertErr) {
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
   * Handle message forwarding to RASA server
   * Expects a message from the client to forward to the RASA chatbot server
   */
  socket.on('send_message_to_rasa', async (message) => {
    try {
      const response = await axios.post(
        'http://localhost:5005/webhooks/rest/webhook',
        {
          sender: socket.id,
          message: message,
        }
      );
      socket.emit('rasa_response', response.data);
    } catch (error) {
      console.error('Error communicating with RASA:', error);
      socket.emit('rasa_error', { error: 'RASA server communication failed' });
    }
  });

/**
 * Handle sending a message to the bot and returning the response
 * Expects 'message' and 'session_id' from the client
 */
app.post('/send_message', async (req, res) => {
  const { message, session_id } = req.body;

  if (!message || !session_id) {
    return res.status(400).json({ status: 'error', error: 'Message and session_id are required' });
  }

  try {
    // Send the message to the RASA server
    const response = await axios.post('http://localhost:5005/webhooks/rest/webhook', {
      sender: session_id,
      message: message,
    });

    // RASA returns an array of messages
    const botResponses = response.data;

    // Take the first message for simplicity
    const botMessage = botResponses[0] || { text: '' };

    // Return the bot's message to the client
    res.json({ text: botMessage.text });

    // Optionally, log the interaction
    // Replace this with your actual logging logic
    console.log(`User (${session_id}) sent message: ${message}`);
    console.log(`Bot replied: ${botMessage.text}`);

  } catch (error) {
    console.error('Error communicating with RASA:', error);
    res.status(500).json({ status: 'error', error: 'Error communicating with bot' });
  }
});

/**
 * Handle interaction logs from the client
 * Expects interaction data in the request body
 */
app.post('/interaction_log', (req, res) => {
  const interactionData = req.body;

  // Validate interaction data
  if (!interactionData || !interactionData.UUID || !interactionData.InteractionType) {
    return res.status(400).json({ status: 'error', error: 'Invalid interaction data' });
  }

  // Log the interaction
  // Replace this with your actual logging logic, e.g., save to database
  console.log('Interaction log:', interactionData);

  res.json({ status: 'ok' });
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

// Start the server and listen on the specified port
httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
