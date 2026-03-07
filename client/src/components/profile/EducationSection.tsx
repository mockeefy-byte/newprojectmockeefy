import { useState } from "react";
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
    const [education, setEducation] = useState(profileData?.education || []);
    const [saving, setSaving] = useState(false);

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
                { headers: { userid: user?.id } }
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Education</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Your academic background</p>
                </div>
                <button
                    onClick={addEducation}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors text-xs font-bold"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                </button>
            </div>

            {education.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-100 bg-gray-50/50 rounded-xl">
                    <GraduationCap className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No education added</p>
                    <button
                        onClick={addEducation}
                        className="mt-2 text-[#004fcb] text-xs font-bold hover:underline"
                    >
                        Add now
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {education.map((edu, index) => (
                        <div key={index} className="border border-gray-100 bg-white rounded-xl p-4 relative shadow-sm hover:shadow-md transition-all group">
                            <button
                                onClick={() => removeEducation(index)}
                                className="absolute top-3 right-3 p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Degree</label>
                                    <input
                                        type="text"
                                        value={edu.degree}
                                        onChange={(e) => updateEducation(index, "degree", e.target.value)}
                                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:border-[#004fcb] focus:ring-0 transition-all font-semibold text-gray-800"
                                        placeholder="e.g. B.Tech"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Institution</label>
                                    <input
                                        type="text"
                                        value={edu.institution}
                                        onChange={(e) => updateEducation(index, "institution", e.target.value)}
                                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:border-[#004fcb] focus:ring-0 transition-all"
                                        placeholder="University Name"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Start</label>
                                        <input
                                            type="number"
                                            value={edu.startYear}
                                            onChange={(e) => updateEducation(index, "startYear", parseInt(e.target.value))}
                                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:border-[#004fcb] focus:ring-0 transition-all"
                                            min="1950"
                                            max={new Date().getFullYear()}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">End</label>
                                        <input
                                            type="number"
                                            value={edu.endYear || ""}
                                            onChange={(e) => updateEducation(index, "endYear", e.target.value ? parseInt(e.target.value) : null)}
                                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:border-[#004fcb] focus:ring-0 transition-all"
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

            <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2 bg-[#004fcb] text-white rounded-lg hover:bg-[#003bb5] transition-colors disabled:opacity-50 text-xs font-bold shadow-sm"
                >
                    <Save className="w-3.5 h-3.5" />
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </div>
    );
}
