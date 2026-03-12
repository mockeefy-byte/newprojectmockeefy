import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface RoleBasedRouteProps {
    allowedRoles: string[];
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ allowedRoles }) => {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/signin" state={{ from: location }} replace />;
    }

    const role = user.userType?.toLowerCase();
    const allowed = allowedRoles.map((r) => r.toLowerCase());
    if (!role || !allowed.includes(role)) {
        // Redirect to their appropriate dashboard if they try to access a route for another role
        if (role === 'expert') {
            return <Navigate to="/dashboard" replace />;
        } else if (role === 'admin') {
            return <Navigate to="/admin" replace />;
        } else {
            return <Navigate to="/" replace />;
        }
    }

    return <Outlet />;
};
