// src/controllers/user.controller.js
const userService = require('../services/user.service');

class UserController {
    /**
     * Controller method for user signup.
     * It handles the request and response for the signup route.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    signup(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password are required' });
            }

            const newUser = userService.createUser(email, password);
            
            res.status(201).json({ 
                message: "User signed up successfully!",
                data: newUser 
            });

        } catch (error) {
            console.error('Signup Error:', error);
            res.status(500).json({ message: 'An error occurred during signup.' });
        }
    }
}

module.exports = new UserController();