// src/config/database.js
const mongoConnection = require('../db/mongo/db');

/**
 * Initializes connections to all required databases.
 * This function acts as a central point for all DB connections.
 * If you add another database (e.g., Redis), you'll add its connection logic here.
 */
const initializeDatabaseConnections = async () => {
    try {
        console.log('Initializing database connections...');
        
        // Connect to MongoDB
        await mongoConnection.init();

        console.log('All database connections initialized successfully.');
    } catch (error) {
        console.error('❌ Failed to initialize database connections:', error);
        // Exit the process if critical connections fail
        process.exit(1);
    }
};

module.exports = { initializeDatabaseConnections };