const bcrypt = require('bcrypt');
const { models: db } = require('../db/mongo/index');

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
        console.log('Token generation logic will be implemented here in the future.');
        // Abhi ke liye, hum ek simple placeholder return karenge.
        return 'placeholder_auth_token_for_now';
    }

}

module.exports = new UserService();