import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  TrendingUp, 
  BarChart3,
  PieChart,
  Activity,
  Users,
  Calendar,
  DollarSign,
  Phone,
  MessageSquare,
  Anchor,
  Sparkles,
  CalendarDays,
  Clock,
  Star,
  Target,
  Award,
  Zap
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalMembers: number;
    activeBookings: number;
    monthlyRevenue: number;
    satisfaction: number;
  };
  bookings: {
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
    byMonth: Array<{ month: string; count: number }>;
  };
  services: {
    total: number;
    active: number;
    totalBookings: number;
    revenue: number;
    byCategory: Array<{ category: string; count: number; revenue: number }>;
  };
  events: {
    total: number;
    active: number;
    registrations: number;
    revenue: number;
    upcoming: Array<{ title: string; date: string; registered: number }>;
  };
  performance: {
    responseTime: number;
    resolutionTime: number;
    customerSatisfaction: number;
    callsHandled: number;
    staffEfficiency: number;
  };
}

const StaffAnalyticsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics/staff', selectedPeriod],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/analytics/staff?period=${selectedPeriod}`);
      return response.json();
    },
  });

  // Mock data for demonstration
  const mockAnalytics: AnalyticsData = {
    overview: {
      totalMembers: 847,
      activeBookings: 23,
      monthlyRevenue: 156780,
      satisfaction: 4.8
    },
    bookings: {
      total: 156,
      confirmed: 134,
      pending: 15,
      cancelled: 7,
      byMonth: [
        { month: 'Jan', count: 12 },
        { month: 'Feb', count: 18 },
        { month: 'Mar', count: 25 },
        { month: 'Apr', count: 32 },
        { month: 'May', count: 28 },
        { month: 'Jun', count: 41 }
      ]
    },
    services: {
      total: 42,
      active: 38,
      totalBookings: 89,
      revenue: 45600,
      byCategory: [
        { category: 'Culinary', count: 25, revenue: 15200 },
        { category: 'Wellness & Spa', count: 18, revenue: 12800 },
        { category: 'Entertainment', count: 15, revenue: 8900 },
        { category: 'Water Sports', count: 12, revenue: 4800 },
        { category: 'Photography', count: 8, revenue: 2400 },
        { category: 'Concierge', count: 11, revenue: 1500 }
      ]
    },
    events: {
      total: 18,
      active: 12,
      registrations: 234,
      revenue: 28900,
      upcoming: [
        { title: 'Sunset Cruise Gala', date: '2025-07-15', registered: 45 },
        { title: 'Wine Tasting Event', date: '2025-07-22', registered: 32 },
        { title: 'Summer Regatta', date: '2025-08-05', registered: 67 }
      ]
    },
    performance: {
      responseTime: 2.3,
      resolutionTime: 15.7,
      customerSatisfaction: 4.6,
      callsHandled: 156,
      staffEfficiency: 92
    }
  };

  const data = analytics || mockAnalytics;

  const StatCard = ({ title, value, change, icon: Icon, gradient, format = 'number' }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group relative overflow-hidden"
    >
      <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/60 transition-all duration-500 hover:border-purple-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">{title}</p>
              <p className="text-3xl font-bold text-white mt-2">
                {format === 'currency' ? `$${value.toLocaleString()}` :
                 format === 'percentage' ? `${value}%` :
                 format === 'rating' ? `${value}/5` :
                 format === 'time' ? `${value}min` :
                 value.toLocaleString()}
              </p>
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
        
        <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
      </Card>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
          >
            Staff Analytics
          </motion.h1>
          <motion.p 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 mt-2"
          >
            Performance insights and operational metrics
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex space-x-2"
        >
          {['week', 'month', 'quarter', 'year'].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className={selectedPeriod === period 
                ? "bg-gradient-to-r from-purple-600 to-blue-600 border-0" 
                : "border-gray-600 hover:border-purple-500"
              }
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Button>
          ))}
        </motion.div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Members"
          value={data.overview.totalMembers}
          change={12}
          icon={Users}
          gradient="from-purple-500 to-blue-500"
        />
        <StatCard
          title="Active Bookings"
          value={data.overview.activeBookings}
          change={8}
          icon={Calendar}
          gradient="from-green-500 to-emerald-500"
        />
        <StatCard
          title="Monthly Revenue"
          value={data.overview.monthlyRevenue}
          change={15}
          icon={DollarSign}
          gradient="from-blue-500 to-cyan-500"
          format="currency"
        />
        <StatCard
          title="Satisfaction"
          value={data.overview.satisfaction}
          change={5}
          icon={Star}
          gradient="from-yellow-500 to-orange-500"
          format="rating"
        />
      </div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Activity className="h-5 w-5 mr-2 text-purple-400" />
              Staff Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">{data.performance.responseTime}min</h3>
                <p className="text-gray-400 text-sm">Avg Response Time</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">{data.performance.resolutionTime}min</h3>
                <p className="text-gray-400 text-sm">Avg Resolution Time</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">{data.performance.customerSatisfaction}/5</h3>
                <p className="text-gray-400 text-sm">Customer Satisfaction</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <Phone className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">{data.performance.callsHandled}</h3>
                <p className="text-gray-400 text-sm">Calls Handled</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">{data.performance.staffEfficiency}%</h3>
                <p className="text-gray-400 text-sm">Staff Efficiency</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings Analytics */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-400" />
                Booking Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gray-800/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Confirmed</p>
                      <p className="text-2xl font-bold text-green-400">{data.bookings.confirmed}</p>
                    </div>
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-green-400" />
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-gray-800/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Pending</p>
                      <p className="text-2xl font-bold text-yellow-400">{data.bookings.pending}</p>
                    </div>
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-yellow-400" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-gray-800/30">
                <h4 className="text-white font-medium mb-3">Monthly Trend</h4>
                <div className="space-y-2">
                  {data.bookings.byMonth.slice(-3).map((month, index) => (
                    <div key={month.month} className="flex items-center justify-between">
                      <span className="text-gray-400">{month.month}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                            style={{ width: `${(month.count / 50) * 100}%` }}
                          />
                        </div>
                        <span className="text-white font-medium w-8">{month.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Services Analytics */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-purple-400" />
                Services Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gray-800/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Revenue</p>
                      <p className="text-2xl font-bold text-green-400">${data.services.revenue.toLocaleString()}</p>
                    </div>
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-green-400" />
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-gray-800/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Active Services</p>
                      <p className="text-2xl font-bold text-blue-400">{data.services.active}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Activity className="h-5 w-5 text-blue-400" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-gray-800/30">
                <h4 className="text-white font-medium mb-3">Top Categories</h4>
                <div className="space-y-2">
                  {data.services.byCategory.slice(0, 3).map((category, index) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <span className="text-gray-400">{category.category}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                            style={{ width: `${(category.revenue / 20000) * 100}%` }}
                          />
                        </div>
                        <span className="text-white font-medium w-12 text-xs">${category.revenue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Upcoming Events */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <CalendarDays className="h-5 w-5 mr-2 text-orange-400" />
              Upcoming Events & Registrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.events.upcoming.map((event, index) => (
                <motion.div
                  key={event.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="p-4 rounded-xl bg-gray-800/30 hover:bg-gray-700/40 transition-all duration-300"
                >
                  <h4 className="text-white font-medium mb-2">{event.title}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-400">
                      <Clock className="h-4 w-4 mr-2" />
                      {event.date}
                    </div>
                    <div className="flex items-center text-gray-400">
                      <Users className="h-4 w-4 mr-2" />
                      {event.registered} registered
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default StaffAnalyticsPage;