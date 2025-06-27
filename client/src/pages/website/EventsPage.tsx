import React, { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Clock, Anchor, Sparkles, Music, Wine } from "lucide-react";
import { format } from "date-fns";

const upcomingEvents = [
  {
    id: 1,
    title: "Miami Boat Show VIP Access",
    date: new Date("2025-02-13"),
    time: "10:00 AM - 6:00 PM",
    location: "Miami Marine Stadium Park & Basin",
    capacity: 50,
    spotsLeft: 12,
    price: "$150",
    description: "Exclusive VIP access to the Miami International Boat Show with private yacht viewings, meet-and-greets with industry leaders, and complimentary refreshments.",
    image: "/api/media/pexels-joshsorenson-376464_1750934029125.jpg",
    category: "Exclusive Access",
    icon: Anchor
  },
  {
    id: 2,
    title: "Sunset Cruise & Wine Tasting",
    date: new Date("2025-02-14"),
    time: "5:30 PM - 8:30 PM",
    location: "MBYC Marina",
    capacity: 30,
    spotsLeft: 8,
    price: "Free for Members",
    description: "Celebrate Valentine's Day aboard our flagship yacht with a curated wine selection, gourmet appetizers, and breathtaking sunset views.",
    image: "/api/media/pexels-enginakyurt-2767767_1750933779323.jpg",
    category: "Social Gathering",
    icon: Wine
  },
  {
    id: 3,
    title: "Art Basel Yacht Party",
    date: new Date("2025-12-07"),
    time: "9:00 PM - 2:00 AM",
    location: "South Beach Marina",
    capacity: 100,
    spotsLeft: 45,
    price: "$500",
    description: "The most exclusive Art Basel after-party on the water. DJ performances, art installations, and networking with Miami's elite.",
    image: "/api/media/pexels-sebastian-arie-voortman-172472-223779_1750537301872.jpg",
    category: "Premium Event",
    icon: Sparkles
  },
  {
    id: 4,
    title: "Monthly Member Mixer",
    date: new Date("2025-01-30"),
    time: "6:00 PM - 9:00 PM",
    location: "MBYC Clubhouse",
    capacity: 75,
    spotsLeft: 23,
    price: "Free for Members",
    description: "Connect with fellow members at our monthly networking event. Enjoy cocktails, hors d'oeuvres, and live music in our waterfront clubhouse.",
    image: "/api/media/pexels-xuan-hoa-le-1061174-3031248_1750535774290.jpg",
    category: "Networking",
    icon: Users
  },
  {
    id: 5,
    title: "Fishing Tournament",
    date: new Date("2025-03-15"),
    time: "6:00 AM - 4:00 PM",
    location: "Miami Beach Marina",
    capacity: 40,
    spotsLeft: 15,
    price: "$250",
    description: "Annual MBYC fishing tournament with prizes for biggest catch. Professional crew, equipment provided, and awards ceremony.",
    image: "/api/media/pexels-julius-silver-753331_1750535774291.jpg",
    category: "Competition",
    icon: Anchor
  },
  {
    id: 6,
    title: "Jazz Night on the Water",
    date: new Date("2025-02-28"),
    time: "7:00 PM - 11:00 PM",
    location: "Biscayne Bay",
    capacity: 60,
    spotsLeft: 18,
    price: "$125",
    description: "Smooth jazz under the stars with live performances, dancing, and gourmet dining aboard our luxury yacht.",
    image: "/api/media/pexels-pixabay-42091_1750537301871.jpg",
    category: "Entertainment",
    icon: Music
  }
];

const pastEvents = [
  {
    id: 7,
    title: "New Year's Eve Gala",
    date: new Date("2024-12-31"),
    attendees: 120,
    image: "/api/media/pexels-taras-panchenko-177900-345522_1750537301873.jpg",
    highlights: "Fireworks display, champagne toast, live band"
  },
  {
    id: 8,
    title: "Summer Regatta",
    date: new Date("2024-08-15"),
    attendees: 85,
    image: "/api/media/pexels-tuum-visuals-5863391-10437659_1750537301874.jpg",
    highlights: "Racing competition, BBQ, awards ceremony"
  }
];

const eventCategories = [
  { name: "All Events", icon: Calendar },
  { name: "Exclusive Access", icon: Sparkles },
  { name: "Social Gathering", icon: Users },
  { name: "Entertainment", icon: Music },
  { name: "Competition", icon: Anchor }
];

export default function EventsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Events");

  const filteredEvents = selectedCategory === "All Events" 
    ? upcomingEvents 
    : upcomingEvents.filter(event => event.category === selectedCategory);

  return (
    <main className="bg-gray-950 min-h-screen text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img 
                src="/api/media/MBYC-LOGO-WHITE_1750978675231.png" 
                alt="MBYC" 
                className="h-10 w-auto"
              />
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/website" className="text-gray-300 hover:text-white transition">Home</Link>
              <Link href="/website/how-it-works" className="text-gray-300 hover:text-white transition">How It Works</Link>
              <Link href="/website/plans" className="text-gray-300 hover:text-white transition">Plans & Pricing</Link>
              <Link href="/website/events" className="text-white font-semibold">Events</Link>
              <Link href="/website/fleet" className="text-gray-300 hover:text-white transition">Fleet</Link>
              <Link href="/website/faq" className="text-gray-300 hover:text-white transition">FAQ</Link>
              <Link href="/website/contact" className="text-gray-300 hover:text-white transition">Contact</Link>
              <Link href="/auth" className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full text-white font-semibold hover:from-purple-700 hover:to-blue-600 transition">
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Exclusive Events
            </h1>
            <p className="text-xl text-gray-300">
              Join us for unforgettable experiences on the water
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {eventCategories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-full transition ${
                    selectedCategory === category.name
                      ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  <Icon size={20} />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Upcoming Events</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event, index) => {
              const Icon = event.icon;
              const spotsPercentage = ((event.capacity - event.spotsLeft) / event.capacity) * 100;
              
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-gray-900/50 rounded-2xl overflow-hidden border border-gray-700 hover:border-purple-500 transition group"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4 px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full text-sm font-semibold">
                      {event.category}
                    </div>
                    <div className="absolute top-4 right-4 p-2 bg-gray-900/80 rounded-full backdrop-blur-sm">
                      <Icon size={20} className="text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                    
                    <div className="space-y-2 mb-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} />
                        <span>{format(event.date, "MMMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock size={16} />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin size={16} />
                        <span>{event.location}</span>
                      </div>
                    </div>

                    <p className="text-gray-300 mb-4">{event.description}</p>

                    {/* Capacity Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Spots Available</span>
                        <span className="text-purple-400">{event.spotsLeft} left</span>
                      </div>
                      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-600 to-blue-500 transition-all duration-300"
                          style={{ width: `${spotsPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Price & Button */}
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-purple-400">{event.price}</span>
                      <Link href="/auth">
                        <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full text-white font-semibold hover:from-purple-700 hover:to-blue-600 transition transform hover:scale-105">
                          Reserve Spot
                        </button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Past Events Gallery */}
      <section className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Past Events Gallery</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {pastEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative rounded-2xl overflow-hidden group"
              >
                <img 
                  src={event.image} 
                  alt={event.title}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
                  <p className="text-gray-300 mb-2">{format(event.date, "MMMM d, yyyy")}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center space-x-1">
                      <Users size={16} />
                      <span>{event.attendees} attendees</span>
                    </span>
                  </div>
                  <p className="text-purple-400 mt-2">{event.highlights}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Host Your Private Event</h2>
          <p className="text-xl text-gray-300 mb-8">
            Looking to celebrate a special occasion? Our yachts are available for private charters.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/website/contact">
              <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full text-lg font-semibold hover:from-purple-700 hover:to-blue-600 transition transform hover:scale-105">
                Inquire About Private Events
              </button>
            </Link>
            <Link href="/auth">
              <button className="px-8 py-4 border-2 border-white rounded-full text-lg font-semibold hover:bg-white hover:text-gray-900 transition">
                Become a Member
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