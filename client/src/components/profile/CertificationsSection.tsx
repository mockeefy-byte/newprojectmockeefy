import { useState } from "react";
import { Award, Plus, Trash2, Calendar, Link as LinkIcon, Edit2 } from "lucide-react";
import { toast } from "sonner";
import axios from "../../lib/axios";
import { useAuth } from "../../context/AuthContext";

interface Certification {
    _id?: string;
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
    credentialUrl?: string;
}

interface CertificationsSectionProps {
    profileData: any;
    onUpdate: () => void;
}

export default function CertificationsSection({ profileData, onUpdate }: CertificationsSectionProps) {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [certifications, setCertifications] = useState<Certification[]>(profileData?.certifications || []);
    const [loading, setLoading] = useState(false);

    const [currentCert, setCurrentCert] = useState<Certification>({
        name: "",
        issuer: "",
        issueDate: "",
        expiryDate: "",
        credentialId: "",
        credentialUrl: ""
    });

    const [editIndex, setEditIndex] = useState<number | null>(null);

    const handleEdit = (index: number) => {
        const cert = certifications[index];
        setCurrentCert({
            ...cert,
            issueDate: cert.issueDate ? new Date(cert.issueDate).toISOString().split('T')[0] : "",
            expiryDate: cert.expiryDate ? new Date(cert.expiryDate).toISOString().split('T')[0] : ""
        });
        setEditIndex(index);
        setIsEditing(true);
    };

    const handleDelete = async (index: number) => {
        try {
            const updatedCerts = certifications.filter((_, i) => i !== index);
            setLoading(true);
            const res = await axios.put("/api/user/profile/certifications", {
                certifications: updatedCerts
            }, {
                headers: { userid: user?.id }
            });

            if (res.data.success) {
                setCertifications(updatedCerts);
                toast.success("Certification removed");
                onUpdate();
            }
        } catch (error) {
            toast.error("Failed to remove certification");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!currentCert.name || !currentCert.issuer || !currentCert.issueDate) {
            toast.error("Please fill required fields (Name, Issuer, Issue Date)");
            return;
        }

        try {
            setLoading(true);
            let updatedCerts = [...certifications];

            if (editIndex !== null) {
                updatedCerts[editIndex] = currentCert;
            } else {
                updatedCerts.push(currentCert);
            }

            const res = await axios.put("/api/user/profile/certifications", {
                certifications: updatedCerts
            }, {
                headers: { userid: user?.id }
            });

            if (res.data.success) {
                setCertifications(updatedCerts);
                toast.success(editIndex !== null ? "Certification updated" : "Certification added");
                setIsEditing(false);
                setEditIndex(null);
                setCurrentCert({
                    name: "",
                    issuer: "",
                    issueDate: "",
                    expiryDate: "",
                    credentialId: "",
                    credentialUrl: ""
                });
                onUpdate();
            }
        } catch (error) {
            toast.error("Failed to save certification");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <Award className="w-5 h-5 text-[#004fcb]" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Certifications</h2>
                        <p className="text-sm text-slate-500">Add your professional certifications and licenses</p>
                    </div>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => {
                            setIsEditing(true);
                            setEditIndex(null);
                            setCurrentCert({
                                name: "",
                                issuer: "",
                                issueDate: "",
                                expiryDate: "",
                                credentialId: "",
                                credentialUrl: ""
                            });
                        }}
                        className="flex items-center gap-2 text-sm font-medium text-[#004fcb] hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Certificate
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">
                        {editIndex !== null ? "Edit Certification" : "Add New Certification"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                            <input
                                type="text"
                                value={currentCert.name}
                                onChange={(e) => setCurrentCert({ ...currentCert, name: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#004fcb]/20 focus:border-[#004fcb] text-sm"
                                placeholder="e.g. AWS Certified Solutions Architect"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Issuing Organization *</label>
                            <input
                                type="text"
                                value={currentCert.issuer}
                                onChange={(e) => setCurrentCert({ ...currentCert, issuer: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#004fcb]/20 focus:border-[#004fcb] text-sm"
                                placeholder="e.g. Amazon Web Services"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Issue Date *</label>
                            <input
                                type="date"
                                value={currentCert.issueDate}
                                onChange={(e) => setCurrentCert({ ...currentCert, issueDate: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#004fcb]/20 focus:border-[#004fcb] text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Expiration Date</label>
                            <input
                                type="date"
                                value={currentCert.expiryDate}
                                onChange={(e) => setCurrentCert({ ...currentCert, expiryDate: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#004fcb]/20 focus:border-[#004fcb] text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Credential ID</label>
                            <input
                                type="text"
                                value={currentCert.credentialId}
                                onChange={(e) => setCurrentCert({ ...currentCert, credentialId: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#004fcb]/20 focus:border-[#004fcb] text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Credential URL</label>
                            <input
                                type="url"
                                value={currentCert.credentialUrl}
                                onChange={(e) => setCurrentCert({ ...currentCert, credentialUrl: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#004fcb]/20 focus:border-[#004fcb] text-sm"
                                placeholder="https://"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-bold text-white bg-[#004fcb] hover:bg-[#003bb5] rounded-lg disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save Certification"}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {certifications.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <Award className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 font-medium">No certifications added yet</p>
                        </div>
                    ) : (
                        certifications.map((cert, index) => (
                            <div key={index} className="group flex items-start justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-blue-100 hover:shadow-sm transition-all">
                                <div className="flex gap-4">
                                    <div className="mt-1 p-2 bg-blue-50 rounded-lg text-[#004fcb]">
                                        <Award className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">{cert.name}</h4>
                                        <p className="text-sm text-gray-600">{cert.issuer}</p>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                <span>Issued: {new Date(cert.issueDate).toLocaleDateString()}</span>
                                            </div>
                                            {cert.expiryDate && (
                                                <span>Expires: {new Date(cert.expiryDate).toLocaleDateString()}</span>
                                            )}
                                            {cert.credentialUrl && (
                                                <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#004fcb] hover:underline">
                                                    <LinkIcon className="w-3 h-3" />
                                                    Show Credential
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(index)}
                                        className="p-2 text-gray-400 hover:text-[#004fcb] hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(index)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
