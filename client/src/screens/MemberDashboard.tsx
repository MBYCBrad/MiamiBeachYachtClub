import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Anchor, 
  Search, 
  Calendar, 
  Clock, 
  Users, 
  Star, 
  CreditCard, 
  Phone, 
  MessageCircle,
  Filter,
  MapPin,
  Fuel,
  UserCheck
} from 'lucide-react';
import { getMembershipBenefits, canBookYacht, calculateEventPrice, calculateServicePrice } from '@shared/membership';
import { TokenManager } from '@shared/tokens';
import { StripeService } from '@/services/stripe';
import { ConciergeService } from '@/services/concierge';
import type { Yacht, Service, Event, User } from '@shared/schema';

interface TokenBalance {
  currentTokens: number;
  monthlyAllocation: number;
  lastReset: Date;
}

const MemberDashboard: React.FC = () => {
  const { user, logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<'bookings' | 'services' | 'experiences'>('bookings');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [yachtFilters, setYachtFilters] = useState({
    maxSize: 200,
    location: '',
    amenities: [] as string[]
  });

  // Fetch member's token balance
  const { data: tokenBalance } = useQuery<TokenBalance>({
    queryKey: ['/api/tokens/balance'],
    enabled: !!user
  });

  // Fetch available yachts with membership tier filtering
  const { data: yachts = [], isLoading: yachtsLoading } = useQuery<Yacht[]>({
    queryKey: ['/api/yachts', user?.membershipTier],
    enabled: !!user
  });

  // Fetch available services
  const { data: services = [], isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ['/api/services'],
    enabled: !!user
  });

  // Fetch upcoming events
  const { data: events = [], isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ['/api/events'],
    enabled: !!user
  });

  // Filter yachts based on membership tier and search criteria
  const filteredYachts = yachts.filter(yacht => {
    if (!user?.membershipTier) return false;
    
    // Check membership tier yacht size restrictions
    const canBook = canBookYacht(user.membershipTier, yacht.size);
    if (!canBook) return false;

    // Apply search filter
    if (searchQuery && !yacht.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Apply size filter
    if (yacht.size > yachtFilters.maxSize) return false;

    // Apply location filter
    if (yachtFilters.location && !yacht.location.toLowerCase().includes(yachtFilters.location.toLowerCase())) {
      return false;
    }

    return true;
  });

  // Filter services based on search
  const filteredServices = services.filter(service => {
    if (!searchQuery) return true;
    return service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           service.category.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Filter events based on search and upcoming dates
  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.startDate);
    const isUpcoming = eventDate >= new Date();
    
    if (!isUpcoming) return false;
    
    if (!searchQuery) return true;
    return event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           event.category.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const membershipBenefits = user?.membershipTier ? getMembershipBenefits(user.membershipTier) : null;

  const handleYachtBooking = async (yacht: Yacht, duration: number) => {
    if (!user || !tokenBalance) return;

    const tokensRequired = TokenManager.calculateTokensForBooking(duration);
    
    if (!TokenManager.hasEnoughTokens(tokenBalance, tokensRequired)) {
      alert(`Insufficient tokens. You need ${tokensRequired} tokens but only have ${tokenBalance.currentTokens}.`);
      return;
    }

    try {
      // Create booking without payment (free for members)
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          yachtId: yacht.id,
          userId: user.id,
          startTime: selectedDate.toISOString(),
          duration: duration,
          tokensUsed: tokensRequired
        })
      });

      if (response.ok) {
        alert('Yacht booked successfully!');
        // Refresh token balance and bookings
      } else {
        alert('Booking failed. Please try again.');
      }
    } catch (error) {
      alert('Booking error. Please contact concierge.');
    }
  };

  const handleServiceBooking = async (service: Service) => {
    if (!user) return;

    try {
      const adjustedPrice = calculateServicePrice(parseFloat(service.price), user.membershipTier);
      const paymentIntent = await StripeService.createServicePaymentIntent({
        serviceId: service.id,
        userId: user.id,
        datetime: selectedDate,
        memberTier: user.membershipTier
      }, parseFloat(service.price));

      // Open Stripe payment modal here
      console.log('Payment intent created:', paymentIntent);
    } catch (error) {
      alert('Payment setup failed. Please try again.');
    }
  };

  const handleEventRegistration = async (event: Event, ticketQuantity: number = 1) => {
    if (!user) return;

    try {
      const adjustedPrice = calculateEventPrice(parseFloat(event.ticketPrice), user.membershipTier);
      const paymentIntent = await StripeService.createEventPaymentIntent({
        eventId: event.id,
        userId: user.id,
        memberTier: user.membershipTier,
        ticketQuantity
      }, parseFloat(event.ticketPrice));

      // Open Stripe payment modal here
      console.log('Event payment intent created:', paymentIntent);
    } catch (error) {
      alert('Registration setup failed. Please try again.');
    }
  };

  const initiateVoiceCall = async () => {
    if (!user) return;

    try {
      await ConciergeService.initiateVoiceCall({
        userId: user.id,
        memberName: user.username,
        memberTier: user.membershipTier || 'bronze',
        callType: 'general_inquiry',
        priority: 'normal'
      });
    } catch (error) {
      alert('Concierge call failed. Please try again.');
    }
  };

  const startConciergeChat = async () => {
    if (!user) return;

    try {
      const conversationId = await ConciergeService.startChatConversation(
        user.id,
        'Hello, I need assistance with my yacht club membership.'
      );
      // Open chat interface with conversationId
      console.log('Chat started:', conversationId);
    } catch (error) {
      alert('Chat service unavailable. Please try calling.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-purple-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <Anchor className="text-white text-lg" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Miami Beach Yacht Club
              </h1>
            </div>

            {/* Member Info & Tokens */}
            <div className="flex items-center space-x-4">
              <div className="text-white text-sm">
                <div className="flex items-center space-x-2">
                  <span>Welcome, {user?.username}</span>
                  <Badge className="bg-gradient-to-r from-purple-600 to-blue-600">
                    {user?.membershipTier?.toUpperCase()}
                  </Badge>
                </div>
                {tokenBalance && (
                  <div className="text-xs text-gray-400 mt-1">
                    Tokens: {tokenBalance.currentTokens}/{tokenBalance.monthlyAllocation}
                  </div>
                )}
              </div>

              {/* Concierge Access */}
              {membershipBenefits?.conciergeAccess && (
                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={initiateVoiceCall}
                    size="sm" 
                    variant="outline"
                    className="border-purple-600/50 text-purple-400 hover:bg-purple-600/20"
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    Call
                  </Button>
                  <Button 
                    onClick={startConciergeChat}
                    size="sm" 
                    variant="outline"
                    className="border-purple-600/50 text-purple-400 hover:bg-purple-600/20"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Chat
                  </Button>
                </div>
              )}

              <Button
                onClick={() => logoutMutation.mutate()}
                variant="outline"
                size="sm"
                className="border-purple-600/50 text-purple-400 hover:bg-purple-600/20"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="py-6">
            <div className="flex items-center bg-gray-800/50 backdrop-blur-sm rounded-full px-6 py-3 border border-purple-800/30">
              <Search className="w-5 h-5 text-gray-400 mr-3" />
              <Input
                type="text"
                placeholder="Search yachts, services, events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-white placeholder-gray-400 border-none flex-1"
              />
              <Filter className="w-5 h-5 text-gray-400 ml-3" />
            </div>
          </div>

          {/* Three-Tab Navigation */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 border border-purple-800/30">
              <TabsTrigger 
                value="bookings" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600"
              >
                <Anchor className="w-4 h-4 mr-2" />
                Yacht Bookings
              </TabsTrigger>
              <TabsTrigger 
                value="services"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600"
              >
                <Star className="w-4 h-4 mr-2" />
                Premium Services
              </TabsTrigger>
              <TabsTrigger 
                value="experiences"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Exclusive Events
              </TabsTrigger>
            </TabsList>

            {/* Yacht Bookings Tab */}
            <TabsContent value="bookings" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredYachts.map((yacht) => (
                  <Card key={yacht.id} className="bg-gray-800/50 border-purple-800/30 hover:border-purple-600/50 transition-all duration-300">
                    <div className="aspect-video relative rounded-t-lg overflow-hidden">
                      <img 
                        src={yacht.imageUrl || '/yacht-placeholder.jpg'} 
                        alt={yacht.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <Badge className="bg-green-600">
                          <Fuel className="w-3 h-3 mr-1" />
                          Fuel Included
                        </Badge>
                        <Badge className="bg-blue-600">
                          <UserCheck className="w-3 h-3 mr-1" />
                          Crew Included
                        </Badge>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-white">{yacht.name}</CardTitle>
                      <CardDescription className="text-gray-300">
                        {yacht.size}ft • {yacht.capacity} guests
                      </CardDescription>
                      <div className="flex items-center text-sm text-gray-400">
                        <MapPin className="w-4 h-4 mr-1" />
                        {yacht.location}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 text-sm mb-4">{yacht.description}</p>
                      
                      {/* Amenities */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {yacht.amenities?.slice(0, 3).map((amenity, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {yacht.amenities && yacht.amenities.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{yacht.amenities.length - 3} more
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                          <Clock className="w-4 h-4 inline mr-1" />
                          Tokens: {TokenManager.calculateTokensForBooking(4)} per 4hrs
                        </div>
                        <Button 
                          onClick={() => handleYachtBooking(yacht, 4)}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                          disabled={!tokenBalance || tokenBalance.currentTokens < TokenManager.calculateTokensForBooking(4)}
                        >
                          Book Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Premium Services Tab */}
            <TabsContent value="services" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => {
                  const originalPrice = parseFloat(service.price);
                  const memberPrice = user?.membershipTier ? calculateServicePrice(originalPrice, user.membershipTier) : originalPrice;
                  const savings = originalPrice - memberPrice;

                  return (
                    <Card key={service.id} className="bg-gray-800/50 border-purple-800/30 hover:border-purple-600/50 transition-all duration-300">
                      <div className="aspect-video relative rounded-t-lg overflow-hidden">
                        <img 
                          src={service.imageUrl || '/service-placeholder.jpg'} 
                          alt={service.name}
                          className="w-full h-full object-cover"
                        />
                        {savings > 0 && (
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-green-600">
                              Save ${savings.toFixed(0)}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <CardHeader>
                        <CardTitle className="text-white">{service.name}</CardTitle>
                        <CardDescription className="text-gray-300">
                          {service.category} • {service.duration}hrs
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300 text-sm mb-4">{service.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-white">
                            {savings > 0 ? (
                              <div>
                                <span className="text-lg font-semibold">${memberPrice.toFixed(0)}</span>
                                <span className="text-sm text-gray-400 line-through ml-2">${originalPrice.toFixed(0)}</span>
                              </div>
                            ) : (
                              <span className="text-lg font-semibold">${memberPrice.toFixed(0)}</span>
                            )}
                          </div>
                          <Button 
                            onClick={() => handleServiceBooking(service)}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                          >
                            <CreditCard className="w-4 h-4 mr-1" />
                            Book Service
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Exclusive Events Tab */}
            <TabsContent value="experiences" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => {
                  const originalPrice = parseFloat(event.ticketPrice);
                  const memberPrice = user?.membershipTier ? calculateEventPrice(originalPrice, user.membershipTier) : originalPrice;
                  const savings = originalPrice - memberPrice;
                  const eventDate = new Date(event.startDate);

                  return (
                    <Card key={event.id} className="bg-gray-800/50 border-purple-800/30 hover:border-purple-600/50 transition-all duration-300">
                      <div className="aspect-video relative rounded-t-lg overflow-hidden">
                        <img 
                          src={event.imageUrl || '/event-placeholder.jpg'} 
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                        {savings > 0 && (
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-green-600">
                              Member Discount: {membershipBenefits?.eventDiscounts}%
                            </Badge>
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-purple-600">
                            {event.category}
                          </Badge>
                        </div>
                      </div>
                      <CardHeader>
                        <CardTitle className="text-white">{event.title}</CardTitle>
                        <CardDescription className="text-gray-300">
                          {eventDate.toLocaleDateString('en-US', { 
                            weekday: 'long',
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </CardDescription>
                        <div className="flex items-center text-sm text-gray-400">
                          <MapPin className="w-4 h-4 mr-1" />
                          {event.location}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300 text-sm mb-4">{event.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-white">
                            {savings > 0 ? (
                              <div>
                                <span className="text-lg font-semibold">${memberPrice.toFixed(0)}</span>
                                <span className="text-sm text-gray-400 line-through ml-2">${originalPrice.toFixed(0)}</span>
                              </div>
                            ) : (
                              <span className="text-lg font-semibold">${memberPrice.toFixed(0)}</span>
                            )}
                          </div>
                          <Button 
                            onClick={() => handleEventRegistration(event)}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                          >
                            <Calendar className="w-4 h-4 mr-1" />
                            Register
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default MemberDashboard;