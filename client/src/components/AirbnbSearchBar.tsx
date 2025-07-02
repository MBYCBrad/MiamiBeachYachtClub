import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  MapPin, 
  Calendar as CalendarIcon, 
  Users, 
  Plus, 
  Minus,
  ChevronLeft,
  ChevronRight,
  Star,
  Heart,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format, addDays, startOfMonth, endOfMonth } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Yacht } from '@shared/schema';

interface SearchCriteria {
  location: string;
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  guests: {
    adults: number;
    children: number;
    infants: number;
    pets: number;
  };
  selectedYacht?: Yacht;
  selectedDate?: Date;
  selectedTimeSlot?: string;
}

interface AirbnbSearchBarProps {
  onSearch: (criteria: SearchCriteria) => void;
  onBooking?: (bookingData: any) => void;
  className?: string;
}

const locations = [
  { 
    id: 'nearby', 
    name: 'Nearby', 
    description: "Find what's around you",
    icon: '🎯'
  },
  { 
    id: 'miami-beach', 
    name: 'Miami Beach, Florida', 
    description: 'Luxury yacht charters',
    icon: '🏖️'
  },
  { 
    id: 'biscayne-bay', 
    name: 'Biscayne Bay, Miami', 
    description: 'Premium marina location',
    icon: '⚓'
  },
  { 
    id: 'key-biscayne', 
    name: 'Key Biscayne, Florida', 
    description: 'Exclusive island charters',
    icon: '🏝️'
  },
  { 
    id: 'fort-lauderdale', 
    name: 'Fort Lauderdale, Florida', 
    description: 'Yachting capital destination',
    icon: '🛥️'
  },
  { 
    id: 'west-palm-beach', 
    name: 'West Palm Beach, Florida', 
    description: 'Luxury coastal charters',
    icon: '🌊'
  }
];

export default function AirbnbSearchBar({ onSearch, onBooking, className }: AirbnbSearchBarProps) {
  const [activeField, setActiveField] = useState<'where' | 'checkin' | 'checkout' | 'who' | null>(null);
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    location: '',
    checkIn: undefined,
    checkOut: undefined,
    guests: {
      adults: 0,
      children: 0,
      infants: 0,
      pets: 0
    }
  });
  
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | undefined>(undefined);
  const [selectedYacht, setSelectedYacht] = useState<Yacht | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch yachts data
  const { data: yachts = [], isLoading: yachtsLoading } = useQuery<Yacht[]>({
    queryKey: ['/api/yachts'],
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });

  // Booking mutation
  const bookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest('POST', '/api/bookings', bookingData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Booking Confirmed!",
        description: `Your yacht booking for ${selectedYacht?.name} has been confirmed.`,
      });
      
      // Reset form state
      setActiveField(null);
      setSelectedYacht(null);
      setSelectedDate(undefined);
      setSelectedTimeSlot(undefined);
      setSearchCriteria({
        location: '',
        checkIn: undefined,
        checkOut: undefined,
        guests: { adults: 0, children: 0, infants: 0, pets: 0 }
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/trips'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      
      // Call callback if provided
      if (onBooking) {
        onBooking(data);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "There was an error processing your booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handler function for yacht selection
  const handleYachtSelect = (yacht: Yacht) => {
    setSelectedYacht(yacht);
  };

  // Available 4-hour time slots
  const timeSlots = [
    { id: 'morning', label: 'Morning Charter', time: '8:00 AM - 12:00 PM', description: 'Perfect for sunrise cruising' },
    { id: 'midday', label: 'Midday Charter', time: '12:00 PM - 4:00 PM', description: 'Ideal for lunch and swimming' },
    { id: 'afternoon', label: 'Afternoon Charter', time: '4:00 PM - 8:00 PM', description: 'Great for sunset viewing' },
    { id: 'evening', label: 'Evening Charter', time: '6:00 PM - 10:00 PM', description: 'Perfect for dinner cruises' }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setActiveField(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeDropdown = () => {
    setActiveField(null);
  };

  const handleLocationSelect = (location: string) => {
    setSearchCriteria(prev => ({ ...prev, location }));
    setActiveField('checkin');
  };



  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    setSearchCriteria(prev => ({ ...prev, checkIn: date, checkOut: date }));
  };

  const handleTimeSlotSelect = (timeSlotId: string) => {
    setSelectedTimeSlot(timeSlotId);
    setActiveField('who');
  };

  const handleGuestChange = (type: keyof typeof searchCriteria.guests, increment: boolean) => {
    setSearchCriteria(prev => ({
      ...prev,
      guests: {
        ...prev.guests,
        [type]: Math.max(0, prev.guests[type] + (increment ? 1 : -1))
      }
    }));
  };

  const handleSearch = () => {
    // Create booking instead of just searching
    if (selectedYacht && selectedDate && selectedTimeSlot) {
      const timeSlot = timeSlots.find(slot => slot.id === selectedTimeSlot);
      if (!timeSlot) return;

      // Calculate start and end times based on time slot
      const startTime = new Date(selectedDate);
      const endTime = new Date(selectedDate);
      
      // Set times based on selected slot
      switch (selectedTimeSlot) {
        case 'morning':
          startTime.setHours(8, 0, 0, 0);
          endTime.setHours(12, 0, 0, 0);
          break;
        case 'midday':
          startTime.setHours(12, 0, 0, 0);
          endTime.setHours(16, 0, 0, 0);
          break;
        case 'afternoon':
          startTime.setHours(16, 0, 0, 0);
          endTime.setHours(20, 0, 0, 0);
          break;
        case 'evening':
          startTime.setHours(18, 0, 0, 0);
          endTime.setHours(22, 0, 0, 0);
          break;
        default:
          startTime.setHours(9, 0, 0, 0);
          endTime.setHours(13, 0, 0, 0);
      }

      // Create booking data with all required fields
      const bookingData = {
        yachtId: selectedYacht.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        guestCount: Math.max(1, getTotalGuests()), // Ensure at least 1 guest
        specialRequests: `Location: ${searchCriteria.location}. Time Slot: ${timeSlot.time}. ${getGuestText()}`
      };

      bookingMutation.mutate(bookingData);
    }
  };

  const getTotalGuests = () => {
    return searchCriteria.guests.adults + searchCriteria.guests.children + searchCriteria.guests.infants;
  };

  const getGuestText = () => {
    const total = getTotalGuests();
    if (total === 0) return 'Add guests';
    
    let text = `${total} guest${total > 1 ? 's' : ''}`;
    if (searchCriteria.guests.pets > 0) {
      text += `, ${searchCriteria.guests.pets} pet${searchCriteria.guests.pets > 1 ? 's' : ''}`;
    }
    return text;
  };



  return (
    <div ref={searchBarRef} className={cn("relative z-50", className)}>
      {/* Mobile Search Bar */}
      <div className="md:hidden">
        <motion.div 
          className="bg-transparent backdrop-blur-sm rounded-full shadow-lg border border-white/30 transition-all duration-300 relative z-40 hover:border-white/50 hover:bg-white/5"
          layout
        >
          {/* Mobile Compact Search */}
          <button
            onClick={() => setActiveField('where')}
            className="w-full py-4 px-5 text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <div className="font-semibold text-white text-base">Where to?</div>
                  <div className="text-sm text-gray-300 mt-0.5">
                    {searchCriteria.location ? `${searchCriteria.location} • ` : 'Anywhere • '}
                    {selectedDate && selectedTimeSlot ? 
                      `${format(selectedDate, 'MMM d')} ${timeSlots.find(slot => slot.id === selectedTimeSlot)?.time} • ` : 
                      'Any date & time • '
                    }
                    {getTotalGuests() > 0 ? `${getTotalGuests()} guests` : 'Add guests'}
                  </div>
                </div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <Search className="h-5 w-5 text-white" />
              </div>
            </div>
          </button>


        </motion.div>
      </div>

      {/* Desktop Search Bar */}
      <motion.div 
        className={cn(
          "hidden md:flex bg-white/10 backdrop-blur-md rounded-full shadow-2xl border border-white/20 items-center transition-all duration-300 h-16 relative z-40",
          activeField ? "shadow-2xl scale-105 bg-white/20 border-purple-400/50" : "hover:shadow-xl hover:bg-white/15"
        )}
        layout
      >
        {/* Where */}
        <button
          onClick={() => setActiveField(activeField === 'where' ? null : 'where')}
          className={cn(
            "flex-1 text-left px-6 py-3 rounded-full transition-colors",
            activeField === 'where' ? "bg-white/10" : "hover:bg-white/5"
          )}
        >
          <div className="font-semibold text-white">Where</div>
          <div className="text-sm text-gray-300 truncate">
            {searchCriteria.location || 'Search destinations'}
          </div>
        </button>

        <div className="w-px h-8 bg-white/20" />

        {/* Date & Time */}
        <button
          onClick={() => setActiveField(activeField === 'checkin' ? null : 'checkin')}
          className={cn(
            "flex-1 text-left px-6 py-3 transition-colors hover:bg-white/5",
            activeField === 'checkin' ? "bg-white/10" : ""
          )}
        >
          <div className="font-semibold text-white">Date & Time</div>
          <div className="text-sm text-gray-300">
            {selectedDate && selectedTimeSlot ? 
              `${format(selectedDate, 'MMM d')} • ${timeSlots.find(slot => slot.id === selectedTimeSlot)?.time.split(' - ')[0]}` : 
              'Select charter slot'
            }
          </div>
        </button>

        <div className="w-px h-8 bg-white/20" />

        {/* Who */}
        <button
          onClick={() => setActiveField(activeField === 'who' ? null : 'who')}
          className={cn(
            "flex-1 text-left px-6 py-3 transition-colors",
            activeField === 'who' ? "bg-white/10" : "hover:bg-white/5"
          )}
        >
          <div className="font-semibold text-white">Who</div>
          <div className="text-sm text-gray-300 truncate">
            {getGuestText()}
          </div>
        </button>

        {/* Search Button */}
        <Button
          onClick={handleSearch}
          className="mr-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-full p-3 shadow-lg"
          size="icon"
        >
          <Search size={18} />
        </Button>
      </motion.div>

      {/* Dropdown Content */}
      <AnimatePresence>
        {activeField && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[2147483647]"
            onClick={closeDropdown}
          >
            <div 
              className="absolute top-20 left-4 right-4 mx-auto w-[calc(100%-2rem)] max-w-[800px] max-h-[calc(100vh-120px)] bg-black/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-500/30 overflow-y-auto scroll-smooth"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeDropdown}
                className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={18} className="text-white" />
              </button>
            {/* Where Dropdown */}
            {activeField === 'where' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-white">Where do you want to go?</h3>
                <div className="space-y-3">
                  {locations.map((location) => (
                    <button
                      key={location.id}
                      onClick={() => handleLocationSelect(location.name)}
                      className="w-full flex items-center space-x-4 p-3 rounded-xl hover:bg-white/10 transition-colors text-left"
                    >
                      <div className="text-2xl">{location.icon}</div>
                      <div>
                        <div className="font-medium text-white">{location.name}</div>
                        <div className="text-sm text-gray-300">{location.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date and Time Selection */}
            {(activeField === 'checkin' || activeField === 'checkout') && (
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2 text-white">Select Your Charter Date & Time</h3>
                  <p className="text-sm text-gray-300">Choose a date and 4-hour time slot for your yacht experience</p>
                </div>

                {/* Two-Step Process */}
                <div className="space-y-8">
                  {/* Step 1: Date Selection */}
                  <div>
                    <h4 className="text-md font-medium mb-4 text-white flex items-center">
                      <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm mr-3">1</span>
                      Choose your date
                    </h4>
                    
                    <div className="flex justify-center">
                      <div className="flex flex-col md:flex-row md:space-x-8 space-y-6 md:space-y-0 max-w-[700px] w-full">
                        {/* Current Month */}
                        <div className="flex-1">
                          <div className="flex items-center justify-center mb-4">
                            <h3 className="font-semibold text-lg text-white">
                              {format(calendarMonth, 'MMMM yyyy')}
                            </h3>
                          </div>
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateSelect}
                            month={calendarMonth}
                            onMonthChange={setCalendarMonth}
                            className="w-full text-white [&_.rdp-day]:text-white [&_.rdp-day_button]:text-white [&_.rdp-day_button:hover]:bg-white/10 [&_.rdp-day_selected_.rdp-day_button]:bg-purple-600 [&_.rdp-day_selected_.rdp-day_button]:text-white [&_.rdp-head_cell]:text-gray-300 [&_.rdp-caption_label]:text-white [&_.rdp-nav_button]:text-gray-300 [&_.rdp-nav_button:hover]:text-white [&_.rdp-nav_button:hover]:bg-white/10"
                            disabled={(date) => date < new Date()}
                          />
                        </div>

                        {/* Next Month - Hidden on mobile */}
                        <div className="hidden md:block flex-1">
                          <div className="flex items-center justify-center mb-4">
                            <h3 className="font-semibold text-lg text-white">
                              {format(addDays(calendarMonth, 32), 'MMMM yyyy')}
                            </h3>
                          </div>
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateSelect}
                            month={addDays(calendarMonth, 32)}
                            className="w-full text-white [&_.rdp-day]:text-white [&_.rdp-day_button]:text-white [&_.rdp-day_button:hover]:bg-white/10 [&_.rdp-day_selected_.rdp-day_button]:bg-purple-600 [&_.rdp-day_selected_.rdp-day_button]:text-white [&_.rdp-head_cell]:text-gray-300 [&_.rdp-caption_label]:text-white"
                            disabled={(date) => date < new Date()}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Time Slot Selection - Only show if date is selected */}
                  {selectedDate && (
                    <div className="pb-8">
                      <h4 className="text-md font-medium mb-4 text-white flex items-center">
                        <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm mr-3">2</span>
                        Select your 4-hour time slot
                      </h4>
                      
                      <div className="grid grid-cols-1 gap-4">
                        {timeSlots.map((slot) => (
                          <motion.button
                            key={slot.id}
                            onClick={() => handleTimeSlotSelect(slot.id)}
                            className={cn(
                              "p-4 rounded-xl border-2 transition-all duration-200 text-left",
                              selectedTimeSlot === slot.id 
                                ? "border-purple-500 bg-purple-500/20" 
                                : "border-gray-600 bg-gray-800/50 hover:border-purple-400 hover:bg-purple-500/10"
                            )}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="font-semibold text-white">{slot.label}</div>
                            <div className="text-purple-300 text-sm mt-1">{slot.time}</div>
                            <div className="text-gray-400 text-xs mt-2">{slot.description}</div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Who Dropdown */}
            {activeField === 'who' && (
              <div className="p-6">
                <div className="space-y-6">
                  {/* Adults */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">Adults</div>
                      <div className="text-sm text-gray-300">Ages 13 or above</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button
                        onClick={() => handleGuestChange('adults', false)}
                        disabled={searchCriteria.guests.adults === 0}
                        variant="outline"
                        size="sm"
                        className="rounded-full w-8 h-8 p-0 border-purple-500 bg-purple-600/20 text-white hover:bg-purple-600 hover:border-purple-400 disabled:opacity-50"
                      >
                        <Minus size={16} />
                      </Button>
                      <span className="w-8 text-center font-medium text-white">
                        {searchCriteria.guests.adults}
                      </span>
                      <Button
                        onClick={() => handleGuestChange('adults', true)}
                        variant="outline"
                        size="sm"
                        className="rounded-full w-8 h-8 p-0 border-purple-500 bg-purple-600/20 text-white hover:bg-purple-600 hover:border-purple-400"
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">Children</div>
                      <div className="text-sm text-gray-300">Ages 2-12</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button
                        onClick={() => handleGuestChange('children', false)}
                        disabled={searchCriteria.guests.children === 0}
                        variant="outline"
                        size="sm"
                        className="rounded-full w-8 h-8 p-0 border-purple-500 bg-purple-600/20 text-white hover:bg-purple-600 hover:border-purple-400 disabled:opacity-50"
                      >
                        <Minus size={16} />
                      </Button>
                      <span className="w-8 text-center font-medium text-white">
                        {searchCriteria.guests.children}
                      </span>
                      <Button
                        onClick={() => handleGuestChange('children', true)}
                        variant="outline"
                        size="sm"
                        className="rounded-full w-8 h-8 p-0 border-purple-500 bg-purple-600/20 text-white hover:bg-purple-600 hover:border-purple-400"
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                  </div>

                  {/* Infants */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">Infants</div>
                      <div className="text-sm text-gray-300">Under 2</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button
                        onClick={() => handleGuestChange('infants', false)}
                        disabled={searchCriteria.guests.infants === 0}
                        variant="outline"
                        size="sm"
                        className="rounded-full w-8 h-8 p-0 border-purple-500 bg-purple-600/20 text-white hover:bg-purple-600 hover:border-purple-400 disabled:opacity-50"
                      >
                        <Minus size={16} />
                      </Button>
                      <span className="w-8 text-center font-medium text-white">
                        {searchCriteria.guests.infants}
                      </span>
                      <Button
                        onClick={() => handleGuestChange('infants', true)}
                        variant="outline"
                        size="sm"
                        className="rounded-full w-8 h-8 p-0 border-purple-500 bg-purple-600/20 text-white hover:bg-purple-600 hover:border-purple-400"
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                  </div>

                  {/* Pets */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">Pets</div>
                      <div className="text-sm text-gray-300 underline cursor-pointer hover:text-white">
                        Bringing a service animal?
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button
                        onClick={() => handleGuestChange('pets', false)}
                        disabled={searchCriteria.guests.pets === 0}
                        variant="outline"
                        size="sm"
                        className="rounded-full w-8 h-8 p-0 border-purple-500 bg-purple-600/20 text-white hover:bg-purple-600 hover:border-purple-400 disabled:opacity-50"
                      >
                        <Minus size={16} />
                      </Button>
                      <span className="w-8 text-center font-medium text-white">
                        {searchCriteria.guests.pets}
                      </span>
                      <Button
                        onClick={() => handleGuestChange('pets', true)}
                        variant="outline"
                        size="sm"
                        className="rounded-full w-8 h-8 p-0 border-purple-500 bg-purple-600/20 text-white hover:bg-purple-600 hover:border-purple-400"
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                  </div>

                  {/* Yacht Selection Section */}
                  {searchCriteria.location && selectedDate && selectedTimeSlot && getTotalGuests() > 0 && (
                    <div className="pt-6 border-t border-gray-700">
                      <h4 className="text-lg font-semibold mb-4 text-white">Select Your Yacht</h4>
                      {yachtsLoading ? (
                        <div className="text-center py-4">
                          <div className="animate-spin w-6 h-6 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                          <p className="text-gray-300 text-sm">Loading yachts...</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                          {yachts.map((yacht) => (
                            <div
                              key={yacht.id}
                              onClick={() => handleYachtSelect(yacht)}
                              className={cn(
                                "relative bg-gradient-to-br from-gray-900/60 to-black/40 backdrop-blur-lg rounded-xl border border-purple-500/20 overflow-hidden cursor-pointer hover:border-purple-400/40 transition-all duration-300 p-3",
                                selectedYacht?.id === yacht.id ? "border-purple-400 ring-2 ring-purple-400/50" : ""
                              )}
                            >
                              <div className="flex items-center space-x-3">
                                {/* Yacht Image */}
                                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                  {yacht.imageUrl ? (
                                    <img
                                      src={yacht.imageUrl}
                                      alt={yacht.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.src = '/api/media/yacht-placeholder.jpg';
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-purple-600/20 to-indigo-600/20 flex items-center justify-center">
                                      <span className="text-2xl">🛥️</span>
                                    </div>
                                  )}
                                </div>

                                {/* Yacht Details */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                      <h5 className="text-white font-semibold text-sm truncate">{yacht.name}</h5>
                                      <p className="text-gray-300 text-xs">
                                        {yacht.size ? `${yacht.size}ft` : 'Luxury'} • Capacity: {yacht.capacity || 8}
                                      </p>
                                      <p className="text-gray-400 text-xs truncate">{yacht.location || 'Miami Beach, Florida'}</p>
                                    </div>
                                    <div className="text-right ml-2">
                                      <div className="text-white font-bold text-sm">FREE</div>
                                      <div className="text-gray-400 text-xs">membership</div>
                                    </div>
                                  </div>
                                </div>

                                {/* Selection Indicator */}
                                {selectedYacht?.id === yacht.id && (
                                  <div className="absolute top-2 right-2">
                                    <div className="w-5 h-5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Booking Button - Only show when yacht is selected */}
                      {selectedYacht && (
                        <div className="mt-4">
                          <Button
                            onClick={handleSearch}
                            disabled={bookingMutation.isPending}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            size="lg"
                          >
                            {bookingMutation.isPending ? (
                              <div className="flex items-center justify-center space-x-2">
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                                <span>Booking...</span>
                              </div>
                            ) : (
                              `Book ${selectedYacht.name}`
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}


            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}