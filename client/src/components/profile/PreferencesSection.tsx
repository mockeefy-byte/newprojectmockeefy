import { useState, ChangeEvent } from "react";
import { Save, DollarSign, Clock, MapPin, Briefcase } from "lucide-react";
import axios from '../../lib/axios';
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";

interface PreferencesSectionProps {
    profileData: {
        preferences?: {
            jobType?: string;
            expectedSalary?: string;
            noticePeriod?: string;
            willingToRelocate?: boolean;
        };
    } | null;
    onUpdate: () => void;
}

export default function PreferencesSection({ profileData, onUpdate }: PreferencesSectionProps) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        jobType: profileData?.preferences?.jobType || "",
        expectedSalary: profileData?.preferences?.expectedSalary || "",
        noticePeriod: profileData?.preferences?.noticePeriod || "",
        willingToRelocate: profileData?.preferences?.willingToRelocate || false
    });
    const [saving, setSaving] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value
        });
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const response = await axios.put(
                "/api/user/profile/preferences",
                formData,
                { headers: { userid: user?.id } }
            );

            if (response.data.success) {
                toast.success("Preferences updated successfully!");
                onUpdate();
            }
        } catch (error) {
            console.error("Error updating preferences:", error);
            toast.error("Failed to update preferences");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-[#002a6b]">Job Preferences</h2>
                <p className="text-slate-500 mt-1">Set your job preferences and expectations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Job Type */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                        <Briefcase className="w-4 h-4 text-[#004fcb]" />
                        Preferred Job Type
                    </label>
                    <select
                        name="jobType"
                        value={formData.jobType}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-blue-100 bg-slate-50/50 rounded-lg focus:ring-2 focus:ring-[#004fcb]/20 focus:border-[#004fcb] transition-all"
                    >
                        <option value="">Select Job Type</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                        <option value="Freelance">Freelance</option>
                    </select>
                </div>

                {/* Expected Salary */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                        <DollarSign className="w-4 h-4 text-[#004fcb]" />
                        Expected Salary (Annual)
                    </label>
                    <input
                        type="number"
                        name="expectedSalary"
                        value={formData.expectedSalary}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-blue-100 bg-slate-50/50 rounded-lg focus:ring-2 focus:ring-[#004fcb]/20 focus:border-[#004fcb] transition-all"
                        placeholder="e.g., 80000"
                        min="0"
                    />
                </div>

                {/* Notice Period */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                        <Clock className="w-4 h-4 text-[#004fcb]" />
                        Notice Period
                    </label>
                    <select
                        name="noticePeriod"
                        value={formData.noticePeriod}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-blue-100 bg-slate-50/50 rounded-lg focus:ring-2 focus:ring-[#004fcb]/20 focus:border-[#004fcb] transition-all"
                    >
                        <option value="">Select Notice Period</option>
                        <option value="Immediate">Immediate</option>
                        <option value="1 week">1 week</option>
                        <option value="2 weeks">2 weeks</option>
                        <option value="1 month">1 month</option>
                        <option value="2 months">2 months</option>
                        <option value="3 months">3 months</option>
                    </select>
                </div>

                {/* Willing to Relocate */}
                <div className="flex items-center">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            name="willingToRelocate"
                            checked={formData.willingToRelocate}
                            onChange={handleChange}
                            className="w-5 h-5 text-[#004fcb] border-blue-200 rounded focus:ring-[#004fcb]"
                        />
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#004fcb]" />
                            <span className="text-sm font-medium text-slate-700">Willing to Relocate</span>
                        </div>
                    </label>
                </div>
            </div>

            {/* Additional Info */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4">
                <h4 className="font-semibold text-[#002a6b] mb-2">Why set preferences?</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Help recruiters find the right opportunities for you</li>
                    <li>• Get matched with jobs that fit your expectations</li>
                    <li>• Save time by filtering irrelevant job offers</li>
                </ul>
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
