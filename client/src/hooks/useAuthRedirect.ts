import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export const useAuthRedirect = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { fetchProfile } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            // Store token
            localStorage.setItem('token', token);

            // Force reload to trigger AuthContext init or manually fetch profile
            // Manual fetch is better UI experience than full reload
            fetchProfile().then((user) => {
                if (user) {
                    toast.success('Successfully logged in with Google');
                } else {
                    toast.error('Failed to verify Google session');
                    localStorage.removeItem('token');
                }
                // Convert current URL to one without the token query param
                // We use replace to not mess up history
                navigate(window.location.pathname, { replace: true });
            });
        }
    }, [searchParams, navigate, fetchProfile]);
};
