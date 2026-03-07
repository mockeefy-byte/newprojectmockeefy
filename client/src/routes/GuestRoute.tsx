import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const GuestRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        // Prevent flickering by showing nothing or a spinner while checking auth
        return null;
    }

    if (user) {
        // If user is already logged in, redirect to dashboard or appropriate page
        if (user.userType === "expert") {
            return <Navigate to="/dashboard" replace />;
        } else if (user.userType === "admin") {
            return <Navigate to="/admin" replace />;
        } else {
            return <Navigate to="/dashboard" replace />; // Default fallback
        }
    }

    return <>{children}</>;
};
