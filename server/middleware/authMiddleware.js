
import { authenticateToken } from '../controllers/authController.js';

// Re-export authenticateToken as protect for consistency with other routes
export const protect = authenticateToken;

// Role authorization middleware
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Not authorized, no user found" });
        }
        if (!roles.includes(req.user.userType)) {
            return res.status(403).json({ message: `User role ${req.user.userType} is not authorized to access this route` });
        }
        next();
    };
};

export const admin = authorize('admin');
