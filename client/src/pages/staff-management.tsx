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

  // Check if user has admin access or staff permissions for user management
  const hasStaffManagementAccess = user && (
    user.role === 'admin' || 
    user.permissions?.includes('users')
  );

  if (!hasStaffManagementAccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl p-8">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-gray-400">Insufficient permissions to access staff management.</p>
          </div>
        </Card>
      </div>
    );
  }

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isViewStaffDialogOpen, setIsViewStaffDialogOpen] = useState(false);
  const [isEditStaffDialogOpen, setIsEditStaffDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffUser | null>(null);
  const [newStaffData, setNewStaffData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    role: "",
    permissions: [] as string[],
    phone: "",
    location: ""
  });

  // Fetch staff users only (excluding members, yacht owners, service providers)
  const { data: staffUsers = [], isLoading: staffLoading } = useQuery<StaffUser[]>({
    queryKey: user?.role === 'admin' ? ['/api/admin/staff'] : ['/api/staff/users'],
    enabled: !!hasStaffManagementAccess,
  });

  // Add staff mutation
  const addStaffMutation = useMutation({
    mutationFn: async (staffData: typeof newStaffData) => {
      const endpoint = user?.role === 'admin' ? '/api/admin/staff' : '/api/staff/users';
      const response = await apiRequest('POST', endpoint, staffData);
      return response.json();
    },
    onSuccess: () => {
      const queryKey = user?.role === 'admin' ? ['/api/admin/staff'] : ['/api/staff/users'];
      queryClient.invalidateQueries({ queryKey });
      setShowAddDialog(false);
      setNewStaffData({
        fullName: "",
        username: "",
        email: "",
        password: "",
        role: "",
        permissions: [],
        phone: "",
        location: ""
      });
      toast({ title: "Staff added", description: "New staff member has been created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Update staff mutation
  const updateStaffMutation = useMutation({
    mutationFn: async (staffData: any) => {
      const endpoint = user?.role === 'admin' ? `/api/admin/staff/${staffData.id}` : `/api/staff/users/${staffData.id}`;
      return apiRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(staffData)
      });
    },
    onSuccess: () => {
      const queryKey = user?.role === 'admin' ? ['/api/admin/staff'] : ['/api/staff/users'];
      queryClient.invalidateQueries({ queryKey });
      setIsEditStaffDialogOpen(false);
      setSelectedStaff(null);
      toast({ title: "Staff updated", description: "Staff member has been updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Delete staff mutation
  const deleteStaffMutation = useMutation({
    mutationFn: async (id: number) => {
      const endpoint = user?.role === 'admin' ? `/api/admin/staff/${id}` : `/api/staff/users/${id}`;
      return apiRequest(endpoint, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      const queryKey = user?.role === 'admin' ? ['/api/admin/staff'] : ['/api/staff/users'];
      queryClient.invalidateQueries({ queryKey });
      setSelectedStaff(null);
      toast({ title: "Staff deleted", description: "Staff member has been removed successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
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
    if (showAddDialog) {
      setNewStaffData(prev => ({
        ...prev,
        permissions: checked 
          ? [...prev.permissions, permissionId]
          : prev.permissions.filter(p => p !== permissionId)
      }));
    } else if (selectedStaff) {
      setSelectedStaff(prev => prev ? ({
        ...prev,
        permissions: checked
          ? [...(prev.permissions || []), permissionId]
          : (prev.permissions || []).filter(p => p !== permissionId)
      }) : null);
    }
  };



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
                              size="sm" 
                              variant="ghost" 
                              className="text-gray-400 hover:text-white"
                              onClick={() => {
                                setSelectedStaff(staff);
                                setIsViewStaffDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-gray-400 hover:text-white"
                              onClick={() => {
                                setSelectedStaff(staff);
                                setIsEditStaffDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-gray-400 hover:text-red-400"
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete staff member ${staff.fullName || staff.username}?`)) {
                                  deleteStaffMutation.mutate(staff.id);
                                }
                              }}
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

      {/* Staff View Dialog */}
      <Dialog open={isViewStaffDialogOpen} onOpenChange={setIsViewStaffDialogOpen}>
        <DialogContent className="bg-gray-950 border-gray-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">Staff Member Details</DialogTitle>
          </DialogHeader>
          {selectedStaff && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Full Name</Label>
                  <p className="text-white font-medium">{selectedStaff.fullName || 'Not specified'}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Username</Label>
                  <p className="text-white font-medium">{selectedStaff.username}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Email</Label>
                  <p className="text-white font-medium">{selectedStaff.email}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Role</Label>
                  <p className="text-white font-medium">{selectedStaff.role}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Status</Label>
                  <Badge className={`${
                    selectedStaff.status === 'active' ? 'bg-green-600' :
                    selectedStaff.status === 'inactive' ? 'bg-gray-600' :
                    'bg-red-600'
                  }`}>
                    {selectedStaff.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-gray-300">Phone</Label>
                  <p className="text-white font-medium">{selectedStaff.phone || 'Not specified'}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-gray-300">Permissions</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(selectedStaff.permissions || []).map(permission => (
                      <Badge key={permission} variant="secondary" className="text-xs">
                        {availablePermissions.find(p => p.id === permission)?.name || permission}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Staff Edit Dialog */}
      <Dialog open={isEditStaffDialogOpen} onOpenChange={setIsEditStaffDialogOpen}>
        <DialogContent className="bg-gray-950 border-gray-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">Edit Staff Member</DialogTitle>
          </DialogHeader>
          {selectedStaff && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Full Name</Label>
                  <Input
                    value={selectedStaff.fullName || ''}
                    onChange={(e) => setSelectedStaff({...selectedStaff, fullName: e.target.value})}
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Phone</Label>
                  <Input
                    value={selectedStaff.phone || ''}
                    onChange={(e) => setSelectedStaff({...selectedStaff, phone: e.target.value})}
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Role</Label>
                  <Select 
                    value={selectedStaff.role} 
                    onValueChange={(value) => setSelectedStaff({...selectedStaff, role: value})}
                  >
                    <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      {staffRoles.map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-300">Status</Label>
                  <Select 
                    value={selectedStaff.status} 
                    onValueChange={(value) => setSelectedStaff({...selectedStaff, status: value})}
                  >
                    <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Permissions</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto bg-gray-900 p-3 rounded border border-gray-700">
                  {availablePermissions.map(permission => (
                    <label key={permission.id} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={(selectedStaff.permissions || []).includes(permission.id)}
                        onChange={(e) => {
                          const permissions = selectedStaff.permissions || [];
                          if (e.target.checked) {
                            setSelectedStaff({...selectedStaff, permissions: [...permissions, permission.id]});
                          } else {
                            setSelectedStaff({...selectedStaff, permissions: permissions.filter(p => p !== permission.id)});
                          }
                        }}
                        className="rounded border-gray-600"
                      />
                      <span className="text-white">{permission.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditStaffDialogOpen(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => updateStaffMutation.mutate(selectedStaff)}
                  disabled={updateStaffMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  {updateStaffMutation.isPending ? 'Updating...' : 'Update Staff'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
