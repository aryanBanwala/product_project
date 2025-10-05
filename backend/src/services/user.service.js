const bcrypt = require('bcrypt');
const { models: db } = require('../db/mongo/index');
const { JwtHelper } = require('../middlewares/jwt.middleware');

const EDITABLE_USER_FIELDS = ['name', 'email', 'mobile'];

class UserService {
    /**
     * Validates the user signup input.
     * Instead of throwing, it returns a result object.
     * @param {object} data - The user data ({ name, mobile, password }).
     * @returns {{isValid: boolean, message: string}} The validation result.
     */
    validateSignupInput(data) {
        if (!data.name || !data.mobile || !data.password) {
            return {
                isValid: false,
                message: 'Validation failed: Name, mobile, and password are required.'
            };
        }

        if (data.password.length < 8) {
            return {
                isValid: false,
                message: 'Validation failed: Password must be at least 8 characters long.'
            };
        }
        
        return { isValid: true, message: 'Validation successful.' };
    }

    /**
     * Checks if a user already exists with the given mobile number.
     * Throws a specific error if the user is found.
     * @param {string} mobile - The mobile number to check.
     */
    async checkUserExistsByMobile(mobile) {
        const existingUser = await db.users.findByMobile(mobile);
        if (existingUser) {
            // Conflict Error
            const error = new Error('A user with this mobile number already exists.');
            error.statusCode = 409;
            throw error;
        }
    }

    /**
     * Hashes the password and adds the new user to the database.
     * @param {object} userData - The complete and validated user data.
     * @returns {Promise<object>} The newly created, sanitized user object.
     */
    async addUserToDB(userData) {
        const { name, mobile, email, password } = userData;
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Add to the database
        const result = await db.users.create({
            name,
            mobile,
            email,
            hashedPassword
        });

        // Fetch and return the sanitized new user
        const newUser = await db.users.findById(result.insertedId);
        return newUser;
    }
    // --- NEW LOGIN FUNCTIONS ---

    /**
     * Validates the user login input.
     * @param {object} credentials - The user data ({ mobile, password }).
     * @returns {{isValid: boolean, message: string}} The validation result.
     */
    validateLoginInput(credentials) {
        if (!credentials.mobile || !credentials.password) {
            return {
                isValid: false,
                message: 'Validation failed: Mobile and password are required.'
            };
        }
        return { isValid: true, message: 'Validation successful.' };
    }

    /**
     * Finds a user by mobile for login, returning the full document.
     * Throws a specific error if the user is not found.
     * @param {string} mobile - The mobile number to search for.
     * @returns {Promise<object>} The full user document including the password hash.
     */
    async findUserForLogin(mobile) {
        const userWithPassword = await db.users.findForLoginByMobile(mobile);
        if (!userWithPassword) {
            const error = new Error('Invalid credentials.');
            error.statusCode = 401; // Unauthorized
            throw error;
        }
        return userWithPassword;
    }

    /**
     * Compares a plain text password with a hash from the database.
     * Throws a specific error if they do not match.
     * @param {string} plainPassword - The password from the user request.
     * @param {string} hashedPassword - The hashed password from the database.
     */
    async matchPassword(plainPassword, hashedPassword) {
        const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
        if (!isMatch) {
            const error = new Error('Invalid credentials.');
            error.statusCode = 401; // Unauthorized
            throw error;
        }
    }

    /**
     * Placeholder for generating a JWT token in the future.
     * @param {object} user - The user object to create a token for.
     * @returns {string} A placeholder for the token.
     */
    generateToken(user) {
        // Payload mein sirf zaroori aur non-sensitive data daalein.
        const payload = {
            id: user._id.toString()
        };
        
        console.log(`Generating token for user ID: ${payload.id}`);

        // Humare central JwtHelper se token generate karwana
        return JwtHelper.generateToken(payload);
    }

    // --- PROFILE UPDATE FUNCTIONS ---

    /**
     * Request body se sirf allowed fields ko filter karta hai.
     * @param {object} updateData - req.body se aaya hua raw data.
     * @returns {object} Sirf allowed fields wala naya object.
     */
    filterAllowedFields(updateData) {
        const filteredData = {};
        for (const field of EDITABLE_USER_FIELDS) {
            // Check karein ki field request mein मौजूद hai ya nahi (null/empty bhi valid ho sakta hai)
            if (updateData.hasOwnProperty(field)) {
                filteredData[field] = updateData[field];
            }
        }

        if (Object.keys(filteredData).length === 0) {
            const error = new Error('No valid fields provided for update.');
            error.statusCode = 400; // Bad Request
            throw error;
        }

        return filteredData;
    }

    /**
     * Check karta hai ki naya mobile number kisi aur user ne toh nahi le rakha.
     * @param {string} mobile - Naya mobile number.
     * @param {string} currentUserId - Current user ki ID taaki usey search se exclude kiya ja sake.
     */
    async checkMobileAvailability(mobile, currentUserId) {
        const existingUser = await db.users.findByMobile(mobile, currentUserId);
        if (existingUser) {
            const error = new Error('This mobile number is already taken by another user.');
            error.statusCode = 409; // Conflict
            throw error;
        }
    }

    /**
     * Database mein user ko update karta hai.
     * @param {string} userId - User ki ID.
     * @param {object} dataToUpdate - Filter kiya hua data.
     * @returns {Promise<object>} Update kiya hua user.
     */
    async updateUserInDB(userId, dataToUpdate) {
        return db.users.updateById(userId, dataToUpdate);
    }
}

module.exports = new UserService();