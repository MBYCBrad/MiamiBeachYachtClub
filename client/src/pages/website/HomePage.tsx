import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);

  // Fetch hero video
  const { data: heroVideo } = useQuery({
    queryKey: ["/api/media/hero/active"],
  });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="bg-gray-950 min-h-screen text-white">
      {/* Hero Section with Video Background */}
      <section className="relative h-screen overflow-hidden">
        {/* Video Background */}
        {heroVideo && (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={heroVideo.url} type="video/mp4" />
          </video>
        )}

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 z-50 p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img 
                src="/api/media/MBYC-LOGO-WHITE_1750978675231.png" 
                alt="MBYC" 
                className="h-12 w-auto"
              />
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/website" className="text-white hover:text-purple-400 transition">Home</Link>
              <Link href="/website/how-it-works" className="text-white hover:text-purple-400 transition">How It Works</Link>
              <Link href="/website/plans" className="text-white hover:text-purple-400 transition">Plans & Pricing</Link>
              <Link href="/website/events" className="text-white hover:text-purple-400 transition">Events</Link>
              <Link href="/website/fleet" className="text-white hover:text-purple-400 transition">Fleet</Link>
              <Link href="/website/faq" className="text-white hover:text-purple-400 transition">FAQ</Link>
              <Link href="/website/contact" className="text-white hover:text-purple-400 transition">Contact</Link>
              <Link href="/auth" className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full text-white font-semibold hover:from-purple-700 hover:to-blue-600 transition">
                Login
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative h-full flex items-center justify-center text-center px-6">
          <div className="max-w-4xl animate-fade-in">
            <h2 className="text-2xl md:text-3xl mb-4 text-gray-300">Welcome to THE</h2>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Miami Beach Yacht Club
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-gray-300">
              Unlimited Luxury. One Club.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/website/plans">
                <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full text-lg font-semibold hover:from-purple-700 hover:to-blue-600 transition transform hover:scale-105">
                  APPLY NOW
                </button>
              </Link>
              <Link href="/website/tour">
                <button className="px-8 py-4 border-2 border-white rounded-full text-lg font-semibold hover:bg-white hover:text-gray-900 transition transform hover:scale-105">
                  BOOK A PRIVATE TOUR
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 border-2 border-white rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white rounded-full animate-scroll" />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">About our club</h2>
              <p className="text-lg text-gray-300 mb-6">
                The Miami Beach Yacht Club (MBYC) is a premier membership program that grants you unlimited access to a fleet of luxury yachts, paired with exclusive networking events for our community of high-end professionals. For a simple monthly fee, members enjoy hassle-free yachting and curated experiences both on and off the water.
              </p>
              <p className="text-lg text-gray-300 mb-8">
                At MBYC, we believe in making the yachting lifestyle seamless and stress-free. Whether you're spending quality time with family or hosting important clients, our dedicated and professional crew ensures every trip is exceptional. From fueling and maintenance to providing a captain and crew, every detail is handled—just step aboard and enjoy the ride.
              </p>
              <Link href="/website/about">
                <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full font-semibold hover:from-purple-700 hover:to-blue-600 transition">
                  LEARN MORE
                </button>
              </Link>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden">
              <img 
                src="/api/media/pexels-diego-f-parra-33199-843633%20(1)_1750537277228.jpg" 
                alt="Luxury Yacht" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Membership Plans Preview */}
      <section className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Plans and pricing</h2>
          <p className="text-xl text-center text-gray-300 mb-12">Choose the membership that fits your lifestyle</p>
          
          <div className="grid md:grid-cols-4 gap-6">
            {/* Silver */}
            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700 hover:border-purple-500 transition">
              <h3 className="text-2xl font-bold mb-2">Silver</h3>
              <p className="text-gray-400 mb-4">Membership</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$3,000</span>
                <span className="text-gray-400">/month</span>
              </div>
              <p className="text-sm text-purple-400 mb-4">+$10,000 One Time Fee</p>
              <p className="text-gray-300">Access Yachts Up To 50ft</p>
            </div>

            {/* Gold */}
            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700 hover:border-purple-500 transition">
              <h3 className="text-2xl font-bold mb-2">Gold</h3>
              <p className="text-gray-400 mb-4">Membership</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$5,000</span>
                <span className="text-gray-400">/month</span>
              </div>
              <p className="text-sm text-purple-400 mb-4">+$25,000 One Time Fee</p>
              <p className="text-gray-300">Access Yachts Up To 70ft</p>
            </div>

            {/* Platinum */}
            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700 hover:border-purple-500 transition relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full text-sm">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-2">Platinum</h3>
              <p className="text-gray-400 mb-4">Membership</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$7,500</span>
                <span className="text-gray-400">/month</span>
              </div>
              <p className="text-sm text-purple-400 mb-4">+$50,000 One Time Fee</p>
              <p className="text-gray-300">Access Yachts Up To 80ft</p>
            </div>

            {/* Diamond */}
            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700 hover:border-purple-500 transition">
              <h3 className="text-2xl font-bold mb-2">Diamond</h3>
              <p className="text-gray-400 mb-4">Membership</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$10,000</span>
                <span className="text-gray-400">/month</span>
              </div>
              <p className="text-sm text-purple-400 mb-4">+$100,000 One Time Fee</p>
              <p className="text-gray-300">Access Yachts Up To 100ft</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/website/plans">
              <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full text-lg font-semibold hover:from-purple-700 hover:to-blue-600 transition transform hover:scale-105">
                VIEW ALL PLANS
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <img 
                src="/api/media/MBYC-LOGO-WHITE_1750978675231.png" 
                alt="MBYC" 
                className="h-12 w-auto mb-4"
              />
              <p className="text-gray-400">The premier luxury yacht club experience in Miami Beach.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/website/about" className="hover:text-white transition">About Us</Link></li>
                <li><Link href="/website/fleet" className="hover:text-white transition">Fleet</Link></li>
                <li><Link href="/website/events" className="hover:text-white transition">Events</Link></li>
                <li><Link href="/website/invest" className="hover:text-white transition">Invest</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>786-981-3875</li>
                <li>membership@mbyc.miami</li>
                <li>300 Alton Road, Suite 305b</li>
                <li>Miami Beach, FL 33139</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Opening Hours</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Mon - Fri: 9am - 6pm</li>
                <li>Sat: 10am - 6pm</li>
                <li>Sun: 10am - 6pm</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>©2025 Miami Beach Yacht Club. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}