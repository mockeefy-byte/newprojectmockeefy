import { Button } from "../components/ui/button";
import heroImage from "../assets/hero-interview.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Professional interview setting with confident students and HR professionals"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-gradient"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black text-primary-foreground mb-6 leading-tight tracking-tight">
            Your First Interview
            <span className="block text-elite-blue">Shouldn't Be the Real One</span>
          </h1>

          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-12 font-medium leading-relaxed">
            Practice with real HR & IT professionals. Gain confidence. Land your dream job.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button size="lg" className="text-lg px-8 py-4 bg-elite-blue hover:bg-blue-600 text-white shadow-lg shadow-blue-900/20 transition-all duration-300 font-black tracking-tight rounded-2xl">
              Book a Mock Interview
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 bg-white/5 text-white border-2 border-white/20 hover:bg-elite-blue hover:border-elite-blue hover:text-white backdrop-blur-sm transition-all duration-300 font-black tracking-tight rounded-2xl">
              Join as HR/Trainer
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-primary-foreground/70">
        <div className="animate-bounce">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default Hero;