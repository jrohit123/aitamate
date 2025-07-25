import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Target, Lightbulb, TrendingUp } from "lucide-react";
import officeBuildingImg from "@/assets/office-building.jpg";

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Precision",
      description: "Every AI solution is meticulously crafted to meet your specific business objectives."
    },
    {
      icon: Users,
      title: "Partnership",
      description: "We work as an extension of your team, ensuring seamless integration and adoption."
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "Cutting-edge AI technologies combined with proven business methodologies."
    },
    {
      icon: TrendingUp,
      title: "Results",
      description: "Measurable outcomes that drive real business value and competitive advantage."
    }
  ];

  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <div className="mb-6">
              <Badge variant="secondary" className="mb-4 px-4 py-2">
                About aitamate
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="text-foreground">Leading the</span>{" "}
                <span className="bg-gradient-hero bg-clip-text text-transparent">AI Revolution</span>
              </h2>
            </div>
            
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                aitamate is at the forefront of AI-driven business transformation, helping 
                organizations harness the power of artificial intelligence to streamline 
                operations, enhance decision-making, and accelerate growth.
              </p>
              <p>
                Our team of AI specialists, business analysts, and strategic consultants 
                work collaboratively with C-level executives to identify opportunities, 
                implement solutions, and ensure sustainable AI adoption across your organization.
              </p>
              <p>
                From comprehensive process audits to custom AI development and executive 
                training, we provide end-to-end AI enablement services that deliver 
                measurable results and lasting competitive advantage.
              </p>
            </div>

            <div className="mt-8">
              <Button variant="hero" size="lg" className="text-lg px-8 py-4">
                Learn More About Our Approach
              </Button>
            </div>
          </div>

          {/* Values Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div 
                  key={index}
                  className="group p-6 bg-white/80 backdrop-blur-sm border border-primary/10 rounded-xl hover:shadow-medium transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 group-hover:animate-pulse-glow transition-all duration-300">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Professional Image Section */}
        <div className="mt-20 grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden shadow-large group">
              <img 
                src={officeBuildingImg} 
                alt="Modern office building representing professional excellence and innovation"
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-primary/10 to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <div className="text-sm font-medium opacity-90 mb-1">Excellence in AI</div>
                <div className="text-xl font-bold">Professional Solutions</div>
              </div>
            </div>
          </div>
          
          <div className="order-1 lg:order-2">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Professional Excellence Meets AI Innovation
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Located in the heart of Mumbai's business district, our team operates from state-of-the-art facilities 
              equipped with the latest AI development tools and collaborative spaces designed for innovation.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-muted-foreground">Mumbai-based AI specialists</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-muted-foreground">Global client portfolio</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-muted-foreground">Enterprise-grade security</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-gradient-card rounded-2xl p-8 md:p-12">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Proven Track Record
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our results speak for themselves - delivering measurable AI transformation across industries.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">98%</div>
              <div className="text-muted-foreground font-medium">Client Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">150+</div>
              <div className="text-muted-foreground font-medium">Projects Delivered</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">45%</div>
              <div className="text-muted-foreground font-medium">Avg. Cost Reduction</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">3x</div>
              <div className="text-muted-foreground font-medium">ROI Achievement</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;