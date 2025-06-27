import React, { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Users, Bed, Bath, Ruler, MapPin, Calendar } from "lucide-react";

// Fleet data from the website
const fleetData = [
  {
    id: 1,
    name: "PURA VIDA",
    model: "95ft Sunseeker",
    length: "95'1\"",
    lengthMeters: "28.96 m",
    cabins: 4,
    baths: 5,
    capacity: 12,
    location: "Miami Beach Marina",
    description: "The PURA VIDA – 95ft Sunseeker Yacht combines sleek design with innovative features, offering the elegance of a superyacht in a practical motor yacht size. Its standout feature is the main deck's master suite, designed to maximize space and flexibility.",
    features: [
      "Luxurious berth and dressing area",
      "Expansive flybridge with second helm",
      "Bar and optional hot tub",
      "Deep V hull for luxury and performance"
    ],
    images: [
      "/api/media/pexels-xuan-hoa-le-1061174-3031248_1750535774290.jpg",
      "/api/media/pexels-albin-berlin-299748-906982_1750535774291.jpg",
      "/api/media/pexels-julius-silver-753331_1750535774291.jpg"
    ],
    videoUrl: "https://player.vimeo.com/video/938720860",
    membershipTier: "diamond"
  },
  {
    id: 2,
    name: "GRATITUDE",
    model: "74ft Azimut Flybridge",
    length: "74'",
    lengthMeters: "22.64 m",
    cabins: 4,
    baths: 5,
    capacity: 10,
    location: "Miami Beach Marina",
    description: "The GRATITUDE – 74ft Azimut is a perfect blend of Italian craftsmanship and innovation, featuring sleek design and carbon fiber construction for enhanced comfort and performance.",
    features: [
      "Expansive windows and panoramic views",
      "Low-profile gunwales",
      "Spacious flybridge",
      "Carbon windshield mullion"
    ],
    images: [
      "/api/media/pexels-pixabay-42091_1750537301871.jpg",
      "/api/media/pexels-sebastian-arie-voortman-172472-223779_1750537301872.jpg",
      "/api/media/pexels-pixabay-163236_1750537301872.jpg"
    ],
    videoUrl: "https://player.vimeo.com/video/938722489",
    membershipTier: "platinum"
  },
  {
    id: 3,
    name: "EL REY",
    model: "70ft Sunseeker Sport Yacht",
    length: "70'",
    lengthMeters: "21.44 m",
    cabins: 3,
    baths: 4,
    capacity: 8,
    location: "Miami Beach Marina",
    description: "The EL REY – 70ft Sunseeker, Sport Yacht's commitment to excellence, combining power and elegance in a design that reflects years of innovation.",
    features: [
      "Streamlined shape and distinctive style",
      "Expansive sunpads fore and aft",
      "Luxurious amenities throughout",
      "Carefully chosen specifications"
    ],
    images: [
      "/api/media/pexels-xuan-hoa-le-1061174-3031251_1750537301873.jpg",
      "/api/media/pexels-taras-panchenko-177900-345522_1750537301873.jpg",
      "/api/media/pexels-tuum-visuals-5863391-10437659_1750537301874.jpg"
    ],
    videoUrl: "https://player.vimeo.com/video/938723912",
    membershipTier: "gold"
  },
  {
    id: 4,
    name: "WATERBABY",
    model: "63ft Sea Ray 630 Sun Sport",
    length: "63'",
    lengthMeters: "19.20 m",
    cabins: 3,
    baths: 3.5,
    capacity: 8,
    location: "Miami Beach Marina",
    description: "The 1996 WATERBABY – 63ft Sea Ray 630 Sun Sport, powered by twin 1250hp Caterpillar diesel engines, is a stylish and powerful addition to the Miami Yacht Club's fleet.",
    features: [
      "Twin 1250hp Caterpillar diesel engines",
      "Deep-V hull for enhanced stability",
      "Integrated transom for smooth operation",
      "Spacious deck for entertainment"
    ],
    images: [
      "/api/media/pexels-schiffundboot-1707899-21014018_1750537579436.jpg",
      "/api/media/pexels-pixabay-42091_1750537301871.jpg",
      "/api/media/pexels-diego-f-parra-33199-843633%20(1)_1750537277228.jpg"
    ],
    videoUrl: null,
    membershipTier: "silver"
  }
];

const membershipColors = {
  silver: "from-gray-400 to-gray-600",
  gold: "from-yellow-400 to-yellow-600",
  platinum: "from-purple-400 to-purple-600",
  diamond: "from-blue-400 to-blue-600"
};

export default function FleetPage() {
  const [selectedYacht, setSelectedYacht] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);

  const currentYacht = fleetData[selectedYacht];

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
              <Link href="/website/events" className="text-gray-300 hover:text-white transition">Events</Link>
              <Link href="/website/fleet" className="text-white font-semibold">Fleet</Link>
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
              Our Fleet
            </h1>
            <p className="text-xl text-gray-300">
              Explore MBYC's Exquisite Fleet
            </p>
          </motion.div>
        </div>
      </section>

      {/* Yacht Selector */}
      <section className="px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center space-x-4 mb-8">
            <button
              onClick={() => setSelectedYacht(Math.max(0, selectedYacht - 1))}
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition"
              disabled={selectedYacht === 0}
            >
              <ChevronLeft className={selectedYacht === 0 ? "text-gray-600" : "text-white"} />
            </button>
            
            <div className="flex space-x-2">
              {fleetData.map((yacht, index) => (
                <button
                  key={yacht.id}
                  onClick={() => {
                    setSelectedYacht(index);
                    setImageIndex(0);
                  }}
                  className={`px-4 py-2 rounded-full transition ${
                    selectedYacht === index 
                      ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white" 
                      : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                  }`}
                >
                  {yacht.model}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setSelectedYacht(Math.min(fleetData.length - 1, selectedYacht + 1))}
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition"
              disabled={selectedYacht === fleetData.length - 1}
            >
              <ChevronRight className={selectedYacht === fleetData.length - 1 ? "text-gray-600" : "text-white"} />
            </button>
          </div>
        </div>
      </section>

      {/* Yacht Details */}
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            key={currentYacht.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid lg:grid-cols-2 gap-12"
          >
            {/* Images/Video Section */}
            <div className="space-y-6">
              {/* Main Image/Video */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-900">
                {currentYacht.videoUrl && imageIndex === 0 ? (
                  <iframe
                    src={`${currentYacht.videoUrl}?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1`}
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                  />
                ) : (
                  <img
                    src={currentYacht.images[imageIndex] || currentYacht.images[0]}
                    alt={currentYacht.name}
                    className="w-full h-full object-cover"
                  />
                )}
                
                {/* Membership Badge */}
                <div className={`absolute top-4 right-4 px-4 py-2 rounded-full bg-gradient-to-r ${membershipColors[currentYacht.membershipTier]} text-white text-sm font-semibold capitalize`}>
                  {currentYacht.membershipTier} Tier
                </div>
              </div>

              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-4 gap-4">
                {currentYacht.videoUrl && (
                  <button
                    onClick={() => setImageIndex(0)}
                    className={`relative aspect-video rounded-lg overflow-hidden ${imageIndex === 0 ? "ring-2 ring-purple-500" : ""}`}
                  >
                    <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                      </svg>
                    </div>
                  </button>
                )}
                {currentYacht.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setImageIndex(currentYacht.videoUrl ? index + 1 : index)}
                    className={`relative aspect-video rounded-lg overflow-hidden ${
                      imageIndex === (currentYacht.videoUrl ? index + 1 : index) ? "ring-2 ring-purple-500" : ""
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${currentYacht.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Info Section */}
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold mb-2">{currentYacht.name}</h2>
                <p className="text-2xl text-gray-300">{currentYacht.model}</p>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                  <div className="flex items-center space-x-3 mb-2">
                    <Ruler className="text-purple-400" size={24} />
                    <span className="text-gray-400">Length</span>
                  </div>
                  <p className="text-2xl font-semibold">{currentYacht.length}</p>
                  <p className="text-sm text-gray-400">{currentYacht.lengthMeters}</p>
                </div>

                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                  <div className="flex items-center space-x-3 mb-2">
                    <Users className="text-purple-400" size={24} />
                    <span className="text-gray-400">Capacity</span>
                  </div>
                  <p className="text-2xl font-semibold">{currentYacht.capacity} Guests</p>
                </div>

                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                  <div className="flex items-center space-x-3 mb-2">
                    <Bed className="text-purple-400" size={24} />
                    <span className="text-gray-400">Cabins</span>
                  </div>
                  <p className="text-2xl font-semibold">{currentYacht.cabins}</p>
                </div>

                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                  <div className="flex items-center space-x-3 mb-2">
                    <Bath className="text-purple-400" size={24} />
                    <span className="text-gray-400">Baths</span>
                  </div>
                  <p className="text-2xl font-semibold">{currentYacht.baths}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-2xl font-semibold mb-4">About {currentYacht.name}</h3>
                <p className="text-gray-300 leading-relaxed">{currentYacht.description}</p>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-2xl font-semibold mb-4">Key Features</h3>
                <ul className="space-y-3">
                  {currentYacht.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mt-2" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Location */}
              <div className="flex items-center space-x-3 text-gray-300">
                <MapPin className="text-purple-400" size={20} />
                <span>{currentYacht.location}</span>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/website/plans">
                  <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full text-white font-semibold hover:from-purple-700 hover:to-blue-600 transition transform hover:scale-105">
                    Book This Yacht
                  </button>
                </Link>
                <Link href="/website/tour">
                  <button className="w-full sm:w-auto px-8 py-4 border-2 border-white rounded-full text-white font-semibold hover:bg-white hover:text-gray-900 transition">
                    Schedule a Tour
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Coming Soon</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
              <h3 className="text-2xl font-bold mb-2">RIVA 45ft</h3>
              <p className="text-gray-300 mb-4">
                Rivamare stands as a gleaming gem in the illustrious Riva collection, embodying a perfect blend of legendary heritage, contemporary design, and unparalleled elegance.
              </p>
              <div className="flex items-center space-x-6 text-gray-400">
                <span>Cabins: 1</span>
                <span>Baths: 2</span>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
              <h3 className="text-2xl font-bold mb-2">Limitless Seas 45ft</h3>
              <p className="text-gray-300 mb-4">
                The Limitless 45 combines cutting-edge design with versatile functionality, featuring a high-low bathing platform that transforms into a beach club for easy water access.
              </p>
              <div className="flex items-center space-x-6 text-gray-400">
                <span>Cabins: 1</span>
                <span>Baths: 2</span>
              </div>
            </div>
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