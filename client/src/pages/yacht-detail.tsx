import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Yacht } from "@shared/schema";

export default function YachtDetail() {
  const { id } = useParams();
  
  const { data: yacht, isLoading } = useQuery<Yacht>({
    queryKey: [`/api/yachts/${id}`],
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!yacht) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-2">Yacht Not Found</h1>
          <p className="text-gray-400">The yacht you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">{yacht.name}</h1>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="border-purple-600/50 text-purple-400">
              <i className="fas fa-share mr-2"></i>Share
            </Button>
            <Button variant="outline" size="sm" className="border-purple-600/50 text-purple-400">
              <i className="far fa-heart mr-2"></i>Save
            </Button>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <div className="lg:col-span-1">
            <img 
              src={yacht.imageUrl || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600'} 
              alt={yacht.name}
              className="w-full h-96 object-cover rounded-2xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <img 
                key={i}
                src={`https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300&v=${i}`}
                alt={`${yacht.name} view ${i + 1}`}
                className="w-full h-44 object-cover rounded-xl"
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30">
              <h2 className="text-xl font-bold text-white mb-4">Yacht Details</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Size:</span>
                  <span className="text-white ml-2">{yacht.size} feet</span>
                </div>
                <div>
                  <span className="text-gray-400">Capacity:</span>
                  <span className="text-white ml-2">{yacht.capacity} guests</span>
                </div>
                <div>
                  <span className="text-gray-400">Location:</span>
                  <span className="text-white ml-2">{yacht.location}</span>
                </div>
                <div>
                  <span className="text-gray-400">Status:</span>
                  <span className={`ml-2 ${yacht.isAvailable ? 'text-green-400' : 'text-red-400'}`}>
                    {yacht.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            </div>

            {yacht.description && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30">
                <h2 className="text-xl font-bold text-white mb-4">Description</h2>
                <p className="text-gray-300 leading-relaxed">{yacht.description}</p>
              </div>
            )}

            {yacht.amenities && yacht.amenities.length > 0 && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30">
                <h2 className="text-xl font-bold text-white mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {yacht.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <i className="fas fa-check text-purple-400 text-sm"></i>
                      <span className="text-gray-300 text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Booking */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30 sticky top-8">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-white mb-2">FREE</div>
                <p className="text-gray-400">with your membership</p>
                <div className="flex items-center justify-center mt-2">
                  <i className="fas fa-star text-yellow-400 text-sm"></i>
                  <span className="text-white ml-1">5.0</span>
                  <span className="text-gray-400 ml-1">• Rare find!</span>
                </div>
              </div>

              <Separator className="bg-gray-700/50 mb-6" />

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Check-in</label>
                  <input 
                    type="date" 
                    className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Check-out</label>
                  <input 
                    type="date" 
                    className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Guests</label>
                  <select className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 outline-none">
                    {[...Array(yacht.capacity)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1} guest{i > 0 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 font-semibold py-3 mb-4">
                Reserve Now
              </Button>

              <p className="text-xs text-gray-500 text-center">
                You won't be charged yet
              </p>

              <Separator className="bg-gray-700/50 my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Fuel & Crew</span>
                  <span>Included</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Service fee</span>
                  <span>$0</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>MBYC fee</span>
                  <span>$0</span>
                </div>
                <Separator className="bg-gray-700/50" />
                <div className="flex justify-between font-semibold text-white">
                  <span>Total</span>
                  <span>FREE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
