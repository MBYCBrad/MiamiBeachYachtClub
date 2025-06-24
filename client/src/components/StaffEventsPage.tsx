import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  CalendarDays, 
  Search, 
  Filter,
  User,
  Clock,
  MapPin,
  DollarSign,
  Users,
  Phone,
  MessageSquare,
  Eye,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface Event {
  id: number;
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  capacity: number;
  ticketPrice: string;
  hostId: number;
  category: string;
  status: string;
  registeredCount: number;
  images: string[];
  host?: {
    id: number;
    username: string;
    email: string;
  };
}

interface EventRegistration {
  id: number;
  userId: number;
  eventId: number;
  ticketCount: number;
  totalAmount: string;
  status: string;
  createdAt: Date;
  user?: {
    id: number;
    username: string;
    email: string;
    membershipTier: string;
  };
  event?: Event;
}

const StaffEventsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('events');

  const { data: events = [], isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ['/api/events'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/events');
      return response.json();
    },
  });

  const { data: registrations = [], isLoading: registrationsLoading } = useQuery<EventRegistration[]>({
    queryKey: ['/api/event-registrations'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/event-registrations');
      return response.json();
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'confirmed':
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500 text-white">Cancelled</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500 text-white">Completed</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">{status}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      'Social': 'bg-purple-500',
      'Educational': 'bg-blue-500',
      'Entertainment': 'bg-pink-500',
      'Networking': 'bg-green-500',
      'Exclusive': 'bg-gold-500',
      'Seasonal': 'bg-orange-500'
    };
    return (
      <Badge className={`${colors[category as keyof typeof colors] || 'bg-gray-500'} text-white text-xs`}>
        {category}
      </Badge>
    );
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredRegistrations = registrations.filter(registration => {
    const matchesSearch = registration.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         registration.event?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
          >
            Events Management
          </motion.h1>
          <motion.p 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 mt-2"
          >
            Manage yacht club events and member registrations
          </motion.p>
        </div>
      </div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex space-x-1 bg-gray-900/50 p-1 rounded-xl w-fit"
      >
        {[
          { id: 'events', label: 'Events', icon: CalendarDays },
          { id: 'registrations', label: 'Registrations', icon: CheckCircle }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center space-x-4"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-900/50 border-gray-600 focus:border-purple-500 text-white"
          />
        </div>
        
        {activeTab === 'events' && (
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-900/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        )}
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {(activeTab === 'events' ? [
          { title: 'Total Events', value: events.length, icon: CalendarDays, color: 'from-purple-500 to-blue-500' },
          { title: 'Active Events', value: events.filter(e => e.status === 'active').length, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
          { title: 'Total Capacity', value: events.reduce((sum, e) => sum + e.capacity, 0), icon: Users, color: 'from-blue-500 to-cyan-500' },
          { title: 'Total Registered', value: events.reduce((sum, e) => sum + e.registeredCount, 0), icon: User, color: 'from-orange-500 to-red-500' }
        ] : [
          { title: 'Total Registrations', value: registrations.length, icon: CheckCircle, color: 'from-purple-500 to-blue-500' },
          { title: 'Confirmed', value: registrations.filter(r => r.status === 'confirmed').length, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
          { title: 'Pending', value: registrations.filter(r => r.status === 'pending').length, icon: AlertCircle, color: 'from-yellow-500 to-orange-500' },
          { title: 'Revenue', value: `$${registrations.reduce((sum, r) => sum + parseFloat(r.totalAmount), 0).toFixed(0)}`, icon: DollarSign, color: 'from-green-500 to-teal-500' }
        ]).map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/60 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                    <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              {activeTab === 'events' ? (
                <>
                  <CalendarDays className="h-5 w-5 mr-2 text-purple-400" />
                  Upcoming Events
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                  Event Registrations
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(activeTab === 'events' ? eventsLoading : registrationsLoading) ? (
              <div className="p-8 text-center text-gray-400">
                Loading {activeTab}...
              </div>
            ) : (activeTab === 'events' ? filteredEvents : filteredRegistrations).length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                No {activeTab} found
              </div>
            ) : (
              <div className="space-y-4">
                {activeTab === 'events' ? 
                  filteredEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-6 rounded-xl bg-gray-800/30 hover:bg-gray-700/40 transition-all duration-300 group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          {/* Event Image */}
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0 overflow-hidden">
                            {event.images?.[0] ? (
                              <img 
                                src={event.images[0]} 
                                alt={event.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <CalendarDays className="h-8 w-8 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Event Details */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-white font-semibold text-lg">{event.title}</h3>
                              {getStatusBadge(event.status)}
                              {getCategoryBadge(event.category)}
                            </div>
                            
                            <p className="text-gray-400 mb-3 line-clamp-2">{event.description}</p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center text-gray-400">
                                <Clock className="h-4 w-4 mr-2" />
                                {format(new Date(event.date), 'MMM dd, yyyy')} at {event.time}
                              </div>
                              <div className="flex items-center text-gray-400">
                                <MapPin className="h-4 w-4 mr-2" />
                                {event.location}
                              </div>
                              <div className="flex items-center text-gray-400">
                                <Users className="h-4 w-4 mr-2" />
                                {event.registeredCount}/{event.capacity} registered
                              </div>
                              <div className="flex items-center text-gray-400">
                                <DollarSign className="h-4 w-4 mr-2" />
                                {event.ticketPrice}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-600 hover:border-blue-500 text-gray-300 hover:text-white"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-600 hover:border-green-500 text-gray-300 hover:text-white"
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )) :
                  filteredRegistrations.map((registration, index) => (
                    <motion.div
                      key={registration.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-6 rounded-xl bg-gray-800/30 hover:bg-gray-700/40 transition-all duration-300 group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-white font-semibold text-lg">
                              {registration.event?.title || 'Unknown Event'}
                            </h3>
                            {getStatusBadge(registration.status)}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                            <div className="flex items-center text-gray-400">
                              <User className="h-4 w-4 mr-2" />
                              {registration.user?.username || 'Unknown Member'}
                            </div>
                            <div className="flex items-center text-gray-400">
                              <Clock className="h-4 w-4 mr-2" />
                              {formatDistanceToNow(new Date(registration.createdAt), { addSuffix: true })}
                            </div>
                            <div className="flex items-center text-gray-400">
                              <Users className="h-4 w-4 mr-2" />
                              {registration.ticketCount} tickets
                            </div>
                            <div className="flex items-center text-gray-400">
                              <DollarSign className="h-4 w-4 mr-2" />
                              {registration.totalAmount}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-600 hover:border-blue-500 text-gray-300 hover:text-white"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-600 hover:border-green-500 text-gray-300 hover:text-white"
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-600 hover:border-purple-500 text-gray-300 hover:text-white"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                }
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default StaffEventsPage;