import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, MapPin, Users, DollarSign, ArrowLeft, CreditCard } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { Event } from "@shared/schema";

export default function EventDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: event, isLoading } = useQuery<Event>({
    queryKey: [`/api/events/${id}`],
    enabled: !!id
  });

  const handleRegisterNow = () => {
    if (!event) return;
    
    const ticketPrice = event.ticketPrice ? parseFloat(event.ticketPrice) : 0;
    
    // Store payment details for checkout
    localStorage.setItem('paymentAmount', String(ticketPrice));
    localStorage.setItem('paymentDescription', `${event.title} - Event Registration`);
    
    // Navigate to checkout
    setLocation('/checkout');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-yacht-dark to-yacht-accent flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-yacht-purple border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-yacht-dark to-yacht-accent flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
          <p className="text-gray-400">The event you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(new Date(date));
  };

  const formatDuration = (start: Date, end: Date) => {
    const duration = Math.abs(new Date(end).getTime() - new Date(start).getTime());
    const hours = Math.floor(duration / (1000 * 60 * 60));
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-yacht-dark to-yacht-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-yacht-silver">{event.title}</h1>
            <p className="text-yacht-silver/70 text-lg mt-2">{event.location}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="border-yacht-purple/50 text-yacht-purple hover:bg-yacht-purple/20">
              <i className="fas fa-share mr-2"></i>Share
            </Button>
            <Button variant="outline" size="sm" className="border-yacht-purple/50 text-yacht-purple hover:bg-yacht-purple/20">
              <i className="far fa-heart mr-2"></i>Save
            </Button>
          </div>
        </div>

        {/* Event Image */}
        <div className="mb-8">
          <img 
            src={event.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=600'} 
            alt={event.title}
            className="w-full h-96 object-cover rounded-2xl shadow-2xl"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-yacht-card/50 backdrop-blur-sm rounded-2xl p-6 border border-yacht-accent/30 hover:border-yacht-purple/30 transition-all duration-300">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-yacht-purple to-yacht-blue rounded-full flex items-center justify-center animate-glow">
                  <i className="fas fa-calendar-alt text-white text-xl"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-yacht-silver">Event Details</h2>
                  <div className="flex items-center mt-1">
                    <i className="fas fa-star text-yellow-400 text-sm"></i>
                    <span className="text-yacht-silver ml-1">5.0</span>
                    <span className="text-yacht-silver/60 ml-1">• Exclusive Experience</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-yacht-silver/70">Start Time:</span>
                  <span className="text-yacht-silver ml-2 block">{formatDate(event.startTime)}</span>
                </div>
                <div>
                  <span className="text-yacht-silver/70">End Time:</span>
                  <span className="text-yacht-silver ml-2 block">{formatDate(event.endTime)}</span>
                </div>
                <div>
                  <span className="text-yacht-silver/70">Duration:</span>
                  <span className="text-yacht-silver ml-2">{formatDuration(event.startTime, event.endTime)}</span>
                </div>
                <div>
                  <span className="text-yacht-silver/70">Capacity:</span>
                  <span className="text-yacht-silver ml-2">{event.capacity} guests</span>
                </div>
                <div>
                  <span className="text-yacht-silver/70">Status:</span>
                  <span className={`ml-2 ${event.isActive ? 'text-green-400' : 'text-red-400'}`}>
                    {event.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <span className="text-yacht-silver/70">Price:</span>
                  <span className="text-yacht-silver ml-2">${event.ticketPrice || 'Free'}</span>
                </div>
              </div>
            </div>

            {event.description && (
              <div className="bg-yacht-card/50 backdrop-blur-sm rounded-2xl p-6 border border-yacht-accent/30 hover:border-yacht-purple/30 transition-all duration-300">
                <h2 className="text-xl font-bold text-yacht-silver mb-4">About This Experience</h2>
                <p className="text-yacht-silver/80 leading-relaxed">{event.description}</p>
              </div>
            )}

            <div className="bg-yacht-card/50 backdrop-blur-sm rounded-2xl p-6 border border-yacht-accent/30 hover:border-yacht-purple/30 transition-all duration-300">
              <h2 className="text-xl font-bold text-yacht-silver mb-4">What's Included</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-check text-yacht-purple text-sm"></i>
                  <span className="text-yacht-silver/80">Premium venue access</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-check text-yacht-purple text-sm"></i>
                  <span className="text-yacht-silver/80">Gourmet catering and beverages</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-check text-yacht-purple text-sm"></i>
                  <span className="text-yacht-silver/80">Live entertainment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-check text-yacht-purple text-sm"></i>
                  <span className="text-yacht-silver/80">Networking opportunities</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-check text-yacht-purple text-sm"></i>
                  <span className="text-yacht-silver/80">Exclusive MBYC experience</span>
                </div>
              </div>
            </div>

            <div className="bg-yacht-card/50 backdrop-blur-sm rounded-2xl p-6 border border-yacht-accent/30 hover:border-yacht-purple/30 transition-all duration-300">
              <h2 className="text-xl font-bold text-yacht-silver mb-4">Dress Code & Guidelines</h2>
              <div className="space-y-3 text-yacht-silver/80">
                <p><strong>Dress Code:</strong> Smart casual to formal attire</p>
                <p><strong>Age Requirement:</strong> 21+ only</p>
                <p><strong>Cancellation Policy:</strong> Full refund up to 48 hours before event</p>
                <p><strong>Weather Policy:</strong> Event will proceed rain or shine</p>
              </div>
            </div>
          </div>

          {/* Right Column - Registration */}
          <div className="lg:col-span-1">
            <div className="bg-yacht-card/50 backdrop-blur-sm rounded-2xl p-6 border border-yacht-accent/30 sticky top-8 hover:border-yacht-purple/30 transition-all duration-300">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-yacht-silver mb-2">
                  {event.ticketPrice ? `$${event.ticketPrice}` : 'FREE'}
                </div>
                <p className="text-yacht-silver/70">per guest</p>
                <div className="flex items-center justify-center mt-2">
                  <i className="fas fa-star text-yellow-400 text-sm"></i>
                  <span className="text-yacht-silver ml-1">5.0</span>
                  <span className="text-yacht-silver/60 ml-1">• Exclusive</span>
                </div>
              </div>

              <Separator className="bg-yacht-accent/50 mb-6" />

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-yacht-silver/80 mb-2">Number of Tickets</label>
                  <select className="w-full bg-yacht-dark/50 border border-yacht-accent/30 rounded-lg px-3 py-2 text-yacht-silver focus:border-yacht-purple focus:ring-2 focus:ring-yacht-purple/20 outline-none transition-all duration-300">
                    {[...Array(Math.min(event.capacity, 10))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1} ticket{i > 0 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-yacht-silver/80 mb-2">Guest Information</label>
                  <input 
                    type="text" 
                    placeholder="Primary guest name"
                    className="w-full bg-yacht-dark/50 border border-yacht-accent/30 rounded-lg px-3 py-2 text-yacht-silver placeholder-gray-500 focus:border-yacht-purple focus:ring-2 focus:ring-yacht-purple/20 outline-none transition-all duration-300"
                  />
                </div>
                <div>
                  <input 
                    type="email" 
                    placeholder="Contact email"
                    className="w-full bg-yacht-dark/50 border border-yacht-accent/30 rounded-lg px-3 py-2 text-yacht-silver placeholder-gray-500 focus:border-yacht-purple focus:ring-2 focus:ring-yacht-purple/20 outline-none transition-all duration-300"
                  />
                </div>
              </div>

              <Button 
                onClick={handleRegisterNow}
                className="w-full bg-gradient-to-r from-yacht-purple to-yacht-blue hover:from-yacht-purple/80 hover:to-yacht-blue/80 font-semibold py-3 mb-4 animate-glow"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {event.ticketPrice ? 'Purchase Tickets' : 'Register Free'}
              </Button>

              <p className="text-xs text-yacht-silver/50 text-center mb-4">
                {event.ticketPrice ? 'Secure payment with Stripe' : 'Free registration for MBYC members'}
              </p>

              <Separator className="bg-yacht-accent/50 my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-yacht-silver/80">
                  <span>Ticket price</span>
                  <span>{event.ticketPrice ? `$${event.ticketPrice}` : '$0'}</span>
                </div>
                <div className="flex justify-between text-yacht-silver/80">
                  <span>Service fee</span>
                  <span>{event.ticketPrice ? '$5' : '$0'}</span>
                </div>
                <div className="flex justify-between text-yacht-silver/80">
                  <span>MBYC member discount</span>
                  <span className="text-green-400">-10%</span>
                </div>
                <Separator className="bg-yacht-accent/50" />
                <div className="flex justify-between font-semibold text-yacht-silver">
                  <span>Total</span>
                  <span>
                    {event.ticketPrice 
                      ? `$${(parseFloat(event.ticketPrice) * 0.9 + 5).toFixed(2)}`
                      : 'FREE'
                    }
                  </span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yacht-purple/10 rounded-lg border border-yacht-purple/30">
                <div className="flex items-center space-x-2 mb-2">
                  <i className="fas fa-crown text-yacht-purple"></i>
                  <span className="text-yacht-silver font-medium">MBYC Original</span>
                </div>
                <p className="text-xs text-yacht-silver/70">
                  This exclusive experience was designed by MBYC specifically for our members.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
