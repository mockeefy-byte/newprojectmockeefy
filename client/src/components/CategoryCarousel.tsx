import { useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { FolderKanban, Code, Server, Database, Brain, Smartphone, Globe, Cloud, Lock } from 'lucide-react'
import axios from '../lib/axios'
import { useNavigate } from 'react-router-dom'

interface Category {
    _id: string;
    name: string;
    description: string;
    amount: number;
    status: "Active" | "Inactive";
    type: string;
}

// Map icons roughly by name (simple heuristic)
const getIconForCategory = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('frontend') || n.includes('web')) return Globe;
    if (n.includes('backend') || n.includes('server')) return Server;
    if (n.includes('full stack')) return Code;
    if (n.includes('data')) return Database;
    if (n.includes('ai') || n.includes('machine') || n.includes('intelligence')) return Brain;
    if (n.includes('mobile') || n.includes('app') || n.includes('android') || n.includes('ios')) return Smartphone;
    if (n.includes('cloud') || n.includes('aws')) return Cloud;
    if (n.includes('security')) return Lock;
    return FolderKanban;
}

interface CategoryCarouselProps {
    onSelectCategory?: (category: string) => void;
    selectedCategory?: string;
}

export const CategoryCarousel = ({ onSelectCategory, selectedCategory }: CategoryCarouselProps) => {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    const [emblaRef] = useEmblaCarousel({
        loop: false,
        align: 'start',
        containScroll: 'trimSnaps',
        dragFree: true
    })



    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('/api/categories');
                if (Array.isArray(response.data)) {
                    // Filter only active categories if needed, for now showing all active
                    const active = response.data.filter((c: Category) => c.status === 'Active');
                    setCategories(active.length > 0 ? active : response.data);
                }
            } catch (error) {
                console.error("Failed to fetch categories", error);
            } finally {
                setLoading(false);
            }
        }
        fetchCategories()
    }, [])



    if (loading) {
        return <div className="h-24 w-full bg-gray-100/50 animate-pulse rounded-xl mb-8"></div>
    }

    if (categories.length === 0) return null;

    const handleCategoryClick = (catName: string) => {
        if (onSelectCategory) {
            onSelectCategory(catName);
        } else {
            navigate(`/mentors?category=${encodeURIComponent(catName)}`);
        }
    };

    return (
        <div className="relative mb-6 group pl-1">


            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex -ml-3 py-1">
                    {/* Add "All" option if in selection mode */}
                    {onSelectCategory && (
                        <div className="pl-3 flex-[0_0_100px] min-w-0">
                            <button
                                onClick={() => handleCategoryClick("All")}
                                className={`w-full h-full flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 group/card text-center
                                    ${selectedCategory === "All"
                                        ? 'bg-gray-900 border-gray-900 shadow-md text-white'
                                        : 'bg-white border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 hover:-translate-y-1'
                                    }`}
                            >
                                <div className={`w-8 h-8 mb-2 rounded-full flex items-center justify-center transition-colors
                                    ${selectedCategory === "All" ? 'bg-white/20' : 'bg-gray-100 group-hover/card:bg-indigo-50'}`}>
                                    <FolderKanban className={`w-4 h-4 ${selectedCategory === "All" ? 'text-white' : 'text-gray-600'}`} />
                                </div>
                                <h3 className={`text-xs font-bold line-clamp-1 ${selectedCategory === "All" ? 'text-white' : 'text-gray-900'}`}>All</h3>
                            </button>
                        </div>
                    )}

                    {categories.map((cat) => {
                        const Icon = getIconForCategory(cat.name);
                        const isSelected = selectedCategory === cat.name;

                        return (
                            <div className="pl-3 flex-[0_0_140px] min-w-0" key={cat._id}>
                                <button
                                    onClick={() => handleCategoryClick(cat.name)}
                                    className={`w-full h-full flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 group/card text-center
                                        ${isSelected
                                            ? 'bg-gray-900 border-gray-900 shadow-lg shadow-gray-200 text-white transform scale-105'
                                            : 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 hover:-translate-y-1'
                                        }`}
                                >
                                    <div className={`w-8 h-8 mb-2 rounded-full flex items-center justify-center transition-colors
                                        ${isSelected ? 'bg-white/20' : 'bg-blue-50 group-hover/card:bg-blue-100'}`}>
                                        <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                                    </div>
                                    <h3 className={`text-xs font-bold line-clamp-1 mb-0.5 ${isSelected ? 'text-white' : 'text-gray-900'}`}>{cat.name}</h3>
                                    <p className={`text-[9px] font-medium ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                                        {Math.floor(Math.random() * 20) + 5} Mentors
                                    </p>
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
