import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Star } from 'lucide-react';
import axios from '../../lib/axios';
import { toast } from 'sonner';

interface Category {
    id: string;
    name: string;
    description?: string;
}

interface Skill {
    id: string;
    name: string;
    description?: string; // e.g. "React", "Node"
}

interface Expert {
    _id: string;
    name: string;
    title: string;
    company: string;
    price: number;
    rating?: number;
    skills: string[]; // Names of matched skills
}

export default function BookingSearch() {
    // Steps: 0=Category, 1=Skill, 2=Level/Duration, 3=Results
    const [step, setStep] = useState(0);
    const navigate = useNavigate();

    const [categories, setCategories] = useState<Category[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [experts, setExperts] = useState<Expert[]>([]);

    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
    const [filters, setFilters] = useState({
        level: 'Intermediate',
        duration: 60
    });

    const [loading, setLoading] = useState(false);

    // Initial Load
    useEffect(() => {
        const fetchCats = async () => {
            try {
                const res = await axios.get('/api/categories');
                setCategories(res.data);
            } catch (e) {
                console.error(e);
            }
        };
        fetchCats();
    }, []);

    // Fetch Skills
    const selectCategory = async (cat: Category) => {
        setSelectedCategory(cat);
        setLoading(true);
        try {
            const res = await axios.get(`/api/skills/category/${cat.id}`);
            if (res.data.length > 0) {
                setSkills(res.data);
                setStep(1);
            } else {
                toast.info("No detailed skills found, proceeding with general category.");
                setSkills([]);
                setStep(2); // Skip skill step
            }
        } catch (e) {
            toast.error("Failed to load skills");
        } finally {
            setLoading(false);
        }
    };

    // Find Experts
    const searchExperts = async () => {
        setLoading(true);
        try {
            const payload = {
                category: selectedCategory?.name,
                skillId: selectedSkill ? (selectedSkill.id || (selectedSkill as any)._id) : undefined,
                level: filters.level,
                duration: filters.duration
            };

            const res = await axios.post('/api/expert/search', payload);
            setExperts(res.data);
            setStep(3);
        } catch (e) {
            console.error(e);
            toast.error("Search failed");
            setExperts([]);
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setStep(0);
        setSelectedCategory(null);
        setSelectedSkill(null);
        setExperts([]);
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto py-8">
            {/* Header / Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                <button onClick={reset} className="hover:text-[#004fcb]">Home</button>
                <ChevronRight className="w-4 h-4" />
                <button onClick={() => setStep(0)} className={step === 0 ? "font-bold text-[#004fcb]" : ""}>Category</button>
                {selectedCategory && (
                    <>
                        <ChevronRight className="w-4 h-4" />
                        <span className={step === 1 ? "font-bold text-[#004fcb]" : ""}>{selectedCategory.name}</span>
                    </>
                )}
                {selectedSkill && (
                    <>
                        <ChevronRight className="w-4 h-4" />
                        <span className={step === 2 ? "font-bold text-[#004fcb]" : ""}>{selectedSkill.name}</span>
                    </>
                )}
            </div>

            {/* STEP 0: Categories */}
            {step === 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">What do you want to practice?</h1>
                    <p className="text-gray-500 text-center mb-10">Select a domain to find relevant experts.</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => selectCategory(cat)}
                                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all text-left flex flex-col gap-4 group"
                            >
                                <div className="p-3 bg-blue-50 w-fit rounded-xl group-hover:bg-[#004fcb] group-hover:text-white transition-colors">
                                    <Search className="w-6 h-6 text-[#004fcb] group-hover:text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 mb-1">{cat.name}</h3>
                                    <p className="text-sm text-gray-500">Practice interviews for {cat.name} roles.</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* STEP 1: Skills */}
            {step === 1 && (
                <div className="animate-in fade-in slide-in-from-right-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Select a Focus Area</h1>
                    <p className="text-gray-500 mb-8">Refine your search within {selectedCategory?.name}.</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {skills.map(skill => (
                            <button
                                key={skill.id}
                                onClick={() => { setSelectedSkill(skill); setStep(2); }}
                                className="p-4 bg-white border border-gray-200 rounded-xl hover:border-[#004fcb] hover:bg-blue-50/30 transition-all font-medium text-gray-700 text-center"
                            >
                                {skill.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* STEP 2: Filters */}
            {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-8 max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Preferences</h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Experience Level</label>
                            <div className="grid grid-cols-3 gap-3">
                                {['Beginner', 'Intermediate', 'Advanced'].map(l => (
                                    <button
                                        key={l}
                                        onClick={() => setFilters({ ...filters, level: l })}
                                        className={`py-3 rounded-lg text-sm font-medium border ${filters.level === l ? 'bg-[#004fcb] text-white border-[#004fcb]' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Duration</label>
                            <div className="grid grid-cols-2 gap-3">
                                {[30, 60].map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setFilters({ ...filters, duration: d })}
                                        className={`py-3 rounded-lg text-sm font-medium border ${filters.duration === d ? 'bg-[#004fcb] text-white border-[#004fcb]' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {d} Minutes
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={searchExperts}
                            className="w-full py-4 bg-[#004fcb] text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all mt-4"
                        >
                            Find Experts
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 3: Results */}
            {step === 3 && (
                <div className="animate-in fade-in slide-in-from-bottom-8">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Found {experts.length} Experts</h2>
                            <p className="text-gray-500">Matching <b>{selectedSkill?.name}</b> • {filters.level}</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Filter</button>
                            <button className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Sort: Recommended</button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-12">Loading...</div>
                        ) : experts.map(expert => (
                            <div key={expert._id} className="bg-white p-5 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-6 items-start md:items-center hover:shadow-md transition-shadow">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl font-bold text-gray-400">
                                    {expert.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900">{expert.name}</h3>
                                    <p className="text-sm text-gray-600">{expert.title} at {expert.company}</p>
                                    <div className="flex gap-2 mt-2">
                                        {expert.skills.map(s => (
                                            <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded font-medium">{s}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-right min-w-[120px]">
                                    <div className="flex items-center justify-end gap-1 text-amber-500 font-bold text-sm mb-1">
                                        <Star className="w-4 h-4 fill-current" /> {expert.rating}
                                    </div>
                                    <p className="text-xl font-bold text-gray-900">₹{expert.price}</p>
                                    <p className="text-xs text-gray-400 mb-3">per session</p>
                                    <button
                                        onClick={() => {
                                            navigate('/book-session', {
                                                state: {
                                                    expertId: expert._id,
                                                    price: expert.price,
                                                    duration: filters.duration,
                                                    skill: selectedSkill?.name, // Pass selected skill name
                                                    level: filters.level
                                                }
                                            });
                                        }}
                                        className="w-full px-4 py-2 bg-[#004fcb] text-white text-sm font-bold rounded-lg hover:bg-blue-700"
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
