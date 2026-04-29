import { useState, useEffect } from "react";
import axios from "../../lib/axios";
import { Plus, Trash2, Save, X, DollarSign, Clock, Layers, Tag } from "lucide-react";
import toast from "react-hot-toast";

interface PriceRule {
    _id?: string;
    categoryId: string;
    levelId: string;
    duration: 30 | 60;
    price: number;
}

const CATEGORIES = ["IT", "HR", "Business", "Design", "Marketing", "Finance", "Legal", "Medical"];
const LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];
const DURATIONS = [30, 60];

const PricingMatrix = () => {
    const [prices, setPrices] = useState<PriceRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newRule, setNewRule] = useState<PriceRule>({
        categoryId: "IT",
        levelId: "Intermediate",
        duration: 60,
        price: 0
    });

    const fetchPrices = async () => {
        try {
            setLoading(true);
            const res = await axios.get("/api/pricing");
            if (res.data.success) {
                setPrices(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch prices", error);
            toast.error("Failed to load pricing matrix");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrices();
    }, []);

    const handleSave = async () => {
        if (newRule.price < 0) {
            toast.error("Price cannot be negative");
            return;
        }

        try {
            const res = await axios.post("/api/pricing", newRule);
            if (res.data.success) {
                toast.success("Price rule saved");
                setIsAdding(false);
                fetchPrices();
                setNewRule({ ...newRule, price: 0 }); // Reset price only to keep context
            }
        } catch (error) {
            toast.error("Failed to save price rule");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this pricing rule?")) return;
        try {
            await axios.delete(`/api/pricing/${id}`);
            setPrices(prices.filter(p => p._id !== id));
            toast.success("Rule deleted");
        } catch (error) {
            toast.error("Failed to delete rule");
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Pricing Matrix</h1>
                    <p className="text-gray-500 text-sm">Manage base rates by Category, Level, and Duration.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#004fcb] text-white rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus size={18} /> Add Price Rule
                </button>
            </div>

            {/* Add Rule Form */}
            {isAdding && (
                <div className="mb-8 bg-blue-50/50 border border-blue-100 p-6 rounded-xl animate-fadeIn">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-blue-900">New Pricing Rule</h3>
                        <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select
                                    className="w-full pl-9 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none"
                                    value={newRule.categoryId}
                                    onChange={(e) => setNewRule({ ...newRule, categoryId: e.target.value })}
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Expert Level</label>
                            <div className="relative">
                                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select
                                    className="w-full pl-9 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none"
                                    value={newRule.levelId}
                                    onChange={(e) => setNewRule({ ...newRule, levelId: e.target.value })}
                                >
                                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Duration</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select
                                    className="w-full pl-9 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none"
                                    value={newRule.duration}
                                    onChange={(e) => setNewRule({ ...newRule, duration: Number(e.target.value) as 30 | 60 })}
                                >
                                    {DURATIONS.map(d => <option key={d} value={d}>{d} Mins</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price (INR)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full pl-9 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none font-bold text-gray-700"
                                    value={newRule.price}
                                    onChange={(e) => setNewRule({ ...newRule, price: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                        >
                            <Save size={18} /> Save Rule
                        </button>
                    </div>
                </div>
            )}

            {/* Pricing Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Level</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Duration</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Price (INR)</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading pricing matrix...</td>
                            </tr>
                        ) : prices.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No pricing rules defined. Add one above.</td>
                            </tr>
                        ) : (
                            prices.map((rule) => (
                                <tr key={rule._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{rule.categoryId}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${rule.levelId === 'Expert' ? 'bg-purple-100 text-purple-800' :
                                                rule.levelId === 'Advanced' ? 'bg-blue-100 text-blue-800' :
                                                    rule.levelId === 'Intermediate' ? 'bg-green-100 text-green-800' :
                                                        'bg-gray-100 text-gray-800'
                                            }`}>
                                            {rule.levelId}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{rule.duration} mins</td>
                                    <td className="px-6 py-4 font-bold text-gray-900">₹{rule.price}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => rule._id && handleDelete(rule._id)}
                                            className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PricingMatrix;
