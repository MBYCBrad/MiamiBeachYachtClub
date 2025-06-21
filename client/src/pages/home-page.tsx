import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import BottomNavigation from "@/components/bottom-navigation";
import HeroSection from "@/components/hero-section";
import SearchFilters from "@/components/search-filters";
import YachtCard from "@/components/yacht-card";
import ServiceCard from "@/components/service-card";
import EventCard from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserRole } from "@shared/schema";
import type { Yacht, Service, Event } from "@shared/schema";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<'bookings' | 'services' | 'experiences'>('bookings');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: yachts = [], isLoading: yachtsLoading } = useQuery<Yacht[]>({
    queryKey: ['/api/yachts', { available: true }],
    enabled: activeTab === 'bookings'
  });

  const { data: services = [], isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ['/api/services', { available: true }],
    enabled: activeTab === 'services'
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ['/api/events', { upcoming: true, active: true }],
    enabled: activeTab === 'experiences'
  });

  const getRoleDisplayName = (role: string) => {
    const roleMap = {
      [UserRole.MEMBER]: 'Member',
      [UserRole.YACHT_OWNER]: 'Yacht Owner',
      [UserRole.SERVICE_PROVIDER]: 'Service Provider',
      [UserRole.ADMIN]: 'Admin'
    };
    return roleMap[role as keyof typeof roleMap] || role;
  };

  const getMembershipBadge = (tier?: string | null) => {
    if (!tier) return null;
    const colors = {
      bronze: 'bg-orange-600',
      silver: 'bg-gray-400',
      gold: 'bg-yellow-500',
      platinum: 'bg-purple-500'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${colors[tier as keyof typeof colors] || 'bg-gray-500'}`}>
        {tier.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-purple-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center animate-pulse">
                <i className="fas fa-anchor text-white text-lg"></i>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Miami Beach Yacht Club
              </h1>
            </div>

            {/* Search Bar (Desktop) */}
            <div className="hidden md:flex items-center bg-gray-800/50 backdrop-blur-sm rounded-full px-6 py-3 border border-purple-800/30 hover:border-purple-600/50 transition-all duration-300">
              <Input
                type="text"
                placeholder="Search destinations, yachts, experiences..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-white placeholder-gray-400 outline-none border-none min-w-[300px]"
              />
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-full p-2 ml-2">
                <i className="fas fa-search text-white text-sm"></i>
              </Button>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-white">
                <span className="text-sm">Welcome, {user?.username}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">{getRoleDisplayName(user?.role || '')}</span>
                  {user?.membershipTier && getMembershipBadge(user.membershipTier)}
                </div>
              </div>
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
        {/* Hero Section */}
        <HeroSection activeTab={activeTab} />

        {/* Search Filters */}
        {activeTab === 'bookings' && <SearchFilters />}

        {/* Content Sections */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Available Yachts</h2>
                <Button variant="ghost" className="text-purple-400 hover:text-purple-300">
                  View all <i className="fas fa-arrow-right ml-1"></i>
                </Button>
              </div>
              
              {yachtsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-gray-800/50 rounded-2xl p-4 animate-pulse">
                      <div className="h-48 bg-gray-700 rounded-xl mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {yachts.map((yacht) => (
                    <YachtCard key={yacht.id} yacht={yacht} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Premium Services</h2>
                <Button variant="ghost" className="text-purple-400 hover:text-purple-300">
                  View all <i className="fas fa-arrow-right ml-1"></i>
                </Button>
              </div>
              
              {/* Service Categories */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
                {['Photography', 'Chefs', 'Catering', 'Massage', 'Training', 'Makeup', 'Hair', 'Spa'].map((category) => (
                  <div key={category} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-700/30 hover:border-purple-600/50 transition-all duration-300 cursor-pointer group">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <i className="fas fa-concierge-bell text-purple-400"></i>
                    </div>
                    <h4 className="font-medium text-white text-sm">{category}</h4>
                  </div>
                ))}
              </div>
              
              {servicesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-800/50 rounded-2xl p-4 animate-pulse">
                      <div className="h-48 bg-gray-700 rounded-xl mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Experiences Tab */}
          {activeTab === 'experiences' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">MBYC Experiences</h2>
                <Button variant="ghost" className="text-purple-400 hover:text-purple-300">
                  View all <i className="fas fa-arrow-right ml-1"></i>
                </Button>
              </div>
              
              {eventsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-800/50 rounded-2xl p-4 animate-pulse">
                      <div className="h-40 bg-gray-700 rounded-xl mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                  {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
