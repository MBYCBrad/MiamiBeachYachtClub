import { useAuth } from "@/hooks/use-auth";
import { 
  Calendar, 
  Ship, 
  Users, 
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Activity,
  Search,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function StaffPortal() {
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gray-900/90 backdrop-blur-sm border-r border-purple-500/20">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white mb-2">MBYC Staff</h1>
          
          {/* Account Section */}
          <div className="mt-8">
            <h3 className="text-sm font-medium text-purple-300 mb-3">ACCOUNT</h3>
            <div className="space-y-2">
              <div className="text-white font-medium">{user?.fullName || user?.username}</div>
              <div className="text-sm text-purple-300">{user?.email}</div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-purple-300 hover:text-white p-0 h-auto"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Staff Portal</h1>
            <p className="text-purple-300">Welcome back, {user?.fullName || user?.username}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
              <Input 
                placeholder="Search..." 
                className="pl-10 bg-gray-800/50 border-purple-500/30 text-white placeholder-purple-400"
              />
            </div>
            <Badge variant="outline" className="bg-purple-600 text-white border-purple-500">
              STAFF
            </Badge>
            <Button variant="ghost" size="icon" className="text-purple-300 hover:text-white">
              <Bell className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm">Active Bookings</p>
                <p className="text-3xl font-bold text-white">24</p>
                <p className="text-xs text-purple-400">+12% from yesterday</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm">Fleet Status</p>
                <p className="text-3xl font-bold text-white">8/12</p>
                <p className="text-xs text-purple-400">Yachts available</p>
              </div>
              <Ship className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm">Member Requests</p>
                <p className="text-3xl font-bold text-white">7</p>
                <p className="text-xs text-green-400">Pending responses</p>
              </div>
              <MessageSquare className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm">Alerts</p>
                <p className="text-3xl font-bold text-white">3</p>
                <p className="text-xs text-orange-400">Require attention</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-400" />
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-2 gap-8">
          {/* Recent Activities */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-6">Recent Activities</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-white font-medium">Yacht "Ocean Dream" checked in</p>
                  <p className="text-sm text-purple-400">2 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-white font-medium">Booking confirmed for tomorrow</p>
                  <p className="text-sm text-purple-400">15 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-white font-medium">New member message received</p>
                  <p className="text-sm text-purple-400">1 hour ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                <Calendar className="w-4 h-4 mr-2" />
                View Today's Schedule
              </Button>
              
              <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
                <Ship className="w-4 h-4 mr-2" />
                Check Fleet Status
              </Button>
              
              <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                <MessageSquare className="w-4 h-4 mr-2" />
                Respond to Messages
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}