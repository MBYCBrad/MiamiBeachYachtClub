import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
  LogOut
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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { MultiImageUpload } from "@/components/multi-image-upload";

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
  { id: 'users', label: 'Users', icon: Users, color: 'from-green-500 to-emerald-500' },
  { id: 'yachts', label: 'Fleet', icon: Anchor, color: 'from-blue-500 to-cyan-500' },
  { id: 'services', label: 'Services', icon: Sparkles, color: 'from-orange-500 to-red-500' },
  { id: 'events', label: 'Events', icon: CalendarDays, color: 'from-violet-500 to-purple-500' },
  { id: 'payments', label: 'Payments', icon: CreditCard, color: 'from-green-500 to-teal-500' },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'from-pink-500 to-rose-500' },
  { id: 'settings', label: 'Settings', icon: Settings, color: 'from-gray-500 to-slate-500' }
];

const StatCard = ({ title, value, change, icon: Icon, gradient, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
    whileHover={{ y: -5, scale: 1.02 }}
    className="group relative overflow-hidden"
  >
    <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-800/60 transition-all duration-500 hover:border-purple-500/30">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-white mt-2">{value}</p>
            {change !== null && (
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                <span className="text-green-400 text-sm">+{change}%</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
      
      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
    </Card>
  </motion.div>
);

const ActivityCard = ({ activity, index }: any) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.6 + index * 0.1 }}
    className="flex items-center space-x-4 p-4 rounded-xl bg-gray-800/30 hover:bg-gray-700/40 transition-all duration-300 group"
  >
    <div className={`p-2 rounded-lg bg-gradient-to-br ${activity.color} group-hover:scale-110 transition-transform`}>
      <activity.icon className="h-4 w-4 text-white" />
    </div>
    <div className="flex-1">
      <p className="text-white font-medium">{activity.title}</p>
      <p className="text-sm text-gray-400">{activity.description}</p>
    </div>
    <span className="text-xs text-gray-500">{activity.time}</span>
  </motion.div>
);

// Add User Dialog
function AddUserDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'member',
    membershipTier: 'bronze'
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
      setFormData({ username: '', email: '', password: '', role: 'member', membershipTier: 'bronze' });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600">
          <Users className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Add New User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="username" className="text-gray-300">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="Enter username"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="Enter email"
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-gray-300">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="Enter password"
            />
          </div>
          <div>
            <Label htmlFor="role" className="text-gray-300">Role</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
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
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="bronze">Bronze</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="platinum">Platinum</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={() => createUserMutation.mutate(formData)}
            disabled={createUserMutation.isPending}
            className="bg-gradient-to-r from-green-600 to-emerald-600"
          >
            {createUserMutation.isPending ? "Creating..." : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Edit User Component
function EditUserDialog({ user: userData }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: userData.username || '',
    email: userData.email || '',
    role: userData.role || '',
    membershipTier: userData.membershipTier || ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateUserMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/admin/users/${userData.id}`, data);
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
      <DialogContent className="bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Edit User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="username" className="text-gray-300">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <Input
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <Label htmlFor="role" className="text-gray-300">Role</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="yacht_owner">Yacht Owner</SelectItem>
                <SelectItem value="service_provider">Service Provider</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="tier" className="text-gray-300">Membership Tier</Label>
            <Select value={formData.membershipTier} onValueChange={(value) => setFormData({...formData, membershipTier: value})}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="Bronze">Bronze</SelectItem>
                <SelectItem value="Silver">Silver</SelectItem>
                <SelectItem value="Gold">Gold</SelectItem>
                <SelectItem value="Platinum">Platinum</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={() => updateUserMutation.mutate(formData)} 
            disabled={updateUserMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {updateUserMutation.isPending ? "Updating..." : "Update User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Delete User Component
function DeleteUserDialog({ user: userData }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteUserMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/admin/users/${userData.id}`);
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
      <DialogContent className="bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Delete User</DialogTitle>
          <DialogDescription className="text-gray-400">
            Are you sure you want to delete {userData.username}? This action cannot be undone.
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
    amenities: ''
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
        images: data.images || []
      };
      const response = await apiRequest("POST", "/api/admin/yachts", yachtData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/yachts"] });
      toast({ title: "Success", description: "Yacht created successfully" });
      setIsOpen(false);
      setFormData({ name: '', location: '', size: '', capacity: '', description: '', imageUrl: '', images: [], pricePerHour: '', isAvailable: true, ownerId: '65', amenities: '' });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600">
          <Anchor className="h-4 w-4 mr-2" />
          Add Yacht
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Add New Yacht</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name" className="text-gray-300">Yacht Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="Enter yacht name"
            />
          </div>
          <div>
            <Label htmlFor="location" className="text-gray-300">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="Marina location"
            />
          </div>
          <div>
            <Label htmlFor="size" className="text-gray-300">Size (ft)</Label>
            <Input
              id="size"
              type="number"
              value={formData.size}
              onChange={(e) => setFormData({...formData, size: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
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
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="12"
            />
          </div>
          <div>
            <Label htmlFor="pricePerHour" className="text-gray-300">Price per Hour</Label>
            <Input
              id="pricePerHour"
              value={formData.pricePerHour}
              onChange={(e) => setFormData({...formData, pricePerHour: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="500"
            />
          </div>
          <div>
            <Label htmlFor="ownerId" className="text-gray-300">Owner ID</Label>
            <Input
              id="ownerId"
              type="number"
              value={formData.ownerId}
              onChange={(e) => setFormData({...formData, ownerId: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="12"
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="description" className="text-gray-300">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="Yacht description..."
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="amenities" className="text-gray-300">Amenities (comma separated)</Label>
            <Input
              id="amenities"
              value={formData.amenities}
              onChange={(e) => setFormData({...formData, amenities: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="WiFi, Air Conditioning, Sound System"
            />
          </div>
          <div>
            <Label htmlFor="ownerId" className="text-gray-300">Owner</Label>
            <Select value={formData.ownerId} onValueChange={(value) => setFormData({...formData, ownerId: value})}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Select owner" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="60">MBYC Admin (You)</SelectItem>
                <SelectItem value="65">demo_owner</SelectItem>
                <SelectItem value="66">yacht_owner_1</SelectItem>
                <SelectItem value="67">yacht_owner_2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
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
            className="bg-gradient-to-r from-blue-600 to-cyan-600"
          >
            {createYachtMutation.isPending ? "Creating..." : "Create Yacht"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Edit Yacht Component
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
      <DialogContent className="bg-gray-900 border-gray-700 max-h-[90vh] overflow-y-auto">
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
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <Label htmlFor="location" className="text-gray-300">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="size" className="text-gray-300">Size (ft)</Label>
              <Input
                id="size"
                type="number"
                value={formData.size}
                onChange={(e) => setFormData({...formData, size: parseInt(e.target.value) || 0})}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="capacity" className="text-gray-300">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description" className="text-gray-300">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <MultiImageUpload
            onImagesUploaded={(images) => setFormData({...formData, images, imageUrl: images[0] || ''})}
            currentImages={formData.images}
            label="Yacht Gallery"
            maxImages={10}
          />
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isAvailable"
              checked={formData.isAvailable}
              onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
              className="rounded border-gray-600"
            />
            <Label htmlFor="isAvailable" className="text-gray-300">Available for booking</Label>
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={() => updateYachtMutation.mutate(formData)} 
            disabled={updateYachtMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700"
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
      <DialogContent className="bg-gray-900 border-gray-700">
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
      // Invalidate all service-related queries for real-time updates
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/service-provider"] });
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
        <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600">
          <Settings className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Add New Service</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name" className="text-gray-300">Service Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="Enter service name"
            />
          </div>
          <div>
            <Label htmlFor="category" className="text-gray-300">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
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
            <Label htmlFor="pricePerSession" className="text-gray-300">Price per Session</Label>
            <Input
              id="pricePerSession"
              value={formData.pricePerSession}
              onChange={(e) => setFormData({...formData, pricePerSession: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="150"
            />
          </div>
          <div>
            <Label htmlFor="duration" className="text-gray-300">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="60"
            />
          </div>
          <div>
            <Label htmlFor="providerId" className="text-gray-300">Service Provider</Label>
            <Select value={formData.providerId} onValueChange={(value) => setFormData({...formData, providerId: value})}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="60">MBYC Admin (You)</SelectItem>
                <SelectItem value="68">demo_provider</SelectItem>
                <SelectItem value="69">chef_service</SelectItem>
                <SelectItem value="70">spa_provider</SelectItem>
                <SelectItem value="71">security_provider</SelectItem>
                <SelectItem value="72">entertainment_provider</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label className="text-gray-300">Service Images</Label>
            <MultiImageUpload 
              onImagesUploaded={(images) => setFormData({...formData, images})}
              currentImages={formData.images}
              label="Service Images"
              maxImages={10}
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="description" className="text-gray-300">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="Service description..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={() => createServiceMutation.mutate(formData)}
            disabled={createServiceMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {createServiceMutation.isPending ? "Creating..." : "Create Service"}
          </Button>
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
      // Invalidate all service-related queries for real-time updates
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/service-provider"] });
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
      <DialogContent className="bg-gray-900 border-gray-700">
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
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <Label htmlFor="category" className="text-gray-300">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pricePerSession" className="text-gray-300">Price per Session</Label>
              <Input
                id="pricePerSession"
                value={formData.pricePerSession}
                onChange={(e) => setFormData({...formData, pricePerSession: e.target.value})}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="duration" className="text-gray-300">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 0})}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description" className="text-gray-300">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Service Images</Label>
            <MultiImageUpload
              currentImages={formData.images}
              onImagesUploaded={(images) => setFormData({...formData, images})}
              maxImages={10}
              label="Service Images"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isAvailable"
              checked={formData.isAvailable}
              onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
              className="rounded border-gray-600"
            />
            <Label htmlFor="isAvailable" className="text-gray-300">Available for booking</Label>
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={() => updateServiceMutation.mutate(formData)} 
            disabled={updateServiceMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700"
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
      // Invalidate all service-related queries for real-time updates
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/service-provider"] });
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
      <DialogContent className="bg-gray-900 border-gray-700">
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

// Add Event Dialog
function AddEventDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    capacity: '',
    ticketPrice: '',
    startTime: '',
    endTime: '',
    imageUrl: '',
    hostId: '',
    isActive: true
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createEventMutation = useMutation({
    mutationFn: async (data: any) => {
      const eventData = {
        ...data,
        capacity: parseInt(data.capacity),
        hostId: data.hostId ? parseInt(data.hostId) : null,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime)
      };
      const response = await apiRequest("POST", "/api/admin/events", eventData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
      toast({ title: "Success", description: "Event created successfully" });
      setIsOpen(false);
      setFormData({ title: '', description: '', location: '', capacity: '', ticketPrice: '', startTime: '', endTime: '', imageUrl: '', hostId: '', isActive: true });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-gradient-to-r from-orange-600 to-red-600">
          <Calendar className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Add New Event</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title" className="text-gray-300">Event Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="Enter event title"
            />
          </div>
          <div>
            <Label htmlFor="location" className="text-gray-300">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="Event location"
            />
          </div>
          <div>
            <Label htmlFor="capacity" className="text-gray-300">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({...formData, capacity: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="50"
            />
          </div>
          <div>
            <Label htmlFor="ticketPrice" className="text-gray-300">Ticket Price</Label>
            <Input
              id="ticketPrice"
              value={formData.ticketPrice}
              onChange={(e) => setFormData({...formData, ticketPrice: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="125"
            />
          </div>
          <div>
            <Label htmlFor="startTime" className="text-gray-300">Start Time</Label>
            <Input
              id="startTime"
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData({...formData, startTime: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <Label htmlFor="endTime" className="text-gray-300">End Time</Label>
            <Input
              id="endTime"
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => setFormData({...formData, endTime: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <Label htmlFor="hostId" className="text-gray-300">Host ID</Label>
            <Input
              id="hostId"
              type="number"
              value={formData.hostId}
              onChange={(e) => setFormData({...formData, hostId: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="5"
            />
          </div>
          <div>
            <Label htmlFor="imageUrl" className="text-gray-300">Image URL</Label>
            <Input
              id="imageUrl"
              value={formData.imageUrl}
              onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="/api/media/event-image.jpg"
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="description" className="text-gray-300">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="Event description..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={() => createEventMutation.mutate(formData)}
            disabled={createEventMutation.isPending}
            className="bg-gradient-to-r from-orange-600 to-red-600"
          >
            {createEventMutation.isPending ? "Creating..." : "Create Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Edit Event Dialog
function EditEventDialog({ event }: { event: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: event.title || '',
    description: event.description || '',
    location: event.location || '',
    capacity: event.capacity || 0,
    ticketPrice: event.ticketPrice || '',
    startTime: event.startTime ? new Date(event.startTime).toISOString().slice(0, 16) : '',
    endTime: event.endTime ? new Date(event.endTime).toISOString().slice(0, 16) : '',
    images: event.imageUrl ? [event.imageUrl] : [],
    isActive: event.isActive ?? true
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateEventMutation = useMutation({
    mutationFn: async (data: any) => {
      const eventData = {
        ...data,
        capacity: parseInt(data.capacity) || 0,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        imageUrl: data.images && data.images.length > 0 ? data.images[0] : data.imageUrl,
        images: data.images || []
      };
      const response = await apiRequest("PUT", `/api/admin/events/${event.id}`, eventData);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all event-related queries for real-time updates
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: "Success", description: "Event updated successfully" });
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
      <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Event</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title" className="text-gray-300">Event Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <Label htmlFor="location" className="text-gray-300">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <Label htmlFor="capacity" className="text-gray-300">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <Label htmlFor="ticketPrice" className="text-gray-300">Ticket Price</Label>
            <Input
              id="ticketPrice"
              value={formData.ticketPrice}
              onChange={(e) => setFormData({...formData, ticketPrice: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <Label htmlFor="startTime" className="text-gray-300">Start Time</Label>
            <Input
              id="startTime"
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData({...formData, startTime: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <Label htmlFor="endTime" className="text-gray-300">End Time</Label>
            <Input
              id="endTime"
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => setFormData({...formData, endTime: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="description" className="text-gray-300">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label className="text-gray-300">Event Images</Label>
            <MultiImageUpload
              currentImages={formData.images}
              onImagesUploaded={(images) => setFormData({...formData, images})}
              maxImages={10}
              label="Event Images"
            />
          </div>
          <div className="col-span-2 flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              className="rounded border-gray-600"
            />
            <Label htmlFor="isActive" className="text-gray-300">Event is active</Label>
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={() => updateEventMutation.mutate(formData)} 
            disabled={updateEventMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {updateEventMutation.isPending ? "Updating..." : "Update Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Delete Event Dialog
function DeleteEventDialog({ event }: { event: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteEventMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/admin/events/${event.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
      toast({ title: "Success", description: "Event deleted successfully" });
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
      <DialogContent className="bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Delete Event</DialogTitle>
          <DialogDescription className="text-gray-400">
            Are you sure you want to delete {event.title}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => deleteEventMutation.mutate()} 
            disabled={deleteEventMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteEventMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const { user, logoutMutation } = useAuth();

  const { data: stats } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
  });

  const { data: users = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/users'],
  });

  const { data: yachts = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/yachts'],
  });

  const { data: services = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/services'],
  });

  const { data: events = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/events'],
  });

  const { data: payments = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/payments'],
  });

  const renderOverview = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-2"
          >
            Admin Overview
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Monaco Bay Yacht Club Management Dashboard
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-purple-600/30">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
          <Button variant="outline" size="sm" className="border-gray-600 hover:border-purple-500">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Members"
          value={stats?.totalUsers || '0'}
          change={stats?.monthlyGrowth || 0}
          icon={Users}
          gradient="from-purple-500 to-pink-500"
          delay={0}
        />
        <StatCard
          title="Active Bookings"
          value={stats?.totalBookings || '0'}
          change={15}
          icon={Anchor}
          gradient="from-blue-500 to-cyan-500"
          delay={0.1}
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${(stats?.totalRevenue || 0).toLocaleString()}`}
          change={23}
          icon={CreditCard}
          gradient="from-green-500 to-emerald-500"
          delay={0.2}
        />
        <StatCard
          title="Active Services"
          value={stats?.activeServices || '0'}
          change={8}
          icon={Sparkles}
          gradient="from-orange-500 to-red-500"
          delay={0.3}
        />
      </div>

      {/* Membership Tiers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Crown className="h-5 w-5 mr-2 text-yellow-500" />
              Membership Distribution
            </CardTitle>
            <CardDescription>Current membership tier breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats?.membershipBreakdown?.map((tier, index) => (
                <motion.div
                  key={tier.tier}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="text-center p-4 rounded-xl bg-gray-800/30 hover:bg-gray-700/40 transition-all duration-300 group cursor-pointer"
                >
                  <div className={`text-2xl font-bold mb-2 ${
                    tier.tier === 'Platinum' ? 'text-purple-400' :
                    tier.tier === 'Gold' ? 'text-yellow-400' :
                    tier.tier === 'Silver' ? 'text-gray-300' : 'text-orange-400'
                  }`}>
                    {tier.count}
                  </div>
                  <div className="text-sm text-gray-400 mb-1">{tier.tier}</div>
                  <div className="text-xs text-gray-500">{tier.percentage}%</div>
                </motion.div>
              )) || [
                { tier: 'Platinum', count: 8, percentage: 15 },
                { tier: 'Gold', count: 12, percentage: 23 },
                { tier: 'Silver', count: 18, percentage: 35 },
                { tier: 'Bronze', count: 14, percentage: 27 }
              ].map((tier, index) => (
                <motion.div
                  key={tier.tier}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="text-center p-4 rounded-xl bg-gray-800/30 hover:bg-gray-700/40 transition-all duration-300 group cursor-pointer"
                >
                  <div className={`text-2xl font-bold mb-2 ${
                    tier.tier === 'Platinum' ? 'text-purple-400' :
                    tier.tier === 'Gold' ? 'text-yellow-400' :
                    tier.tier === 'Silver' ? 'text-gray-300' : 'text-orange-400'
                  }`}>
                    {tier.count}
                  </div>
                  <div className="text-sm text-gray-400 mb-1">{tier.tier}</div>
                  <div className="text-xs text-gray-500">{tier.percentage}%</div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Activity className="h-5 w-5 mr-2 text-purple-500" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest system events and user actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { icon: Users, title: 'New member registered', description: 'Gold tier membership - Marina Elite', time: '2 min ago', color: 'from-green-500 to-emerald-500' },
                { icon: Anchor, title: 'Yacht booking confirmed', description: 'Ocean Paradise booked for Dec 25-27', time: '15 min ago', color: 'from-blue-500 to-cyan-500' },
                { icon: CreditCard, title: 'Payment processed', description: '$2,850 yacht charter payment', time: '32 min ago', color: 'from-green-500 to-teal-500' },
                { icon: Sparkles, title: 'Service booking', description: 'Executive Chef service requested', time: '1 hour ago', color: 'from-orange-500 to-red-500' },
                { icon: CalendarDays, title: 'Event registration', description: 'New Year Gala - 3 new attendees', time: '2 hours ago', color: 'from-violet-500 to-purple-500' }
              ].map((activity, index) => (
                <ActivityCard key={index} activity={activity} index={index} />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderAnalytics = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-2"
          >
            Advanced Analytics
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Deep insights into club performance and optimization opportunities
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
          <Button variant="outline" size="sm" className="border-gray-600 hover:border-purple-500">
            <Filter className="h-4 w-4 mr-2" />
            Time Period
          </Button>
        </motion.div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Revenue Growth"
          value="+28%"
          change={28}
          icon={TrendingUp}
          gradient="from-green-500 to-emerald-500"
          delay={0}
        />
        <StatCard
          title="Member Satisfaction"
          value="4.8/5"
          change={12}
          icon={Star}
          gradient="from-yellow-500 to-orange-500"
          delay={0.1}
        />
        <StatCard
          title="Fleet Utilization"
          value="82%"
          change={15}
          icon={Activity}
          gradient="from-blue-500 to-cyan-500"
          delay={0.2}
        />
        <StatCard
          title="Conversion Rate"
          value="67%"
          change={8}
          icon={Users}
          gradient="from-purple-500 to-pink-500"
          delay={0.3}
        />
      </div>

      {/* Analytics Dashboard */}
      <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-purple-500" />
            Performance Analytics
          </CardTitle>
          <CardDescription>Comprehensive club performance metrics and insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-20">
            <BarChart3 className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Advanced Analytics Dashboard</h3>
            <p className="text-gray-400">Real-time analytics with AI-powered insights and recommendations</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderUsers = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-2"
          >
            User Management
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Manage member accounts, permissions, and memberships
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          <AddUserDialog />
          <Button variant="outline" size="sm" className="border-gray-600 hover:border-purple-500">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </motion.div>
      </div>

      {/* Users Table */}
      <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Users className="h-5 w-5 mr-2 text-purple-500" />
            Member Directory
          </CardTitle>
          <CardDescription>All registered yacht club members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Member</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Tier</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Role</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Joined</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((user: any, index: number) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                            {user.username?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white font-medium">{user.username}</p>
                          <p className="text-sm text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={`${
                        user.membershipTier === 'PLATINUM' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                        user.membershipTier === 'GOLD' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        user.membershipTier === 'SILVER' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' :
                        'bg-orange-500/20 text-orange-400 border-orange-500/30'
                      }`}>
                        {user.membershipTier}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-300 capitalize">{user.role?.replace('_', ' ')}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <EditUserDialog user={user} />
                        <DeleteUserDialog user={user} />
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderYachts = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-2"
          >
            Fleet Management
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Manage yacht fleet, availability, and specifications
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          <AddYachtDialog />
          <Button variant="outline" size="sm" className="border-gray-600 hover:border-blue-500">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </motion.div>
      </div>

      {/* Yachts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {yachts?.map((yacht: any, index: number) => (
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
                  src={yacht.imageUrl || '/api/media/pexels-mikebirdy-144634_1750537277230.jpg'}
                  alt={yacht.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4">
                  <Badge className={`${yacht.isAvailable ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                    {yacht.isAvailable ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{yacht.name}</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-400">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="text-sm">{yacht.location}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="text-sm">Size: {yacht.size}ft</span>
                    <span className="text-sm">Capacity: {yacht.capacity}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-400 font-semibold">${yacht.pricePerHour || '0'}/hour</span>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <EditYachtDialog yacht={yacht} />
                    <DeleteYachtDialog yacht={yacht} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const renderServices = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-2"
          >
            Service Management
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Manage yacht concierge services and providers
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          <AddServiceDialog />
          <Button variant="outline" size="sm" className="border-gray-600 hover:border-orange-500">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </motion.div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services?.map((service: any, index: number) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:border-orange-500/50 transition-all duration-300 overflow-hidden group">
              <div className="relative">
                {service.images && service.images.length > 1 ? (
                  <div className="relative h-48 bg-gray-800">
                    <img 
                      src={service.images[0] || service.imageUrl || '/api/media/pexels-pixabay-163236_1750537277230.jpg'}
                      alt={service.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2 right-2 flex space-x-1">
                      {service.images.slice(0, 4).map((img: string, idx: number) => (
                        <div key={idx} className="relative">
                          <img 
                            src={img}
                            alt={`${service.name} ${idx + 1}`}
                            className="w-8 h-8 object-cover rounded border border-white/20"
                          />
                          {idx === 3 && service.images.length > 4 && (
                            <div className="absolute inset-0 bg-black/60 rounded flex items-center justify-center">
                              <span className="text-white text-xs font-medium">+{service.images.length - 4}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <img 
                    src={service.imageUrl || (service.images && service.images[0]) || '/api/media/pexels-pixabay-163236_1750537277230.jpg'}
                    alt={service.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute top-4 right-4">
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                    {service.category}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{service.name}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{service.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-orange-400 font-semibold">${service.pricePerSession}</span>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <EditServiceDialog service={service} />
                    <DeleteServiceDialog service={service} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const renderEvents = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-2"
          >
            Event Management
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Manage yacht club events and member experiences
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          <AddEventDialog />
          <Button variant="outline" size="sm" className="border-gray-600 hover:border-violet-500">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </motion.div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events?.map((event: any, index: number) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:border-violet-500/50 transition-all duration-300 overflow-hidden group">
              <div className="relative">
                <img 
                  src={event.imageUrl || '/api/media/pexels-pixabay-163236_1750537277230.jpg'}
                  alt={event.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">
                    {event.capacity} spots
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{event.description}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-400">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="text-sm">{new Date(event.eventDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="text-sm">{event.startTime} - {event.endTime}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-violet-400 font-semibold">${event.ticketPrice || '0'}</span>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <EditEventDialog event={event} />
                    <DeleteEventDialog event={event} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const renderPayments = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-2"
          >
            Payment Management
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Track transactions, revenue, and payment analytics
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          <Button size="sm" className="bg-gradient-to-r from-green-600 to-teal-600">
            <DollarSign className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" size="sm" className="border-gray-600 hover:border-green-500">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </motion.div>
      </div>

      {/* Payments Table */}
      <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-green-500" />
            Recent Transactions
          </CardTitle>
          <CardDescription>Latest payment activity and revenue tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Transaction ID</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Customer</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Service</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments?.map((payment: any, index: number) => (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <span className="text-gray-300 font-mono text-sm">{payment.stripePaymentIntentId || `TXN-${payment.id}`}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-white">{payment.customerName || payment.user?.username || 'Unknown'}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-400">{payment.description || 'Yacht Service'}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-green-400 font-semibold">${(payment.amount / 100).toFixed(2)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-400">{new Date(payment.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={`${
                        payment.status === 'succeeded' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        payment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}>
                        {payment.status}
                      </Badge>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderSettings = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-2"
          >
            System Settings
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Configure system preferences and operational parameters
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
          <Button variant="outline" size="sm" className="border-gray-600 hover:border-purple-500">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </motion.div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Shield className="h-5 w-5 mr-2 text-purple-500" />
              Security Settings
            </CardTitle>
            <CardDescription>Authentication and access control</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-800/30">
              <div>
                <p className="text-white font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-gray-400">Enhanced security for admin access</p>
              </div>
              <div className="w-12 h-6 bg-purple-500 rounded-full p-1">
                <div className="w-4 h-4 bg-white rounded-full ml-auto" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-800/30">
              <div>
                <p className="text-white font-medium">Session Timeout</p>
                <p className="text-sm text-gray-400">Auto-logout after inactivity</p>
              </div>
              <select className="bg-gray-700 text-white rounded-lg px-3 py-1 border border-gray-600">
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>2 hours</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Database className="h-5 w-5 mr-2 text-purple-500" />
              System Management
            </CardTitle>
            <CardDescription>Backup and maintenance settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-gray-800/30">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white font-medium">Database Backup</p>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
              </div>
              <p className="text-sm text-gray-400 mb-2">Last backup: 2 hours ago</p>
              <Button size="sm" variant="outline" className="border-gray-600 hover:border-purple-500">
                Create Backup Now
              </Button>
            </div>
            <div className="p-4 rounded-xl bg-gray-800/30">
              <p className="text-white font-medium mb-2">Maintenance Mode</p>
              <p className="text-sm text-gray-400 mb-3">Temporarily disable user access</p>
              <Button size="sm" variant="destructive" className="bg-red-600 hover:bg-red-700">
                Enable Maintenance Mode
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 30 }}
          className="w-80 bg-gray-900/50 backdrop-blur-xl border-r border-gray-700/50 flex flex-col relative flex-shrink-0"
        >
          {/* Logo */}
          <div className="p-6 border-b border-gray-700/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-3"
            >
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Admin Panel</h2>
                <p className="text-sm text-gray-400">Monaco Bay YC</p>
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
                className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="px-6 pb-6">
            <div className="space-y-2">
              {sidebarItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                      isActive 
                        ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 text-white shadow-lg' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Active background gradient */}
                    {isActive && (
                      <motion.div
                        layoutId="activeBackground"
                        className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-10 rounded-xl`}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    
                    <div className={`p-2 rounded-lg ${isActive ? `bg-gradient-to-br ${item.color}` : 'bg-gray-700/50 group-hover:bg-gray-600/50'} transition-all duration-300`}>
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

          {/* User Profile */}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700/50">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12 ring-2 ring-purple-500/30">
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-semibold">
                  A
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Admin User</p>
                <p className="text-xs text-gray-400">System Administrator</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-white"
                onClick={() => logoutMutation.mutate()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {activeSection === 'overview' && renderOverview()}
            {activeSection === 'analytics' && renderAnalytics()}
            {activeSection === 'settings' && renderSettings()}
            {activeSection === 'users' && renderUsers()}
            {activeSection === 'yachts' && renderYachts()}
            {activeSection === 'services' && renderServices()}
            {activeSection === 'events' && renderEvents()}
            {activeSection === 'payments' && renderPayments()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}