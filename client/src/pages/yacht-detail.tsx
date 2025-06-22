import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Star, 
  Share, 
  Heart, 
  MapPin, 
  Users, 
  Anchor, 
  Wifi, 
  Car, 
  Coffee, 
  Waves, 
  Wind, 
  Sun,
  Shield,
  Camera,
  Music,
  ChefHat,
  Bed,
  Bath,
  Tv,
  AirVent,
  Calendar,
  Clock
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import YachtBookingModal from "@/components/yacht-booking-modal";
import type { Yacht } from "@shared/schema";

// Yacht images array for gallery
const YACHT_IMAGES = [
  "/api/media/pexels-diego-f-parra-33199-843633 (1)_1750537277228.jpg",
  "/api/media/pexels-goumbik-296278_1750537277229.jpg",
  "/api/media/pexels-mali-42092_1750537277229.jpg",
  "/api/media/pexels-mikebirdy-144634_1750537277230.jpg",
  "/api/media/pexels-pixabay-163236_1750537277230.jpg",
  "/api/media/pexels-mali-42091_1750537294323.jpg"
];

const getYachtImage = (yachtId: number, index: number = 0) => {
  return YACHT_IMAGES[(yachtId - 1 + index) % YACHT_IMAGES.length];
};

// Sample amenities data
const yachtAmenities = [
  { icon: Wifi, label: "Free WiFi" },
  { icon: AirVent, label: "Air conditioning" },
  { icon: Tv, label: "Entertainment system" },
  { icon: ChefHat, label: "Full kitchen" },
  { icon: Bed, label: "Luxury cabins" },
  { icon: Bath, label: "Private bathrooms" },
  { icon: Waves, label: "Water sports equipment" },
  { icon: Music, label: "Sound system" },
  { icon: Camera, label: "Professional crew" },
  { icon: Shield, label: "Safety equipment" }
];

// Sample reviews data
const sampleReviews = [
  {
    id: 1,
    user: "Sarah Johnson",
    avatar: "SJ",
    rating: 5,
    date: "June 2025",
    comment: "Absolutely incredible experience! The yacht was pristine and the crew was professional. Perfect for our celebration."
  },
  {
    id: 2,
    user: "Michael Chen",
    avatar: "MC",
    rating: 5,
    date: "May 2025",
    comment: "Everything exceeded expectations. The yacht was beautiful and well-maintained. Highly recommend for special occasions."
  },
  {
    id: 3,
    user: "Emma Rodriguez",
    avatar: "ER",
    rating: 4,
    date: "May 2025",
    comment: "Great yacht with amazing amenities. The sunset cruise was unforgettable. Will definitely book again."
  }
];

export default function YachtDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const { data: yacht, isLoading } = useQuery<Yacht>({
    queryKey: [`/api/yachts/${id}`],
    enabled: !!id
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: yacht?.name || 'Yacht Details',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Yacht link copied to clipboard"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading yacht details...</div>
      </div>
    );
  }

  if (!yacht) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Yacht not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header Navigation */}
      <div className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            className="text-white hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Yachts
          </Button>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              onClick={handleShare}
              className="text-white hover:bg-gray-800"
            >
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              variant="ghost"
              onClick={() => setIsFavorite(!isFavorite)}
              className="text-white hover:bg-gray-800"
            >
              <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Yacht Title Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{yacht.name}</h1>
          <div className="flex items-center space-x-4 text-gray-300">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 mr-1" />
              <span className="font-medium">4.9</span>
              <span className="mx-1">·</span>
              <span className="underline cursor-pointer">127 reviews</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="underline cursor-pointer">Miami Beach Marina, Florida</span>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 mb-8 h-96 rounded-xl overflow-hidden">
          <div className="lg:col-span-2 relative">
            <img
              src={getYachtImage(yacht.id, selectedImageIndex)}
              alt={yacht.name}
              className="w-full h-full object-cover cursor-pointer hover:brightness-110 transition-all"
              onClick={() => setSelectedImageIndex(0)}
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <img
              src={getYachtImage(yacht.id, 1)}
              alt={`${yacht.name} view 2`}
              className="w-full h-full object-cover cursor-pointer hover:brightness-110 transition-all"
              onClick={() => setSelectedImageIndex(1)}
            />
            <img
              src={getYachtImage(yacht.id, 2)}
              alt={`${yacht.name} view 3`}
              className="w-full h-full object-cover cursor-pointer hover:brightness-110 transition-all"
              onClick={() => setSelectedImageIndex(2)}
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <img
              src={getYachtImage(yacht.id, 3)}
              alt={`${yacht.name} view 4`}
              className="w-full h-full object-cover cursor-pointer hover:brightness-110 transition-all"
              onClick={() => setSelectedImageIndex(3)}
            />
            <div className="relative">
              <img
                src={getYachtImage(yacht.id, 4)}
                alt={`${yacht.name} view 5`}
                className="w-full h-full object-cover cursor-pointer hover:brightness-110 transition-all"
                onClick={() => setSelectedImageIndex(4)}
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Button variant="outline" className="bg-white text-black hover:bg-gray-100">
                  Show all photos
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Host Info */}
            <div className="flex items-center justify-between border-b border-gray-800 pb-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">Yacht hosted by Captain Marina</h2>
                <div className="flex items-center space-x-4 text-gray-400">
                  <span>{yacht.capacity} guests</span>
                  <span>•</span>
                  <span>{yacht.size}ft</span>
                  <span>•</span>
                  <span>3 cabins</span>
                  <span>•</span>
                  <span>2 bathrooms</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white font-semibold">
                CM
              </div>
            </div>

            {/* Yacht Features */}
            <div className="border-b border-gray-800 pb-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Anchor className="w-5 h-5 text-purple-400 mt-1" />
                  <div>
                    <h3 className="font-medium">Luxury yacht experience</h3>
                    <p className="text-gray-400 text-sm">Professional crew and premium amenities included</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-green-400 mt-1" />
                  <div>
                    <h3 className="font-medium">Safety certified</h3>
                    <p className="text-gray-400 text-sm">Fully licensed and insured with safety equipment onboard</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Star className="w-5 h-5 text-yellow-400 mt-1" />
                  <div>
                    <h3 className="font-medium">Highly rated</h3>
                    <p className="text-gray-400 text-sm">Consistently rated 5 stars by guests</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="border-b border-gray-800 pb-6">
              <p className="text-gray-300 leading-relaxed">
                Experience luxury on the water aboard {yacht.name}, a stunning {yacht.size}-foot yacht perfect for 
                creating unforgettable memories in Miami Beach. This beautifully appointed vessel offers spacious 
                decks, premium amenities, and professional crew service for the ultimate yacht experience.
                <br /><br />
                Whether you're celebrating a special occasion, hosting a corporate event, or simply enjoying a 
                day on the water with friends and family, our yacht provides the perfect setting with breathtaking 
                views of Miami's skyline and pristine waters.
              </p>
              <Button variant="link" className="text-purple-400 p-0 h-auto mt-2">
                Show more
              </Button>
            </div>

            {/* Amenities */}
            <div className="border-b border-gray-800 pb-6">
              <h3 className="text-xl font-semibold mb-4">What this yacht offers</h3>
              <div className="grid grid-cols-2 gap-4">
                {yachtAmenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <amenity.icon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-300">{amenity.label}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="mt-4 bg-transparent border-gray-600 text-white hover:bg-gray-800">
                Show all 20 amenities
              </Button>
            </div>

            {/* Reviews */}
            <div>
              <div className="flex items-center space-x-4 mb-6">
                <Star className="w-6 h-6 text-yellow-400" />
                <h3 className="text-xl font-semibold">4.9 · 127 reviews</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {sampleReviews.map((review) => (
                  <div key={review.id} className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white font-medium text-sm">
                        {review.avatar}
                      </div>
                      <div>
                        <p className="font-medium">{review.user}</p>
                        <p className="text-sm text-gray-400">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-300 text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
              
              <Button variant="outline" className="bg-transparent border-gray-600 text-white hover:bg-gray-800">
                Show all 127 reviews
              </Button>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800 border-gray-700 sticky top-24">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-2xl font-bold text-green-400">FREE</span>
                    <span className="text-gray-400 ml-2">with membership</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="font-medium">4.9</span>
                    <span className="text-gray-400">(127)</span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-1 border border-gray-600 rounded-lg overflow-hidden">
                    <div className="p-3 border-r border-gray-600">
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Check-in</label>
                      <div className="text-sm mt-1">Add date</div>
                    </div>
                    <div className="p-3">
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Check-out</label>
                      <div className="text-sm mt-1">Add date</div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-600 rounded-lg p-3">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Guests</label>
                    <div className="text-sm mt-1">1 guest</div>
                  </div>
                </div>

                <Button 
                  onClick={() => setIsBookingModalOpen(true)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 rounded-lg"
                >
                  Reserve
                </Button>
                
                <p className="text-center text-sm text-gray-400 mt-3">
                  You won't be charged yet
                </p>

                <div className="border-t border-gray-700 mt-6 pt-6">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                    <Shield className="w-4 h-4" />
                    <span>Your booking is protected by MBYC</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <YachtBookingModal
        yacht={yacht}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </div>
  );
}