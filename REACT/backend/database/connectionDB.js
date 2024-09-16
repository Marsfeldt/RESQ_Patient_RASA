const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Define the correct path for all databases
const usersDBPath = path.join(__dirname, '../../../DATA/DATABASE/Users.db');
const chatConversationsDBPath = path.join(__dirname, '../../../DATA/DATABASE/ChatConversations.db');
const connectionLogDBPath = path.join(__dirname, '../../../DATA/DATABASE/ConnectionLog.db');
const interactionsDatabaseDBPath = path.join(__dirname, '../../../DATA/DATABASE/InteractionsDatabase.db');
const testDatabaseDBPath = path.join(__dirname, '../../../DATA/DATABASE/TestDatabase.db');

// Function to connect to a database and handle errors
function connectToDatabase(dbPath, dbName) {
    return new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error(`Error connecting to the ${dbName} database at path: ${dbPath}. Error message: ${err.message}`);
        } else {
            console.log(`Connected to ${dbName} database.`);
        }
    });
}

// Export all database connections
module.exports = {
    userDB: connectToDatabase(usersDBPath, 'Users'),
    chatConversationsDB: connectToDatabase(chatConversationsDBPath, 'ChatConversations'),
    connectionLogDB: connectToDatabase(connectionLogDBPath, 'ConnectionLog'),
    interactionsDatabaseDB: connectToDatabase(interactionsDatabaseDBPath, 'InteractionsDatabase'),
    testDatabaseDB: connectToDatabase(testDatabaseDBPath, 'TestDatabase'),
};
