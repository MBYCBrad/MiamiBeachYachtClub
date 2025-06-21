import { Button } from "@/components/ui/button";
import type { Yacht } from "@shared/schema";

interface YachtCardProps {
  yacht: Yacht;
}

export default function YachtCard({ yacht }: YachtCardProps) {
  return (
    <div className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/30 hover:border-purple-600/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-600/20 transform hover:scale-105">
      <div className="relative overflow-hidden">
        <img 
          src={yacht.imageUrl || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300'} 
          alt={yacht.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <button className="absolute top-3 right-3 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-purple-600/80 transition-colors">
          <i className="far fa-heart text-white text-sm"></i>
        </button>
        <div className="absolute top-3 left-3 bg-purple-600/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-medium text-white">
          Member Favorite
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-white">{yacht.name}</h4>
          <div className="flex items-center space-x-1">
            <i className="fas fa-star text-yellow-400 text-sm"></i>
            <span className="text-sm text-gray-400">5.0</span>
          </div>
        </div>
        <p className="text-sm text-gray-400 mb-2">{yacht.location}</p>
        <p className="text-sm text-gray-400 mb-3">{yacht.size}ft • Capacity: {yacht.capacity}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-white">FREE</span>
            <span className="text-sm text-gray-400 block">with membership</span>
          </div>
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-purple-600/30 transition-all duration-300">
            Reserve
          </Button>
        </div>
        {yacht.amenities && yacht.amenities.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-700/30">
            <p className="text-xs text-gray-500 mb-1">Amenities:</p>
            <div className="flex flex-wrap gap-1">
              {yacht.amenities.slice(0, 3).map((amenity, index) => (
                <span key={index} className="text-xs bg-gray-700/50 px-2 py-1 rounded text-gray-300">
                  {amenity}
                </span>
              ))}
              {yacht.amenities.length > 3 && (
                <span className="text-xs text-purple-400">+{yacht.amenities.length - 3} more</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
