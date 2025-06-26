import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import CalendarPage from "@/pages/calendar-page";
import MessengerDashboard from "@/pages/messenger-dashboard";
import CustomerServiceDashboard from "@/pages/customer-service-dashboard";
import StaffNotificationDropdown from "@/components/StaffNotificationDropdown";
import MessagesDropdown from "@/components/MessagesDropdown";
import { 
  BarChart3, 
  Users, 
  Anchor, 
  CalendarDays, 
  CreditCard, 
  Settings, 
  Shield,
  TrendingUp,
  UserCheck,
  Wallet,
  Activity,
  Bell,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  Sparkles,
  Crown,
  Zap,
  Calendar,
  Star,
  DollarSign,
  Clock,
  MapPin,
  Eye,
  Edit,
  Database,
  Save,
  RotateCcw,
  Trash2,
  LogOut,
  ExternalLink,
  Menu,
  X,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronDown,
  MessageSquare,
  Ship,
  BellRing,
  Dot,
  Wrench,
  User,
  Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MultiImageUpload } from "@/components/multi-image-upload";
import CrewManagementPage from "./crew-management";
import StaffManagement from "./staff-management";
import YachtMaintenancePage from "./yacht-maintenance";
import MyProfile from "./my-profile";
import { Overview3DIcon, Users3DIcon, Yacht3DIcon, Services3DIcon, Events3DIcon, Bookings3DIcon, Analytics3DIcon, Payments3DIcon } from '@/components/Animated3DAdminIcons';

interface AdminStats {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  activeServices: number;
  monthlyGrowth: number;
  membershipBreakdown: Array<{
    tier: string;
    count: number;
    percentage: number;
  }>;
}

const sidebarItems = [
  { id: 'overview', label: 'Overview', icon: BarChart3, color: 'from-purple-500 to-blue-500' },
  { id: 'bookings', label: 'Bookings', icon: Calendar, color: 'from-cyan-500 to-teal-500' },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays, color: 'from-indigo-500 to-purple-500' },
  { id: 'users', label: 'User Management', icon: Users, color: 'from-emerald-500 to-cyan-500' },
  { id: 'fleet', label: 'Fleet Management', icon: Anchor, color: 'from-blue-500 to-indigo-500' },
  { id: 'services', label: 'Service Management', icon: Settings, color: 'from-purple-500 to-pink-500' },
  { id: 'events', label: 'Event Management', icon: Zap, color: 'from-orange-500 to-red-500' },
  { id: 'payments', label: 'Payments', icon: CreditCard, color: 'from-green-500 to-emerald-500' },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'from-pink-500 to-purple-500' },
  { id: 'crew', label: 'Crew Management', icon: Ship, color: 'from-teal-500 to-blue-500' },
  { id: 'maintenance', label: 'Yacht Maintenance', icon: Wrench, color: 'from-yellow-500 to-orange-500' },
  { id: 'customer_service', label: 'Customer Service', icon: Phone, color: 'from-blue-500 to-cyan-500' },
  { id: 'staff_management', label: 'Staff Management', icon: Shield, color: 'from-purple-500 to-indigo-500' },
  { id: 'profile', label: 'Profile', icon: User, color: 'from-gray-500 to-gray-600' },
];

// Create User Dialog
function AddUserDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'member',
    fullName: '',
    membershipTier: 'bronze',
    phone: '',
    address: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createUserMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/admin/users", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "User created successfully" });
      setIsOpen(false);
      setFormData({ username: '', email: '', password: '', role: 'member', fullName: '', membershipTier: 'bronze', phone: '', address: '' });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
          <Users className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-950 border-gray-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Add New User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username" className="text-gray-300">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="bg-gray-900 border-gray-700 text-white"
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-gray-300">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="bg-gray-900 border-gray-700 text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role" className="text-gray-300">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="yacht_owner">Yacht Owner</SelectItem>
                  <SelectItem value="service_provider">Service Provider</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="membershipTier" className="text-gray-300">Membership Tier</Label>
              <Select value={formData.membershipTier} onValueChange={(value) => setFormData({...formData, membershipTier: value})}>
                <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="bronze">Bronze</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone" className="text-gray-300">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="address" className="text-gray-300">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={() => createUserMutation.mutate(formData)}
            disabled={createUserMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            {createUserMutation.isPending ? "Creating..." : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// View User Dialog
function ViewUserDialog({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-950 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">User Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-gray-300">Username</Label>
            <p className="text-white">{user.username}</p>
          </div>
          <div>
            <Label className="text-gray-300">Email</Label>
            <p className="text-white">{user.email}</p>
          </div>
          <div>
            <Label className="text-gray-300">Role</Label>
            <Badge>{user.role}</Badge>
          </div>
          <div>
            <Label className="text-gray-300">Membership Tier</Label>
            <Badge>{user.membershipTier}</Badge>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Edit User Dialog
function EditUserDialog({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: user.username || '',
    email: user.email || '',
    role: user.role || 'member',
    fullName: user.fullName || '',
    membershipTier: user.membershipTier || 'bronze',
    phone: user.phone || '',
    address: user.address || ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateUserMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/admin/users/${user.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "User updated successfully" });
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-gray-600 hover:border-purple-500">
          <Edit className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-950 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Edit User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username" className="text-gray-300">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="bg-gray-900 border-gray-700 text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role" className="text-gray-300">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="yacht_owner">Yacht Owner</SelectItem>
                  <SelectItem value="service_provider">Service Provider</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="membershipTier" className="text-gray-300">Membership Tier</Label>
              <Select value={formData.membershipTier} onValueChange={(value) => setFormData({...formData, membershipTier: value})}>
                <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="bronze">Bronze</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={() => updateUserMutation.mutate(formData)} 
            disabled={updateUserMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            {updateUserMutation.isPending ? "Updating..." : "Update User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Delete User Dialog
function DeleteUserDialog({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteUserMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/admin/users/${user.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "User deleted successfully" });
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-gray-600 hover:border-red-500">
          <Trash2 className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-950 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Delete User</DialogTitle>
          <DialogDescription className="text-gray-400">
            Are you sure you want to delete {user.username}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => deleteUserMutation.mutate()} 
            disabled={deleteUserMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Add Yacht Dialog
function AddYachtDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    size: '',
    capacity: '',
    description: '',
    imageUrl: '',
    images: [] as string[],
    pricePerHour: '',
    isAvailable: true,
    ownerId: '',
    amenities: '',
    yearMade: '',
    totalCost: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createYachtMutation = useMutation({
    mutationFn: async (data: any) => {
      const yachtData = {
        ...data,
        size: parseInt(data.size),
        capacity: parseInt(data.capacity),
        ownerId: data.ownerId && data.ownerId !== '' ? parseInt(data.ownerId) : undefined,
        amenities: data.amenities ? data.amenities.split(',').map((a: string) => a.trim()) : [],
        images: data.images || [],
        yearMade: data.yearMade && data.yearMade !== '' ? parseInt(data.yearMade) : undefined,
        totalCost: data.totalCost && data.totalCost !== '' ? parseFloat(data.totalCost) : undefined
      };
      const response = await apiRequest("POST", "/api/admin/yachts", yachtData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/yachts"] });
      toast({ title: "Success", description: "Yacht created successfully" });
      setIsOpen(false);
      setFormData({ name: '', location: '', size: '', capacity: '', description: '', imageUrl: '', images: [], pricePerHour: '', isAvailable: true, ownerId: '65', amenities: '', yearMade: '', totalCost: '' });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
          <Anchor className="h-4 w-4 mr-2" />
          Add Yacht
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-950 border-gray-700 max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Add New Yacht</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-gray-300">Yacht Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-gray-900 border-gray-700 text-white"
                placeholder="Enter yacht name"
              />
            </div>
            <div>
              <Label htmlFor="location" className="text-gray-300">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="bg-gray-900 border-gray-700 text-white"
                placeholder="Marina location"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="size" className="text-gray-300">Size (ft)</Label>
              <Input
                id="size"
                type="number"
                value={formData.size}
                onChange={(e) => setFormData({...formData, size: e.target.value})}
                className="bg-gray-900 border-gray-700 text-white"
                placeholder="40"
              />
            </div>
            <div>
              <Label htmlFor="capacity" className="text-gray-300">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                className="bg-gray-900 border-gray-700 text-white"
                placeholder="12"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description" className="text-gray-300">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-gray-900 border-gray-700 text-white"
              placeholder="Yacht description..."
            />
          </div>
          
          <div>
            <MultiImageUpload
              label="Yacht Gallery"
              onImagesUploaded={(images) => setFormData({...formData, images, imageUrl: images[0] || ''})}
              currentImages={formData.images || []}
              maxImages={10}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={() => createYachtMutation.mutate(formData)}
            disabled={createYachtMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            {createYachtMutation.isPending ? "Creating..." : "Create Yacht"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// View Yacht Dialog
function ViewYachtDialog({ yacht }: { yacht: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="text-emerald-400 hover:text-emerald-300">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-950 border-gray-700 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <Anchor className="h-5 w-5 mr-2 text-blue-500" />
            Yacht Details
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden">
              <img 
                src={yacht.imageUrl || '/api/media/pexels-mikebirdy-144634_1750537277230.jpg'}
                alt={yacht.name}
                className="w-full h-64 object-cover"
              />
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <Label className="text-gray-300 font-medium">Basic Information</Label>
              <div className="space-y-3 mt-2">
                <div>
                  <Label className="text-gray-400 text-sm">Yacht Name</Label>
                  <p className="text-xl font-bold text-white">{yacht.name}</p>
                </div>
                <div>
                  <Label className="text-gray-400 text-sm">Location</Label>
                  <p className="text-white">{yacht.location}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Edit Yacht Dialog
function EditYachtDialog({ yacht }: { yacht: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: yacht.name || '',
    location: yacht.location || '',
    size: yacht.size || 0,
    capacity: yacht.capacity || 0,
    description: yacht.description || '',
    imageUrl: yacht.imageUrl || '',
    images: yacht.images || [],
    isAvailable: yacht.isAvailable ?? true
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateYachtMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/admin/yachts/${yacht.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/yachts"] });
      toast({ title: "Success", description: "Yacht updated successfully" });
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-gray-600 hover:border-purple-500">
          <Edit className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-950 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Yacht</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-gray-300">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="bg-gray-900 border-gray-700 text-white"
            />
          </div>
          <div>
            <Label htmlFor="location" className="text-gray-300">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="bg-gray-900 border-gray-700 text-white"
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={() => updateYachtMutation.mutate(formData)} 
            disabled={updateYachtMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            {updateYachtMutation.isPending ? "Updating..." : "Update Yacht"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Delete Yacht Dialog
function DeleteYachtDialog({ yacht }: { yacht: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteYachtMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/admin/yachts/${yacht.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/yachts"] });
      toast({ title: "Success", description: "Yacht deleted successfully" });
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-gray-600 hover:border-red-500">
          <Trash2 className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-950 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Delete Yacht</DialogTitle>
          <DialogDescription className="text-gray-400">
            Are you sure you want to delete {yacht.name}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => deleteYachtMutation.mutate()} 
            disabled={deleteYachtMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteYachtMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Add Service Dialog
function AddServiceDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    pricePerSession: '',
    duration: '',
    providerId: '68',
    imageUrl: '',
    images: [] as string[],
    isAvailable: true
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createServiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const serviceData = {
        ...data,
        duration: data.duration ? parseInt(data.duration) : null,
        providerId: data.providerId && data.providerId !== '' ? parseInt(data.providerId) : undefined,
        imageUrl: data.images && data.images.length > 0 ? data.images[0] : null,
        images: data.images || []
      };
      const response = await apiRequest("POST", "/api/admin/services", serviceData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      toast({ title: "Success", description: "Service created successfully" });
      setIsOpen(false);
      setFormData({ name: '', category: '', description: '', pricePerSession: '', duration: '', providerId: '68', imageUrl: '', images: [], isAvailable: true });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
          <Settings className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-950 border-gray-700 max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-white">Add New Service</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-gray-300">Service Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-gray-900 border-gray-700 text-white"
                placeholder="Enter service name"
              />
            </div>
            <div>
              <Label htmlFor="category" className="text-gray-300">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="Beauty & Grooming">Beauty & Grooming</SelectItem>
                  <SelectItem value="Culinary">Culinary</SelectItem>
                  <SelectItem value="Wellness & Spa">Wellness & Spa</SelectItem>
                  <SelectItem value="Photography & Media">Photography & Media</SelectItem>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                  <SelectItem value="Water Sports">Water Sports</SelectItem>
                  <SelectItem value="Concierge & Lifestyle">Concierge & Lifestyle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="description" className="text-gray-300">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-gray-900 border-gray-700 text-white"
              placeholder="Service description..."
            />
          </div>
          
          <div>
            <MultiImageUpload 
              onImagesUploaded={(images) => setFormData({...formData, images})}
              currentImages={formData.images}
              label="Service Images"
              maxImages={10}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={() => createServiceMutation.mutate(formData)}
            disabled={createServiceMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            {createServiceMutation.isPending ? "Creating..." : "Create Service"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// View Service Dialog
function ViewServiceDialog({ service }: { service: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="text-emerald-400 hover:text-emerald-300">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-950 border-gray-700 max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-purple-500" />
            Service Details
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <Label className="text-gray-300">Service Name</Label>
            <p className="text-xl font-bold text-white">{service.name}</p>
          </div>
          <div>
            <Label className="text-gray-300">Category</Label>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              {service.category}
            </Badge>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Edit Service Dialog
function EditServiceDialog({ service }: { service: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: service.name || '',
    category: service.category || '',
    description: service.description || '',
    pricePerSession: service.pricePerSession || '',
    duration: service.duration || 0,
    images: service.imageUrl ? [service.imageUrl] : [],
    isAvailable: service.isAvailable ?? true
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateServiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const serviceData = {
        ...data,
        imageUrl: data.images && data.images.length > 0 ? data.images[0] : data.imageUrl,
        images: data.images || []
      };
      const response = await apiRequest("PUT", `/api/admin/services/${service.id}`, serviceData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      toast({ title: "Success", description: "Service updated successfully" });
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-gray-600 hover:border-purple-500">
          <Edit className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-950 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Service</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-gray-300">Service Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="bg-gray-900 border-gray-700 text-white"
            />
          </div>
          <div>
            <Label htmlFor="category" className="text-gray-300">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
              <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="Beauty & Grooming">Beauty & Grooming</SelectItem>
                <SelectItem value="Culinary">Culinary</SelectItem>
                <SelectItem value="Wellness & Spa">Wellness & Spa</SelectItem>
                <SelectItem value="Photography & Media">Photography & Media</SelectItem>
                <SelectItem value="Entertainment">Entertainment</SelectItem>
                <SelectItem value="Water Sports">Water Sports</SelectItem>
                <SelectItem value="Concierge & Lifestyle">Concierge & Lifestyle</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={() => updateServiceMutation.mutate(formData)} 
            disabled={updateServiceMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            {updateServiceMutation.isPending ? "Updating..." : "Update Service"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Delete Service Dialog
function DeleteServiceDialog({ service }: { service: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteServiceMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/admin/services/${service.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      toast({ title: "Success", description: "Service deleted successfully" });
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-gray-600 hover:border-red-500">
          <Trash2 className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-950 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Delete Service</DialogTitle>
          <DialogDescription className="text-gray-400">
            Are you sure you want to delete {service.name}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => deleteServiceMutation.mutate()} 
            disabled={deleteServiceMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteServiceMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function StaffPortal() {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [userFilters, setUserFilters] = useState({
    role: 'all',
    membershipTier: 'all',
    search: ''
  });
  const [yachtFilters, setYachtFilters] = useState({
    status: 'all',
    size: 'all',
    location: 'all',
    search: ''
  });
  const [serviceFilters, setServiceFilters] = useState({
    category: 'all',
    status: 'all',
    provider: 'all',
    search: ''
  });
  const [bookingFilters, setBookingFilters] = useState({
    status: 'all',
    type: 'all',
    timeframe: 'all',
    search: ''
  });
  const [eventFilters, setEventFilters] = useState({
    status: 'all',
    category: 'all',
    timeframe: 'all',
    search: ''
  });
  const [paymentFilters, setPaymentFilters] = useState({
    status: 'all',
    type: 'all',
    timeframe: 'all',
    search: ''
  });

  const { user, logout } = useAuth();
  const { toast } = useToast();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Fetch staff profile and stats
  const { data: staffProfile } = useQuery({
    queryKey: ["/api/staff/profile"],
    enabled: user?.role === 'staff'
  });

  const { data: adminStats } = useQuery({
    queryKey: ["/api/staff/stats"],
    enabled: user?.role === 'staff'
  });

  const { data: users } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: activeSection === 'users'
  });

  const { data: yachts } = useQuery({
    queryKey: ["/api/admin/yachts"],
    enabled: activeSection === 'fleet'
  });

  const { data: services } = useQuery({
    queryKey: ["/api/admin/services"],
    enabled: activeSection === 'services'
  });

  const { data: bookings } = useQuery({
    queryKey: ["/api/admin/bookings"],
    enabled: activeSection === 'bookings'
  });

  const { data: events } = useQuery({
    queryKey: ["/api/admin/events"],
    enabled: activeSection === 'events'
  });

  const { data: payments } = useQuery({
    queryKey: ["/api/admin/payments"],
    enabled: activeSection === 'payments'
  });

  const { data: analytics } = useQuery({
    queryKey: ["/api/admin/analytics"],
    enabled: activeSection === 'analytics'
  });

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((user: any) => {
      if (userFilters.role !== 'all' && user.role !== userFilters.role) return false;
      if (userFilters.membershipTier !== 'all' && user.membershipTier !== userFilters.membershipTier) return false;
      if (userFilters.search && !user.username.toLowerCase().includes(userFilters.search.toLowerCase()) && 
          !user.email.toLowerCase().includes(userFilters.search.toLowerCase())) return false;
      return true;
    });
  }, [users, userFilters]);

  const filteredYachts = useMemo(() => {
    if (!yachts) return [];
    return yachts.filter((yacht: any) => {
      if (yachtFilters.status !== 'all') {
        if (yachtFilters.status === 'available' && !yacht.isAvailable) return false;
        if (yachtFilters.status === 'unavailable' && yacht.isAvailable) return false;
      }
      if (yachtFilters.size !== 'all') {
        const size = parseInt(yacht.size);
        if (yachtFilters.size === 'small' && size > 50) return false;
        if (yachtFilters.size === 'medium' && (size <= 50 || size > 80)) return false;
        if (yachtFilters.size === 'large' && size <= 80) return false;
      }
      if (yachtFilters.location !== 'all' && yacht.location !== yachtFilters.location) return false;
      if (yachtFilters.search && !yacht.name.toLowerCase().includes(yachtFilters.search.toLowerCase())) return false;
      return true;
    });
  }, [yachts, yachtFilters]);

  const filteredServices = useMemo(() => {
    if (!services) return [];
    return services.filter((service: any) => {
      if (serviceFilters.category !== 'all' && service.category !== serviceFilters.category) return false;
      if (serviceFilters.status !== 'all') {
        if (serviceFilters.status === 'available' && !service.isAvailable) return false;
        if (serviceFilters.status === 'unavailable' && service.isAvailable) return false;
      }
      if (serviceFilters.search && !service.name.toLowerCase().includes(serviceFilters.search.toLowerCase())) return false;
      return true;
    });
  }, [services, serviceFilters]);

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    return bookings.filter((booking: any) => {
      if (bookingFilters.status !== 'all' && booking.status !== bookingFilters.status) return false;
      if (bookingFilters.type !== 'all' && booking.type !== bookingFilters.type) return false;
      if (bookingFilters.search && !booking.id.toString().includes(bookingFilters.search)) return false;
      return true;
    });
  }, [bookings, bookingFilters]);

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    return events.filter((event: any) => {
      if (eventFilters.status !== 'all' && event.status !== eventFilters.status) return false;
      if (eventFilters.search && !event.name.toLowerCase().includes(eventFilters.search.toLowerCase())) return false;
      return true;
    });
  }, [events, eventFilters]);

  const filteredPayments = useMemo(() => {
    if (!payments) return [];
    return payments.filter((payment: any) => {
      if (paymentFilters.status !== 'all' && payment.status !== paymentFilters.status) return false;
      if (paymentFilters.type !== 'all' && payment.type !== paymentFilters.type) return false;
      if (paymentFilters.search && !payment.id.toString().includes(paymentFilters.search)) return false;
      return true;
    });
  }, [payments, paymentFilters]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: "Success", description: "Logged out successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to logout", variant: "destructive" });
    }
  };

  const renderOverview = () => {
    if (!adminStats) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading dashboard data...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-5xl font-bold tracking-tight mb-2" style={{ fontFamily: '"SF Pro Display", system-ui, -apple-system, sans-serif' }}>
              Overview
            </h1>
            <p className="text-lg text-gray-400">
              Comprehensive analytics and system overview
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gray-900/50 border-gray-700/50 hover:bg-gray-900/70 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Users</p>
                    <p className="text-3xl font-bold text-white">{adminStats.totalUsers || 0}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                  <span className="text-green-400">+12%</span>
                  <span className="text-gray-400 ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Total Bookings Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gray-900/50 border-gray-700/50 hover:bg-gray-900/70 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Bookings</p>
                    <p className="text-3xl font-bold text-white">{adminStats.totalBookings || 0}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                  <span className="text-green-400">+8%</span>
                  <span className="text-gray-400 ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Total Revenue Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gray-900/50 border-gray-700/50 hover:bg-gray-900/70 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Revenue</p>
                    <p className="text-3xl font-bold text-white">${(adminStats.totalRevenue || 0).toLocaleString()}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                  <span className="text-green-400">+{adminStats.monthlyGrowth || 0}%</span>
                  <span className="text-gray-400 ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Active Services Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gray-900/50 border-gray-700/50 hover:bg-gray-900/70 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Active Services</p>
                    <p className="text-3xl font-bold text-white">{adminStats.activeServices || 0}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <Activity className="h-4 w-4 text-blue-400 mr-1" />
                  <span className="text-blue-400">Active</span>
                  <span className="text-gray-400 ml-1">all systems</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Membership Breakdown */}
        {adminStats.membershipBreakdown && adminStats.membershipBreakdown.length > 0 && (
          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Crown className="h-5 w-5 mr-2 text-yellow-500" />
                Membership Tier Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {adminStats.membershipBreakdown.map((tier: any, index: number) => (
                  <div key={tier.tier} className="text-center">
                    <div className="relative">
                      <div className="w-20 h-20 mx-auto rounded-full border-4 border-gray-700 flex items-center justify-center mb-2">
                        <span className="text-2xl font-bold text-white">{tier.count}</span>
                      </div>
                      <div 
                        className="absolute inset-0 rounded-full border-4 border-transparent"
                        style={{
                          background: `conic-gradient(${
                            tier.tier === 'platinum' ? '#e5e7eb' :
                            tier.tier === 'gold' ? '#fbbf24' :
                            tier.tier === 'silver' ? '#9ca3af' : '#8b5cf6'
                          } ${tier.percentage * 3.6}deg, transparent 0deg)`
                        }}
                      />
                    </div>
                    <h3 className="font-semibold text-white capitalize">{tier.tier}</h3>
                    <p className="text-sm text-gray-400">{tier.percentage}%</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="bg-gray-900/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-16 flex flex-col items-center justify-center"
                onClick={() => setActiveSection('users')}
              >
                <Users className="h-6 w-6 mb-1" />
                <span className="text-sm">Manage Users</span>
              </Button>
              <Button 
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-16 flex flex-col items-center justify-center"
                onClick={() => setActiveSection('fleet')}
              >
                <Anchor className="h-6 w-6 mb-1" />
                <span className="text-sm">Fleet Status</span>
              </Button>
              <Button 
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-16 flex flex-col items-center justify-center"
                onClick={() => setActiveSection('bookings')}
              >
                <Calendar className="h-6 w-6 mb-1" />
                <span className="text-sm">View Bookings</span>
              </Button>
              <Button 
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-16 flex flex-col items-center justify-center"
                onClick={() => setActiveSection('analytics')}
              >
                <TrendingUp className="h-6 w-6 mb-1" />
                <span className="text-sm">Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderUsers = () => {
    return (
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-5xl font-bold tracking-tight mb-2" style={{ fontFamily: '"SF Pro Display", system-ui, -apple-system, sans-serif' }}>
              User Management
            </h1>
            <p className="text-lg text-gray-400">
              Manage member accounts, roles, and permissions
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <AddUserDialog />
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-gray-900/50 border-gray-700/50">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-gray-300">Role</Label>
                <Select value={userFilters.role} onValueChange={(value) => setUserFilters(prev => ({...prev, role: value}))}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="member">Members</SelectItem>
                    <SelectItem value="yacht_owner">Yacht Owners</SelectItem>
                    <SelectItem value="service_provider">Service Providers</SelectItem>
                    <SelectItem value="admin">Administrators</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-300">Membership Tier</Label>
                <Select value={userFilters.membershipTier} onValueChange={(value) => setUserFilters(prev => ({...prev, membershipTier: value}))}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="bronze">Bronze</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-300">Search</Label>
                <Input
                  value={userFilters.search}
                  onChange={(e) => setUserFilters(prev => ({...prev, search: e.target.value}))}
                  placeholder="Search users..."
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={() => setUserFilters({ role: 'all', membershipTier: 'all', search: '' })}
                  variant="outline"
                  className="border-gray-600"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-gray-900/50 border-gray-700/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-700">
                  <tr>
                    <th className="text-left p-4 text-gray-300 font-medium">User</th>
                    <th className="text-left p-4 text-gray-300 font-medium">Role</th>
                    <th className="text-left p-4 text-gray-300 font-medium">Tier</th>
                    <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                    <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers && filteredUsers.length > 0 ? (
                    filteredUsers.map((user: any) => (
                      <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {user.username?.charAt(0).toUpperCase() || 'U'}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-white">{user.username}</div>
                              <div className="text-sm text-gray-400">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            {user.role}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={`
                            ${user.membershipTier === 'platinum' ? 'bg-gradient-to-r from-purple-600 to-blue-600' :
                              user.membershipTier === 'gold' ? 'bg-gradient-to-r from-purple-600 to-blue-600' :
                              user.membershipTier === 'silver' ? 'bg-gradient-to-r from-purple-600 to-blue-600' :
                              'bg-gradient-to-r from-purple-600 to-blue-600'}
                          `}>
                            {user.membershipTier || 'Bronze'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className="bg-gradient-to-r from-purple-600 to-blue-600">
                            Active
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <ViewUserDialog user={user} />
                            <EditUserDialog user={user} />
                            <DeleteUserDialog user={user} />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400">
                        No users found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderFleet = () => {
    return (
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-5xl font-bold tracking-tight mb-2" style={{ fontFamily: '"SF Pro Display", system-ui, -apple-system, sans-serif' }}>
              Fleet Management
            </h1>
            <p className="text-lg text-gray-400">
              Manage yacht fleet, availability, and specifications
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <AddYachtDialog />
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-gray-900/50 border-gray-700/50">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-gray-300">Status</Label>
                <Select value={yachtFilters.status} onValueChange={(value) => setYachtFilters(prev => ({...prev, status: value}))}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-300">Size</Label>
                <Select value={yachtFilters.size} onValueChange={(value) => setYachtFilters(prev => ({...prev, size: value}))}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">All Sizes</SelectItem>
                    <SelectItem value="small">Small (≤50ft)</SelectItem>
                    <SelectItem value="medium">Medium (51-80ft)</SelectItem>
                    <SelectItem value="large">Large (80ft+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-300">Search</Label>
                <Input
                  value={yachtFilters.search}
                  onChange={(e) => setYachtFilters(prev => ({...prev, search: e.target.value}))}
                  placeholder="Search yachts..."
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={() => setYachtFilters({ status: 'all', size: 'all', location: 'all', search: '' })}
                  variant="outline"
                  className="border-gray-600"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fleet Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredYachts && filteredYachts.length > 0 ? (
            filteredYachts.map((yacht: any, index: number) => (
              <motion.div
                key={yacht.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gray-900/50 border-gray-700/50 hover:bg-gray-900/70 transition-all group">
                  <CardContent className="p-0">
                    <div className="relative">
                      <img 
                        src={yacht.imageUrl || '/api/media/pexels-mikebirdy-144634_1750537277230.jpg'}
                        alt={yacht.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className={`${yacht.isAvailable ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gradient-to-r from-red-600 to-red-700'}`}>
                          {yacht.isAvailable ? 'Available' : 'Unavailable'}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white">{yacht.name}</h3>
                          <p className="text-gray-400 flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {yacht.location}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                          <p className="text-2xl font-bold text-white">{yacht.size}ft</p>
                          <p className="text-sm text-gray-400">Length</p>
                        </div>
                        <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                          <p className="text-2xl font-bold text-white">{yacht.capacity}</p>
                          <p className="text-sm text-gray-400">Guests</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <ViewYachtDialog yacht={yacht} />
                          <EditYachtDialog yacht={yacht} />
                          <DeleteYachtDialog yacht={yacht} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Anchor className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 text-center">
                No yachts match your current filter criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderServices = () => {
    return (
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-5xl font-bold tracking-tight mb-2" style={{ fontFamily: '"SF Pro Display", system-ui, -apple-system, sans-serif' }}>
              Service Management
            </h1>
            <p className="text-lg text-gray-400">
              Manage yacht concierge services and providers
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <AddServiceDialog />
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-gray-900/50 border-gray-700/50">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-gray-300">Category</Label>
                <Select value={serviceFilters.category} onValueChange={(value) => setServiceFilters(prev => ({...prev, category: value}))}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Beauty & Grooming">Beauty & Grooming</SelectItem>
                    <SelectItem value="Culinary">Culinary</SelectItem>
                    <SelectItem value="Wellness & Spa">Wellness & Spa</SelectItem>
                    <SelectItem value="Photography & Media">Photography & Media</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Water Sports">Water Sports</SelectItem>
                    <SelectItem value="Concierge & Lifestyle">Concierge & Lifestyle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-300">Status</Label>
                <Select value={serviceFilters.status} onValueChange={(value) => setServiceFilters(prev => ({...prev, status: value}))}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-300">Search</Label>
                <Input
                  value={serviceFilters.search}
                  onChange={(e) => setServiceFilters(prev => ({...prev, search: e.target.value}))}
                  placeholder="Search services..."
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={() => setServiceFilters({ category: 'all', status: 'all', provider: 'all', search: '' })}
                  variant="outline"
                  className="border-gray-600"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices && filteredServices.length > 0 ? (
            filteredServices.map((service: any, index: number) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gray-900/50 border-gray-700/50 hover:bg-gray-900/70 transition-all group">
                  <CardContent className="p-0">
                    <div className="relative">
                      <img 
                        src={service.imageUrl || '/api/media/pexels-goumbik-296278_1750537277229.jpg'} 
                        alt={service.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-gradient-to-r from-purple-600 to-blue-600">
                          {service.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white">{service.name}</h3>
                          <p className="text-white font-bold">${service.price || service.pricePerSession}</p>
                        </div>
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {service.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <ViewServiceDialog service={service} />
                          <EditServiceDialog service={service} />
                          <DeleteServiceDialog service={service} />
                        </div>
                        <Badge className="bg-gradient-to-r from-purple-600 to-blue-600">
                          Available
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Settings className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 text-center">
                No services match your current filter criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'users':
        return renderUsers();
      case 'fleet':
        return renderFleet();
      case 'services':
        return renderServices();
      case 'calendar':
        return <CalendarPage />;
      case 'crew':
        return <CrewManagementPage />;
      case 'maintenance':
        return <YachtMaintenancePage />;
      case 'customer_service':
        return <CustomerServiceDashboard />;
      case 'staff_management':
        return <StaffManagement />;
      case 'profile':
        return <MyProfile />;
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Fixed Hamburger Menu Button */}
      <AnimatePresence mode="wait">
        {sidebarCollapsed && (
          <motion.button
            key="hamburger"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            onClick={() => setSidebarCollapsed(false)}
            className="fixed top-6 left-6 z-[9999] p-3 bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-700/50 hover:bg-gray-800/80 transition-colors"
          >
            <Menu className="h-6 w-6 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Overlay */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setSidebarCollapsed(true)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.div
            ref={sidebarRef}
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed left-0 top-0 h-full w-80 bg-gray-950 border-r border-gray-800 z-50 overflow-y-auto"
          >
            {/* Animated X Button */}
            <motion.button
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              onClick={() => setSidebarCollapsed(true)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white transition-colors z-10"
            >
              <X className="h-6 w-6" />
            </motion.button>

            {/* Header */}
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <img 
                    src="/api/media/MBYC-LOGO-WHITE_1750687226929.png" 
                    alt="MBYC Logo" 
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-white truncate">Staff Portal</h2>
                  <p className="text-sm text-gray-400 truncate">Miami Beach Yacht Club</p>
                </div>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="p-4 space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarCollapsed(true);
                  }}
                  className={`admin-nav-button w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all text-left group ${
                    activeSection === item.id 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium truncate">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 bg-gray-950">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {staffProfile?.username?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'S'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {staffProfile?.username || user?.username || 'Staff'}
                    </p>
                    <p className="text-xs text-gray-400 truncate">Staff Member</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <StaffNotificationDropdown />
                  <MessagesDropdown />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-white p-2"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        animate={{
          marginLeft: sidebarCollapsed ? 0 : 0,
          width: sidebarCollapsed ? "100%" : "100%"
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="min-h-screen"
      >
        <div className="p-6 mt-16">
          {renderContent()}
        </div>
      </motion.div>
    </div>
  );
}