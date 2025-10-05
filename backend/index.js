// index.js
require('dotenv').config();
const app = require('./app');
const { initializeDatabaseConnections } = require('./src/config/database');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    // Step 1: First, connect to all databases
    await initializeDatabaseConnections();

    // Step 2: Once databases are connected, start the Express server
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
};

startServer();