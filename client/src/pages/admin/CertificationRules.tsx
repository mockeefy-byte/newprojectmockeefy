import { useState, useEffect } from 'react';
import { Award, Save, Info } from 'lucide-react';
import axios from '../../lib/axios';
import { toast } from 'sonner';

interface CertificationRule {
    id?: string;
    categoryId: string;
    minInterviews: number;
    passingPercentage: number;
    validityMonths: number;
    weightage: {
        technical: number;
        communication: number;
        confidence: number;
    };
}

interface Category {
    id: string;
    _id?: string;
    name: string;
}

export default function CertificationRules() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [rule, setRule] = useState<CertificationRule>({
        categoryId: '',
        minInterviews: 5,
        passingPercentage: 70,
        validityMonths: 12,
        weightage: {
            technical: 40,
            communication: 30,
            confidence: 30
        }
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch categories on mount
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

    useEffect(() => {
        if (!selectedCategory) return;

        // Fetch existing rule for category
        const fetchRule = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`/api/certification-rules/category/${selectedCategory}`);
                if (res.data) {
                    setRule({
                        ...res.data,
                        weightage: {
                            technical: 40,
                            communication: 30,
                            confidence: 30,
                            ...(res.data.weightage || {})
                        }
                    });
                } else {
                    // Reset to defaults if no rule exists
                    setRule({
                        categoryId: selectedCategory,
                        minInterviews: 5,
                        passingPercentage: 70,
                        validityMonths: 12,
                        weightage: { technical: 40, communication: 30, confidence: 30 }
                    });
                }
            } catch (error) {
                // Ignore 404s, meant no rule exists
                setRule({
                    categoryId: selectedCategory,
                    minInterviews: 5,
                    passingPercentage: 70,
                    validityMonths: 12,
                    weightage: { technical: 40, communication: 30, confidence: 30 }
                });
            } finally {
                setLoading(false);
            }
        };
        fetchRule();
    }, [selectedCategory]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategory) return;

        try {
            setLoading(true);
            const payload = { ...rule, categoryId: selectedCategory };
            await axios.post('/api/certification-rules', payload);
            toast.success('Certification rules saved successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save rules');
        } finally {
            setLoading(false);
        }
    };

    const totalWeightage = (rule.weightage?.technical || 0) + (rule.weightage?.communication || 0) + (rule.weightage?.confidence || 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Certification Rules</h1>
                    <p className="text-gray-500 mt-1">Configure eligibility and scoring criteria for domain certifications.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="max-w-3xl">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Category</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004fcb] focus:border-transparent"
                        >
                            <option value="">-- Choose a Domain --</option>
                            {categories.map((cat) => (
                                <option key={cat.id || (cat as any)._id} value={cat.id || (cat as any)._id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {selectedCategory && (
                        <form onSubmit={handleSave} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Interviews Required</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={rule.minInterviews}
                                        onChange={(e) => setRule({ ...rule, minInterviews: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004fcb] focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">To be eligible for certification</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Passing Percentage</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={rule.passingPercentage}
                                        onChange={(e) => setRule({ ...rule, passingPercentage: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004fcb] focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Validity Period (Months)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={rule.validityMonths}
                                        onChange={(e) => setRule({ ...rule, validityMonths: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004fcb] focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-[#004fcb]" />
                                    Uncommon Score Weightage
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Technical Skill (%)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={rule.weightage?.technical || 0}
                                            onChange={(e) => setRule({ ...rule, weightage: { ...rule.weightage, technical: parseInt(e.target.value) } })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004fcb] focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Communication (%)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={rule.weightage?.communication || 0}
                                            onChange={(e) => setRule({ ...rule, weightage: { ...rule.weightage, communication: parseInt(e.target.value) } })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004fcb] focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Confidence (%)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={rule.weightage?.confidence || 0}
                                            onChange={(e) => setRule({ ...rule, weightage: { ...rule.weightage, confidence: parseInt(e.target.value) } })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004fcb] focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                {totalWeightage !== 100 && (
                                    <div className="mt-3 flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg text-sm">
                                        <Info className="w-4 h-4" />
                                        Total weightage is {totalWeightage}%. It should ideally be 100%.
                                    </div>
                                )}
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-[#004fcb] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    {loading ? 'Saving...' : 'Save Configuration'}
                                </button>
                            </div>
                        </form>
                    )}

                    {!selectedCategory && (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <p className="text-gray-500">Please select a category above to configure its certification rules.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
