import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Search, BarChart3, Ship, Calendar as CalendarIcon, DollarSign, Wrench, Settings, User, MessageSquare, Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface CalendarEvent {
  id: string;
  title: string;
  type: 'yacht' | 'maintenance' | 'service';
  startTime: Date;
  endTime: Date;
  description?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  yachtName?: string;
  memberName?: string;
}

const CALENDAR_VIEWS = {
  month: 'Month',
  week: 'Week', 
  day: 'Day'
} as const;

type CalendarView = typeof CALENDAR_VIEWS[keyof typeof CALENDAR_VIEWS];

const EVENT_COLORS = {
  yacht: 'from-purple-600 to-indigo-600',
  maintenance: 'from-orange-500 to-red-500',
  service: 'from-green-500 to-blue-500'
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

const formatDateRange = (start: Date, end: Date) => {
  const startStr = start.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
  const endStr = end.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
  
  if (startStr === endStr) {
    return `${startStr} ${formatTime(start)} - ${formatTime(end)}`;
  }
  return `${startStr} - ${endStr}`;
};

const isSameDay = (date1: Date, date2: Date) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

const getDaysInMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const getFirstDayOfMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

export default function YachtOwnerCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('Month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Fetch real-time data
  const { data: bookings = [] } = useQuery<any[]>({
    queryKey: ['/api/yacht-owner/bookings'],
    staleTime: 30000,
    refetchInterval: 30000
  });

  const { data: yachts = [] } = useQuery<any[]>({
    queryKey: ['/api/yacht-owner/yachts'],
    staleTime: 30000,
    refetchInterval: 30000
  });

  const { data: user } = useQuery<any>({
    queryKey: ['/api/user'],
    staleTime: 30000
  });

  // Transform bookings to calendar events
  const calendarEvents = useMemo(() => {
    const events: CalendarEvent[] = [];

    // Add yacht bookings
    bookings.forEach((booking: any) => {
      events.push({
        id: `booking-${booking.id}`,
        title: 'Booking',
        type: 'yacht',
        startTime: new Date(booking.startTime),
        endTime: new Date(booking.endTime),
        description: booking.specialRequests || undefined,
        status: booking.status,
        yachtName: booking.yacht?.name || 'Unknown Yacht',
        memberName: booking.user?.username || booking.user?.fullName || 'Member'
      });
    });

    return events;
  }, [bookings, yachts]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return calendarEvents.filter(event => 
      isSameDay(event.startTime, date) || 
      (event.startTime <= date && event.endTime >= date)
    );
  };

  // Navigation functions
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Calendar grid generation
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const days = [];

    // Previous month's trailing days
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
    const prevMonthDays = prevMonth.getDate();
    
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        events: getEventsForDate(date)
      });
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      days.push({
        date,
        isCurrentMonth: true,
        events: getEventsForDate(date)
      });
    }

    // Next month's leading days to fill grid
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        events: getEventsForDate(date)
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  // Get upcoming bookings (next 7 days)
  const upcomingBookings = useMemo(() => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return calendarEvents
      .filter(event => event.startTime >= now && event.startTime <= nextWeek)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      .slice(0, 5); // Show max 5 upcoming bookings
  }, [calendarEvents]);

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar Navigation */}
      <motion.div 
        className={`fixed left-0 top-0 h-full bg-gray-900/50 border-r border-gray-700/50 z-[8888] transition-all duration-400 ease-in-out ${
          sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-80'
        }`}
        initial={false}
        animate={{ width: sidebarCollapsed ? 0 : 320 }}
      >
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Ship className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Yacht Owner</h2>
              <p className="text-sm text-gray-400">Fleet Management</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search fleet features..."
              className="pl-10 bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 p-6">
          <nav className="space-y-2">
            {[
              { icon: BarChart3, label: 'Overview', id: 'overview' },
              { icon: Ship, label: 'My Fleet', id: 'fleet' },
              { icon: CalendarIcon, label: 'Bookings', id: 'bookings' },
              { icon: DollarSign, label: 'Revenue', id: 'revenue' },
              { icon: Wrench, label: 'Maintenance', id: 'maintenance' },
              { icon: BarChart3, label: 'Analytics', id: 'analytics' },
              { icon: CalendarIcon, label: 'Calendar', id: 'calendar', active: true },
              { icon: Settings, label: 'Settings', id: 'settings' }
            ].map((item) => (
              <button
                key={item.id}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  item.active 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* User Profile */}
        <div className="p-6 border-t border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-lg font-semibold">
                {user?.username?.charAt(0).toUpperCase() || 'Y'}
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.username || 'demo_owner'}</p>
              <p className="text-xs text-gray-400">Fleet Manager</p>
            </div>
            <div className="flex gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <div className="relative">
                <Bell className="w-4 h-4 text-purple-400" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        className="flex-1 transition-all duration-400 ease-in-out"
        animate={{ 
          marginLeft: sidebarCollapsed ? 0 : 320,
          width: sidebarCollapsed ? '100%' : 'calc(100% - 320px)'
        }}
      >
        {/* Header */}
        <div className="p-8 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            {/* Hamburger Menu */}
            <AnimatePresence mode="wait">
              {sidebarCollapsed && (
                <motion.button
                  key="hamburger"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  onClick={() => setSidebarCollapsed(false)}
                  className="fixed top-8 left-8 z-[9999] w-10 h-10 bg-gray-900/90 backdrop-blur-sm border border-gray-700/50 rounded-lg flex items-center justify-center hover:bg-gray-800/90 transition-all duration-200"
                >
                  <div className="w-5 h-5 flex flex-col justify-center items-center gap-1">
                    <div className="w-4 h-0.5 bg-white rounded-full"></div>
                    <div className="w-4 h-0.5 bg-white rounded-full"></div>
                    <div className="w-4 h-0.5 bg-white rounded-full"></div>
                  </div>
                </motion.button>
              )}
            </AnimatePresence>

            {/* Close Button */}
            <AnimatePresence mode="wait">
              {!sidebarCollapsed && (
                <motion.button
                  key="close"
                  initial={{ opacity: 0, x: 300 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 300 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  onClick={() => setSidebarCollapsed(true)}
                  className="fixed top-8 right-8 z-[9999] w-10 h-10 bg-gray-900/90 backdrop-blur-sm border border-gray-700/50 rounded-lg flex items-center justify-center hover:bg-gray-800/90 transition-all duration-200"
                >
                  <div className="w-5 h-5 relative">
                    <div className="absolute top-1/2 left-1/2 w-4 h-0.5 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
                    <div className="absolute top-1/2 left-1/2 w-4 h-0.5 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 -rotate-45"></div>
                  </div>
                </motion.button>
              )}
            </AnimatePresence>

            <div className={`transition-all duration-400 ${sidebarCollapsed ? 'mt-16' : ''}`}>
              <motion.h1 
                className="text-5xl font-bold tracking-tight mb-2"
                style={{ fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                Booking Schedule
              </motion.h1>
              <motion.p 
                className="text-lg text-gray-400"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              >
                Your yacht reservations and maintenance schedule
              </motion.p>
            </div>

            <div className="flex gap-3">
              {/* Calendar View Toggles */}
              <div className="flex bg-gray-800/50 rounded-lg p-1">
                {Object.entries(CALENDAR_VIEWS).map(([key, label]) => (
                  <Button
                    key={key}
                    variant={view === label ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setView(label)}
                    className={`px-4 py-2 text-sm ${
                      view === label 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Calendar Grid */}
            <div className="xl:col-span-3">
              <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateMonth('prev')}
                      className="w-10 h-10 p-0 text-gray-400 hover:text-white"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <h2 className="text-xl font-semibold text-white">
                      {currentDate.toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateMonth('next')}
                      className="w-10 h-10 p-0 text-gray-400 hover:text-white"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-3 text-center text-sm font-medium text-gray-400">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => {
                    const isToday = isSameDay(day.date, new Date());
                    const isSelected = selectedDate && isSameDay(day.date, selectedDate);
                    const hasEvents = day.events.length > 0;

                    return (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        className={`
                          relative p-2 min-h-[80px] rounded-lg cursor-pointer transition-all duration-200
                          ${day.isCurrentMonth ? 'text-white' : 'text-gray-600'}
                          ${isToday ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'hover:bg-gray-800/50'}
                          ${isSelected ? 'ring-2 ring-purple-500' : ''}
                        `}
                        onClick={() => setSelectedDate(day.date)}
                      >
                        <div className="flex justify-between items-start">
                          <span className={`text-sm font-medium ${isToday ? 'text-white' : ''}`}>
                            {day.date.getDate()}
                          </span>
                        </div>
                        
                        {/* Event indicators */}
                        <div className="mt-1 space-y-1">
                          {day.events.slice(0, 2).map((event, eventIndex) => (
                            <div
                              key={eventIndex}
                              className={`text-xs px-2 py-1 rounded text-white bg-gradient-to-r ${EVENT_COLORS[event.type]} truncate`}
                            >
                              {event.title}
                            </div>
                          ))}
                          {day.events.length > 2 && (
                            <div className="text-xs text-gray-400 px-2">
                              +{day.events.length - 2} more
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Upcoming Bookings Sidebar */}
            <div className="xl:col-span-1">
              <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Upcoming Bookings</h3>
                
                <div className="space-y-4">
                  {upcomingBookings.length > 0 ? (
                    upcomingBookings.map((booking) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-purple-500/50 transition-all duration-200 cursor-pointer"
                        onClick={() => {
                          // Find the actual booking from the bookings array
                          const fullBooking = bookings.find(b => b.id === booking.id?.replace('booking-', ''));
                          if (fullBooking) {
                            setSelectedBooking(fullBooking);
                            setShowBookingModal(true);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${EVENT_COLORS[booking.type]} mt-1`}></div>
                          <Badge 
                            variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                            className={`text-xs ${
                              booking.status === 'confirmed' 
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' 
                                : 'bg-gray-700 text-gray-300'
                            }`}
                          >
                            {booking.status}
                          </Badge>
                        </div>
                        
                        <h4 className="text-sm font-medium text-white mb-1">
                          {booking.yachtName}
                        </h4>
                        <p className="text-xs text-gray-400 mb-1">
                          {booking.memberName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDateRange(booking.startTime, booking.endTime)}
                        </p>
                        
                        {booking.description && (
                          <p className="text-xs text-gray-500 mt-2 truncate">
                            {booking.description}
                          </p>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">No upcoming bookings</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}