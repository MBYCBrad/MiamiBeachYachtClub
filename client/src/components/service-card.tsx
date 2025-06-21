import { Button } from "@/components/ui/button";
import type { Service } from "@shared/schema";

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/30 hover:border-purple-600/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-600/20 transform hover:scale-105">
      <div className="relative overflow-hidden">
        <img 
          src={service.imageUrl || 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300'} 
          alt={service.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <button className="absolute top-3 right-3 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-purple-600/80 transition-colors">
          <i className="far fa-heart text-white text-sm"></i>
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full flex items-center justify-center border-2 border-purple-600/30">
            <i className="fas fa-user text-purple-400"></i>
          </div>
          <div>
            <h4 className="font-semibold text-white">{service.name}</h4>
            <p className="text-sm text-gray-400 capitalize">{service.category} Specialist</p>
          </div>
        </div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1">
            <i className="fas fa-star text-yellow-400 text-sm"></i>
            <span className="text-sm text-gray-400">{service.rating || '5.0'}</span>
            <span className="text-sm text-gray-500">• {service.reviewCount} reviews</span>
          </div>
        </div>
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{service.description}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-white">${service.pricePerSession}</span>
            <span className="text-sm text-gray-400">/ session</span>
          </div>
          <Button 
            onClick={() => window.location.href = `/services/${service.id}`}
            className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-purple-600/30 transition-all duration-300">
            Book Now
          </Button>
        </div>
        {service.duration && (
          <div className="mt-3 pt-3 border-t border-gray-700/30">
            <p className="text-xs text-gray-500">Duration: {service.duration} minutes</p>
          </div>
        )}
      </div>
    </div>
  );
}
