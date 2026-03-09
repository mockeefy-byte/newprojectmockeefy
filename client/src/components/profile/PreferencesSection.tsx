import { useState, ChangeEvent } from "react";
import { Save, DollarSign, Clock, MapPin, Briefcase } from "lucide-react";
import axios from "../../lib/axios";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";

interface PreferencesSectionProps {
  profileData: {
    preferences?: {
      experienceLevel?: string;
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
    experienceLevel: profileData?.preferences?.experienceLevel || "",
    jobType: profileData?.preferences?.jobType || "",
    expectedSalary: profileData?.preferences?.expectedSalary || "",
    noticePeriod: profileData?.preferences?.noticePeriod || "",
    willingToRelocate: profileData?.preferences?.willingToRelocate ?? false,
  });
  const [saving, setSaving] = useState(false);

  const isFresher = formData.experienceLevel === "Fresher";

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const newData = {
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    };
    if (name === "experienceLevel" && value === "Fresher") {
      newData.noticePeriod = "";
      newData.expectedSalary = "";
    }
    setFormData(newData);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        experienceLevel: formData.experienceLevel,
        jobType: formData.jobType,
        expectedSalary: isFresher ? "" : formData.expectedSalary,
        noticePeriod: isFresher ? "" : formData.noticePeriod,
        willingToRelocate: formData.willingToRelocate,
      };
      const response = await axios.put(
        "/api/user/profile/preferences",
        payload,
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
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="text-lg font-bold text-elite-black tracking-tight">Job Preferences</h2>
        <p className="text-[11px] text-slate-500 mt-0.5">Set your job preferences and expectations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Experience Level - Fresher / Experienced */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
            I am a
          </label>
          <select
            name="experienceLevel"
            value={formData.experienceLevel}
            onChange={handleChange}
            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:border-[#004fcb] focus:ring-2 focus:ring-[#004fcb]/20 transition-all bg-white"
          >
            <option value="">Select</option>
            <option value="Fresher">Fresher</option>
            <option value="Experienced">Experienced</option>
          </select>
          {isFresher && (
            <p className="text-[10px] text-slate-500 mt-1.5">Notice period and salary are not required for freshers.</p>
          )}
        </div>

        {/* Job Type */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
            Preferred Job Type
          </label>
          <select
            name="jobType"
            value={formData.jobType}
            onChange={handleChange}
            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:border-[#004fcb] focus:ring-2 focus:ring-[#004fcb]/20 transition-all bg-white"
          >
            <option value="">Select Job Type</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
            <option value="Freelance">Freelance</option>
          </select>
        </div>

        {/* Expected Salary - disabled when Fresher */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
            Expected Salary (Annual)
          </label>
          <input
            type="number"
            name="expectedSalary"
            value={formData.expectedSalary}
            onChange={handleChange}
            disabled={isFresher}
            className={`w-full px-3 py-1.5 border rounded-lg text-sm focus:border-[#004fcb] focus:ring-2 focus:ring-[#004fcb]/20 transition-all ${
              isFresher ? "border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed" : "border-slate-200 bg-white"
            }`}
            placeholder="e.g., 80000"
            min="0"
          />
        </div>

        {/* Notice Period - disabled when Fresher */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
            Notice Period
          </label>
          <select
            name="noticePeriod"
            value={formData.noticePeriod}
            onChange={handleChange}
            disabled={isFresher}
            className={`w-full px-3 py-1.5 border rounded-lg text-sm focus:border-[#004fcb] focus:ring-2 focus:ring-[#004fcb]/20 transition-all ${
              isFresher ? "border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed" : "border-slate-200 bg-white"
            }`}
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
        <div className="flex items-center md:col-span-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="willingToRelocate"
              checked={formData.willingToRelocate}
              onChange={handleChange}
              className="w-4 h-4 text-[#004fcb] border-slate-300 rounded focus:ring-[#004fcb]"
            />
            <span className="text-[11px] font-bold text-slate-700">Willing to Relocate</span>
          </label>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-4">
        <h4 className="font-bold text-elite-black text-[11px] mb-2">Why set preferences?</h4>
        <ul className="text-[11px] text-slate-600 space-y-1">
          <li>• Help recruiters find the right opportunities for you</li>
          <li>• Get matched with jobs that fit your expectations</li>
          <li>• Save time by filtering irrelevant job offers</li>
        </ul>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-[#004fcb] text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 text-[11px] font-bold shadow-md shadow-blue-200"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
