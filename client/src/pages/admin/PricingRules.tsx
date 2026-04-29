import { useState, useEffect } from 'react';
import { DollarSign, Save } from 'lucide-react';
import axios from '../../lib/axios';
import { toast } from 'sonner';

interface PricingRule {
    id?: string;
    categoryId: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    duration: 30 | 60;
    price: number;
    currency: string;
}

interface Category {
    _id: string;
    id?: string;
    name: string;
    amount?: number | null;
}

export default function PricingRules() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [rules, setRules] = useState<PricingRule[]>([]);

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

    // Fetch category-only rules (no skill). Default prices from category base amount (Admin → Categories).
    useEffect(() => {
        if (!selectedCategory) {
            setRules([]);
            return;
        }
        const fetchRules = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`/api/pricing/category/${selectedCategory}?base=true`);
                const levels = ['Beginner', 'Intermediate', 'Advanced'] as const;
                const durations = [30, 60] as const;
                const cat = categories.find(c => (c._id || c.id) === selectedCategory);
                const baseAmount = (cat?.amount != null && cat.amount >= 0) ? Number(cat.amount) : 500;
                const defaultRules: PricingRule[] = [];
                levels.forEach(level => {
                    durations.forEach(duration => {
                        const existing = (res.data || []).find((r: PricingRule) => r.level === level && r.duration === duration);
                        defaultRules.push(existing || {
                            categoryId: selectedCategory,
                            level,
                            duration,
                            price: duration === 30 ? baseAmount : Math.round(baseAmount * 1.8),
                            currency: 'INR'
                        });
                    });
                });
                setRules(defaultRules);
            } catch (error) {
                const levels = ['Beginner', 'Intermediate', 'Advanced'] as const;
                const durations = [30, 60] as const;
                const cat = categories.find(c => (c._id || c.id) === selectedCategory);
                const baseAmount = (cat?.amount != null && cat.amount >= 0) ? Number(cat.amount) : 500;
                setRules(levels.flatMap(level => durations.map(duration => ({
                    categoryId: selectedCategory,
                    level,
                    duration,
                    price: duration === 30 ? baseAmount : Math.round(baseAmount * 1.8),
                    currency: 'INR'
                }))));
            } finally {
                setLoading(false);
            }
        };
        fetchRules();
    }, [selectedCategory, categories]);

    const handlePriceChange = (index: number, val: string) => {
        const newRules = [...rules];
        newRules[index].price = parseInt(val, 10) || 0;
        setRules(newRules);
    };

    const handleSave = async () => {
        if (!selectedCategory) return;
        setSaving(true);
        try {
            const contextRules = rules.map(r => ({
                categoryId: selectedCategory,
                skillId: null,
                level: r.level,
                duration: r.duration,
                price: r.price,
                currency: r.currency || 'INR'
            }));
            await axios.post('/api/pricing/bulk', { rules: contextRules });
            toast.success('Pricing rules saved. Session and expert prices will use these values.');
            // Refresh list so UI shows saved values
            const res = await axios.get(`/api/pricing/category/${selectedCategory}?base=true`);
            const levels = ['Beginner', 'Intermediate', 'Advanced'] as const;
            const durations = [30, 60] as const;
            const cat = categories.find(c => (c._id || c.id) === selectedCategory);
            const baseAmount = (cat?.amount != null && cat.amount >= 0) ? Number(cat.amount) : 500;
            setRules(levels.flatMap(level => durations.map(duration => {
                const existing = (res.data || []).find((r: { level?: string; duration?: number }) => r.level === level && r.duration === duration);
                return {
                    categoryId: selectedCategory,
                    level,
                    duration,
                    price: existing?.price ?? (duration === 30 ? baseAmount : Math.round(baseAmount * 1.8)),
                    currency: (existing as PricingRule)?.currency || 'INR'
                };
            })));
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
                    <h1 className="text-2xl font-bold text-gray-900">Pricing (Category-based)</h1>
                    <p className="text-gray-500 mt-1">Session price = Category + Expert level + Duration. Set one price per category per level per duration. Skills do not affect price.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="max-w-5xl">
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Category</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004fcb] focus:border-transparent"
                        >
                            <option value="">-- Choose Category --</option>
                            {categories.map((cat) => (
                                <option key={cat._id || cat.id} value={cat._id || cat.id}>{cat.name}{cat.amount != null ? ` (base ₹${cat.amount})` : ''}</option>
                            ))}
                        </select>
                    </div>

                    {selectedCategory && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 border-t border-gray-100 pt-6">
                            {loading ? (
                                <div className="text-center py-8">Loading pricing matrix...</div>
                            ) : (
                                <>
                                    <div className="mb-4 flex items-center gap-2">
                                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-gray-100 text-gray-600">
                                            Category defaults (used for all experts in this category)
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
