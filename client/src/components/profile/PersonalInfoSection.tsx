import { useState, useMemo, useEffect } from "react";
import { Save, Upload } from "lucide-react";
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
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-bold text-elite-black tracking-tight">Personal Information</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Update your personal details</p>
            </div>

            {/* Profile Image Upload */}
            <div className="border-b border-slate-100 pb-5">
                <div className="flex items-center gap-5">
                    {(() => {
                        const effectiveImage = profileData?.profileImage || user?.profileImage || null;
                        const initial = (formData.name || user?.name || "U").trim().charAt(0).toUpperCase();
                        if (!effectiveImage || imageLoadError) {
                            return (
                                <div className="w-16 h-16 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 flex items-center justify-center text-xl font-bold">
                                    {initial}
                                </div>
                            );
                        }
                        return (
                            <img
                                src={getProfileImageUrl(effectiveImage)}
                                alt="Profile"
                                className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                                onError={() => setImageLoadError(true)}
                            />
                        );
                    })()}
                    <div>
                        <label className="cursor-pointer inline-block">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                disabled={uploading}
                            />
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors text-[11px] font-bold">
                                <Upload className="w-3.5 h-3.5" />
                                {uploading ? "Uploading..." : "Change Photo"}
                            </div>
                        </label>
                        <p className="text-[10px] text-slate-400 mt-1">Allowed *.jpeg, *.jpg, *.png, *.gif</p>
                    </div>
                </div>
            </div>

            {/* Form Fields - Compact Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Full Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:border-[#004fcb] focus:ring-0 transition-all font-semibold text-slate-800"
                        placeholder="Your full name"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className="w-full px-3 py-1.5 border border-slate-200 bg-slate-50 text-slate-400 rounded-lg text-[11px] cursor-not-allowed"
                        placeholder="your@email.com"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Phone</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:border-[#004fcb] focus:ring-0 transition-all font-sans"
                        placeholder="+91..."
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Date of Birth</label>
                    <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:border-[#004fcb] focus:ring-0 transition-all"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Gender</label>
                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:border-[#004fcb] focus:ring-0 transition-all"
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Country</label>
                    <select
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:border-[#004fcb] focus:ring-0 transition-all"
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

                <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">State</label>
                    <select
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:border-[#004fcb] focus:ring-0 transition-all"
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

                <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">City</label>
                    <select
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:border-[#004fcb] focus:ring-0 transition-all"
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

            <div className="pt-2">
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Bio</label>
                <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    maxLength={500}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-[#004fcb] focus:ring-0 transition-all resize-none"
                    placeholder="Tell us about yourself..."
                />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2 bg-[#004fcb] text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 text-[11px] font-bold shadow-sm"
                >
                    <Save className="w-3.5 h-3.5" />
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </div>
    );
}
