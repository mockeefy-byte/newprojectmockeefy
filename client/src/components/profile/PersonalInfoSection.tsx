import { useState, useMemo, useEffect } from "react";
import { Save, Upload, Sparkles, Loader2, User } from "lucide-react";
import axios from '../../lib/axios';
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { Country, State, City } from "country-state-city";
import { getProfileImageUrl } from "../../lib/imageUtils";

interface PersonalInfo {
    phone?: string;
    dateOfBirth?: string | Date;
    gender?: string;
    country?: string;
    state?: string;
    city?: string;
    bio?: string;
}



interface ProfileData {
    name?: string;
    email?: string; // Ensure email is in ProfileData interface
    profileImage?: string;
    personalInfo?: PersonalInfo;
}

interface PersonalInfoSectionProps {
    profileData: ProfileData | null;
    onUpdate: () => void;
}

export default function PersonalInfoSection({ profileData, onUpdate }: PersonalInfoSectionProps) {
    const { user, fetchProfile } = useAuth();
    const userId = user?.id || user?._id || user?.userId;
    const [imageLoadError, setImageLoadError] = useState(false);
    const [formData, setFormData] = useState({
        name: profileData?.name || user?.name || "",
        email: profileData?.email || user?.email || "",
        phone: profileData?.personalInfo?.phone || "",
        dateOfBirth: profileData?.personalInfo?.dateOfBirth ? new Date(profileData.personalInfo.dateOfBirth).toISOString().split('T')[0] : "",
        gender: profileData?.personalInfo?.gender || "",
        country: profileData?.personalInfo?.country || "",
        state: profileData?.personalInfo?.state || "",
        city: profileData?.personalInfo?.city || "",
        bio: profileData?.personalInfo?.bio || ""
    });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [generatingBio, setGeneratingBio] = useState(false);

    const handleGenerateBio = async () => {
        if (!userId) {
            toast.error("User not found");
            return;
        }
        try {
            setGeneratingBio(true);
            const res = await axios.get("/api/user/resume", { headers: { userid: userId } });
            const resumeData = res.data?.data;
            
            let role = "Professional";
            let skills = [];
            let expLevel = "experienced";

            if (resumeData) {
                if (resumeData.experience && resumeData.experience.length > 0) {
                    role = resumeData.experience[0].position || role;
                }
                if (resumeData.preferences?.experienceLevel) {
                    expLevel = String(resumeData.preferences.experienceLevel).toLowerCase();
                }
                if (resumeData.skills && resumeData.skills.length > 0) {
                    skills = resumeData.skills.map((s: any) => typeof s === 'string' ? s : s.name || s.skill).filter(Boolean).slice(0, 3);
                }
            }

            const skillsText = skills.length > 0 ? ` skilled in ${skills.join(", ")}` : "";
            const intro = expLevel === "fresher" || expLevel === "beginner"
                ? `Motivated and detail-oriented ${role}${skillsText}, looking to leverage academic background and fresh perspectives to contribute effectively to a dynamic team. Eager to learn and grow in a fast-paced environment.` 
                : `Results-driven ${role}${skillsText} with a proven track record of delivering high-quality work and driving continuous improvement. Adept at collaborating with cross-functional teams to achieve strategic business goals.`;
                
            const variations = [
                `Passionate and adaptable ${role}${skillsText}, eager to take on new challenges and drive impactful solutions. Combines a strong work ethic with technical proficiency to meet project milestones.`,
                `Dedicated ${role}${skillsText} combining analytical thinking with hands-on expertise to solve complex problems and deliver exceptional value. Brings a proactive approach to team collaboration and success.`,
                intro
            ];
            
            const generatedBio = variations[Math.floor(Math.random() * variations.length)];
            
            setFormData(prev => ({ ...prev, bio: generatedBio }));
            toast.success("Professional bio generated successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch profile context. Please update your experience first or try again.");
        } finally {
            setGeneratingBio(false);
        }
    };

    useEffect(() => {
        if (profileData) {
            setFormData({
                name: profileData.name || user?.name || "",
                email: profileData.email || user?.email || "",
                phone: profileData.personalInfo?.phone || "",
                dateOfBirth: profileData.personalInfo?.dateOfBirth ? new Date(profileData.personalInfo.dateOfBirth).toISOString().split('T')[0] : "",
                gender: profileData.personalInfo?.gender || "",
                country: profileData.personalInfo?.country || "",
                state: profileData.personalInfo?.state || "",
                city: profileData.personalInfo?.city || "",
                bio: profileData.personalInfo?.bio || ""
            });
        }
    }, [profileData]);

    useEffect(() => {
        setImageLoadError(false);
    }, [profileData?.profileImage, user?.profileImage]);

    const countries = useMemo(() => {
        return Country.getAllCountries();
    }, []);

    const states = useMemo(() => {
        if (!formData.country || formData.country === "Other") return [];
        const countryCode = countries.find(c => c.name === formData.country)?.isoCode;
        return countryCode ? State.getStatesOfCountry(countryCode) : [];
    }, [formData.country, countries]);

    const cities = useMemo(() => {
        if (!formData.country || !formData.state || formData.state === "Other") return [];
        const countryCode = countries.find(c => c.name === formData.country)?.isoCode;
        const stateCode = states.find(s => s.name === formData.state)?.isoCode;
        return countryCode && stateCode ? City.getCitiesOfState(countryCode, stateCode) : [];
    }, [formData.country, formData.state, countries, states]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === "country") {
            setFormData(prev => ({
                ...prev,
                country: value,
                state: "",
                city: ""
            }));
        } else if (name === "state") {
            setFormData(prev => ({
                ...prev,
                state: value,
                city: ""
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const response = await axios.put(
                "/api/user/profile/personal",
                formData,
                { headers: { userid: userId } }
            );

            if (response.data.success) {
                toast.success("Personal info updated successfully!");
                onUpdate();
            }
        } catch (error) {
            console.error("Error updating personal info:", error);
            toast.error("Failed to update personal info");
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append("profileImage", file);

            const response = await axios.post(
                "/api/user/profile/image",
                formData,
                {
                    headers: {
                        userid: userId,
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            if (response.data.success) {
                toast.success("Profile image uploaded successfully!");
                await fetchProfile(); // Refresh global user so navbar, sidebar, etc. show new image
                onUpdate();
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            toast.error("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
            <div className="border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Personal Information</h2>
                        <p className="text-[13px] font-medium text-slate-500 mt-0.5">Update your core identity details and photo.</p>
                    </div>
                </div>
            </div>

            {/* Profile Image Upload */}
            <div className="bg-white border border-slate-200 rounded-[20px] p-6 sm:p-7 flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 shadow-sm">
                <div className="relative group shrink-0">
                    {(() => {
                        const effectiveImage = profileData?.profileImage || user?.profileImage || null;
                        const initial = (formData.name || user?.name || "U").trim().charAt(0).toUpperCase();
                        if (!effectiveImage || imageLoadError) {
                            return (
                                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-slate-50 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 flex items-center justify-center text-4xl font-black shadow-inner">
                                    {initial}
                                </div>
                            );
                        }
                        return (
                            <img
                                src={getProfileImageUrl(effectiveImage)}
                                alt="Profile"
                                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-slate-50 shadow-sm transition-transform duration-300 group-hover:scale-105"
                                onError={() => setImageLoadError(true)}
                            />
                        );
                    })()}
                    
                    <label className="absolute bottom-1 right-1 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white cursor-pointer hover:bg-blue-700 transition-colors tooltip tooltip-top" data-tip="Upload new photo">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={uploading}
                        />
                        <Upload className="w-3.5 h-3.5" />
                    </label>
                </div>
                
                <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left justify-center pt-1 sm:pt-4">
                    <h3 className="text-[15px] font-bold text-slate-800 mb-1">Profile Picture</h3>
                    <p className="text-[13px] text-slate-500 mb-4 max-w-md">We recommend using a clear, professional headshot. This photo will be visible on your resume and to potential employers.</p>
                    <label className="cursor-pointer inline-block">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={uploading}
                        />
                        <div className="flex items-center gap-2 px-5 py-2 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-100 hover:border-slate-300 transition-all text-[13px] font-bold shadow-sm">
                            <Upload className="w-4 h-4 text-slate-400" />
                            {uploading ? "Uploading..." : "Browse Files"}
                        </div>
                    </label>
                </div>
            </div>

            {/* Form Fields - Modern Grid */}
            <div className="bg-white border border-slate-200 rounded-[24px] p-6 sm:p-8 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-6">
                    <div className="space-y-1.5">
                        <label className="block text-[13px] font-bold text-slate-700 ml-1">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full h-12 px-4 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl text-[14px] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-800 outline-none placeholder:text-slate-400"
                            placeholder="e.g. Jane Doe"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-[13px] font-bold text-slate-700 ml-1">Email <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded ml-1 font-semibold uppercase">Read Only</span></label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            disabled
                            className="w-full h-12 px-4 border border-slate-100 bg-slate-50 text-slate-500 rounded-xl text-[14px] font-medium cursor-not-allowed outline-none shadow-inner"
                            placeholder="your@email.com"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-[13px] font-bold text-slate-700 ml-1">Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full h-12 px-4 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl text-[14px] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-800 outline-none placeholder:text-slate-400"
                            placeholder="+1 (555) 000-0000"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-[13px] font-bold text-slate-700 ml-1">Date of Birth</label>
                        <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            className="w-full h-12 px-4 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl text-[14px] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-800 outline-none"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-[13px] font-bold text-slate-700 ml-1">Gender</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full h-12 px-4 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl text-[14px] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-800 outline-none appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5.5%207.5L10%2012.5L14.5%207.5%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_1rem_center]"
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-[13px] font-bold text-slate-700 ml-1">Country</label>
                        <select
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className="w-full h-12 px-4 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl text-[14px] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-800 outline-none appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5.5%207.5L10%2012.5L14.5%207.5%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_1rem_center]"
                        >
                            <option value="">Select Country</option>
                            {countries.map((c) => (
                                <option key={c.isoCode} value={c.name}>
                                    {c.name}
                                </option>
                            ))}
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-[13px] font-bold text-slate-700 ml-1">State / Province</label>
                        <select
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className="w-full h-12 px-4 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl text-[14px] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-800 outline-none appearance-none disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5.5%207.5L10%2012.5L14.5%207.5%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_1rem_center]"
                            disabled={!formData.country}
                        >
                            <option value="">{formData.country ? "Select State" : "Select Country First"}</option>
                            {states.map((s) => (
                                <option key={s.isoCode} value={s.name}>
                                    {s.name}
                                </option>
                            ))}
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-[13px] font-bold text-slate-700 ml-1">City</label>
                        <select
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="w-full h-12 px-4 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl text-[14px] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-800 outline-none appearance-none disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5.5%207.5L10%2012.5L14.5%207.5%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_1rem_center]"
                            disabled={!formData.state}
                        >
                            <option value="">{formData.state ? "Select City" : "Select State First"}</option>
                            {cities.map((c) => (
                                <option key={c.name} value={c.name}>
                                    {c.name}
                                </option>
                            ))}
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                <div className="pt-8">
                    <div className="flex items-center justify-between mb-3 border-t border-slate-100 pt-6">
                        <div>
                            <label className="block text-[14px] font-extrabold text-slate-800 ml-1">Professional Summary</label>
                            <p className="text-[12px] text-slate-500 ml-1 mb-2">A brief summary about yourself that will appear on your resume.</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleGenerateBio}
                            disabled={generatingBio}
                            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 rounded-lg text-[12px] font-bold transition-all disabled:opacity-50 border border-blue-200/60 shadow-sm self-start group"
                        >
                            {generatingBio ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-blue-500 group-hover:text-indigo-600 transition-colors" />}
                            {generatingBio ? "Generating..." : "Auto-Generate AI"}
                        </button>
                    </div>
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={4}
                        maxLength={500}
                        className="w-full p-4 border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-2xl text-[14px] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-800 outline-none resize-none leading-relaxed placeholder:text-slate-400 shadow-inner"
                        placeholder="E.g. A passionate Full Stack Developer with 4 years of experience building scalable web applications..."
                    />
                    <div className="flex justify-end mt-2 pr-1">
                        <span className="text-[11px] font-bold text-slate-400">{formData.bio?.length || 0}/500</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 text-[14px] font-bold shadow-md shadow-blue-600/20 active:scale-95 min-w-[200px]"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving Details...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
