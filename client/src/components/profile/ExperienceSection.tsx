import { useEffect, useState } from "react";
import { Save, Plus, Trash2, Briefcase } from "lucide-react";
import axios from '../../lib/axios';
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";

interface Experience {
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
}

interface ExperienceSectionProps {
    profileData: {
        experience?: Experience[];
        preferences?: {
            experienceLevel?: string;
            jobType?: string;
            expectedSalary?: string | number;
            noticePeriod?: string;
            willingToRelocate?: boolean;
        };
    } | null;
    onUpdate: () => void;
}

export default function ExperienceSection({ profileData, onUpdate }: ExperienceSectionProps) {
    const { user } = useAuth();
    const userId = user?.id || user?._id || user?.userId;
    const [experience, setExperience] = useState<Experience[]>(profileData?.experience || []);
    const [experienceLevel, setExperienceLevel] = useState<string>(profileData?.preferences?.experienceLevel || "");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setExperience(profileData?.experience || []);
    }, [profileData?.experience]);

    useEffect(() => {
        setExperienceLevel(profileData?.preferences?.experienceLevel || "");
    }, [profileData?.preferences?.experienceLevel]);

    const addExperience = () => {
        setExperience([...experience, {
            company: "",
            position: "",
            startDate: "",
            endDate: "",
            current: false,
            description: ""
        }]);
    };

    const removeExperience = (index: number) => {
        setExperience(experience.filter((_, i) => i !== index));
    };

    const updateExperience = (index: number, field: keyof Experience, value: string | boolean) => {
        const updated = [...experience];
        updated[index] = { ...updated[index], [field]: value };
        setExperience(updated);
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            // Save only the selected experience level here.
            // Do not send other preference fields from this screen to avoid accidental overwrite.
            const prefPayload = { experienceLevel };

            await axios.put(
                "/api/user/profile/preferences",
                prefPayload,
                { headers: { userid: userId } }
            );

            const response = await axios.put(
                "/api/user/profile/experience",
                { experience },
                { headers: { userid: userId } }
            );

            if (response.data.success) {
                toast.success("Experience updated successfully!");
                onUpdate();
            }
        } catch (error) {
            console.error("Error updating experience:", error);
            toast.error("Failed to update experience");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Work Experience</h2>
                    <p className="text-[13px] font-medium text-slate-500 mt-1">Your professional background</p>
                </div>
                {experienceLevel !== "Fresher" && (
                    <button
                        onClick={addExperience}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#004fcb] text-white rounded-lg hover:bg-blue-600 transition-colors text-[11px] font-bold"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add
                    </button>
                )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Experience Type</label>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setExperienceLevel("Fresher")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                            experienceLevel === "Fresher"
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                    >
                        Fresher
                    </button>
                    <button
                        type="button"
                        onClick={() => setExperienceLevel("Experienced")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                            experienceLevel === "Experienced"
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                    >
                        Experienced
                    </button>
                </div>
                {experienceLevel === "Fresher" && (
                    <p className="text-[11px] text-slate-500 mt-2">
                        Fresher selected. Work experience entries are optional. You can keep this empty.
                    </p>
                )}
            </div>

            {experienceLevel !== "Fresher" && experience.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-slate-100 bg-slate-50/50 rounded-xl">
                    <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 text-[11px]">No experience added</p>
                    <button
                        onClick={addExperience}
                        className="mt-2 text-[#004fcb] text-[11px] font-bold hover:underline"
                    >
                        Add now
                    </button>
                </div>
            ) : experienceLevel !== "Fresher" ? (
                <div className="space-y-4">
                    {experience.map((exp, index) => (
                        <div key={index} className="border border-slate-200/80 bg-white rounded-xl p-4 relative shadow-sm hover:shadow-md transition-all group">
                            <button
                                onClick={() => removeExperience(index)}
                                className="absolute top-3 right-3 p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Company</label>
                                    <input
                                        type="text"
                                        value={exp.company}
                                        onChange={(e) => updateExperience(index, "company", e.target.value)}
                                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:border-[#004fcb] focus:ring-0 transition-all font-semibold text-slate-800"
                                        placeholder="Google"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Position</label>
                                    <input
                                        type="text"
                                        value={exp.position}
                                        onChange={(e) => updateExperience(index, "position", e.target.value)}
                                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:border-[#004fcb] focus:ring-0 transition-all"
                                        placeholder="Software Engineer"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : ""}
                                        onChange={(e) => updateExperience(index, "startDate", e.target.value)}
                                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:border-[#004fcb] focus:ring-0 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        value={exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : ""}
                                        onChange={(e) => updateExperience(index, "endDate", e.target.value)}
                                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:border-[#004fcb] focus:ring-0 transition-all"
                                        disabled={exp.current}
                                    />
                                </div>

                                <div className="flex items-center md:col-span-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={exp.current}
                                            onChange={(e) => updateExperience(index, "current", e.target.checked)}
                                            className="w-3.5 h-3.5 text-[#004fcb] border-slate-300 rounded focus:ring-0"
                                        />
                                        <span className="text-xs font-medium text-slate-600">Currently Working Here</span>
                                    </label>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Description</label>
                                    <textarea
                                        value={exp.description}
                                        onChange={(e) => updateExperience(index, "description", e.target.value)}
                                        rows={2}
                                        maxLength={500}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-[#004fcb] focus:ring-0 transition-all resize-none"
                                        placeholder="Describe responsibilities..."
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : null}

            {experienceLevel === "Fresher" && (
                <div className="text-center py-8 border border-dashed border-blue-200 bg-blue-50/40 rounded-xl">
                    <Briefcase className="w-10 h-10 text-blue-300 mx-auto mb-2" />
                    <p className="text-slate-600 text-sm font-semibold">Fresher Profile Selected</p>
                    <p className="text-slate-500 text-[11px] mt-1">No prior company experience required.</p>
                </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3.5 bg-[#004fcb] text-white rounded-xl hover:bg-blue-600 transition-all disabled:opacity-50 text-[13px] font-bold shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95"
                >
                    <Save className="w-3.5 h-3.5" />
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </div>
    );
}
