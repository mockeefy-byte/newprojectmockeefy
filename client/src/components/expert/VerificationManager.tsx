import { useState, useEffect, useRef } from 'react';
import axios from '../../lib/axios';
import { toast } from 'sonner';
import { Upload, FileText, CheckCircle, AlertCircle, Save, ExternalLink, Loader } from 'lucide-react';

interface VerificationDocs {
    companyId?: { url: string; name: string };
    aadhar?: { url: string; name: string };
    linkedin?: string;
}

// Image compression utility
const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const maxWidth = 800;
                const maxHeight = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                }

                canvas.toBlob((blob) => {
                    if (blob) {
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    } else {
                        reject(new Error('Compression failed'));
                    }
                }, 'image/jpeg', 0.7); // 70% quality for faster upload
            };
            img.onerror = () => reject(new Error('Failed to load image'));
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
    });
};

export default function VerificationManager() {
    const [verification, setVerification] = useState<VerificationDocs>({});
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Form states
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [companyFile, setCompanyFile] = useState<File | null>(null);
    const [aadharFile, setAadharFile] = useState<File | null>(null);

    const companyInputRef = useRef<HTMLInputElement>(null);
    const aadharInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchVerificationStatus();
    }, []);

    const fetchVerificationStatus = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/expert/profile');
            if (res.data.success) {
                const v = res.data.profile.verification || {};
                setVerification(v);
                setLinkedinUrl(v.linkedin || '');
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load verification details");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'company' | 'aadhar') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // Validate file type - images only
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                toast.error("Only image files (JPG, PNG, WebP) are allowed");
                return;
            }
            
            // Show compression toast for large files
            if (file.size > 50 * 1024) {
                toast.loading("Compressing image for faster upload...");
            }
            
            try {
                // Compress image if over 50KB
                let processedFile = file;
                if (file.size > 50 * 1024) {
                    processedFile = await compressImage(file);
                    toast.dismiss();
                }
                
                // Validate compressed file size - 100KB limit
                const maxSize = 100 * 1024; // 100KB
                if (processedFile.size > maxSize) {
                    const sizeInKB = (processedFile.size / 1024).toFixed(2);
                    toast.error(`File size should be less than 100KB. Your file is ${sizeInKB}KB`);
                    return;
                }
                
                if (type === 'company') setCompanyFile(processedFile);
                else setAadharFile(processedFile);
                
                toast.success(`Image ready (${(processedFile.size / 1024).toFixed(2)}KB)`);
            } catch (error) {
                toast.dismiss();
                console.error('Compression error:', error);
                toast.error("Failed to process image");
            }
        }
    };

    const handleSubmit = async () => {
        if (!linkedinUrl && !companyFile && !aadharFile) {
            toast.info("No changes to save");
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();

            if (linkedinUrl) formData.append('linkedin', linkedinUrl);
            if (companyFile) formData.append('companyIdFile', companyFile);
            if (aadharFile) formData.append('aadharFile', aadharFile);

            // Show upload progress
            const toastId = toast.loading("Uploading verification documents...");

            const res = await axios.put('/api/expert/verification', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 30000, // 30 second timeout
            });

            if (res.data.success) {
                toast.dismiss(toastId);
                toast.success("✓ Verification documents uploaded successfully!");
                setVerification(res.data.verification);
                setCompanyFile(null);
                setAadharFile(null);
                // Clear file inputs
                if (companyInputRef.current) companyInputRef.current.value = '';
                if (aadharInputRef.current) aadharInputRef.current.value = '';
            }
        } catch (error) {
            console.error(error);
            const message = (error as any)?.response?.data?.message || 
                          (error as any)?.message || 
                          "Failed to upload verification documents";
            toast.error(message);
        } finally {
            setUploading(false);
        }
    };

    const StatusBadge = ({ isUploaded }: { isUploaded: boolean }) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${isUploaded
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}>
            {isUploaded ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            {isUploaded ? "Uploaded" : "Pending"}
        </span>
    );

    if (loading) return <div className="p-8 text-center text-gray-400">Loading details...</div>;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Verification Documents</h2>
                        <p className="text-sm text-gray-500 mt-1">Upload necessary documents to verify your expert profile.</p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* 1. LinkedIn URL */}
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700">LinkedIn Profile URL</label>
                    <div className="flex gap-4">
                        <input
                            type="url"
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                            placeholder="https://linkedin.com/in/your-profile"
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#004fcb] focus:border-[#004fcb] outline-none transition-all"
                        />
                    </div>
                    {verification.linkedin && (
                        <a href={verification.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-[#004fcb] hover:underline">
                            <ExternalLink className="w-4 h-4" />
                            View Current Profile
                        </a>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* 2. Company ID */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-bold text-gray-700">Company ID / Offer Letter</label>
                            <StatusBadge isUploaded={!!verification.companyId?.url} />
                        </div>

                        <div
                            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors ${companyFile ? "border-[#004fcb] bg-blue-50/10" : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
                                }`}
                        >
                            <input
                                ref={companyInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/jpg,image/webp"
                                onChange={(e) => handleFileChange(e, 'company')}
                                className="hidden"
                                id="company-upload"
                            />

                            {verification.companyId?.url && !companyFile ? (
                                <div className="space-y-2">
                                    <FileText className="w-10 h-10 text-green-600 mx-auto" />
                                    <p className="text-sm font-medium text-gray-900">{verification.companyId.name || 'Document Uploaded'}</p>
                                    <a href={verification.companyId.url} target="_blank" rel="noreferrer" className="text-xs text-[#004fcb] hover:underline block">View Document</a>
                                    <label htmlFor="company-upload" className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer block mt-2 underline">Replace File</label>
                                </div>
                            ) : companyFile ? (
                                <div className="space-y-2">
                                    <FileText className="w-10 h-10 text-[#004fcb] mx-auto" />
                                    <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{companyFile.name}</p>
                                    <p className="text-xs text-gray-500">{(companyFile.size / 1024).toFixed(2)} KB</p>
                                    <button onClick={() => setCompanyFile(null)} className="text-xs text-red-500 hover:text-red-700 font-medium">Remove Selection</button>
                                </div>
                            ) : (
                                <label htmlFor="company-upload" className="cursor-pointer space-y-2 w-full h-full flex flex-col items-center justify-center">
                                    <Upload className="w-8 h-8 text-gray-400" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-700">Click to upload</p>
                                        <p className="text-xs text-gray-500">PNG, JPG, WebP up to 100KB</p>
                                    </div>
                                </label>
                            )}
                        </div>
                    </div>

                    {/* 3. Aadhar ID */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-bold text-gray-700">Govt ID (Aadhar/PAN)</label>
                            <StatusBadge isUploaded={!!verification.aadhar?.url} />
                        </div>

                        <div
                            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors ${aadharFile ? "border-[#004fcb] bg-blue-50/10" : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
                                }`}
                        >
                            <input
                                ref={aadharInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/jpg,image/webp"
                                onChange={(e) => handleFileChange(e, 'aadhar')}
                                className="hidden"
                                id="aadhar-upload"
                            />

                            {verification.aadhar?.url && !aadharFile ? (
                                <div className="space-y-2">
                                    <FileText className="w-10 h-10 text-green-600 mx-auto" />
                                    <p className="text-sm font-medium text-gray-900">{verification.aadhar.name || 'Document Uploaded'}</p>
                                    <a href={verification.aadhar.url} target="_blank" rel="noreferrer" className="text-xs text-[#004fcb] hover:underline block">View Document</a>
                                    <label htmlFor="aadhar-upload" className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer block mt-2 underline">Replace File</label>
                                </div>
                            ) : aadharFile ? (
                                <div className="space-y-2">
                                    <FileText className="w-10 h-10 text-[#004fcb] mx-auto" />
                                    <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{aadharFile.name}</p>
                                    <p className="text-xs text-gray-500">{(aadharFile.size / 1024).toFixed(2)} KB</p>
                                    <button onClick={() => setAadharFile(null)} className="text-xs text-red-500 hover:text-red-700 font-medium">Remove Selection</button>
                                </div>
                            ) : (
                                <label htmlFor="aadhar-upload" className="cursor-pointer space-y-2 w-full h-full flex flex-col items-center justify-center">
                                    <Upload className="w-8 h-8 text-gray-400" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-700">Click to upload</p>
                                        <p className="text-xs text-gray-500">PNG, JPG, WebP up to 100KB</p>
                                    </div>
                                </label>
                            )}
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={uploading || (!companyFile && !aadharFile && !linkedinUrl)}
                        className="flex items-center gap-2 bg-[#004fcb] hover:bg-[#003bb5] text-white px-8 py-2.5 rounded-lg font-medium shadow-sm transition-all disabled:opacity-70 active:scale-95"
                    >
                        {uploading ? (
                            <>
                                <Loader className="w-4 h-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Verification Details
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
