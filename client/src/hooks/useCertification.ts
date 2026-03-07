import { useState, useEffect } from "react";
import axios from "../lib/axios";
import { useAuth } from "../context/AuthContext";

export type CertificationData = {
    completedSessions: number;
    targetSessions: number;
    isEligibleForCertificate: boolean;
    certifications: any[];
    nextMilestone: string;
};

export const useCertification = () => {
    const { user } = useAuth();
    const [data, setData] = useState<CertificationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCertStatus = async () => {
            // Check for user ID in both places slightly differently based on potential user structure inconsistencies
            const userId = (user as any)?._id || user?.id;

            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const res = await axios.get(`/api/certifications/status/${userId}`);
                if (res.data.success) {
                    setData(res.data.data);
                }
            } catch (err: any) {
                console.error("Failed to fetch certification status", err);
                setError(err.message || "Failed to load certification data");
            } finally {
                setLoading(false);
            }
        };

        fetchCertStatus();
    }, [user]);

    return { data, loading, error };
};
