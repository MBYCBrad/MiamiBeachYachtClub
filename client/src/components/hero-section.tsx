interface HeroSectionProps {
  activeTab: 'bookings' | 'services' | 'experiences';
}

export default function HeroSection({ activeTab }: HeroSectionProps) {
  const heroContent = {
    bookings: {
      title: 'Unlimited Luxury',
      subtitle: 'Access our premier fleet of luxury yachts with your membership',
      backgroundImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80'
    },
    services: {
      title: 'Premium Services',
      subtitle: 'Enhance your yacht experience with our curated luxury amenities',
      backgroundImage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80'
    },
    experiences: {
      title: 'Exclusive Experiences',
      subtitle: 'Join curated events and unique yacht club experiences',
      backgroundImage: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2069&q=80'
    }
  };

  const content = heroContent[activeTab];

  return (
    <section className="relative h-[60vh] overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${content.backgroundImage}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      </div>
      
      <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            {content.title}
          </h2>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 font-light">
            {content.subtitle}
          </p>
          {activeTab === 'bookings' && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 rounded-full font-semibold hover:shadow-2xl hover:shadow-purple-600/30 transition-all duration-300 transform hover:scale-105 animate-pulse">
                Browse Fleet
              </button>
              <button className="border-2 border-purple-600/50 px-8 py-4 rounded-full font-semibold hover:bg-purple-600/20 hover:border-purple-600 transition-all duration-300 text-white">
                Watch Video Tour
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
