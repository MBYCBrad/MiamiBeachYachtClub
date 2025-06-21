import React, { useState, useRef, useEffect } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format, addDays, startOfMonth, endOfMonth } from 'date-fns';

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
}

interface AirbnbSearchBarProps {
  onSearch: (criteria: SearchCriteria) => void;
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

export default function AirbnbSearchBar({ onSearch, className }: AirbnbSearchBarProps) {
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
  const [dateSelection, setDateSelection] = useState<'dates' | 'months' | 'flexible'>('dates');
  const searchBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setActiveField(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationSelect = (location: string) => {
    setSearchCriteria(prev => ({ ...prev, location }));
    setActiveField('checkin');
  };

  const handleDateSelect = (date: Date | undefined, type: 'checkin' | 'checkout') => {
    if (!date) return;
    
    setSearchCriteria(prev => {
      const newCriteria = { ...prev };
      if (type === 'checkin') {
        newCriteria.checkIn = date;
        // Auto-advance to checkout if not set
        if (!prev.checkOut) {
          setActiveField('checkout');
        }
      } else {
        newCriteria.checkOut = date;
        // Auto-advance to guests
        setActiveField('who');
      }
      return newCriteria;
    });
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
    onSearch(searchCriteria);
    setActiveField(null);
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

  const nextMonth = () => {
    setCalendarMonth(prev => addDays(startOfMonth(prev), 32));
  };

  const prevMonth = () => {
    setCalendarMonth(prev => addDays(startOfMonth(prev), -32));
  };

  return (
    <div ref={searchBarRef} className={cn("relative", className)}>
      {/* Search Bar */}
      <motion.div 
        className={cn(
          "bg-white rounded-full shadow-lg border border-gray-200 flex items-center transition-all duration-300",
          activeField ? "shadow-xl scale-105" : "hover:shadow-md"
        )}
        layout
      >
        {/* Where */}
        <button
          onClick={() => setActiveField(activeField === 'where' ? null : 'where')}
          className={cn(
            "flex-1 text-left px-6 py-4 rounded-full transition-colors",
            activeField === 'where' ? "bg-gray-100" : "hover:bg-gray-50"
          )}
        >
          <div className="font-semibold text-gray-900">Where</div>
          <div className="text-sm text-gray-500 truncate">
            {searchCriteria.location || 'Search destinations'}
          </div>
        </button>

        <div className="w-px h-8 bg-gray-300" />

        {/* Check in */}
        <button
          onClick={() => setActiveField(activeField === 'checkin' ? null : 'checkin')}
          className={cn(
            "flex-1 text-left px-6 py-4 transition-colors",
            activeField === 'checkin' || activeField === 'checkout' ? "bg-gray-100" : "hover:bg-gray-50"
          )}
        >
          <div className="font-semibold text-gray-900">Check in</div>
          <div className="text-sm text-gray-500">
            {searchCriteria.checkIn ? format(searchCriteria.checkIn, 'MMM d') : 'Add dates'}
          </div>
        </button>

        <div className="w-px h-8 bg-gray-300" />

        {/* Check out */}
        <button
          onClick={() => setActiveField(activeField === 'checkout' ? null : 'checkout')}
          className={cn(
            "flex-1 text-left px-6 py-4 transition-colors",
            activeField === 'checkin' || activeField === 'checkout' ? "bg-gray-100" : "hover:bg-gray-50"
          )}
        >
          <div className="font-semibold text-gray-900">Check out</div>
          <div className="text-sm text-gray-500">
            {searchCriteria.checkOut ? format(searchCriteria.checkOut, 'MMM d') : 'Add dates'}
          </div>
        </button>

        <div className="w-px h-8 bg-gray-300" />

        {/* Who */}
        <button
          onClick={() => setActiveField(activeField === 'who' ? null : 'who')}
          className={cn(
            "flex-1 text-left px-6 py-4 transition-colors",
            activeField === 'who' ? "bg-gray-100" : "hover:bg-gray-50"
          )}
        >
          <div className="font-semibold text-gray-900">Who</div>
          <div className="text-sm text-gray-500 truncate">
            {getGuestText()}
          </div>
        </button>

        {/* Search Button */}
        <Button
          onClick={handleSearch}
          className="mr-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-4"
          size="icon"
        >
          <Search size={20} />
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
            className="absolute top-full mt-2 left-0 right-0 bg-white rounded-3xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
          >
            {/* Where Dropdown */}
            {activeField === 'where' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Suggested destinations</h3>
                <div className="space-y-3">
                  {locations.map((location) => (
                    <button
                      key={location.id}
                      onClick={() => handleLocationSelect(location.name)}
                      className="w-full flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="text-2xl">{location.icon}</div>
                      <div>
                        <div className="font-medium text-gray-900">{location.name}</div>
                        <div className="text-sm text-gray-500">{location.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date Dropdowns */}
            {(activeField === 'checkin' || activeField === 'checkout') && (
              <div className="p-6">
                <Tabs value={dateSelection} onValueChange={(v) => setDateSelection(v as any)} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="dates">Dates</TabsTrigger>
                    <TabsTrigger value="months">Months</TabsTrigger>
                    <TabsTrigger value="flexible">Flexible</TabsTrigger>
                  </TabsList>

                  <TabsContent value="dates">
                    <div className="flex space-x-8">
                      {/* Current Month */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-lg">
                            {format(calendarMonth, 'MMMM yyyy')}
                          </h3>
                          <div className="flex space-x-2">
                            <Button
                              onClick={prevMonth}
                              variant="ghost"
                              size="sm"
                              className="p-2"
                            >
                              <ChevronLeft size={16} />
                            </Button>
                            <Button
                              onClick={nextMonth}
                              variant="ghost"
                              size="sm"
                              className="p-2"
                            >
                              <ChevronRight size={16} />
                            </Button>
                          </div>
                        </div>
                        <Calendar
                          mode="single"
                          selected={activeField === 'checkin' ? searchCriteria.checkIn : searchCriteria.checkOut}
                          onSelect={(date) => handleDateSelect(date, activeField)}
                          month={calendarMonth}
                          className="w-full"
                          disabled={(date) => date < new Date()}
                        />
                      </div>

                      {/* Next Month */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-lg">
                            {format(addDays(calendarMonth, 32), 'MMMM yyyy')}
                          </h3>
                        </div>
                        <Calendar
                          mode="single"
                          selected={activeField === 'checkin' ? searchCriteria.checkIn : searchCriteria.checkOut}
                          onSelect={(date) => handleDateSelect(date, activeField)}
                          month={addDays(calendarMonth, 32)}
                          className="w-full"
                          disabled={(date) => date < new Date()}
                        />
                      </div>
                    </div>

                    {/* Quick Date Options */}
                    <div className="flex space-x-2 mt-6 flex-wrap">
                      {[
                        { label: 'Exact dates', days: 0 },
                        { label: '± 1 day', days: 1 },
                        { label: '± 2 days', days: 2 },
                        { label: '± 3 days', days: 3 },
                        { label: '± 7 days', days: 7 },
                        { label: '± 14 days', days: 14 }
                      ].map((option) => (
                        <Button
                          key={option.label}
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* Who Dropdown */}
            {activeField === 'who' && (
              <div className="p-6">
                <div className="space-y-6">
                  {/* Adults */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Adults</div>
                      <div className="text-sm text-gray-500">Ages 13 or above</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button
                        onClick={() => handleGuestChange('adults', false)}
                        disabled={searchCriteria.guests.adults === 0}
                        variant="outline"
                        size="sm"
                        className="rounded-full w-8 h-8 p-0"
                      >
                        <Minus size={16} />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {searchCriteria.guests.adults}
                      </span>
                      <Button
                        onClick={() => handleGuestChange('adults', true)}
                        variant="outline"
                        size="sm"
                        className="rounded-full w-8 h-8 p-0"
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Children</div>
                      <div className="text-sm text-gray-500">Ages 2-12</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button
                        onClick={() => handleGuestChange('children', false)}
                        disabled={searchCriteria.guests.children === 0}
                        variant="outline"
                        size="sm"
                        className="rounded-full w-8 h-8 p-0"
                      >
                        <Minus size={16} />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {searchCriteria.guests.children}
                      </span>
                      <Button
                        onClick={() => handleGuestChange('children', true)}
                        variant="outline"
                        size="sm"
                        className="rounded-full w-8 h-8 p-0"
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                  </div>

                  {/* Infants */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Infants</div>
                      <div className="text-sm text-gray-500">Under 2</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button
                        onClick={() => handleGuestChange('infants', false)}
                        disabled={searchCriteria.guests.infants === 0}
                        variant="outline"
                        size="sm"
                        className="rounded-full w-8 h-8 p-0"
                      >
                        <Minus size={16} />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {searchCriteria.guests.infants}
                      </span>
                      <Button
                        onClick={() => handleGuestChange('infants', true)}
                        variant="outline"
                        size="sm"
                        className="rounded-full w-8 h-8 p-0"
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                  </div>

                  {/* Pets */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Pets</div>
                      <div className="text-sm text-gray-500 underline cursor-pointer">
                        Bringing a service animal?
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button
                        onClick={() => handleGuestChange('pets', false)}
                        disabled={searchCriteria.guests.pets === 0}
                        variant="outline"
                        size="sm"
                        className="rounded-full w-8 h-8 p-0"
                      >
                        <Minus size={16} />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {searchCriteria.guests.pets}
                      </span>
                      <Button
                        onClick={() => handleGuestChange('pets', true)}
                        variant="outline"
                        size="sm"
                        className="rounded-full w-8 h-8 p-0"
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}