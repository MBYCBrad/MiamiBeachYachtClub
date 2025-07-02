import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, DollarSign, Users, Calendar as CalendarIcon, Home, Building2, Anchor } from "lucide-react";
import { format } from "date-fns";

interface Service {
  id: number;
  name: string;
  category: string;
  description: string;
  imageUrl?: string;
  pricePerSession: string;
  duration?: number;
  deliveryType: 'yacht' | 'location' | 'marina' | 'external_location';
  serviceAreas?: string[];
  requiresAddress: boolean;
  marinaLocation?: string;
  businessAddress?: string;
  rating: string;
  reviewCount: number;
}

interface ServiceBookingModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bookingData: any) => void;
}

const deliveryTypeConfig = {
  yacht: {
    icon: Anchor,
    label: "Yacht Add-On",
    description: "Service provided on yacht during charter",
    color: "bg-blue-500"
  },
  location: {
    icon: Home,
    label: "At Your Location",
    description: "Service provider comes to your address",
    color: "bg-green-500"
  },
  marina: {
    icon: Building2,
    label: "Marina Service",
    description: "Service provided at marina before boarding",
    color: "bg-purple-500"
  },
  external_location: {
    icon: MapPin,
    label: "Visit Location",
    description: "You visit service provider's business",
    color: "bg-orange-500"
  }
};

export default function ServiceBookingModal({ service, isOpen, onClose, onConfirm }: ServiceBookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [serviceAddress, setServiceAddress] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  if (!service) return null;

  const deliveryConfig = deliveryTypeConfig[service.deliveryType];
  const DeliveryIcon = deliveryConfig.icon;

  const handleConfirm = () => {
    const bookingData = {
      serviceId: service.id,
      bookingDate: selectedDate,
      bookingTime: selectedTime,
      guestCount,
      serviceAddress: service.requiresAddress ? serviceAddress : null,
      deliveryNotes,
      specialRequests,
      totalPrice: parseFloat(service.pricePerSession)
    };
    onConfirm(bookingData);
  };

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", 
    "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Book {service.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Service Info Card */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {service.imageUrl && (
                  <img 
                    src={service.imageUrl} 
                    alt={service.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <DeliveryIcon className={`w-5 h-5 text-white p-1 rounded-full ${deliveryConfig.color}`} />
                    <Badge className={`${deliveryConfig.color} text-white`}>
                      {deliveryConfig.label}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg">{service.name}</h3>
                  <p className="text-gray-400 text-sm mb-2">{deliveryConfig.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      ${service.pricePerSession}
                    </div>
                    {service.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {service.duration} min
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Service Location
              </h4>
              
              {service.deliveryType === 'yacht' && (
                <div className="text-gray-300">
                  <p>This service will be provided directly on your chartered yacht.</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Add this service to any yacht booking for an enhanced experience.
                  </p>
                </div>
              )}

              {service.deliveryType === 'marina' && service.marinaLocation && (
                <div className="text-gray-300">
                  <p className="font-medium">{service.marinaLocation}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Service provided at marina before your yacht departure.
                  </p>
                </div>
              )}

              {service.deliveryType === 'external_location' && service.businessAddress && (
                <div className="text-gray-300">
                  <p className="font-medium">{service.businessAddress}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    You'll visit the service provider's location.
                  </p>
                  {service.serviceAreas && service.serviceAreas.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-400">Service areas:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {service.serviceAreas.map((area) => (
                          <Badge key={area} variant="outline" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {service.deliveryType === 'location' && (
                <div className="text-gray-300">
                  <p>Service provider will come to your specified location.</p>
                  {service.serviceAreas && service.serviceAreas.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-400">Available in:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {service.serviceAreas.map((area) => (
                          <Badge key={area} variant="outline" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Date and Time Selection */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Select Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                className="rounded-md border border-gray-700 bg-black text-white [&_.rdp-day]:text-white [&_.rdp-day_button]:text-white [&_.rdp-nav_button]:text-white [&_.rdp-caption]:text-white [&_.rdp-head_cell]:text-gray-400"
              />
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Select Time</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Choose time slot" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time} className="text-white hover:bg-gray-700">
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Number of Guests</Label>
                <Select value={guestCount.toString()} onValueChange={(value) => setGuestCount(parseInt(value))}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((count) => (
                      <SelectItem key={count} value={count.toString()} className="text-white hover:bg-gray-700">
                        {count} {count === 1 ? 'Guest' : 'Guests'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Address Input for Location Services */}
          {service.requiresAddress && (
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Service Address *
              </Label>
              <Input
                value={serviceAddress}
                onChange={(e) => setServiceAddress(e.target.value)}
                placeholder="Enter your address (hotel, home, etc.)"
                className="bg-gray-800 border-gray-700 text-white"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Service provider will meet you at this location.
              </p>
            </div>
          )}

          {/* Delivery Notes */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Delivery Notes
            </Label>
            <Textarea
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="Any specific instructions for the service provider..."
              className="bg-gray-800 border-gray-700 text-white resize-none"
              rows={2}
            />
          </div>

          {/* Special Requests */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Special Requests
            </Label>
            <Textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Any special requirements or preferences..."
              className="bg-gray-800 border-gray-700 text-white resize-none"
              rows={2}
            />
          </div>

          {/* Price Summary */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Price</span>
                <span className="text-2xl font-bold text-green-400">
                  ${service.pricePerSession}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {service.deliveryType === 'yacht' ? 'Add-on service pricing' : 'Service session pricing'}
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedDate || !selectedTime || (service.requiresAddress && !serviceAddress)}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              Book Service - ${service.pricePerSession}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}