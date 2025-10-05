const { ObjectId } = require('mongodb');

/**
 * Defines a mapping between application-level field names and database field names.
 * This acts as a single source of truth for the User schema.
 * Using all caps for DB fields is a common convention.
 */
const USER_FIELDS = Object.freeze({
    id: '_id',
    name: 'NAME',
    mobile: 'MOBILE',
    email: 'EMAIL',
    password: 'PASSWORD',
    lastLogin: 'LAST_LOGIN',
    createdAt: 'CREATED_AT',
    updatedAt: 'UPDATED_AT',
});

class UserModel {
    constructor(db) {
        if (!db) {
            throw new Error("UserModel requires a database instance.");
        }
        this.collection = db.collection('users');
    }

    /**
     * A static factory method to initialize and return an instance of the UserModel.
     * @param {Db} db - The MongoDB database instance.
     * @returns {UserModel} A new instance of the UserModel.
     */
    static init(db) {
        return new UserModel(db);
    }

    /**
     * A private helper to format the user document for application use.
     * It removes sensitive data (like password) and maps DB fields to app fields.
     * @param {object} userDocument - The raw document from the database.
     * @returns {object|null} A sanitized user object.
     */
    _sanitizeUser(userDocument) {
        if (!userDocument) {
            return null;
        }

        const sanitized = {
            id: userDocument[USER_FIELDS.id],
            name: userDocument[USER_FIELDS.name],
            mobile: userDocument[USER_FIELDS.mobile],
            email: userDocument[USER_FIELDS.email],
            lastLogin: userDocument[USER_FIELDS.lastLogin],
            createdAt: userDocument[USER_FIELDS.createdAt],
        };

        // We never return the password hash to the application layer.
        return sanitized;
    }

    /**
     * Creates a new user in the database.
     * @param {object} userData - The user data ({ name, mobile, email?, hashedPassword }).
     * @returns {Promise<object>} The result of the insert operation.
     */
    async create(userData) {
        const newUserDocument = {
            [USER_FIELDS.name]: userData.name,
            [USER_FIELDS.mobile]: userData.mobile,
            [USER_FIELDS.email]: userData.email || null, // Email is optional
            [USER_FIELDS.password]: userData.hashedPassword,
            [USER_FIELDS.lastLogin]: null,
            [USER_FIELDS.createdAt]: new Date(),
            [USER_FIELDS.updatedAt]: new Date(),
        };
        return this.collection.insertOne(newUserDocument);
    }

    /**
     * Finds a user by their mobile number.
     * @param {string} mobile - The user's mobile number.
     * @returns {Promise<object|null>} The sanitized user document or null if not found.
     */
    async findByMobile(mobile) {
        const user = await this.collection.findOne({ [USER_FIELDS.mobile]: mobile });
        return this._sanitizeUser(user);
    }

    /**
     * Finds a user by their email.
     * @param {string} email - The user's email.
     * @returns {Promise<object|null>} The sanitized user document or null if not found.
     */
    async findByEmail(email) {
        // We only search if the email is a non-empty string
        if (!email) return null;
        const user = await this.collection.findOne({ [USER_FIELDS.email]: email });
        return this._sanitizeUser(user);
    }

    /**
     * Finds a user by mobile for login purposes, returning the raw document.
     * Yeh method password hash bhi return karta hai taaki usey compare kiya ja sake.
     * @param {string} mobile - User ka mobile number.
     * @returns {Promise<object|null>} User ka raw document ya null.
     */
    async findForLoginByMobile(mobile) {
        // Dhyaan dein: Hum yahan _sanitizeUser ko call NAHI kar rahe hain
        return this.collection.findOne({ [USER_FIELDS.mobile]: mobile });
    }

    /**
     * Finds a user by their ID.
     * @param {string} id - The user's ID.
     * @returns {Promise<object|null>} The sanitized user document or null if not found.
     */
    async findById(id) {
        const user = await this.collection.findOne({ [USER_FIELDS.id]: new ObjectId(id) });
        return this._sanitizeUser(user);
    }

    /**
     * Updates a user's details in the database.
     * @param {string} userId - The ID of the user to update.
     * @param {object} updateData - An object with fields to update.
     * @returns {Promise<object|null>} The updated, sanitized user document.
     */
    /**
     * Updates a user's details, correctly mapping application fields to DB fields.
     * @param {string} userId - The ID of the user to update.
     * @param {object} updateData - An object with app-level fields to update (e.g., { name: 'New Name' }).
     * @returns {Promise<object|null>} The updated, sanitized user document.
     */
    async updateById(userId, updateData) {
        const dbUpdateData = {};
        // Loop through incoming data and map keys to the DB schema using USER_FIELDS
        for (const appField in updateData) {
            if (USER_FIELDS[appField]) { // Check if the field is in our mapping
                const dbField = USER_FIELDS[appField];
                dbUpdateData[dbField] = updateData[appField];
            }
        }

        // Only proceed if there is valid data to update
        if (Object.keys(dbUpdateData).length === 0) {
            return this.findById(userId); // Return the user without changes
        }

        const updateDocument = {
            $set: {
                ...dbUpdateData,
                [USER_FIELDS.updatedAt]: new Date()
            }
        };

        await this.collection.updateOne(
            { [USER_FIELDS.id]: new ObjectId(userId) },
            updateDocument
        );

        return this.findById(userId);
    }
}

module.exports = UserModel;