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
                <Search className="h-5 w-5 text-purple-400" />
                <div>
                  <div className="font-semibold text-white text-base">Where to?</div>
                  <div className="text-sm text-gray-300 mt-0.5">
                    {searchCriteria.location ? `${searchCriteria.location} • ` : 'Anywhere • '}
                    {searchCriteria.checkIn && searchCriteria.checkOut ? 
                      `${format(searchCriteria.checkIn, 'MMM d')} - ${format(searchCriteria.checkOut, 'MMM d')} • ` : 
                      'Any week • '
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

        {/* Check in */}
        <button
          onClick={() => setActiveField(activeField === 'checkin' ? null : 'checkin')}
          className={cn(
            "flex-1 text-left px-6 py-3 transition-colors hover:bg-white/5"
          )}
        >
          <div className="font-semibold text-white">Check in</div>
          <div className="text-sm text-gray-300">
            {searchCriteria.checkIn ? format(searchCriteria.checkIn, 'MMM d') : 'Add dates'}
          </div>
        </button>

        <div className="w-px h-8 bg-white/20" />

        {/* Check out */}
        <button
          onClick={() => setActiveField(activeField === 'checkout' ? null : 'checkout')}
          className={cn(
            "flex-1 text-left px-6 py-3 transition-colors hover:bg-white/5"
          )}
        >
          <div className="font-semibold text-white">Check out</div>
          <div className="text-sm text-gray-300">
            {searchCriteria.checkOut ? format(searchCriteria.checkOut, 'MMM d') : 'Add dates'}
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
            className="absolute top-full mt-2 left-0 right-0 mx-auto w-full max-w-[800px] bg-black/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-500/30 z-[9999] overflow-hidden"
          >
            {/* Where Dropdown */}
            {activeField === 'where' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-white">Suggested destinations</h3>
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

            {/* Date Dropdowns */}
            {(activeField === 'checkin' || activeField === 'checkout') && (
              <div className="p-6">
                <Tabs value={dateSelection} onValueChange={(v) => setDateSelection(v as any)} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6 bg-white/10 border-purple-500/30">
                    <TabsTrigger value="dates" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300">Dates</TabsTrigger>
                    <TabsTrigger value="months" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300">Months</TabsTrigger>
                    <TabsTrigger value="flexible" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300">Flexible</TabsTrigger>
                  </TabsList>

                  <TabsContent value="dates">
                    <div className="flex justify-center">
                      <div className="flex space-x-8 max-w-[700px]">
                        {/* Current Month */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg text-white">
                              {format(calendarMonth, 'MMMM yyyy')}
                            </h3>
                            <div className="flex space-x-2">
                              <Button
                                onClick={prevMonth}
                                variant="ghost"
                                size="sm"
                                className="p-2 text-gray-300 hover:text-white hover:bg-white/10"
                              >
                                <ChevronLeft size={16} />
                              </Button>
                              <Button
                                onClick={nextMonth}
                                variant="ghost"
                                size="sm"
                                className="p-2 text-gray-300 hover:text-white hover:bg-white/10"
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
                            className="w-full text-white [&_.rdp-day]:text-white [&_.rdp-day_button]:text-white [&_.rdp-day_button:hover]:bg-white/10 [&_.rdp-day_selected_.rdp-day_button]:bg-purple-600 [&_.rdp-day_selected_.rdp-day_button]:text-white [&_.rdp-head_cell]:text-gray-300 [&_.rdp-caption_label]:text-white"
                            disabled={(date) => date < new Date()}
                          />
                        </div>

                        {/* Next Month */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg text-white">
                              {format(addDays(calendarMonth, 32), 'MMMM yyyy')}
                            </h3>
                          </div>
                          <Calendar
                            mode="single"
                            selected={activeField === 'checkin' ? searchCriteria.checkIn : searchCriteria.checkOut}
                            onSelect={(date) => handleDateSelect(date, activeField)}
                            month={addDays(calendarMonth, 32)}
                            className="w-full text-white [&_.rdp-day]:text-white [&_.rdp-day_button]:text-white [&_.rdp-day_button:hover]:bg-white/10 [&_.rdp-day_selected_.rdp-day_button]:bg-purple-600 [&_.rdp-day_selected_.rdp-day_button]:text-white [&_.rdp-head_cell]:text-gray-300 [&_.rdp-caption_label]:text-white"
                            disabled={(date) => date < new Date()}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quick Date Options */}
                    <div className="flex justify-center">
                      <div className="flex space-x-2 mt-6 flex-wrap justify-center">
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
                          className="rounded-full border-gray-600 bg-gray-800 text-white hover:text-white hover:bg-gray-700 hover:border-gray-500"
                        >
                          {option.label}
                        </Button>
                      ))}
                      </div>
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
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}