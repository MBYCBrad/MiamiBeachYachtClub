import React, { useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import WebsiteLayout from '@/components/website/WebsiteLayout';
import { Calendar, MapPin, Users, Clock, Sparkles } from 'lucide-react';

export default function EventsPage() {
  const [filter, setFilter] = useState('all');

  // Fetch events data
  const { data: events = [] } = useQuery({
    queryKey: ['/api/events'],
  });

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter((event: any) => {
        const eventDate = new Date(event.date);
        const now = new Date();
        if (filter === 'upcoming') return eventDate >= now;
        if (filter === 'past') return eventDate < now;
        return true;
      });

  const getEventImage = (event: any) => {
    if (event.image) return event.image;
    // Use theme-based default images
    const themeImages: Record<string, string> = {
      'sunset': '/api/media/2018_10_01_13_06_40_1880672045400179171_458353437_1750974267919_834196811.jpg',
      'gala': '/api/media/6590ba3a1ab7e_ScreenShot2023_12_30at7_19_45PM_1750974197423_398115916.png',
      'racing': '/api/media/Screenshot 2025-06-21 at 3.22.35 PM_1750544558513.png',
      'networking': '/api/media/Screenshot 2025-06-21 at 3.25.36 PM_1750544738438.png'
    };
    const theme = event.title.toLowerCase();
    for (const [key, image] of Object.entries(themeImages)) {
      if (theme.includes(key)) return image;
    }
    return themeImages.sunset;
  };

  return (
    <WebsiteLayout>
      <div className="min-h-screen bg-black">
        {/* Hero Section */}
        <section className="relative py-24 px-4 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-7xl mx-auto text-center"
          >
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-thin text-white mb-6">
              Exclusive Events
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12">
              Join us for unforgettable experiences on the water
            </p>

            {/* Filter Tabs */}
            <div className="flex justify-center space-x-6">
              {['all', 'upcoming', 'past'].map((option) => (
                <button
                  key={option}
                  onClick={() => setFilter(option)}
                  className={`px-8 py-3 text-sm font-medium rounded-full transition-all duration-300 ${
                    filter === option
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500'
                  }`}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)} Events
                </button>
              ))}
            </div>
          </motion.div>

          {/* Animated Background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-black to-black" />
            <motion.div
              animate={{ 
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{ 
                duration: 30, 
                repeat: Infinity, 
                repeatType: 'reverse' 
              }}
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle at 20% 50%, #7c3aed 0%, transparent 50%), radial-gradient(circle at 80% 80%, #2563eb 0%, transparent 50%)',
                backgroundSize: '200% 200%',
              }}
            />
          </div>
        </section>

        {/* Events Grid */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event: any, index: number) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative overflow-hidden rounded-2xl bg-gray-950 border border-gray-800 hover:border-gray-600 transition-all duration-300"
                >
                  {/* Event Image */}
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={getEventImage(event)}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    
                    {/* Date Badge */}
                    <div className="absolute top-4 left-4">
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-white">
                          {format(new Date(event.date), 'd')}
                        </div>
                        <div className="text-xs text-gray-300 uppercase">
                          {format(new Date(event.date), 'MMM')}
                        </div>
                      </div>
                    </div>

                    {/* Event Type Badge */}
                    {event.memberOnly && (
                      <div className="absolute top-4 right-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full">
                          <Sparkles className="w-3 h-3 text-white" />
                          <span className="text-xs text-white font-medium">Members Only</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Event Details */}
                  <div className="p-6">
                    <h3 className="text-2xl font-medium text-white mb-3">
                      {event.title}
                    </h3>
                    
                    <p className="text-gray-400 mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-3 text-gray-300">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span className="text-sm">
                          {format(new Date(event.date), 'h:mm a')} - {format(new Date(event.date), 'h:mm a')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-300">
                        <MapPin className="w-4 h-4 text-purple-400" />
                        <span className="text-sm">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-300">
                        <Users className="w-4 h-4 text-purple-400" />
                        <span className="text-sm">
                          {event.capacity - (event.attendees || 0)} spots available
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        {event.price > 0 ? (
                          <div className="text-2xl font-bold text-white">
                            ${event.price}
                            <span className="text-sm text-gray-400 font-normal">/person</span>
                          </div>
                        ) : (
                          <div className="text-lg font-medium text-green-500">
                            Free for Members
                          </div>
                        )}
                      </div>
                      
                      <Link href="/auth">
                        <a className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:from-purple-700 hover:to-blue-700 transition-all">
                          Sign In to RSVP
                        </a>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredEvents.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-2xl font-medium text-white mb-2">
                  No {filter !== 'all' ? filter : ''} events found
                </h3>
                <p className="text-gray-400">
                  Check back soon for new events
                </p>
              </motion.div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-t from-gray-950 to-black">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-thin text-white mb-6">
              Never Miss an Event
            </h2>
            <p className="text-xl text-gray-400 mb-12">
              Join Miami Beach Yacht Club to get exclusive access to members-only events
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/website/plans">
                <a className="px-12 py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg rounded-full hover:from-purple-700 hover:to-blue-700 transition-all">
                  Become a Member
                </a>
              </Link>
              <Link href="/website/contact">
                <a className="px-12 py-5 border-2 border-white/30 text-white text-lg rounded-full hover:bg-white/10 transition-all">
                  Contact Us
                </a>
              </Link>
            </div>
          </motion.div>
        </section>
      </div>
    </WebsiteLayout>
  );
}