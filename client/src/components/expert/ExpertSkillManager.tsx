
import { useState, useEffect } from 'react';
import axios from '../../lib/axios';
import { toast } from 'sonner';
import { Plus, Save, Award, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Category {
    _id: string;
    name: string;
}

interface Skill {
    _id: string;
    name: string;
    categoryId: string;
}

interface ExpertSkill {
    skillId: string;
    level: string;
    // priceAdjustment removed
    isEnabled: boolean;
    name?: string;
}


export default function ExpertSkillManager() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
    const [mySkills, setMySkills] = useState<ExpertSkill[]>([]);

    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [selectedLevel, setSelectedLevel] = useState('Intermediate');
    const [saveLoading, setSaveLoading] = useState(false);

    // Initial Load
    useEffect(() => {
        fetchData();
        fetchMySkills();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get('/api/categories');
            setCategories(res.data);
        } catch (e) { console.error(e); }
    };

    const fetchMySkills = async () => {
        try {
            const res = await axios.get('/api/expert/profile');
            const skills = res.data.profile.expertSkills || [];
            setMySkills(skills.map((s: any) => ({
                skillId: s.skillId?._id || s.skillId,
                name: s.skillId?.name || 'Unknown',
                level: s.level,
                isEnabled: s.isEnabled
            })));
        } catch (e) { console.error(e); }
    };

    const handleCategoryChange = async (catId: string) => {
        setSelectedCategory(catId);
        setSelectedSkills([]);
        if (!catId) { setAvailableSkills([]); return; }

        try {
            const resSkills = await axios.get(`/api/skills/category/${catId}`);
            setAvailableSkills(Array.isArray(resSkills.data) ? resSkills.data : []);
        } catch (e) { toast.error("Failed to load category data"); }
    };

    const toggleSkillSelection = (skillId: string) => {
        setSelectedSkills(prev =>
            prev.includes(skillId)
                ? prev.filter(id => id !== skillId)
                : [...prev, skillId]
        );
    };

    const addSkills = () => {
        if (selectedSkills.length === 0) return;

        const newSkillsToAdd: ExpertSkill[] = [];
        let duplicateCount = 0;

        selectedSkills.forEach(sId => {
            if (mySkills.some(s => s.skillId === sId)) {
                duplicateCount++;
                return;
            }
            const skillObj = availableSkills.find(s => s._id === sId);
            if (skillObj) {
                newSkillsToAdd.push({
                    skillId: sId,
                    level: selectedLevel,
                    isEnabled: true,
                    name: skillObj.name
                } as any);
            }
        });

        if (duplicateCount > 0) {
            toast.warning(`${duplicateCount} skills were already added.`);
        }

        if (newSkillsToAdd.length > 0) {
            setMySkills([...mySkills, ...newSkillsToAdd]);
            toast.success(`Added ${newSkillsToAdd.length} skills`);
            // Reset selection but keep category open for more
            setSelectedSkills([]);
        }
    };

    const removeSkill = (index: number) => {
        const newSkills = [...mySkills];
        newSkills.splice(index, 1);
        setMySkills(newSkills);
    };

    const saveChanges = async () => {
        setSaveLoading(true);
        try {
            const payload = mySkills.map(s => ({
                skillId: s.skillId,
                level: s.level,
                priceAdjustment: 0,
                isEnabled: s.isEnabled
            }));

            const res = await axios.put('/api/expert/myskills', { expertSkills: payload });

            // Update local state with populated data from server
            if (res.data) {
                setMySkills(res.data.map((s: any) => ({
                    skillId: s.skillId?._id || s.skillId,
                    name: s.skillId?.name || 'Unknown',
                    level: s.level,
                    isEnabled: s.isEnabled
                })));
            }

            toast.success("Skills profile updated successfully");
        } catch (e) {
            toast.error("Failed to save skills");
        } finally {
            setSaveLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 bg-white shrink-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Skills & Expertise</h1>
                        <p className="text-gray-500 mt-1">Manage your professional skills to match with relevant candidates.</p>
                    </div>
                    <button
                        onClick={saveChanges}
                        disabled={saveLoading}
                        className="flex items-center gap-2 bg-[#004fcb] hover:bg-[#003bb5] text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-all disabled:opacity-70 active:scale-95"
                    >
                        {saveLoading ? (
                            <>Saving...</>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 min-h-0">
                <div className="space-y-8 max-w-5xl mx-auto">
                    {/* Selection Area */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Skills</h2>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                {/* 1. Category Selection */}
                                <div className="md:col-span-4 space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Step 1: Select Category</label>
                                    <select
                                        className="w-full h-11 px-3 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#004fcb]/20 focus:border-[#004fcb] outline-none transition-all"
                                        value={selectedCategory}
                                        onChange={(e) => handleCategoryChange(e.target.value)}
                                    >
                                        <option value="">Choose a category...</option>
                                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>

                                {/* 2. Level Selection */}
                                <div className="md:col-span-4 space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Step 2: Proficiency Level</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((lvl) => (
                                            <button
                                                key={lvl}
                                                onClick={() => setSelectedLevel(lvl)}
                                                className={`h-11 px-2 rounded-lg text-xs font-bold border transition-all truncate ${selectedLevel === lvl
                                                    ? "bg-[#004fcb] border-[#004fcb] text-white shadow-md"
                                                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                                                    }`}
                                            >
                                                {lvl}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Add Button */}
                                <div className="md:col-span-4 flex items-end">
                                    <button
                                        onClick={addSkills}
                                        disabled={selectedSkills.length === 0}
                                        className={`w-full h-11 flex items-center justify-center gap-2 rounded-lg font-bold transition-all ${selectedSkills.length > 0
                                            ? "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg translate-y-0"
                                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            }`}
                                    >
                                        <Plus className="w-5 h-5" />
                                        Add {selectedSkills.length > 0 ? `${selectedSkills.length} Skills` : ''}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Skill Selection Grid */}
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Step 3: Select Skills {availableSkills.length > 0 && `(${availableSkills.length} available)`}
                                </label>
                                {selectedSkills.length > 0 && (
                                    <button
                                        onClick={() => setSelectedSkills([])}
                                        className="text-xs font-bold text-red-500 hover:text-red-600"
                                    >
                                        Clear Selection
                                    </button>
                                )}
                            </div>

                            <div className="min-h-[200px]">
                                {!selectedCategory ? (
                                    <div className="h-48 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                                        <Award className="w-8 h-8 mb-2 opacity-50" />
                                        <p className="text-sm font-medium">Select a category above to view skills</p>
                                    </div>
                                ) : availableSkills.length === 0 ? (
                                    <div className="h-48 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                                        <p className="text-sm">No skills found in this category</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-3">
                                        {availableSkills.map(skill => {
                                            const isSelected = selectedSkills.includes(skill._id);
                                            const isAlreadyAdded = mySkills.some(ms => ms.skillId === skill._id);

                                            if (isAlreadyAdded) return null; // Don't show already added skills in selection list

                                            return (
                                                <button
                                                    key={skill._id}
                                                    onClick={() => toggleSkillSelection(skill._id)}
                                                    className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border ${isSelected
                                                        ? "bg-[#004fcb] border-[#004fcb] text-white shadow-md pr-9"
                                                        : "bg-white border-gray-200 text-gray-700 hover:border-[#004fcb] hover:shadow-sm hover:text-[#004fcb]"
                                                        }`}
                                                >
                                                    {skill.name}
                                                    {isSelected && (
                                                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-white/20 rounded-full">
                                                            <Check className="w-3.5 h-3.5 text-white" />
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                        {availableSkills.every(s => mySkills.some(ms => ms.skillId === s._id)) && (
                                            <div className="w-full text-center py-8 text-gray-400 text-sm">
                                                All skills from this category are already added to your profile!
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Selected Skills Preview (The "My Skills" Section) */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            Your Selected Skills
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">{mySkills.length}</span>
                        </h2>

                        {mySkills.length === 0 ? (
                            <div className="py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-3 text-gray-300">
                                    <Award className="w-6 h-6" />
                                </div>
                                <h3 className="text-gray-900 font-bold mb-1">No Skills Added</h3>
                                <p className="text-sm text-gray-500">Select a category and add skills above to build your profile.</p>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-3">
                                <AnimatePresence>
                                    {mySkills.map((skill, index) => (
                                        <motion.div
                                            key={`${skill.skillId}-${index}`}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            layout
                                            className="group flex items-center gap-3 pl-4 pr-2 py-2 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900 leading-none">
                                                    {skill.name || 'Unknown Skill'}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">
                                                    {skill.level}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => removeSkill(index)}
                                                className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                                title="Remove skill"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
