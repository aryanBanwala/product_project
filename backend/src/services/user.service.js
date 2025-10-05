// src/services/user.service.js

class UserService {
    /**
     * Handles the business logic for creating a user.
     * In a real app, this would interact with a database.
     * @param {string} email - The user's email.
     * @param {string} password - The user's password.
     * @returns {object} The created user's data.
     */
    createUser(email, password) {
        console.log(`Service: Creating user with email: ${email}`);
        
        const newUser = {
            id: Date.now(),
            email: email,
        };

        return newUser;
    }

}

module.exports = new UserService();