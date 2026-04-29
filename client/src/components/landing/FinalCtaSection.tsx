import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function FinalCtaSection() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="rounded-2xl bg-[#004fcb] text-white p-8 md:p-12 text-center shadow-xl shadow-blue-900/20 relative overflow-hidden [&_h1]:!text-white [&_h2]:!text-white [&_p]:!text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: "24px 24px" }} />
        <div className="relative z-10">
          <h2 className="!text-white text-xl md:text-2xl font-bold mb-2">Ready to ace your next interview?</h2>
          <p className="!text-blue-100 text-sm md:text-base max-w-xl mx-auto mb-8">
            Join Mockeefy, book an expert, and get the practice and feedback you need—without the pressure of the real thing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#004fcb] font-bold rounded-xl hover:bg-blue-50 shadow-lg transition-all"
            >
              Get started free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/signin"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white/15 border-2 border-white/40 text-white font-semibold rounded-xl hover:bg-white/25 transition-all"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
