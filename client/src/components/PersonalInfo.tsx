import { useState, useEffect, useMemo } from 'react';
import axios from '../lib/axios';
import { toast } from "sonner";
import { PrimaryButton } from '../pages/ExpertDashboard';
import { useAuth } from '../context/AuthContext';
import { Country, State, City } from 'country-state-city';
import { AlertCircle } from 'lucide-react';

const FormInput = ({ label, value, onChange, placeholder, type = "text", error, maxLength }: any) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            className={`border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all ${error ? "border-red-500 focus:border-red-500 bg-red-50" : "border-gray-300 focus:border-blue-500"
                }`}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
);

const FormSelect = ({ label, value, onChange, options, disabled, error, placeholder }: any) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={`border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white disabled:bg-gray-100 ${error ? "border-red-500 focus:border-red-500 bg-red-50" : "border-gray-300 focus:border-blue-500"
                }`}
        >
            <option value="">{placeholder || `Select ${label}`}</option>
            {options.map((opt: any) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
        {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
);

interface PersonalInfoProps {
    onUpdate?: () => void;
    profileData?: any;
    isMissing?: boolean;
}

const PersonalInfo = ({ onUpdate, profileData, isMissing }: PersonalInfoProps) => {
    const { user } = useAuth();

    const [countryCode, setCountryCode] = useState("");
    const [stateCode, setStateCode] = useState("");

    const initialProfile = {
        personal: {
            name: "",
            phone: "",
            gender: "",
            dob: "",
            country: "",
            state: "",
            city: "",
            category: ""
        }
    };
    const [profile, setProfile] = useState(initialProfile);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const allCountries = useMemo(() => Country.getAllCountries().map(c => ({
        value: c.isoCode,
        label: c.name,
        name: c.name
    })), []);

    const allStates = useMemo(() => {
        if (!countryCode) return [];
        return State.getStatesOfCountry(countryCode).map(s => ({
            value: s.isoCode,
            label: s.name,
            name: s.name
        }));
    }, [countryCode]);

    const allCities = useMemo(() => {
        if (!countryCode || !stateCode) return [];
        return City.getCitiesOfState(countryCode, stateCode).map(c => ({
            value: c.name,
            label: c.name
        }));
    }, [countryCode, stateCode]);


    const setPersonalField = (field: string, value: string) => {
        setProfile((p) => ({ ...p, personal: { ...p.personal, [field]: value } }));

        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleCountryChange = (isoCode: string) => {
        const countryObj = allCountries.find(c => c.value === isoCode);
        setCountryCode(isoCode);
        setPersonalField("country", countryObj ? countryObj.name : "");
        setPersonalField("state", "");
        setPersonalField("city", "");
        setStateCode("");
    };

    const handleStateChange = (isoCode: string) => {
        const stateObj = allStates.find(s => s.value === isoCode);
        setStateCode(isoCode);
        setPersonalField("state", stateObj ? stateObj.name : "");
        setPersonalField("city", "");
    };

    useEffect(() => {
        if (profile.personal.country && !countryCode) {
            const c = allCountries.find(x => x.name === profile.personal.country);
            if (c) setCountryCode(c.value);
        }
    }, [profile.personal.country, allCountries, countryCode]);

    useEffect(() => {
        if (countryCode && profile.personal.state && !stateCode) {
            const s = State.getStatesOfCountry(countryCode).find(x => x.name === profile.personal.state);
            if (s) setStateCode(s.isoCode);
        }
    }, [countryCode, profile.personal.state, stateCode]);


    const validate = () => {
        const newErrors: Record<string, string> = {};
        const p = profile.personal;

        const mobileRegex = /^\d{10}$/;
        if (!p.phone) newErrors.phone = "Phone number is required";
        else if (!mobileRegex.test(p.phone)) newErrors.phone = "Enter a valid 10-digit mobile number";

        if (!p.dob) {
            newErrors.dob = "Date of Birth is required";
        } else {
            const birthDate = new Date(p.dob);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            if (age < 18) newErrors.dob = "You must be at least 18 years old";
        }

        if (!p.name.trim()) newErrors.name = "Full Name is required";
        if (!p.gender) newErrors.gender = "Gender is required";
        if (!p.country) newErrors.country = "Country is required";
        if (!p.state) newErrors.state = "State is required";
        if (!p.city) newErrors.city = "City is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    useEffect(() => {
        setLoading(true);
        // Preference: Use profileData passed from parent if available to avoid double fetch
        // But for editing we usually want fresh data, so we stick to fetch or merge.
        // Let's merge for now if profileData matches structure, else fetch.

        const fetchData = async () => {
            try {
                // If we have profileData and it has personal info, use it directly?
                // The parent fetches /api/expert/profile which usually has limited info.
                // We'll fetch the specific personal info endpoint to be safe.

                const response = await axios.get(`/api/expert/personalinfo`);
                if (response.data.success && response.data.data) {
                    const data = response.data.data;
                    setProfile({
                        personal: {
                            name: data.userName || user?.name || "",
                            phone: data.mobile || "",
                            gender: data.gender || "",
                            dob: data.dob ? data.dob.split("T")[0] : "",
                            country: data.country || "",
                            state: data.state || "",
                            city: data.city || "",
                            category: data.category || ""
                        }
                    });
                } else if (user?.name) {
                    setProfile(prev => ({ ...prev, personal: { ...prev.personal, name: user.name || "" } }));
                }

            } catch (err: any) {
                console.error("Failed to fetch data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const savePersonal = async () => {
        if (!validate()) {
            toast.error("Please fix the validation errors");
            return;
        }

        try {
            const payload = {
                userName: profile.personal.name,
                mobile: profile.personal.phone,
                gender: profile.personal.gender,
                dob: profile.personal.dob,
                country: profile.personal.country,
                state: profile.personal.state,
                city: profile.personal.city,
                category: profile.personal.category
            };

            const response = await axios.put(
                `/api/expert/personalinfo`,
                payload,
                { headers: { "Content-Type": "application/json" } }
            );

            if (response.data.success) {
                toast.success("Personal info updated successfully!");
                if (onUpdate) onUpdate();
            } else {
                toast.error("Failed to update personal info");
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Server error");
        }
    };

    if (loading) return (
        <div className="flex flex-col space-y-4 animate-pulse">
            <div className="h-48 bg-gray-100 rounded-xl"></div>
            <div className="h-48 bg-gray-100 rounded-xl"></div>
        </div>
    );

    return (
        <div className="h-full">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        Personal Information
                        {isMissing && <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Action Required</span>}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Update your basic details and location</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <FormInput
                        label="Full Name"
                        placeholder="e.g. Mugunth Kumar"
                        value={profile.personal?.name || ""}
                        onChange={(v: string) => setPersonalField("name", v)}
                        error={errors.name}
                    />

                    <FormInput
                        label="Phone Number"
                        placeholder="10 digit mobile number"
                        value={profile.personal?.phone || ""}
                        onChange={(v: string) => {
                            if (v === "" || /^[0-9\b]+$/.test(v)) {
                                setPersonalField("phone", v);
                            }
                        }}
                        maxLength={10}
                        error={errors.phone}
                    />

                    <FormSelect
                        label="Gender"
                        value={profile.personal?.gender || ""}
                        onChange={(v: string) => setPersonalField("gender", v)}
                        options={["Male", "Female", "Other"].map(g => ({ value: g, label: g }))}
                        placeholder="Select Gender"
                        error={errors.gender}
                    />

                    <FormInput
                        label="Date of Birth"
                        type="date"
                        value={profile.personal?.dob || ""}
                        onChange={(v: string) => setPersonalField("dob", v)}
                        error={errors.dob}
                    />
                </div>

                <div className="space-y-4">
                    <FormSelect
                        label="Country"
                        value={countryCode}
                        onChange={(v: string) => handleCountryChange(v)}
                        options={allCountries}
                        placeholder="Select Country"
                        error={errors.country}
                    />

                    <FormSelect
                        label="State"
                        value={stateCode}
                        onChange={(v: string) => handleStateChange(v)}
                        options={allStates}
                        disabled={!countryCode}
                        placeholder="Select State"
                        error={errors.state}
                    />

                    <FormSelect
                        label="City"
                        value={profile.personal.city}
                        onChange={(v: string) => setPersonalField("city", v)}
                        options={allCities}
                        disabled={!stateCode}
                        placeholder="Select City"
                        error={errors.city}
                    />

                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <PrimaryButton onClick={savePersonal} className="px-8">
                    Save Personal Information
                </PrimaryButton>
            </div>
        </div>
    );
};

export default PersonalInfo;
