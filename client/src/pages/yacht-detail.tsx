import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Anchor, Users, Ruler, MapPin, Star, Calendar, Clock, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import type { Yacht } from "@shared/schema";

export default function YachtDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Parse booking parameters from URL
  const urlParams = new URLSearchParams(window.location.search);
  const selectedDate = urlParams.get('date') ? new Date(urlParams.get('date')!) : null;
  const selectedTime = urlParams.get('time');
  const duration = parseInt(urlParams.get('duration') || '4');
  
  const { data: yacht, isLoading } = useQuery<Yacht>({
    queryKey: [`/api/yachts/${id}`],
    enabled: !!id
  });

  const bookingMutation = useMutation({
    mutationFn: async () => {
      if (!yacht || !selectedDate || !selectedTime) throw new Error("Missing booking details");
      
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const startTime = new Date(selectedDate);
      startTime.setHours(hours, minutes, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + duration);
      
      const response = await apiRequest('POST', '/api/bookings', {
        yachtId: yacht.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        status: 'confirmed',
        totalPrice: "0.00"
      });
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({
        title: "Booking Confirmed!",
        description: `Your ${duration}-hour experience aboard ${yacht?.name} has been confirmed.`,
      });
      setLocation('/member/trips');
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Unable to complete booking. Please try again.",
        variant: "destructive",
      });
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!yacht) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Yacht Not Found</h2>
          <p className="text-gray-400">The yacht you're looking for doesn't exist.</p>
          <Link href="/yacht-search">
            <Button className="mt-4 bg-purple-600 hover:bg-purple-700">Search Yachts</Button>
          </Link>
        </div>
      </div>
    );
  }

  // If no booking parameters, redirect to search
  if (!selectedDate || !selectedTime) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center pb-32">
        <div className="text-center">
          <Anchor className="h-16 w-16 text-purple-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Complete Your Search First</h2>
          <p className="text-gray-400 mb-6">Please select your preferred date and time to continue booking.</p>
          <Link href="/yacht-search">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Calendar className="mr-2 h-4 w-4" />
              Search Available Yachts
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const startTime = selectedDate ? new Date(selectedDate) : new Date();
  if (selectedTime) {
    const [hours, minutes] = selectedTime.split(':').map(Number);
    startTime.setHours(hours, minutes, 0, 0);
  }
  const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);

  return (
    <div className="min-h-screen bg-black text-white overflow-auto pb-32">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-6 border-b border-gray-800"
      >
        <div className="flex items-center gap-4">
          <Link href="/yacht-search">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Confirm Booking</h1>
            <p className="text-gray-400">Review your yacht reservation details</p>
          </div>
        </div>
      </motion.div>

      <div className="p-6 space-y-6">
        {/* Booking Summary Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-purple-500/10 border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="h-6 w-6 text-green-400" />
                <h2 className="text-xl font-bold text-purple-300">Booking Details</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-400">Date</p>
                    <p className="font-medium">{format(selectedDate, 'MMMM d, yyyy')}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-400">Time</p>
                    <p className="font-medium">{format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-purple-600/20 rounded-lg">
                <p className="text-sm text-purple-200">
                  <strong>{duration} hour</strong> yacht experience included with your membership
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Yacht Details */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gray-900/50 border-gray-800">
            <div className="relative h-64 overflow-hidden rounded-t-lg">
              <img
                src={yacht.imageUrl ? `/api/media/${yacht.imageUrl}` : '/api/media/default-yacht.jpg'}
                alt={yacht.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4">
                <Badge className="bg-green-500/90 text-white">Available</Badge>
              </div>
            </div>
            
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold">{yacht.name}</h3>
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin className="h-4 w-4" />
                    {yacht.location}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-semibold">4.9</span>
                </div>
              </div>

              <Separator className="my-4 bg-gray-800" />

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-400">Capacity</p>
                    <p className="font-semibold">{yacht.capacity} guests</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Ruler className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-400">Length</p>
                    <p className="font-semibold">{yacht.size} feet</p>
                  </div>
                </div>
              </div>

              {yacht.description && (
                <>
                  <Separator className="my-4 bg-gray-800" />
                  <div>
                    <h4 className="font-semibold mb-2">About This Yacht</h4>
                    <p className="text-gray-300 text-sm leading-relaxed">{yacht.description}</p>
                  </div>
                </>
              )}

              {yacht.amenities && yacht.amenities.length > 0 && (
                <>
                  <Separator className="my-4 bg-gray-800" />
                  <div>
                    <h4 className="font-semibold mb-3">Amenities</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {yacht.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span className="text-gray-300">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Booking Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-4"
        >
          <Link href="/yacht-search" className="flex-1">
            <Button variant="outline" className="w-full border-gray-700 hover:bg-gray-800">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Change Selection
            </Button>
          </Link>
          
          <Button 
            onClick={() => bookingMutation.mutate()}
            disabled={bookingMutation.isPending}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            {bookingMutation.isPending ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirm Booking
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}