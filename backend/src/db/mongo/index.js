const UserModel = require('./user');

// This object will hold all initialized model instances.
const models = {};

const initializeCollections = (db) => {
    models.users = UserModel.init(db);

    console.log('✅ MongoDB collections initialized.');
};

// Export the initializer function and the final models object
module.exports = {
    initializeCollections,
    models
};