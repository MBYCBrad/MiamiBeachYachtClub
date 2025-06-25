import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  Settings, 
  BarChart3, 
  Shield, 
  Bell, 
  Search,
  Menu,
  X,
  Ship,
  Clock,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function StaffPortal() {
  const { user, logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Staff role-based permissions (from database)
  const staffPermissions = user?.permissions || [];
  
  // Staff menu items based on role and permissions
  const menuItems = [
    { id: "overview", label: "Overview", icon: BarChart3, permission: "view_overview" },
    { id: "bookings", label: "Bookings", icon: Calendar, permission: "view_bookings" },
    { id: "members", label: "Members", icon: Users, permission: "manage_members" },
    { id: "fleet", label: "Fleet Status", icon: Ship, permission: "view_fleet" },
    { id: "communications", label: "Communications", icon: MessageSquare, permission: "manage_communications" },
    { id: "security", label: "Security", icon: Shield, permission: "manage_security" },
    { id: "settings", label: "Settings", icon: Settings, permission: "manage_settings" }
  ];

  // Filter menu based on staff permissions
  const visibleMenuItems = menuItems.filter(item => 
    staffPermissions.includes(item.permission) || user?.role === "admin"
  );

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Staff Portal</h1>
          <p className="text-purple-200">Welcome back, {user?.fullName}</p>
        </div>
        <Badge variant="outline" className="border-purple-300 text-purple-200">
          {user?.role?.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 border-purple-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-200">Active Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">24</div>
              <p className="text-xs text-purple-300">+12% from yesterday</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 border-blue-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-200">Fleet Status</CardTitle>
              <Ship className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">8/12</div>
              <p className="text-xs text-blue-300">Yachts available</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-green-900/40 to-green-800/40 border-green-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-200">Member Requests</CardTitle>
              <MessageSquare className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">7</div>
              <p className="text-xs text-green-300">Pending responses</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-orange-900/40 to-orange-800/40 border-orange-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-200">Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">3</div>
              <p className="text-xs text-orange-300">Require attention</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="flex-1">
                <p className="text-sm text-white">Yacht "Ocean Dream" checked in</p>
                <p className="text-xs text-slate-400">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-blue-400" />
              <div className="flex-1">
                <p className="text-sm text-white">Booking confirmed for tomorrow</p>
                <p className="text-xs text-slate-400">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-5 w-5 text-purple-400" />
              <div className="flex-1">
                <p className="text-sm text-white">New member message received</p>
                <p className="text-xs text-slate-400">1 hour ago</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-purple-600 hover:bg-purple-700">
              <Calendar className="h-4 w-4 mr-2" />
              View Today's Schedule
            </Button>
            <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">
              <Ship className="h-4 w-4 mr-2" />
              Check Fleet Status
            </Button>
            <Button className="w-full justify-start bg-green-600 hover:bg-green-700">
              <MessageSquare className="h-4 w-4 mr-2" />
              Respond to Messages
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "bookings":
        return (
          <div className="text-white">
            <h2 className="text-2xl font-bold mb-4">Booking Management</h2>
            <p>Booking management interface will be implemented here based on staff permissions.</p>
          </div>
        );
      case "members":
        return (
          <div className="text-white">
            <h2 className="text-2xl font-bold mb-4">Member Management</h2>
            <p>Member management interface will be implemented here based on staff permissions.</p>
          </div>
        );
      case "fleet":
        return (
          <div className="text-white">
            <h2 className="text-2xl font-bold mb-4">Fleet Status</h2>
            <p>Fleet status monitoring interface will be implemented here based on staff permissions.</p>
          </div>
        );
      case "communications":
        return (
          <div className="text-white">
            <h2 className="text-2xl font-bold mb-4">Communications</h2>
            <p>Communications management interface will be implemented here based on staff permissions.</p>
          </div>
        );
      case "security":
        return (
          <div className="text-white">
            <h2 className="text-2xl font-bold mb-4">Security Management</h2>
            <p>Security management interface will be implemented here based on staff permissions.</p>
          </div>
        );
      case "settings":
        return (
          <div className="text-white">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <p>Settings interface will be implemented here based on staff permissions.</p>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ duration: 0.3 }}
        className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-slate-900/95 to-purple-900/95 backdrop-blur-xl border-r border-purple-700/50 z-50"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white">MBYC Staff</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {visibleMenuItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className={`w-full justify-start ${
                  activeTab === item.id 
                    ? "bg-purple-600 text-white" 
                    : "text-purple-200 hover:text-white hover:bg-purple-800/50"
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.label}
              </Button>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-purple-700/50">
            <div className="space-y-2">
              <div className="text-xs text-purple-300 uppercase tracking-wider">Account</div>
              <div className="text-sm text-purple-200">{user?.fullName}</div>
              <div className="text-xs text-purple-400">{user?.email}</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start text-purple-200 hover:text-white hover:bg-purple-800/50 mt-2"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <div className="bg-slate-900/50 backdrop-blur-xl border-b border-purple-700/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-purple-200"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                <Input
                  placeholder="Search..."
                  className="pl-10 bg-slate-800/50 border-purple-700/50 text-white placeholder:text-purple-400"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-purple-200">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}