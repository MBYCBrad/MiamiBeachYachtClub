import { Link } from "wouter";
import { Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-20 bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-5 gap-8 mb-12">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <img 
              src="/api/media/MBYC-LOGO-WHITE_1751029522037.png" 
              alt="MBYC" 
              className="w-32 h-32 mb-4"
            />
            <p className="text-gray-400">
              Where luxury meets the ocean. Experience yachting redefined.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/fleet" className="text-gray-400 hover:text-white transition-colors">Our Fleet</Link></li>
              <li><Link href="/events" className="text-gray-400 hover:text-white transition-colors">Events</Link></li>
              <li><Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Membership</Link></li>
              <li><Link href="/how-it-works" className="text-gray-400 hover:text-white transition-colors">How It Works</Link></li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/invest" className="text-gray-400 hover:text-white transition-colors">Investors</Link></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-400">
                <Phone className="w-4 h-4" />
                <a href="tel:786-981-3875" className="hover:text-purple-400 transition-colors">786-981-3875</a>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Mail className="w-4 h-4" />
                <a href="mailto:membership@mbyc.miami" className="hover:text-purple-400 transition-colors">membership@mbyc.miami</a>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <MapPin className="w-4 h-4 mt-0.5" />
                <div>
                  300 Alton Road, Suite 305b<br />
                  Miami Beach, Florida 33139<br />
                  United States
                </div>
              </li>
            </ul>
          </div>
          
          {/* Opening Hours */}
          <div>
            <h4 className="text-white font-semibold mb-4">Opening Hours</h4>
            <div className="space-y-2 text-gray-400">
              <div className="flex gap-4">
                <span className="w-20">Mon - Fri:</span>
                <span>9am - 6pm</span>
              </div>
              <div className="flex gap-4">
                <span className="w-20">Sat:</span>
                <span>10am - 6pm</span>
              </div>
              <div className="flex gap-4">
                <span className="w-20">Sun:</span>
                <span>10am - 5pm</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 mb-4 md:mb-0">
            © 2025 Miami Beach Yacht Club. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}