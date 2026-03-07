import { useState } from "react";
import { Save, Plus, X, Code, Heart, Globe } from "lucide-react";
import axios from '../../lib/axios';
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";

interface SkillsSectionProps {
    profileData: {
        skills?: {
            technical?: string[];
            soft?: string[];
            languages?: string[];
        };
    } | null;
    onUpdate: () => void;
}

export default function SkillsSection({ profileData, onUpdate }: SkillsSectionProps) {
    const { user } = useAuth();
    const [skills, setSkills] = useState<{ technical: string[], soft: string[], languages: string[] }>({
        technical: profileData?.skills?.technical || [],
        soft: profileData?.skills?.soft || [],
        languages: profileData?.skills?.languages || []
    });
    const [newSkill, setNewSkill] = useState({ technical: "", soft: "", languages: "" });
    const [saving, setSaving] = useState(false);

    const addSkill = (type: "technical" | "soft" | "languages") => {
        if (newSkill[type].trim()) {
            setSkills({
                ...skills,
                [type]: [...skills[type], newSkill[type].trim()]
            });
            setNewSkill({ ...newSkill, [type]: "" });
        }
    };

    const removeSkill = (type: "technical" | "soft" | "languages", index: number) => {
        setSkills({
            ...skills,
            [type]: skills[type].filter((_, i) => i !== index)
        });
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const response = await axios.put(
                "/api/user/profile/skills",
                skills,
                { headers: { userid: user?.id } }
            );

            if (response.data.success) {
                toast.success("Skills updated successfully!");
                onUpdate();
            }
        } catch (error) {
            console.error("Error updating skills:", error);
            toast.error("Failed to update skills");
        } finally {
            setSaving(false);
        }
    };

    const SkillTag = ({ skill, onRemove }: { skill: string, onRemove: () => void }) => (
        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-[#004fcb] rounded-full text-sm font-medium border border-blue-100">
            {skill}
            <button
                onClick={onRemove}
                className="hover:bg-blue-100 rounded-full p-0.5 transition-colors"
            >
                <X className="w-3 h-3" />
            </button>
        </span>
    );

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-bold text-[#002a6b]">Skills & Languages</h2>
                <p className="text-slate-500 mt-1">Add your technical skills, soft skills, and languages</p>
            </div>

            {/* Technical Skills */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-[#004fcb]" />
                    <h3 className="text-lg font-semibold text-slate-800">Technical Skills</h3>
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newSkill.technical}
                        onChange={(e) => setNewSkill({ ...newSkill, technical: e.target.value })}
                        onKeyPress={(e) => e.key === "Enter" && addSkill("technical")}
                        className="flex-1 px-4 py-2 border border-blue-100 bg-slate-50/50 rounded-lg focus:ring-2 focus:ring-[#004fcb]/20 focus:border-[#004fcb] transition-all"
                        placeholder="e.g., React, Python, AWS"
                    />
                    <button
                        onClick={() => addSkill("technical")}
                        className="flex items-center gap-2 px-4 py-2 bg-[#004fcb] text-white rounded-lg hover:bg-[#003bb5] transition-colors shadow-sm shadow-blue-200"
                    >
                        <Plus className="w-4 h-4" />
                        Add
                    </button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {skills.technical.map((skill, index) => (
                        <SkillTag
                            key={index}
                            skill={skill}
                            onRemove={() => removeSkill("technical", index)}
                        />
                    ))}
                    {skills.technical.length === 0 && (
                        <p className="text-gray-500 text-sm">No technical skills added yet</p>
                    )}
                </div>
            </div>

            {/* Soft Skills */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-[#004fcb]" />
                    <h3 className="text-lg font-semibold text-slate-800">Soft Skills</h3>
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newSkill.soft}
                        onChange={(e) => setNewSkill({ ...newSkill, soft: e.target.value })}
                        onKeyPress={(e) => e.key === "Enter" && addSkill("soft")}
                        className="flex-1 px-4 py-2 border border-blue-100 bg-slate-50/50 rounded-lg focus:ring-2 focus:ring-[#004fcb]/20 focus:border-[#004fcb] transition-all"
                        placeholder="e.g., Leadership, Communication, Teamwork"
                    />
                    <button
                        onClick={() => addSkill("soft")}
                        className="flex items-center gap-2 px-4 py-2 bg-[#004fcb] text-white rounded-lg hover:bg-[#003bb5] transition-colors shadow-sm shadow-blue-200"
                    >
                        <Plus className="w-4 h-4" />
                        Add
                    </button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {skills.soft.map((skill, index) => (
                        <SkillTag
                            key={index}
                            skill={skill}
                            onRemove={() => removeSkill("soft", index)}
                        />
                    ))}
                    {skills.soft.length === 0 && (
                        <p className="text-gray-500 text-sm">No soft skills added yet</p>
                    )}
                </div>
            </div>

            {/* Languages */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-[#004fcb]" />
                    <h3 className="text-lg font-semibold text-slate-800">Languages</h3>
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newSkill.languages}
                        onChange={(e) => setNewSkill({ ...newSkill, languages: e.target.value })}
                        onKeyPress={(e) => e.key === "Enter" && addSkill("languages")}
                        className="flex-1 px-4 py-2 border border-blue-100 bg-slate-50/50 rounded-lg focus:ring-2 focus:ring-[#004fcb]/20 focus:border-[#004fcb] transition-all"
                        placeholder="e.g., English, Spanish, Mandarin"
                    />
                    <button
                        onClick={() => addSkill("languages")}
                        className="flex items-center gap-2 px-4 py-2 bg-[#004fcb] text-white rounded-lg hover:bg-[#003bb5] transition-colors shadow-sm shadow-blue-200"
                    >
                        <Plus className="w-4 h-4" />
                        Add
                    </button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {skills.languages.map((skill, index) => (
                        <SkillTag
                            key={index}
                            skill={skill}
                            onRemove={() => removeSkill("languages", index)}
                        />
                    ))}
                    {skills.languages.length === 0 && (
                        <p className="text-gray-500 text-sm">No languages added yet</p>
                    )}
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-blue-50">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-[#004fcb] text-white rounded-lg hover:bg-[#003bb5] transition-colors disabled:opacity-50 shadow-md shadow-blue-200"
                >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </div>
    );
}
