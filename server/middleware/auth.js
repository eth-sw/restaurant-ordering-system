const jwt = require('jsonwebtoken');

/**
 * Intercepts requests to private routes.
 * Verifies JWT token from header, attaches decoded user data to request object.
 *
 * @param req HTTP Request object
 * @param res HTTP Response object
 * @param next Callback function to pass control to next middleware in stack
 * @returns {*} 401 if auth fails, otherwise calls next() to proceed
 *
 * @author Ethan Swain
 */
module.exports = function authMiddleware(req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if token exists
    if (!token) {
        return res.status(401).json({ message: 'No token. Authorisation denied' });
    }

    // Verify token is valid
    try {
        // Decode token using the Secret Key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user payload to the request object so it can be used in all routes
        req.user = decoded.user;

        // Go to route handler
        next();
    } catch (err) {
        console.error("Middleware Authorisation Error:", err.message)
        res.status(401).json({ message: 'Token is not valid' });
    }
};