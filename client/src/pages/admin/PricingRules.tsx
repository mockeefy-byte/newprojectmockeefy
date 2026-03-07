import { useState, useEffect } from 'react';
import { DollarSign, Save } from 'lucide-react';
import axios from '../../lib/axios';
import { toast } from 'sonner';

interface PricingRule {
    id?: string;
    categoryId: string;
    skillId?: string; // New field
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    duration: 30 | 60;
    price: number;
    currency: string;
}

interface Category {
    id: string;
    name: string;
}

export default function PricingRules() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [skills, setSkills] = useState<{ id: string, name: string }[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedSkill, setSelectedSkill] = useState<string>(''); // Empty for "Base Category Price"

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [rules, setRules] = useState<PricingRule[]>([]);

    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get('/api/categories');
                if (res.data) setCategories(res.data);
            } catch (error) {
                console.error("Error fetching categories", error);
            }
        };
        fetchCategories();
    }, []);

    // Fetch Skills when Category changes
    useEffect(() => {
        if (!selectedCategory) {
            setSkills([]);
            setSelectedSkill('');
            return;
        }
        const fetchSkills = async () => {
            try {
                const res = await axios.get(`/api/skills/category/${selectedCategory}`);
                setSkills(res.data || []);
                setSelectedSkill(''); // Reset skill selection
            } catch (error) {
                console.error("Error fetching skills", error);
            }
        };
        fetchSkills();
    }, [selectedCategory]);

    // Fetch Rules when Category or Skill changes
    useEffect(() => {
        if (!selectedCategory) {
            setRules([]);
            return;
        }

        const fetchRules = async () => {
            setLoading(true);
            try {
                // Query param to filter by skillId (or "null" for base)
                const skillQuery = selectedSkill ? `?skillId=${selectedSkill}` : `?base=true`;
                const res = await axios.get(`/api/pricing/category/${selectedCategory}${skillQuery}`);

                const defaultRules: PricingRule[] = [];
                const levels = ['Beginner', 'Intermediate', 'Advanced'] as const;
                const durations = [30, 60] as const;

                levels.forEach(level => {
                    durations.forEach(duration => {
                        const existing = res.data?.find((r: PricingRule) => r.level === level && r.duration === duration);
                        defaultRules.push(existing || {
                            categoryId: selectedCategory,
                            skillId: selectedSkill || undefined, // undefined effectively acts as null in some contexts, but let's be careful
                            level,
                            duration,
                            price: duration === 30 ? 500 : 900,
                            currency: 'INR'
                        });
                    });
                });

                setRules(defaultRules);
            } catch (error) {
                // Fallback defaults
                const defaultRules: PricingRule[] = [];
                const levels = ['Beginner', 'Intermediate', 'Advanced'] as const;
                const durations = [30, 60] as const;
                levels.forEach(level => durations.forEach(duration => {
                    defaultRules.push({
                        categoryId: selectedCategory,
                        skillId: selectedSkill || undefined,
                        level,
                        duration,
                        price: duration === 30 ? 500 : 900,
                        currency: 'INR'
                    });
                }));
                setRules(defaultRules);
            } finally {
                setLoading(false);
            }
        };
        fetchRules();
    }, [selectedCategory, selectedSkill]);

    const handlePriceChange = (index: number, val: string) => {
        const newRules = [...rules];
        newRules[index].price = parseInt(val) || 0;

        // Ensure skillId is set correctly (sometimes state might drift if not enforced)
        if (selectedSkill) newRules[index].skillId = selectedSkill;
        else delete newRules[index].skillId;

        setRules(newRules);
    };

    const handleSave = async () => {
        if (!selectedCategory) return;
        setSaving(true);
        try {
            // Ensure all rules have the correct context
            const contextRules = rules.map(r => ({
                ...r,
                categoryId: selectedCategory,
                skillId: selectedSkill || null // explicit null for backend
            }));

            await axios.post('/api/pricing/bulk', { rules: contextRules });
            toast.success(`Pricing rules saved for ${selectedSkill ? 'Skill' : 'Base Category'}`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to save pricing rules');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pricing Configuration</h1>
                    <p className="text-gray-500 mt-1">Set granular pricing by Category, specific Skill, Level, and Duration.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">1. Select Category</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004fcb] focus:border-transparent"
                            >
                                <option value="">-- Choose Category --</option>
                                {categories.map((cat) => (
                                    <option key={cat.id || (cat as any)._id} value={cat.id || (cat as any)._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {selectedCategory && (
                            <div className="animate-in fade-in slide-in-from-left-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">2. Select Skill (Optional)</label>
                                <select
                                    value={selectedSkill}
                                    onChange={(e) => setSelectedSkill(e.target.value)}
                                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-[#004fcb] bg-blue-50/30 text-blue-900"
                                >
                                    <option value="">-- Category Base Price (Default) --</option>
                                    {Array.isArray(skills) && skills.map((skill) => (
                                        <option key={skill.id || (skill as any)._id} value={skill.id || (skill as any)._id}>{skill.name}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    {selectedSkill ? 'Use this to override base pricing for this specific skill.' : 'This sets the default price for the entire category.'}
                                </p>
                            </div>
                        )}
                    </div>

                    {selectedCategory && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 border-t border-gray-100 pt-6">
                            {loading ? (
                                <div className="text-center py-8">Loading pricing matrix...</div>
                            ) : (
                                <>
                                    <div className="mb-4 flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${selectedSkill ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                            Configuring: {selectedSkill ? skills.find(s => s.id === selectedSkill)?.name : 'Base Category Defaults'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {[30, 60].map(duration => (
                                            <div key={duration} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                    <DollarSign className="w-5 h-5 text-[#004fcb]" />
                                                    {duration} Minute Sessions
                                                </h3>
                                                <div className="space-y-4">
                                                    {(Array.isArray(rules) ? rules : []).filter(r => r.duration === duration).map((rule) => {
                                                        const originalIndex = rules.indexOf(rule);
                                                        return (
                                                            <div key={rule.level} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                                                <span className="font-medium text-gray-700">{rule.level}</span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-gray-400 text-sm">INR</span>
                                                                    <input
                                                                        type="number"
                                                                        value={rule.price}
                                                                        onChange={(e) => handlePriceChange(originalIndex, e.target.value)}
                                                                        className="w-24 px-2 py-1 border border-gray-300 rounded text-right font-medium focus:outline-none focus:border-[#004fcb]"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 flex justify-end">
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="flex items-center gap-2 bg-[#004fcb] text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-shadow shadow-lg shadow-blue-200 disabled:opacity-70"
                                        >
                                            <Save className="w-5 h-5" />
                                            {saving ? 'Saving...' : 'Save Pricing Rules'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {!selectedCategory && (
                        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">Select a category above to start configuration.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
