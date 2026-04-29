import { useState } from "react";
import { Bell, Shield, Clock, Save } from "lucide-react";
import { toast } from "sonner";

// Simple Tailwind Switch Component
const Toggle = ({ checked, onChange, label, description }: { checked: boolean; onChange: () => void; label: string; description?: string }) => (
    <div className="flex items-start justify-between py-4">
        <div className="flex-1 pr-4">
            <label className="text-sm font-medium text-gray-900 cursor-pointer select-none" onClick={onChange}>
                {label}
            </label>
            {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
        <button
            type="button"
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${checked ? 'bg-blue-600' : 'bg-gray-200'
                }`}
            role="switch"
            aria-checked={checked}
            onClick={onChange}
        >
            <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'
                    }`}
            />
        </button>
    </div>
);

export default function Settings() {
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        // Notifications
        emailAlerts: true,
        smsAlerts: false,
        marketingEmails: false,

        // Privacy
        publicProfile: true,
        showOnlineStatus: true,
        allowSearchEngines: true,

        // Sessions
        autoAccept: false,
        bufferTime: true,
        allowRescheduling: true
    });

    const handleToggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            toast.success("Settings saved successfully");
        }, 800);
    };

    return (
        <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0 bg-white z-10">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Settings</h1>
                    <p className="text-sm text-gray-500">Manage your preferences and account settings</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
                >
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Save size={16} />
                    )}
                    Save Changes
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="max-w-3xl mx-auto space-y-8">

                    {/* Notifications Section */}
                    <section className="bg-white rounded-lg">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                <Bell size={20} />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                        </div>
                        <div className="bg-gray-50/50 rounded-xl border border-gray-100 px-6 py-2">
                            <Toggle
                                label="Email Notifications"
                                description="Receive updates about new bookings and messages via email."
                                checked={settings.emailAlerts}
                                onChange={() => handleToggle('emailAlerts')}
                            />
                            <div className="h-px bg-gray-100" />
                            <Toggle
                                label="SMS Alerts"
                                description="Get text messages for immediate reminders (charges may apply)."
                                checked={settings.smsAlerts}
                                onChange={() => handleToggle('smsAlerts')}
                            />
                            <div className="h-px bg-gray-100" />
                            <Toggle
                                label="Product Updates"
                                description="Receive news about new features and improvements."
                                checked={settings.marketingEmails}
                                onChange={() => handleToggle('marketingEmails')}
                            />
                        </div>
                    </section>

                    {/* Privacy Section */}
                    <section className="bg-white rounded-lg">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                <Shield size={20} />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900">Privacy & Visibility</h2>
                        </div>
                        <div className="bg-gray-50/50 rounded-xl border border-gray-100 px-6 py-2">
                            <Toggle
                                label="Public Profile"
                                description="Allow your profile to be visible to candidates searching for experts."
                                checked={settings.publicProfile}
                                onChange={() => handleToggle('publicProfile')}
                            />
                            <div className="h-px bg-gray-100" />
                            <Toggle
                                label="Show Online Status"
                                description="Let others know when you are currently active."
                                checked={settings.showOnlineStatus}
                                onChange={() => handleToggle('showOnlineStatus')}
                            />
                            <div className="h-px bg-gray-100" />
                            <Toggle
                                label="Search Engine Indexing"
                                description="Allow your profile to appear in Google search results."
                                checked={settings.allowSearchEngines}
                                onChange={() => handleToggle('allowSearchEngines')}
                            />
                        </div>
                    </section>

                    {/* Session Preferences */}
                    <section className="bg-white rounded-lg">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                <Clock size={20} />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900">Session Preferences</h2>
                        </div>
                        <div className="bg-gray-50/50 rounded-xl border border-gray-100 px-6 py-2">
                            <Toggle
                                label="Auto-Accept Bookings"
                                description="Automatically accept booking requests that match your availability."
                                checked={settings.autoAccept}
                                onChange={() => handleToggle('autoAccept')}
                            />
                            <div className="h-px bg-gray-100" />
                            <Toggle
                                label="Add Buffer Time"
                                description="Add a 15-minute break between consecutive sessions."
                                checked={settings.bufferTime}
                                onChange={() => handleToggle('bufferTime')}
                            />
                            <div className="h-px bg-gray-100" />
                            <Toggle
                                label="Allow Rescheduling"
                                description="Allow candidates to reschedule sessions up to 24h in advance."
                                checked={settings.allowRescheduling}
                                onChange={() => handleToggle('allowRescheduling')}
                            />
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
