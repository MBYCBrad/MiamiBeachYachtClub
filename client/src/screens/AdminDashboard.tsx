import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import YachtCard from '@/components/yacht-card';
import { 
  Shield, 
  Users, 
  Anchor, 
  Star, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  BarChart3, 
  PieChart,
  UserPlus,
  UserMinus,
  Settings,
  Eye,
  Edit,
  Trash2,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  CreditCard,
  Activity
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertUserSchema, insertYachtSchema, insertServiceSchema, insertEventSchema, UserRole, MembershipTier, type User, type Yacht, type Service, type Event, type Booking } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { z } from 'zod';

interface AdminStats {
  totalUsers: number;
  totalYachts: number;
  totalServices: number;
  totalEvents: number;
  totalBookings: number;
  totalRevenue: number;
  monthlyGrowth: {
    users: number;
    bookings: number;
    revenue: number;
  };
  topYachts: Array<{ yacht: Yacht; bookings: number; revenue: number }>;
  topServices: Array<{ service: Service; bookings: number; revenue: number }>;
  membershipDistribution: Record<keyof typeof MembershipTier, number>;
  recentActivity: Array<{
    id: string;
    type: 'booking' | 'registration' | 'payment' | 'cancellation';
    description: string;
    timestamp: Date;
    amount?: number;
  }>;
}

interface PaymentTransaction {
  id: string;
  type: 'service' | 'event';
  amount: number;
  status: 'succeeded' | 'pending' | 'failed';
  userId: number;
  memberName: string;
  description: string;
  timestamp: Date;
  stripePaymentId: string;
}

const AdminDashboard: React.FC = () => {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);

  // Fetch admin statistics
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
    enabled: !!user
  });

  // Fetch all users for management
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    enabled: !!user
  });

  // Fetch all yachts for fleet management
  const { data: yachts = [] } = useQuery<Yacht[]>({
    queryKey: ['/api/admin/yachts'],
    enabled: !!user
  });

  // Fetch all services for marketplace management
  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ['/api/admin/services'],
    enabled: !!user
  });

  // Fetch all events for event management
  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ['/api/admin/events'],
    enabled: !!user
  });

  // Fetch payment transactions
  const { data: transactions = [] } = useQuery<PaymentTransaction[]>({
    queryKey: ['/api/admin/payments'],
    enabled: !!user
  });

  const userForm = useForm<z.infer<typeof insertUserSchema>>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      role: UserRole.MEMBER,
      membershipTier: MembershipTier.BRONZE
    }
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertUserSchema>) => {
      const response = await apiRequest('POST', '/api/admin/users', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      setIsCreateUserOpen(false);
      userForm.reset();
      toast({
        title: "User Created",
        description: "New user has been successfully created."
      });
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: Partial<z.infer<typeof insertUserSchema>> & { id: number }) => {
      const response = await apiRequest('PUT', `/api/admin/users/${data.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setIsEditUserOpen(false);
      setSelectedUser(null);
      toast({
        title: "User Updated",
        description: "User information has been updated."
      });
    }
  });

  // Suspend/Activate user mutation
  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ userId, action }: { userId: number; action: 'suspend' | 'activate' }) => {
      const response = await apiRequest('PUT', `/api/admin/users/${userId}/${action}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "User Status Updated",
        description: "User status has been changed successfully."
      });
    }
  });

  // Delete entity mutations
  const deleteYachtMutation = useMutation({
    mutationFn: async (yachtId: number) => {
      const response = await apiRequest('DELETE', `/api/admin/yachts/${yachtId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/yachts'] });
      toast({ title: "Yacht Removed", description: "Yacht has been removed from the fleet." });
    }
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: number) => {
      const response = await apiRequest('DELETE', `/api/admin/services/${serviceId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/services'] });
      toast({ title: "Service Removed", description: "Service has been removed from the marketplace." });
    }
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const response = await apiRequest('DELETE', `/api/admin/events/${eventId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/events'] });
      toast({ title: "Event Cancelled", description: "Event has been cancelled and attendees notified." });
    }
  });

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    userForm.reset({
      username: user.username,
      email: user.email,
      role: user.role,
      membershipTier: user.membershipTier || MembershipTier.BRONZE
    });
    setIsEditUserOpen(true);
  };

  const onUserSubmit = (data: z.infer<typeof insertUserSchema>) => {
    if (selectedUser) {
      updateUserMutation.mutate({ ...data, id: selectedUser.id });
    } else {
      createUserMutation.mutate(data);
    }
  };

  const exportData = async (type: 'users' | 'bookings' | 'payments') => {
    try {
      const response = await apiRequest('GET', `/api/admin/export/${type}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mbyc-${type}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Unable to export data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (growth < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Activity className="w-4 h-4 text-gray-400" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded': return 'bg-green-600';
      case 'pending': return 'bg-yellow-600';
      case 'failed': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-purple-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <Shield className="text-white text-lg" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                MBYC Admin Dashboard
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-white text-sm">
                <span>Administrator: {user?.username}</span>
                <div className="text-xs text-gray-400">
                  Full System Access
                </div>
              </div>

              <Button
                onClick={() => logoutMutation.mutate()}
                variant="outline"
                size="sm"
                className="border-purple-600/50 text-purple-400 hover:bg-purple-600/20"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Key Metrics Overview */}
          <div className="py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gray-800/50 border-purple-800/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</div>
                  <div className="flex items-center text-xs text-gray-400">
                    {getGrowthIcon(stats?.monthlyGrowth.users || 0)}
                    <span className="ml-1">{stats?.monthlyGrowth.users || 0}% this month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-purple-800/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Total Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats?.totalBookings || 0}</div>
                  <div className="flex items-center text-xs text-gray-400">
                    {getGrowthIcon(stats?.monthlyGrowth.bookings || 0)}
                    <span className="ml-1">{stats?.monthlyGrowth.bookings || 0}% this month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-purple-800/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Fleet Size</CardTitle>
                  <Anchor className="h-4 w-4 text-cyan-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats?.totalYachts || 0}</div>
                  <p className="text-xs text-gray-400">Active yachts</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-purple-800/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Monthly Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{formatCurrency(stats?.totalRevenue || 0)}</div>
                  <div className="flex items-center text-xs text-gray-400">
                    {getGrowthIcon(stats?.monthlyGrowth.revenue || 0)}
                    <span className="ml-1">{stats?.monthlyGrowth.revenue || 0}% this month</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Admin Management Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6 bg-gray-800/50 border border-purple-800/30">
              <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600">
                <BarChart3 className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600">
                <Users className="w-4 h-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="fleet" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600">
                <Anchor className="w-4 h-4 mr-2" />
                Fleet
              </TabsTrigger>
              <TabsTrigger value="services" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600">
                <Star className="w-4 h-4 mr-2" />
                Services
              </TabsTrigger>
              <TabsTrigger value="events" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600">
                <Calendar className="w-4 h-4 mr-2" />
                Events
              </TabsTrigger>
              <TabsTrigger value="payments" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600">
                <CreditCard className="w-4 h-4 mr-2" />
                Payments
              </TabsTrigger>
            </TabsList>

            {/* Overview & Analytics Tab */}
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-800/50 border-purple-800/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <PieChart className="w-5 h-5 mr-2" />
                      Membership Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(stats?.membershipDistribution || {}).map(([tier, count]) => (
                        <div key={tier} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge className={
                              tier === 'platinum' ? 'bg-purple-600' :
                              tier === 'gold' ? 'bg-yellow-600' :
                              tier === 'silver' ? 'bg-gray-600' : 'bg-orange-600'
                            }>
                              {tier.toUpperCase()}
                            </Badge>
                          </div>
                          <span className="text-white font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-purple-800/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Top Performing Yachts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats?.topYachts?.slice(0, 5).map((item, index) => (
                        <div key={item.yacht.id} className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium">{item.yacht.name}</div>
                            <div className="text-gray-400 text-sm">{item.bookings} bookings</div>
                          </div>
                          <div className="text-white">{formatCurrency(item.revenue)}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-purple-800/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Star className="w-5 h-5 mr-2" />
                      Top Services
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats?.topServices?.slice(0, 5).map((item, index) => (
                        <div key={item.service.id} className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium">{item.service.name}</div>
                            <div className="text-gray-400 text-sm">{item.bookings} bookings</div>
                          </div>
                          <div className="text-white">{formatCurrency(item.revenue)}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-purple-800/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Activity className="w-5 h-5 mr-2" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                      {stats?.recentActivity?.map((activity, index) => (
                        <div key={activity.id} className="flex items-center justify-between p-2 bg-gray-700/30 rounded">
                          <div>
                            <div className="text-white text-sm">{activity.description}</div>
                            <div className="text-gray-400 text-xs">
                              {new Date(activity.timestamp).toLocaleString()}
                            </div>
                          </div>
                          {activity.amount && (
                            <div className="text-green-400 text-sm">{formatCurrency(activity.amount)}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* User Management Tab */}
            <TabsContent value="users" className="mt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">User Management</h2>
                <div className="flex space-x-2">
                  <Button onClick={() => exportData('users')} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export Users
                  </Button>
                  <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-800 border-purple-800/30">
                      <DialogHeader>
                        <DialogTitle className="text-white">Create New User</DialogTitle>
                        <DialogDescription className="text-gray-300">
                          Add a new user to the MBYC system.
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...userForm}>
                        <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={userForm.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Username</FormLabel>
                                  <FormControl>
                                    <Input {...field} className="bg-gray-700 border-gray-600 text-white" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={userForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Email</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="email" className="bg-gray-700 border-gray-600 text-white" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={userForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Password</FormLabel>
                                <FormControl>
                                  <Input {...field} type="password" className="bg-gray-700 border-gray-600 text-white" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={userForm.control}
                              name="role"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Role</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value={UserRole.MEMBER}>Member</SelectItem>
                                      <SelectItem value={UserRole.YACHT_OWNER}>Yacht Owner</SelectItem>
                                      <SelectItem value={UserRole.SERVICE_PROVIDER}>Service Provider</SelectItem>
                                      <SelectItem value={UserRole.ADMIN}>Administrator</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={userForm.control}
                              name="membershipTier"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Membership Tier</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                                    <FormControl>
                                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value={MembershipTier.BRONZE}>Bronze</SelectItem>
                                      <SelectItem value={MembershipTier.SILVER}>Silver</SelectItem>
                                      <SelectItem value={MembershipTier.GOLD}>Gold</SelectItem>
                                      <SelectItem value={MembershipTier.PLATINUM}>Platinum</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsCreateUserOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" className="bg-gradient-to-r from-purple-600 to-blue-600">
                              Create User
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <Card className="bg-gray-800/50 border-purple-800/30">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">User</TableHead>
                        <TableHead className="text-gray-300">Role</TableHead>
                        <TableHead className="text-gray-300">Membership</TableHead>
                        <TableHead className="text-gray-300">Joined</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id} className="border-gray-700">
                          <TableCell>
                            <div>
                              <div className="text-white font-medium">{user.username}</div>
                              <div className="text-gray-400 text-sm">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-gray-600 text-gray-300">
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              user.membershipTier === 'platinum' ? 'bg-purple-600' :
                              user.membershipTier === 'gold' ? 'bg-yellow-600' :
                              user.membershipTier === 'silver' ? 'bg-gray-600' : 'bg-orange-600'
                            }>
                              {user.membershipTier?.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-600">Active</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" onClick={() => handleEditUser(user)}>
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => toggleUserStatusMutation.mutate({ userId: user.id, action: 'suspend' })}
                                className="border-yellow-600 text-yellow-400"
                              >
                                <UserMinus className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Fleet Management Tab */}
            <TabsContent value="fleet" className="mt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Fleet Management</h2>
                <Button onClick={() => exportData('bookings')} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Fleet Data
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {yachts.map((yacht, index) => (
                  <YachtCard key={yacht.id} yacht={yacht} index={index} />
                ))}
              </div>
            </TabsContent>

            {/* Services Management Tab */}
            <TabsContent value="services" className="mt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Service Marketplace</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <Card key={service.id} className="bg-gray-800/50 border-purple-800/30">
                    <div className="aspect-video relative rounded-t-lg overflow-hidden">
                      <img 
                        src={service.imageUrl || '/service-placeholder.jpg'} 
                        alt={service.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className={service.isAvailable ? "bg-green-600" : "bg-red-600"}>
                          {service.isAvailable ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-white">{service.name}</CardTitle>
                      <CardDescription className="text-gray-300">
                        {service.category} • ${service.pricePerSession}/session
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="text-gray-400 text-sm">
                          Provider ID: {service.providerId}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteServiceMutation.mutate(service.id)}
                          className="border-red-600 text-red-400 hover:bg-red-600/20"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Events Management Tab */}
            <TabsContent value="events" className="mt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Event Management</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => {
                  const eventDate = new Date(event.startTime);
                  const isUpcoming = eventDate > new Date();
                  
                  return (
                    <Card key={event.id} className="bg-gray-800/50 border-purple-800/30">
                      <div className="aspect-video relative rounded-t-lg overflow-hidden">
                        <img 
                          src={event.imageUrl || '/event-placeholder.jpg'} 
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className={isUpcoming ? "bg-blue-600" : "bg-gray-600"}>
                            {isUpcoming ? "Upcoming" : "Past"}
                          </Badge>
                        </div>
                      </div>
                      <CardHeader>
                        <CardTitle className="text-white">{event.title}</CardTitle>
                        <CardDescription className="text-gray-300">
                          {eventDate.toLocaleDateString()} • ${event.ticketPrice}/ticket
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <div className="text-gray-400 text-sm">
                            Capacity: {event.capacity}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteEventMutation.mutate(event.id)}
                            className="border-red-600 text-red-400 hover:bg-red-600/20"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Payments & Transactions Tab */}
            <TabsContent value="payments" className="mt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Payment Transactions</h2>
                <Button onClick={() => exportData('payments')} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Payments
                </Button>
              </div>

              <Card className="bg-gray-800/50 border-purple-800/30">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Transaction</TableHead>
                        <TableHead className="text-gray-300">Member</TableHead>
                        <TableHead className="text-gray-300">Type</TableHead>
                        <TableHead className="text-gray-300">Amount</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Date</TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id} className="border-gray-700">
                          <TableCell>
                            <div>
                              <div className="text-white font-medium">{transaction.description}</div>
                              <div className="text-gray-400 text-sm">ID: {transaction.stripePaymentId}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-300">{transaction.memberName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-gray-600 text-gray-300">
                              {transaction.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white font-medium">
                            {formatCurrency(transaction.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(transaction.status)}>
                              {transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {new Date(transaction.timestamp).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="bg-gray-800 border-purple-800/30">
          <DialogHeader>
            <DialogTitle className="text-white">Edit User</DialogTitle>
            <DialogDescription className="text-gray-300">
              Update user information and permissions.
            </DialogDescription>
          </DialogHeader>
          <Form {...userForm}>
            <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={userForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Username</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-gray-700 border-gray-600 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={userForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" className="bg-gray-700 border-gray-600 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={userForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Role</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={UserRole.MEMBER}>Member</SelectItem>
                          <SelectItem value={UserRole.YACHT_OWNER}>Yacht Owner</SelectItem>
                          <SelectItem value={UserRole.SERVICE_PROVIDER}>Service Provider</SelectItem>
                          <SelectItem value={UserRole.ADMIN}>Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={userForm.control}
                  name="membershipTier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Membership Tier</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={MembershipTier.BRONZE}>Bronze</SelectItem>
                          <SelectItem value={MembershipTier.SILVER}>Silver</SelectItem>
                          <SelectItem value={MembershipTier.GOLD}>Gold</SelectItem>
                          <SelectItem value={MembershipTier.PLATINUM}>Platinum</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditUserOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-purple-600 to-blue-600">
                  Update User
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;