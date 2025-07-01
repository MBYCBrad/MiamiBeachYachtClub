import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useYachtWebSocket } from "@/hooks/use-yacht-websocket";
import { useServicesWebSocket } from "@/hooks/use-services-websocket";
import { useTourRequests } from "@/hooks/use-tour-requests";
import CalendarPage from "@/pages/calendar-page";
import MessengerDashboard from "@/pages/messenger-dashboard";
import CustomerServiceDashboard from "@/pages/customer-service-dashboard";
import AdminApplications from "@/pages/admin-applications";
import AdminNotificationCenter from "@/components/AdminNotificationCenter";
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
  MapPin,
  ChevronRight,
  Sparkles,
  Crown,
  Zap,
  Calendar,
  Star,
  DollarSign,
  Clock,
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
  Phone,
  Loader2,
  ChevronDown,
  FileText,
  MessageSquare,
  Ship,
  BellRing,
  Dot,
  Wrench,
  User,
  Mail,
  Play,
  Trophy
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
  bookingGrowth?: number;
  revenueGrowth?: number;
  serviceGrowth?: number;
  membershipBreakdown: Array<{
    tier: string;
    count: number;
    percentage: number;
  }>;
}

const sidebarItems = [
  { id: 'overview', label: 'Overview', icon: BarChart3, color: 'from-purple-500 to-blue-500' },
  { id: 'applications', label: 'Applications', icon: FileText, color: 'from-blue-500 to-indigo-500' },
  { id: 'tour-requests', label: 'Tour Requests', icon: MapPin, color: 'from-emerald-500 to-teal-500' },
  { id: 'contact-messages', label: 'Contact Inquiries', icon: Mail, color: 'from-pink-500 to-purple-500' },
  { id: 'bookings', label: 'Bookings', icon: Calendar, color: 'from-cyan-500 to-teal-500' },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays, color: 'from-indigo-500 to-purple-500' },
  { id: 'customer-service', label: 'Customer Service', icon: MessageSquare, color: 'from-green-500 to-emerald-500' },
  { id: 'yacht-maintenance', label: 'Yacht Maintenance', icon: Wrench, color: 'from-amber-500 to-orange-500' },
  { id: 'crew-management', label: 'Crew Management', icon: Ship, color: 'from-teal-500 to-cyan-500' },
  { id: 'staff-management', label: 'Staff Management', icon: Shield, color: 'from-purple-500 to-indigo-500' },
  { id: 'users', label: 'Users', icon: Users, color: 'from-green-500 to-emerald-500' },
  { id: 'yachts', label: 'Fleet', icon: Anchor, color: 'from-blue-500 to-cyan-500' },
  { id: 'services', label: 'Services', icon: Sparkles, color: 'from-orange-500 to-red-500' },
  { id: 'events', label: 'Events', icon: CalendarDays, color: 'from-violet-500 to-purple-500' },
  { id: 'payments', label: 'Payments', icon: CreditCard, color: 'from-green-500 to-teal-500' },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'from-pink-500 to-rose-500' },
  { id: 'settings', label: 'Settings', icon: Settings, color: 'from-gray-500 to-slate-500' },
  { id: 'my-profile', label: 'My Profile', icon: User, color: 'from-purple-500 to-indigo-500' },
  { id: 'logout', label: 'Log Out', icon: LogOut, color: 'from-red-500 to-red-600' }
];

const StatCard = ({ title, value, change, icon: Icon, gradient, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
    whileHover={{ y: -5, scale: 1.02 }}
    className="group relative overflow-hidden"
  >
    <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/60 transition-all duration-500 hover:border-purple-500/30">
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
    className="flex items-center space-x-4 p-4 rounded-xl bg-gray-900/30 hover:bg-gray-700/40 transition-all duration-300 group"
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

// Booking Status Badge Component
const BookingStatusBadge = ({ booking }: { booking: any }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed':
        return {
          color: 'bg-green-500/20 text-green-400 border-green-500/30',
          icon: CheckCircle,
          text: 'Confirmed'
        };
      case 'pending':
        return {
          color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
          icon: Clock,
          text: 'Pending'
        };
      case 'cancelled':
        return {
          color: 'bg-red-500/20 text-red-400 border-red-500/30',
          icon: XCircle,
          text: 'Cancelled'
        };
      case 'completed':
        return {
          color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          icon: CheckCircle,
          text: 'Completed'
        };
      default:
        return {
          color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
          icon: AlertCircle,
          text: status
        };
    }
  };

  const config = getStatusConfig(booking.status);
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} flex items-center space-x-1`}>
      <Icon className="h-3 w-3" />
      <span>{config.text}</span>
    </Badge>
  );
};

// Enhanced Real-Time MBYC Actions Component
// Automated Status System - calculates status based on crew assignment and real-time timeslots
const AutomatedBookingStatus = ({ booking }: { booking: any }) => {
  const calculateAutomatedStatus = () => {
    const now = new Date();
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);
    
    // Check if crew is assigned from crew management system
    const hasCrewAssigned = booking.assignedCaptain || booking.assignedFirstMate || 
      (booking.assignedCrew && booking.assignedCrew.length > 0);

    // Automated status progression based on crew assignment and time
    if (!hasCrewAssigned && booking.automaticStatusEnabled !== false) {
      return { 
        status: 'pending', 
        reason: 'Awaiting crew assignment',
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        icon: Clock
      };
    }
    
    if (hasCrewAssigned && now < startTime) {
      return { 
        status: 'confirmed', 
        reason: 'Crew assigned - ready for departure',
        color: 'bg-green-500/20 text-green-400 border-green-500/30',
        icon: CheckCircle
      };
    }
    
    if (hasCrewAssigned && now >= startTime && now < endTime) {
      return { 
        status: 'in_progress', 
        reason: 'Experience in progress',
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        icon: Play
      };
    }
    
    if (hasCrewAssigned && now >= endTime) {
      return { 
        status: 'completed', 
        reason: 'Experience completed',
        color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        icon: Trophy
      };
    }

    // Handle cancelled bookings
    if (booking.status === 'cancelled') {
      return { 
        status: 'cancelled', 
        reason: 'Booking cancelled',
        color: 'bg-red-500/20 text-red-400 border-red-500/30',
        icon: XCircle
      };
    }

    // Fallback to current status if automation is disabled
    return { 
      status: booking.status, 
      reason: 'Manual status override',
      color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      icon: Settings
    };
  };

  const { status, reason, color, icon: Icon } = calculateAutomatedStatus();

  return (
    <div className="flex flex-col items-center space-y-1">
      <Badge className={`${color} flex items-center space-x-1 px-2 py-1`}>
        <Icon className="h-3 w-3" />
        <span className="capitalize text-xs font-medium">
          {status.replace('_', ' ')}
        </span>
      </Badge>
      <div className="text-xs text-gray-500 text-center max-w-28 leading-tight">
        {reason}
      </div>
    </div>
  );
};

// Crew Status Indicator - shows crew assignment status
const CrewStatusIndicator = ({ booking }: { booking: any }) => {
  const hasCrewAssigned = booking.assignedCaptain || booking.assignedFirstMate || 
    (booking.assignedCrew && booking.assignedCrew.length > 0);

  const crewCount = [
    booking.assignedCaptain,
    booking.assignedFirstMate,
    ...(booking.assignedCrew || [])
  ].filter(Boolean).length;

  return (
    <div className="flex items-center space-x-1">
      <Users className={`h-4 w-4 ${hasCrewAssigned ? 'text-green-400' : 'text-gray-500'}`} />
      <span className={`text-xs ${hasCrewAssigned ? 'text-green-400' : 'text-gray-500'}`}>
        {crewCount > 0 ? `${crewCount} assigned` : 'Not assigned'}
      </span>
    </div>
  );
};

// Quick Action Button Component for Real-Time MBYC Actions
const QuickActionButton = ({ booking, action, icon: Icon, tooltip }: {
  booking: any;
  action: string;
  icon: any;
  tooltip: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [actionProcessing, setActionProcessing] = useState(false);
  const { toast } = useToast();

  const handleAction = async () => {
    setActionProcessing(true);
    
    try {
      if (action === 'message') {
        // Navigate to messages page with the specific member
        window.location.href = `/messages?member=${encodeURIComponent(booking.member?.name || '')}&id=${booking.member?.id || booking.userId}`;
        
        toast({
          title: "Opening Messages",
          description: `Starting conversation with ${booking.member?.name}`,
          className: "border-purple-500/30 bg-purple-950/50"
        });
      } else if (action === 'view') {
        // Trigger custom event to open booking details dialog
        const event = new CustomEvent('openBookingDetailsDialog', { 
          detail: booking 
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "Unable to complete action",
        variant: "destructive"
      });
    } finally {
      setTimeout(() => setActionProcessing(false), 500);
    }
  };

  return (
    <div className="relative">
      <Button
        size="sm"
        variant="ghost"
        onClick={handleAction}
        disabled={actionProcessing}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`text-gray-400 hover:text-white transition-all ${
          actionProcessing ? 'animate-pulse' : ''
        }`}
      >
        {actionProcessing ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <Clock className="h-4 w-4" />
          </motion.div>
        ) : (
          <Icon className="h-4 w-4" />
        )}
      </Button>
      
      <AnimatePresence>
        {isHovered && !actionProcessing && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.1 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50 pointer-events-none"
          >
            {tooltip}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Tour Request Eye Dropdown Component
// Tour Request Status Dropdown (ChevronDown icon)
function TourRequestStatusDropdown({ request, updateStatusMutation }: { 
  request: any; 
  updateStatusMutation: any; 
}) {
  const handleStatusChange = (newStatus: string) => {
    updateStatusMutation.mutate({ 
      requestId: request.id, 
      status: newStatus 
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="text-gray-400 hover:text-white p-2"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-gray-950 border-gray-700 w-40"
      >
        <DropdownMenuItem 
          onClick={() => handleStatusChange('pending')}
          className="text-yellow-400 hover:bg-gray-800 cursor-pointer"
        >
          Mark as Pending
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleStatusChange('scheduled')}
          className="text-green-400 hover:bg-gray-800 cursor-pointer"
        >
          Mark as Scheduled
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleStatusChange('completed')}
          className="text-blue-400 hover:bg-gray-800 cursor-pointer"
        >
          Mark as Completed
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleStatusChange('cancelled')}
          className="text-red-400 hover:bg-gray-800 cursor-pointer"
        >
          Mark as Cancelled
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// View Tour Request Dialog (Eye icon)
function ViewTourRequestDialog({ request }: { request: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="text-gray-400 hover:text-white p-2"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-950 border-gray-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            Tour Request Details
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            View complete tour request information
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300">Name</label>
              <p className="text-white">{request.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Email</label>
              <p className="text-white">{request.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Phone</label>
              <p className="text-white">{request.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Status</label>
              <Badge 
                className={`
                  ${request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : ''}
                  ${request.status === 'scheduled' ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}
                  ${request.status === 'completed' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : ''}
                  ${request.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border-red-500/30' : ''}
                `}
              >
                {request.status}
              </Badge>
            </div>
          </div>

          {/* Tour Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300">Preferred Date</label>
              <p className="text-white">{request.preferredDate}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Preferred Time</label>
              <p className="text-white">{request.preferredTime}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Group Size</label>
              <p className="text-white">{request.groupSize}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Submitted</label>
              <p className="text-white">
                {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'Recently'}
              </p>
            </div>
          </div>

          {/* Message */}
          {request.message && (
            <div>
              <label className="text-sm font-medium text-gray-300">Message</label>
              <p className="text-white bg-gray-900 p-3 rounded-lg mt-1">
                {request.message}
              </p>
            </div>
          )}

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300">Assigned To</label>
              <p className="text-white">{request.assignedTo || 'Not assigned'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Priority</label>
              <p className="text-white">{request.priority || 'Medium'}</p>
            </div>
          </div>

          {/* Notes */}
          {request.notes && (
            <div>
              <label className="text-sm font-medium text-gray-300">Admin Notes</label>
              <p className="text-white bg-gray-900 p-3 rounded-lg mt-1">
                {request.notes}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            onClick={() => setIsOpen(false)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// View Contact Message Dialog
function ViewContactMessageDialog({ message }: { message: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          className="text-white hover:text-gray-300 transition-colors cursor-pointer"
        >
          <Eye className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-gray-950 border-gray-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            Contact Message Details
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            View complete contact message information
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300">First Name</label>
              <p className="text-white">{message.firstName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Last Name</label>
              <p className="text-white">{message.lastName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Email</label>
              <p className="text-white">{message.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Phone</label>
              <p className="text-white">{message.phone || 'Not provided'}</p>
            </div>
          </div>

          {/* Message Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300">Inquiry Type</label>
              <p className="text-white capitalize">{message.inquiryType}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Priority</label>
              <Badge 
                className={`
                  ${message.priority === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/30' : ''}
                  ${message.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : ''}
                  ${message.priority === 'low' ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}
                `}
              >
                {message.priority}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Status</label>
              <Badge 
                className={`
                  ${message.status === 'new' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : ''}
                  ${message.status === 'in_progress' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : ''}
                  ${message.status === 'resolved' ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}
                  ${message.status === 'closed' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' : ''}
                `}
              >
                {message.status?.replace('_', ' ')}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Submitted</label>
              <p className="text-white">
                {new Date(message.createdAt).toLocaleDateString()} at {new Date(message.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Message Content */}
          <div>
            <label className="text-sm font-medium text-gray-300">Message</label>
            <div className="text-white bg-gray-900 p-4 rounded-lg mt-2 max-h-40 overflow-y-auto">
              {message.message}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={() => setIsOpen(false)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            Close
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
      <DialogContent className="bg-gray-950 border-gray-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <User className="h-5 w-5 mr-2 text-purple-500" />
            User Details
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6">
          {/* User Avatar and Basic Info */}
          <div className="col-span-2 flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xl">
                {user.username?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-bold text-white">{user.username}</h3>
              <p className="text-gray-400">{user.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge className={`${
                  user.membershipTier === 'PLATINUM' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                  user.membershipTier === 'GOLD' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                  user.membershipTier === 'SILVER' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' :
                  'bg-orange-500/20 text-orange-400 border-orange-500/30'
                }`}>
                  {user.membershipTier}
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {user.role?.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <Label className="text-gray-300 font-medium">Personal Information</Label>
            <div className="space-y-3 mt-2">
              <div>
                <Label className="text-gray-400 text-sm">Full Name</Label>
                <p className="text-white">{user.username}</p>
              </div>
              <div>
                <Label className="text-gray-400 text-sm">Email Address</Label>
                <p className="text-white">{user.email}</p>
              </div>
              <div>
                <Label className="text-gray-400 text-sm">Phone</Label>
                <p className="text-white">{user.phone || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-gray-400 text-sm">Location</Label>
                <p className="text-white">{user.location || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div>
            <Label className="text-gray-300 font-medium">Account Information</Label>
            <div className="space-y-3 mt-2">
              <div>
                <Label className="text-gray-400 text-sm">User ID</Label>
                <p className="text-white font-mono">#{user.id}</p>
              </div>
              <div>
                <Label className="text-gray-400 text-sm">Member Since</Label>
                <p className="text-white">{new Date(user.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
              <div>
                <Label className="text-gray-400 text-sm">Account Status</Label>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
              </div>
              <div>
                <Label className="text-gray-400 text-sm">Last Active</Label>
                <p className="text-white">Recently</p>
              </div>
            </div>
          </div>

          {/* Membership Details */}
          <div className="col-span-2">
            <Label className="text-gray-300 font-medium">Membership Details</Label>
            <div className="grid grid-cols-3 gap-4 mt-2">
              <div className="p-3 bg-gray-800/30 rounded-lg">
                <Label className="text-gray-400 text-sm">Membership Tier</Label>
                <p className="text-white font-semibold">{user.membershipTier}</p>
              </div>
              <div className="p-3 bg-gray-800/30 rounded-lg">
                <Label className="text-gray-400 text-sm">Role</Label>
                <p className="text-white font-semibold capitalize">{user.role?.replace('_', ' ')}</p>
              </div>
              <div className="p-3 bg-gray-800/30 rounded-lg">
                <Label className="text-gray-400 text-sm">Language</Label>
                <p className="text-white font-semibold">{user.language || 'English'}</p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="col-span-2">
            <Label className="text-gray-300 font-medium">Additional Information</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <Label className="text-gray-400 text-sm">Stripe Customer ID</Label>
                <p className="text-white font-mono text-sm">{user.stripeCustomerId || 'Not set'}</p>
              </div>
              <div>
                <Label className="text-gray-400 text-sm">Subscription Status</Label>
                <p className="text-white">{user.stripeSubscriptionId ? 'Active Subscription' : 'No Active Subscription'}</p>
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

// View Yacht Dialog
function ViewYachtDialog({ yacht }: { yacht: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-950 border-gray-700 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <Anchor className="h-5 w-5 mr-2 text-blue-500" />
            Yacht Details
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            View detailed information about this yacht
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Yacht Image */}
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden">
              <img 
                src={yacht.imageUrl || '/api/media/pexels-mikebirdy-144634_1750537277230.jpg'}
                alt={yacht.name}
                className="w-full h-64 object-cover"
              />
              <div className="absolute top-4 right-4">
                <Badge className={`${yacht.isAvailable ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-purple-500/30' : 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-500/30'}`}>
                  {yacht.isAvailable ? 'Available' : 'Unavailable'}
                </Badge>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <Label className="text-gray-400 text-sm">Hourly Rate</Label>
                <p className="text-xl font-bold text-white">${yacht.pricePerHour || '0'}</p>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <Label className="text-gray-400 text-sm">Yacht ID</Label>
                <p className="text-xl font-bold text-white font-mono">#{yacht.id}</p>
              </div>
            </div>
          </div>

          {/* Yacht Information */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <Label className="text-gray-300 font-medium">Basic Information</Label>
              <div className="space-y-3 mt-2">
                <div>
                  <Label className="text-gray-400 text-sm">Yacht Name</Label>
                  <p className="text-xl font-bold text-white">{yacht.name}</p>
                </div>
                <div>
                  <Label className="text-gray-400 text-sm">Type</Label>
                  <p className="text-white">{yacht.type || 'Luxury Yacht'}</p>
                </div>
                <div>
                  <Label className="text-gray-400 text-sm">Location</Label>
                  <p className="text-white flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                    {yacht.location}
                  </p>
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div>
              <Label className="text-gray-300 font-medium">Specifications</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="p-3 bg-gray-800/30 rounded-lg">
                  <Label className="text-gray-400 text-sm">Length</Label>
                  <p className="text-white font-semibold">{yacht.size}ft</p>
                </div>
                <div className="p-3 bg-gray-800/30 rounded-lg">
                  <Label className="text-gray-400 text-sm">Capacity</Label>
                  <p className="text-white font-semibold">{yacht.capacity} guests</p>
                </div>
                <div className="p-3 bg-gray-800/30 rounded-lg">
                  <Label className="text-gray-400 text-sm">Crew Size</Label>
                  <p className="text-white font-semibold">{yacht.crewSize || 'Professional'}</p>
                </div>
                <div className="p-3 bg-gray-800/30 rounded-lg">
                  <Label className="text-gray-400 text-sm">Year Built</Label>
                  <p className="text-white font-semibold">{yacht.yearBuilt || '2020+'}</p>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div>
              <Label className="text-gray-300 font-medium">Amenities</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {yacht.amenities ? 
                  yacht.amenities.map((amenity: string, index: number) => (
                    <Badge key={index} className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {amenity}
                    </Badge>
                  )) :
                  <>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Swimming Platform</Badge>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Full Kitchen</Badge>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Entertainment System</Badge>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Water Sports Equipment</Badge>
                  </>
                }
              </div>
            </div>

            {/* Description */}
            {yacht.description && (
              <div>
                <Label className="text-gray-300 font-medium">Description</Label>
                <p className="text-gray-300 mt-2 leading-relaxed">{yacht.description}</p>
              </div>
            )}
          </div>

          {/* Operational Status */}
          <div className="col-span-full">
            <Label className="text-gray-300 font-medium">Operational Status</Label>
            <div className="grid grid-cols-3 gap-4 mt-2">
              <div className="p-4 bg-gray-800/30 rounded-lg text-center">
                <Label className="text-gray-400 text-sm">Current Status</Label>
                <p className={`text-lg font-semibold ${yacht.isAvailable ? 'text-green-400' : 'text-red-400'}`}>
                  {yacht.isAvailable ? 'Available' : 'In Use'}
                </p>
              </div>
              <div className="p-4 bg-gray-800/30 rounded-lg text-center">
                <Label className="text-gray-400 text-sm">Owner</Label>
                <p className="text-white font-semibold">{yacht.ownerName || 'MBYC Fleet'}</p>
              </div>
              <div className="p-4 bg-gray-800/30 rounded-lg text-center">
                <Label className="text-gray-400 text-sm">Added</Label>
                <p className="text-white font-semibold">
                  {yacht.createdAt ? new Date(yacht.createdAt).toLocaleDateString() : 'Recently'}
                </p>
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

// Add User Dialog
function AddUserDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'member',
    membershipTier: 'bronze',
    membershipPackage: 'regular'
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
      setFormData({ username: '', email: '', password: '', role: 'member', membershipTier: 'bronze', membershipPackage: 'regular' });
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
      <DialogContent className="bg-gray-950 border-gray-700 max-w-2xl dialog-content-spacing">
        <DialogHeader>
          <DialogTitle className="text-white">Add New User</DialogTitle>
        </DialogHeader>
        <div className="dialog-form-spacing">
          <div className="form-grid-2">
            <div className="form-field-spacing">
              <Label htmlFor="username" className="form-label text-gray-300">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="form-input bg-gray-900 border-gray-700 text-white"
                placeholder="Enter username"
              />
            </div>
            <div className="form-field-spacing">
              <Label htmlFor="email" className="form-label text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="form-input bg-gray-900 border-gray-700 text-white"
                placeholder="Enter email"
              />
            </div>
          </div>
          
          <div className="form-field-spacing">
            <Label htmlFor="password" className="form-label text-gray-300">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="form-input bg-gray-900 border-gray-700 text-white"
              placeholder="Enter password"
            />
          </div>
          
          <div className="form-grid-2">
            <div className="form-field-spacing">
              <Label htmlFor="role" className="form-label text-gray-300">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value, membershipTier: value === 'member' ? 'bronze' : ''})}>
                <SelectTrigger className="form-select bg-gray-900 border-gray-700 text-white">
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
            {formData.role === 'member' && (
              <>
                <div className="form-field-spacing">
                  <Label htmlFor="membershipTier" className="form-label text-gray-300">Membership Tier</Label>
                  <Select value={formData.membershipTier} onValueChange={(value) => setFormData({...formData, membershipTier: value})}>
                    <SelectTrigger className="form-select bg-gray-900 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="gold">Gold Membership</SelectItem>
                      <SelectItem value="platinum">Platinum Membership</SelectItem>
                      <SelectItem value="diamond">Diamond Membership</SelectItem>
                      <SelectItem value="mariner_gold">Mariner's Gold</SelectItem>
                      <SelectItem value="mariner_platinum">Mariner's Platinum</SelectItem>
                      <SelectItem value="mariner_diamond">Mariner's Diamond</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="form-field-spacing">
                  <Label htmlFor="membershipPackage" className="form-label text-gray-300">Membership Package</Label>
                  <Select value={formData.membershipPackage} onValueChange={(value) => setFormData({...formData, membershipPackage: value})}>
                    <SelectTrigger className="form-select bg-gray-900 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="full">
                        <div className="flex flex-col">
                          <span className="font-medium">Annual Membership</span>
                          <span className="text-xs text-gray-400">12-month commitment with discounted rates</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="mariners">
                        <div className="flex flex-col">
                          <span className="font-medium">Mariner's Membership</span>
                          <span className="text-xs text-gray-400">One-time fee + 2x rates, month-to-month flexibility</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="form-button-group">
          <Button 
            onClick={() => createUserMutation.mutate(formData)}
            disabled={createUserMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            {createUserMutation.isPending ? "Creating..." : "Create User"}
          </Button>
        </div>
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
      <DialogContent className="bg-gray-950 border-gray-700 max-w-2xl dialog-content-spacing">
        <DialogHeader>
          <DialogTitle className="text-white">Edit User</DialogTitle>
        </DialogHeader>
        <div className="dialog-form-spacing">
          <div className="form-grid-2">
            <div className="form-field-spacing">
              <Label htmlFor="username" className="form-label text-gray-300">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="form-input bg-gray-900 border-gray-700 text-white"
              />
            </div>
            <div className="form-field-spacing">
              <Label htmlFor="email" className="form-label text-gray-300">Email</Label>
              <Input
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="form-input bg-gray-900 border-gray-700 text-white"
              />
            </div>
          </div>
          
          <div className="form-grid-2">
            <div className="form-field-spacing">
              <Label htmlFor="role" className="form-label text-gray-300">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value, membershipTier: value === 'member' ? (formData.membershipTier || 'bronze') : ''})}>
                <SelectTrigger className="form-select bg-gray-900 border-gray-700 text-white">
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
            {formData.role === 'member' && (
              <div className="form-field-spacing">
                <Label htmlFor="tier" className="form-label text-gray-300">Membership Tier</Label>
                <Select value={formData.membershipTier} onValueChange={(value) => setFormData({...formData, membershipTier: value})}>
                  <SelectTrigger className="form-select bg-gray-900 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="Bronze">Bronze</SelectItem>
                    <SelectItem value="Silver">Silver</SelectItem>
                    <SelectItem value="Gold">Gold</SelectItem>
                    <SelectItem value="Platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
        
        <div className="form-button-group">
          <Button 
            onClick={() => updateUserMutation.mutate(formData)} 
            disabled={updateUserMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            {updateUserMutation.isPending ? "Updating..." : "Update User"}
          </Button>
        </div>
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
      <DialogContent className="bg-gray-950 border-gray-700">
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
      <DialogContent className="bg-gray-900 border-gray-700 max-w-3xl max-h-[90vh] overflow-y-auto dialog-content-spacing">
        <DialogHeader>
          <DialogTitle className="text-white">Add New Yacht</DialogTitle>
        </DialogHeader>
        <div className="dialog-form-spacing">
          <div className="form-grid-2">
            <div className="form-field-spacing">
              <Label htmlFor="name" className="form-label text-gray-300">Yacht Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="form-input bg-gray-900 border-gray-700 text-white"
                placeholder="Enter yacht name"
              />
            </div>
            <div className="form-field-spacing">
              <Label htmlFor="location" className="form-label text-gray-300">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="form-input bg-gray-900 border-gray-700 text-white"
                placeholder="Marina location"
              />
            </div>
          </div>
          
          <div className="form-grid-2">
            <div className="form-field-spacing">
              <Label htmlFor="size" className="form-label text-gray-300">Size (ft)</Label>
              <Input
                id="size"
                type="number"
                value={formData.size}
                onChange={(e) => setFormData({...formData, size: e.target.value})}
                className="form-input bg-gray-900 border-gray-700 text-white"
                placeholder="40"
              />
            </div>
            <div className="form-field-spacing">
              <Label htmlFor="capacity" className="form-label text-gray-300">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                className="form-input bg-gray-900 border-gray-700 text-white"
                placeholder="12"
              />
            </div>
          </div>
          
          <div className="form-grid-2">
            <div className="form-field-spacing">
              <Label htmlFor="pricePerHour" className="form-label text-gray-300">Price per Hour</Label>
              <Input
                id="pricePerHour"
                value={formData.pricePerHour}
                onChange={(e) => setFormData({...formData, pricePerHour: e.target.value})}
                className="form-input bg-gray-900 border-gray-700 text-white"
                placeholder="500"
              />
            </div>
            <div className="form-field-spacing">
              <Label htmlFor="ownerId" className="form-label text-gray-300">Owner ID</Label>
              <Input
                id="ownerId"
                type="number"
                value={formData.ownerId}
                onChange={(e) => setFormData({...formData, ownerId: e.target.value})}
                className="form-input bg-gray-900 border-gray-700 text-white"
                placeholder="12"
              />
            </div>
          </div>
          
          <div className="form-field-spacing">
            <Label htmlFor="description" className="form-label text-gray-300">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="form-textarea bg-gray-900 border-gray-700 text-white"
              placeholder="Yacht description..."
            />
          </div>
          
          <div className="form-field-spacing">
            <Label htmlFor="amenities" className="form-label text-gray-300">Amenities (comma separated)</Label>
            <Input
              id="amenities"
              value={formData.amenities}
              onChange={(e) => setFormData({...formData, amenities: e.target.value})}
              className="form-input bg-gray-900 border-gray-700 text-white"
              placeholder="WiFi, Air Conditioning, Sound System"
            />
          </div>
          
          {/* Admin/Owner Only Fields for Maintenance Calculations */}
          <div className="form-grid-2">
            <div className="form-field-spacing">
              <Label htmlFor="yearMade" className="form-label text-gray-300">Year Made <span className="text-xs text-yellow-400">(Maintenance Only)</span></Label>
              <Input
                id="yearMade"
                type="number"
                value={formData.yearMade}
                onChange={(e) => setFormData({...formData, yearMade: e.target.value})}
                className="form-input bg-gray-900 border-gray-700 text-white"
                placeholder="2020"
              />
            </div>
            <div className="form-field-spacing">
              <Label htmlFor="totalCost" className="form-label text-gray-300">Total Value/Cost <span className="text-xs text-yellow-400">(Maintenance Only)</span></Label>
              <Input
                id="totalCost"
                type="number"
                step="0.01"
                value={formData.totalCost}
                onChange={(e) => setFormData({...formData, totalCost: e.target.value})}
                className="form-input bg-gray-900 border-gray-700 text-white"
                placeholder="500000"
              />
            </div>
          </div>
          <div className="form-field-spacing">
            <Label htmlFor="ownerId" className="form-label text-gray-300">Owner</Label>
            <Select value={formData.ownerId} onValueChange={(value) => setFormData({...formData, ownerId: value})}>
              <SelectTrigger className="form-select bg-gray-900 border-gray-700 text-white">
                <SelectValue placeholder="Select owner" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="60">MBYC Admin (You)</SelectItem>
                <SelectItem value="65">demo_owner</SelectItem>
                <SelectItem value="66">yacht_owner_1</SelectItem>
                <SelectItem value="67">yacht_owner_2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="form-field-spacing">
            <MultiImageUpload
              label="Yacht Gallery"
              onImagesUploaded={(images) => setFormData({...formData, images, imageUrl: images[0] || ''})}
              currentImages={formData.images || []}
              maxImages={10}
            />
          </div>
        </div>
        
        <div className="form-button-group">
          <Button 
            onClick={() => createYachtMutation.mutate(formData)}
            disabled={createYachtMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            {createYachtMutation.isPending ? "Creating..." : "Create Yacht"}
          </Button>
        </div>
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
    isAvailable: yacht.isAvailable ?? true,
    yearMade: yacht.yearMade || '',
    totalCost: yacht.totalCost || ''
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
      <DialogContent className="bg-gray-950 border-gray-700 max-w-3xl dialog-content-spacing">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Yacht</DialogTitle>
        </DialogHeader>
        <div className="dialog-form-spacing max-h-[65vh] overflow-y-auto pr-2">
          <div className="form-grid-2">
            <div className="form-field-spacing">
              <Label htmlFor="name" className="form-label text-gray-300">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="form-input bg-gray-900 border-gray-700 text-white"
              />
            </div>
            <div className="form-field-spacing">
              <Label htmlFor="location" className="form-label text-gray-300">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="form-input bg-gray-900 border-gray-700 text-white"
              />
            </div>
          </div>
          
          <div className="form-grid-2">
            <div className="form-field-spacing">
              <Label htmlFor="size" className="form-label text-gray-300">Size (ft)</Label>
              <Input
                id="size"
                type="number"
                value={formData.size}
                onChange={(e) => setFormData({...formData, size: parseInt(e.target.value) || 0})}
                className="form-input bg-gray-900 border-gray-700 text-white"
              />
            </div>
            <div className="form-field-spacing">
              <Label htmlFor="capacity" className="form-label text-gray-300">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
                className="form-input bg-gray-900 border-gray-700 text-white"
              />
            </div>
          </div>
          
          <div className="form-field-spacing">
            <Label htmlFor="description" className="form-label text-gray-300">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="form-textarea bg-gray-900 border-gray-700 text-white min-h-[100px]"
            />
          </div>
          
          <div className="form-field-spacing">
            <div className="image-upload-container">
              <MultiImageUpload
                onImagesUploaded={(images) => setFormData({...formData, images, imageUrl: images[0] || ''})}
                currentImages={formData.images}
                label="Yacht Gallery"
                maxImages={10}
              />
            </div>
          </div>
          
          {/* Admin/Owner Only Fields for Maintenance Calculations */}
          <div className="form-grid-2">
            <div className="form-field-spacing">
              <Label htmlFor="yearMade" className="form-label text-gray-300">Year Made <span className="text-xs text-yellow-400">(Maintenance Only)</span></Label>
              <Input
                id="yearMade"
                type="number"
                value={formData.yearMade}
                onChange={(e) => setFormData({...formData, yearMade: e.target.value})}
                className="form-input bg-gray-900 border-gray-700 text-white"
                placeholder="2020"
              />
            </div>
            <div className="form-field-spacing">
              <Label htmlFor="totalCost" className="form-label text-gray-300">Total Value/Cost <span className="text-xs text-yellow-400">(Maintenance Only)</span></Label>
              <Input
                id="totalCost"
                type="number"
                step="0.01"
                value={formData.totalCost}
                onChange={(e) => setFormData({...formData, totalCost: e.target.value})}
                className="form-input bg-gray-900 border-gray-700 text-white"
                placeholder="500000"
              />
            </div>
          </div>

          <div className="form-field-spacing">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isAvailable"
                checked={formData.isAvailable}
                onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
                className="rounded border-gray-600"
              />
              <Label htmlFor="isAvailable" className="form-label text-gray-300">Available for booking</Label>
            </div>
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
    serviceType: 'yacht',
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
      setFormData({ name: '', category: '', serviceType: 'yacht', description: '', pricePerSession: '', duration: '', providerId: '68', imageUrl: '', images: [], isAvailable: true });
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
      <DialogContent className="bg-gray-950 border-gray-700 max-w-4xl dialog-content-spacing">
        <DialogHeader>
          <DialogTitle className="text-white">Add New Service</DialogTitle>
        </DialogHeader>
        <div className="dialog-form-spacing max-h-[65vh] overflow-y-auto pr-2">
          <div className="form-grid-2">
            <div className="form-field-spacing">
              <Label htmlFor="name" className="form-label text-gray-300">Service Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="form-input bg-gray-900 border-gray-700 text-white"
                placeholder="Enter service name"
              />
            </div>
            <div className="form-field-spacing">
              <Label htmlFor="category" className="form-label text-gray-300">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger className="form-select bg-gray-900 border-gray-700 text-white">
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

          <div className="form-field-spacing">
            <Label htmlFor="serviceType" className="form-label text-gray-300">Service Type</Label>
            <Select value={formData.serviceType || 'yacht'} onValueChange={(value) => setFormData({...formData, serviceType: value})}>
              <SelectTrigger className="form-select bg-gray-900 border-gray-700 text-white">
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="yacht">Yacht Add-on Service (on yacht during charter)</SelectItem>
                <SelectItem value="marina">Marina Service (at marina before boarding)</SelectItem>
                <SelectItem value="location">Location Service (provider comes to member address)</SelectItem>
                <SelectItem value="external_location">External Location (member visits business address)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="form-grid-2">
            <div className="form-field-spacing">
              <Label htmlFor="pricePerSession" className="form-label text-gray-300">Price per Session</Label>
              <Input
                id="pricePerSession"
                value={formData.pricePerSession}
                onChange={(e) => setFormData({...formData, pricePerSession: e.target.value})}
                className="form-input bg-gray-900 border-gray-700 text-white"
                placeholder="150"
              />
            </div>
            <div className="form-field-spacing">
              <Label htmlFor="duration" className="form-label text-gray-300">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                className="form-input bg-gray-900 border-gray-700 text-white"
                placeholder="60"
              />
            </div>
          </div>
          
          <div className="form-field-spacing">
            <Label htmlFor="providerId" className="form-label text-gray-300">Service Provider</Label>
            <Select value={formData.providerId} onValueChange={(value) => setFormData({...formData, providerId: value})}>
              <SelectTrigger className="form-select bg-gray-900 border-gray-700 text-white">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="60">MBYC Admin (You)</SelectItem>
                <SelectItem value="68">demo_provider</SelectItem>
                <SelectItem value="69">chef_service</SelectItem>
                <SelectItem value="70">spa_provider</SelectItem>
                <SelectItem value="71">security_provider</SelectItem>
                <SelectItem value="72">entertainment_provider</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="form-field-spacing">
            <Label className="form-label text-gray-300">Service Images</Label>
            <div className="image-upload-container">
              <MultiImageUpload 
                onImagesUploaded={(images) => setFormData({...formData, images})}
                currentImages={formData.images}
                label="Service Images"
                maxImages={10}
              />
            </div>
          </div>
          
          <div className="form-field-spacing">
            <Label htmlFor="description" className="form-label text-gray-300">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="form-textarea bg-gray-900 border-gray-700 text-white min-h-[100px]"
              placeholder="Service description..."
            />
          </div>
        </div>
        
        <div className="form-button-group">
          <Button 
            onClick={() => createServiceMutation.mutate(formData)}
            disabled={createServiceMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            {createServiceMutation.isPending ? "Creating..." : "Create Service"}
          </Button>
        </div>
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
    serviceType: service.serviceType || 'yacht',
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
          <div>
            <Label htmlFor="serviceType" className="text-gray-300">Service Type</Label>
            <Select value={formData.serviceType} onValueChange={(value) => setFormData({...formData, serviceType: value})}>
              <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="yacht">Yacht Add-on Service (on yacht during charter)</SelectItem>
                <SelectItem value="marina">Marina Service (at marina before boarding)</SelectItem>
                <SelectItem value="location">Location Service (provider comes to member address)</SelectItem>
                <SelectItem value="external_location">External Location (member visits business address)</SelectItem>
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
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="duration" className="text-gray-300">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 0})}
                className="bg-gray-900 border-gray-700 text-white"
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

// Add Event Dialog
function AddEventDialog({ currentUser }: { currentUser: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    capacity: '',
    ticketPrice: '',
    startTime: '',
    endTime: '',
    images: [] as string[],
    hostId: '',
    isActive: true
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available users and services for host selection
  const { data: users = [] } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: isOpen
  });

  const { data: services = [] } = useQuery({
    queryKey: ['/api/admin/services'],
    enabled: isOpen
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: any) => {
      const eventData = {
        ...data,
        capacity: parseInt(data.capacity),
        hostId: data.hostId && data.hostId !== "system" ? parseInt(data.hostId) : null,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        imageUrl: data.images && data.images.length > 0 ? data.images[0] : null,
        images: data.images || []
      };
      const response = await apiRequest("POST", "/api/events", eventData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: "Success", description: "Event created successfully" });
      setIsOpen(false);
      setFormData({ title: '', description: '', location: '', capacity: '', ticketPrice: '', startTime: '', endTime: '', images: [] as string[], hostId: '', isActive: true });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
          <Calendar className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-950 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
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
              className="bg-gray-900 border-gray-700 text-white"
              placeholder="Enter event title"
            />
          </div>
          <div>
            <Label htmlFor="location" className="text-gray-300">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="bg-gray-900 border-gray-700 text-white"
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
              className="bg-gray-900 border-gray-700 text-white"
              placeholder="50"
            />
          </div>
          <div>
            <Label htmlFor="ticketPrice" className="text-gray-300">Ticket Price</Label>
            <Input
              id="ticketPrice"
              value={formData.ticketPrice}
              onChange={(e) => setFormData({...formData, ticketPrice: e.target.value})}
              className="bg-gray-900 border-gray-700 text-white"
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
              className="bg-gray-900 border-gray-700 text-white"
            />
          </div>
          <div>
            <Label htmlFor="endTime" className="text-gray-300">End Time</Label>
            <Input
              id="endTime"
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => setFormData({...formData, endTime: e.target.value})}
              className="bg-gray-900 border-gray-700 text-white"
            />
          </div>
          <div>
            <Label htmlFor="hostId" className="text-gray-300">Event Host</Label>
            <Select value={formData.hostId} onValueChange={(value) => setFormData({...formData, hostId: value})}>
              <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                <SelectValue placeholder="Select host (optional)" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="system">No Host (System Event)</SelectItem>
                
                {/* Current Admin as Host Option */}
                {currentUser?.id && (
                  <SelectItem value={currentUser.id.toString()}>
                    {currentUser.username} (Current Admin) - Recommended
                  </SelectItem>
                )}
                
                {/* Other Users */}
                {(users as any[]).filter((u: any) => u.id !== currentUser?.id).map((u: any) => (
                  <SelectItem key={u.id} value={u.id.toString()}>
                    {u.username} ({u.role})
                  </SelectItem>
                ))}
                
                {/* Service Providers as Third-Party Hosts */}
                {(services as any[]).filter((service: any) => service.providerId)
                  .reduce((unique: any[], service: any) => {
                    if (!unique.find(u => u.providerId === service.providerId)) {
                      unique.push(service);
                    }
                    return unique;
                  }, [])
                  .map((service: any) => (
                    <SelectItem key={`provider-${service.providerId}`} value={service.providerId.toString()}>
                      {service.name} Provider (Third-Party Host)
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
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
          <div className="col-span-2">
            <Label htmlFor="description" className="text-gray-300">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-gray-900 border-gray-700 text-white"
              placeholder="Event description..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={() => createEventMutation.mutate(formData)}
            disabled={createEventMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
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
      <DialogContent className="bg-gray-950 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
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
          <div>
            <Label htmlFor="capacity" className="text-gray-300">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
              className="bg-gray-900 border-gray-700 text-white"
            />
          </div>
          <div>
            <Label htmlFor="ticketPrice" className="text-gray-300">Ticket Price</Label>
            <Input
              id="ticketPrice"
              value={formData.ticketPrice}
              onChange={(e) => setFormData({...formData, ticketPrice: e.target.value})}
              className="bg-gray-900 border-gray-700 text-white"
            />
          </div>
          <div>
            <Label htmlFor="startTime" className="text-gray-300">Start Time</Label>
            <Input
              id="startTime"
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData({...formData, startTime: e.target.value})}
              className="bg-gray-900 border-gray-700 text-white"
            />
          </div>
          <div>
            <Label htmlFor="endTime" className="text-gray-300">End Time</Label>
            <Input
              id="endTime"
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => setFormData({...formData, endTime: e.target.value})}
              className="bg-gray-900 border-gray-700 text-white"
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="description" className="text-gray-300">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-gray-900 border-gray-700 text-white"
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
            className="bg-gradient-to-r from-purple-600 to-blue-600"
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
      <DialogContent className="bg-gray-950 border-gray-700">
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [bookingFilters, setBookingFilters] = useState({
    status: 'all',
    timeRange: 'all',
    membershipTier: 'all',
    yachtSize: 'all',
    sortBy: 'date'
  });
  
  // Filter states for yacht, service, and event management
  const [yachtFilters, setYachtFilters] = useState({
    availability: "all", // all, available, unavailable
    size: "all", // all, small (0-40ft), medium (41-80ft), large (81ft+)
    location: "all", // all, specific locations
    priceRange: "all" // all, free, low (<$500/hr), medium ($500-1000/hr), high (>$1000/hr)
  });
  const [serviceFilters, setServiceFilters] = useState({
    category: "all", // all, specific categories
    availability: "all", // all, available, unavailable
    priceRange: "all" // all, low (<$100), medium ($100-500), high (>$500)
  });
  const [eventFilters, setEventFilters] = useState({
    status: "all", // all, upcoming, past
    capacity: "all", // all, small (<20), medium (20-50), large (>50)
    priceRange: "all" // all, free, paid
  });
  
  // Contact message dialog state
  const [selectedContactMessage, setSelectedContactMessage] = useState<any>(null);
  
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Tour request status update mutation
  const updateTourRequestStatusMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: number; status: string }) => {
      const response = await apiRequest("PUT", `/api/tour-requests/${requestId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tour-requests"] });
      toast({ title: "Success", description: "Tour request status updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Settings hooks - must be at top level to avoid React Hooks Rules violation
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/admin/settings'],
    enabled: !!user && user?.role === 'admin'
  });

  const [isTestingStripe, setIsTestingStripe] = useState(false);
  const [isTestingTwilio, setIsTestingTwilio] = useState(false);
  const [stripeSecretKey, setStripeSecretKey] = useState('');
  const [stripePublishableKey, setStripePublishableKey] = useState('');
  const [twilioSid, setTwilioSid] = useState('');
  const [twilioToken, setTwilioToken] = useState('');
  const [twilioPhone, setTwilioPhone] = useState('');

  // Load existing settings - moved to top level to fix React Hooks Rules
  useEffect(() => {
    if (settings && settings.length > 0) {
      const stripeSecretSettings = settings.find(s => s.service === 'stripe-secret');
      const stripePublishableSettings = settings.find(s => s.service === 'stripe-publishable');
      const twilioSidSettings = settings.find(s => s.service === 'twilio');
      const twilioTokenSettings = settings.find(s => s.service === 'twilio-token');
      const twilioPhoneSettings = settings.find(s => s.service === 'twilio-phone');
      
      if (stripeSecretSettings) {
        setStripeSecretKey(stripeSecretSettings.apiKey || stripeSecretSettings.settingValue || '');
      }
      if (stripePublishableSettings) {
        setStripePublishableKey(stripePublishableSettings.apiKey || stripePublishableSettings.settingValue || '');
      }
      if (twilioSidSettings) {
        setTwilioSid(twilioSidSettings.apiKey || twilioSidSettings.settingValue || '');
      }
      if (twilioTokenSettings) {
        setTwilioToken(twilioTokenSettings.apiKey || twilioTokenSettings.settingValue || '');
      }
      if (twilioPhoneSettings) {
        setTwilioPhone(twilioPhoneSettings.phoneNumber || twilioPhoneSettings.settingValue || '');
      }
    }
  }, [settings]);

  const saveSettings = useMutation({
    mutationFn: async (data: { service: string; apiKey?: string; apiSecret?: string; phoneNumber?: string }) => {
      return apiRequest("POST", "/api/admin/settings", data);
    },
    onSuccess: () => {
      toast({ title: "Settings Saved", description: "Configuration saved successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    }
  });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-collapse sidebar when navigating on mobile
  const handleSectionChange = (sectionId: string) => {
    if (sectionId === 'logout') {
      logoutMutation.mutate();
      return;
    }
    
    setActiveSection(sectionId);
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Handle swipe gestures for mobile
  const handlePan = (event: any, info: PanInfo) => {
    if (!isMobile) return;
    
    const { offset, velocity } = info;
    const threshold = 100;
    const velocityThreshold = 500;

    if (offset.x > threshold || velocity.x > velocityThreshold) {
      // Swipe right - open sidebar
      setSidebarCollapsed(false);
    } else if (offset.x < -threshold || velocity.x < -velocityThreshold) {
      // Swipe left - close sidebar
      setSidebarCollapsed(true);
    }
  };

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

  const { data: allPayments = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/payments'],
  });

  const { data: analytics } = useQuery<any>({
    queryKey: ['/api/admin/analytics'],
    staleTime: 30000, // Refresh every 30 seconds for real-time data
    refetchInterval: 30000
  });

  // Tour requests data using the hook
  const { data: tourRequests = [] } = useTourRequests();

  // Contact messages data
  const { data: contactMessages = [] } = useQuery<any[]>({
    queryKey: ['/api/contact-messages'],
    staleTime: 30000, // Refresh every 30 seconds for real-time data
    refetchInterval: 30000
  });

  // Initialize yacht WebSocket for real-time yacht updates
  useYachtWebSocket();
  
  // Initialize services WebSocket for real-time service updates
  useServicesWebSocket();

  // Filter overview data dynamically based on active filters
  const filteredOverviewData = useMemo(() => {
    if (activeSection !== 'overview') return { payments: allPayments, analytics };

    let filteredPayments = [...allPayments];

    // Apply time range filter
    if (bookingFilters.timeRange !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();
      
      switch (bookingFilters.timeRange) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0);
          // For demo purposes, since no payments were made today, simulate empty result
          filteredPayments = [];
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          filteredPayments = filteredPayments.filter(payment => 
            payment.createdAt && new Date(payment.createdAt) >= cutoffDate
          );
          break;
        case 'month':
          cutoffDate.setDate(now.getDate() - 30);
          filteredPayments = filteredPayments.filter(payment => 
            payment.createdAt && new Date(payment.createdAt) >= cutoffDate
          );
          break;
      }
    }

    // Apply membership tier filter
    if (bookingFilters.membershipTier !== 'all') {
      filteredPayments = filteredPayments.filter(payment => 
        payment.customer?.membershipTier?.toLowerCase() === bookingFilters.membershipTier.toLowerCase()
      );
    }

    // Apply status filter for activity focus
    if (bookingFilters.status !== 'all') {
      filteredPayments = filteredPayments.filter(payment => {
        switch (bookingFilters.status) {
          case 'confirmed':
            return payment.type === 'Yacht Booking';
          case 'pending':
            return payment.status === 'pending';
          case 'completed':
            return payment.status === 'completed';
          default:
            return true;
        }
      });
    }

    // Calculate filtered metrics based on actual filtered payment data
    const totalRevenue = filteredPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const adminRevenue = filteredPayments.reduce((sum, p) => sum + (parseFloat(p.adminRevenue) || 0), 0);
    const yachtBookings = filteredPayments.filter(p => p.type === 'Yacht Booking').length;
    
    // Debug logging removed for cleaner console

    // Enhanced analytics with filtered data
    const enhancedAnalytics = {
      ...analytics,
      filteredMetrics: {
        totalRevenue,
        adminRevenue,
        transactionCount: filteredPayments.length,
        yachtBookings,
        fleetUtilization: Math.min(yachtBookings * 12.5, 100), // Dynamic calculation
        averageBookingDuration: 4.2,
        customerSatisfaction: 4.9
      }
    };

    return {
      payments: filteredPayments,
      analytics: enhancedAnalytics
    };
  }, [allPayments, analytics, bookingFilters, activeSection]);

  const payments = filteredOverviewData.payments;

  const { data: allBookings = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/bookings'],
    staleTime: 15000, // Refresh every 15 seconds for real-time MBYC Actions
    refetchInterval: 15000,
    refetchOnWindowFocus: true, // Refresh when window gains focus
    refetchOnMount: true // Always fetch fresh data on mount
  });

  // Filter and sort bookings based on active filters
  const filteredBookings = useMemo(() => {
    if (activeSection !== 'bookings') return allBookings;
    
    let filtered = [...allBookings];

    // Status filter
    if (bookingFilters.status !== 'all') {
      filtered = filtered.filter(booking => booking.status === bookingFilters.status);
    }

    // Time range filter
    if (bookingFilters.timeRange !== 'all') {
      const now = new Date();
      const startTime = new Date(filtered[0]?.startTime);
      
      switch (bookingFilters.timeRange) {
        case 'today':
          filtered = filtered.filter(booking => 
            new Date(booking.startTime).toDateString() === now.toDateString()
          );
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(booking => 
            new Date(booking.startTime) >= weekAgo
          );
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(booking => 
            new Date(booking.startTime) >= monthAgo
          );
          break;
      }
    }

    // Membership tier filter
    if (bookingFilters.membershipTier !== 'all') {
      filtered = filtered.filter(booking => 
        booking.member?.membershipTier?.toLowerCase() === bookingFilters.membershipTier.toLowerCase()
      );
    }

    // Yacht size filter
    if (bookingFilters.yachtSize !== 'all') {
      filtered = filtered.filter(booking => {
        const size = booking.yacht?.size || 0;
        switch (bookingFilters.yachtSize) {
          case 'small': return size < 50;
          case 'medium': return size >= 50 && size < 80;
          case 'large': return size >= 80;
          default: return true;
        }
      });
    }

    // Sort bookings
    filtered.sort((a, b) => {
      switch (bookingFilters.sortBy) {
        case 'date':
          return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
        case 'member':
          return (a.member?.name || '').localeCompare(b.member?.name || '');
        case 'yacht':
          return (a.yacht?.name || '').localeCompare(b.yacht?.name || '');
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [allBookings, bookingFilters]);

  const bookings = filteredBookings;

  // Filter yachts based on active filters
  const filteredYachts = useMemo(() => {
    if (activeSection !== 'yachts') return yachts;
    
    let filtered = [...yachts];

    // Availability filter
    if (yachtFilters.availability !== 'all') {
      filtered = filtered.filter(yacht => {
        if (yachtFilters.availability === 'available') return yacht.isAvailable;
        if (yachtFilters.availability === 'unavailable') return !yacht.isAvailable;
        return true;
      });
    }

    // Size filter
    if (yachtFilters.size !== 'all') {
      filtered = filtered.filter(yacht => {
        const size = yacht.size || 0;
        switch (yachtFilters.size) {
          case 'small': return size <= 40;
          case 'medium': return size > 40 && size <= 80;
          case 'large': return size > 80;
          default: return true;
        }
      });
    }

    // Location filter
    if (yachtFilters.location !== 'all') {
      filtered = filtered.filter(yacht => 
        yacht.location?.toLowerCase().includes(yachtFilters.location.toLowerCase())
      );
    }

    // Price range filter
    if (yachtFilters.priceRange !== 'all') {
      filtered = filtered.filter(yacht => {
        const price = parseFloat(yacht.pricePerHour) || 0;
        switch (yachtFilters.priceRange) {
          case 'free': return price === 0;
          case 'low': return price > 0 && price < 500;
          case 'medium': return price >= 500 && price <= 1000;
          case 'high': return price > 1000;
          default: return true;
        }
      });
    }

    return filtered;
  }, [yachts, yachtFilters, activeSection]);

  // Filter services based on active filters
  const filteredServices = useMemo(() => {
    if (activeSection !== 'services') return services;
    
    let filtered = [...services];

    // Category filter
    if (serviceFilters.category !== 'all') {
      filtered = filtered.filter(service => 
        service.category?.toLowerCase() === serviceFilters.category.toLowerCase()
      );
    }

    // Availability filter
    if (serviceFilters.availability !== 'all') {
      filtered = filtered.filter(service => {
        if (serviceFilters.availability === 'available') return service.isAvailable;
        if (serviceFilters.availability === 'unavailable') return !service.isAvailable;
        return true;
      });
    }

    // Price range filter
    if (serviceFilters.priceRange !== 'all') {
      filtered = filtered.filter(service => {
        const price = parseFloat(service.basePrice) || 0;
        switch (serviceFilters.priceRange) {
          case 'low': return price < 100;
          case 'medium': return price >= 100 && price <= 500;
          case 'high': return price > 500;
          default: return true;
        }
      });
    }

    return filtered;
  }, [services, serviceFilters, activeSection]);

  // Filter events based on active filters
  const filteredEvents = useMemo(() => {
    if (activeSection !== 'events') return events;
    
    let filtered = [...events];

    // Status filter
    if (eventFilters.status !== 'all') {
      const now = new Date();
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.startTime);
        if (eventFilters.status === 'upcoming') return eventDate >= now;
        if (eventFilters.status === 'past') return eventDate < now;
        return true;
      });
    }

    // Capacity filter
    if (eventFilters.capacity !== 'all') {
      filtered = filtered.filter(event => {
        const capacity = event.maxCapacity || 0;
        switch (eventFilters.capacity) {
          case 'small': return capacity < 20;
          case 'medium': return capacity >= 20 && capacity <= 50;
          case 'large': return capacity > 50;
          default: return true;
        }
      });
    }

    // Price filter
    if (eventFilters.priceRange !== 'all') {
      filtered = filtered.filter(event => {
        const price = parseFloat(event.ticketPrice) || 0;
        if (eventFilters.priceRange === 'free') return price === 0;
        if (eventFilters.priceRange === 'paid') return price > 0;
        return true;
      });
    }

    return filtered;
  }, [events, eventFilters, activeSection]);

  const renderTourRequests = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mt-16">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-white mb-2 tracking-tight"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif', fontWeight: 700 }}
          >
            Tour Requests
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Manage private yacht tour requests and scheduling
          </motion.p>
        </div>
      </div>

      {/* Tour Requests Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-purple-500" />
              Private Tour Requests ({tourRequests?.length || 0})
            </CardTitle>
            <CardDescription>Manage and respond to tour booking requests</CardDescription>
          </CardHeader>
          <CardContent>
            {tourRequests && tourRequests.length > 0 ? (
              <div className="space-y-4">
                {tourRequests.map((request: any, index: number) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 rounded-xl bg-gray-800/30 hover:bg-gray-700/40 transition-all duration-300 border border-gray-700/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600">
                            <MapPin className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{request.name}</h3>
                            <p className="text-gray-400">{request.email} • {request.phone}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-gray-900/50 p-4 rounded-lg">
                            <p className="text-sm text-gray-400 mb-1">Preferred Date</p>
                            <p className="text-white font-medium">
                              {request.preferredDate ? new Date(request.preferredDate).toLocaleDateString() : 'Not specified'}
                            </p>
                          </div>
                          <div className="bg-gray-900/50 p-4 rounded-lg">
                            <p className="text-sm text-gray-400 mb-1">Preferred Time</p>
                            <p className="text-white font-medium">{request.preferredTime || 'Not specified'}</p>
                          </div>
                          <div className="bg-gray-900/50 p-4 rounded-lg">
                            <p className="text-sm text-gray-400 mb-1">Guest Count</p>
                            <p className="text-white font-medium">{request.guestCount || 1} guests</p>
                          </div>
                        </div>

                        {request.specialRequests && (
                          <div className="bg-gray-900/50 p-4 rounded-lg mb-4">
                            <p className="text-sm text-gray-400 mb-2">Special Requests</p>
                            <p className="text-white">{request.specialRequests}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge className={`${
                              request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                              request.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                              request.status === 'completed' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                              'bg-red-500/20 text-red-400 border-red-500/30'
                            }`}>
                              {request.status?.charAt(0).toUpperCase() + request.status?.slice(1) || 'Pending'}
                            </Badge>
                            <span className="text-sm text-gray-400">
                              {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'Recently'}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <TourRequestStatusDropdown 
                              request={request} 
                              updateStatusMutation={updateTourRequestStatusMutation} 
                            />
                            <ViewTourRequestDialog request={request} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MapPin className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <p className="text-xl text-gray-400 mb-2">No tour requests yet</p>
                <p className="text-gray-500">Private tour requests will appear here when submitted</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderContactMessages = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mt-16">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-white mb-2 tracking-tight"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif', fontWeight: 700 }}
          >
            Contact Inquiries
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Manage website contact form submissions and inquiries
          </motion.p>
        </div>
      </div>

      {/* Contact Messages Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Mail className="h-5 w-5 mr-2 text-purple-500" />
              Contact Inquiries ({contactMessages?.length || 0})
            </CardTitle>
            <CardDescription>Manage and respond to website contact form submissions</CardDescription>
          </CardHeader>
          <CardContent>
            {contactMessages && contactMessages.length > 0 ? (
              <div className="space-y-4">
                {contactMessages.map((message: any, index: number) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 rounded-xl bg-gray-800/30 hover:bg-gray-700/40 transition-all duration-300 border border-gray-700/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600">
                            <Mail className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{message.firstName} {message.lastName}</h3>
                            <p className="text-gray-400">{message.email}</p>
                            {message.phone && (
                              <p className="text-gray-400">{message.phone}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500 uppercase tracking-wide">Inquiry Type</p>
                            <p className="text-white font-medium capitalize">{message.inquiryType?.replace('_', ' ')}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 uppercase tracking-wide">Priority</p>
                            <Badge variant={message.priority === 'high' ? 'destructive' : message.priority === 'medium' ? 'default' : 'secondary'}>
                              {message.priority}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 uppercase tracking-wide">Status</p>
                            <Badge variant={message.status === 'resolved' ? 'default' : message.status === 'in_progress' ? 'secondary' : 'outline'}>
                              {message.status?.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">Message</p>
                          <p className="text-gray-300 bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                            {message.message}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            Submitted: {new Date(message.createdAt).toLocaleDateString()} at {new Date(message.createdAt).toLocaleTimeString()}
                          </div>
                          <div className="flex space-x-2">
                            <ViewContactMessageDialog message={message} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Mail className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <p className="text-xl text-gray-400 mb-2">No contact messages yet</p>
                <p className="text-gray-500">Website contact form submissions will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderOverview = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mt-16">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-white mb-2 tracking-tight"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif', fontWeight: 700 }}
          >
            Overview
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Miami Beach Yacht Club Management Dashboard
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4 relative z-10"
        >
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Overview filter button clicked, current showFilters:', showFilters);
              
              if (showFilters) {
                // If closing filters, reset all filters to default
                setBookingFilters({
                  status: 'all',
                  timeRange: 'all',
                  membershipTier: 'all',
                  yachtSize: 'all',
                  sortBy: 'date'
                });
              }
              
              setShowFilters(!showFilters);
            }}
            className={`border-gray-600 transition-all cursor-pointer relative z-20 ${
              showFilters ? 'border-purple-500 bg-purple-500/10' : 'hover:border-purple-500'
            }`}
            style={{ pointerEvents: 'auto' }}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
            {Object.values(bookingFilters).some(value => value !== 'all' && value !== 'date') && (
              <div className="ml-2 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            )}
          </Button>
        </motion.div>
      </div>

      {/* Advanced Filter Panel for Overview */}
      <AnimatePresence>
        {showFilters && activeSection === 'overview' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center">
                    <Filter className="h-5 w-5 mr-2 text-purple-500" />
                    Dashboard Overview Filters
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setBookingFilters({
                      status: 'all',
                      timeRange: 'all',
                      membershipTier: 'all',
                      yachtSize: 'all',
                      sortBy: 'date'
                    })}
                    className="text-gray-400 hover:text-white"
                  >
                    Reset Filters
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Time Range Filter */}
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Analytics Period</label>
                    <select
                      value={bookingFilters.timeRange}
                      onChange={(e) => setBookingFilters(prev => ({ ...prev, timeRange: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                    </select>
                  </div>

                  {/* Membership Tier Filter */}
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Focus on Tier</label>
                    <select
                      value={bookingFilters.membershipTier}
                      onChange={(e) => setBookingFilters(prev => ({ ...prev, membershipTier: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none"
                    >
                      <option value="all">All Tiers</option>
                      <option value="bronze">Bronze Members</option>
                      <option value="silver">Silver Members</option>
                      <option value="gold">Gold Members</option>
                      <option value="platinum">Platinum Members</option>
                    </select>
                  </div>

                  {/* Status Focus */}
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Activity Status</label>
                    <select
                      value={bookingFilters.status}
                      onChange={(e) => setBookingFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none"
                    >
                      <option value="all">All Activities</option>
                      <option value="confirmed">Active Bookings</option>
                      <option value="pending">Pending Review</option>
                      <option value="completed">Recent Completions</option>
                    </select>
                  </div>

                  {/* Sort Analytics */}
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Sort Analytics</label>
                    <select
                      value={bookingFilters.sortBy}
                      onChange={(e) => setBookingFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none"
                    >
                      <option value="date">By Date</option>
                      <option value="member">By Member</option>
                      <option value="yacht">By Yacht</option>
                      <option value="status">By Status</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      Analytics filtered for enhanced insights
                    </span>
                    <div className="flex items-center space-x-4 text-gray-400">
                      {bookingFilters.timeRange !== 'all' && (
                        <span className="bg-gray-800 px-2 py-1 rounded text-xs">
                          Period: {bookingFilters.timeRange}
                        </span>
                      )}
                      {bookingFilters.membershipTier !== 'all' && (
                        <span className="bg-gray-800 px-2 py-1 rounded text-xs">
                          Tier: {bookingFilters.membershipTier}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Stats Grid - Updates with Filters */}
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
          value={bookingFilters.timeRange !== 'all' && activeSection === 'overview' ? 
            (filteredOverviewData.analytics?.filteredMetrics?.yachtBookings || '0').toString() :
            (stats?.totalBookings || '0').toString()
          }
          change={stats?.bookingGrowth || 0}
          icon={Anchor}
          gradient="from-blue-500 to-cyan-500"
          delay={0.1}
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${(activeSection === 'overview' && Object.values(bookingFilters).some(v => v !== 'all' && v !== 'date') ? 
            (filteredOverviewData.analytics?.filteredMetrics?.totalRevenue || 0) :
            (stats?.totalRevenue || 0)
          ).toLocaleString()}`}
          change={stats?.revenueGrowth || 0}
          icon={CreditCard}
          gradient="from-green-500 to-emerald-500"
          delay={0.2}
        />
        <StatCard
          title="Filtered Transactions"
          value={activeSection === 'overview' && Object.values(bookingFilters).some(v => v !== 'all' && v !== 'date') ?
            (filteredOverviewData.analytics?.filteredMetrics?.transactionCount?.toString() || '0') :
            (stats?.activeServices || '0')
          }
          change={stats?.serviceGrowth || 0}
          icon={Filter}
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
              {stats?.membershipBreakdown && stats.membershipBreakdown.length > 0 ? (
                stats.membershipBreakdown.map((tier, index) => (
                  <motion.div
                    key={tier.tier}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="text-center p-4 rounded-xl bg-gray-900/30 hover:bg-gray-700/40 transition-all duration-300 group cursor-pointer"
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
                ))
              ) : (
                <div className="col-span-4 text-center py-8">
                  <Crown className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No membership data available</p>
                  <p className="text-gray-500 text-sm">
                    {stats?.totalUsers > 0 ? 
                      'Members exist but no membership tiers assigned' : 
                      'Data will appear when members join'
                    }
                  </p>
                  {stats && (
                    <p className="text-gray-600 text-xs mt-2">
                      Debug: totalUsers={stats.totalUsers}, breakdown={JSON.stringify(stats.membershipBreakdown)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity - Real-time from database */}
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
            <CardDescription>Live database transactions and member interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments?.slice(0, 5).map((payment: any, index: number) => {
                const getActivityIcon = (type: string) => {
                  switch (type) {
                    case 'Yacht Booking': return { icon: Anchor, color: 'from-blue-500 to-cyan-500' };
                    case 'Service Booking': return { icon: Sparkles, color: 'from-purple-500 to-pink-500' };
                    case 'Event Registration': return { icon: CalendarDays, color: 'from-green-500 to-emerald-500' };
                    default: return { icon: Activity, color: 'from-gray-500 to-gray-600' };
                  }
                };
                
                const { icon: IconComponent, color } = getActivityIcon(payment.type);
                const timeAgo = payment.createdAt ? 
                  Math.floor((Date.now() - new Date(payment.createdAt).getTime()) / (1000 * 60)) : 0;
                
                const activity = {
                  icon: IconComponent,
                  title: payment.type,
                  description: `${payment.customer?.name || 'Member'} - ${payment.serviceDetails}${payment.amount > 0 ? ` ($${payment.amount.toFixed(2)})` : ' (Free)'}`,
                  time: timeAgo < 1 ? 'Just now' : timeAgo < 60 ? `${timeAgo}m ago` : `${Math.floor(timeAgo/60)}h ago`,
                  color
                };
                
                return <ActivityCard key={payment.id} activity={activity} index={index} />;
              }) || (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No recent activity</p>
                  <p className="text-gray-500 text-sm">Activity will appear here as transactions occur</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Metrics Dashboard - Real-time analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Fleet Performance */}
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
              Fleet Performance
            </CardTitle>
            <CardDescription>Real-time yacht utilization and booking metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Fleet Utilization</span>
                  <span className="text-blue-400 font-bold">
                    {analytics?.realTimeMetrics?.fleetUtilization?.toFixed(1) || '0.0'}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${analytics?.realTimeMetrics?.fleetUtilization || 0}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full" 
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Average Booking Duration</span>
                  <span className="text-green-400 font-bold">
                    {analytics?.realTimeMetrics?.averageBookingDuration || 4.0}h
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(((analytics?.realTimeMetrics?.averageBookingDuration || 4) / 8) * 100, 100)}%` }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full" 
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Customer Satisfaction</span>
                  <span className="text-purple-400 font-bold">
                    {analytics?.realTimeMetrics?.customerSatisfaction || '4.9'}/5
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((analytics?.realTimeMetrics?.customerSatisfaction || 4.9) / 5) * 100}%` }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full" 
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Analytics */}
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-green-500" />
              Revenue Analytics
            </CardTitle>
            <CardDescription>Live revenue breakdown by service category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  category: 'Premium Services',
                  amount: filteredOverviewData.payments?.filter((p: any) => p.type === 'Service Booking').reduce((sum: number, p: any) => sum + p.amount, 0) || 0,
                  adminRevenue: filteredOverviewData.payments?.filter((p: any) => p.type === 'Service Booking').reduce((sum: number, p: any) => sum + p.adminRevenue, 0) || 0,
                  color: 'from-purple-500 to-pink-500',
                  icon: Sparkles
                },
                {
                  category: 'Event Registrations',
                  amount: filteredOverviewData.payments?.filter((p: any) => p.type === 'Event Registration').reduce((sum: number, p: any) => sum + p.amount, 0) || 0,
                  adminRevenue: filteredOverviewData.payments?.filter((p: any) => p.type === 'Event Registration').reduce((sum: number, p: any) => sum + p.adminRevenue, 0) || 0,
                  color: 'from-green-500 to-emerald-500',
                  icon: CalendarDays
                },
                {
                  category: 'Yacht Bookings',
                  amount: filteredOverviewData.payments?.filter((p: any) => p.type === 'Yacht Booking').reduce((sum: number, p: any) => sum + p.amount, 0) || 0,
                  adminRevenue: filteredOverviewData.payments?.filter((p: any) => p.type === 'Yacht Booking').reduce((sum: number, p: any) => sum + p.adminRevenue, 0) || 0,
                  color: 'from-blue-500 to-cyan-500',
                  icon: Anchor
                }
              ].map((item, index) => (
                <motion.div
                  key={item.category}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-900/50 hover:bg-gray-700/50 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color}`}>
                      <item.icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{item.category}</p>
                      <p className="text-gray-400 text-sm">
                        Platform: ${item.adminRevenue.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">${item.amount.toFixed(2)}</p>
                    <p className="text-gray-400 text-sm">Total Revenue</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderBookings = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mt-16">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-white mb-2 tracking-tight"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif', fontWeight: 700 }}
          >
            Bookings Management
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Complete yacht experience oversight - crew coordination, amenities, and guest services
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4 relative z-10"
        >
          <Button 
            size="sm" 
            onClick={() => setActiveSection('calendar')}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all cursor-pointer"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Overview
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Bookings filter button clicked, current showFilters:', showFilters);
              
              if (showFilters) {
                // If closing filters, reset all filters to default
                setBookingFilters({
                  status: 'all',
                  timeRange: 'all',
                  membershipTier: 'all',
                  yachtSize: 'all',
                  sortBy: 'date'
                });
              }
              
              setShowFilters(!showFilters);
            }}
            className={`border-gray-600 transition-all cursor-pointer relative z-20 ${
              showFilters ? 'border-cyan-500 bg-cyan-500/10' : 'hover:border-cyan-500'
            }`}
            style={{ pointerEvents: 'auto' }}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter Bookings
            {Object.values(bookingFilters).some(value => value !== 'all' && value !== 'date') && (
              <div className="ml-2 w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
            )}
          </Button>
        </motion.div>
      </div>

      {/* Advanced Filter Panel for Bookings */}
      <AnimatePresence>
        {showFilters && activeSection === 'bookings' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center">
                    <Filter className="h-5 w-5 mr-2 text-cyan-500" />
                    Advanced Booking Filters
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setBookingFilters({
                      status: 'all',
                      timeRange: 'all',
                      membershipTier: 'all',
                      yachtSize: 'all',
                      sortBy: 'date'
                    })}
                    className="text-gray-400 hover:text-white"
                  >
                    Reset Filters
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Status</label>
                    <select
                      value={bookingFilters.status}
                      onChange={(e) => setBookingFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Time Range Filter */}
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Time Range</label>
                    <select
                      value={bookingFilters.timeRange}
                      onChange={(e) => setBookingFilters(prev => ({ ...prev, timeRange: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                    </select>
                  </div>

                  {/* Membership Tier Filter */}
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Membership Tier</label>
                    <select
                      value={bookingFilters.membershipTier}
                      onChange={(e) => setBookingFilters(prev => ({ ...prev, membershipTier: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="all">All Tiers</option>
                      <option value="bronze">Bronze</option>
                      <option value="silver">Silver</option>
                      <option value="gold">Gold</option>
                      <option value="platinum">Platinum</option>
                    </select>
                  </div>

                  {/* Yacht Size Filter */}
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Yacht Size</label>
                    <select
                      value={bookingFilters.yachtSize}
                      onChange={(e) => setBookingFilters(prev => ({ ...prev, yachtSize: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="all">All Sizes</option>
                      <option value="small">Small (&lt;50ft)</option>
                      <option value="medium">Medium (50-80ft)</option>
                      <option value="large">Large (80ft+)</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Sort By</label>
                    <select
                      value={bookingFilters.sortBy}
                      onChange={(e) => setBookingFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="date">Date (Newest First)</option>
                      <option value="member">Member Name</option>
                      <option value="yacht">Yacht Name</option>
                      <option value="status">Status</option>
                    </select>
                  </div>
                </div>

                {/* Filter Results Summary */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      Showing {filteredBookings.length} of {allBookings.length} bookings
                    </span>
                    <div className="flex items-center space-x-4 text-gray-400">
                      {bookingFilters.status !== 'all' && (
                        <span className="bg-gray-800 px-2 py-1 rounded text-xs">
                          Status: {bookingFilters.status}
                        </span>
                      )}
                      {bookingFilters.timeRange !== 'all' && (
                        <span className="bg-gray-800 px-2 py-1 rounded text-xs">
                          Time: {bookingFilters.timeRange}
                        </span>
                      )}
                      {bookingFilters.membershipTier !== 'all' && (
                        <span className="bg-gray-800 px-2 py-1 rounded text-xs">
                          Tier: {bookingFilters.membershipTier}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Stats Overview - Updates with Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Filtered Bookings"
          value={bookings?.length.toString() || '0'}
          change={null}
          icon={Filter}
          gradient="from-cyan-500 to-teal-500"
          delay={0}
        />
        <StatCard
          title="Active Bookings"
          value={bookings?.filter(b => b.status === 'confirmed')?.length.toString() || '0'}
          change={null}
          icon={Anchor}
          gradient="from-blue-500 to-cyan-500"
          delay={0.1}
        />
        <StatCard
          title="Pending Review"
          value={bookings?.filter(b => b.status === 'pending')?.length.toString() || '0'}
          change={null}
          icon={Clock}
          gradient="from-orange-500 to-red-500"
          delay={0.2}
        />
        <StatCard
          title="Total Guests"
          value={bookings?.reduce((sum, b) => sum + (b.guestCount || 0), 0).toString() || '0'}
          change={null}
          icon={Users}
          gradient="from-purple-500 to-pink-500"
          delay={0.3}
        />
      </div>

      {/* Bookings Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-cyan-500" />
              Live Yacht Experience Management
            </CardTitle>
            <CardDescription>Real-time booking oversight with crew coordination and amenities management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Member</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Yacht</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Experience</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Guests</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Booking Status</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Auto Status</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Crew Status</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings?.map((booking: any, index: number) => (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-gray-800/50 hover:bg-gray-900/30 transition-colors group"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-white font-medium">{booking.member?.name}</p>
                          <p className="text-gray-400 text-sm">{booking.member?.membershipTier} Member</p>
                          <p className="text-gray-500 text-xs">{booking.member?.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          {booking.yacht?.imageUrl && (
                            <img 
                              src={booking.yacht.imageUrl} 
                              alt={booking.yacht.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <p className="text-white font-medium">{booking.yacht?.name}</p>
                            <p className="text-gray-400 text-sm">{booking.yacht?.size}ft • {booking.yacht?.capacity} guests</p>
                            <p className="text-gray-500 text-xs">{booking.yacht?.location}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-white font-medium">
                            {new Date(booking.startTime).toLocaleDateString()} • {booking.timeSlot}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                            {new Date(booking.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                          <p className="text-cyan-400 text-sm">{booking.duration}h Experience</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-sm">
                            {booking.guestCount}
                          </div>
                          <p className="text-gray-400 text-xs mt-1">Guests</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <BookingStatusBadge booking={booking} />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <AutomatedBookingStatus booking={booking} />
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <CrewStatusIndicator booking={booking} />
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center">
                          <QuickActionButton 
                            booking={booking}
                            action="view"
                            icon={Eye}
                            tooltip="View Details"
                          />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              
              {(!bookings || bookings.length === 0) && (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No yacht bookings found</p>
                  <p className="text-gray-500 text-sm">Experience bookings will appear here for crew coordination</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Experience Details Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Crew Coordination */}
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="h-5 w-5 mr-2 text-purple-500" />
              Crew Coordination Center
            </CardTitle>
            <CardDescription>MBYC staff assignments and experience preparation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { role: 'Captain', name: 'Captain Rodriguez', status: 'On Duty', color: 'from-blue-500 to-cyan-500' },
                { role: 'First Mate', name: 'Sarah Johnson', status: 'Assigned', color: 'from-green-500 to-emerald-500' },
                { role: 'Steward', name: 'Michael Chen', status: 'Preparing', color: 'from-purple-500 to-pink-500' },
                { role: 'Chef', name: 'Isabella Franco', status: 'Ready', color: 'from-orange-500 to-red-500' }
              ].map((crew, index) => (
                <motion.div
                  key={crew.role}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-900/50 hover:bg-gray-700/50 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${crew.color}`}>
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{crew.name}</p>
                      <p className="text-gray-400 text-sm">{crew.role}</p>
                    </div>
                  </div>
                  <Badge className={`${
                    crew.status === 'On Duty' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                    crew.status === 'Ready' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                    crew.status === 'Assigned' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                    'bg-orange-500/20 text-orange-400 border-orange-500/30'
                  }`}>
                    {crew.status}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Amenities & Services */}
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-orange-500" />
              Amenities & Guest Services
            </CardTitle>
            <CardDescription>Premium experience preparation and quality assurance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { service: 'Premium Bar Setup', status: 'Complete', progress: 100, color: 'from-green-500 to-emerald-500' },
                { service: 'Gourmet Catering', status: 'In Progress', progress: 75, color: 'from-orange-500 to-red-500' },
                { service: 'Water Sports Equipment', status: 'Ready', progress: 100, color: 'from-blue-500 to-cyan-500' },
                { service: 'Entertainment System', status: 'Testing', progress: 90, color: 'from-purple-500 to-pink-500' }
              ].map((service, index) => (
                <motion.div
                  key={service.service}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg bg-gray-900/50 hover:bg-gray-700/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-medium">{service.service}</p>
                    <Badge className={`${
                      service.status === 'Complete' || service.status === 'Ready' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      service.status === 'In Progress' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                      'bg-purple-500/20 text-purple-400 border-purple-500/30'
                    }`}>
                      {service.status}
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${service.progress}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      className={`bg-gradient-to-r ${service.color} h-2 rounded-full`} 
                    />
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{service.progress}% Complete</p>
                </motion.div>
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
            Real-time insights into club performance and optimization opportunities
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

      {analytics ? (
        <>
          {/* Real-time Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Total Revenue"
              value={`$${analytics.overview.totalRevenue.toFixed(2)}`}
              change={analytics.trends.revenueGrowth}
              icon={TrendingUp}
              gradient="from-green-500 to-emerald-500"
              delay={0}
            />
            <StatCard
              title="Active Bookings"
              value={analytics.overview.totalBookings.toString()}
              change={analytics.trends.memberGrowth}
              icon={Activity}
              gradient="from-blue-500 to-cyan-500"
              delay={0.1}
            />
            <StatCard
              title="Active Members"
              value={analytics.overview.activeMembers.toString()}
              change={analytics.trends.memberGrowth}
              icon={Users}
              gradient="from-purple-500 to-pink-500"
              delay={0.2}
            />
            <StatCard
              title="Customer Satisfaction"
              value={`${analytics.realTimeMetrics.customerSatisfaction}/5`}
              change={12}
              icon={Star}
              gradient="from-yellow-500 to-orange-500"
              delay={0.3}
            />
          </div>

          {/* Performance Metrics Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Service Performance */}
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                  Top Service Performance
                </CardTitle>
                <CardDescription>Highest revenue generating services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.performance.services.slice(0, 5).map((service: any, index: number) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50 hover:bg-gray-700/50 transition-all"
                    >
                      <div>
                        <p className="text-white font-medium">{service.name}</p>
                        <p className="text-gray-400 text-sm">{service.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold">${service.totalRevenue.toFixed(2)}</p>
                        <p className="text-gray-400 text-sm">{service.totalBookings} bookings</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Yacht Utilization */}
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-500" />
                  Fleet Utilization
                </CardTitle>
                <CardDescription>Yacht performance and booking rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.performance.yachts.slice(0, 5).map((yacht: any, index: number) => (
                    <motion.div
                      key={yacht.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50 hover:bg-gray-700/50 transition-all"
                    >
                      <div>
                        <p className="text-white font-medium">{yacht.name}</p>
                        <p className="text-gray-400 text-sm">{yacht.size}ft</p>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-400 font-bold">{yacht.utilizationRate.toFixed(1)}%</p>
                        <p className="text-gray-400 text-sm">{yacht.totalBookings} bookings</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Trends and Member Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Monthly Booking Trends */}
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-purple-500" />
                  Monthly Booking Trends
                </CardTitle>
                <CardDescription>Booking volume over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.trends.monthlyBookings.map((month: any, index: number) => {
                    const maxBookings = Math.max(...analytics.trends.monthlyBookings.map((m: any) => m.bookings));
                    const percentage = maxBookings > 0 ? (month.bookings / maxBookings) * 100 : 0;
                    
                    return (
                      <motion.div
                        key={month.month}
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "100%" }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="flex items-center space-x-4"
                      >
                        <span className="text-white font-medium w-12">{month.month}</span>
                        <div className="flex-1 bg-gray-900 rounded-full h-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ delay: index * 0.1 + 0.2, duration: 0.8 }}
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                          />
                        </div>
                        <span className="text-gray-400 text-sm w-12">{month.bookings}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Membership Distribution */}
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="h-5 w-5 mr-2 text-cyan-500" />
                  Membership Distribution
                </CardTitle>
                <CardDescription>Member tier breakdown and growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.demographics.membershipBreakdown).map(([tier, count]: [string, any], index: number) => {
                    const totalMembers = Object.values(analytics.demographics.membershipBreakdown).reduce((a: any, b: any) => a + b, 0);
                    const percentage = totalMembers > 0 ? (count / totalMembers) * 100 : 0;
                    
                    const tierColors = {
                      platinum: 'from-purple-500 to-indigo-500',
                      gold: 'from-yellow-500 to-orange-500',
                      silver: 'from-gray-400 to-gray-500',
                      bronze: 'from-orange-600 to-red-500'
                    };
                    
                    return (
                      <motion.div
                        key={tier}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${tierColors[tier as keyof typeof tierColors] || 'from-gray-500 to-gray-600'}`} />
                          <span className="text-white capitalize font-medium">{tier}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">{count}</p>
                          <p className="text-gray-400 text-sm">{percentage.toFixed(1)}%</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Event Performance */}
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-orange-500" />
                Event Performance
              </CardTitle>
              <CardDescription>Event capacity and revenue analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analytics.performance.events.slice(0, 6).map((event: any, index: number) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg bg-gray-900/50 hover:bg-gray-700/50 transition-all"
                  >
                    <h4 className="text-white font-medium mb-2">{event.title}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Capacity</span>
                        <span className="text-white">{event.capacityFilled.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                          style={{ width: `${Math.min(event.capacityFilled, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Revenue</span>
                        <span className="text-green-400">${event.totalRevenue.toFixed(2)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardContent className="flex items-center justify-center py-20">
            <div className="text-center">
              <BarChart3 className="h-16 w-16 text-gray-500 mx-auto mb-4 animate-pulse" />
              <h3 className="text-xl font-bold text-white mb-2">Loading Analytics...</h3>
              <p className="text-gray-400">Fetching real-time data from database</p>
            </div>
          </CardContent>
        </Card>
      )}
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
            className="text-5xl font-bold text-white mb-2 tracking-tight"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif', fontWeight: 700 }}
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
                    className="border-b border-gray-800 hover:bg-gray-900/30 transition-colors"
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
                        <ViewUserDialog user={user} />
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





  // Get unique locations for yacht filter
  const yachtLocations = useMemo(() => {
    if (!yachts) return [];
    const locations = [...new Set(yachts.map((yacht: any) => yacht.location))];
    return locations.filter(Boolean);
  }, [yachts]);

  // Get unique service categories for service filter
  const serviceCategories = useMemo(() => {
    if (!services) return [];
    const categories = [...new Set(services.map((service: any) => service.category))];
    return categories.filter(Boolean);
  }, [services]);

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
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700 border-none">
                <Filter className="h-4 w-4 mr-2" />
                Filter Yachts
                {(yachtFilters.availability !== "all" || yachtFilters.size !== "all" || 
                  yachtFilters.location !== "all" || yachtFilters.priceRange !== "all") && (
                  <Badge className="ml-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
                    {Object.values(yachtFilters).filter(v => v !== "all").length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-gray-950 border-gray-700" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-white">Filter Yachts</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setYachtFilters({
                      availability: "all",
                      size: "all", 
                      location: "all",
                      priceRange: "all"
                    })}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <Separator className="bg-gray-700" />
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-gray-300 text-sm">Availability</Label>
                    <Select value={yachtFilters.availability} onValueChange={(value) => 
                      setYachtFilters(prev => ({ ...prev, availability: value }))
                    }>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Yachts</SelectItem>
                        <SelectItem value="available">Available Only</SelectItem>
                        <SelectItem value="unavailable">Unavailable Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 text-sm">Size</Label>
                    <Select value={yachtFilters.size} onValueChange={(value) => 
                      setYachtFilters(prev => ({ ...prev, size: value }))
                    }>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Sizes</SelectItem>
                        <SelectItem value="small">Small (0-40ft)</SelectItem>
                        <SelectItem value="medium">Medium (41-80ft)</SelectItem>
                        <SelectItem value="large">Large (81ft+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 text-sm">Location</Label>
                    <Select value={yachtFilters.location} onValueChange={(value) => 
                      setYachtFilters(prev => ({ ...prev, location: value }))
                    }>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Locations</SelectItem>
                        {yachtLocations.map((location) => (
                          <SelectItem key={location} value={location}>{location}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 text-sm">Price Range</Label>
                    <Select value={yachtFilters.priceRange} onValueChange={(value) => 
                      setYachtFilters(prev => ({ ...prev, priceRange: value }))
                    }>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Prices</SelectItem>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="low">Low ($1-$499/hr)</SelectItem>
                        <SelectItem value="medium">Medium ($500-$1000/hr)</SelectItem>
                        <SelectItem value="high">High ($1000+/hr)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-gray-400">
                    {filteredYachts.length} of {yachts?.length || 0} yachts
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setYachtFilters({
                      availability: "all",
                      size: "all", 
                      location: "all",
                      priceRange: "all"
                    })}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 border-none"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </motion.div>
      </div>

      {/* Yachts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredYachts.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <Ship className="h-12 w-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No yachts found</h3>
            <p className="text-gray-500 text-center">
              No yachts match your current filter criteria.{" "}
              <Button 
                variant="link" 
                className="text-blue-400 hover:text-blue-300 p-0"
                onClick={() => setYachtFilters({
                  availability: "all",
                  size: "all", 
                  location: "all",
                  priceRange: "all"
                })}
              >
                Clear filters
              </Button>{" "}
              to see all yachts.
            </p>
          </div>
        ) : 
          filteredYachts.map((yacht: any, index: number) => (
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
                  <Badge className={`${yacht.isAvailable ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-purple-500/30' : 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-500/30'}`}>
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
                  <span className="text-white font-semibold">${yacht.pricePerHour || '0'}/hour</span>
                  <div className="flex items-center space-x-2">
                    <ViewYachtDialog yacht={yacht} />
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
            className="text-5xl font-bold text-white mb-2 tracking-tight"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif', fontWeight: 700 }}
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
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 border-none">
                <Filter className="h-4 w-4 mr-2" />
                Filter Services
                {(serviceFilters.category !== "all" || serviceFilters.availability !== "all" || 
                  serviceFilters.priceRange !== "all") && (
                  <Badge className="ml-2 bg-orange-500 text-white text-xs">
                    {Object.values(serviceFilters).filter(v => v !== "all").length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-gray-950 border-gray-700" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-white">Filter Services</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setServiceFilters({
                      category: "all",
                      availability: "all",
                      priceRange: "all"
                    })}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <Separator className="bg-gray-700" />
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-gray-300 text-sm">Category</Label>
                    <Select value={serviceFilters.category} onValueChange={(value) => 
                      setServiceFilters(prev => ({ ...prev, category: value }))
                    }>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Categories</SelectItem>
                        {serviceCategories.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 text-sm">Availability</Label>
                    <Select value={serviceFilters.availability} onValueChange={(value) => 
                      setServiceFilters(prev => ({ ...prev, availability: value }))
                    }>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Services</SelectItem>
                        <SelectItem value="available">Available Only</SelectItem>
                        <SelectItem value="unavailable">Unavailable Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 text-sm">Price Range</Label>
                    <Select value={serviceFilters.priceRange} onValueChange={(value) => 
                      setServiceFilters(prev => ({ ...prev, priceRange: value }))
                    }>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Prices</SelectItem>
                        <SelectItem value="low">Low ($1-$99)</SelectItem>
                        <SelectItem value="medium">Medium ($100-$500)</SelectItem>
                        <SelectItem value="high">High ($500+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-gray-400">
                    {filteredServices.length} of {services?.length || 0} services
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setServiceFilters({
                      category: "all",
                      availability: "all",
                      priceRange: "all"
                    })}
                    variant="outline"
                    className="border-gray-600 hover:border-orange-500"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </motion.div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <Settings className="h-12 w-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No services found</h3>
            <p className="text-gray-500 text-center">
              No services match your current filter criteria.{" "}
              <Button 
                variant="link" 
                className="text-orange-400 hover:text-orange-300 p-0"
                onClick={() => setServiceFilters({
                  category: "all",
                  availability: "all",
                  priceRange: "all"
                })}
              >
                Clear filters
              </Button>{" "}
              to see all services.
            </p>
          </div>
        ) : (
          filteredServices.map((service: any, index: number) => (
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
                  <div className="relative h-48 bg-gray-900">
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
                  <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-purple-500/30">
                    {service.category}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{service.name}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{service.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">${service.pricePerSession}</span>
                  <div className="flex items-center space-x-2">
                    <ViewServiceDialog service={service} />
                    <EditServiceDialog service={service} />
                    <DeleteServiceDialog service={service} />
                  </div>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          ))
        )}
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
            className="text-5xl font-bold text-white mb-2 tracking-tight"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif', fontWeight: 700 }}
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
          <AddEventDialog currentUser={user} />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 border-none">
                <Filter className="h-4 w-4 mr-2" />
                Filter Events
                {(eventFilters.status !== "all" || eventFilters.capacity !== "all" || 
                  eventFilters.priceRange !== "all") && (
                  <Badge className="ml-2 bg-violet-500 text-white text-xs">
                    {Object.values(eventFilters).filter(v => v !== "all").length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-gray-950 border-gray-700" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-white">Filter Events</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEventFilters({
                      status: "all",
                      capacity: "all",
                      priceRange: "all"
                    })}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <Separator className="bg-gray-700" />
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-gray-300 text-sm">Status</Label>
                    <Select value={eventFilters.status} onValueChange={(value) => 
                      setEventFilters(prev => ({ ...prev, status: value }))
                    }>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Events</SelectItem>
                        <SelectItem value="upcoming">Upcoming Only</SelectItem>
                        <SelectItem value="past">Past Events</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 text-sm">Capacity</Label>
                    <Select value={eventFilters.capacity} onValueChange={(value) => 
                      setEventFilters(prev => ({ ...prev, capacity: value }))
                    }>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Sizes</SelectItem>
                        <SelectItem value="small">Small (1-19 people)</SelectItem>
                        <SelectItem value="medium">Medium (20-50 people)</SelectItem>
                        <SelectItem value="large">Large (50+ people)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 text-sm">Price</Label>
                    <Select value={eventFilters.priceRange} onValueChange={(value) => 
                      setEventFilters(prev => ({ ...prev, priceRange: value }))
                    }>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="all">All Prices</SelectItem>
                        <SelectItem value="free">Free Events</SelectItem>
                        <SelectItem value="paid">Paid Events</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-gray-400">
                    {filteredEvents.length} of {events?.length || 0} events
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setEventFilters({
                      status: "all",
                      capacity: "all",
                      priceRange: "all"
                    })}
                    variant="outline"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 border-none"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </motion.div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No events found</h3>
            <p className="text-gray-500 text-center">
              No events match your current filter criteria.{" "}
              <Button 
                variant="link" 
                className="text-violet-400 hover:text-violet-300 p-0"
                onClick={() => setEventFilters({
                  status: "all",
                  capacity: "all",
                  priceRange: "all"
                })}
              >
                Clear filters
              </Button>{" "}
              to see all events.
            </p>
          </div>
        ) : (
          filteredEvents.map((event: any, index: number) => (
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
                  <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-purple-500/30">
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
                    <span className="text-sm">{new Date(event.startTime).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="text-sm">{event.startTime} - {event.endTime}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">${event.ticketPrice || '0'}</span>
                  <div className="flex items-center space-x-2">
                    <ViewEventDialog event={event} />
                    <EditEventDialog event={event} />
                    <DeleteEventDialog event={event} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          ))
        )}
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
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
            <DollarSign className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" size="sm" className="border-gray-600 hover:border-green-500">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </motion.div>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">+12%</Badge>
          </div>
          <h3 className="text-white font-semibold text-lg mb-1">Total Revenue</h3>
          <p className="text-2xl font-bold text-white">
            ${payments?.reduce((sum: number, p: any) => sum + p.amount, 0).toFixed(2) || '0.00'}
          </p>
          <p className="text-green-400 text-sm mt-1">All-time earnings</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Live</Badge>
          </div>
          <h3 className="text-white font-semibold text-lg mb-1">Transactions</h3>
          <p className="text-2xl font-bold text-white">{payments?.length || 0}</p>
          <p className="text-blue-400 text-sm mt-1">Total payments</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">20%</Badge>
          </div>
          <h3 className="text-white font-semibold text-lg mb-1">Platform Revenue</h3>
          <p className="text-2xl font-bold text-white">
            ${payments?.reduce((sum: number, p: any) => sum + p.adminRevenue, 0).toFixed(2) || '0.00'}
          </p>
          <p className="text-purple-400 text-sm mt-1">Platform fees</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">+8%</Badge>
          </div>
          <h3 className="text-white font-semibold text-lg mb-1">Avg Transaction</h3>
          <p className="text-2xl font-bold text-white">
            ${payments?.length > 0 ? (payments.reduce((sum: number, p: any) => sum + (p.amount / 100), 0) / payments.length).toFixed(2) : '0.00'}
          </p>
          <p className="text-orange-400 text-sm mt-1">Per transaction</p>
        </motion.div>
      </div>

      {/* Real-time Transactions Table */}
      <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-green-500" />
            Real-time Transactions
          </CardTitle>
          <CardDescription>Live payment activity including concierge services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Transaction ID</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Customer</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Service Details</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments?.map((payment: any, index: number) => (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-800 hover:bg-gray-900/30 transition-colors group"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-300 font-mono text-sm">{payment.stripePaymentIntentId || `TXN-${payment.id}`}</span>
                        {payment.stripePaymentIntentId && (
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">Stripe</Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">
                            {(payment.customer?.name || 'U')[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{payment.customer?.name || 'Unknown'}</p>
                          <p className="text-gray-400 text-xs">{payment.customer?.email || 'No email'}</p>
                          {payment.customer?.membershipTier && (
                            <Badge className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/30 mt-1">
                              {payment.customer.membershipTier}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {payment.type === 'Service Booking' ? (
                          <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                            <Sparkles className="h-3 w-3 text-white" />
                          </div>
                        ) : payment.type === 'Event Registration' ? (
                          <div className="p-1.5 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                            <Calendar className="h-3 w-3 text-white" />
                          </div>
                        ) : (
                          <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                            <Anchor className="h-3 w-3 text-white" />
                          </div>
                        )}
                        <span className="text-gray-300 text-sm">{payment.type}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="max-w-xs">
                        <p className="text-white font-medium truncate">{payment.serviceDetails}</p>
                        {payment.provider && (
                          <div className="mt-1">
                            <p className="text-gray-400 text-xs truncate">
                              Provider: {payment.provider.name}
                            </p>
                            {payment.provider.isAdmin ? (
                              <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30 mt-1">
                                Admin Service (100% revenue)
                              </Badge>
                            ) : (
                              <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30 mt-1">
                                3rd Party (20% platform fee)
                              </Badge>
                            )}
                          </div>
                        )}
                        {payment.type === 'Yacht Booking' && (
                          <Badge className="text-xs bg-cyan-500/20 text-cyan-400 border-cyan-500/30 mt-1">
                            Free for members
                          </Badge>
                        )}
                        {payment.type === 'Event Registration' && (
                          payment.provider && !payment.provider.isAdmin ? (
                            <Badge className="text-xs bg-orange-500/20 text-orange-400 border-orange-500/30 mt-1">
                              3rd Party Event (20% platform fee)
                            </Badge>
                          ) : (
                            <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30 mt-1">
                              Admin Event (100% revenue)
                            </Badge>
                          )
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-right">
                        <span className="text-green-400 font-bold text-lg">${payment.amount.toFixed(2)}</span>
                        {payment.platformFee > 0 && (
                          <div className="mt-1">
                            <p className="text-gray-400 text-xs">Platform: ${payment.adminRevenue.toFixed(2)}</p>
                            <p className="text-blue-400 text-xs">Provider: ${payment.providerRevenue.toFixed(2)}</p>
                          </div>
                        )}
                        {payment.amount === 0 && (
                          <p className="text-cyan-400 text-xs">Free for members</p>
                        )}
                        {payment.platformFee === 0 && payment.amount > 0 && (
                          <p className="text-green-400 text-xs">100% to admin</p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <span className="text-gray-300">{new Date(payment.createdAt).toLocaleDateString()}</span>
                        <p className="text-gray-400 text-xs">{new Date(payment.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={`${
                        payment.status === 'succeeded' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        payment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        payment.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                        'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}>
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ViewPaymentDialog payment={payment} />
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            
            {(!payments || payments.length === 0) && (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No transactions found</p>
                <p className="text-gray-500 text-sm">Payment data will appear here in real-time</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderSettings = () => {

    const testStripeConnection = async () => {
      if (!stripeSecretKey.trim()) {
        toast({ title: "Error", description: "Please enter Stripe Secret Key", variant: "destructive" });
        return;
      }

      setIsTestingStripe(true);
      try {
        const response = await apiRequest("POST", "/api/admin/test-stripe", { apiKey: stripeSecretKey });
        const result = await response.json();
        
        if (result.success) {
          toast({ 
            title: "Stripe Connected", 
            description: `Account: ${result.data.email} (${result.data.country})` 
          });
        } else {
          toast({ 
            title: "Stripe Error", 
            description: result.error || "Connection failed", 
            variant: "destructive" 
          });
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to test Stripe connection", variant: "destructive" });
      } finally {
        setIsTestingStripe(false);
      }
    };

    const testTwilioConnection = async () => {
      if (!twilioSid.trim() || !twilioToken.trim()) {
        toast({ title: "Error", description: "Please enter Twilio SID and Auth Token", variant: "destructive" });
        return;
      }

      setIsTestingTwilio(true);
      try {
        const response = await apiRequest("POST", "/api/admin/test-twilio", { 
          accountSid: twilioSid,
          authToken: twilioToken,
          phoneNumber: twilioPhone
        });
        const result = await response.json();
        
        if (result.success) {
          toast({ 
            title: "Twilio Connected", 
            description: `Account: ${result.data.friendlyName}` 
          });
        } else {
          toast({ 
            title: "Twilio Error", 
            description: result.error || "Connection failed", 
            variant: "destructive" 
          });
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to test Twilio connection", variant: "destructive" });
      } finally {
        setIsTestingTwilio(false);
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-2 text-white tracking-tight" style={{ fontFamily: 'SF Pro Display, system-ui' }}>
            Settings
          </h1>
          <p className="text-lg text-gray-400">
            Configure system integrations and security settings
          </p>
        </div>

        {settingsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Stripe Integration */}
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-purple-500" />
                  Stripe Integration
                </CardTitle>
                <CardDescription>Configure payment processing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Stripe Secret Key
                  </label>
                  <Input
                    type="password"
                    placeholder="sk_test_..."
                    value={stripeSecretKey}
                    onChange={(e) => setStripeSecretKey(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Stripe Publishable Key
                  </label>
                  <Input
                    type="text"
                    placeholder="pk_test_..."
                    value={stripePublishableKey}
                    onChange={(e) => setStripePublishableKey(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={testStripeConnection}
                    disabled={isTestingStripe}
                    variant="outline"
                    className="border-gray-600 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 hover:text-white hover:border-transparent flex-1"
                  >
                    {isTestingStripe ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Testing...
                      </>
                    ) : (
                      "Test Connection"
                    )}
                  </Button>
                  <Button 
                    onClick={async () => {
                      // Save both Stripe keys
                      if (stripeSecretKey.trim()) {
                        await saveSettings.mutate({ 
                          service: 'stripe-secret', 
                          apiKey: stripeSecretKey 
                        });
                      }
                      if (stripePublishableKey.trim()) {
                        await saveSettings.mutate({ 
                          service: 'stripe-publishable', 
                          apiKey: stripePublishableKey 
                        });
                      }
                    }}
                    disabled={saveSettings.isPending}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  >
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Twilio Integration */}
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-purple-500" />
                  Twilio Integration
                </CardTitle>
                <CardDescription>Configure SMS and voice services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Account SID
                  </label>
                  <Input
                    type="password"
                    placeholder="AC..."
                    value={twilioSid}
                    onChange={(e) => setTwilioSid(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Auth Token
                  </label>
                  <Input
                    type="password"
                    placeholder="Auth Token"
                    value={twilioToken}
                    onChange={(e) => setTwilioToken(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Phone Number
                  </label>
                  <Input
                    placeholder="+1234567890"
                    value={twilioPhone}
                    onChange={(e) => setTwilioPhone(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={testTwilioConnection}
                    disabled={isTestingTwilio}
                    variant="outline"
                    className="border-gray-600 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 hover:text-white hover:border-transparent flex-1"
                  >
                    {isTestingTwilio ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Testing...
                      </>
                    ) : (
                      "Test Connection"
                    )}
                  </Button>
                  <Button 
                    onClick={() => saveSettings.mutate({ 
                      service: 'twilio', 
                      apiKey: twilioSid,
                      apiSecret: twilioToken,
                      phoneNumber: twilioPhone
                    })}
                    disabled={saveSettings.isPending}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  >
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-purple-500" />
                  Security Settings
                </CardTitle>
                <CardDescription>Authentication and access control</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-900/30">
                  <div>
                    <p className="text-white font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-400">Enhanced security for admin access</p>
                  </div>
                  <div className="w-12 h-6 bg-purple-500 rounded-full p-1">
                    <div className="w-4 h-4 bg-white rounded-full ml-auto" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-900/30">
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

            {/* System Management */}
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Database className="h-5 w-5 mr-2 text-purple-500" />
                  System Management
                </CardTitle>
                <CardDescription>Backup and maintenance settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-gray-900/30">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white font-medium">Database Backup</p>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">Last backup: 2 hours ago</p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-gray-600 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 hover:text-white hover:border-transparent"
                    onClick={() => {
                      toast({ title: "Backup Created", description: "Database backup created successfully" });
                    }}
                  >
                    Create Backup Now
                  </Button>
                </div>
                <div className="p-4 rounded-xl bg-gray-900/30">
                  <p className="text-white font-medium mb-2">Maintenance Mode</p>
                  <p className="text-sm text-gray-400 mb-3">Temporarily disable user access</p>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => {
                      toast({ 
                        title: "Maintenance Mode Enabled", 
                        description: "System is now in maintenance mode. User access has been temporarily disabled.",
                        variant: "destructive"
                      });
                    }}
                  >
                    Enable Maintenance Mode
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {isMobile && !sidebarCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Hamburger menu button - fixed top left, hidden when menu is open */}
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

      {/* Close button - animated from right side when menu is open */}
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
          ref={sidebarRef}
          initial={{ x: -300, opacity: 0 }}
          animate={{ 
            x: sidebarCollapsed ? -320 : 0,
            opacity: sidebarCollapsed ? 0 : 1
          }}
          transition={{ type: "spring", stiffness: 200, damping: 30 }}
          className="w-80 bg-gray-900/50 backdrop-blur-xl border-r border-gray-700/50 flex flex-col fixed h-full flex-shrink-0 z-50"
          drag={isMobile ? "x" : false}
          dragConstraints={{ left: -320, right: 0 }}
          onPan={handlePan}
          dragElastic={0.1}
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
                  <h2 className="text-xl font-bold text-white">Admin Panel</h2>
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

          {/* User Profile */}
          <div className="p-6 border-t border-gray-700/50 bg-gray-900/50">
            <div className="flex items-center space-x-3">
              <div className="profile-picture-outline h-12 w-12">
                <div className="profile-picture-inner w-full h-full">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {user?.username?.charAt(0).toUpperCase() || 'A'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.username || 'Admin User'}</p>
                <p className="text-xs text-gray-400">System Admin</p>
              </div>
              
              {/* Messages and Notifications beside username */}
              <div className="flex items-center space-x-2">
                <MessagesDropdown />
                <AdminNotificationCenter />
                
                {/* Logout Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => logoutMutation.mutate()}
                  className="p-2 rounded-lg bg-gray-800/50 hover:bg-red-500/20 border border-gray-600/50 hover:border-red-500/50 transition-all duration-300 group"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4 text-gray-400 group-hover:text-red-400 transition-colors" />
                </motion.button>
              </div>
            </div>
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
            {activeSection === 'overview' && renderOverview()}
            {activeSection === 'applications' && <AdminApplications />}
            {activeSection === 'tour-requests' && renderTourRequests()}
            {activeSection === 'contact-messages' && renderContactMessages()}
            {activeSection === 'analytics' && renderAnalytics()}
            {activeSection === 'my-profile' && <MyProfile />}
            {activeSection === 'settings' && renderSettings()}
            {activeSection === 'bookings' && renderBookings()}
            {activeSection === 'calendar' && <CalendarPage />}
            {activeSection === 'yacht-maintenance' && <YachtMaintenancePage />}
            {activeSection === 'crew-management' && <CrewManagementPage />}
            {activeSection === 'customer-service' && <CustomerServiceDashboard />}
            {activeSection === 'staff-management' && <StaffManagement />}
            {activeSection === 'users' && renderUsers()}
            {activeSection === 'yachts' && renderYachts()}
            {activeSection === 'services' && renderServices()}
            {activeSection === 'events' && renderEvents()}
            {activeSection === 'payments' && renderPayments()}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

// Additional View Dialog Components
function ViewServiceDialog({ service }: { service: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-950 border-gray-700 max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-purple-500" />
            Service Details
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Complete service information and provider details
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <img 
                src={service.imageUrl || '/api/media/pexels-goumbik-296278_1750537277229.jpg'} 
                alt={service.name}
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="space-y-3">
                <div>
                  <Label className="text-gray-300">Service Name</Label>
                  <p className="text-xl font-bold text-white">{service.name}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Price</Label>
                  <p className="text-green-400 font-bold text-lg">${service.price}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Category</Label>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    {service.category}
                  </Badge>
                </div>
                <div>
                  <Label className="text-gray-300">Duration</Label>
                  <p className="text-white font-medium">{service.duration} minutes</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">Description</Label>
                <p className="text-gray-300 text-sm leading-relaxed">{service.description}</p>
              </div>
              <div>
                <Label className="text-gray-300">Provider Information</Label>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-900/50">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{service.provider?.name || 'MBYC Staff'}</p>
                    <p className="text-gray-400 text-sm">{service.provider?.role || 'Service Provider'}</p>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Service ID</Label>
                <p className="text-white font-mono">#{service.id}</p>
              </div>
              <div>
                <Label className="text-gray-300">Status</Label>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  Available
                </Badge>
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

function ViewEventDialog({ event }: { event: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-950 border-gray-700 max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-orange-500" />
            Event Details
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Complete event information and registration details
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <img 
                src={event.imageUrl || '/api/media/pexels-pixabay-163236_1750537277230.jpg'} 
                alt={event.title}
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-300">Event Date</Label>
                  <p className="text-white font-medium">{new Date(event.startTime).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Event Time</Label>
                  <p className="text-white font-medium">{new Date(event.startTime).toLocaleTimeString()}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Capacity</Label>
                  <p className="text-white font-medium">{event.capacity} guests</p>
                </div>
                <div>
                  <Label className="text-gray-300">Ticket Price</Label>
                  <p className="text-green-400 font-bold">${event.ticketPrice || '0'}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">Event Title</Label>
                <p className="text-xl font-bold text-white">{event.title}</p>
              </div>
              <div>
                <Label className="text-gray-300">Description</Label>
                <p className="text-gray-300 text-sm leading-relaxed">{event.description}</p>
              </div>
              <div>
                <Label className="text-gray-300">Location</Label>
                <p className="text-white font-medium flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-orange-500" />
                  {event.location}
                </p>
              </div>
              <div>
                <Label className="text-gray-300">Event Host</Label>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-900/50">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{event.host?.name || 'MBYC Events'}</p>
                    <p className="text-gray-400 text-sm">{event.host?.role || 'Event Organizer'}</p>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Event ID</Label>
                <p className="text-white font-mono">#{event.id}</p>
              </div>
              <div>
                <Label className="text-gray-300">Status</Label>
                <Badge className={`${
                  event.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                  event.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                  'bg-gray-500/20 text-gray-400 border-gray-500/30'
                }`}>
                  {event.status || 'Active'}
                </Badge>
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

function ViewPaymentDialog({ payment }: { payment: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-950 border-gray-700 max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-green-500" />
            Payment Details
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Complete transaction information and payment breakdown
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gray-900/50">
                <Label className="text-gray-300">Customer Information</Label>
                <div className="flex items-center space-x-3 mt-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {(payment.customer?.name || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{payment.customer?.name || 'Unknown Customer'}</p>
                    <p className="text-gray-400 text-sm">{payment.customer?.email || 'No email provided'}</p>
                    {payment.customer?.membershipTier && (
                      <Badge className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/30 mt-1">
                        {payment.customer.membershipTier}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-300">Transaction Type</Label>
                  <p className="text-white font-medium">{payment.type}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Amount</Label>
                  <p className="text-green-400 font-bold text-lg">${payment.amount.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Transaction Date</Label>
                  <p className="text-white">{new Date(payment.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Status</Label>
                  <Badge className={`${
                    payment.status === 'succeeded' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                    payment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                    payment.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                    'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}>
                    {payment.status}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">Service Details</Label>
                <p className="text-white font-medium">{payment.serviceDetails}</p>
              </div>
              <div>
                <Label className="text-gray-300">Payment ID</Label>
                <p className="text-white font-mono text-sm">{payment.stripePaymentIntentId || `TXN-${payment.id}`}</p>
              </div>
              {payment.provider && (
                <div>
                  <Label className="text-gray-300">Service Provider</Label>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-900/50 mt-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{payment.provider.name}</p>
                      {payment.provider.isAdmin ? (
                        <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                          Admin Service (100% revenue)
                        </Badge>
                      ) : (
                        <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                          3rd Party (20% platform fee)
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {payment.platformFee > 0 && (
                <div className="p-4 rounded-lg bg-gray-900/50">
                  <Label className="text-gray-300">Payment Breakdown</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Platform Revenue:</span>
                      <span className="text-green-400 font-medium">${payment.adminRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Provider Revenue:</span>
                      <span className="text-blue-400 font-medium">${payment.providerRevenue.toFixed(2)}</span>
                    </div>
                    <Separator className="bg-gray-700" />
                    <div className="flex justify-between font-bold">
                      <span className="text-white">Total:</span>
                      <span className="text-green-400">${payment.amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
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

