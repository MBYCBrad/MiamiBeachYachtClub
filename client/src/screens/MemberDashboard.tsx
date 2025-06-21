import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Star, 
  Heart,
  Globe,
  Menu,
  User,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { getMembershipBenefits, canBookYacht } from '@shared/membership';
import { queryClient } from '@/lib/queryClient';
import type { Yacht, Service, Event } from '@shared/schema';

export default function MemberDashboard() {
  const { user } = useAuth();
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState('');
  const [searchDestination, setSearchDestination] = useState('');

  // Fetch data
  const { data: yachts = [], isLoading: yachtsLoading } = useQuery<Yacht[]>({
    queryKey: ['/api/yachts'],
  });

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

  // Filter yachts based on membership tier
  const availableYachts = yachts.filter(yacht => {
    if (!user?.membershipTier) return false;
    return canBookYacht(user.membershipTier as any, yacht.size || 0);
  });

  const handleYachtBooking = async (yacht: Yacht) => {
    if (!checkInDate || !checkOutDate) {
      alert('Please select check-in and check-out dates');
      return;
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          yachtId: yacht.id,
          startTime: new Date(checkInDate).toISOString(),
          endTime: new Date(checkOutDate).toISOString(),
          status: 'confirmed',
        }),
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
        alert('Yacht booked successfully!');
      }
    } catch (error) {
      console.error('Booking error:', error);
    }
  };

  if (yachtsLoading) {
    return <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header exactly like Airbnb */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 lg:px-20">
          <div className="flex items-center justify-between h-20">
            {/* Airbnb Logo */}
            <div className="flex items-center">
              <div className="text-red-500 text-2xl font-bold flex items-center">
                <svg viewBox="0 0 32 32" className="w-8 h-8 mr-2 fill-current">
                  <path d="M16 1c2 0 3 1 3 3v2h2c2 0 3 1 3 3v16c0 2-1 3-3 3H11c-2 0-3-1-3-3V9c0-2 1-3 3-3h2V4c0-2 1-3 3-3z"/>
                </svg>
                airbnb
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button className="text-gray-900 hover:text-gray-600 font-medium border-b-2 border-red-500 pb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                </svg>
                Homes
              </button>
              <button className="text-gray-600 hover:text-gray-900 font-medium flex items-center pb-4">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded mr-2">NEW</span>
                Experiences
              </button>
              <button className="text-gray-600 hover:text-gray-900 font-medium flex items-center pb-4">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"/>
                </svg>
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded mr-2">NEW</span>
                Services
              </button>
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900 font-medium">
                Become a host
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Globe className="w-4 h-4" />
              </button>
              <div className="flex items-center border border-gray-300 rounded-full py-2 px-4 hover:shadow-md transition-shadow cursor-pointer">
                <Menu className="w-4 h-4 mr-3" />
                <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar - Exact Airbnb Style */}
        <div className="px-6 lg:px-20 pb-6">
          <div className="bg-white border border-gray-300 rounded-full shadow-lg max-w-4xl mx-auto">
            <div className="flex items-center">
              <div className="flex-1 px-8 py-4 hover:bg-gray-50 rounded-full cursor-pointer">
                <div className="text-xs font-semibold text-gray-900 mb-1">Where</div>
                <input
                  type="text"
                  placeholder="Search destinations"
                  value={searchDestination}
                  onChange={(e) => setSearchDestination(e.target.value)}
                  className="w-full text-sm text-gray-600 placeholder-gray-400 border-none outline-none bg-transparent"
                />
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div className="flex-1 px-8 py-4 hover:bg-gray-50 cursor-pointer">
                <div className="text-xs font-semibold text-gray-900 mb-1">Check in</div>
                <div className="text-sm text-gray-400">Add dates</div>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div className="flex-1 px-8 py-4 hover:bg-gray-50 cursor-pointer">
                <div className="text-xs font-semibold text-gray-900 mb-1">Check out</div>
                <div className="text-sm text-gray-400">Add dates</div>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div className="flex-1 px-8 py-4 hover:bg-gray-50 rounded-full cursor-pointer">
                <div className="text-xs font-semibold text-gray-900 mb-1">Who</div>
                <div className="text-sm text-gray-400">Add guests</div>
              </div>
              <button className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full mr-2 transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 lg:px-20 py-8">
        {/* Popular Yachts Section - Exact Airbnb Style */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Popular yachts in Monaco Bay
            </h2>
            <div className="flex items-center">
              <button className="p-2 border border-gray-300 rounded-full mr-2 hover:shadow-md">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-2 border border-gray-300 rounded-full hover:shadow-md">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {availableYachts.slice(0, 6).map((yacht) => (
              <div key={yacht.id} className="group cursor-pointer">
                <div className="relative mb-3">
                  <img
                    src={yacht.imageUrl || "https://images.unsplash.com/photo-1540946485063-a40da27545f8?auto=format&fit=crop&w=800&q=80"}
                    alt={yacht.name}
                    className="w-full h-64 object-cover rounded-xl"
                  />
                  <button className="absolute top-3 right-3 p-2 hover:scale-110 transition-transform">
                    <Heart className="w-6 h-6 text-white hover:text-red-500 fill-gray-700 hover:fill-red-500" />
                  </button>
                  <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-md text-xs font-medium shadow-sm">
                    Guest favourite
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 truncate text-sm">{yacht.name}</h3>
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-black fill-current" />
                      <span className="ml-1 text-sm">4.{Math.floor(Math.random() * 10)}</span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm">{yacht.location || "Monaco Bay"}</p>
                  <p className="text-gray-500 text-sm">Jul 15-20</p>
                  <div className="flex items-baseline">
                    <span className="font-semibold text-gray-900">${yacht.size * 50} CAD</span>
                    <span className="text-gray-500 text-sm ml-1">for 2 nights</span>
                    <div className="flex items-center ml-2">
                      <Star className="w-3 h-3 text-black fill-current" />
                      <span className="text-xs ml-1">4.{Math.floor(Math.random() * 10)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Events Section - Exact Airbnb Style */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Available next month in Monaco Bay
            </h2>
            <div className="flex items-center">
              <button className="p-2 border border-gray-300 rounded-full mr-2 hover:shadow-md">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-2 border border-gray-300 rounded-full hover:shadow-md">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {events.slice(0, 6).map((event) => (
              <div key={event.id} className="group cursor-pointer">
                <div className="relative mb-3">
                  <img
                    src={event.imageUrl || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80"}
                    alt={event.title}
                    className="w-full h-64 object-cover rounded-xl"
                  />
                  <button className="absolute top-3 right-3 p-2 hover:scale-110 transition-transform">
                    <Heart className="w-6 h-6 text-white hover:text-red-500 fill-gray-700 hover:fill-red-500" />
                  </button>
                  <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-md text-xs font-medium shadow-sm">
                    Guest favourite
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 truncate text-sm">{event.title}</h3>
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-black fill-current" />
                      <span className="ml-1 text-sm">4.{Math.floor(Math.random() * 10)}</span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm">{event.location}</p>
                  <p className="text-gray-500 text-sm">
                    {new Date(event.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <div className="flex items-baseline">
                    <span className="font-semibold text-gray-900">${event.ticketPrice || '99'} CAD</span>
                    <span className="text-gray-500 text-sm ml-1">per ticket</span>
                    <div className="flex items-center ml-2">
                      <Star className="w-3 h-3 text-black fill-current" />
                      <span className="text-xs ml-1">4.{Math.floor(Math.random() * 10)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}