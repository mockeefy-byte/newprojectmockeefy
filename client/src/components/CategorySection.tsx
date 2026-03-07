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
        <section className="mb-8 bg-white border border-slate-200/80 rounded-2xl p-0 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-300 group/section">
            {/* Header - Unified with Card */}
            <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-slate-100 bg-slate-50/10">
                <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-elite-blue shadow-[0_0_8px_rgba(0,79,203,0.5)]"></div>
                    <div>
                        <h2 className="font-elite leading-none">{title}</h2>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5">Elite Simulation Experts</p>
                    </div>
                </div>
                {onSeeAll && (
                    <button
                        onClick={onSeeAll}
                        className="text-[10px] font-black text-elite-blue hover:text-white hover:bg-elite-blue border border-blue-100 px-4 py-1.5 rounded-xl transition-all tracking-tight flex items-center gap-1.5 shadow-sm active:scale-95"
                    >
                        Directory <ChevronRight size={10} strokeWidth={3} />
                    </button>
                )}
            </div>

            {/* Scroll Wrapper - clear space from section edges */}
            <div className="relative px-5 md:px-6 pt-8 pb-5 md:pt-10 md:pb-6">
                {/* Navigation Arrows - outside card area */}
                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-1 md:px-2 pointer-events-none z-20">
                    <button
                        onClick={() => scroll('left')}
                        className={`
                            pointer-events-auto
                            w-10 h-10 bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg rounded-2xl
                            flex items-center justify-center text-slate-500 hover:text-elite-blue hover:border-slate-300 transition-all
                            ${!showLeftArrow ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100'}
                            hidden md:flex
                        `}
                    >
                        <ChevronLeft size={18} strokeWidth={3} />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className={`
                            pointer-events-auto
                            w-10 h-10 bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg rounded-2xl
                            flex items-center justify-center text-slate-500 hover:text-elite-blue hover:border-slate-300 transition-all
                            ${!showRightArrow ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100'}
                            hidden md:flex
                        `}
                    >
                        <ChevronRight size={18} strokeWidth={3} />
                    </button>
                </div>

                <div
                    ref={rowRef}
                    className={`
                        flex overflow-x-auto pl-2 pr-2 md:pl-3 md:pr-3 pb-1 scrollbar-hide snap-x snap-mandatory
                        ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}
                    `}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    onScroll={checkScroll}
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {profiles.map((profile) => (
                        <div key={profile.id} className="snap-start shrink-0 w-[280px] md:w-[300px] flex mr-6 md:mr-8 last:mr-0">
                            <MentorJobCard mentor={profile} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
