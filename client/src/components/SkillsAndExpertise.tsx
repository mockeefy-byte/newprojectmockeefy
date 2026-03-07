import { useState, useEffect } from "react";
import axios from '../lib/axios';
import { toast } from "sonner";
import { MultiSelect, PrimaryButton } from "../pages/ExpertDashboard";


const SkillsAndExpertise = () => {

  const MODE_OPTIONS = [
    { value: "Online", label: "Online" },
    { value: "Offline", label: "Offline" },
    { value: "Hybrid", label: "Hybrid" },
  ];


  // DOMAIN_OPTIONS removed in favor of dynamic categoryOptions

  const TOOL_OPTIONS = [
    { value: "workday", label: "Workday" },
    { value: "greenhouse", label: "Greenhouse" },
    { value: "lever", label: "Lever" },
    { value: "ashby", label: "Ashby" },
    { value: "linkedin-recruiter", label: "LinkedIn Recruiter" },
    { value: "hackerrank", label: "HackerRank" },
    { value: "coderpad", label: "CoderPad" },
    { value: "mettl", label: "Mettl" },
    { value: "leetcode", label: "LeetCode" },
    { value: "figma", label: "Figma" },
    { value: "jira", label: "Jira" },
    { value: "confluence", label: "Confluence" },
    { value: "slack", label: "Slack" },
    { value: "teams", label: "Microsoft Teams" },
    { value: "vscode", label: "VS Code" },
    { value: "intellij", label: "IntelliJ IDEA" },
    { value: "eclipse", label: "Eclipse" },
    { value: "pycharm", label: "PyCharm" },
    { value: "visual-studio", label: "Visual Studio" },
  ];

  const LANGUAGE_OPTIONS = [
    { value: "english", label: "English" },
    { value: "hindi", label: "Hindi" },
    { value: "tamil", label: "Tamil" },
    { value: "telugu", label: "Telugu" },
    { value: "kannada", label: "Kannada" },
    { value: "malayalam", label: "Malayalam" },
    { value: "bengali", label: "Bengali" },
    { value: "marathi", label: "Marathi" },
    { value: "gujarati", label: "Gujarati" },
    { value: "punjabi", label: "Punjabi" },
  ];

  // ------------------ State ------------------
  const [profile, setProfile] = useState({
    skills: {
      mode: "",
      domains: [],
      tools: [],
      languages: [],
    },
  });
  const [isLoading, setIsLoading] = useState(true);


  // ------------------ Fetch existing (GET) ------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch skills
        const skillsRes = await axios.get("/api/expert/skills");
        setProfile((p) => ({
          ...p,
          skills: skillsRes.data?.data || { mode: "", domains: [], tools: [], languages: [] },
        }));



      } catch (err: any) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // ------------------ Array updater ------------------
  const updateSkillsArray = (field: string, values: string[]) => {
    setProfile((p) => ({
      ...p,
      skills: { ...p.skills, [field]: values },
    }));
  };

  // ------------------ Mode updater ------------------
  const updateMode = (values: string[]) => {
    // Take the last selected value to simulate single select switch
    const newMode = values.length > 0 ? values[values.length - 1] : "";
    setProfile((p) => ({
      ...p,
      skills: { ...p.skills, mode: newMode },
    }));
  };

  // ------------------ Save Handler (POST/PUT) ------------------
  const saveSkills = async () => {
    try {
      // Save skills
      await axios.put(
        "/api/expert/skills",
        {
          skillsAndExpertise: profile.skills
        }
      );

      toast.success("Skills saved successfully!");
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Error saving skills!";
      toast.error(errorMsg);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="p-6 border-b border-gray-100 bg-white shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Skills & Expertise</h3>
            <p className="text-sm text-gray-500 mt-1">
              Interview modes, domains, tools and languages
            </p>
          </div>
          <PrimaryButton onClick={saveSkills}>Save Changes</PrimaryButton>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 min-h-0 pb-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto items-stretch">
          {/* Interview Mode */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-orange-500 rounded-full"></span>
              Interview Mode
            </h4>
            <MultiSelect
              label="Select Interaction Mode"
              value={profile.skills.mode ? [profile.skills.mode] : []}
              onChange={updateMode}
              options={MODE_OPTIONS}
              placeholder="Select mode..."
              maxItems={1}
            />
          </div>

          {/* Languages */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-purple-600 rounded-full"></span>
              Languages
            </h4>
            <MultiSelect
              label="Languages Spoken"
              value={profile.skills.languages}
              onChange={(values) => updateSkillsArray("languages", values)}
              options={LANGUAGE_OPTIONS}
            />
          </div>

          {/* Domains / Categories */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-blue-600 rounded-full"></span>
              Expertise Areas
            </h4>
            <MultiSelect
              label="Selected Categories (Max 6)"
              value={profile.skills.domains}
              onChange={(values) => updateSkillsArray("domains", values)}
              options={[]}
              placeholder="Add Skills (e.g. React, Node)..."
              maxItems={6}
            />
          </div>

          {/* Tools */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-green-600 rounded-full"></span>
              Tools & Technologies
            </h4>
            <MultiSelect
              label="Tools & IDEs Known"
              value={profile.skills.tools}
              onChange={(values) => updateSkillsArray("tools", values)}
              options={TOOL_OPTIONS}
              dropUp={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsAndExpertise;
