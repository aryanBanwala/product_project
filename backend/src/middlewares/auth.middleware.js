const { JwtHelper } = require('./jwt.middleware'); // Humare JWT helper ko import kiya

const auth = {};

/**
 * Ek naya middleware jo user ko header mein diye gaye JWT aur userId ke आधार par authenticate karta hai.
 * Yeh un sabhi routes ke liye istemal hoga jinke liye user ka logged-in hona zaroori hai.
 */
auth.userAuth = (req, res, next) => {
    try {
        // Step 1: Header se token aur userId nikalna
        const token = req.headers.token
        const userId = req.headers.userid;

        // Check karna ki dono cheezein maujood hain ya nahi
        if (!token || !userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'Access denied. Token aur userId dono headers mein zaroori hain.' 
            });
        }

        // Step 2: Token ko verify karna
        const decodedPayload = JwtHelper.verifyToken(token);
        
        // Step 3: Sabse Zaroori Check - Kya token ke andar ki ID header ki ID se match karti hai?
        if (decodedPayload.id !== userId) {
            return res.status(403).json({ success: false, message: 'Forbidden. Token user se match nahi karta.' });
        }
        
        // Step 4: User ki details ko request object mein daalna taaki controller iska istemal kar sake
        req.user = decodedPayload; // payload mein { id } hai
        
        // Sabhi checks pass ho gaye, ab agle function par jaao
        next();

    } catch (error) {
        // Yeh JwtHelper.verifyToken se aane wale errors (jaise token expire ho gaya) ko pakdega
        return res.status(403).json({ success: false, message: 'Forbidden. Invalid ya expired token.' });
    }
};

module.exports = auth;
