const jwt = require("jsonwebtoken");

/**
 * Optional AUth Middleware
 * Checks for a JWT token in the request header.
 * If present and valid: Attaches the user payload to the request object.
 * If NOT present: Allows the request to proceed anyway (Guest Checkout requirement).
 *
 * @param req HTTP Request object
 * @param res HTTP Response object
 * @param next Next middleware function
 *
 * @author Ethan Swain
 */
module.exports = function optionalAuth(req, res, next) {
    const token = req.header('x-auth-token');

    // If no token, proceed as guest
    if (!token) {
        return next();
    }

    try {
        // Decode and verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        // Token is invalid, still proceed as guest
        next();
    }
};