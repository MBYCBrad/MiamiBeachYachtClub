import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Calendar, 
  Clock, 
  User, 
  Ship, 
  Search, 
  Filter,
  MapPin,
  Phone,
  MessageSquare,
  Eye,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Booking {
  id: number;
  userId: number;
  yachtId: number;
  startTime: Date;
  endTime: Date;
  guestCount: number;
  specialRequests: string | null;
  status: string;
  totalPrice: string | null;
  createdAt: Date;
  user?: {
    id: number;
    username: string;
    email: string;
    phone: string;
    membershipTier: string;
  };
  yacht?: {
    id: number;
    name: string;
    type: string;
    length: number;
    capacity: number;
    location: string;
    images: string[];
  };
}

const StaffBookingsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ['/api/bookings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/bookings');
      return response.json();
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <Badge className="bg-green-500 text-white">Confirmed</Badge>;
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

  const getMembershipBadge = (tier: string) => {
    const colors = {
      'Bronze': 'bg-orange-600',
      'Silver': 'bg-gray-400', 
      'Gold': 'bg-yellow-500',
      'Platinum': 'bg-purple-600'
    };
    return (
      <Badge className={`${colors[tier as keyof typeof colors] || 'bg-gray-500'} text-white text-xs`}>
        {tier}
      </Badge>
    );
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.yacht?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
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
            Bookings Management
          </motion.h1>
          <motion.p 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 mt-2"
          >
            Manage yacht bookings and member reservations
          </motion.p>
        </div>
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center space-x-4"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-900/50 border-gray-600 focus:border-purple-500 text-white"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-900/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Total Bookings', value: bookings.length, icon: Calendar, color: 'from-purple-500 to-blue-500' },
          { title: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
          { title: 'Pending', value: bookings.filter(b => b.status === 'pending').length, icon: AlertCircle, color: 'from-yellow-500 to-orange-500' },
          { title: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length, icon: XCircle, color: 'from-red-500 to-red-600' }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
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

      {/* Bookings List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-purple-400" />
              Recent Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="p-8 text-center text-gray-400">
                Loading bookings...
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                No bookings found
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 rounded-xl bg-gray-800/30 hover:bg-gray-700/40 transition-all duration-300 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        {/* Yacht Image */}
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0 overflow-hidden">
                          {booking.yacht?.images?.[0] ? (
                            <img 
                              src={booking.yacht.images[0]} 
                              alt={booking.yacht.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Ship className="h-8 w-8 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Booking Details */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-white font-semibold text-lg">
                              {booking.yacht?.name || 'Unknown Yacht'}
                            </h3>
                            {getStatusBadge(booking.status)}
                            {booking.user?.membershipTier && getMembershipBadge(booking.user.membershipTier)}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center text-gray-400">
                              <User className="h-4 w-4 mr-2" />
                              {booking.user?.username || 'Unknown Member'}
                            </div>
                            <div className="flex items-center text-gray-400">
                              <Clock className="h-4 w-4 mr-2" />
                              {formatDistanceToNow(new Date(booking.startTime), { addSuffix: true })}
                            </div>
                            <div className="flex items-center text-gray-400">
                              <MapPin className="h-4 w-4 mr-2" />
                              {booking.yacht?.location || 'Unknown Location'}
                            </div>
                            <div className="flex items-center text-gray-400">
                              <User className="h-4 w-4 mr-2" />
                              {booking.guestCount} guests
                            </div>
                          </div>

                          {booking.specialRequests && (
                            <div className="mt-3 p-3 bg-gray-900/50 rounded-lg">
                              <p className="text-gray-300 text-sm">
                                <strong>Special Requests:</strong> {booking.specialRequests}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
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
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default StaffBookingsPage;