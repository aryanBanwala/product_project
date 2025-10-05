const bcrypt = require('bcrypt');
const { models } = require('../db/mongo/index');

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
        const existingUser = await models.users.findByMobile(mobile);
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
        const result = await models.users.create({
            name,
            mobile,
            email,
            hashedPassword
        });

        // Fetch and return the sanitized new user
        const newUser = await models.users.findById(result.insertedId);
        return newUser;
    }
}

module.exports = new UserService();