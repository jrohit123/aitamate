import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Code, GraduationCap, ArrowRight, CheckCircle } from "lucide-react";
import circuitBoard from "@/assets/circuit-board.jpg";
import codeMonitor from "@/assets/code-monitor.jpg";
import aiRobot from "@/assets/ai-robot.jpg";

const Services = () => {
  const services = [
    {
      icon: Search,
      title: "AI Process Audits",
      description: "Comprehensive analysis of your current operations to identify AI automation opportunities and optimization potential.",
      image: circuitBoard,
      features: [
        "Current state assessment",
        "AI readiness evaluation", 
        "ROI projections",
        "Implementation roadmap"
      ],
      cta: "Audit My Processes"
    },
    {
      icon: Code,
      title: "Custom AI Development",
      description: "Bespoke AI solutions tailored to your specific business needs, from chatbots to predictive analytics systems.",
      image: codeMonitor,
      features: [
        "Custom AI models",
        "Integration services",
        "Scalable architecture",
        "Ongoing maintenance"
      ],
      cta: "Build My Solution"
    },
    {
      icon: GraduationCap,
      title: "Executive AI Training",
      description: "Strategic training programs designed for leadership teams to understand and leverage AI for competitive advantage.",
      image: aiRobot,
      features: [
        "C-level workshops",
        "Strategic planning",
        "Change management",
        "Best practices"
      ],
      cta: "Train My Team"
    }
  ];

  return (
    <section id="services" className="py-20 bg-gradient-card">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-foreground">Our</span>{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">AI Services</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive AI enablement services designed to transform your business operations and drive sustainable growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Card 
                key={index} 
                className="relative group hover:shadow-large transition-all duration-300 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-primary/10 overflow-hidden"
              >
                {/* Service Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {service.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-base leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:bg-primary group-hover:text-white transition-all duration-300"
                  >
                    {service.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-hero rounded-2xl p-8 md:p-12 text-white">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Business?
          </h3>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join industry leaders who are already leveraging AI to drive innovation and growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" className="text-lg px-8 py-4">
              Schedule Free Consultation
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-white/20 text-white hover:bg-white hover:text-primary">
              View Case Studies
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;