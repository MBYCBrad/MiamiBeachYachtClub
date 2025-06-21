import { Button } from "@/components/ui/button";
import type { Event } from "@shared/schema";

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(new Date(date));
  };

  return (
    <div className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/30 hover:border-purple-600/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-600/20 transform hover:scale-105">
      <div className="relative overflow-hidden">
        <img 
          src={event.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300'} 
          alt={event.title}
          className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-purple-600/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-medium text-white">
          Original
        </div>
        <button className="absolute top-3 right-3 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-purple-600/80 transition-colors">
          <i className="fas fa-share text-white text-sm"></i>
        </button>
      </div>
      <div className="p-4">
        <h4 className="font-semibold text-white mb-2 line-clamp-2">{event.title}</h4>
        <p className="text-xs text-gray-400 mb-2">{event.location}</p>
        <p className="text-xs text-gray-400 mb-2">{formatDate(event.startTime)}</p>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">From ${event.ticketPrice || '0'} / guest</p>
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-1 rounded-lg text-xs font-medium hover:shadow-lg hover:shadow-purple-600/30 transition-all duration-300">
            Register
          </Button>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-700/30">
          <p className="text-xs text-gray-500">Capacity: {event.capacity} guests</p>
        </div>
      </div>
    </div>
  );
}
