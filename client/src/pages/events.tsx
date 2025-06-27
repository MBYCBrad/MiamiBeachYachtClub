import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/navigation';
import { Calendar, Users, MapPin, Clock, ChevronRight, Sparkles, Anchor, Star } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  attendees: number;
  pricePerTicket: string;
  imageUrl: string;
  highlights: string[];
  category: 'social' | 'racing' | 'charity' | 'exclusive';
}

// Animated background particles
function ParticleBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-purple-500/20 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          transition={{
            duration: Math.random() * 20 + 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

// Category filter button
function CategoryButton({ category, active, onClick }: { category: string; active: boolean; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-6 py-3 rounded-full font-semibold transition-all ${
        active
          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
          : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
      }`}
    >
      {category}
    </motion.button>
  );
}

// Event card with 3D hover effect
function EventCard({ event, index }: { event: Event; index: number }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group cursor-pointer"
    >
      <div className="relative bg-gray-900/50 rounded-3xl overflow-hidden border border-white/10 backdrop-blur-sm">
        {/* Image with gradient overlay */}
        <div className="relative h-64 overflow-hidden">
          <motion.img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.4 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Category badge */}
          <div className="absolute top-4 left-4">
            <div className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full text-white text-sm font-semibold">
              {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
            </div>
          </div>

          {/* Capacity indicator */}
          <div className="absolute top-4 right-4">
            <div className="px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm flex items-center gap-2">
              <Users className="w-4 h-4" />
              {event.attendees}/{event.capacity}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-2xl font-bold text-white mb-2">{event.title}</h3>
          <p className="text-gray-400 mb-4 line-clamp-2">{event.description}</p>

          {/* Event details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>{event.location}</span>
            </div>
          </div>

          {/* Highlights */}
          <div className="mb-6">
            <h4 className="text-white font-semibold mb-2">Event Highlights</h4>
            <ul className="space-y-1">
              {event.highlights.slice(0, 3).map((highlight, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-400 text-sm">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>

          {/* Price and CTA */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Starting from</p>
              <p className="text-3xl font-bold text-white">${event.pricePerTicket}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-semibold flex items-center gap-2 shadow-lg"
            >
              Reserve Tickets
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Hover glow effect */}
      <motion.div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: 'radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(139, 92, 246, 0.15), transparent 40%)',
        }}
      />
    </motion.div>
  );
}

export default function EventsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ['/api/events'],
    select: (data: any[]) => data.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      time: '7:00 PM - 11:00 PM',
      location: event.location,
      capacity: event.capacity,
      attendees: Math.floor(event.capacity * 0.7),
      pricePerTicket: event.pricePerTicket,
      imageUrl: event.imageUrl || '/api/media/PF0007919-big_1751025963434.jpg',
      highlights: [
        'Premium open bar included',
        'Gourmet cuisine by celebrity chef',
        'Live entertainment & DJ',
        'Exclusive yacht access',
        'VIP gift bags'
      ],
      category: event.title.toLowerCase().includes('charity') ? 'charity' : 
                event.title.toLowerCase().includes('race') ? 'racing' : 
                event.title.toLowerCase().includes('gala') ? 'exclusive' : 'social'
    }))
  });

  const categories = ['All', 'Social', 'Racing', 'Charity', 'Exclusive'];
  
  const filteredEvents = selectedCategory === 'All' 
    ? events 
    : events.filter(event => event.category === selectedCategory.toLowerCase());

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <ParticleBackground />
        
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6"
              style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              Exclusive Events
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Join Miami's most prestigious yacht club events. From sunset soirées to charity galas, 
              experience unforgettable moments on the water.
            </p>
          </motion.div>

          {/* Category filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-wrap gap-4 justify-center mb-16"
          >
            {categories.map((category) => (
              <CategoryButton
                key={category}
                category={category}
                active={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="pb-32">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredEvents.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-gray-400 text-xl">No events found in this category.</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-indigo-900/20" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-4xl mx-auto px-6 text-center"
        >
          <Anchor className="w-16 h-16 text-purple-400 mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Host Your Private Event
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Create unforgettable memories with a custom yacht event tailored to your vision. 
            Our event specialists will handle every detail.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-semibold text-lg shadow-lg"
          >
            Plan Your Event
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
}