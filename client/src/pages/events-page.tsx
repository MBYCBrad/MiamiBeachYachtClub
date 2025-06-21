import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, MapPin, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Event } from '@shared/schema';
import HamburgerMenu from '@/components/HamburgerMenu';

interface EventsPageProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function EventsPage({ currentView, setCurrentView }: EventsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events', { upcoming: true, active: true }]
  });

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 z-0">
          <div className="w-full h-64 bg-gradient-to-br from-purple-900/50 to-pink-900/50" />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Header Content */}
        <div className="relative z-10 pt-8 sm:pt-12 pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-start mb-6 sm:mb-8">
            <div className="flex-1">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gradient-animate mb-2"
              >
                Exclusive Events
              </motion.h1>
              <p className="text-gray-300 text-sm sm:text-base lg:text-lg">
                Unforgettable experiences and luxury gatherings
              </p>
            </div>
            <HamburgerMenu currentView={currentView} setCurrentView={setCurrentView} />
          </div>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 sm:pl-12 pr-12 sm:pr-16 py-3 sm:py-4 bg-white/10 border-white/20 text-white placeholder-gray-400 rounded-2xl text-sm sm:text-base lg:text-lg focus:bg-white/20 focus:border-purple-500 transition-all duration-300"
            />
            <Button
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 rounded-xl p-2"
            >
              <Filter size={14} />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="px-4 sm:px-6 lg:px-8 pb-20 sm:pb-24">
        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto scroll-container">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4 min-w-full"
            >
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative aspect-square bg-gray-900/50 rounded-xl overflow-hidden border border-gray-800/50 hover:border-purple-500/50 transition-all duration-300 cursor-pointer"
                  style={{
                    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                  }}
                >
                  {/* Purple Outline Animation */}
                  <motion.div
                    className="absolute inset-0 rounded-xl border-2 border-purple-500/0 group-hover:border-purple-500/60 transition-all duration-300"
                    initial={false}
                    animate={{
                      borderColor: "rgba(168, 85, 247, 0)",
                    }}
                    whileHover={{
                      borderColor: "rgba(168, 85, 247, 0.6)",
                      boxShadow: "0 0 20px rgba(168, 85, 247, 0.3)",
                    }}
                  />

                  {/* Event Image */}
                  <div className="relative h-3/5 bg-gradient-to-br from-purple-900/30 to-pink-900/30">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-1 left-1">
                      <div className="bg-purple-600/80 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                        <Calendar size={10} className="inline mr-1" />
                        {formatDate(event.startTime)}
                      </div>
                    </div>
                    {event.ticketPrice && (
                      <div className="absolute top-1 right-1 bg-black/40 px-1.5 py-0.5 rounded-full">
                        <span className="text-white text-xs font-medium">
                          ${event.ticketPrice}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Event Info */}
                  <div className="p-2 h-2/5 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-semibold text-white group-hover:text-purple-400 transition-colors truncate">
                        {event.title}
                      </h3>
                      <p className="text-gray-400 text-xs truncate">
                        {event.location || 'Exclusive Event'}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs font-bold text-white">
                        {event.ticketPrice ? `$${event.ticketPrice}` : 'Free'}
                        <span className="text-xs text-gray-400 font-normal">/person</span>
                      </span>
                      <span className="text-xs text-gray-400">
                        {event.capacity ? `${event.capacity} spots` : 'Limited'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}