import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Sparkles, 
  Search, 
  Filter,
  User,
  Clock,
  DollarSign,
  Star,
  Phone,
  MessageSquare,
  Eye,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Service {
  id: number;
  name: string;
  description: string;
  category: string;
  price: string;
  duration: number;
  providerId: number;
  rating: number;
  totalBookings: number;
  isActive: boolean;
  provider?: {
    id: number;
    username: string;
    email: string;
    phone: string;
  };
}

interface ServiceBooking {
  id: number;
  userId: number;
  serviceId: number;
  bookingDate: Date;
  status: string;
  totalAmount: string;
  notes: string;
  createdAt: Date;
  user?: {
    id: number;
    username: string;
    email: string;
    membershipTier: string;
  };
  service?: Service;
}

const StaffServicesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('services');

  const { data: services = [], isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ['/api/services'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/services');
      return response.json();
    },
  });

  const { data: serviceBookings = [], isLoading: bookingsLoading } = useQuery<ServiceBooking[]>({
    queryKey: ['/api/service-bookings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/service-bookings');
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

  const getCategoryBadge = (category: string) => {
    const colors = {
      'Beauty & Grooming': 'bg-pink-500',
      'Culinary': 'bg-orange-500',
      'Wellness & Spa': 'bg-green-500',
      'Photography & Media': 'bg-purple-500',
      'Entertainment': 'bg-blue-500',
      'Water Sports': 'bg-cyan-500',
      'Concierge & Lifestyle': 'bg-indigo-500'
    };
    return (
      <Badge className={`${colors[category as keyof typeof colors] || 'bg-gray-500'} text-white text-xs`}>
        {category}
      </Badge>
    );
  };

  const categories = [
    'Beauty & Grooming',
    'Culinary', 
    'Wellness & Spa',
    'Photography & Media',
    'Entertainment',
    'Water Sports',
    'Concierge & Lifestyle'
  ];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredBookings = serviceBookings.filter(booking => {
    const matchesSearch = booking.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.service?.name?.toLowerCase().includes(searchTerm.toLowerCase());
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
            Services Management
          </motion.h1>
          <motion.p 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 mt-2"
          >
            Manage yacht concierge services and bookings
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
          { id: 'services', label: 'Services', icon: Sparkles },
          { id: 'bookings', label: 'Service Bookings', icon: CheckCircle }
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
        
        {activeTab === 'services' && (
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-gray-900/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        )}
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {(activeTab === 'services' ? [
          { title: 'Total Services', value: services.length, icon: Sparkles, color: 'from-purple-500 to-blue-500' },
          { title: 'Active Services', value: services.filter(s => s.isActive).length, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
          { title: 'Total Providers', value: new Set(services.map(s => s.providerId)).size, icon: User, color: 'from-blue-500 to-cyan-500' },
          { title: 'Avg Rating', value: (services.reduce((acc, s) => acc + s.rating, 0) / services.length || 0).toFixed(1), icon: Star, color: 'from-yellow-500 to-orange-500' }
        ] : [
          { title: 'Total Bookings', value: serviceBookings.length, icon: CheckCircle, color: 'from-purple-500 to-blue-500' },
          { title: 'Confirmed', value: serviceBookings.filter(b => b.status === 'confirmed').length, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
          { title: 'Pending', value: serviceBookings.filter(b => b.status === 'pending').length, icon: AlertCircle, color: 'from-yellow-500 to-orange-500' },
          { title: 'Completed', value: serviceBookings.filter(b => b.status === 'completed').length, icon: CheckCircle, color: 'from-blue-500 to-cyan-500' }
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
              {activeTab === 'services' ? (
                <>
                  <Sparkles className="h-5 w-5 mr-2 text-purple-400" />
                  Available Services
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                  Service Bookings
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(activeTab === 'services' ? servicesLoading : bookingsLoading) ? (
              <div className="p-8 text-center text-gray-400">
                Loading {activeTab}...
              </div>
            ) : (activeTab === 'services' ? filteredServices : filteredBookings).length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                No {activeTab} found
              </div>
            ) : (
              <div className="space-y-4">
                {activeTab === 'services' ? 
                  filteredServices.map((service, index) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-6 rounded-xl bg-gray-800/30 hover:bg-gray-700/40 transition-all duration-300 group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-white font-semibold text-lg">{service.name}</h3>
                            {getCategoryBadge(service.category)}
                            <Badge className={`${service.isActive ? 'bg-green-500' : 'bg-red-500'} text-white text-xs`}>
                              {service.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-400 mb-3">{service.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center text-gray-400">
                              <DollarSign className="h-4 w-4 mr-2" />
                              {service.price}
                            </div>
                            <div className="flex items-center text-gray-400">
                              <Clock className="h-4 w-4 mr-2" />
                              {service.duration} min
                            </div>
                            <div className="flex items-center text-gray-400">
                              <Star className="h-4 w-4 mr-2" />
                              {service.rating.toFixed(1)} rating
                            </div>
                            <div className="flex items-center text-gray-400">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {service.totalBookings} bookings
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
                  filteredBookings.map((booking, index) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-6 rounded-xl bg-gray-800/30 hover:bg-gray-700/40 transition-all duration-300 group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-white font-semibold text-lg">
                              {booking.service?.name || 'Unknown Service'}
                            </h3>
                            {getStatusBadge(booking.status)}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                            <div className="flex items-center text-gray-400">
                              <User className="h-4 w-4 mr-2" />
                              {booking.user?.username || 'Unknown Member'}
                            </div>
                            <div className="flex items-center text-gray-400">
                              <Clock className="h-4 w-4 mr-2" />
                              {formatDistanceToNow(new Date(booking.bookingDate), { addSuffix: true })}
                            </div>
                            <div className="flex items-center text-gray-400">
                              <DollarSign className="h-4 w-4 mr-2" />
                              {booking.totalAmount}
                            </div>
                            <div className="flex items-center text-gray-400">
                              <Sparkles className="h-4 w-4 mr-2" />
                              {booking.service?.category || 'Unknown Category'}
                            </div>
                          </div>

                          {booking.notes && (
                            <div className="p-3 bg-gray-900/50 rounded-lg">
                              <p className="text-gray-300 text-sm">
                                <strong>Notes:</strong> {booking.notes}
                              </p>
                            </div>
                          )}
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

export default StaffServicesPage;