import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, Calendar, CalendarDays, MessageSquare, Wrench, Ship, Shield, Users, 
  Anchor, Sparkles, CreditCard, TrendingUp, User, Settings, Bell, Clock, 
  Search, Menu, X, Zap, Activity, ChevronRight, Eye, Edit, Trash2, Plus,
  Filter, Star, MapPin, Phone, Mail, Globe, AlertTriangle, CheckCircle,
  XCircle, RefreshCw, Download, Upload, Share2, MoreVertical
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';

interface StaffMember {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  department: string;
  permissions: string[] | null;
  status: string;
  phone: string | null;
  location: string | null;
}

interface StaffStats {
  totalTasks: number;
  completedToday: number;
  pendingTasks: number;
  activeProjects: number;
}

// Staff portal menu items - mapped to actual database permissions
const allStaffMenuItems = [
  { id: 'overview', label: 'Overview', icon: BarChart3, color: 'from-purple-500 to-blue-500', permission: 'dashboard_access' },
  { id: 'bookings', label: 'Bookings', icon: Calendar, color: 'from-cyan-500 to-teal-500', permission: 'bookings' },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays, color: 'from-indigo-500 to-purple-500', permission: 'bookings' },
  { id: 'customer-service', label: 'Customer Service', icon: MessageSquare, color: 'from-green-500 to-emerald-500', permission: 'customer_service' },
  { id: 'yacht-maintenance', label: 'Yacht Maintenance', icon: Wrench, color: 'from-amber-500 to-orange-500', permission: 'yachts' },
  { id: 'crew_management', label: 'Crew Management', icon: Ship, color: 'from-teal-500 to-cyan-500', permission: 'crew_management' },
  { id: 'staff-management', label: 'Staff Management', icon: Shield, color: 'from-purple-500 to-indigo-500', permission: 'users' },
  { id: 'users', label: 'Users', icon: Users, color: 'from-green-500 to-emerald-500', permission: 'users' },
  { id: 'yachts', label: 'Fleet', icon: Anchor, color: 'from-blue-500 to-cyan-500', permission: 'yachts' },
  { id: 'services', label: 'Services', icon: Sparkles, color: 'from-orange-500 to-red-500', permission: 'services' },
  { id: 'events', label: 'Events', icon: CalendarDays, color: 'from-violet-500 to-purple-500', permission: 'events' },
  { id: 'payments', label: 'Payments', icon: CreditCard, color: 'from-green-500 to-teal-500', permission: 'payments' },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'from-pink-500 to-rose-500', permission: 'analytics' },
  { id: 'my-profile', label: 'My Profile', icon: User, color: 'from-purple-500 to-indigo-500', permission: 'dashboard_access' },
  { id: 'settings', label: 'Settings', icon: Settings, color: 'from-gray-500 to-slate-500', permission: 'dashboard_access' }
];

export default function StaffPortal() {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, logout } = useAuth();

  // Fetch staff profile and stats
  const { data: staffProfile } = useQuery<StaffMember>({
    queryKey: ['/api/staff/profile'],
    enabled: !!user
  });

  const { data: staffStats } = useQuery<StaffStats>({
    queryKey: ['/api/staff/stats'],
    enabled: !!user
  });

  const { data: yachts } = useQuery({
    queryKey: ['/api/yachts'],
    enabled: !!user
  });

  // Filter menu items based on staff permissions
  const filteredMenuItems = allStaffMenuItems.filter(item => {
    if (!staffProfile?.permissions) return item.permission === 'dashboard_access';
    
    // Map permissions to menu items
    const permissionMap: { [key: string]: string[] } = {
      'dashboard_access': ['overview', 'my-profile', 'settings'],
      'bookings': ['bookings', 'calendar'],
      'customer_service': ['customer-service'],
      'yachts': ['yachts', 'yacht-maintenance'],
      'crew_management': ['crew_management'],
      'users': ['users', 'staff-management'],
      'services': ['services'],
      'events': ['events'],
      'payments': ['payments'],
      'analytics': ['analytics']
    };

    // Check if staff has permission for this menu item
    for (const [permission, menuIds] of Object.entries(permissionMap)) {
      if (menuIds.includes(item.id) && staffProfile.permissions.includes(permission)) {
        return true;
      }
    }
    
    return false;
  });

  // Search functionality
  const searchResults = filteredMenuItems.filter(item =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sidebarItems = searchTerm ? searchResults : filteredMenuItems;

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    setSidebarCollapsed(true);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Customer Service section for staff
  function renderCustomerService() {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-white mb-2 tracking-tight"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif', fontWeight: 700 }}
          >
            Customer Service
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Handle member inquiries and support requests
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Live</Badge>
              </div>
              <h3 className="text-white font-semibold text-lg mb-1">Active Chats</h3>
              <p className="text-2xl font-bold text-white">12</p>
              <p className="text-green-400 text-sm mt-1">Ongoing conversations</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Today</Badge>
              </div>
              <h3 className="text-white font-semibold text-lg mb-1">Tickets Resolved</h3>
              <p className="text-2xl font-bold text-white">28</p>
              <p className="text-blue-400 text-sm mt-1">+15% from yesterday</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Avg</Badge>
              </div>
              <h3 className="text-white font-semibold text-lg mb-1">Response Time</h3>
              <p className="text-2xl font-bold text-white">2.5m</p>
              <p className="text-purple-400 text-sm mt-1">Average response</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Rating</Badge>
              </div>
              <h3 className="text-white font-semibold text-lg mb-1">Satisfaction</h3>
              <p className="text-2xl font-bold text-white">4.8/5</p>
              <p className="text-orange-400 text-sm mt-1">Customer rating</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-900/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white">Recent Support Tickets</CardTitle>
            <CardDescription>Latest customer inquiries and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: 'CS-001', user: 'demo_member', issue: 'Yacht booking inquiry', status: 'Open', priority: 'High' },
                { id: 'CS-002', user: 'member_2', issue: 'Service cancellation', status: 'In Progress', priority: 'Medium' },
                { id: 'CS-003', user: 'member_3', issue: 'Payment question', status: 'Resolved', priority: 'Low' }
              ].map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">
                        {ticket.user.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{ticket.issue}</p>
                      <p className="text-gray-400 text-sm">Ticket #{ticket.id} - {ticket.user}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={`${
                      ticket.priority === 'High' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      ticket.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      'bg-green-500/20 text-green-400 border-green-500/30'
                    }`}>
                      {ticket.priority}
                    </Badge>
                    <Badge className={`${
                      ticket.status === 'Open' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      ticket.status === 'In Progress' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                      'bg-green-500/20 text-green-400 border-green-500/30'
                    }`}>
                      {ticket.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Yacht Maintenance section for staff
  function renderYachtMaintenance() {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-white mb-2 tracking-tight"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif', fontWeight: 700 }}
          >
            Yacht Maintenance
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Monitor yacht maintenance schedules and status
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                  <Wrench className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Active</Badge>
              </div>
              <h3 className="text-white font-semibold text-lg mb-1">Scheduled Maintenance</h3>
              <p className="text-2xl font-bold text-white">8</p>
              <p className="text-amber-400 text-sm mt-1">This week</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-red-500 to-pink-500">
                  <Anchor className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Urgent</Badge>
              </div>
              <h3 className="text-white font-semibold text-lg mb-1">Urgent Repairs</h3>
              <p className="text-2xl font-bold text-white">3</p>
              <p className="text-red-400 text-sm mt-1">Need immediate attention</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Complete</Badge>
              </div>
              <h3 className="text-white font-semibold text-lg mb-1">Completed Today</h3>
              <p className="text-2xl font-bold text-white">12</p>
              <p className="text-green-400 text-sm mt-1">Maintenance tasks</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Available</Badge>
              </div>
              <h3 className="text-white font-semibold text-lg mb-1">Fleet Status</h3>
              <p className="text-2xl font-bold text-white">85%</p>
              <p className="text-blue-400 text-sm mt-1">Operational yachts</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-900/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white">Maintenance Schedule</CardTitle>
            <CardDescription>Upcoming maintenance tasks and inspections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { yacht: 'Azure Elegance', task: 'Engine Service', date: 'Today', priority: 'High', status: 'In Progress' },
                { yacht: 'Ocean Pearl', task: 'Hull Cleaning', date: 'Tomorrow', priority: 'Medium', status: 'Scheduled' },
                { yacht: 'Marina Breeze', task: 'Safety Inspection', date: 'Dec 27', priority: 'High', status: 'Pending' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                      <Anchor className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{item.yacht}</p>
                      <p className="text-gray-400 text-sm">{item.task} - {item.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={`${
                      item.priority === 'High' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    }`}>
                      {item.priority}
                    </Badge>
                    <Badge className={`${
                      item.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      item.status === 'Scheduled' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      'bg-orange-500/20 text-orange-400 border-orange-500/30'
                    }`}>
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Crew Management section for staff
  function renderCrewManagement() {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-white mb-2 tracking-tight"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif', fontWeight: 700 }}
          >
            Crew Management
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Manage crew assignments and scheduling
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500">
                  <Ship className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30">Active</Badge>
              </div>
              <h3 className="text-white font-semibold text-lg mb-1">Active Crew</h3>
              <p className="text-2xl font-bold text-white">24</p>
              <p className="text-teal-400 text-sm mt-1">On duty today</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Assigned</Badge>
              </div>
              <h3 className="text-white font-semibold text-lg mb-1">Yacht Assignments</h3>
              <p className="text-2xl font-bold text-white">16</p>
              <p className="text-blue-400 text-sm mt-1">Current assignments</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Available</Badge>
              </div>
              <h3 className="text-white font-semibold text-lg mb-1">Available Crew</h3>
              <p className="text-2xl font-bold text-white">8</p>
              <p className="text-green-400 text-sm mt-1">Ready for assignment</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Hours</Badge>
              </div>
              <h3 className="text-white font-semibold text-lg mb-1">Total Hours</h3>
              <p className="text-2xl font-bold text-white">192</p>
              <p className="text-orange-400 text-sm mt-1">This week</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-900/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white">Crew Assignments</CardTitle>
            <CardDescription>Current yacht crew assignments and schedules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Captain Rodriguez', role: 'Captain', yacht: 'Azure Elegance', shift: '6:00 AM - 2:00 PM', status: 'On Duty' },
                { name: 'First Mate Johnson', role: 'First Mate', yacht: 'Ocean Pearl', shift: '2:00 PM - 10:00 PM', status: 'On Duty' },
                { name: 'Crew Chief Williams', role: 'Crew Chief', yacht: 'Marina Breeze', shift: '10:00 AM - 6:00 PM', status: 'Break' }
              ].map((crew, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {crew.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{crew.name}</p>
                      <p className="text-gray-400 text-sm">{crew.role} - {crew.yacht}</p>
                      <p className="text-gray-500 text-xs">{crew.shift}</p>
                    </div>
                  </div>
                  <Badge className={`${
                    crew.status === 'On Duty' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                    'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  }`}>
                    {crew.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Staff Management section for staff
  function renderStaffManagement() {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-white mb-2 tracking-tight"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif', fontWeight: 700 }}
          >
            Staff Management
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Manage MBYC staff members and their roles
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Total</Badge>
              </div>
              <h3 className="text-white font-semibold text-lg mb-1">Total Staff</h3>
              <p className="text-2xl font-bold text-white">32</p>
              <p className="text-purple-400 text-sm mt-1">All departments</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
              </div>
              <h3 className="text-white font-semibold text-lg mb-1">Active Staff</h3>
              <p className="text-2xl font-bold text-white">28</p>
              <p className="text-green-400 text-sm mt-1">Currently working</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Scheduled</Badge>
              </div>
              <h3 className="text-white font-semibold text-lg mb-1">On Duty Today</h3>
              <p className="text-2xl font-bold text-white">22</p>
              <p className="text-blue-400 text-sm mt-1">Scheduled shifts</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Performance</Badge>
              </div>
              <h3 className="text-white font-semibold text-lg mb-1">Avg Performance</h3>
              <p className="text-2xl font-bold text-white">92%</p>
              <p className="text-orange-400 text-sm mt-1">Team efficiency</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-900/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white">Staff Directory</CardTitle>
            <CardDescription>MBYC staff members by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'John Smith', role: 'VIP Coordinator', department: 'Customer Experience', status: 'Active', permissions: '10 permissions' },
                { name: 'Maria Garcia', role: 'Marina Manager', department: 'Operations', status: 'Active', permissions: '8 permissions' },
                { name: 'David Chen', role: 'Fleet Coordinator', department: 'Operations', status: 'Active', permissions: '6 permissions' }
              ].map((staff, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {staff.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{staff.name}</p>
                      <p className="text-gray-400 text-sm">{staff.role} - {staff.department}</p>
                      <p className="text-gray-500 text-xs">{staff.permissions}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    {staff.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Overview section for staff
  function renderOverview() {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-white mb-2 tracking-tight"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif', fontWeight: 700 }}
          >
            Staff Overview
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Welcome back, {staffProfile?.fullName || 'Staff Member'}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Today</Badge>
              </div>
              <h3 className="text-white font-semibold text-lg mb-1">Total Tasks</h3>
              <p className="text-2xl font-bold text-white">{staffStats?.totalTasks || '42'}</p>
              <p className="text-blue-400 text-sm mt-1">Assigned to you</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Complete</Badge>
              </div>
              <h3 className="text-white font-semibold text-lg mb-1">Completed Today</h3>
              <p className="text-2xl font-bold text-white">{staffStats?.completedToday || '18'}</p>
              <p className="text-green-400 text-sm mt-1">Tasks finished</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Pending</Badge>
              </div>
              <h3 className="text-white font-semibold text-lg mb-1">Pending Tasks</h3>
              <p className="text-2xl font-bold text-white">{staffStats?.pendingTasks || '8'}</p>
              <p className="text-orange-400 text-sm mt-1">Need attention</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Active</Badge>
              </div>
              <h3 className="text-white font-semibold text-lg mb-1">Active Projects</h3>
              <p className="text-2xl font-bold text-white">{staffStats?.activeProjects || '5'}</p>
              <p className="text-purple-400 text-sm mt-1">Ongoing work</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white">Your Profile</CardTitle>
              <CardDescription>Staff member information</CardDescription>
            </CardHeader>
            <CardContent>
              {staffProfile ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xl font-bold">
                        {staffProfile.username?.charAt(0)?.toUpperCase() || 'S'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold text-white">{staffProfile.fullName}</h3>
                      <p className="text-gray-400">{staffProfile.role}</p>
                      <p className="text-gray-500 text-sm">{staffProfile.department}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-400">
                      <Mail className="h-4 w-4 mr-2" />
                      <span className="text-sm">{staffProfile.email}</span>
                    </div>
                    {staffProfile.phone && (
                      <div className="flex items-center text-gray-400">
                        <Phone className="h-4 w-4 mr-2" />
                        <span className="text-sm">{staffProfile.phone}</span>
                      </div>
                    )}
                    {staffProfile.location && (
                      <div className="flex items-center text-gray-400">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="text-sm">{staffProfile.location}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <Badge className={`${
                      staffProfile.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      'bg-gray-500/20 text-gray-400 border-gray-500/30'
                    }`}>
                      {staffProfile.status}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription>Commonly used staff functions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => setActiveSection('customer-service')}
                  className="h-20 bg-gradient-to-br from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 flex flex-col items-center justify-center"
                >
                  <MessageSquare className="h-6 w-6 mb-2" />
                  Customer Service
                </Button>
                
                <Button 
                  onClick={() => setActiveSection('yacht-maintenance')}
                  className="h-20 bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 flex flex-col items-center justify-center"
                >
                  <Wrench className="h-6 w-6 mb-2" />
                  Maintenance
                </Button>
                
                <Button 
                  onClick={() => setActiveSection('crew_management')}
                  className="h-20 bg-gradient-to-br from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 flex flex-col items-center justify-center"
                >
                  <Ship className="h-6 w-6 mb-2" />
                  Crew Management
                </Button>
                
                <Button 
                  onClick={() => setActiveSection('staff-management')}
                  className="h-20 bg-gradient-to-br from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 flex flex-col items-center justify-center"
                >
                  <Shield className="h-6 w-6 mb-2" />
                  Staff Management
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    );
  }

  function renderYachts() {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-white mb-2 tracking-tight"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif', fontWeight: 700 }}
          >
            Fleet Management
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Monitor and manage the yacht fleet
          </motion.p>
        </div>

        {yachts && yachts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {yachts.map((yacht: any, index: number) => (
              <motion.div
                key={yacht.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:border-blue-500/50 transition-all duration-300 overflow-hidden group">
                  <div className="relative">
                    <img 
                      src={yacht.imageUrl || '/api/media/pexels-pixabay-163236_1750537277230.jpg'}
                      alt={yacht.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-blue-500/30">
                        {yacht.size}ft
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{yacht.name}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{yacht.description}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Capacity</span>
                        <span className="text-white font-medium">{yacht.capacity} guests</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Type</span>
                        <span className="text-white font-medium">{yacht.type}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Location</span>
                        <span className="text-white font-medium">{yacht.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Available
                      </Badge>
                      <Button size="sm" variant="ghost" className="text-blue-400 hover:text-white">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
          </div>
        )}
      </motion.div>
    );
  }

  function renderContent() {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'yachts':
        return renderYachts();
      case 'customer-service':
        return renderCustomerService();
      case 'yacht-maintenance':
        return renderYachtMaintenance();
      case 'crew_management':
        return renderCrewManagement();
      case 'staff-management':
        return renderStaffManagement();
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Section Coming Soon</h3>
              <p className="text-gray-400">This section is being developed and will be available soon.</p>
            </div>
          </div>
        );
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hamburger menu button */}
      <AnimatePresence>
        {sidebarCollapsed && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 left-4 z-[9999] p-3 rounded-xl bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 text-white hover:bg-gray-800/80 transition-all duration-300"
            onClick={toggleSidebar}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Menu className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Close button */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.button
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed top-4 right-4 z-[9999] p-3 rounded-xl bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 text-white hover:bg-gray-800/80 transition-all duration-300"
            onClick={toggleSidebar}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ 
            x: sidebarCollapsed ? -320 : 0,
            opacity: sidebarCollapsed ? 0 : 1
          }}
          transition={{ type: "spring", stiffness: 200, damping: 30 }}
          className="w-80 bg-gray-900/50 backdrop-blur-xl border-r border-gray-700/50 flex flex-col fixed h-full flex-shrink-0 z-50"
        >
          {/* Logo */}
          <div className="p-6 border-b border-gray-700/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <img 
                    src="/api/media/MBYC-LOGO-WHITE_1750688569645.png" 
                    alt="MBYC Logo" 
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Staff Portal</h2>
                  <p className="text-sm text-gray-400">Miami Beach Yacht Club</p>
                </div>
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
                className="pl-10 bg-gray-900/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-6">
            <div className="space-y-2 pb-4">
              {sidebarItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    onClick={() => handleSectionChange(item.id)}
                    className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl group relative overflow-hidden transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-transparent shadow-lg shadow-purple-600/30' 
                        : 'bg-transparent text-gray-400 border-transparent hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 hover:text-white hover:border-transparent'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-gray-700/50 group-hover:bg-gray-600/50'} transition-all duration-300`}>
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

          {/* User Profile with Logout */}
          <div className="p-6 border-t border-gray-700/50 bg-gray-900/50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="profile-picture-outline h-12 w-12">
                <div className="profile-picture-inner w-full h-full">
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {staffProfile?.username?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'S'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {staffProfile?.fullName || user?.username || 'Staff User'}
                </p>
                <p className="text-xs text-gray-400">{staffProfile?.role || 'Staff Member'}</p>
              </div>
            </div>
            
            <Button 
              onClick={logout}
              variant="outline" 
              size="sm" 
              className="w-full border-gray-600 text-gray-300 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400"
            >
              Log Out
            </Button>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div 
          animate={{ 
            marginLeft: sidebarCollapsed ? 0 : 320
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="flex-1 overflow-y-auto p-8 w-full"
        >
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}