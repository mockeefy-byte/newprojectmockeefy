import { useState } from "react";
import { FileText, Plus, Edit, Copy, Trash2, Download, Eye, Star } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../lib/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface Resume {
  _id: string;
  title: string;
  template: string;
  createdAt: string;
  updatedAt: string;
  isDefault?: boolean;
}

interface ResumeManagementSectionProps {
  profileData: any;
  onUpdate: () => void;
}

export default function ResumeManagementSection({ profileData, onUpdate }: ResumeManagementSectionProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreateOptions, setShowCreateOptions] = useState(false);

  const userId = user?.id || user?._id || user?.userId;

  // Fetch user's saved resumes
  const { data: resumes, isLoading } = useQuery({
    queryKey: ["userResumes", userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await axios.get("/api/user/resumes", {
        headers: { userid: userId },
      });
      return response.data.success ? response.data.data : [];
    },
    enabled: !!userId,
  });

  // Delete resume mutation
  const deleteResumeMutation = useMutation({
    mutationFn: async (resumeId: string) => {
      const response = await axios.delete(`/api/user/resumes/${resumeId}`, {
        headers: { userid: userId },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userResumes", userId] });
      onUpdate();
    },
  });

  // Set default resume mutation
  const setDefaultMutation = useMutation({
    mutationFn: async (resumeId: string) => {
      const response = await axios.patch(`/api/user/resumes/${resumeId}/default`, {}, {
        headers: { userid: userId },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userResumes", userId] });
      onUpdate();
    },
  });

  const resumeBuilders = [
    {
      id: "full-builder",
      name: "Complete Resume Builder",
      description: "Step-by-step guided resume creation with multiple templates",
      icon: "📝",
      path: "/resume-builder",
      features: ["Multi-step forms", "4 Professional templates", "Live preview", "PDF export"]
    },
    {
      id: "quick-builder",
      name: "Quick Resume Creator",
      description: "Fast resume creation from your profile data",
      icon: "⚡",
      path: "/profile",
      features: ["Auto-fill from profile", "Instant preview", "One-click export"]
    },
    {
      id: "template-based",
      name: "Template-Based Builder",
      description: "Choose from pre-designed templates and customize",
      icon: "🎨",
      path: "/resume-builder",
      features: ["10+ Templates", "Custom styling", "Brand colors", "Section customization"]
    }
  ];

  const handleCreateResume = (builderId: string) => {
    if (builderId === "full-builder" || builderId === "template-based") {
      navigate("/resume-builder");
    } else if (builderId === "quick-builder") {
      // For quick builder, we could open a modal or navigate to a different route
      navigate("/resume-builder?mode=quick");
    }
    setShowCreateOptions(false);
  };

  const handleEditResume = (resumeId: string) => {
    navigate(`/resume-builder?edit=${resumeId}`);
  };

  const handleDuplicateResume = (resumeId: string) => {
    navigate(`/resume-builder?duplicate=${resumeId}`);
  };

  const handleDeleteResume = (resumeId: string) => {
    if (window.confirm("Are you sure you want to delete this resume?")) {
      deleteResumeMutation.mutate(resumeId);
    }
  };

  const handleSetDefault = (resumeId: string) => {
    setDefaultMutation.mutate(resumeId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8 font-sans bg-white border border-slate-200/70 rounded-[32px] shadow-[0_20px_50px_-30px_rgba(15,23,42,0.2)] p-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Resume Management</h2>
        <p className="text-sm font-medium text-slate-500 mt-1">Create, manage, and customize your professional resumes</p>
      </div>

      <div className="flex items-center justify-between">
        <div></div>
        <button
          onClick={() => setShowCreateOptions(!showCreateOptions)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:opacity-95 transition-all disabled:opacity-50 text-sm font-bold shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Create Resume
        </button>
      </div>

      {/* Create Options */}
      {showCreateOptions && (
        <div className="bg-slate-50 border border-slate-200 rounded-[28px] p-6">
          <h4 className="text-lg font-semibold text-slate-900 mb-4">Choose a Resume Builder</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {resumeBuilders.map((builder) => (
              <div
                key={builder.id}
                onClick={() => handleCreateResume(builder.id)}
                className="bg-white rounded-[28px] p-5 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="text-2xl mb-3">{builder.icon}</div>
                <h5 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {builder.name}
                </h5>
                <p className="text-sm text-slate-600 mt-1">{builder.description}</p>
                <ul className="mt-4 space-y-1">
                  {builder.features.map((feature, index) => (
                    <li key={index} className="text-xs text-slate-500 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Existing Resumes */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-slate-900">Your Resumes</h4>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : resumes && resumes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resumes.map((resume: Resume) => (
              <div
                key={resume._id}
                className="bg-white rounded-[28px] border border-slate-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-slate-900 flex items-center gap-2">
                        {resume.title}
                        {resume.isDefault && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                      </h5>
                      <p className="text-sm text-slate-500">
                        Template: {resume.template} • Updated {formatDate(resume.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleEditResume(resume._id)}
                    className="flex items-center gap-1 px-3 py-2 text-sm bg-slate-100 text-slate-700 rounded-2xl hover:bg-slate-200 transition-colors"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDuplicateResume(resume._id)}
                    className="flex items-center gap-1 px-3 py-2 text-sm bg-slate-100 text-slate-700 rounded-2xl hover:bg-slate-200 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    Duplicate
                  </button>
                  <button
                    onClick={() => handleSetDefault(resume._id)}
                    className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-2xl hover:bg-blue-200 transition-colors"
                    disabled={resume.isDefault}
                  >
                    <Star className="w-3 h-3" />
                    {resume.isDefault ? 'Default' : 'Set Default'}
                  </button>
                  <button
                    onClick={() => handleDeleteResume(resume._id)}
                    className="flex items-center gap-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-2xl hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-[28px] border-2 border-dashed border-slate-200">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h5 className="text-lg font-semibold text-slate-900 mb-2">No resumes yet</h5>
            <p className="text-slate-600 mb-4">Create your first professional resume to get started</p>
            <button
              onClick={() => setShowCreateOptions(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:opacity-95 transition-all disabled:opacity-50 text-sm font-bold shadow-lg shadow-blue-500/20 active:scale-95"
            >
              Create Your First Resume
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h4 className="text-lg font-semibold text-blue-900 mb-3">Quick Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate("/resume-builder")}
            className="flex items-center gap-3 p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-300 hover:shadow-md transition-all text-left group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h5 className="font-semibold text-slate-900">New Resume</h5>
              <p className="text-sm text-slate-600">Start from scratch</p>
            </div>
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-3 p-4 bg-white rounded-[28px] border border-blue-200 hover:border-blue-300 hover:shadow-md transition-all text-left group"
          >
            <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h5 className="font-semibold text-slate-900">Preview Profile</h5>
              <p className="text-sm text-slate-600">See how employers view you</p>
            </div>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-3 p-4 bg-white rounded-[28px] border border-blue-200 hover:border-blue-300 hover:shadow-md transition-all text-left group"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Download className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h5 className="font-semibold text-slate-900">Export Data</h5>
              <p className="text-sm text-slate-600">Download your information</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}