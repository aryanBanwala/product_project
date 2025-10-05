const { MongoClient } = require('mongodb');
const { initializeCollections, models } = require('./index'); // Manager ko import kiya

/**
 * Manages the main MongoDB connection and triggers collection initialization.
 * Iski zimmedari sirf connection banana aur phir manager ko kaam saunpna hai.
 */
class MongoDatabase {
    constructor() {
        if (MongoDatabase.instance) {
            return MongoDatabase.instance;
        }
        
        // --- Environment-based URI banane ka logic (same as before) ---
        const env = process.env.NODE_ENV || 'local';
        const dbName = process.env.DB_NAME;
        let mongoUri;

        if (env === 'production') {
            const user = process.env.MONGO_PROD_USER, pass = process.env.MONGO_PROD_PASS, host = process.env.MONGO_PROD_HOST;
            if (!user || !pass || !host || !dbName) throw new Error('Production DB env vars must be defined.');
            mongoUri = `mongodb+srv://${user}:${pass}@${host}`;
        } else {
            const host = process.env.MONGO_LOCAL_HOST;
            if (!host || !dbName) throw new Error('Development DB env vars must be defined.');
            mongoUri = `mongodb://${host}`;
        }

        this.client = new MongoClient(mongoUri);
        this.dbName = dbName;
        this.db = null;
        MongoDatabase.instance = this;
    }

    /**
     * Connects to the DB and then delegates model initialization.
     */
    async init() {
        // Step 1: Library tak jaana (Asynchronous kaam)
        await this.client.connect();
        this.db = this.client.db(this.dbName);
        console.log(`✅ MongoDB: Connected to database "${this.dbName}"`);

        // Step 2: Manager ko connection dekar bolna ki models taiyaar kare (Synchronous kaam)
        initializeCollections(this.db);
    }
}

// Singleton instance export karna
module.exports = new MongoDatabase();