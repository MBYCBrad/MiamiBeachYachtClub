import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { 
  Ship, 
  Users, 
  Calendar, 
  ClipboardList, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  LogOut,
  Bell,
  Clock,
  MapPin,
  Phone,
  Anchor,
  Waves,
  Navigation
} from "lucide-react";
import { motion } from "framer-motion";

export default function StaffPortal() {
  const { user, logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Get staff member data - user is populated from staff table
  const staffMember = user;

  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/staff/dashboard-stats"],
    enabled: !!staffMember?.id,
  });

  const { data: activeBookings } = useQuery({
    queryKey: ["/api/staff/active-bookings"],
    enabled: !!staffMember?.id,
  });

  const { data: pendingTasks } = useQuery({
    queryKey: ["/api/staff/pending-tasks"],
    enabled: !!staffMember?.id,
  });

  if (!staffMember) {
    return <div>Loading staff portal...</div>;
  }

  const getStaffRoleColor = (role: string) => {
    const roleColors = {
      "Marina Manager": "bg-blue-500/10 text-blue-600 border-blue-200",
      "Fleet Coordinator": "bg-purple-500/10 text-purple-600 border-purple-200",
      "Member Relations": "bg-green-500/10 text-green-600 border-green-200",
      "Concierge Manager": "bg-amber-500/10 text-amber-600 border-amber-200",
      "Lead Captain": "bg-cyan-500/10 text-cyan-600 border-cyan-200",
      "Events Coordinator": "bg-pink-500/10 text-pink-600 border-pink-200",
    };
    return roleColors[role as keyof typeof roleColors] || "bg-gray-500/10 text-gray-600 border-gray-200";
  };

  const getPermissionMenus = (permissions: string[]) => {
    const menuItems = [];
    
    if (permissions.includes("dashboard_access")) {
      menuItems.push({ id: "dashboard", label: "Dashboard", icon: BarChart3 });
    }
    if (permissions.includes("booking_management")) {
      menuItems.push({ id: "bookings", label: "Bookings", icon: Calendar });
    }
    if (permissions.includes("maintenance_access")) {
      menuItems.push({ id: "maintenance", label: "Maintenance", icon: Settings });
    }
    if (permissions.includes("member_support")) {
      menuItems.push({ id: "members", label: "Members", icon: Users });
    }
    if (permissions.includes("fleet_coordination")) {
      menuItems.push({ id: "fleet", label: "Fleet", icon: Ship });
    }
    if (permissions.includes("event_management")) {
      menuItems.push({ id: "events", label: "Events", icon: Calendar });
    }
    if (permissions.includes("communication")) {
      menuItems.push({ id: "messages", label: "Messages", icon: MessageSquare });
    }

    return menuItems;
  };

  const menuItems = getPermissionMenus(staffMember.permissions || []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Anchor className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-white">Staff Portal</h1>
                  <p className="text-sm text-blue-200">Miami Beach Yacht Club</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{staffMember.fullName}</p>
                  <Badge className={`text-xs ${getStaffRoleColor(staffMember.staffRole || staffMember.role)}`}>
                    {staffMember.staffRole || staffMember.role}
                  </Badge>
                </div>
                <div className="h-8 w-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">
                    {staffMember.fullName?.charAt(0) || 'S'}
                  </span>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                className="text-red-300 hover:text-red-200 hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-black/20 backdrop-blur-sm border-r border-white/10">
          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === item.id
                          ? "bg-blue-500/20 text-blue-200 border border-blue-400/30"
                          : "text-gray-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Dashboard</h2>
                <p className="text-gray-300">Welcome back, {staffMember.fullName}</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-gray-300">
                          Active Bookings
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-blue-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {dashboardStats?.activeBookings || 0}
                      </div>
                    </CardHeader>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-gray-300">
                          Pending Tasks
                        </CardTitle>
                        <ClipboardList className="h-4 w-4 text-purple-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {dashboardStats?.pendingTasks || 0}
                      </div>
                    </CardHeader>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-gray-300">
                          Fleet Status
                        </CardTitle>
                        <Ship className="h-4 w-4 text-green-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {dashboardStats?.fleetAvailable || 0}/{dashboardStats?.totalFleet || 0}
                      </div>
                    </CardHeader>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-gray-300">
                          Notifications
                        </CardTitle>
                        <Bell className="h-4 w-4 text-amber-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {dashboardStats?.notifications || 0}
                      </div>
                    </CardHeader>
                  </Card>
                </motion.div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Bookings</CardTitle>
                    <CardDescription className="text-gray-400">
                      Latest yacht reservations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activeBookings?.slice(0, 5).map((booking: any, index: number) => (
                        <div key={index} className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg">
                          <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Ship className="h-4 w-4 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">
                              {booking.yachtName || `Yacht #${booking.yachtId}`}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(booking.startTime).toLocaleDateString()} - {booking.status}
                            </p>
                          </div>
                        </div>
                      )) || (
                        <p className="text-gray-400 text-center py-4">No recent bookings</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Pending Tasks</CardTitle>
                    <CardDescription className="text-gray-400">
                      Items requiring attention
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {pendingTasks?.slice(0, 5).map((task: any, index: number) => (
                        <div key={index} className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg">
                          <div className="p-2 bg-purple-500/20 rounded-lg">
                            <ClipboardList className="h-4 w-4 text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">
                              {task.title || "Staff Task"}
                            </p>
                            <p className="text-xs text-gray-400">
                              {task.priority || "Normal"} Priority - {task.department || "General"}
                            </p>
                          </div>
                        </div>
                      )) || (
                        <p className="text-gray-400 text-center py-4">No pending tasks</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "bookings" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Booking Management</h2>
                <p className="text-gray-300">Manage yacht reservations and schedules</p>
              </div>

              <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">Booking Management</h3>
                    <p className="text-gray-400">
                      Full booking management interface will be available here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "maintenance" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Maintenance</h2>
                <p className="text-gray-300">Fleet maintenance and service records</p>
              </div>

              <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">Maintenance System</h3>
                    <p className="text-gray-400">
                      Comprehensive maintenance tracking interface will be available here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "members" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Member Relations</h2>
                <p className="text-gray-300">Member support and communication</p>
              </div>

              <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">Member Management</h3>
                    <p className="text-gray-400">
                      Member relations and support tools will be available here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "fleet" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Fleet Coordination</h2>
                <p className="text-gray-300">Yacht fleet status and coordination</p>
              </div>

              <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <Ship className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">Fleet Management</h3>
                    <p className="text-gray-400">
                      Complete fleet coordination system will be available here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "events" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Event Management</h2>
                <p className="text-gray-300">Club events and special occasions</p>
              </div>

              <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">Event Planning</h3>
                    <p className="text-gray-400">
                      Event coordination and management tools will be available here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "messages" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Communication</h2>
                <p className="text-gray-300">Staff and member communications</p>
              </div>

              <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">Communication Hub</h3>
                    <p className="text-gray-400">
                      Integrated messaging and communication system will be available here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}