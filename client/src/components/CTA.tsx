import { Button } from "@/components/ui/button";

const CTA = () => {
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="text-xl mb-12 opacity-90 leading-relaxed">
            Join thousands of successful candidates who transformed their interview skills with MockHire.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button variant="cta" size="lg" className="text-lg px-8 py-4">
              Start Practicing
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10">
              Join as Mentor
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">500+</div>
              <div className="text-sm opacity-80">Students Trained</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">50+</div>
              <div className="text-sm opacity-80">Expert Mentors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">95%</div>
              <div className="text-sm opacity-80">Success Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;