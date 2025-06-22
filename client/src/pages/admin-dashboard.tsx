import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart3, 
  Users, 
  Anchor, 
  CalendarDays, 
  CreditCard, 
  Settings, 
  Shield,
  TrendingUp,
  UserCheck,
  Wallet,
  Activity,
  Bell,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  Sparkles,
  Crown,
  Zap,
  Calendar,
  Star,
  DollarSign,
  Clock,
  MapPin,
  Eye,
  Edit,
  Database,
  Save,
  RotateCcw,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

interface AdminStats {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  activeServices: number;
  monthlyGrowth: number;
  membershipBreakdown: Array<{
    tier: string;
    count: number;
    percentage: number;
  }>;
}

const sidebarItems = [
  { id: 'overview', label: 'Overview', icon: BarChart3, color: 'from-purple-500 to-blue-500' },
  { id: 'users', label: 'Users', icon: Users, color: 'from-green-500 to-emerald-500' },
  { id: 'yachts', label: 'Fleet', icon: Anchor, color: 'from-blue-500 to-cyan-500' },
  { id: 'services', label: 'Services', icon: Sparkles, color: 'from-orange-500 to-red-500' },
  { id: 'events', label: 'Events', icon: CalendarDays, color: 'from-violet-500 to-purple-500' },
  { id: 'payments', label: 'Payments', icon: CreditCard, color: 'from-green-500 to-teal-500' },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'from-pink-500 to-rose-500' },
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
    <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-800/60 transition-all duration-500 hover:border-purple-500/30">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-white mt-2">{value}</p>
            {change !== null && (
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                <span className="text-green-400 text-sm">+{change}%</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
      
      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
    </Card>
  </motion.div>
);

const ActivityCard = ({ activity, index }: any) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.6 + index * 0.1 }}
    className="flex items-center space-x-4 p-4 rounded-xl bg-gray-800/30 hover:bg-gray-700/40 transition-all duration-300 group"
  >
    <div className={`p-2 rounded-lg bg-gradient-to-br ${activity.color} group-hover:scale-110 transition-transform`}>
      <activity.icon className="h-4 w-4 text-white" />
    </div>
    <div className="flex-1">
      <p className="text-white font-medium">{activity.title}</p>
      <p className="text-sm text-gray-400">{activity.description}</p>
    </div>
    <span className="text-xs text-gray-500">{activity.time}</span>
  </motion.div>
);

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const { user, logoutMutation } = useAuth();

  const { data: stats } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
  });

  const { data: users } = useQuery({
    queryKey: ['/api/admin/users'],
  });

  const { data: yachts } = useQuery({
    queryKey: ['/api/admin/yachts'],
  });

  const { data: services } = useQuery({
    queryKey: ['/api/admin/services'],
  });

  const { data: events } = useQuery({
    queryKey: ['/api/admin/events'],
  });

  const { data: payments } = useQuery({
    queryKey: ['/api/admin/payments'],
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
            Admin Overview
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Monaco Bay Yacht Club Management Dashboard
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-purple-600/30">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
          <Button variant="outline" size="sm" className="border-gray-600 hover:border-purple-500">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Members"
          value={stats?.totalUsers || '0'}
          change={stats?.monthlyGrowth || 0}
          icon={Users}
          gradient="from-purple-500 to-pink-500"
          delay={0}
        />
        <StatCard
          title="Active Bookings"
          value={stats?.totalBookings || '0'}
          change={15}
          icon={Anchor}
          gradient="from-blue-500 to-cyan-500"
          delay={0.1}
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${(stats?.totalRevenue || 0).toLocaleString()}`}
          change={23}
          icon={CreditCard}
          gradient="from-green-500 to-emerald-500"
          delay={0.2}
        />
        <StatCard
          title="Active Services"
          value={stats?.activeServices || '0'}
          change={8}
          icon={Sparkles}
          gradient="from-orange-500 to-red-500"
          delay={0.3}
        />
      </div>

      {/* Membership Tiers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Crown className="h-5 w-5 mr-2 text-yellow-500" />
              Membership Distribution
            </CardTitle>
            <CardDescription>Current membership tier breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats?.membershipBreakdown?.map((tier, index) => (
                <motion.div
                  key={tier.tier}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="text-center p-4 rounded-xl bg-gray-800/30 hover:bg-gray-700/40 transition-all duration-300 group cursor-pointer"
                >
                  <div className={`text-2xl font-bold mb-2 ${
                    tier.tier === 'Platinum' ? 'text-purple-400' :
                    tier.tier === 'Gold' ? 'text-yellow-400' :
                    tier.tier === 'Silver' ? 'text-gray-300' : 'text-orange-400'
                  }`}>
                    {tier.count}
                  </div>
                  <div className="text-sm text-gray-400 mb-1">{tier.tier}</div>
                  <div className="text-xs text-gray-500">{tier.percentage}%</div>
                </motion.div>
              )) || [
                { tier: 'Platinum', count: 8, percentage: 15 },
                { tier: 'Gold', count: 12, percentage: 23 },
                { tier: 'Silver', count: 18, percentage: 35 },
                { tier: 'Bronze', count: 14, percentage: 27 }
              ].map((tier, index) => (
                <motion.div
                  key={tier.tier}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="text-center p-4 rounded-xl bg-gray-800/30 hover:bg-gray-700/40 transition-all duration-300 group cursor-pointer"
                >
                  <div className={`text-2xl font-bold mb-2 ${
                    tier.tier === 'Platinum' ? 'text-purple-400' :
                    tier.tier === 'Gold' ? 'text-yellow-400' :
                    tier.tier === 'Silver' ? 'text-gray-300' : 'text-orange-400'
                  }`}>
                    {tier.count}
                  </div>
                  <div className="text-sm text-gray-400 mb-1">{tier.tier}</div>
                  <div className="text-xs text-gray-500">{tier.percentage}%</div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Activity className="h-5 w-5 mr-2 text-purple-500" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest system events and user actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { icon: Users, title: 'New member registered', description: 'Gold tier membership - Marina Elite', time: '2 min ago', color: 'from-green-500 to-emerald-500' },
                { icon: Anchor, title: 'Yacht booking confirmed', description: 'Ocean Paradise booked for Dec 25-27', time: '15 min ago', color: 'from-blue-500 to-cyan-500' },
                { icon: CreditCard, title: 'Payment processed', description: '$2,850 yacht charter payment', time: '32 min ago', color: 'from-green-500 to-teal-500' },
                { icon: Sparkles, title: 'Service booking', description: 'Executive Chef service requested', time: '1 hour ago', color: 'from-orange-500 to-red-500' },
                { icon: CalendarDays, title: 'Event registration', description: 'New Year Gala - 3 new attendees', time: '2 hours ago', color: 'from-violet-500 to-purple-500' }
              ].map((activity, index) => (
                <ActivityCard key={index} activity={activity} index={index} />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderAnalytics = () => (
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
            Advanced Analytics
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Deep insights into club performance and optimization opportunities
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
          <Button variant="outline" size="sm" className="border-gray-600 hover:border-purple-500">
            <Filter className="h-4 w-4 mr-2" />
            Time Period
          </Button>
        </motion.div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Revenue Growth"
          value="+28%"
          change={28}
          icon={TrendingUp}
          gradient="from-green-500 to-emerald-500"
          delay={0}
        />
        <StatCard
          title="Member Satisfaction"
          value="4.8/5"
          change={12}
          icon={Star}
          gradient="from-yellow-500 to-orange-500"
          delay={0.1}
        />
        <StatCard
          title="Fleet Utilization"
          value="82%"
          change={15}
          icon={Activity}
          gradient="from-blue-500 to-cyan-500"
          delay={0.2}
        />
        <StatCard
          title="Conversion Rate"
          value="67%"
          change={8}
          icon={Users}
          gradient="from-purple-500 to-pink-500"
          delay={0.3}
        />
      </div>

      {/* Analytics Dashboard */}
      <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-purple-500" />
            Performance Analytics
          </CardTitle>
          <CardDescription>Comprehensive club performance metrics and insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-20">
            <BarChart3 className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Advanced Analytics Dashboard</h3>
            <p className="text-gray-400">Real-time analytics with AI-powered insights and recommendations</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderSettings = () => (
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
            System Settings
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Configure system preferences and operational parameters
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
          <Button variant="outline" size="sm" className="border-gray-600 hover:border-purple-500">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </motion.div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Shield className="h-5 w-5 mr-2 text-purple-500" />
              Security Settings
            </CardTitle>
            <CardDescription>Authentication and access control</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-800/30">
              <div>
                <p className="text-white font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-gray-400">Enhanced security for admin access</p>
              </div>
              <div className="w-12 h-6 bg-purple-500 rounded-full p-1">
                <div className="w-4 h-4 bg-white rounded-full ml-auto" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-800/30">
              <div>
                <p className="text-white font-medium">Session Timeout</p>
                <p className="text-sm text-gray-400">Auto-logout after inactivity</p>
              </div>
              <select className="bg-gray-700 text-white rounded-lg px-3 py-1 border border-gray-600">
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>2 hours</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Database className="h-5 w-5 mr-2 text-purple-500" />
              System Management
            </CardTitle>
            <CardDescription>Backup and maintenance settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-gray-800/30">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white font-medium">Database Backup</p>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
              </div>
              <p className="text-sm text-gray-400 mb-2">Last backup: 2 hours ago</p>
              <Button size="sm" variant="outline" className="border-gray-600 hover:border-purple-500">
                Create Backup Now
              </Button>
            </div>
            <div className="p-4 rounded-xl bg-gray-800/30">
              <p className="text-white font-medium mb-2">Maintenance Mode</p>
              <p className="text-sm text-gray-400 mb-3">Temporarily disable user access</p>
              <Button size="sm" variant="destructive" className="bg-red-600 hover:bg-red-700">
                Enable Maintenance Mode
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="flex h-screen">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 30 }}
          className="w-80 bg-gray-900/50 backdrop-blur-xl border-r border-gray-700/50 flex flex-col relative"
        >
          {/* Logo */}
          <div className="p-6 border-b border-gray-700/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-3"
            >
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Admin Panel</h2>
                <p className="text-sm text-gray-400">Monaco Bay YC</p>
              </div>
            </motion.div>
          </div>

          {/* Search */}
          <div className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
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
                        ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 text-white shadow-lg' 
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
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-semibold">
                  A
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Admin User</p>
                <p className="text-xs text-gray-400">System Administrator</p>
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
            {activeSection === 'analytics' && renderAnalytics()}
            {activeSection === 'settings' && renderSettings()}
            {(activeSection === 'users' || activeSection === 'yachts' || activeSection === 'services' || activeSection === 'events' || activeSection === 'payments') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🚧</div>
                  <h2 className="text-2xl font-bold text-white mb-2">Coming Soon</h2>
                  <p className="text-gray-400">This section is under development</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}