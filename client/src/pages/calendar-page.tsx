import { useState, useEffect, useMemo } from "react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  Calendar,
  ChevronLeft, 
  ChevronRight,
  Plus,
  Filter,
  Search,
  Grid3X3,
  List,
  Clock,
  MapPin,
  Users,
  Star,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Anchor,
  Sparkles,
  CalendarDays,
  ChevronDown,
  X,
  Check,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Calendar types
interface CalendarEvent {
  id: string;
  title: string;
  type: 'yacht' | 'service' | 'event';
  startTime: Date;
  endTime: Date;
  description?: string;
  location?: string;
  capacity?: number;
  attendees?: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  color: string;
  member?: {
    name: string;
    email: string;
    membershipTier: string;
  };
  details?: any;
}

const CALENDAR_VIEWS = {
  MONTH: 'month',
  WEEK: 'week',
  DAY: 'day',
  AGENDA: 'agenda'
} as const;

type CalendarView = typeof CALENDAR_VIEWS[keyof typeof CALENDAR_VIEWS];

const EVENT_COLORS = {
  yacht: 'from-purple-600 to-indigo-600',
  service: 'from-purple-600 to-indigo-600',
  event: 'from-purple-600 to-indigo-600'
};

const EVENT_TYPES = {
  yacht: { label: 'Yacht Booking', icon: Anchor, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  service: { label: 'Concierge Service', icon: Sparkles, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  event: { label: 'Club Event', icon: CalendarDays, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' }
};

// Utility functions
const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDateRange = (start: Date, end: Date) => {
  const startStr = start.toLocaleDateString();
  const endStr = end.toLocaleDateString();
  return startStr === endStr ? startStr : `${startStr} - ${endStr}`;
};

const isSameDay = (date1: Date, date2: Date) => {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
};

const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  const days = [];
  
  // Previous month days
  const prevMonth = new Date(year, month - 1, 0);
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonth.getDate() - i),
      isCurrentMonth: false,
      isToday: false
    });
  }
  
  // Current month days
  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day);
    days.push({
      date: currentDate,
      isCurrentMonth: true,
      isToday: isSameDay(currentDate, today)
    });
  }
  
  // Next month days to fill the grid
  const totalCells = Math.ceil(days.length / 7) * 7;
  let nextMonthDay = 1;
  while (days.length < totalCells) {
    days.push({
      date: new Date(year, month + 1, nextMonthDay),
      isCurrentMonth: false,
      isToday: false
    });
    nextMonthDay++;
  }
  
  return days;
};

// Event Details Modal Component
const EventDetailsModal = ({ event, isOpen, onClose }: { event: CalendarEvent | null; isOpen: boolean; onClose: () => void }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  if (!event) return null;

  const eventConfig = EVENT_TYPES[event.type];
  const Icon = eventConfig.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/50/60 transition-all duration-500 hover:border-purple-500/30 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${EVENT_COLORS[event.type]}`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{event.title}</h3>
              <Badge className={eventConfig.color}>{eventConfig.label}</Badge>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-300">
                <Clock className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium">{formatDateRange(event.startTime, event.endTime)}</p>
                  <p className="text-sm text-gray-400">
                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                  </p>
                </div>
              </div>
              
              {event.location && (
                <div className="flex items-center space-x-3 text-gray-300">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{event.location}</span>
                </div>
              )}
              
              {event.capacity && (
                <div className="flex items-center space-x-3 text-gray-300">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>{event.attendees || 0} / {event.capacity} guests</span>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              {event.member && (
                <div className="p-4 rounded-lg bg-gray-900/50">
                  <h4 className="text-white font-medium mb-2">Member Details</h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-300">{event.member.name}</p>
                    <p className="text-gray-400">{event.member.email}</p>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                      {event.member.membershipTier} Member
                    </Badge>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">Status:</span>
                <Badge className={
                  event.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                  event.status === 'pending' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                  'bg-red-500/20 text-red-400 border-red-500/30'
                }>
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
          
          {event.description && (
            <div className="p-4 rounded-lg bg-gray-900/50">
              <h4 className="text-white font-medium mb-2">Description</h4>
              <p className="text-gray-300 text-sm">{event.description}</p>
            </div>
          )}
          
          {/* Type-specific details */}
          {event.type === 'yacht' && event.details && (
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <h4 className="text-white font-medium mb-2">Yacht Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Yacht:</span>
                  <p className="text-white">{event.details.yachtName}</p>
                </div>
                <div>
                  <span className="text-gray-400">Size:</span>
                  <p className="text-white">{event.details.yachtSize}ft</p>
                </div>
              </div>
            </div>
          )}
          
          {event.type === 'service' && event.details && (
            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <h4 className="text-white font-medium mb-2">Service Details</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-400">Category:</span>
                  <p className="text-white">{event.details.category}</p>
                </div>
                <div>
                  <span className="text-gray-400">Provider:</span>
                  <p className="text-white">{event.details.providerName}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="space-x-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Calendar Event Component
const CalendarEventCard = ({ event, onClick, isCompact = false }: { 
  event: CalendarEvent; 
  onClick: () => void; 
  isCompact?: boolean;
}) => {
  const eventConfig = EVENT_TYPES[event.type];
  const Icon = eventConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`
        p-2 rounded-lg cursor-pointer transition-all duration-200 group relative overflow-hidden
        ${isCompact ? 'mb-1' : 'mb-2'}
        bg-gradient-to-r ${EVENT_COLORS[event.type]} bg-opacity-20
        border border-purple-500 border-opacity-30 hover:border-opacity-50
      `}
    >
      <div className="flex items-center space-x-2">
        <Icon className="h-3 w-3 text-purple-400" />
        <span className={`text-xs font-medium truncate text-white ${isCompact ? 'max-w-20' : 'max-w-32'}`}>
          {event.title}
        </span>
        {!isCompact && (
          <div className={`w-2 h-2 rounded-full ${
            event.status === 'confirmed' ? 'bg-green-400' :
            event.status === 'pending' ? 'bg-orange-400' : 'bg-red-400'
          }`} />
        )}
      </div>
      
      {!isCompact && (
        <div className="mt-1 space-y-1">
          <p className="text-xs text-gray-300 truncate">
            {formatTime(event.startTime)} - {formatTime(event.endTime)}
          </p>
          {event.member && (
            <p className="text-xs text-gray-400 truncate">{event.member.name}</p>
          )}
        </div>
      )}
      
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-white bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-200" />
    </motion.div>
  );
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>(CALENDAR_VIEWS.MONTH);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'yacht' | 'service' | 'event'>('all');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch calendar data
  const { data: bookings = [] } = useQuery<any[]>({
    queryKey: ['/api/bookings'],
    staleTime: 30000,
    refetchInterval: 30000
  });

  const { data: serviceBookings = [] } = useQuery<any[]>({
    queryKey: ['/api/service-bookings'],
    staleTime: 30000,
    refetchInterval: 30000
  });

  const { data: eventRegistrations = [] } = useQuery<any[]>({
    queryKey: ['/api/event-registrations'],
    staleTime: 30000,
    refetchInterval: 30000
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/users'],
    enabled: user?.role === 'admin'
  });

  const { data: yachtsData = [] } = useQuery<any[]>({
    queryKey: ['/api/yachts'],
  });

  const { data: servicesData = [] } = useQuery<any[]>({
    queryKey: ['/api/services'],
  });

  const { data: eventsData = [] } = useQuery<any[]>({
    queryKey: ['/api/events'],
  });

  // Transform data into calendar events
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    const events: CalendarEvent[] = [];

    // Add yacht bookings
    bookings.forEach((booking: any) => {
      const yacht = yachtsData.find((y: any) => y.id === booking.yachtId);
      const member = users.find((u: any) => u.id === booking.userId);
      
      events.push({
        id: `yacht-${booking.id}`,
        title: yacht?.name || 'Yacht Booking',
        type: 'yacht',
        startTime: new Date(booking.startTime),
        endTime: new Date(booking.endTime),
        description: booking.specialRequests || undefined,
        location: yacht?.location,
        capacity: yacht?.capacity,
        attendees: booking.guestCount,
        status: booking.status,
        color: EVENT_COLORS.yacht,
        member: member ? {
          name: member.username,
          email: member.email,
          membershipTier: member.membershipTier
        } : undefined,
        details: {
          yachtName: yacht?.name,
          yachtSize: yacht?.size
        }
      });
    });

    // Add service bookings
    serviceBookings.forEach((service: any) => {
      const serviceData = servicesData.find((s: any) => s.id === service.serviceId);
      const member = users.find((u: any) => u.id === service.userId);
      
      events.push({
        id: `service-${service.id}`,
        title: serviceData?.name || 'Concierge Service',
        type: 'service',
        startTime: new Date(service.scheduledDate),
        endTime: new Date(new Date(service.scheduledDate).getTime() + 2 * 60 * 60 * 1000), // 2 hours default
        description: service.notes || undefined,
        status: service.status,
        color: EVENT_COLORS.service,
        member: member ? {
          name: member.username,
          email: member.email,
          membershipTier: member.membershipTier
        } : undefined,
        details: {
          category: serviceData?.category,
          providerName: serviceData?.providerName
        }
      });
    });

    // Add club events from event registrations
    eventRegistrations.forEach((eventRegistration: any) => {
      const eventData = eventsData.find((e: any) => e.id === eventRegistration.eventId);
      const member = users.find((u: any) => u.id === eventRegistration.userId);
      
      events.push({
        id: `event-${eventRegistration.id}`,
        title: eventData?.title || 'Club Event',
        type: 'event',
        startTime: new Date(eventData?.startTime || eventRegistration.registrationDate),
        endTime: new Date(eventData?.endTime || new Date(eventRegistration.registrationDate).getTime() + 3 * 60 * 60 * 1000),
        description: eventData?.description,
        location: eventData?.location,
        capacity: eventData?.capacity,
        attendees: eventData?.attendees,
        status: 'confirmed',
        color: EVENT_COLORS.event,
        member: member ? {
          name: member.username,
          email: member.email,
          membershipTier: member.membershipTier
        } : undefined,
        details: {
          eventType: eventData?.category
        }
      });
    });

    // Add all scheduled events (not just registered ones) for admin visibility
    if (user?.role === 'admin') {
      eventsData.forEach((eventData: any) => {
        // Only add if not already added through registrations
        const alreadyAdded = events.some(e => e.id === `event-${eventData.id}`);
        if (!alreadyAdded) {
          events.push({
            id: `event-${eventData.id}`,
            title: eventData.title,
            type: 'event',
            startTime: new Date(eventData.startTime),
            endTime: new Date(eventData.endTime),
            description: eventData.description,
            location: eventData.location,
            capacity: eventData.capacity,
            attendees: eventData.attendees || 0,
            status: 'confirmed',
            color: EVENT_COLORS.event,
            details: {
              eventType: eventData.category
            }
          });
        }
      });
    }

    return events;
  }, [bookings, serviceBookings, eventRegistrations, users, yachtsData, servicesData, eventsData]);

  // Filter events
  const filteredEvents = useMemo(() => {
    let filtered = calendarEvents;

    if (filterType !== 'all') {
      filtered = filtered.filter(event => event.type === filterType);
    }

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.member?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [calendarEvents, filterType, searchTerm]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => isSameDay(event.startTime, date));
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

  const navigateToToday = () => {
    setCurrentDate(new Date());
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (view !== CALENDAR_VIEWS.DAY) {
      setView(CALENDAR_VIEWS.DAY);
      setCurrentDate(date);
    }
  };

  // Month view component
  const MonthView = () => {
    const days = getDaysInMonth(currentDate);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl backdrop-blur-xl overflow-hidden">
        {/* Week headers */}
        <div className="grid grid-cols-7 border-b border-gray-700/50">
          {weekDays.map(day => (
            <div key={day} className="p-4 text-center text-gray-400 font-medium text-sm">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day.date);
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.01 }}
                onClick={() => handleDateClick(day.date)}
                className={`
                  min-h-32 p-2 border-r border-b border-gray-700/50/30 cursor-pointer transition-all duration-200
                  hover:bg-gray-900/50/30 relative group
                  ${!day.isCurrentMonth ? 'bg-gray-900/50/20 text-gray-500' : 'text-white'}
                  ${day.isToday ? 'bg-gradient-to-r from-purple-600/10 to-indigo-600/10 border-purple-500/30' : ''}
                `}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`
                    text-sm font-medium
                    ${day.isToday ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}
                  `}>
                    {day.date.getDate()}
                  </span>
                  {dayEvents.length > 0 && (
                    <Badge variant="outline" className="text-xs px-1 py-0 h-5">
                      {dayEvents.length}
                    </Badge>
                  )}
                </div>

                {/* Events for this day */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => (
                    <div key={event.id} onClick={() => handleEventClick(event)}>
                      <CalendarEventCard
                        event={event}
                        onClick={() => {}}
                        isCompact
                      />
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-400 text-center py-1">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-white bg-opacity-0 group-hover:bg-opacity-2 transition-all duration-200" />
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  // Week view component
  const WeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const days = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
    
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const today = new Date();

    return (
      <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl backdrop-blur-xl overflow-hidden">
        {/* Week header */}
        <div className="p-4 border-b border-gray-700/50">
          <h3 className="text-xl font-bold text-white mb-2">
            {startOfWeek.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="grid grid-cols-8 gap-2">
            <div className="w-16"></div> {/* Time column spacer */}
            {days.map((day, index) => (
              <div key={index} className="text-center">
                <div className="text-sm text-gray-400 mb-1">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`
                  text-lg font-semibold rounded-full w-8 h-8 flex items-center justify-center mx-auto
                  ${isSameDay(day, today) ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : 'text-white'}
                `}>
                  {day.getDate()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Week grid */}
        <div className="max-h-96 overflow-y-auto">
          <div className="grid grid-cols-8 gap-0">
            {/* Time labels */}
            <div className="w-16 border-r border-gray-700/50/30">
              {hours.map(hour => (
                <div key={hour} className="h-16 flex items-start justify-end pr-2 pt-1 text-xs text-gray-400">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {days.map((day, dayIndex) => (
              <div key={dayIndex} className="border-r border-gray-700/50/30 relative">
                {hours.map(hour => (
                  <div key={hour} className="h-16 border-b border-gray-700/50/20 p-1 relative">
                    {/* Events for this hour */}
                    {getEventsForDate(day)
                      .filter(event => event.startTime.getHours() === hour)
                      .map(event => (
                        <div
                          key={event.id}
                          onClick={() => handleEventClick(event)}
                          className={`
                            absolute left-1 right-1 rounded cursor-pointer text-xs p-1 z-10
                            bg-gradient-to-r ${EVENT_COLORS[event.type]} bg-opacity-80
                            border-l-2 ${
                              event.type === 'yacht' ? 'border-blue-400' : 
                              event.type === 'service' ? 'border-orange-400' : 'border-purple-400'
                            }
                            hover:bg-opacity-100 transition-all duration-200
                          `}
                          style={{
                            top: `${(event.startTime.getMinutes() / 60) * 100}%`,
                            height: `${Math.min(
                              ((event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60 * 60)) * 100,
                              100
                            )}%`
                          }}
                        >
                          <div className="font-medium text-white truncate">{event.title}</div>
                          <div className="text-gray-200 truncate">
                            {formatTime(event.startTime)} - {formatTime(event.endTime)}
                          </div>
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Day view component
  const DayView = () => {
    const dayEvents = getEventsForDate(currentDate).sort((a, b) => 
      a.startTime.getTime() - b.startTime.getTime()
    );
    
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const today = new Date();

    return (
      <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl backdrop-blur-xl overflow-hidden">
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">
                {currentDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <p className="text-gray-400">{dayEvents.length} events scheduled</p>
            </div>
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold
              ${isSameDay(currentDate, today) ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' : 'bg-gray-700 text-gray-300'}
            `}>
              {currentDate.getDate()}
            </div>
          </div>
        </div>

        <div className="flex max-h-96 overflow-hidden">
          {/* Time sidebar */}
          <div className="w-20 border-r border-gray-700/50/30 bg-gray-900/50/30">
            {hours.map(hour => (
              <div key={hour} className="h-16 flex items-start justify-end pr-3 pt-2 text-xs text-gray-400 border-b border-gray-700/50/20">
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>
            ))}
          </div>

          {/* Events timeline */}
          <div className="flex-1 relative overflow-y-auto">
            {hours.map(hour => (
              <div key={hour} className="h-16 border-b border-gray-700/50/20 relative">
                {/* Events for this hour */}
                {dayEvents
                  .filter(event => event.startTime.getHours() === hour)
                  .map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleEventClick(event)}
                      className={`
                        absolute left-2 right-2 rounded-lg cursor-pointer p-3 z-10
                        bg-gradient-to-r ${EVENT_COLORS[event.type]} bg-opacity-90
                        border-l-4 ${
                          event.type === 'yacht' ? 'border-blue-400' : 
                          event.type === 'service' ? 'border-orange-400' : 'border-purple-400'
                        }
                        hover:bg-opacity-100 hover:scale-105 transition-all duration-200
                        shadow-lg hover:shadow-xl
                      `}
                      style={{
                        top: `${(event.startTime.getMinutes() / 60) * 100}%`,
                        height: `${Math.max(
                          ((event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60 * 60)) * 64,
                          48
                        )}px`
                      }}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {React.createElement(EVENT_TYPES[event.type].icon, { 
                          className: "h-4 w-4 text-white" 
                        })}
                        <span className="font-semibold text-white text-sm">{event.title}</span>
                      </div>
                      <div className="text-xs text-gray-200 mb-1">
                        {formatTime(event.startTime)} - {formatTime(event.endTime)}
                      </div>
                      {event.member && (
                        <div className="text-xs text-gray-300 truncate">
                          {event.member.name}
                        </div>
                      )}
                      <div className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${ 
                        event.status === 'confirmed' ? 'bg-green-500/30 text-green-300' :
                        event.status === 'pending' ? 'bg-orange-500/30 text-orange-300' :
                        'bg-red-500/30 text-red-300'
                      }`}>
                        {event.status}
                      </div>
                    </motion.div>
                  ))}
              </div>
            ))}
            
            {dayEvents.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Calendar className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No events scheduled</p>
                  <p className="text-gray-500 text-sm">Click to add new event</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Agenda view component
  const AgendaView = () => {
    const upcomingEvents = filteredEvents
      .filter(event => event.startTime >= new Date())
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      .slice(0, 50);

    return (
      <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl backdrop-blur-xl overflow-hidden">
        <div className="p-6 border-b border-gray-700/50">
          <h3 className="text-xl font-bold text-white">Upcoming Events</h3>
          <p className="text-gray-400">{upcomingEvents.length} events scheduled</p>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No upcoming events</p>
              <p className="text-gray-500 text-sm">All events are up to date</p>
            </div>
          ) : (
            <div className="space-y-6">
              {upcomingEvents.reduce((groups: { [key: string]: CalendarEvent[] }, event) => {
                const dateKey = event.startTime.toDateString();
                if (!groups[dateKey]) groups[dateKey] = [];
                groups[dateKey].push(event);
                return groups;
              }, {}).map ? Object.entries(upcomingEvents.reduce((groups: { [key: string]: CalendarEvent[] }, event) => {
                const dateKey = event.startTime.toDateString();
                if (!groups[dateKey]) groups[dateKey] = [];
                groups[dateKey].push(event);
                return groups;
              }, {})).map(([date, events]) => (
                <div key={date} className="space-y-3">
                  <h4 className="text-white font-semibold text-lg border-b border-gray-700/50 pb-2">
                    {new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h4>
                  <div className="space-y-2">
                    {events.map(event => (
                      <CalendarEventCard
                        key={event.id}
                        event={event}
                        onClick={() => handleEventClick(event)}
                      />
                    ))}
                  </div>
                </div>
              )) : null}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mt-16"
        >
          <div>
            <h1 className="text-5xl font-bold text-white mb-2 tracking-tight" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif', fontWeight: 700 }}>MBYC Calendar</h1>
            <p className="text-lg text-gray-400">
              Interactive yacht bookings, services, and events calendar
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-900/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 w-64"
              />
            </div>

            {/* Filter */}
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="bg-gray-900/50 border-gray-600 text-white w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/50/60 transition-all duration-500 hover:border-purple-500/30">
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="yacht">Yacht Bookings</SelectItem>
                <SelectItem value="service">Concierge Services</SelectItem>
                <SelectItem value="event">Club Events</SelectItem>
              </SelectContent>
            </Select>

            {/* View selector */}
            <div className="flex items-center space-x-2 bg-gray-900/50 rounded-lg p-1">
              {Object.entries(CALENDAR_VIEWS).map(([key, value]) => (
                <Button
                  key={value}
                  size="sm"
                  variant={view === value ? "default" : "ghost"}
                  onClick={() => setView(value)}
                  className={view === value ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white" : "text-gray-400"}
                >
                  {key.charAt(0) + key.slice(1).toLowerCase()}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Calendar Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between bg-gray-900/50 border border-gray-700/50 rounded-xl p-4 backdrop-blur-xl"
        >
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="text-gray-400 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h2 className="text-xl font-bold text-white min-w-48 text-center">
              {currentDate.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </h2>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="text-gray-400 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={navigateToToday}
              className="border-gray-600 text-gray-300 hover:text-white hover:border-purple-500"
            >
              Today
            </Button>
            

          </div>
        </motion.div>

        {/* Calendar View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatePresence mode="wait">
            {view === CALENDAR_VIEWS.MONTH && <MonthView />}
            {view === CALENDAR_VIEWS.WEEK && <WeekView />}
            {view === CALENDAR_VIEWS.DAY && <DayView />}
            {view === CALENDAR_VIEWS.AGENDA && <AgendaView />}
          </AnimatePresence>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          {Object.entries(EVENT_TYPES).map(([type, config], index) => {
            const typeEvents = filteredEvents.filter(e => e.type === type);
            const Icon = config.icon;
            
            return (
              <Card key={type} className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">{config.label}</p>
                      <p className="text-3xl font-bold text-white">{typeEvents.length}</p>
                    </div>
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${EVENT_COLORS[type as keyof typeof EVENT_COLORS]}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-gradient-to-r ${EVENT_COLORS[type as keyof typeof EVENT_COLORS]}`}
                          style={{ width: `${Math.min((typeEvents.length / calendarEvents.length) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-gray-400 text-xs">
                        {calendarEvents.length > 0 ? Math.round((typeEvents.length / calendarEvents.length) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>
      </div>

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={showEventDetails}
        onClose={() => {
          setShowEventDetails(false);
          setSelectedEvent(null);
        }}
      />
    </div>
  );
}