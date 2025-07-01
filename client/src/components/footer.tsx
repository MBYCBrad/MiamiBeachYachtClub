import { Link } from "wouter";
import { Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <img 
              src="/api/media/MBYC-LOGO-WHITE (1)_1751027380901.png" 
              alt="Miami Beach Yacht Club" 
              className="w-48 mb-4"
            />
            <p className="text-gray-400 text-sm">
              Miami's premier yacht club offering exclusive access to luxury vessels and world-class maritime experiences.
            </p>
          </div>
          
          {/* Main Menu */}
          <div>
            <h3 className="text-white font-semibold mb-4 uppercase tracking-wider">Main Menu</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-purple-400 transition-colors">Home</Link></li>
              <li><Link href="/how-it-works" className="text-gray-400 hover:text-purple-400 transition-colors">How It Works</Link></li>
              <li><Link href="/pricing" className="text-gray-400 hover:text-purple-400 transition-colors">Plans & Pricing</Link></li>
              <li><Link href="/events" className="text-gray-400 hover:text-purple-400 transition-colors">Events</Link></li>
              <li><Link href="/fleet" className="text-gray-400 hover:text-purple-400 transition-colors">Fleet</Link></li>
              <li><Link href="/book-tour" className="text-gray-400 hover:text-purple-400 transition-colors">Book a Private Tour</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-purple-400 transition-colors">FAQ</Link></li>
              <li><Link href="/partner" className="text-gray-400 hover:text-purple-400 transition-colors">Partner</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-purple-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4 uppercase tracking-wider">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-purple-400 mt-0.5" />
                <div>
                  <a href="tel:786-981-3875" className="text-gray-400 hover:text-purple-400 transition-colors">
                    786-981-3875
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-purple-400 mt-0.5" />
                <a href="mailto:membership@mbyc.miami" className="text-gray-400 hover:text-purple-400 transition-colors">
                  membership@mbyc.miami
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-purple-400 mt-0.5" />
                <div className="text-gray-400">
                  300 Alton Road, Suite 305b<br />
                  Miami Beach, Florida 33139<br />
                  United States
                </div>
              </div>
            </div>
          </div>
          
          {/* Opening Hours */}
          <div>
            <h3 className="text-white font-semibold mb-4 uppercase tracking-wider">Opening Hours</h3>
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
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              ©2025 Miami Beach Yacht Club. All Rights Reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-gray-500 hover:text-purple-400 text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-500 hover:text-purple-400 text-sm transition-colors">
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}