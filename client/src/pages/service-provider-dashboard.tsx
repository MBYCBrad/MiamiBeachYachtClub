import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart3, 
  Briefcase, 
  CalendarDays, 
  DollarSign, 
  Settings, 
  Crown,
  TrendingUp,
  Activity,
  Bell,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  Sparkles,
  Zap,
  Star,
  Clock,
  Users,
  Eye,
  Edit,
  Plus,
  MapPin,
  Shield,
  Utensils,
  Scissors,
  Heart,
  Camera,
  Music,
  Waves,
  Coffee,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

interface ServiceProviderStats {
  totalServices: number;
  totalBookings: number;
  monthlyRevenue: number;
  avgRating: number;
  completionRate: number;
  activeClients: number;
}

const sidebarItems = [
  { id: 'overview', label: 'Overview', icon: BarChart3, color: 'from-blue-500 to-cyan-500' },
  { id: 'services', label: 'My Services', icon: Briefcase, color: 'from-purple-500 to-pink-500' },
  { id: 'bookings', label: 'Bookings', icon: CalendarDays, color: 'from-emerald-500 to-teal-500' },
  { id: 'revenue', label: 'Revenue', icon: DollarSign, color: 'from-green-500 to-emerald-500' },
  { id: 'clients', label: 'Clients', icon: Users, color: 'from-orange-500 to-red-500' },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'from-violet-500 to-indigo-500' },
  { id: 'profile', label: 'Profile', icon: Crown, color: 'from-pink-500 to-rose-500' },
  { id: 'settings', label: 'Settings', icon: Settings, color: 'from-gray-500 to-slate-500' }
];

const serviceCategories = [
  {
    id: 'beauty_grooming',
    name: 'Beauty & Grooming',
    icon: Scissors,
    color: 'from-pink-500 to-rose-500',
    services: [
      'Hair Styling & Cuts',
      'Makeup Artist',
      'Manicure & Pedicure',
      'Massage Therapy',
      'Personal Styling'
    ]
  },
  {
    id: 'culinary',
    name: 'Culinary Services',
    icon: Utensils,
    color: 'from-orange-500 to-red-500',
    services: [
      'Private Chef',
      'Bartender Services',
      'Wine Sommelier',
      'Catering & Events',
      'Specialty Cuisine'
    ]
  },
  {
    id: 'wellness_spa',
    name: 'Wellness & Spa',
    icon: Heart,
    color: 'from-green-500 to-emerald-500',
    services: [
      'Spa Treatments',
      'Yoga Instructor',
      'Fitness Trainer',
      'Meditation Guide',
      'Wellness Coaching'
    ]
  },
  {
    id: 'photography_media',
    name: 'Photography & Media',
    icon: Camera,
    color: 'from-purple-500 to-indigo-500',
    services: [
      'Professional Photography',
      'Videography',
      'Drone Services',
      'Social Media Content',
      'Event Documentation'
    ]
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: Music,
    color: 'from-blue-500 to-cyan-500',
    services: [
      'Live Music Performance',
      'DJ Services',
      'Entertainment Host',
      'Cultural Experiences',
      'Party Planning'
    ]
  },
  {
    id: 'water_sports',
    name: 'Water Sports',
    icon: Waves,
    color: 'from-teal-500 to-blue-500',
    services: [
      'Diving Instruction',
      'Water Sports Equipment',
      'Fishing Guide',
      'Jet Ski Rental',
      'Snorkeling Tours'
    ]
  },
  {
    id: 'concierge_lifestyle',
    name: 'Concierge & Lifestyle',
    icon: Coffee,
    color: 'from-amber-500 to-orange-500',
    services: [
      'Personal Concierge',
      'Transportation',
      'Shopping Services',
      'Event Planning',
      'VIP Experiences'
    ]
  }
];

const StatCard = ({ title, value, change, icon: Icon, gradient, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
    whileHover={{ y: -5, scale: 1.02 }}
    className="group relative overflow-hidden"
  >
    <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-800/60 transition-all duration-500 hover:border-purple-500/30">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">
              {title}
            </p>
            <p className="text-3xl font-bold text-white tracking-tight">
              {value}
            </p>
            {change && (
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-400 font-medium">
                  +{change}% this month
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg group-hover:shadow-xl transition-all duration-300`}>
            <Icon className="h-8 w-8 text-white" />
          </div>
        </div>
        
        {/* Animated background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
        
        {/* Sparkle effect */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const ServiceCategoryCard = ({ category, index }: any) => {
  const Icon = category.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.1 + index * 0.1, type: "spring", stiffness: 200, damping: 20 }}
      whileHover={{ y: -8, scale: 1.03 }}
      className="group relative overflow-hidden"
    >
      <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-800/60 transition-all duration-500 hover:border-purple-500/30">
        <div className={`h-32 bg-gradient-to-br ${category.color} relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Icon */}
          <div className="absolute top-4 left-4 p-3 rounded-xl bg-white/20 backdrop-blur-sm">
            <Icon className="h-8 w-8 text-white" />
          </div>
          
          {/* Category Info */}
          <div className="absolute bottom-4 left-4">
            <h3 className="text-white font-bold text-xl mb-1">{category.name}</h3>
            <p className="text-white/80 text-sm">{category.services.length} service types</p>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              {category.services.slice(0, 3).map((service: string, idx: number) => (
                <div key={idx} className="flex items-center space-x-2 text-sm text-gray-300">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${category.color}`} />
                  <span>{service}</span>
                </div>
              ))}
              {category.services.length > 3 && (
                <div className="text-xs text-gray-400 pl-4">
                  +{category.services.length - 3} more services
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Button size="sm" variant="outline" className="flex-1 border-gray-600 hover:border-purple-500">
                <Eye className="h-4 w-4 mr-2" />
                View Services
              </Button>
              <Button size="sm" className={`bg-gradient-to-r ${category.color}`}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
        
        {/* Animated background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
      </Card>
    </motion.div>
  );
};

const BookingCard = ({ booking, index }: any) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.1 + index * 0.1 }}
    className="flex items-center justify-between p-4 rounded-xl bg-gray-800/30 hover:bg-gray-700/40 transition-all duration-300 group"
  >
    <div className="flex items-center space-x-4">
      <Avatar className="h-12 w-12 ring-2 ring-purple-500/20 group-hover:ring-purple-400/40 transition-all">
        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-semibold">
          {booking.clientName?.charAt(0) || 'C'}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="text-white font-medium">{booking.clientName}</p>
        <p className="text-sm text-gray-400">{booking.serviceName} • {booking.date}</p>
      </div>
    </div>
    
    <div className="flex items-center space-x-4">
      <div className="text-right">
        <p className="text-white font-bold">${booking.amount}</p>
        <Badge className={`${
          booking.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
          booking.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
          'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
        }`}>
          {booking.status}
        </Badge>
      </div>
      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
        <MoreVertical className="h-4 w-4" />
      </Button>
    </div>
  </motion.div>
);

export default function ServiceProviderDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const { user, logoutMutation } = useAuth();

  const { data: stats } = useQuery<ServiceProviderStats>({
    queryKey: ['/api/service-provider/stats'],
  });

  const { data: services } = useQuery({
    queryKey: ['/api/service-provider/services'],
  });

  const { data: bookings } = useQuery({
    queryKey: ['/api/service-provider/bookings'],
  });

  const renderOverview = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-2"
          >
            Service Provider Dashboard
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Manage your yacht concierge services and client relationships
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-600/30">
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
          <Button variant="outline" size="sm" className="border-gray-600 hover:border-purple-500">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
        </motion.div>
      </div>

      {/* Key Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Services"
          value={stats?.totalServices || '8'}
          change={null}
          icon={Briefcase}
          gradient="from-purple-500 to-pink-500"
          delay={0}
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${(stats?.monthlyRevenue || 12500).toLocaleString()}`}
          change={25}
          icon={DollarSign}
          gradient="from-green-500 to-emerald-500"
          delay={0.1}
        />
        <StatCard
          title="Client Bookings"
          value={stats?.totalBookings || '34'}
          change={18}
          icon={CalendarDays}
          gradient="from-blue-500 to-cyan-500"
          delay={0.2}
        />
        <StatCard
          title="Avg Rating"
          value={`${stats?.avgRating || 4.9}/5`}
          change={3}
          icon={Star}
          gradient="from-yellow-500 to-orange-500"
          delay={0.3}
        />
      </div>

      {/* Service Performance & Recent Bookings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-purple-500" />
              Service Performance
            </CardTitle>
            <CardDescription>Top performing service categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {serviceCategories.slice(0, 4).map((category, index) => {
                const Icon = category.icon;
                return (
                  <div key={category.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-800/30 hover:bg-gray-700/40 transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${category.color}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{category.name}</p>
                        <p className="text-sm text-gray-400">{3 + index} active services</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">${(2 + index).toLocaleString()}k</p>
                      <p className="text-xs text-green-400">+{15 + index * 5}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <CalendarDays className="h-5 w-5 mr-2 text-blue-500" />
              Recent Bookings
            </CardTitle>
            <CardDescription>Latest client service requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { clientName: 'Marina Guest', serviceName: 'Private Chef', date: 'Today 3:00 PM', amount: 450, status: 'confirmed' },
                { clientName: 'Yacht Elite', serviceName: 'Spa Treatment', date: 'Tomorrow 10:00 AM', amount: 320, status: 'pending' },
                { clientName: 'Ocean Luxury', serviceName: 'Photography', date: 'Dec 23, 2:00 PM', amount: 280, status: 'completed' }
              ].map((booking, index) => (
                <BookingCard key={index} booking={booking} index={index} />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderServices = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-2"
          >
            Service Portfolio
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Manage your yacht concierge service offerings across all categories
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-600/30">
            <Plus className="h-4 w-4 mr-2" />
            Create New Service
          </Button>
          <Button variant="outline" size="sm" className="border-gray-600 hover:border-purple-500">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </motion.div>
      </div>

      {/* Service Categories Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {serviceCategories.map((category, index) => (
          <ServiceCategoryCard key={category.id} category={category} index={index} />
        ))}
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="flex">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-80 bg-gray-900/80 backdrop-blur-xl border-r border-gray-700/50 min-h-screen relative overflow-hidden"
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-pink-900/20" />
          
          {/* Logo */}
          <div className="p-8 border-b border-gray-700/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-3"
            >
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Service Provider</h2>
                <p className="text-sm text-gray-400">Concierge Management</p>
              </div>
            </motion.div>
          </div>

          {/* Search */}
          <div className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="px-6 pb-6">
            <div className="space-y-2">
              {sidebarItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                      isActive 
                        ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-white shadow-lg' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Active background gradient */}
                    {isActive && (
                      <motion.div
                        layoutId="activeBackground"
                        className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-10 rounded-xl`}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    
                    <div className={`p-2 rounded-lg ${isActive ? `bg-gradient-to-br ${item.color}` : 'bg-gray-700/50 group-hover:bg-gray-600/50'} transition-all duration-300`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <span className="font-medium">{item.label}</span>
                    
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto"
                      >
                        <Zap className="h-4 w-4 text-purple-400" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </nav>

          {/* User Profile */}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700/50">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12 ring-2 ring-purple-500/30">
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                  SP
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.username || 'Service Provider'}</p>
                <p className="text-xs text-gray-400">Concierge Specialist</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-white"
                onClick={() => logoutMutation.mutate()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <AnimatePresence mode="wait">
            {activeSection === 'overview' && renderOverview()}
            {activeSection === 'services' && renderServices()}
            {activeSection === 'bookings' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="text-center py-20">
                  <CalendarDays className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Booking Management</h2>
                  <p className="text-gray-400">Manage client bookings and service schedules</p>
                </div>
              </motion.div>
            )}
            {activeSection === 'revenue' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="text-center py-20">
                  <DollarSign className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Revenue Analytics</h2>
                  <p className="text-gray-400">Track earnings and optimize service pricing</p>
                </div>
              </motion.div>
            )}
            {activeSection === 'clients' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="text-center py-20">
                  <Users className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Client Management</h2>
                  <p className="text-gray-400">Build relationships and manage client preferences</p>
                </div>
              </motion.div>
            )}
            {activeSection === 'analytics' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="text-center py-20">
                  <TrendingUp className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Performance Analytics</h2>
                  <p className="text-gray-400">Deep insights into service performance and growth opportunities</p>
                </div>
              </motion.div>
            )}
            {activeSection === 'profile' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="text-center py-20">
                  <Crown className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Provider Profile</h2>
                  <p className="text-gray-400">Manage your professional profile and certifications</p>
                </div>
              </motion.div>
            )}
            {activeSection === 'settings' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="text-center py-20">
                  <Settings className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Account Settings</h2>
                  <p className="text-gray-400">Configure availability, notifications, and account preferences</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}