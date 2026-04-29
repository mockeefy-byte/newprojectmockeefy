import { useEffect, useState } from "react";
import { Save, Plus, Trash2, GraduationCap } from "lucide-react";
import axios from '../../lib/axios';
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";

interface Education {
    degree: string;
    institution: string;
    field: string;
    startYear: number;
    endYear: number | null;
    current: boolean;
}

interface EducationSectionProps {
    profileData: {
        education?: Education[];
    } | null;
    onUpdate: () => void;
}

export default function EducationSection({ profileData, onUpdate }: EducationSectionProps) {
    const { user } = useAuth();
    const userId = user?.id || user?._id || user?.userId;
    const [education, setEducation] = useState(profileData?.education || []);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setEducation(profileData?.education || []);
    }, [profileData?.education]);

    const addEducation = () => {
        setEducation([...education, {
            degree: "",
            institution: "",
            field: "",
            startYear: new Date().getFullYear(),
            endYear: null,
            current: false
        }]);
    };

    const removeEducation = (index: number) => {
        setEducation(education.filter((_, i) => i !== index));
    };

    const updateEducation = (index: number, field: keyof Education, value: string | number | boolean | null) => {
        const updated = [...education];
        updated[index] = { ...updated[index], [field]: value };
        setEducation(updated);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const response = await axios.put(
                "/api/user/profile/education",
                { education },
                { headers: { userid: userId } }
            );

            if (response.data.success) {
                toast.success("Education updated successfully!");
                onUpdate();
            }
        } catch (error) {
            console.error("Error updating education:", error);
            toast.error("Failed to update education");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500 max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Education</h2>
                    <p className="text-sm font-medium text-slate-500 mt-1">Your academic background</p>
                </div>
                <button
                    onClick={addEducation}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:opacity-95 transition-colors text-[12px] font-bold shadow-lg shadow-blue-500/20"
                >
                    <Plus className="w-4 h-4" />
                    Add
                </button>
            </div>

            {education.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 bg-slate-50 rounded-[28px]">
                    <GraduationCap className="w-12 h-12 text-blue-300 mx-auto mb-3" />
                    <p className="text-slate-600 text-sm">No education added</p>
                    <button
                        onClick={addEducation}
                        className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-sm font-bold hover:opacity-95 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add now
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {education.map((edu, index) => (
                        <div key={index} className="border border-slate-200 bg-white rounded-[28px] p-5 relative shadow-sm hover:shadow-md transition-all group">
                            <button
                                onClick={() => removeEducation(index)}
                                className="absolute top-3 right-3 p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Degree</label>
                                    <input
                                        type="text"
                                        value={edu.degree}
                                        onChange={(e) => updateEducation(index, "degree", e.target.value)}
                                        className="w-full h-11 px-4 border border-slate-200 bg-white hover:bg-slate-50 focus:bg-white rounded-2xl text-[14px] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-slate-800 outline-none"
                                        placeholder="e.g. B.Tech"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Institution</label>
                                    <input
                                        type="text"
                                        value={edu.institution}
                                        onChange={(e) => updateEducation(index, "institution", e.target.value)}
                                        className="w-full h-11 px-4 border border-slate-200 bg-white hover:bg-slate-50 focus:bg-white rounded-2xl text-[14px] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-slate-800 outline-none"
                                        placeholder="University Name"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Start</label>
                                        <input
                                            type="number"
                                            value={edu.startYear}
                                            onChange={(e) => updateEducation(index, "startYear", parseInt(e.target.value))}
                                            className="w-full h-11 px-4 border border-slate-200 bg-white hover:bg-slate-50 focus:bg-white rounded-2xl text-[14px] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-slate-800 outline-none"
                                            min="1950"
                                            max={new Date().getFullYear()}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">End</label>
                                        <input
                                            type="number"
                                            value={edu.endYear || ""}
                                            onChange={(e) => updateEducation(index, "endYear", e.target.value ? parseInt(e.target.value) : null)}
                                            className="w-full h-11 px-4 border border-slate-200 bg-white hover:bg-slate-50 focus:bg-white rounded-2xl text-[14px] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-slate-800 outline-none"
                                            disabled={edu.current}
                                            placeholder={edu.current ? "Present" : "Year"}
                                        />
                                    </div>
                                </div>

                                <div className="pt-1">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={edu.current}
                                            onChange={(e) => updateEducation(index, "current", e.target.checked)}
                                            className="w-3.5 h-3.5 text-[#004fcb] border-gray-300 rounded focus:ring-0"
                                        />
                                        <span className="text-xs font-medium text-gray-600">Currently Studying</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:opacity-95 transition-all disabled:opacity-50 text-[13px] font-bold shadow-lg shadow-blue-500/20 active:scale-95"
                >
                    <Save className="w-3.5 h-3.5" />
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </div>
    );
}
