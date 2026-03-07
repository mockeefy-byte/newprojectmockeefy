import { useState, useEffect } from "react";
import { IconButton, Input, PrimaryButton, SecondaryButton } from "../pages/ExpertDashboard";
import axios from '../lib/axios';
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { AlertCircle } from "lucide-react";

interface ExpertProfessionProps {
  onUpdate?: () => void;
  profileData?: any;
  isMissing?: boolean;
}

const ExpertProfession = ({ onUpdate, isMissing, profileData }: ExpertProfessionProps) => {
  const { user } = useAuth();


  const initialProfile = {
    professional: {
      title: "",
      company: "",
      totalExperience: "",
      industry: "",
      previous: []
    }
  };

  const [profile, setProfile] = useState<{ professional: { title: string; company: string; totalExperience: string; industry: string; level?: string; previous: any[] } }>(initialProfile);
  const [loading, setLoading] = useState(true);

  // ---------------- Fetch professional info ----------------
  useEffect(() => {
    const fetchProfessional = async () => {
      try {
        const res = await axios.get("/api/expert/profession");
        if (res.data.success) {
          setProfile({ professional: res.data.data });
        }
      } catch (err: any) {
        console.error("Failed to fetch professional info:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessional();
  }, [user]);

  // ---------------- Local state handlers ----------------
  const setProfessionalField = (field: string, value: string) =>
    setProfile((p) => ({ ...p, professional: { ...p.professional, [field]: value } }));

  const addExperience = () =>
    setProfile((p) => ({
      ...p,
      professional: {
        ...p.professional,
        previous: [...p.professional.previous, { company: "", title: "", start: "", end: "" }]
      }
    }));

  const updateExperience = (idx: number, field: string, value: string) => {
    setProfile((p) => {
      const prev = [...p.professional.previous];
      prev[idx] = { ...prev[idx], [field]: value };
      return { ...p, professional: { ...p.professional, previous: prev } };
    });
  };

  const removeExperience = async (idx: number) => {
    try {
      // Update local state
      const newPrevious = profile.professional.previous.filter((_, i) => i !== idx);
      setProfile((p) => ({
        ...p,
        professional: { ...p.professional, previous: newPrevious }
      }));

      // Call backend to delete by index
      const res = await axios.delete(
        `/api/expert/profession/previous/${idx}`
      );

      if (!res.data.success) {
        toast.error("Failed to remove experience in DB");
      } else {
        if (onUpdate) onUpdate();
      }
    } catch (err: any) {
      console.error("Error removing experience:", err);
      toast.error("Server error");
    }
  };


  const saveProfessional = async () => {
    try {
      const res = await axios.put(
        "/api/expert/profession",
        { professionalDetails: profile.professional }
      );

      if (res.data.success) {
        toast.success("Professional details saved successfully!");
        if (onUpdate) onUpdate();
      } else {
        toast.error("Failed to save professional info");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Server error");
    }
  };

  if (loading) return <p>Loading professional info...</p>;

  return (
    <div className="h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
            Professional Details
            {isMissing && <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Action Required</span>}
          </h3>
          <p className="text-sm text-gray-500 mt-1">Current role and work history</p>
        </div>
        <div>
          <SecondaryButton onClick={addExperience}>+ Add Previous</SecondaryButton>
        </div>
      </div>

      <div className="space-y-4">
        <Input
          label="Current Job Title"
          placeholder="e.g. HR Manager"
          value={profile.professional?.title || ""}
          onChange={(v) => setProfessionalField("title", v)}
        />
        <Input
          label="Current Company"
          placeholder="Company name"
          value={profile.professional?.company || ""}
          onChange={(v) => setProfessionalField("company", v)}
        />
        <Input
          label="Total Years of Experience"
          type="number"
          placeholder="0"
          value={profile.professional?.totalExperience || ""}
          onChange={(v) => setProfessionalField("totalExperience", v)}
        />
        <Input
          label="Industry Expertise"
          placeholder="e.g. IT Services"
          value={profile.professional?.industry || ""}
          onChange={(v) => setProfessionalField("industry", v)}
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Experience Level</label>
          <select
            className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-gray-700 bg-white"
            value={profile.professional?.level || "Intermediate"}
            onChange={(e) => setProfessionalField("level", e.target.value)}
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
          <p className="text-xs text-gray-500">Determines your pricing tier.</p>
        </div>
      </div>

      {profile.professional.previous.length > 0 && (
        <div className="mt-6 space-y-4">
          {profile.professional.previous.map((exp: any, i: number) => (
            <div key={i} className="border border-gray-200 rounded-lg p-10 relative bg-gray-50">
              <IconButton onClick={() => removeExperience(i)} className="absolute top-2 right-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </IconButton>
              <div className="space-y-3">
                <Input
                  placeholder="Company Name"
                  value={exp.company}
                  onChange={(v) => updateExperience(i, "company", v)}
                />
                <Input
                  placeholder="Job Title"
                  value={exp.title}
                  onChange={(v) => updateExperience(i, "title", v)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Start Year"
                    type="number"
                    value={exp.start}
                    onChange={(v) => updateExperience(i, "start", v)}
                  />
                  <Input
                    placeholder="End Year"
                    type="number"
                    value={exp.end}
                    onChange={(v) => updateExperience(i, "end", v)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills Section (Read-Only) */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
          Skills & Expertise
          <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Read Only</span>
        </h3>

        {profileData?.expertSkills && profileData.expertSkills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profileData.expertSkills.map((skill: any, idx: number) => {
              const skillName = skill.skillId?.name || skill.name || 'Unknown Skill';
              return (
                <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  {skillName}
                  <span className="ml-2 text-xs text-blue-500 bg-white px-1.5 rounded-full border border-blue-100">
                    {skill.level}
                  </span>
                </span>
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg border border-gray-100">
            No specific skills added yet. Go to <a href="/dashboard/skills" className="text-blue-600 hover:text-blue-700 underline">My Skills</a> to add them.
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <PrimaryButton onClick={saveProfessional}>Save Changes</PrimaryButton>
      </div>
    </div>
  );
};

export default ExpertProfession;
