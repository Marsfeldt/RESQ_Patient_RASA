const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Define the correct path for all databases
const RESQDBPath = path.join(__dirname, '../../../DATA/DATABASE/RESQ.db');

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
    RESQDB: connectToDatabase(RESQDBPath, 'RESQ'),
};
