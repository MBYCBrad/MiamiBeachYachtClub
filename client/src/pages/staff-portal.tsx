import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Anchor, 
  Calendar, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Bell,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  Ship,
  UserCheck,
  Wrench,
  Phone
} from "lucide-react";
import { Redirect } from "wouter";

export default function StaffPortal() {
  const { user, logoutMutation } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');

  // Redirect non-staff users
  if (!user || user.role !== 'staff') {
    return <Redirect to="/auth" />;
  }

  const { data: staffStats } = useQuery({
    queryKey: ['/api/staff/stats'],
    enabled: !!user,
  });

  const { data: tasks } = useQuery({
    queryKey: ['/api/staff/tasks'],
    enabled: !!user,
  });

  const { data: notifications } = useQuery({
    queryKey: ['/api/staff/notifications'],
    enabled: !!user,
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'tasks', label: 'My Tasks', icon: CheckCircle },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'members', label: 'Members', icon: Users, permission: 'member_relations' },
    { id: 'yachts', label: 'Fleet Status', icon: Ship, permission: 'yacht_management' },
    { id: 'bookings', label: 'Bookings', icon: Calendar, permission: 'booking_oversight' },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench, permission: 'maintenance_oversight' },
    { id: 'concierge', label: 'Concierge', icon: Phone, permission: 'concierge_services' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const filteredSidebarItems = sidebarItems.filter(item => 
    !item.permission || user.permissions?.includes(item.permission)
  );

  const renderOverview = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user.fullName}
        </h2>
        <p className="text-gray-300">
          {user.staffRole} • {user.department} Department • {user.location}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{staffStats?.activeTasks || 0}</div>
            <p className="text-xs text-gray-400">
              +2 from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Today's Schedule</CardTitle>
            <Clock className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{staffStats?.todayEvents || 0}</div>
            <p className="text-xs text-gray-400">
              events scheduled
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{notifications?.length || 0}</div>
            <p className="text-xs text-gray-400">
              unread messages
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-400" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks?.slice(0, 5).map((task: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-800">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    task.priority === 'high' ? 'bg-red-400' :
                    task.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                  }`} />
                  <div>
                    <p className="text-white font-medium">{task.title}</p>
                    <p className="text-gray-400 text-sm">{task.description}</p>
                  </div>
                </div>
                <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                  {task.status}
                </Badge>
              </div>
            )) || (
              <p className="text-gray-400 text-center py-8">No recent activities</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'tasks':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">My Tasks</h2>
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <p className="text-gray-400 text-center py-8">Task management coming soon...</p>
              </CardContent>
            </Card>
          </div>
        );
      case 'schedule':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Schedule</h2>
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <p className="text-gray-400 text-center py-8">Schedule management coming soon...</p>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white capitalize">{activeSection}</h2>
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <p className="text-gray-400 text-center py-8">This section is coming soon...</p>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <Anchor className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold">MBYC Staff</h1>
              <p className="text-gray-400 text-sm">Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            {filteredSidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeSection === item.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{user.fullName}</p>
              <p className="text-gray-400 text-sm truncate">{user.staffRole}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800"
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-white capitalize">
                {activeSection.replace('_', ' ')}
              </h1>
              {user.permissions && user.permissions.length > 0 && (
                <div className="flex items-center gap-2">
                  {user.permissions.slice(0, 3).map((permission) => (
                    <Badge key={permission} variant="secondary" className="text-xs">
                      {permission.replace('_', ' ')}
                    </Badge>
                  ))}
                  {user.permissions.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{user.permissions.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}