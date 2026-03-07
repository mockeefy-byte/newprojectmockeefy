import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MentorJobCard, MentorProfile } from "./MentorJobCard";

interface ExpertsCarouselProps {
    title?: string;
    profiles: MentorProfile[];
    onSeeAll?: () => void;
}

export const ExpertsCarousel = ({ title, profiles, onSeeAll }: ExpertsCarouselProps) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: 'start',
        containScroll: 'trimSnaps',
        dragFree: true
    });
    const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
    const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    const onSelect = useCallback((emblaApi: any) => {
        setPrevBtnEnabled(emblaApi.canScrollPrev());
        setNextBtnEnabled(emblaApi.canScrollNext());
    }, []);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect(emblaApi);
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
    }, [emblaApi, onSelect]);

    if (profiles.length === 0) return null;

    return (
        <div className="relative group mb-8 md:bg-white md:border md:border-slate-200/60 md:rounded-2xl md:p-6 md:shadow-sm md:hover:shadow-md transition-all duration-300 md:mx-4 lg:mx-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex flex-col gap-0.5">
                    {title ? (
                        <>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Top Rated Mentors</p>
                        </>
                    ) : (
                        <h2 className="text-xl font-bold text-gray-900">
                            {profiles.length} {profiles.length === 1 ? 'Expert' : 'Experts'} Found
                        </h2>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {onSeeAll && (
                        <button
                            onClick={onSeeAll}
                            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors group/btn px-3 py-1.5 rounded-full hover:bg-indigo-50"
                        >
                            View all <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                        </button>
                    )}

                    {/* Carousel Controls */}
                    <div className="flex gap-2">
                        <button
                            className={`p-2 w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 transition-all ${prevBtnEnabled ? 'hover:bg-indigo-50 hover:border-indigo-200 text-gray-600 hover:text-indigo-600 cursor-pointer' : 'opacity-30 cursor-default'}`}
                            onClick={scrollPrev}
                            disabled={!prevBtnEnabled}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            className={`p-2 w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 transition-all ${nextBtnEnabled ? 'hover:bg-indigo-50 hover:border-indigo-200 text-gray-600 hover:text-indigo-600 cursor-pointer' : 'opacity-30 cursor-default'}`}
                            onClick={scrollNext}
                            disabled={!nextBtnEnabled}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Carousel Container - padding so cards don't sit flush with edges */}
            <div className="overflow-hidden md:mx-0 pb-8" ref={emblaRef}>
                <div className="flex gap-5 md:gap-6 py-2 px-3 md:px-4">
                    {profiles.map((profile) => (
                        <div key={profile.id} className="flex-[0_0_300px] md:flex-[0_0_340px] min-w-0 flex shrink-0">
                            <MentorJobCard mentor={profile} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
