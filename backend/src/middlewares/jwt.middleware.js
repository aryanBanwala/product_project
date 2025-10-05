const jwt = require('jsonwebtoken');

/**
 * Ek helper class jo JWT se jude saare logic ko ek jagah rakhti hai.
 */
class JwtHelper {
    /**
     * Ek naya JWT token banata hai.
     * Isey aap login ke time par service file mein call karenge.
     * @param {object} payload - Woh data jo token ke andar store karna hai (e.g., { id: userId }).
     * @returns {string} Generate kiya hua JWT.
     */
    static generateToken(payload) {
        // .env file se secret key aur expiry time uthana
        const secret = process.env.JWT_SECRET;
        const expiresIn = process.env.JWT_EXPIRES_IN || '1h';

        if (!secret) {
            throw new Error('JWT_SECRET is not defined in the .env file.');
        }

        return jwt.sign(payload, secret, { expiresIn });
    }

    /**
     * Ek JWT ko verify karta hai.
     * Yeh middleware ke dwara istemal kiya jaata hai.
     * @param {string} token - Verify kiya jaane wala JWT.
     * @returns {object} Token ke andar ka decoded data (payload).
     * @throws {Error} Agar token invalid ya expire ho gaya ho.
     */
    static verifyToken(token) {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not defined in the .env file.');
        }

        return jwt.verify(token, secret);
    }
}
module.exports = {
    JwtHelper,
};