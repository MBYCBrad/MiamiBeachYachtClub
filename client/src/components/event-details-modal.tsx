import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, MapPin, Users, Clock, Star, Heart, DollarSign, User, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Event } from "@shared/schema";
import { format } from "date-fns";

interface EventDetailsModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EventDetailsModal({ event, isOpen, onClose }: EventDetailsModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Event registration mutation
  const registerMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("Please log in to register for events");
      }
      if (!event) {
        throw new Error("No event selected");
      }
      
      return apiRequest("POST", "/api/event-registrations", {
        eventId: event.id,
        ticketCount: 1
      });
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful",
        description: "You've successfully registered for this event!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/event-registrations"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register for event",
        variant: "destructive",
      });
    },
  });

  // Early return after all hooks
  if (!event) return null;

  // Parse event images
  const eventImages = event.images && Array.isArray(event.images) ? event.images : [];
  const displayImages = eventImages.length > 0 ? eventImages : [event.imageUrl].filter(Boolean) as string[];

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === displayImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
  };

  const formatEventDate = (date: Date | string) => {
    try {
      const eventDate = typeof date === 'string' ? new Date(date) : date;
      return format(eventDate, "EEEE, MMMM d, yyyy 'at' h:mm a");
    } catch {
      return "Date TBD";
    }
  };

  const formatEventTime = (startTime: Date | string, endTime: Date | string) => {
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const startStr = format(start, "h:mm a");
      const endStr = format(end, "h:mm a");
      return `${startStr} - ${endStr}`;
    } catch {
      return "Time TBD";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black border border-gray-700/50 text-white">
        <DialogTitle className="sr-only">{event.title}</DialogTitle>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-800/80 hover:bg-gray-700/80 transition-colors"
        >
          <X size={20} className="text-gray-400" />
        </button>

        <div className="space-y-6">
          {/* Image Gallery */}
          {displayImages.length > 0 && (
            <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={displayImages[currentImageIndex]}
                  alt={event.title}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>

              {/* Image Navigation */}
              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft size={20} className="text-white" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight size={20} className="text-white" />
                  </button>

                  {/* Image Indicators */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {displayImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex
                            ? "bg-white"
                            : "bg-white/50 hover:bg-white/70"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Event Header */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  {event.title}
                </h2>
                <div className="flex items-center space-x-4 text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Calendar size={16} />
                    <span className="text-sm">
                      {formatEventDate(event.startTime)}
                    </span>
                  </div>
                  {event.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin size={16} />
                      <span className="text-sm">{event.location}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end space-y-2">
                {event.ticketPrice && parseFloat(event.ticketPrice) > 0 ? (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white flex items-center">
                      <DollarSign size={20} />
                      {event.ticketPrice}
                    </div>
                    <span className="text-sm text-gray-400">per ticket</span>
                  </div>
                ) : (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">FREE</div>
                    <span className="text-sm text-gray-400">for members</span>
                  </div>
                )}
              </div>
            </div>

            {/* Event Stats */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg px-3 py-2">
                <Users size={16} className="text-purple-400" />
                <span className="text-sm">
                  {event.capacity ? `Up to ${event.capacity} guests` : "Capacity TBD"}
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg px-3 py-2">
                <Clock size={16} className="text-blue-400" />
                <span className="text-sm">
                  {formatEventTime(event.startTime, event.endTime)}
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg px-3 py-2">
                <Star size={16} className="text-yellow-400" />
                <span className="text-sm">4.8 rating</span>
              </div>
            </div>
          </div>

          {/* Event Description */}
          {event.description && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">About This Event</h3>
              <p className="text-gray-300 leading-relaxed">
                {event.description}
              </p>
            </div>
          )}

          {/* Event Type Badge */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Event Type</h3>
            <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              Yacht Club Event
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => registerMutation.mutate()}
              disabled={registerMutation.isPending}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-600/30"
            >
              {registerMutation.isPending ? "Registering..." : "Register for Event"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}