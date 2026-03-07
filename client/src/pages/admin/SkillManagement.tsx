import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Hexagon, X } from 'lucide-react';
import axios from '../../lib/axios';
import { toast } from 'sonner';

interface Skill {
    id: string; // _id
    _id?: string;
    categoryId: string;
    name: string;
    description: string;
    isActive: boolean;
}

interface Category {
    id: string;
    _id?: string;
    name: string;
}

export default function SkillManagement() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [loading, setLoading] = useState(false);

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isActive: true
    });
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        // Fetch Categories
        const fetchCategories = async () => {
            try {
                const res = await axios.get('/api/categories');
                setCategories(res.data);
            } catch (error) {
                console.error("Error fetching categories", error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (!selectedCategory) {
            setSkills([]);
            return;
        }
        fetchSkills();
    }, [selectedCategory]);

    const fetchSkills = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/skills/category/${selectedCategory}`);
            setSkills(res.data);
        } catch (error) {
            console.error("Error fetching skills", error);
            // setSkills([]); // Keep empty on error
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...formData, categoryId: selectedCategory };

            if (editingId) {
                await axios.put(`/api/skills/${editingId}`, payload);
                toast.success('Skill updated');
            } else {
                await axios.post('/api/skills', payload);
                toast.success('Skill added');
            }

            setShowForm(false);
            setFormData({ name: '', description: '', isActive: true });
            setEditingId(null);
            fetchSkills();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save skill');
        }
    };

    const handleEdit = (skill: Skill) => {
        setEditingId(skill.id || skill._id!);
        setFormData({
            name: skill.name,
            description: skill.description,
            isActive: skill.isActive
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Area you sure?')) return;
        try {
            await axios.delete(`/api/skills/${id}`);
            toast.success('Skill deleted');
            fetchSkills();
        } catch (error) {
            toast.error('Failed to delete skill');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Skill Management</h1>
                    <p className="text-gray-500 mt-1">Define specific skills and competencies for each category.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Sidebar: Categories */}
                    <div className="w-full md:w-64 space-y-2">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Categories</h3>
                        {categories.map((cat, idx) => (
                            <button
                                key={cat.id || cat._id || idx}
                                onClick={() => setSelectedCategory(cat.id || cat._id!)}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${selectedCategory === (cat.id || cat._id)
                                    ? 'bg-[#004fcb] text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Main Content: Skills List */}
                    <div className="flex-1 min-h-[400px]">
                        {selectedCategory ? (
                            <>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-bold text-gray-900">
                                        Skills for {categories.find(c => c.id === selectedCategory)?.name}
                                    </h2>
                                    <button
                                        onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: '', description: '', isActive: true }); }}
                                        className="bg-[#004fcb] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> Add Skill
                                    </button>
                                </div>

                                {showForm && (
                                    <div className="mb-6 bg-gray-50 p-6 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-bold text-gray-800">{editingId ? 'Edit Skill' : 'New Skill'}</h3>
                                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                                        </div>
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Skill Name</label>
                                                <input
                                                    type="text" required
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#004fcb]"
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="e.g. React, System Design, Leadership"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description (Optional)</label>
                                                <textarea
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#004fcb]"
                                                    value={formData.description}
                                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                    placeholder="Brief description of the skill..."
                                                    rows={2}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox" id="isActive"
                                                    checked={formData.isActive}
                                                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                                    className="w-4 h-4 text-[#004fcb] rounded focus:ring-[#004fcb]"
                                                />
                                                <label htmlFor="isActive" className="text-sm text-gray-700 select-none">Active</label>
                                            </div>
                                            <div className="flex justify-end gap-3 pt-2">
                                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-200 rounded-lg">Cancel</button>
                                                <button type="submit" className="px-6 py-2 bg-[#004fcb] text-white rounded-lg font-bold hover:bg-blue-700">Save Skill</button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    {loading ? (
                                        <p className="text-gray-500 text-center py-8">Loading skills...</p>
                                    ) : skills.length === 0 ? (
                                        <p className="text-gray-400 text-center py-12 italic">No skills defined for this category yet.</p>
                                    ) : (
                                        skills.map((skill, idx) => (
                                            <div key={skill.id || skill._id || idx} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-blue-100 hover:shadow-sm transition-all group">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-blue-50 text-[#004fcb] rounded-lg">
                                                        <Hexagon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900">{skill.name}</h4>
                                                        {skill.description && <p className="text-xs text-gray-500">{skill.description}</p>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleEdit(skill)} className="p-2 text-gray-400 hover:text-[#004fcb] hover:bg-gray-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDelete(skill.id || skill._id!)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center p-8 border-2 border-dashed border-gray-100 rounded-xl">
                                <Hexagon className="w-12 h-12 mb-4 opacity-20" />
                                <p>Select a category from the sidebar<br />to manage its skills.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
