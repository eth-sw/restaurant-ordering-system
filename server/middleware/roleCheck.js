/**
 * Role-Based Access Control Middleware.
 * Verifies if the authenticated user has a role included in the allowed list.
 * Must be used after auth.js middleware.
 *
 * @param allowedRoles Array of roles permitted to access route
 * @returns {Function} Express middleware function
 *
 * @author Ethan Swain
 */
const roleCheck = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access Denied: You do not have permission" });
        }
        next();
    };
};

module.exports = roleCheck;