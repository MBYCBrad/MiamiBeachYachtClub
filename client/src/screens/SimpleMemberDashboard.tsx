import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Anchor, Calendar, Star, CreditCard, Phone } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Text } from '@/components/native/Text';
import { View } from '@/components/native/View';
import YachtCard from '@/components/yacht-card';
import type { Yacht, Service, Event } from '@shared/schema';

export default function SimpleMemberDashboard() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Fetch yachts
  const { data: yachts = [], isLoading: yachtsLoading } = useQuery<Yacht[]>({
    queryKey: ['/api/yachts'],
  });

  // Fetch services
  const { data: services = [], isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ['/api/services'],
  });

  // Fetch events
  const { data: events = [], isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

  const handleYachtBooking = async (yachtId: number) => {
    console.log('Booking yacht:', yachtId);
    // Simplified booking logic
  };

  const handleServiceBooking = async (serviceId: number) => {
    console.log('Booking service:', serviceId);
    // Simplified booking logic
  };

  const handleEventRegistration = async (eventId: number) => {
    console.log('Registering for event:', eventId);
    // Simplified registration logic
  };

  if (!user) return null;

  return (
    <View className="p-4 space-y-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen">
      {/* Header */}
      <View className="text-center space-y-2">
        <Text className="text-3xl font-bold text-white">
          Welcome, {user.username}
        </Text>
        <Badge variant="secondary" className="bg-purple-600 text-white">
          {user.membershipTier || 'Bronze'} Member
        </Badge>
      </View>

      <Tabs defaultValue="yachts" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800">
          <TabsTrigger value="yachts" className="text-white data-[state=active]:bg-purple-600">
            <Anchor className="w-4 h-4 mr-2" />
            Yachts
          </TabsTrigger>
          <TabsTrigger value="services" className="text-white data-[state=active]:bg-purple-600">
            <Star className="w-4 h-4 mr-2" />
            Services
          </TabsTrigger>
          <TabsTrigger value="events" className="text-white data-[state=active]:bg-purple-600">
            <Calendar className="w-4 h-4 mr-2" />
            Events
          </TabsTrigger>
        </TabsList>

        {/* Yachts Tab */}
        <TabsContent value="yachts" className="space-y-4">
          <Text className="text-xl font-semibold text-white">Available Yachts</Text>
          {yachtsLoading ? (
            <Text className="text-white">Loading yachts...</Text>
          ) : (
            <View className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {yachts.map((yacht, index) => (
                <YachtCard key={yacht.id} yacht={yacht} index={index} />
              ))}
            </View>
          )}
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <Text className="text-xl font-semibold text-white">Premium Services</Text>
          {servicesLoading ? (
            <Text className="text-white">Loading services...</Text>
          ) : (
            <View className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <Card key={service.id} className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">{service.name}</CardTitle>
                    <CardDescription className="text-slate-300">
                      {service.category}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Text className="text-slate-300 mb-4">{service.description}</Text>
                    <Text className="text-purple-400 font-bold mb-4">
                      ${service.pricePerSession}/session
                    </Text>
                    <Button 
                      onClick={() => handleServiceBooking(service.id)}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      Book Service
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </View>
          )}
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Text className="text-xl font-semibold text-white">Exclusive Events</Text>
          {eventsLoading ? (
            <Text className="text-white">Loading events...</Text>
          ) : (
            <View className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <Card key={event.id} className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">{event.title}</CardTitle>
                    <CardDescription className="text-slate-300">
                      {event.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Text className="text-slate-300 mb-2">
                      {new Date(event.startTime).toLocaleDateString()}
                    </Text>
                    <Text className="text-slate-300 mb-4">{event.description}</Text>
                    <Text className="text-purple-400 font-bold mb-4">
                      ${event.ticketPrice}/ticket
                    </Text>
                    <Button 
                      onClick={() => handleEventRegistration(event.id)}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      Register
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </View>
          )}
        </TabsContent>
      </Tabs>

      {/* Concierge Quick Access */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Phone className="w-5 h-5 mr-2" />
            24/7 Concierge Service
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            Contact Concierge
          </Button>
        </CardContent>
      </Card>
    </View>
  );
}