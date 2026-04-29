
import { authenticateToken } from '../controllers/authController.js';

// Re-export authenticateToken as protect for consistency with other routes
export const protect = authenticateToken;

const normalizeRole = (role) => String(role || "").trim().toLowerCase();

// Role authorization middleware
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Not authorized, no user found" });
        }
        const allowedRoles = roles.map(normalizeRole);
        const userRole = normalizeRole(req.user.userType);
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ message: `User role ${req.user.userType} is not authorized to access this route` });
        }
        req.user.userType = userRole;
        next();
    };
};

export const admin = authorize('admin');
