import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FilterItem {
    id: string;
    name: string;
}

interface FilterScrollStripProps {
    items: FilterItem[];
    selectedItem: string;
    onSelect: (id: string) => void;
    isCategory?: boolean;
}

const FilterScrollStrip: React.FC<FilterScrollStripProps> = ({
    items,
    selectedItem,
    onSelect,
    isCategory = false
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        const timer = setTimeout(checkScroll, 100);
        window.addEventListener('resize', checkScroll);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', checkScroll);
        };
    }, [items]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 200;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
            setTimeout(checkScroll, 300);
        }
    };

    return (
        <div className="relative flex items-center group/filters w-full max-w-full">
            {/* Left Gradient & Arrow */}
            {showLeftArrow && (
                <div className="absolute left-0 z-10 flex items-center h-full bg-gradient-to-r from-white via-white/80 to-transparent pr-8 pl-0">
                    <button
                        onClick={() => scroll('left')}
                        className="p-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-[#004fcb] shadow-md transition-all hover:scale-110"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Scroll Container */}
            <div
                ref={scrollRef}
                onScroll={checkScroll}
                className="flex gap-3 overflow-x-auto scrollbar-hide py-1 px-1 w-full mask-fade-edges scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                <button
                    onClick={() => onSelect("All")}
                    className={`shrink-0 px-5 py-2 rounded-full text-sm font-semibold border transition-all whitespace-nowrap ${selectedItem === "All" || !selectedItem || selectedItem === "all"
                        ? "bg-[#004fcb] border-[#004fcb] text-white shadow-lg shadow-blue-500/20"
                        : "bg-white border-gray-200 text-gray-600 hover:border-[#004fcb] hover:text-[#004fcb]"
                        }`}
                >
                    All {isCategory ? 'Categories' : ''}
                </button>
                {items.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onSelect(item.id)}
                        className={`shrink-0 px-5 py-2 rounded-full text-sm font-semibold border transition-all whitespace-nowrap ${selectedItem === item.id
                            ? "bg-[#004fcb] border-[#004fcb] text-white shadow-lg shadow-blue-500/20"
                            : "bg-white border-gray-200 text-gray-600 hover:border-[#004fcb] hover:text-[#004fcb]"
                            }`}
                    >
                        {item.name}
                    </button>
                ))}
            </div>

            {/* Right Gradient & Arrow */}
            {showRightArrow && (
                <div className="absolute right-0 z-10 flex items-center justify-end h-full bg-gradient-to-l from-white via-white/80 to-transparent pl-8 pr-0">
                    <button
                        onClick={() => scroll('right')}
                        className="p-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-[#004fcb] shadow-md transition-all hover:scale-110"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default FilterScrollStrip;
