const userService = require('../services/user.service');
const { models: db } = require('../db/mongo/index');

class UserController {
    /**
     * Handles the user signup request by calling service functions step-by-step.
     */
    async signup(req, res) {
        try {
            // Step 1: Call validation service
            const validationResult = userService.validateSignupInput(req.body);
            if (!validationResult.isValid) {
                // If validation fails, send a 400 Bad Request response and stop.
                return res.status(400).json({
                    success: false,
                    message: validationResult.message
                });
            }

            // Step 2: Call service to check if user already exists
            await userService.checkUserExistsByMobile(req.body.mobile);

            // Step 3: Call service to add the user to the database
            const newUser = await userService.addUserToDB(req.body);

            // Step 4: Send the final successful response
            res.status(201).json({
                success: true,
                message: 'User created successfully!',
                data: newUser
            });

        } catch (error) {
            // This will catch errors thrown from the service (e.g., user exists)
            console.error('Error during user signup:', error.message);
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'An internal server error occurred.'
            });
        }
    }

     async login(req, res) {
        try {
            const { mobile, password } = req.body;

            // Step 1: Input ko validate karna
            const validationResult = userService.validateLoginInput(req.body);
            if (!validationResult.isValid) {
                return res.status(400).json({
                    success: false,
                    message: validationResult.message
                });
            }

            // Step 2: User ko dhoondhna
            const userWithPassword = await userService.findUserForLogin(mobile);

            // Step 3: Password ko match karna
            await userService.matchPassword(password, userWithPassword.PASSWORD);
            
            // Step 4 (Future): Token generate karna
            // const token = userService.generateToken(userWithPassword);

            // Final Step: Response ke liye sanitized user data ko fetch karna
            const sanitizedUser = await db.users.findById(userWithPassword._id);

            // Safal response bhejna
            res.status(200).json({
                success: true,
                message: 'Login successful!',
                data: {
                    user: sanitizedUser,
                    // token: token // Yeh baad mein add hoga
                }
            });

        } catch (error) {
            console.error('Error during user login:', error.message);
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'An internal server error occurred.'
            });
        }
    }

}

module.exports = new UserController();