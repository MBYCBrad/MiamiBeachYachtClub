import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, DollarSign, Star, MapPin, Calendar, CreditCard } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import type { Service } from "@shared/schema";
import { useState } from "react";

interface ServiceDetailProps {
  serviceId?: string;
  onBack?: () => void;
}

export default function ServiceDetail({ serviceId, onBack }: ServiceDetailProps) {
  const { id: paramId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('14:00');
  
  const id = serviceId || paramId;
  
  const { data: service, isLoading } = useQuery<Service>({
    queryKey: [`/api/services/${id}`],
    enabled: !!id
  });

  const createServiceBookingMutation = useMutation({
    mutationFn: async (bookingData: {
      serviceId: number;
      bookingDate: string;
      status: string;
    }) => {
      const response = await apiRequest('POST', '/api/service-bookings', bookingData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-bookings'] });
      toast({
        title: "Service Booked Successfully!",
        description: `Your ${service?.name} booking has been confirmed for ${new Date(selectedDate + 'T' + selectedTime).toLocaleDateString()}.`,
      });
      // Navigate back or to trips page
      if (onBack) {
        onBack();
      } else {
        setLocation('/trips');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to book service. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleBookNow = () => {
    if (!service || !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book this service.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDate) {
      toast({
        title: "Date Required",
        description: "Please select a date for your service booking.",
        variant: "destructive",
      });
      return;
    }

    const bookingDateTime = `${selectedDate}T${selectedTime}:00.000Z`;
    
    createServiceBookingMutation.mutate({
      serviceId: service.id,
      bookingDate: bookingDateTime,
      status: 'confirmed'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-2">Service Not Found</h1>
          <p className="text-gray-400">The service you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">{service.name}</h1>
            <p className="text-gray-400 capitalize">{service.category} Service</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="border-purple-600/50 text-purple-400">
              <i className="fas fa-share mr-2"></i>Share
            </Button>
            <Button variant="outline" size="sm" className="border-purple-600/50 text-purple-400">
              <i className="far fa-heart mr-2"></i>Save
            </Button>
          </div>
        </div>

        {/* Service Image */}
        <div className="mb-8">
          <img 
            src={service.imageUrl || 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=600'} 
            alt={service.name}
            className="w-full h-96 object-cover rounded-2xl"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full flex items-center justify-center border-2 border-purple-600/30">
                  <i className="fas fa-user text-purple-400 text-xl"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Professional Service Provider</h2>
                  <div className="flex items-center mt-1">
                    <i className="fas fa-star text-yellow-400 text-sm"></i>
                    <span className="text-white ml-1">{service.rating || '5.0'}</span>
                    <span className="text-gray-400 ml-1">• {service.reviewCount} reviews</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Category:</span>
                  <span className="text-white ml-2 capitalize">{service.category}</span>
                </div>
                <div>
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-white ml-2">{service.duration || 60} minutes</span>
                </div>
                <div>
                  <span className="text-gray-400">Availability:</span>
                  <span className={`ml-2 ${service.isAvailable ? 'text-green-400' : 'text-red-400'}`}>
                    {service.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Price:</span>
                  <span className="text-white ml-2">${service.pricePerSession}</span>
                </div>
              </div>
            </div>

            {service.description && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30">
                <h2 className="text-xl font-bold text-white mb-4">About This Service</h2>
                <p className="text-gray-300 leading-relaxed">{service.description}</p>
              </div>
            )}

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30">
              <h2 className="text-xl font-bold text-white mb-4">What's Included</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-check text-purple-400 text-sm"></i>
                  <span className="text-gray-300">Professional service delivery</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-check text-purple-400 text-sm"></i>
                  <span className="text-gray-300">All necessary equipment and supplies</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-check text-purple-400 text-sm"></i>
                  <span className="text-gray-300">Personalized consultation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-check text-purple-400 text-sm"></i>
                  <span className="text-gray-300">Flexible scheduling</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30 sticky top-8">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-white mb-2">${service.pricePerSession}</div>
                <p className="text-gray-400">per session</p>
                <div className="flex items-center justify-center mt-2">
                  <i className="fas fa-star text-yellow-400 text-sm"></i>
                  <span className="text-white ml-1">{service.rating || '5.0'}</span>
                  <span className="text-gray-400 ml-1">• {service.reviewCount} reviews</span>
                </div>
              </div>

              <Separator className="bg-gray-700/50 mb-6" />

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Time</label>
                  <select 
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 outline-none"
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">Duration</label>
                  <p className="text-white">{service.duration || 60} minutes</p>
                </div>
              </div>

              <Button 
                onClick={handleBookNow}
                disabled={!service.isAvailable || createServiceBookingMutation.isPending}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 font-semibold py-3 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {createServiceBookingMutation.isPending ? 'Booking...' : 
                 !service.isAvailable ? 'Unavailable' : 'Book Now'}
              </Button>

              <p className="text-xs text-gray-500 text-center mb-4">
                Secure payment with Stripe
              </p>

              <Separator className="bg-gray-700/50 my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Service fee</span>
                  <span>${service.pricePerSession}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Processing fee</span>
                  <span>$5</span>
                </div>
                <Separator className="bg-gray-700/50" />
                <div className="flex justify-between font-semibold text-white">
                  <span>Total</span>
                  <span>${(parseFloat(service.pricePerSession || '0') + 5).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
