import { useState } from "react";
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
    } | null;
    onUpdate: () => void;
}

export default function ExperienceSection({ profileData, onUpdate }: ExperienceSectionProps) {
    const { user } = useAuth();
    const [experience, setExperience] = useState<Experience[]>(profileData?.experience || []);
    const [saving, setSaving] = useState(false);

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
            const response = await axios.put(
                "/api/user/profile/experience",
                { experience },
                { headers: { userid: user?.id } }
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
                    <h2 className="text-lg font-bold text-gray-900">Work Experience</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Your professional background</p>
                </div>
                <button
                    onClick={addExperience}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors text-xs font-bold"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                </button>
            </div>

            {experience.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-100 bg-gray-50/50 rounded-xl">
                    <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No experience added</p>
                    <button
                        onClick={addExperience}
                        className="mt-2 text-[#004fcb] text-xs font-bold hover:underline"
                    >
                        Add now
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {experience.map((exp, index) => (
                        <div key={index} className="border border-gray-100 bg-white rounded-xl p-4 relative shadow-sm hover:shadow-md transition-all group">
                            <button
                                onClick={() => removeExperience(index)}
                                className="absolute top-3 right-3 p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Company</label>
                                    <input
                                        type="text"
                                        value={exp.company}
                                        onChange={(e) => updateExperience(index, "company", e.target.value)}
                                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:border-[#004fcb] focus:ring-0 transition-all font-semibold text-gray-800"
                                        placeholder="Google"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Position</label>
                                    <input
                                        type="text"
                                        value={exp.position}
                                        onChange={(e) => updateExperience(index, "position", e.target.value)}
                                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:border-[#004fcb] focus:ring-0 transition-all"
                                        placeholder="Software Engineer"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : ""}
                                        onChange={(e) => updateExperience(index, "startDate", e.target.value)}
                                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:border-[#004fcb] focus:ring-0 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        value={exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : ""}
                                        onChange={(e) => updateExperience(index, "endDate", e.target.value)}
                                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:border-[#004fcb] focus:ring-0 transition-all"
                                        disabled={exp.current}
                                    />
                                </div>

                                <div className="flex items-center md:col-span-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={exp.current}
                                            onChange={(e) => updateExperience(index, "current", e.target.checked)}
                                            className="w-3.5 h-3.5 text-[#004fcb] border-gray-300 rounded focus:ring-0"
                                        />
                                        <span className="text-xs font-medium text-gray-600">Currently Working Here</span>
                                    </label>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Description</label>
                                    <textarea
                                        value={exp.description}
                                        onChange={(e) => updateExperience(index, "description", e.target.value)}
                                        rows={2}
                                        maxLength={500}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#004fcb] focus:ring-0 transition-all resize-none"
                                        placeholder="Describe responsibilities..."
                                    />
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
