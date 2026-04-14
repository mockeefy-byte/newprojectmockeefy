import { useRef, useState, useEffect } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { MentorJobCard, MentorProfile } from "./MentorJobCard";

interface CategorySectionProps {
    title: string;
    profiles: MentorProfile[];
    onSeeAll?: () => void;
}

export const CategorySection = ({ title, profiles, onSeeAll }: CategorySectionProps) => {
    const rowRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const checkScroll = () => {
        if (rowRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [profiles]);

    const scroll = (direction: 'left' | 'right') => {
        if (rowRef.current) {
            const scrollAmount = 320;
            rowRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
            setTimeout(checkScroll, 350);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!rowRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - rowRef.current.offsetLeft);
        setScrollLeft(rowRef.current.scrollLeft);
    };

    const handleMouseLeave = () => setIsDragging(false);
    const handleMouseUp = () => setIsDragging(false);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !rowRef.current) return;
        e.preventDefault();
        const x = e.pageX - rowRef.current.offsetLeft;
        const walk = (x - startX) * 1.5;
        rowRef.current.scrollLeft = scrollLeft - walk;
        checkScroll();
    };

    return (
        <section className="w-full max-w-full mb-8 bg-slate-50/40 border border-slate-200/80 rounded-2xl p-0 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-300 group/section">
            {/* Header - Unified with Card */}
            <div className="flex items-center justify-between px-4 sm:px-5 md:px-6 py-3 border-b border-slate-100 bg-slate-50/10">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-elite-blue shadow-[0_0_8px_rgba(0,79,203,0.5)] shrink-0" aria-hidden />
                    <div className="min-w-0">
                        <h2 className="font-elite leading-none text-gray-900 truncate">{title}</h2>
                        <span className="block text-[11px] text-slate-500 font-medium mt-1 truncate">
                            Browse experts in {title}{profiles?.length ? ` • ${profiles.length} available` : ""}
                        </span>
                    </div>
                </div>
                {onSeeAll && (
                    <button
                        onClick={onSeeAll}
                        className="text-xs font-semibold text-elite-blue hover:text-white hover:bg-elite-blue border border-slate-200 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                    >
                        See all <ChevronRight size={14} strokeWidth={2.5} />
                    </button>
                )}
            </div>

            {/* Scroll Wrapper - fits to sides */}
            <div className="relative px-3 sm:px-4 md:px-5 pt-6 md:pt-8 pb-4 md:pb-5">
                {/* Arrows overlay the scroll area at edges (no gap) */}
                <div className="absolute top-1/2 -translate-y-1/2 left-1 right-1 md:left-2 md:right-2 flex justify-between pointer-events-none z-20">
                    <button
                        onClick={() => scroll('left')}
                        className={`
                            pointer-events-auto
                            w-9 h-9 md:w-10 md:h-10 bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg rounded-xl md:rounded-2xl
                            flex items-center justify-center text-slate-500 hover:text-elite-blue hover:border-slate-300 transition-all
                            ${!showLeftArrow ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100'}
                            hidden md:flex shrink-0
                        `}
                    >
                        <ChevronLeft size={18} strokeWidth={3} />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className={`
                            pointer-events-auto
                            w-9 h-9 md:w-10 md:h-10 bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg rounded-xl md:rounded-2xl
                            flex items-center justify-center text-slate-500 hover:text-elite-blue hover:border-slate-300 transition-all
                            ${!showRightArrow ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100'}
                            hidden md:flex shrink-0
                        `}
                    >
                        <ChevronRight size={18} strokeWidth={3} />
                    </button>
                </div>

                {/* Mobile: vertical stack. Desktop: horizontal scroll, tight spacing no gap */}
                <div
                    ref={rowRef}
                    className={`
                        flex flex-col gap-4 md:flex-row md:overflow-x-auto pl-0 pr-0 md:pl-0 md:pr-0 pb-1 scrollbar-hide md:snap-x md:snap-mandatory
                        ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}
                    `}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    onScroll={checkScroll}
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
                >
                    {profiles.map((profile) => (
                        <div key={profile.id} className="snap-start shrink-0 w-full md:w-[300px] flex md:mr-5 last:mr-0">
                            <MentorJobCard mentor={profile} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
