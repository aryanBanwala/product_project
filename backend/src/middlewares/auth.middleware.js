// src/middlewares/auth.middleware.js

const auth = {}

auth.userAuth = (req, res, next) => {
    const secretKey = req.headers['x-auth-secret'];
    if (secretKey && secretKey === process.env.SECRET_AUTH_KEY) {
        // If it matches, proceed to the next middleware or route handler
        next();
    } else {
        // If it doesn't match or isn't present, send an unauthorized error
        res.status(401).json({ message: 'Unauthorized: Access is denied' });
    }
};

module.exports = auth;