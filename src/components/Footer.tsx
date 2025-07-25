import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, Linkedin, Twitter } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    services: [
      { name: "AI Process Audits", href: "#services" },
      { name: "Custom Development", href: "#services" },
      { name: "Executive Training", href: "#services" },
      { name: "Strategic Consulting", href: "#" }
    ],
    company: [
      { name: "About Us", href: "#about" },
      { name: "Case Studies", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Contact", href: "#contact" }
    ],
    resources: [
      { name: "AI Readiness Assessment", href: "#" },
      { name: "Whitepapers", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Events", href: "#" }
    ]
  };

  return (
    <footer className="bg-gradient-to-br from-foreground to-foreground/90 text-white">
      <div className="container mx-auto px-6 pt-16 pb-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <img 
                src="/lovable-uploads/d9959a5c-d25d-4c34-ad6e-95ffd49addfb.png" 
                alt="aitamate" 
                className="h-8 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-white/80 mb-6 leading-relaxed">
              Leading AI transformation experts helping businesses automate processes, 
              develop custom solutions, and train teams for the future of work.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-white/80">
                <Mail className="w-4 h-4" />
                <span>rj@aitamate.com</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <Phone className="w-4 h-4" />
                <span>+91-9223315977</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <MapPin className="w-4 h-4" />
                <span>4th floor, D-Wing, Modi Business Park, Kasarvadavli, Ghodbunder road, Thane (W) - 400615</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-white/80 hover:text-white transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-white/80 hover:text-white transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-white/80 hover:text-white transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-white/10 rounded-2xl p-8 mb-12">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">Stay Ahead with AI Insights</h3>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              Get the latest AI trends, best practices, and exclusive content delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <Button variant="secondary" size="lg" className="px-8">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        <Separator className="bg-white/20 mb-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-white/80">
            © {currentYear} aitamate. All rights reserved.
          </div>
          
          <div className="flex items-center gap-6">
            <a href="#" className="text-white/80 hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-white/80 hover:text-white transition-colors">
              Terms of Service
            </a>
          </div>

          <div className="flex items-center gap-4">
            <a 
              href="#" 
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a 
              href="#" 
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;