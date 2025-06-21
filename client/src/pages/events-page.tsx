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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-2xl h-64 sm:h-72 animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-gray-900/50 rounded-2xl overflow-hidden border border-gray-800 hover-lift card-hover"
              >
                {/* Event Image */}
                <div className="relative h-48 bg-gradient-to-br from-purple-900/30 to-pink-900/30">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <div className="bg-purple-600/80 text-white px-3 py-1 rounded-full text-xs font-medium">
                      <Calendar size={12} className="inline mr-1" />
                      {formatDate(event.startTime)}
                    </div>
                  </div>
                  {event.ticketPrice && (
                    <div className="absolute top-3 right-3 bg-black/40 px-2 py-1 rounded-full">
                      <span className="text-white text-xs font-medium">
                        ${event.ticketPrice}
                      </span>
                    </div>
                  )}
                </div>

                {/* Event Info */}
                <div className="p-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors mb-2">
                    {event.title}
                  </h3>
                  
                  {event.description && (
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-gray-400 text-sm mb-4">
                    {event.location && (
                      <div className="flex items-center">
                        <MapPin size={14} className="mr-1" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.capacity && (
                      <div className="flex items-center">
                        <Users size={14} className="mr-1" />
                        <span>{event.capacity} guests</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-400">
                      {new Date(event.startTime).toLocaleDateString('en-US', {
                        weekday: 'long',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 rounded-xl px-6"
                    >
                      Register
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}