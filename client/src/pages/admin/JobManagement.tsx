
import { useState, useEffect } from "react";
import axios from "../../lib/axios";
import { Briefcase, Trash2, Plus, MapPin, DollarSign, ExternalLink, Pencil } from "lucide-react";
import toast from "react-hot-toast";

interface Job {
    _id: string;
    company: string;
    position: string;
    location: string;
    salary: string;
    type: string;
    applyLink: string;
    postedAt: string;
    description: string;
    requirements: string[];
    benefits: string[];
    process: { step: number; title: string; description: string }[];
    experienceLevel: string;
    status: string;
}

const JobManagement = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentJobId, setCurrentJobId] = useState<string | null>(null);

    const initialFormState = {
        company: "",
        position: "",
        location: "",
        salary: "",
        type: "Full-time",
        applyLink: "",
        description: "",
        requirements: [""],
        benefits: [""],
        process: [{ step: 1, title: "", description: "" }],
        experienceLevel: "Mid Level",
        status: "Active"
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await axios.get("/api/jobs");
            setJobs(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch jobs", err);
            toast.error("Failed to load jobs");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this job?")) return;
        try {
            await axios.delete(`/api/jobs/${id}`);
            toast.success("Job deleted successfully");
            fetchJobs();
        } catch (err) {
            console.error("Failed to delete job", err);
            toast.error("Failed to delete job");
        }
    };

    const handleEdit = (job: Job) => {
        setFormData({
            company: job.company,
            position: job.position,
            location: job.location,
            salary: job.salary,
            type: job.type,
            applyLink: job.applyLink,
            description: job.description,
            requirements: job.requirements.length > 0 ? job.requirements : [""],
            benefits: job.benefits.length > 0 ? job.benefits : [""],
            process: job.process.length > 0 ? job.process : [{ step: 1, title: "", description: "" }],
            experienceLevel: job.experienceLevel,
            status: job.status || "Active"
        });
        setCurrentJobId(job._id);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const openNewJobModal = () => {
        setFormData(initialFormState);
        setIsEditing(false);
        setCurrentJobId(null);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && currentJobId) {
                await axios.put(`/api/jobs/${currentJobId}`, formData);
                toast.success("Job updated successfully");
            } else {
                await axios.post("/api/jobs", formData);
                toast.success("Job posted successfully");
            }
            setIsModalOpen(false);
            setFormData(initialFormState);
            setIsEditing(false);
            setCurrentJobId(null);
            fetchJobs();
        } catch (err) {
            console.error("Failed to save job", err);
            toast.error("Failed to save job");
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 min-h-[calc(100vh-8rem)]">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Job Board Management</h1>
                    <p className="text-gray-500">Post and manage job opportunities for candidates.</p>
                </div>
                <button
                    onClick={openNewJobModal}
                    className="bg-[#004fcb] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Post New Job
                </button>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : jobs.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No active job posts.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.map((job) => (
                        <div key={job._id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative group hover:shadow-md transition-shadow">
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(job)}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit Job"
                                >
                                    <Pencil size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(job._id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete Job"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="mb-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-gray-900 text-lg pr-16">{job.position}</h3>
                                </div>
                                <p className="text-[#004fcb] font-medium">{job.company}</p>
                                <div className="mt-2">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${job.status === 'Active' ? 'bg-green-100 text-green-800' :
                                        job.status === 'Closed' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {(job.status || 'Active')}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <MapPin size={16} />
                                    {job.location}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <DollarSign size={16} />
                                    {job.salary}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded text-gray-600">{job.type}</span>
                                <a href={job.applyLink} target="_blank" rel="noopener noreferrer" className="text-xs text-[#004fcb] hover:underline flex items-center gap-1">
                                    View Link <ExternalLink size={12} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Post Job Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                            <h2 className="text-xl font-bold text-gray-900">{isEditing ? "Edit Job Details" : "Post a New Job"}</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                            {/* Status Dropdown - Visible only when editing or if we want to allow setting status initially */}
                            {isEditing && (
                                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-4">
                                    <label className="block text-sm font-bold text-blue-900 mb-1">Job Status</label>
                                    <select
                                        className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="Active">Active (Visible)</option>
                                        <option value="Closed">Closed (Hidden)</option>
                                        <option value="Draft">Draft</option>
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.company}
                                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Position / Role</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.position}
                                    onChange={e => setFormData({ ...formData, position: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Remote, NY"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. $120k - $150k"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.salary}
                                        onChange={e => setFormData({ ...formData, salary: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Internship">Internship</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.experienceLevel}
                                        onChange={e => setFormData({ ...formData, experienceLevel: e.target.value })}
                                    >
                                        <option value="Entry Level">Entry Level</option>
                                        <option value="Mid Level">Mid Level</option>
                                        <option value="Senior Level">Senior Level</option>
                                        <option value="Lead">Lead</option>
                                        <option value="Executive">Executive</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Key Requirements</label>
                                {formData.requirements.map((req, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={req}
                                            onChange={e => {
                                                const newReqs = [...formData.requirements];
                                                newReqs[index] = e.target.value;
                                                setFormData({ ...formData, requirements: newReqs });
                                            }}
                                            placeholder={`Requirement ${index + 1}`}
                                        />
                                        {formData.requirements.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newReqs = formData.requirements.filter((_, i) => i !== index);
                                                    setFormData({ ...formData, requirements: newReqs });
                                                }}
                                                className="text-red-500 hover:text-red-700 font-bold px-2"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, requirements: [...formData.requirements, ""] })}
                                    className="text-sm text-[#004fcb] hover:underline font-semibold"
                                >
                                    + Add Requirement
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Benefits</label>
                                {formData.benefits.map((benefit, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={benefit}
                                            onChange={e => {
                                                const newBenefits = [...formData.benefits];
                                                newBenefits[index] = e.target.value;
                                                setFormData({ ...formData, benefits: newBenefits });
                                            }}
                                            placeholder={`Benefit ${index + 1}`}
                                        />
                                        {formData.benefits.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newBenefits = formData.benefits.filter((_, i) => i !== index);
                                                    setFormData({ ...formData, benefits: newBenefits });
                                                }}
                                                className="text-red-500 hover:text-red-700 font-bold px-2"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, benefits: [...formData.benefits, ""] })}
                                    className="text-sm text-[#004fcb] hover:underline font-semibold"
                                >
                                    + Add Benefit
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hiring Process</label>
                                {formData.process.map((step, index) => (
                                    <div key={index} className="border border-gray-100 p-3 rounded-lg mb-2 bg-gray-50">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-gray-500">Step {index + 1}</span>
                                            {formData.process.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newProcess = formData.process.filter((_, i) => i !== index);
                                                        setFormData({ ...formData, process: newProcess });
                                                    }}
                                                    className="text-red-500 hover:text-red-700 font-bold text-xs"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={step.title}
                                            onChange={e => {
                                                const newProcess = [...formData.process];
                                                newProcess[index] = { ...step, title: e.target.value, step: index + 1 };
                                                setFormData({ ...formData, process: newProcess });
                                            }}
                                            placeholder="Step Title (e.g. Initial Screening)"
                                        />
                                        <textarea
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            rows={2}
                                            value={step.description}
                                            onChange={e => {
                                                const newProcess = [...formData.process];
                                                newProcess[index] = { ...step, description: e.target.value, step: index + 1 };
                                                setFormData({ ...formData, process: newProcess });
                                            }}
                                            placeholder="Step Description"
                                        ></textarea>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, process: [...formData.process, { step: formData.process.length + 1, title: "", description: "" }] })}
                                    className="text-sm text-[#004fcb] hover:underline font-semibold"
                                >
                                    + Add Process Step
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Application Link</label>
                                <input
                                    type="url"
                                    required
                                    placeholder="https://..."
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.applyLink}
                                    onChange={e => setFormData({ ...formData, applyLink: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#004fcb] text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Post Job
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobManagement;
