const jwt = require('jsonwebtoken');

/**
 * This function request to private routes
 * It checks for a valid JWT token in the header
 */
module.exports = function(req, res, next) {
    // Get token from the header
    const token = req.header('x-auth-token');

    // Check if no token is present
    if (!token) {
        return res.status(401).json({ message: 'No token, authorisation denied' });
    }

    // Verify the token
    try {
        // Decode the token using the Secret Key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user's ID from token to request object
        // Allows route handler to know who is logged in
        req.user = decoded.user;

        next(); // Move on to the actual route handler
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};