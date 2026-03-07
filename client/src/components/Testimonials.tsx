import { Card, CardContent } from "@/components/ui/card";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Ananya, Final Year Student",
      quote: "MockHire gave me confidence before my campus interview!",
      details: "The feedback was incredibly detailed and helped me identify my weak points. I felt so much more prepared for my actual interviews.",
      role: "Computer Science Student",
      company: "Hired at TCS"
    },
    {
      name: "Rahul, HR Professional", 
      quote: "Loved mentoring and sharing my industry experience.",
      details: "It's rewarding to help fresh graduates prepare for their careers. The platform makes it easy to connect and provide meaningful guidance.",
      role: "Senior HR Manager",
      company: "10+ years experience"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            What People Say
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real stories from students and mentors who have transformed their careers with MockHire.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="group hover:scale-105 smooth-transition elegant-shadow bg-card">
              <CardContent className="p-8">
                <div className="text-4xl text-accent mb-4">"</div>
                <blockquote className="text-xl text-card-foreground font-medium mb-6 leading-relaxed">
                  {testimonial.quote}
                </blockquote>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {testimonial.details}
                </p>
                <div className="border-t border-border pt-4">
                  <div className="font-semibold text-card-foreground">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </div>
                  <div className="text-sm text-accent font-medium">
                    {testimonial.company}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;