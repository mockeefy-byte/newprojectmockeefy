import { Card, CardContent } from "./ui/card";

const Features = () => {
  const features = [
    {
      icon: "🎓",
      title: "For Students",
      description: "Get real-time interview experience and feedback.",
      details: "Practice with industry professionals and receive detailed feedback to improve your interview skills."
    },
    {
      icon: "🏢",
      title: "For Companies",
      description: "Save time by screening better-prepared candidates.",
      details: "Connect with pre-screened, interview-ready candidates who have practiced with our professional mentors."
    },
    {
      icon: "🧑‍🏫",
      title: "For Mentors",
      description: "Share knowledge, guide freshers, and earn.",
      details: "Use your industry experience to help the next generation while earning additional income."
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Why Choose MockHire?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connecting students, companies, and mentors in a comprehensive interview preparation ecosystem.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:scale-105 smooth-transition card-shadow bg-card">
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-6 group-hover:scale-110 bounce-transition">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-card-foreground mb-4">
                  {feature.title}
                </h3>
                <p className="text-lg text-muted-foreground mb-4">
                  {feature.description}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.details}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;