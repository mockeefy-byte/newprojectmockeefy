import { useState, useEffect } from "react";
import { Input, PrimaryButton, SecondaryButton, IconButton } from "../pages/ExpertDashboard";
import axios from '../lib/axios';
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { AlertCircle } from "lucide-react";

interface ExpertEducationProps {
    onUpdate?: () => void;
    profileData?: any;
    isMissing?: boolean;
}

const ExpertEducation = ({ onUpdate, isMissing }: ExpertEducationProps) => {
    const { user } = useAuth();
    const userId = user?.id || "";

    const initialProfile = { education: [] as any[] };
    const [profile, setProfile] = useState(initialProfile);
    const [loading, setLoading] = useState(true);

    const addEducation = () =>
        setProfile((p) => ({
            ...p,
            education: [...p.education, { degree: "", institution: "", field: "", start: "", end: "" }]
        }));

    const updateEducation = (idx: number, field: string, value: string) => {
        setProfile((p) => {
            const ed = [...p.education];
            ed[idx] = { ...ed[idx], [field]: value };
            return { ...p, education: ed };
        });
    };

    // ---------------- GET education ----------------
    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const fetchEducation = async () => {
            try {
                const response = await axios.get("/api/expert/education");

                if (response.data.success) {
                    setProfile({ education: response.data.data });
                }
            } catch (err: any) {
                if (err.response && err.response.status === 404) {
                    // ignore
                } else {
                    console.error("Failed to fetch education:", err);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchEducation();
    }, [userId]);

    // ---------------- Save / Upsert ----------------
    const saveEducation = async () => {
        if (!userId) {
            toast.error("User not logged in");
            return;
        }

        try {
            const response = await axios.put(
                "/api/expert/education",
                { education: profile.education }
            );

            if (response.data.success) {
                toast.success("Education saved successfully!");
                if (onUpdate) onUpdate();
            } else {
                toast.error("Failed to save education");
            }
        } catch (err) {
            console.error(err);
            toast.error("Server error");
        }
    };

    // ---------------- DELETE education ----------------
    const removeEducation = async (idx: number) => {
        try {
            // Optimistically update local state first
            setProfile((p) => ({
                ...p,
                education: p.education.filter((_, i) => i !== idx)
            }));

            // Call DELETE endpoint to remove from DB
            const response = await axios.delete(
                `/api/expert/education/${idx}`
            );

            if (!response.data.success) {
                toast.error("Failed to remove education in DB");
            } else {
                if (onUpdate) onUpdate();
            }
        } catch (err) {
            console.error("Error removing education:", err);
            toast.error("Server error");
        }
    };


    if (loading) return <p>Loading education...</p>;

    return (
        <div className="h-full">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                        Education
                        {isMissing && <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Action Required</span>}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Add degrees and study periods</p>
                </div>
                <div>
                    <SecondaryButton onClick={addEducation}>+ Add</SecondaryButton>
                </div>
            </div>

            {profile.education.length === 0 ? (
                <div className="text-center text-sm text-gray-500 py-4">No education entries yet.</div>
            ) : (
                <div className="space-y-4">
                    {profile.education.map((edu: any, i: number) => (
                        <div key={i} className="border border-gray-200 rounded-lg p-10 relative bg-gray-50">
                            <IconButton onClick={() => removeEducation(i)} className="absolute top-2 right-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </IconButton>

                            <div className="space-y-3">
                                <Input placeholder="Degree" value={edu.degree} onChange={(v) => updateEducation(i, "degree", v)} />
                                <Input placeholder="Institution" value={edu.institution} onChange={(v) => updateEducation(i, "institution", v)} />
                                <Input placeholder="Field of Study" value={edu.field} onChange={(v) => updateEducation(i, "field", v)} />
                                <div className="grid grid-cols-2 gap-3">
                                    <Input placeholder="Start Year" type="number" value={edu.start} onChange={(v) => updateEducation(i, "start", v)} />
                                    <Input placeholder="End Year" type="number" value={edu.end} onChange={(v) => updateEducation(i, "end", v)} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-6 flex justify-end">
                <PrimaryButton onClick={saveEducation}>Save Changes</PrimaryButton>
            </div>
        </div>
    );
};

export default ExpertEducation;
