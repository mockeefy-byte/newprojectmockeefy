import { useState, useEffect } from 'react';
import { Plus, Trash2, Mail, Phone, Building } from 'lucide-react';
import axios from '../../lib/axios';
import { toast } from 'sonner';

interface HrContact {
    id: string; // or _id
    _id?: string;
    categoryId: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    designation: string;
}

interface Category {
    id: string;
    name: string;
}

export default function HrContacts() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [contacts, setContacts] = useState<HrContact[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<Partial<HrContact>>({
        categoryId: '',
        name: '',
        email: '',
        phone: '',
        company: '',
        designation: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [catsRes, contactsRes] = await Promise.all([
                axios.get('/api/categories'),
                axios.get('/api/hr-contacts')
            ]);
            setCategories(catsRes.data);
            setContacts(contactsRes.data);
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('/api/hr-contacts', formData);
            toast.success('HR Contact added successfully');
            setShowForm(false);
            setFormData({ categoryId: '', name: '', email: '', phone: '', company: '', designation: '' });
            fetchData(); // Refresh list
        } catch (error) {
            console.error(error);
            toast.error('Failed to add contact');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to remove this contact?")) return;
        try {
            await axios.delete(`/api/hr-contacts/${id}`);
            toast.success('Contact removed');
            setContacts(contacts.filter(c => (c._id || c.id) !== id));
        } catch (error) {
            toast.error('Failed to delete contact');
        }
    };

    const getCategoryName = (catId: string) => categories.find(c => c.id === catId)?.name || 'Unknown';

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 min-h-[calc(100vh-8rem)] space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">HR Connect</h1>
                    <p className="text-gray-500 mt-1">Manage corporate HR contacts securely linked to specific categories.</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-[#004fcb] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add New Contact
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Add Corporate Contact</h3>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                                <select
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#004fcb]"
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                >
                                    <option value="">Select Category</option>
                                    {Array.isArray(categories) && categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                                    <input
                                        required type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#004fcb]"
                                        value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Designation</label>
                                    <input
                                        type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#004fcb]"
                                        value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Company</label>
                                <input
                                    required type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#004fcb]"
                                    value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                                    <input
                                        required type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#004fcb]"
                                        value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
                                    <input
                                        type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#004fcb]"
                                        value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg font-medium">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-[#004fcb] text-white rounded-lg font-bold hover:bg-blue-700">Save Contact</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Contacts List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-12 text-gray-500">Loading contacts...</div>
                ) : (Array.isArray(contacts) ? contacts : []).map(contact => (
                    <div key={contact.id || contact._id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow group relative">
                        <button
                            onClick={() => handleDelete(contact.id || contact._id!)}
                            className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#004fcb]">
                                <Building className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{contact.name}</h3>
                                <p className="text-xs text-gray-500">{contact.designation}</p>
                                <p className="text-xs font-bold text-[#004fcb] mt-1">{contact.company}</p>
                            </div>
                        </div>

                        <div className="space-y-2 pt-4 border-t border-gray-50">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="w-4 h-4 text-gray-400" />
                                {contact.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="w-4 h-4 text-gray-400" />
                                {contact.phone || 'N/A'}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium text-gray-400 mt-2 bg-gray-50 py-1 px-2 rounded w-fit">
                                Linked to: {getCategoryName(contact.categoryId)}
                            </div>
                        </div>
                    </div>
                ))}
                {!loading && contacts.length === 0 && (
                    <div className="col-span-full py-16 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-500 font-medium">No HR contacts found.</p>
                        <button onClick={() => setShowForm(true)} className="text-[#004fcb] text-sm font-bold mt-2 hover:underline">Add your first contact</button>
                    </div>
                )}
            </div>
        </div>
    );
}
