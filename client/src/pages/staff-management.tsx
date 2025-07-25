import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  Users,
  UserPlus,
  Settings,
  Shield,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Crown,
  Star,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  Badge as BadgeIcon,
  Key,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";

// Types for staff management
interface StaffUser {
  id: number;
  fullName: string;
  username: string;
  email: string;
  role: string;
  permissions?: string[];
  createdBy?: number;
  createdByName?: string;
  phone?: string;
  location?: string;
  lastLogin?: Date;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

const availablePermissions: Permission[] = [
  { id: 'users', name: 'User Management', description: 'Create, edit, and manage all users', category: 'Administration' },
  { id: 'yachts', name: 'Yacht Management', description: 'Manage yacht fleet and bookings', category: 'Fleet' },
  { id: 'services', name: 'Service Management', description: 'Manage services and providers', category: 'Services' },
  { id: 'events', name: 'Event Management', description: 'Create and manage club events', category: 'Events' },
  { id: 'bookings', name: 'Booking Management', description: 'View and manage all bookings', category: 'Operations' },
  { id: 'payments', name: 'Payment Management', description: 'Handle payments and billing', category: 'Finance' },
  { id: 'analytics', name: 'Analytics Access', description: 'View business analytics and reports', category: 'Reporting' },
  { id: 'notifications', name: 'Notification Management', description: 'Manage system notifications', category: 'System' },
  { id: 'customer_service', name: 'Customer Service', description: 'Access customer service tools', category: 'Support' },
  { id: 'crew_management', name: 'Crew Management', description: 'Manage yacht crew assignments', category: 'Operations' },
];

const staffRoles = [
  // Marina & Fleet Operations
  'Marina Manager',
  'Fleet Coordinator',
  'Dock Master', 
  'Yacht Captain',
  'First Mate',
  'Crew Supervisor',
  // Member Services
  'Member Relations Specialist',
  'Concierge Manager',
  'Concierge Agent',
  'Guest Services Representative',
  'VIP Coordinator',
  // Operations & Support
  'Operations Manager',
  'Booking Coordinator',
  'Service Coordinator',
  'Event Coordinator',
  'Safety Officer',
  // Finance & Administration
  'Finance Manager',
  'Billing Specialist',
  'Accounts Manager',
  // Technology & Analytics
  'IT Specialist',
  'Data Analyst',
  'Systems Administrator'
];

export default function StaffManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();



  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffUser | null>(null);
  const [newStaffData, setNewStaffData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    role: "",
    permissions: [] as string[],
    phone: "",
    location: "",
    department: ""
  });

  // Fetch staff users - use appropriate endpoint based on user role
  const staffEndpoint = user?.role === 'admin' ? '/api/admin/staff' : '/api/staff/team';
  const { data: staffUsers = [], isLoading: staffLoading } = useQuery<StaffUser[]>({
    queryKey: [staffEndpoint],
    enabled: !!user && (user.role === 'admin' || 
      user.role === 'staff' ||
      (user.permissions && user.permissions.includes('users')) ||
      user.role?.includes('Manager') ||
      user.role?.includes('Coordinator')),
    refetchInterval: 30000, // Real-time 30-second refresh
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 1000 * 60 * 1, // 1 minute stale time
    cacheTime: 1000 * 60 * 5, // 5 minute cache time
  });

  // Add staff mutation - use appropriate endpoint based on user role
  const addStaffMutation = useMutation({
    mutationFn: async (staffData: typeof newStaffData) => {
      console.log('Adding new staff member:', staffData);
      const endpoint = user?.role === 'admin' ? '/api/admin/staff' : '/api/staff/team';
      const response = await apiRequest('POST', endpoint, staffData);
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Staff member added successfully:', data);
      queryClient.invalidateQueries({ queryKey: [staffEndpoint] });
      queryClient.refetchQueries({ queryKey: [staffEndpoint] });
      setShowAddDialog(false);
      setNewStaffData({
        fullName: "",
        username: "",
        email: "",
        password: "",
        role: "",
        permissions: [],
        phone: "",
        location: "",
        department: ""
      });
      toast({ title: "Staff added", description: `${data.fullName || data.username} has been created successfully` });
    },
    onError: (error: any) => {
      console.error('Error adding staff member:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Update staff mutation - use appropriate endpoint based on user role
  const updateStaffMutation = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<StaffUser> }) => {
      console.log('Updating staff member:', data);
      const endpoint = user?.role === 'admin' ? `/api/admin/staff/${data.id}` : `/api/staff/team/${data.id}`;
      const response = await apiRequest('PUT', endpoint, data.updates);
      return response.json();
    },
    onSuccess: (data, variables) => {
      console.log('Staff member updated successfully:', data);
      queryClient.invalidateQueries({ queryKey: [staffEndpoint] });
      queryClient.refetchQueries({ queryKey: [staffEndpoint] });
      setShowEditDialog(false);
      setSelectedStaff(null);
      toast({ title: "Staff updated", description: `Staff member ${data.fullName || data.username} has been updated successfully` });
    },
    onError: (error: any) => {
      console.error('Error updating staff member:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Delete staff mutation - use appropriate endpoint based on user role
  const deleteStaffMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log('Deleting staff member ID:', id);
      const endpoint = user?.role === 'admin' ? `/api/admin/staff/${id}` : `/api/staff/team/${id}`;
      const response = await apiRequest('DELETE', endpoint);
      return response.json();
    },
    onSuccess: (data, variables) => {
      console.log('Staff member deleted successfully:', data);
      queryClient.invalidateQueries({ queryKey: [staffEndpoint] });
      queryClient.refetchQueries({ queryKey: [staffEndpoint] });
      setShowDeleteDialog(false);
      setSelectedStaff(null);
      toast({ title: "Staff deleted", description: `Staff member has been removed successfully` });
    },
    onError: (error: any) => {
      console.error('Error deleting staff member:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Real-time staff connectivity logging
  console.log('Staff management real-time data:', {
    totalStaff: staffUsers.length,
    loading: staffLoading,
    lastRefresh: new Date().toISOString(),
    staffMembers: staffUsers.map(s => ({ 
      id: s.id, 
      username: s.username, 
      role: s.role, 
      status: s.status 
    }))
  });

  // Filter staff users
  const filteredStaff = staffUsers.filter(staff => {
    const matchesSearch = staff.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (staff.fullName && staff.fullName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === "all" || staff.role === roleFilter;
    const matchesStatus = statusFilter === "all" || staff.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'inactive': return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
      case 'suspended': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Staff - Management': return <Crown className="h-4 w-4 text-purple-400" />;
      case 'Staff - Concierge': return <Star className="h-4 w-4 text-yellow-400" />;
      case 'Staff - Customer Support': return <Phone className="h-4 w-4 text-blue-400" />;
      case 'Staff - Crew Manager': return <Users className="h-4 w-4 text-green-400" />;
      default: return <User className="h-4 w-4 text-gray-400" />;
    }
  };

  const handleAddStaff = () => {
    addStaffMutation.mutate(newStaffData);
  };

  const handleUpdateStaff = () => {
    if (!selectedStaff) return;
    updateStaffMutation.mutate({
      id: selectedStaff.id,
      updates: {
        role: selectedStaff.role,
        permissions: selectedStaff.permissions,
        phone: selectedStaff.phone,
        location: selectedStaff.location,
        status: selectedStaff.status
      }
    });
  };

  const handleDeleteStaff = () => {
    if (!selectedStaff) return;
    deleteStaffMutation.mutate(selectedStaff.id);
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    console.log('Real-time permission change:', { permissionId, checked, context: showAddDialog ? 'new staff' : 'edit staff' });
    if (showAddDialog) {
      setNewStaffData(prev => {
        const newPermissions = checked 
          ? [...prev.permissions, permissionId]
          : prev.permissions.filter(p => p !== permissionId);
        console.log('New staff permissions updated:', newPermissions);
        return { ...prev, permissions: newPermissions };
      });
    } else if (selectedStaff) {
      setSelectedStaff(prev => {
        if (!prev) return null;
        const newPermissions = checked
          ? [...(prev.permissions || []), permissionId]
          : (prev.permissions || []).filter(p => p !== permissionId);
        console.log('Selected staff permissions updated:', newPermissions);
        return { ...prev, permissions: newPermissions };
      });
    }
  };

  if (!user || (user.role !== 'admin' && 
      !(user.permissions && user.permissions.includes('users')) &&
      !user.role?.includes('Manager') &&
      !user.role?.includes('Coordinator'))) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl p-8">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-gray-400">Staff management requires admin access or user management permissions.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/50/80 backdrop-blur-xl border-b border-gray-700/50 p-6 mt-16"
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-5xl font-bold text-white mb-2 tracking-tight" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif', fontWeight: 700 }}>Staff Management</h1>
                <p className="text-lg text-gray-400">Manage MBYC staff users, roles, and permissions</p>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Staff Member
          </Button>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-4 mb-6"
        >
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search staff members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-900/50 border-gray-700/50 text-white"
              />
            </div>
          </div>
          
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-48 bg-gray-900/50 border-gray-700/50">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/50/60 transition-all duration-500 hover:border-purple-500/30">
              <SelectItem value="all">All Roles</SelectItem>
              {staffRoles.map(role => (
                <SelectItem key={role} value={role}>{role}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-gray-900/50 border-gray-700/50">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/50/60 transition-all duration-500 hover:border-purple-500/30">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Staff Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-400" />
                MBYC Staff Directory
              </CardTitle>
              <CardDescription className="text-gray-400">
                {filteredStaff.length} staff members found
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700/50">
                    <TableHead className="text-gray-300">Staff Member</TableHead>
                    <TableHead className="text-gray-300">Role</TableHead>
                    <TableHead className="text-gray-300">Permissions</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Created By</TableHead>
                    <TableHead className="text-gray-300">Last Login</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                        Loading staff members...
                      </TableCell>
                    </TableRow>
                  ) : filteredStaff.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                        No staff members found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStaff.map((staff) => (
                      <TableRow key={staff.id} className="border-gray-700/50 hover:bg-gray-900/50/30">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                                {staff.fullName ? staff.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : staff.username.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-white">{staff.fullName || staff.username}</div>
                              <div className="text-sm text-gray-400">{staff.email}</div>
                              <div className="text-xs text-gray-500">@{staff.username}</div>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getRoleIcon(staff.role)}
                            <span className="text-white text-sm">{staff.role}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(staff.permissions || []).slice(0, 3).map(permission => (
                              <Badge key={permission} variant="secondary" className="text-xs">
                                {availablePermissions.find(p => p.id === permission)?.name || permission}
                              </Badge>
                            ))}
                            {(staff.permissions || []).length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{(staff.permissions || []).length - 3} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge className={`text-xs ${getStatusColor(staff.status)}`}>
                            {staff.status}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <span className="text-gray-400 text-sm">
                            {staff.createdByName || 'System'}
                          </span>
                        </TableCell>
                        
                        <TableCell>
                          <span className="text-gray-400 text-sm">
                            {staff.lastLogin 
                              ? formatDistanceToNow(new Date(staff.lastLogin), { addSuffix: true })
                              : 'Never'
                            }
                          </span>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedStaff(staff);
                                setShowViewDialog(true);
                              }}
                              className="h-8 w-8 p-0 hover:bg-gray-700/50"
                              title="View Staff Details"
                            >
                              <Eye className="h-4 w-4 text-gray-400" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedStaff(staff);
                                setShowEditDialog(true);
                              }}
                              className="h-8 w-8 p-0 hover:bg-gray-700/50"
                            >
                              <Edit className="h-4 w-4 text-gray-400" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedStaff(staff);
                                setShowDeleteDialog(true);
                              }}
                              className="h-8 w-8 p-0 hover:bg-gray-700/50 text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Add Staff Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-gray-950 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
            <DialogDescription className="text-gray-400">
              Create a new MBYC staff account with specific roles and permissions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName" className="text-sm font-medium text-gray-300">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  value={newStaffData.fullName}
                  onChange={(e) => setNewStaffData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="bg-gray-900/50 border-gray-700/50 text-white"
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <Label htmlFor="username" className="text-sm font-medium text-gray-300">
                  Username
                </Label>
                <Input
                  id="username"
                  value={newStaffData.username}
                  onChange={(e) => setNewStaffData(prev => ({ ...prev, username: e.target.value }))}
                  className="bg-gray-900/50 border-gray-700/50 text-white"
                  placeholder="Enter username"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newStaffData.email}
                  onChange={(e) => setNewStaffData(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-gray-900/50 border-gray-700/50 text-white"
                  placeholder="Enter email"
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={newStaffData.password}
                  onChange={(e) => setNewStaffData(prev => ({ ...prev, password: e.target.value }))}
                  className="bg-gray-900/50 border-gray-700/50 text-white"
                  placeholder="Enter password"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department" className="text-sm font-medium text-gray-300">
                  Department
                </Label>
                <Input
                  id="department"
                  value={newStaffData.department}
                  onChange={(e) => setNewStaffData(prev => ({ ...prev, department: e.target.value }))}
                  className="bg-gray-900/50 border-gray-700/50 text-white"
                  placeholder="Enter department"
                />
              </div>
              
              <div>
                <Label htmlFor="role" className="text-sm font-medium text-gray-300">
                  Staff Role
                </Label>
                <Select value={newStaffData.role} onValueChange={(value) => setNewStaffData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger className="bg-gray-900/50 border-gray-700/50">
                    <SelectValue placeholder="Select staff role" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/50/60 transition-all duration-500 hover:border-purple-500/30">
                    {staffRoles.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-300">
                  Phone (Optional)
                </Label>
                <Input
                  id="phone"
                  value={newStaffData.phone}
                  onChange={(e) => setNewStaffData(prev => ({ ...prev, phone: e.target.value }))}
                  className="bg-gray-900/50 border-gray-700/50 text-white"
                  placeholder="Enter phone number"
                />
              </div>
              
              <div>
                <Label htmlFor="location" className="text-sm font-medium text-gray-300">
                  Location (Optional)
                </Label>
                <Input
                  id="location"
                  value={newStaffData.location}
                  onChange={(e) => setNewStaffData(prev => ({ ...prev, location: e.target.value }))}
                  className="bg-gray-900/50 border-gray-700/50 text-white"
                  placeholder="Enter location"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-300 mb-3 block">
                Permissions
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto bg-gray-900/50/30 p-4 rounded-lg border border-gray-700/50">
                {availablePermissions.map(permission => (
                  <div key={permission.id} className="flex items-start space-x-2">
                    <Checkbox
                      id={`new-${permission.id}`}
                      checked={newStaffData.permissions.includes(permission.id)}
                      onCheckedChange={(checked) => handlePermissionChange(permission.id, checked as boolean)}
                      className="mt-1"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor={`new-${permission.id}`}
                        className="text-sm font-medium text-white cursor-pointer"
                      >
                        {permission.name}
                      </Label>
                      <p className="text-xs text-gray-400">
                        {permission.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddStaff}
              disabled={addStaffMutation.isPending || !newStaffData.username || !newStaffData.email || !newStaffData.password || !newStaffData.role}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {addStaffMutation.isPending ? "Adding..." : "Add Staff Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-gray-950 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update staff role, permissions, and account details.
            </DialogDescription>
          </DialogHeader>
          
          {selectedStaff && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-300">
                    Username
                  </Label>
                  <Input
                    value={selectedStaff.username}
                    disabled
                    className="bg-gray-900/50/30 border-gray-700/50 text-gray-400"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-300">
                    Email
                  </Label>
                  <Input
                    value={selectedStaff.email}
                    disabled
                    className="bg-gray-900/50/30 border-gray-700/50 text-gray-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-role" className="text-sm font-medium text-gray-300">
                    Staff Role
                  </Label>
                  <Select 
                    value={selectedStaff.role} 
                    onValueChange={(value) => setSelectedStaff(prev => prev ? ({ ...prev, role: value }) : null)}
                  >
                    <SelectTrigger className="bg-gray-900/50 border-gray-700/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/50/60 transition-all duration-500 hover:border-purple-500/30">
                      {staffRoles.map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="edit-status" className="text-sm font-medium text-gray-300">
                    Status
                  </Label>
                  <Select 
                    value={selectedStaff.status} 
                    onValueChange={(value: 'active' | 'inactive' | 'suspended') => 
                      setSelectedStaff(prev => prev ? ({ ...prev, status: value }) : null)
                    }
                  >
                    <SelectTrigger className="bg-gray-900/50 border-gray-700/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/50/60 transition-all duration-500 hover:border-purple-500/30">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-phone" className="text-sm font-medium text-gray-300">
                    Phone
                  </Label>
                  <Input
                    id="edit-phone"
                    value={selectedStaff.phone || ""}
                    onChange={(e) => setSelectedStaff(prev => prev ? ({ ...prev, phone: e.target.value }) : null)}
                    className="bg-gray-900/50 border-gray-700/50 text-white"
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-location" className="text-sm font-medium text-gray-300">
                    Location
                  </Label>
                  <Input
                    id="edit-location"
                    value={selectedStaff.location || ""}
                    onChange={(e) => setSelectedStaff(prev => prev ? ({ ...prev, location: e.target.value }) : null)}
                    className="bg-gray-900/50 border-gray-700/50 text-white"
                    placeholder="Enter location"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-300 mb-3 block">
                  Permissions
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto bg-gray-900/50/30 p-4 rounded-lg border border-gray-700/50">
                  {availablePermissions.map(permission => (
                    <div key={permission.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={`edit-${permission.id}`}
                        checked={(selectedStaff.permissions || []).includes(permission.id)}
                        onCheckedChange={(checked) => handlePermissionChange(permission.id, checked as boolean)}
                        className="mt-1"
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor={`edit-${permission.id}`}
                          className="text-sm font-medium text-white cursor-pointer"
                        >
                          {permission.name}
                        </Label>
                        <p className="text-xs text-gray-400">
                          {permission.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateStaff}
              disabled={updateStaffMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {updateStaffMutation.isPending ? "Updating..." : "Update Staff Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Staff Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/50/60 transition-all duration-500 hover:border-purple-500/30 text-white">
          <DialogHeader>
            <DialogTitle>Delete Staff Member</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this staff member? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedStaff && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-red-500/20 text-red-400">
                    {selectedStaff.fullName ? selectedStaff.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : selectedStaff.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-white">{selectedStaff.fullName || selectedStaff.username}</div>
                  <div className="text-sm text-gray-400">{selectedStaff.email}</div>
                  <div className="text-sm text-gray-400">{selectedStaff.role}</div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteStaff}
              disabled={deleteStaffMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteStaffMutation.isPending ? "Deleting..." : "Delete Staff Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Staff Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="bg-gray-950 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Staff Member Details</DialogTitle>
            <DialogDescription className="text-gray-400">
              View complete information for this staff member.
            </DialogDescription>
          </DialogHeader>
          
          {selectedStaff && (
            <div className="space-y-6">
              {/* Profile Section */}
              <div className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-lg">
                    {selectedStaff.fullName ? selectedStaff.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : selectedStaff.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white">{selectedStaff.fullName || selectedStaff.username}</h3>
                  <p className="text-gray-400">@{selectedStaff.username}</p>
                  <Badge className={`mt-2 text-xs ${getStatusColor(selectedStaff.status)}`}>
                    {selectedStaff.status}
                  </Badge>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-300">Email</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-white">{selectedStaff.email}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-300">Phone</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-white">{selectedStaff.phone || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* Role and Location */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-300">Role</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                    {getRoleIcon(selectedStaff.role)}
                    <span className="text-white">{selectedStaff.role}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-300">Location</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                    <BadgeIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-white">{selectedStaff.location || 'Not specified'}</span>
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">Permissions</Label>
                <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
                  {(selectedStaff.permissions && selectedStaff.permissions.length > 0) ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedStaff.permissions.map(permission => (
                        <Badge key={permission} variant="secondary" className="text-xs">
                          <Key className="h-3 w-3 mr-1" />
                          {availablePermissions.find(p => p.id === permission)?.name || permission}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No specific permissions assigned</p>
                  )}
                </div>
              </div>

              {/* Account Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-300">Created By</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-white">{selectedStaff.createdByName || 'System'}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-300">Last Login</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-white">
                      {selectedStaff.lastLogin 
                        ? formatDistanceToNow(new Date(selectedStaff.lastLogin), { addSuffix: true })
                        : 'Never'
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">Account Created</Label>
                <div className="flex items-center gap-2 p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-white">
                    {formatDistanceToNow(new Date(selectedStaff.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}