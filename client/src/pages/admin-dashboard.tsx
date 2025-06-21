import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  Anchor, 
  Settings, 
  Calendar, 
  TrendingUp, 
  DollarSign,
  Activity,
  UserCheck,
  Ship,
  Briefcase
} from "lucide-react";
import { UserRole, MembershipTier } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User, Yacht, Service, Event, Booking } from "@shared/schema";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<'overview' | 'users' | 'yachts' | 'services' | 'events' | 'bookings'>('overview');

  // Data queries
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
    enabled: user?.role === UserRole.ADMIN
  });

  const { data: yachts = [] } = useQuery<Yacht[]>({
    queryKey: ['/api/yachts']
  });

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ['/api/services']
  });

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ['/api/events']
  });

  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: ['/api/bookings']
  });

  // User management mutations
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: number; updates: Partial<User> }) => {
      const res = await apiRequest("PATCH", `/api/users/${userId}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "User Updated",
        description: "User information has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  if (user?.role !== UserRole.ADMIN) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-slate-300">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  const stats = {
    totalUsers: users.length,
    totalYachts: yachts.length,
    totalServices: services.length,
    totalEvents: events.length,
    totalBookings: bookings.length,
    activeMembers: users.filter(u => u.role === UserRole.MEMBER).length,
    yachtOwners: users.filter(u => u.role === UserRole.YACHT_OWNER).length,
    serviceProviders: users.filter(u => u.role === UserRole.SERVICE_PROVIDER).length,
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
            </div>
            <Users className="h-8 w-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Yachts</p>
              <p className="text-2xl font-bold text-white">{stats.totalYachts}</p>
            </div>
            <Ship className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Active Services</p>
              <p className="text-2xl font-bold text-white">{stats.totalServices}</p>
            </div>
            <Briefcase className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Bookings</p>
              <p className="text-2xl font-bold text-white">{stats.totalBookings}</p>
            </div>
            <Calendar className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">User Distribution</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Members</span>
              <Badge variant="secondary">{stats.activeMembers}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Yacht Owners</span>
              <Badge variant="secondary">{stats.yachtOwners}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Service Providers</span>
              <Badge variant="secondary">{stats.serviceProviders}</Badge>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-slate-300 text-sm">New member registration</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-slate-300 text-sm">Yacht booking completed</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="text-slate-300 text-sm">New service added</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        <Button className="bg-purple-600 hover:bg-purple-700">
          Add New User
        </Button>
      </div>

      <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Membership
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-700/30">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{user.username}</div>
                        <div className="text-sm text-slate-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={
                      user.role === UserRole.ADMIN ? 'destructive' :
                      user.role === UserRole.YACHT_OWNER ? 'secondary' :
                      user.role === UserRole.SERVICE_PROVIDER ? 'outline' : 'default'
                    }>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={
                      user.membershipTier === MembershipTier.PLATINUM ? 'destructive' :
                      user.membershipTier === MembershipTier.GOLD ? 'secondary' :
                      user.membershipTier === MembershipTier.SILVER ? 'outline' : 'default'
                    }>
                      {user.membershipTier}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      <span className="text-sm text-slate-300">Active</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-purple-400 hover:text-purple-300"
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const navigation = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'yachts', label: 'Yachts', icon: Ship },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'bookings', label: 'Bookings', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700">
          <div className="p-6">
            <h1 className="text-xl font-bold text-white mb-6">Admin Dashboard</h1>
            <nav className="space-y-2">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as any)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeSection === item.id
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-600/30'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {activeSection === 'overview' && renderOverview()}
            {activeSection === 'users' && renderUsers()}
            {activeSection === 'yachts' && (
              <div className="text-white">
                <h2 className="text-2xl font-bold mb-6">Yacht Management</h2>
                <p>Yacht management functionality coming soon...</p>
              </div>
            )}
            {activeSection === 'services' && (
              <div className="text-white">
                <h2 className="text-2xl font-bold mb-6">Service Management</h2>
                <p>Service management functionality coming soon...</p>
              </div>
            )}
            {activeSection === 'events' && (
              <div className="text-white">
                <h2 className="text-2xl font-bold mb-6">Event Management</h2>
                <p>Event management functionality coming soon...</p>
              </div>
            )}
            {activeSection === 'bookings' && (
              <div className="text-white">
                <h2 className="text-2xl font-bold mb-6">Booking Management</h2>
                <p>Booking management functionality coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}