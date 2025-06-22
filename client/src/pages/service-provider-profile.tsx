import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, Clock, Users, ArrowLeft, Heart, Share, MessageCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface ServiceProvider {
  id: number;
  name: string;
  bio: string;
  location: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  responseTime: string;
  languages: string[];
  verified: boolean;
  services: ServiceTier[];
}

interface ServiceTier {
  id: number;
  name: string;
  description: string;
  price: string;
  duration: string;
  maxGuests: number;
  features: string[];
  image: string;
}

export default function ServiceProviderProfile() {
  const { providerId } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedService, setSelectedService] = useState<ServiceTier | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('09:00');
  const [guestCount, setGuestCount] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  // Mock data - in real app this would come from API
  const provider: ServiceProvider = {
    id: parseInt(providerId || '1'),
    name: "Caitlin",
    bio: "I style brides and wedding parties independently or with high-end hair and makeup teams.",
    location: "Miami Beach, FL",
    avatar: "/api/media/pexels-diego-f-parra-33199-843633 (1)_1750537277228.jpg",
    rating: 4.9,
    reviewCount: 127,
    responseTime: "within an hour",
    languages: ["English", "Spanish"],
    verified: true,
    services: [
      {
        id: 1,
        name: "Blowout and style",
        description: "Enjoy a wash and choose a style, either a blowdry or curls.",
        price: "$100",
        duration: "1 hr",
        maxGuests: 1,
        features: ["Professional styling", "Premium products", "Touch-up included"],
        image: "/api/media/pexels-mali-42092_1750537277229.jpg"
      },
      {
        id: 2,
        name: "Formal hairstyle",
        description: "Get an event-ready style for a wedding, prom, dinner, graduation, or other special occasion.",
        price: "$150",
        duration: "1 hr",
        maxGuests: 1,
        features: ["Event styling", "Long-lasting hold", "Photo-ready finish", "Hair accessories"],
        image: "/api/media/pexels-pixabay-163236_1750537277230.jpg"
      },
      {
        id: 3,
        name: "Wedding party styling",
        description: "Book this service for a wedding party or multiple guests attending a wedding.",
        price: "$600",
        duration: "4 hrs",
        maxGuests: 6,
        features: ["Multiple styles", "Bridal party coordination", "Touch-ups included", "Premium styling"],
        image: "/api/media/pexels-goumbik-296278_1750537277229.jpg"
      }
    ]
  };

  const handleBookService = (service: ServiceTier) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book this service.",
        variant: "destructive",
      });
      setLocation('/auth');
      return;
    }
    setSelectedService(service);
    setShowBookingModal(true);
  };

  const confirmBooking = async () => {
    if (!selectedService || !bookingDate) {
      toast({
        title: "Complete Required Fields",
        description: "Please select a date for your booking.",
        variant: "destructive",
      });
      return;
    }

    try {
      const bookingDateTime = `${bookingDate}T${bookingTime}:00.000Z`;
      
      const response = await apiRequest('POST', '/api/service-bookings', {
        serviceId: selectedService.id,
        bookingDate: bookingDateTime,
        status: 'confirmed',
        guestCount,
        totalPrice: selectedService.price.replace('$', '')
      });

      toast({
        title: "Booking Confirmed!",
        description: `Your ${selectedService.name} appointment is confirmed for ${new Date(bookingDate).toLocaleDateString()} at ${bookingTime}.`,
      });
      
      setShowBookingModal(false);
      setLocation('/trips');
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "Unable to complete booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            className="p-2 hover:bg-gray-800 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" className="p-2 hover:bg-gray-800 rounded-full">
              <Share className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setIsLiked(!isLiked)}
              className="p-2 hover:bg-gray-800 rounded-full"
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Provider Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Provider Header */}
            <div className="flex items-start space-x-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={provider.avatar} alt={provider.name} />
                <AvatarFallback className="bg-purple-600 text-white text-2xl">
                  {provider.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold">Event hair styling by {provider.name}</h1>
                  {provider.verified && (
                    <Badge className="bg-blue-600 text-white">Verified</Badge>
                  )}
                </div>
                
                <p className="text-gray-300 text-lg mb-4">{provider.bio}</p>
                
                <div className="flex items-center space-x-6 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-white">{provider.rating}</span>
                    <span>({provider.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{provider.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Responds {provider.responseTime}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Services Grid */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Available Services</h2>
              <div className="grid grid-cols-1 gap-6">
                {provider.services.map((service) => (
                  <Card key={service.id} className="bg-gray-800 border-gray-700 overflow-hidden">
                    <div className="flex">
                      <div className="w-48 h-32 bg-gray-700 relative overflow-hidden">
                        <img 
                          src={service.image} 
                          alt={service.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="flex-1 p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-2">{service.name}</h3>
                            <p className="text-gray-300 mb-3">{service.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white">{service.price}</div>
                            <div className="text-sm text-gray-400">/ guest · {service.duration}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>Up to {service.maxGuests} guests</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{service.duration}</span>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleBookService(service)}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                          >
                            Book Now
                          </Button>
                        </div>
                        
                        <div className="mt-4">
                          <div className="flex flex-wrap gap-2">
                            {service.features.map((feature, index) => (
                              <Badge key={index} variant="secondary" className="bg-gray-700 text-gray-200">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Contact Card */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800 border-gray-700 sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Contact {provider.name}</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Response time:</span>
                    <span className="text-white">{provider.responseTime}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Languages:</span>
                    <span className="text-white">{provider.languages.join(', ')}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Rating:</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-white">{provider.rating} ({provider.reviewCount})</span>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full mb-4 bg-gray-700 hover:bg-gray-600 text-white"
                  onClick={() => toast({ title: "Message Feature", description: "Direct messaging coming soon!" })}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Host
                </Button>
                
                <p className="text-xs text-gray-400 text-center">
                  You can message {provider.name} to customize or make changes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="max-w-2xl bg-gray-900 border-gray-700 text-white">
          {selectedService && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  Book {selectedService.name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                    <input 
                      type="date" 
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Time</label>
                    <select 
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 outline-none"
                    >
                      <option value="09:00">9:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="16:00">4:00 PM</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Guests (max {selectedService.maxGuests})
                    </label>
                    <select 
                      value={guestCount}
                      onChange={(e) => setGuestCount(parseInt(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 outline-none"
                    >
                      {Array.from({ length: selectedService.maxGuests }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>{num} guest{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Booking Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-300">
                      <span>Service:</span>
                      <span>{selectedService.name}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Duration:</span>
                      <span>{selectedService.duration}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Guests:</span>
                      <span>{guestCount}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Price per guest:</span>
                      <span>{selectedService.price}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Service fee:</span>
                      <span>$5.00</span>
                    </div>
                    <div className="border-t border-gray-700 pt-2">
                      <div className="flex justify-between font-semibold text-white">
                        <span>Total:</span>
                        <span>${(parseInt(selectedService.price.replace('$', '')) * guestCount + 5).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmBooking}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Confirm Booking
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}