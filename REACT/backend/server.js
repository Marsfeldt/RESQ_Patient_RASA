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
  RESQDB,
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
      .json({ status: 'error', error: 'username is required' });
  }

  // Check if the user exists in the database
  RESQDB.get(
    'SELECT * FROM user WHERE username = ?',
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
      const updateQuery = `UPDATE user SET resetToken = ?, resetTokenExpires = ? WHERE username = ?`;
      const params = [resetToken, expirationTime.toISOString(), username];

      RESQDB.run(updateQuery, params, function (updateErr) {
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
 * Expects username, email, password, and date_of_birth from the front-end
 */
app.post('/register', (req, res) => {
  const { username, email, password, date_of_birth } = req.body;

  // Validate received data
  if (!username || !email || !password || !date_of_birth) {
    return res
      .status(400)
      .json({ status: 'error', error: 'All fields are required' });
  }

  // Check if the username already exists
  RESQDB.get(
    'SELECT * FROM user WHERE username = ?',
    [username],
    (err, row) => {
      if (err) {
        console.error('Database error:', err.message);
        return res
          .status(500)
          .json({ status: 'error', error: 'Database error' });
      }

      if (row) {
        // username already exists
        return res
          .status(400)
          .json({ status: 'error', error: 'username already exists' });
      }

      // Hash the password
      bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
        if (hashErr) {
          console.error('Error hashing password:', hashErr);
          return res
            .status(500)
            .json({ status: 'error', error: 'Error hashing password' });
        }

        // Generate a uuid
        const uuid = crypto.randomUUID();

        // Insert the new user into the database
        const insertQuery = `
          INSERT INTO user (uuid, username, email, password, date_of_birth, account_creation_time)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        const params = [
          uuid,
          username,
          email,
          hashedPassword,
          date_of_birth,
          new Date().toISOString(),
        ];

        RESQDB.run(insertQuery, params, function (insertErr) {
          if (insertErr) {
            console.error(
              'Database insert error:',
              insertErr.message
            );
            return res
              .status(500)
              .json({ status: 'error', error: 'Database insert error' });
          }

          return res.json({ status: 'ok' });
        });
      });
    }
  );
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
      .json({
        status: 'error',
        error: 'Token and new password are required',
      });
  }

  // Check if the reset token exists and has not expired
  RESQDB.get(
    'SELECT * FROM user WHERE resetToken = ? AND resetTokenExpires > ?',
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
          .json({
            status: 'error',
            error: 'Invalid or expired token',
          });
      }

      // Hash the new password before saving it
      bcrypt.hash(newPassword, 10, (hashErr, hashedPassword) => {
        if (hashErr) {
          console.error('Error hashing password:', hashErr);
          return res
            .status(500)
            .json({
              status: 'error',
              error: 'Password hashing error',
            });
        }

        // Update the user's password in the database and remove the reset token
        const updatePasswordQuery = `
          UPDATE users
          SET password = ?, resetToken = NULL, resetTokenExpires = NULL
          WHERE username = ?
        `;
        const params = [hashedPassword, row.username];

        RESQDB.run(
          updatePasswordQuery,
          params,
          function (updateErr) {
            if (updateErr) {
              console.error(
                'Database update error:',
                updateErr.message
              );
              return res
                .status(500)
                .json({
                  status: 'error',
                  error: 'Database update error',
                });
            }

            return res.json({
              status: 'ok',
              message: 'Password reset successfully',
            });
          }
        );
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

  RESQDB.get(
    'SELECT * FROM user WHERE username = ?',
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
          .status(401)
          .json({
            status: 'error',
            error: 'Invalid username or password',
          });
      }

      if (!row.password) {
        console.error('Hashed password is undefined.');
        return res
          .status(500)
          .json({
            status: 'error',
            error: 'Password not found in database',
          });
      }

      // Compare the password with the stored hash
      bcrypt.compare(
        password,
        row.password,
        (compareErr, isMatch) => {
          if (compareErr) {
            console.error(
              'Error comparing passwords:',
              compareErr
            );
            return res
              .status(500)
              .json({
                status: 'error',
                error: 'Internal error',
              });
          }

          if (isMatch) {
            return res.json({
              status: 'ok',
              useruuid: row.uuid,
            });
          } else {
            return res
              .status(401)
              .json({
                status: 'error',
                error: 'Invalid username or password',
              });
          }
        }
      );
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
    return res
      .status(400)
      .json({ status: 'error', error: 'Socket ID is required' });
  }

  // Find and disconnect the socket
  const socketToDisconnect = io.sockets.sockets.get(socketId);
  if (socketToDisconnect) {
    socketToDisconnect.disconnect(true);
    return res.json({ status: 'ok', message: 'Logout successful' });
  } else {
    return res
      .status(404)
      .json({ status: 'error', error: 'Socket not found' });
  }
});

/**
 * Handle sending a message to the bot and returning the response
 * Expects 'message' and 'session_id' from the client
 */
app.post('/send_message', async (req, res) => {
  const { message, session_id } = req.body;

  // Validate received data
  if (!message || !session_id) {
    return res
      .status(400)
      .json({
        status: 'error',
        error: 'Message and session_id are required',
      });
  }

  try {
    // Send the message to the RASA server
    const response = await axios.post(
      'http://localhost:5005/webhooks/rest/webhook',
      {
        sender: session_id,
        message: message,
      }
    );

    // RASA returns an array of messages
    const botResponses = response.data;

    // Take the first message to simplify
    const botMessage = botResponses[0] || { text: '' };

    // Return the bot's message to the client
    res.json({ text: botMessage.text });
  } catch (error) {
    console.error('Error communicating with RASA:', error.message);

    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error headers:', error.response.headers);
      console.error('Error data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Request setup error:', error.message);
    }

    res
      .status(500)
      .json({ status: 'error', error: 'Error communicating with bot' });
  }
});

/**
 * Handle interaction logs from the client
 * Expects interaction data in the request body
 */
app.post('/interaction_log', (req, res) => {
  const interactionData = req.body;

  // Validate interaction data
  if (
    !interactionData ||
    !interactionData.uuid ||
    !interactionData.InteractionType
  ) {
    return res
      .status(400)
      .json({ status: 'error', error: 'Invalid interaction data' });
  }

  // Log the interaction
  // Replace this with your actual logging logic, e.g., save to database

  res.json({ status: 'ok' });
});

// Socket.IO connection event
io.on('connection', (socket) => {
  /**
   * Handle account creation from front-end
   * Expects user registration data to be sent from the client
   */
  socket.on('create_account', (data, callback) => {
    const { uuid, username, email, password, date_of_birth } = data;

    // Check if the username already exists in the database
    RESQDB.get(
      'SELECT * FROM user WHERE username = ?',
      [username],
      (err, row) => {
        if (err) {
          console.error('Database error:', err.message);
          callback({ status: 'error', error: 'Database error' });
        } else if (row) {
          callback({
            status: 'error',
            error: 'username already exists',
          });
        } else {
          // Hash the user's password before saving it
          bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
            if (hashErr) {
              console.error('Error hashing password:', hashErr);
              callback({
                status: 'error',
                error: 'Password hashing error',
              });
            } else {
              // Insert the new user into the database
              const insertQuery = `
                INSERT INTO user (uuid, username, email, password, date_of_birth, account_creation_time)
                VALUES (?, ?, ?, ?, ?, ?)
              `;
              const params = [
                uuid,
                username,
                email,
                hashedPassword,
                date_of_birth,
                new Date().toISOString(),
              ];

              RESQDB.run(insertQuery, params, function (insertErr) {
                if (insertErr) {
                  console.error(
                    'Database insert error:',
                    insertErr.message
                  );
                  callback({
                    status: 'error',
                    error: 'Database insert error',
                  });
                } else {
                  callback({ status: 'ok' });
                }
              });
            }
          });
        }
      }
    );
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
      socket.emit('rasa_error', {
        error: 'RASA server communication failed',
      });
    }
  });

  /**
   * Handle logout event from front-end
   */
  socket.on('logout', () => {
    socket.disconnect(true);
  });

  // Handle disconnection event
  socket.on('disconnect', () => {
    // Client disconnected
  });
});

// Start the server and listen on the specified port
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://10.0.2.2:${PORT}`);
});