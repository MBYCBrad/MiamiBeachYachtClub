import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart3, 
  Anchor, 
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
  Wrench,
  Camera,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface YachtOwnerStats {
  totalYachts: number;
  totalBookings: number;
  monthlyRevenue: number;
  avgRating: number;
  occupancyRate: number;
  pendingMaintenance: number;
}

const sidebarItems = [
  { id: 'overview', label: 'Overview', icon: BarChart3, color: 'from-blue-500 to-cyan-500' },
  { id: 'fleet', label: 'My Fleet', icon: Anchor, color: 'from-emerald-500 to-teal-500' },
  { id: 'bookings', label: 'Bookings', icon: CalendarDays, color: 'from-purple-500 to-pink-500' },
  { id: 'revenue', label: 'Revenue', icon: DollarSign, color: 'from-green-500 to-emerald-500' },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench, color: 'from-orange-500 to-red-500' },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'from-violet-500 to-indigo-500' },
  { id: 'gallery', label: 'Gallery', icon: Camera, color: 'from-pink-500 to-rose-500' },
  { id: 'settings', label: 'Settings', icon: Settings, color: 'from-gray-500 to-slate-500' }
];

const StatCard = ({ title, value, change, icon: Icon, gradient, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
    whileHover={{ y: -5, scale: 1.02 }}
    className="group relative overflow-hidden"
  >
    <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-800/60 transition-all duration-500 hover:border-emerald-500/30">
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
          <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const YachtCard = ({ yacht, index }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay: 0.1 + index * 0.1, type: "spring", stiffness: 200, damping: 20 }}
    whileHover={{ y: -8, scale: 1.03 }}
    className="group relative overflow-hidden"
  >
    <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-800/60 transition-all duration-500 hover:border-emerald-500/30">
      <div className="aspect-video bg-gradient-to-br from-emerald-500/20 to-teal-500/20 relative overflow-hidden">
        {yacht.imageUrl && (
          <img 
            src={`/api/media/${yacht.imageUrl}`} 
            alt={yacht.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <Badge className={`${yacht.isAvailable === false ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>
            {yacht.isAvailable === false ? 'Maintenance' : 'Available'}
          </Badge>
        </div>
        
        {/* Rating */}
        <div className="absolute top-4 left-4 flex items-center space-x-1 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="text-white text-sm font-medium">4.8</span>
        </div>
        
        {/* Yacht Info */}
        <div className="absolute bottom-4 left-4">
          <h3 className="text-white font-bold text-xl mb-1">{yacht.name}</h3>
          <div className="flex items-center space-x-4 text-emerald-300 text-sm">
            <span>{yacht.size}ft</span>
            <span>•</span>
            <span>{yacht.capacity} guests</span>
            <span>•</span>
            <span>{yacht.location}</span>
          </div>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-400 text-sm">Monthly Revenue</span>
              <p className="text-white font-bold text-lg">${(yacht.pricePerHour ? parseInt(yacht.pricePerHour) * 120 : 15000).toLocaleString()}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Bookings</span>
              <p className="text-emerald-400 font-bold text-lg">{12 + index * 3}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline" className="flex-1 border-gray-600 hover:border-emerald-500">
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600">
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" className="border-gray-600 hover:border-purple-500">
              <CalendarDays className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
      
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
    </Card>
  </motion.div>
);

export default function YachtOwnerDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: stats } = useQuery<YachtOwnerStats>({
    queryKey: ['/api/yacht-owner/stats'],
  });

  const { data: yachts } = useQuery({
    queryKey: ['/api/yacht-owner/yachts'],
  });

  const { data: bookings } = useQuery({
    queryKey: ['/api/yacht-owner/bookings'],
  });

  const { data: revenue } = useQuery({
    queryKey: ['/api/yacht-owner/revenue'],
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
            Yacht Owner Dashboard
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Manage your yacht portfolio and optimize revenue
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          <Button size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-lg hover:shadow-emerald-600/30">
            <Plus className="h-4 w-4 mr-2" />
            Add Yacht
          </Button>
          <Button variant="outline" size="sm" className="border-gray-600 hover:border-emerald-500">
            <Bell className="h-4 w-4 mr-2" />
            Alerts
          </Button>
        </motion.div>
      </div>

      {/* Key Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Fleet"
          value={stats?.totalYachts || '3'}
          change={null}
          icon={Anchor}
          gradient="from-emerald-500 to-teal-500"
          delay={0}
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${(stats?.monthlyRevenue || 45000).toLocaleString()}`}
          change={18}
          icon={DollarSign}
          gradient="from-green-500 to-emerald-500"
          delay={0.1}
        />
        <StatCard
          title="Active Bookings"
          value={stats?.totalBookings || '27'}
          change={23}
          icon={CalendarDays}
          gradient="from-purple-500 to-pink-500"
          delay={0.2}
        />
        <StatCard
          title="Avg Rating"
          value={`${stats?.avgRating || 4.8}/5`}
          change={5}
          icon={Star}
          gradient="from-yellow-500 to-orange-500"
          delay={0.3}
        />
      </div>

      {/* Fleet Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-emerald-500" />
              Fleet Performance
            </CardTitle>
            <CardDescription>Revenue and occupancy trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["Marina Breeze", "Ocean Dreams", "Sunset Voyager"].map((yacht, index) => (
                <div key={yacht} className="flex items-center justify-between p-4 rounded-xl bg-gray-800/30 hover:bg-gray-700/40 transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
                      <Anchor className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{yacht}</p>
                      <p className="text-sm text-gray-400">{85 + index * 5}% occupancy</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">${(15 + index * 5).toLocaleString()}k</p>
                    <p className="text-xs text-green-400">+{12 + index * 3}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <CalendarDays className="h-5 w-5 mr-2 text-purple-500" />
              Recent Bookings
            </CardTitle>
            <CardDescription>Latest reservations and guest activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1,2,3].map((booking, index) => (
                <motion.div
                  key={booking}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-800/30 hover:bg-gray-700/40 transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10 ring-2 ring-emerald-500/20">
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-semibold">
                        M{booking}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white font-medium">Member {booking}</p>
                      <p className="text-sm text-gray-400">Marina Breeze • 3 days</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">${1200 + booking * 300}</p>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Confirmed
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderFleet = () => (
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
            My Yacht Fleet
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Manage your yachts, bookings, and maintenance schedules
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          <Button size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-lg hover:shadow-emerald-600/30">
            <Plus className="h-4 w-4 mr-2" />
            Add New Yacht
          </Button>
          <Button variant="outline" size="sm" className="border-gray-600 hover:border-emerald-500">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </motion.div>
      </div>

      {/* Fleet Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Yachts"
          value="3"
          change={null}
          icon={Anchor}
          gradient="from-emerald-500 to-teal-500"
          delay={0}
        />
        <StatCard
          title="Available Now"
          value="2"
          change={null}
          icon={Activity}
          gradient="from-green-500 to-emerald-500"
          delay={0.1}
        />
        <StatCard
          title="In Maintenance"
          value="1"
          change={null}
          icon={Wrench}
          gradient="from-orange-500 to-red-500"
          delay={0.2}
        />
        <StatCard
          title="Avg Occupancy"
          value="87%"
          change={12}
          icon={TrendingUp}
          gradient="from-purple-500 to-pink-500"
          delay={0.3}
        />
      </div>

      {/* Yacht Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {(yachts as any[])?.map((yacht: any, index: number) => (
          <YachtCard key={yacht.id} yacht={yacht} index={index} />
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
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 via-transparent to-teal-900/20" />
          
          {/* Logo */}
          <div className="p-8 border-b border-gray-700/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-3"
            >
              <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 shadow-lg">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Yacht Owner</h2>
                <p className="text-sm text-gray-400">Fleet Management</p>
              </div>
            </motion.div>
          </div>

          {/* Search */}
          <div className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search fleet features..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500"
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
                        ? 'bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 text-white shadow-lg' 
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
                        <Zap className="h-4 w-4 text-emerald-400" />
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
              <Avatar className="h-12 w-12 ring-2 ring-emerald-500/30">
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-semibold">
                  YO
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Yacht Owner</p>
                <p className="text-xs text-gray-400">Fleet Manager</p>
              </div>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <AnimatePresence mode="wait">
            {activeSection === 'overview' && renderOverview()}
            {activeSection === 'fleet' && renderFleet()}
            {activeSection === 'bookings' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="text-center py-20">
                  <CalendarDays className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Booking Management</h2>
                  <p className="text-gray-400">Manage yacht reservations and guest communications</p>
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
                  <p className="text-gray-400">Track earnings, pricing optimization, and financial reports</p>
                </div>
              </motion.div>
            )}
            {activeSection === 'maintenance' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="text-center py-20">
                  <Wrench className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Maintenance Hub</h2>
                  <p className="text-gray-400">Schedule service, track repairs, and manage yacht upkeep</p>
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
                  <p className="text-gray-400">Deep insights into fleet performance and optimization opportunities</p>
                </div>
              </motion.div>
            )}
            {activeSection === 'gallery' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="text-center py-20">
                  <Camera className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Yacht Gallery</h2>
                  <p className="text-gray-400">Manage yacht photos, virtual tours, and marketing content</p>
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
                  <h2 className="text-2xl font-bold text-white mb-2">Fleet Settings</h2>
                  <p className="text-gray-400">Configure yacht availability, pricing, and booking policies</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}