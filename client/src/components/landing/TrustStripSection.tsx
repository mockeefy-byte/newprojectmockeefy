import { Shield, Star, Video } from "lucide-react";

export default function TrustStripSection() {
  return (
    <section className="border-y border-slate-200/80 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 text-slate-600 text-sm font-medium">
          <span className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#004fcb]" />
            Secure booking
          </span>
          <span className="flex items-center gap-2">
            <Star className="w-5 h-5 text-[#004fcb]" />
            Verified experts only
          </span>
          <span className="flex items-center gap-2">
            <Video className="w-5 h-5 text-[#004fcb]" />
            1:1 video sessions
          </span>
        </div>
      </div>
    </section>
  );
}
