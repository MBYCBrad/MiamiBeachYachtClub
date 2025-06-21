import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Users, 
  Star, 
  Heart,
  Globe,
  Menu,
  User,
  TrendingUp,
  DollarSign,
  Activity,
  Shield,
  BarChart3,
  Calendar,
  Settings,
  AlertTriangle,
  CheckCircle,
  Eye,
  Filter
} from 'lucide-react';
import type { User as UserType, Yacht, Service, Event } from '@shared/schema';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');

  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/analytics/overview'],
  });

  const { data: users = [] } = useQuery<UserType[]>({
    queryKey: ['/api/users'],
  });

  const { data: yachts = [] } = useQuery<Yacht[]>({
    queryKey: ['/api/yachts'],
  });

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ['/api/services'],
  });

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['/api/audit/logs'],
  });

  const { data: securityEvents = [] } = useQuery({
    queryKey: ['/api/audit/security-events'],
  });

  if (analyticsLoading) {
    return <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Airbnb-style Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-red-500 text-2xl font-bold flex items-center">
                <span className="text-3xl mr-2">🏖️</span>
                Monaco Bay Admin
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => setSelectedTab('overview')}
                className={`font-medium pb-4 ${selectedTab === 'overview' ? 'text-gray-900 border-b-2 border-red-500' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setSelectedTab('users')}
                className={`font-medium pb-4 ${selectedTab === 'users' ? 'text-gray-900 border-b-2 border-red-500' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Users
              </button>
              <button 
                onClick={() => setSelectedTab('analytics')}
                className={`font-medium pb-4 ${selectedTab === 'analytics' ? 'text-gray-900 border-b-2 border-red-500' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Analytics
              </button>
              <button 
                onClick={() => setSelectedTab('security')}
                className={`font-medium flex items-center pb-4 ${selectedTab === 'security' ? 'text-gray-900 border-b-2 border-red-500' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded mr-2">NEW</span>
                Security
              </button>
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Admin
              </Badge>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Globe className="w-4 h-4" />
              </button>
              <div className="flex items-center border border-gray-300 rounded-full py-2 px-4 hover:shadow-md transition-shadow">
                <Menu className="w-4 h-4 mr-3" />
                <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <div className="bg-white border border-gray-300 rounded-full shadow-lg p-2 max-w-2xl mx-auto">
            <div className="flex items-center">
              <div className="flex-1 px-6 py-3">
                <div className="text-xs font-semibold text-gray-900 mb-1">Search</div>
                <input
                  type="text"
                  placeholder="Search users, yachts, bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-sm text-gray-600 placeholder-gray-400 border-none outline-none bg-transparent"
                />
              </div>
              <button className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full ml-2">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedTab === 'overview' && (
          <>
            {/* Analytics Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${analytics?.totalRevenue || '0'}</div>
                  <p className="text-xs text-gray-600">
                    +20.1% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.totalUsers || 0}</div>
                  <p className="text-xs text-gray-600">
                    +12 new this week
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.totalBookings || 0}</div>
                  <p className="text-xs text-gray-600">
                    +{analytics?.recentBookings || 0} this month
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.occupancyRate || '0'}%</div>
                  <p className="text-xs text-gray-600">
                    Yacht utilization rate
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Top Performing Yachts */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Top Performing Yachts
                </h2>
                <button className="text-gray-600 hover:text-gray-900 font-medium">
                  View all →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {analytics?.topYachts?.slice(0, 3).map((yacht: any, index: number) => (
                  <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="relative">
                      <img
                        src="https://images.unsplash.com/photo-1540946485063-a40da27545f8?auto=format&fit=crop&w=800&q=80"
                        alt={yacht.yachtName}
                        className="w-full h-48 object-cover rounded-t-xl"
                      />
                      <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                        #{index + 1} Top Performer
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{yacht.yachtName}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{yacht.bookingCount} bookings</span>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm font-medium">4.9</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Recent Activity */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {auditLogs.slice(0, 5).map((log: any, index: number) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-2 h-2 rounded-full ${log.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {log.action} on {log.resource}
                          </p>
                          <p className="text-xs text-gray-600">
                            User ID: {log.userId} • {new Date(log.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={log.success ? "secondary" : "destructive"}>
                          {log.success ? 'Success' : 'Failed'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          </>
        )}

        {selectedTab === 'users' && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">User Management</h2>
              <Button className="bg-red-500 hover:bg-red-600 text-white">
                Add New User
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {users.map((member) => (
                <Card key={member.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{member.username}</h3>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Role:</span>
                        <Badge variant="secondary">{member.role}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Tier:</span>
                        <Badge variant="outline">{member.membershipTier}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                    </div>

                    <div className="mt-4 flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Settings className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {selectedTab === 'analytics' && (
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Advanced Analytics</h2>
            
            {/* Membership Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Membership Tier Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics?.membershipDistribution && Object.entries(analytics.membershipDistribution).map(([tier, count]) => (
                      <div key={tier} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{tier}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full" 
                              style={{ width: `${((count as number) / analytics.totalUsers) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{count as number}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">Service Revenue</span>
                      <span className="text-lg font-semibold text-green-600">${analytics?.serviceRevenue || '0'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">Event Revenue</span>
                      <span className="text-lg font-semibold text-blue-600">${analytics?.eventRevenue || '0'}</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900">Total Revenue</span>
                        <span className="text-xl font-bold text-gray-900">${analytics?.totalRevenue || '0'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{analytics?.averageBookingValue || '0'}</div>
                    <div className="text-sm text-gray-600">Average Booking Value</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{analytics?.occupancyRate || '0'}%</div>
                    <div className="text-sm text-gray-600">Yacht Occupancy Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{analytics?.recentBookings || 0}</div>
                    <div className="text-sm text-gray-600">Bookings This Month</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {selectedTab === 'security' && (
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Security & Compliance</h2>
            
            {/* Security Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Security Events</CardTitle>
                  <Shield className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{securityEvents.length}</div>
                  <p className="text-xs text-gray-600">
                    Last 30 days
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Audit Logs</CardTitle>
                  <Activity className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{auditLogs.length}</div>
                  <p className="text-xs text-gray-600">
                    Total recorded actions
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Health</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">100%</div>
                  <p className="text-xs text-gray-600">
                    All systems operational
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Security Events */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Recent Security Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityEvents.slice(0, 10).map((event: any, index: number) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-red-50 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {event.action} - {event.resource}
                        </p>
                        <p className="text-xs text-gray-600">
                          User ID: {event.userId} • {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={event.success ? "secondary" : "destructive"}>
                        {event.success ? 'Resolved' : 'Critical'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </main>
    </div>
  );
}