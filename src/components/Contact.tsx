import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Message Sent Successfully",
        description: "We'll get back to you within 24 hours.",
      });

      setFormData({
        name: "",
        email: "",
        company: "",
        message: ""
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      details: "rj@aitamate.com",
      action: "mailto:rj@aitamate.com"
    },
    {
      icon: Phone,
      title: "Phone",
      details: "+91-9223315977",
      action: "tel:+919223315977"
    },
    {
      icon: MapPin,
      title: "Office",
      details: "Thane (W), Mumbai - 400615",
      action: "#"
    }
  ];

  return (
    <section id="contact" className="py-20 bg-gradient-card">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-foreground">Get in</span>{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">Touch</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Ready to transform your business with AI? Let's discuss your specific needs and create a customized solution.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-primary/10 shadow-large">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-foreground">
                  Send us a message
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Fill out the form below and we'll get back to you within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                        Full Name *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full"
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-foreground mb-2">
                      Company
                    </label>
                    <Input
                      id="company"
                      name="company"
                      type="text"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full"
                      placeholder="Your Company"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full min-h-[120px]"
                      placeholder="Tell us about your AI needs and goals..."
                    />
                  </div>
                  <Button 
                    type="submit" 
                    variant="hero" 
                    size="lg" 
                    className="w-full text-lg py-4"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send Message"}
                    <Send className="w-5 h-5 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="bg-gradient-hero text-white border-0 shadow-large">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  Let's Talk AI
                </CardTitle>
                <CardDescription className="text-white/80">
                  Connect with our AI experts to discuss your transformation journey.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {contactInfo.map((info, index) => {
                  const IconComponent = info.icon;
                  return (
                    <a
                      key={index}
                      href={info.action}
                      className="flex items-center gap-4 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 group"
                    >
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{info.title}</div>
                        <div className="text-white/80">{info.details}</div>
                      </div>
                    </a>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-primary/10 shadow-medium">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground">
                  Quick Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Need immediate assistance? Our AI experts are standing by.
                </p>
                <Button variant="outline" className="w-full">
                  Schedule a Call
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;