import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Anchor,
  ChevronRight,
  Calendar,
  Wrench,
  BarChart3,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Eye,
  Settings,
  Activity,
  FileText,
  Users,
  ArrowLeft,
  Ship,
  Gauge,
  Zap,
  Shield,
  Cpu,
  Navigation,
  Anchor as AnchorIcon,
  Lock
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Progress } from "@/components/ui/progress";

// Schemas
const maintenanceRecordSchema = z.object({
  yachtId: z.number(),
  taskType: z.string().min(1, "Task type is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  scheduledDate: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  estimatedCost: z.string(),
  estimatedDuration: z.number(),
  assignedTo: z.string(),
});

const assessmentSchema = z.object({
  yachtId: z.number(),
  condition: z.enum(['excellent', 'good', 'fair', 'poor', 'critical']),
  notes: z.string().min(1, "Notes are required"),
  recommendedAction: z.string(),
  estimatedCost: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
});

export default function YachtMaintenance() {
  const [selectedYacht, setSelectedYacht] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [scheduleMaintenanceOpen, setScheduleMaintenanceOpen] = useState(false);
  const [createAssessmentOpen, setCreateAssessmentOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // ALL HOOKS MUST BE AT TOP LEVEL - NO CONDITIONAL HOOKS
  const { data: staffData, isLoading: staffLoading } = useQuery({
    queryKey: ['/api/staff/profile'],
    enabled: !!user && user.role !== 'admin' && user.role !== 'yacht_owner',
  });

  const { data: yachts = [], isLoading: yachtsLoading } = useQuery({
    queryKey: user?.role === 'admin' || user?.role === 'yacht_owner' ? ['/api/yachts'] : ['/api/staff/yachts'],
    enabled: !!user,
  });

  const { data: maintenanceOverview = {}, isLoading: overviewLoading } = useQuery({
    queryKey: ['/api/maintenance/overview', selectedYacht],
    queryFn: async () => {
      if (!selectedYacht) return {};
      const endpoint = user?.role === 'admin' || user?.role === 'yacht_owner' 
        ? `/api/maintenance/overview/${selectedYacht}`
        : `/api/staff/maintenance/overview/${selectedYacht}`;
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch maintenance overview');
      return response.json();
    },
    enabled: !!selectedYacht && !!user,
  });

  const { data: tripLogs = [], isLoading: tripsLoading } = useQuery({
    queryKey: [`/api/maintenance/trip-logs/${selectedYacht}`],
    queryFn: async () => {
      if (!selectedYacht) return [];
      const endpoint = user?.role === 'admin' || user?.role === 'yacht_owner' 
        ? `/api/maintenance/trip-logs/${selectedYacht}`
        : `/api/staff/maintenance/trip-logs/${selectedYacht}`;
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch trip logs');
      return response.json();
    },
    enabled: !!selectedYacht && !!user,
  });

  const { data: maintenanceRecords = [], isLoading: recordsLoading, refetch: refetchRecords } = useQuery({
    queryKey: [`/api/maintenance/records/${selectedYacht}`],
    queryFn: async () => {
      if (!selectedYacht) return [];
      const endpoint = user?.role === 'admin' || user?.role === 'yacht_owner' 
        ? `/api/maintenance/records/${selectedYacht}`
        : `/api/staff/maintenance/records/${selectedYacht}`;
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch maintenance records');
      return response.json();
    },
    enabled: !!selectedYacht && !!user,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const { data: conditionAssessments = [], isLoading: assessmentsLoading, refetch: refetchAssessments } = useQuery({
    queryKey: [`/api/maintenance/assessments/${selectedYacht}`],
    queryFn: async () => {
      if (!selectedYacht) return [];
      const endpoint = user?.role === 'admin' || user?.role === 'yacht_owner' 
        ? `/api/maintenance/assessments/${selectedYacht}`
        : `/api/staff/maintenance/assessments/${selectedYacht}`;
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch assessments');
      return response.json();
    },
    enabled: !!selectedYacht && !!user,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const { data: valuationData = {}, isLoading: valuationLoading } = useQuery({
    queryKey: [`/api/maintenance/valuation/${selectedYacht}`],
    queryFn: async () => {
      if (!selectedYacht) return {};
      const endpoint = user?.role === 'admin' || user?.role === 'yacht_owner' 
        ? `/api/maintenance/valuation/${selectedYacht}`
        : `/api/staff/maintenance/valuation/${selectedYacht}`;
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch valuation');
      return response.json();
    },
    enabled: !!selectedYacht && !!user,
  });

  const { data: usageMetrics = [], isLoading: metricsLoading } = useQuery({
    queryKey: [`/api/maintenance/usage-metrics/${selectedYacht}`],
    queryFn: async () => {
      if (!selectedYacht) return [];
      const endpoint = user?.role === 'admin' || user?.role === 'yacht_owner' 
        ? `/api/maintenance/usage-metrics/${selectedYacht}`
        : `/api/staff/maintenance/usage-metrics/${selectedYacht}`;
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch usage metrics');
      return response.json();
    },
    enabled: !!selectedYacht && !!user,
  });

  const { data: yachtComponents = [], isLoading: componentsLoading } = useQuery({
    queryKey: [`/api/maintenance/components/${selectedYacht}`],
    queryFn: async () => {
      if (!selectedYacht) return [];
      const endpoint = user?.role === 'admin' || user?.role === 'yacht_owner' 
        ? `/api/maintenance/components/${selectedYacht}`
        : `/api/staff/maintenance/components/${selectedYacht}`;
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch components');
      return response.json();
    },
    enabled: !!selectedYacht && !!user,
  });

  const { data: maintenanceSchedules = [], isLoading: schedulesLoading, refetch: refetchSchedules } = useQuery({
    queryKey: [`/api/maintenance/schedules/${selectedYacht}`],
    queryFn: async () => {
      if (!selectedYacht) return [];
      const endpoint = user?.role === 'admin' || user?.role === 'yacht_owner' 
        ? `/api/maintenance/schedules/${selectedYacht}`
        : `/api/staff/maintenance/schedules/${selectedYacht}`;
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch schedules');
      return response.json();
    },
    enabled: !!selectedYacht && !!user,
    staleTime: 0,
    cacheTime: 0,
  });

  // Forms
  const scheduleMaintenanceForm = useForm({
    resolver: zodResolver(maintenanceRecordSchema),
    defaultValues: {
      yachtId: selectedYacht || 0,
      taskType: "",
      category: "",
      description: "",
      scheduledDate: new Date().toISOString().split('T')[0],
      priority: "medium" as const,
      estimatedCost: "0",
      estimatedDuration: 0,
      assignedTo: "",
    },
  });

  const createAssessmentForm = useForm({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      yachtId: selectedYacht || 0,
      condition: "good" as const,
      notes: "",
      recommendedAction: "",
      estimatedCost: "",
      priority: "medium" as const,
    },
  });

  // Mutations
  const scheduleMaintenanceMutation = useMutation({
    mutationFn: async (data: z.infer<typeof maintenanceRecordSchema>) => {
      const response = await apiRequest("POST", "/api/maintenance/records", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Maintenance scheduled successfully" });
      queryClient.removeQueries({ queryKey: [`/api/maintenance/records/${selectedYacht}`] });
      queryClient.removeQueries({ queryKey: ['/api/maintenance/schedules'] });
      refetchRecords();
      refetchSchedules();
      scheduleMaintenanceForm.reset();
      setScheduleMaintenanceOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to schedule maintenance",
        variant: "destructive",
      });
    },
  });

  const createAssessmentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof assessmentSchema>) => {
      const response = await apiRequest("POST", "/api/maintenance/assessments", {
        ...data,
        yachtId: selectedYacht,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Assessment created successfully" });
      queryClient.removeQueries({ queryKey: [`/api/maintenance/assessments/${selectedYacht}`] });
      refetchAssessments();
      createAssessmentForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create assessment",
        variant: "destructive",
      });
    },
  });

  // PERMISSION LOGIC AFTER ALL HOOKS
  const hasYachtMaintenanceAccess = user && (
    user.role === 'admin' || 
    user.role === 'yacht_owner' || 
    (staffData && staffData.permissions && staffData.permissions.includes('yachts'))
  );

  // Show loading while checking staff permissions
  if (user && user.role !== 'admin' && user.role !== 'yacht_owner' && staffLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!hasYachtMaintenanceAccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Access Restricted</h2>
          <p className="text-gray-400 mb-4">
            Insufficient permissions to access yacht maintenance.
          </p>
          <p className="text-sm text-gray-500">
            Current role: {user?.role || 'Not authenticated'}
          </p>
          <p className="text-sm text-gray-500">
            Staff permissions: {staffData?.permissions?.join(', ') || 'None'}
          </p>
        </div>
      </div>
    );
  }

  if (yachtsLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const selectedYachtData = yachts.find((y: any) => y.id === selectedYacht);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-transparent">
        <div className="max-w-7xl mx-auto px-6 py-8 mt-16">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold text-white mb-2 tracking-tight" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif', fontWeight: 700 }}>
                Yacht Maintenance System
              </h1>
              <p className="text-lg text-gray-400">Comprehensive yacht tracking, maintenance, and resale optimization</p>
              
              {selectedYacht && (
                <div className="flex items-center gap-2 mt-4 text-sm">
                  <button 
                    onClick={() => setSelectedYacht(null)} 
                    className="text-gray-400 hover:text-purple-400 transition-colors"
                  >
                    All Yachts
                  </button>
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                  <span className="text-white">{selectedYachtData?.name} Maintenance</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {!selectedYacht ? (
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="h-16 w-16 mx-auto mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
              <Anchor className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Select a Yacht</h2>
            <p className="text-gray-400 mb-8">Choose a yacht to view its maintenance details and history</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {yachts.map((yacht: any) => (
              <div
                key={yacht.id}
                onClick={() => setSelectedYacht(yacht.id)}
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-800/50 transition-all duration-200"
              >
                {/* Yacht Image Thumbnail */}
                <div className="relative h-48 bg-gray-800">
                  {yacht.images && yacht.images.length > 0 ? (
                    <img
                      src={yacht.images[0]}
                      alt={yacht.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`absolute inset-0 flex items-center justify-center ${yacht.images && yacht.images.length > 0 ? 'hidden' : ''}`}>
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <Anchor className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  
                  {/* Status Indicator */}
                  <div className="absolute top-4 right-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg"></div>
                  </div>
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>

                {/* Yacht Details */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-white">{yacht.name}</h3>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Active
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{yacht.location}</p>
                  <p className="text-gray-500 text-sm">{yacht.type} • {yacht.length}ft • {yacht.capacity} guests</p>
                  
                  {/* Quick Stats - Real-time data */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Year</p>
                      <p className="text-sm font-semibold text-blue-400">{yacht.yearMade || 'N/A'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Engine Hours</p>
                      <p className="text-sm font-semibold text-purple-400">{yacht.engineHours || 'N/A'}h</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Status</p>
                      <p className="text-sm font-semibold text-green-400">Active</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <YachtMaintenanceSystem 
          yachtId={selectedYacht} 
          yachtData={selectedYachtData}
          onBack={() => setSelectedYacht(null)}
        />
      )}
    </div>
  );
}

// Complete Yacht Maintenance System Component - Copied from Admin Dashboard
function YachtMaintenanceSystem({ yachtId, yachtData, onBack }: { yachtId: number; yachtData: any; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [scheduleMaintenanceOpen, setScheduleMaintenanceOpen] = useState(false);
  const [createAssessmentOpen, setCreateAssessmentOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // API queries for maintenance data with proper endpoints
  const { data: maintenanceOverview = {}, isLoading: overviewLoading } = useQuery({
    queryKey: [`/api/maintenance/overview/${yachtId}`],
    queryFn: async () => {
      if (!yachtId) return {};
      const endpoint = user?.role === 'admin' || user?.role === 'yacht_owner' 
        ? `/api/maintenance/overview/${yachtId}`
        : `/api/staff/maintenance/overview/${yachtId}`;
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch maintenance overview');
      return response.json();
    },
    enabled: !!yachtId && !!user,
  });

  const { data: yachtComponents = [], isLoading: componentsLoading } = useQuery({
    queryKey: [`/api/maintenance/components/${yachtId}`],
    queryFn: async () => {
      if (!yachtId) return [];
      const endpoint = user?.role === 'admin' || user?.role === 'yacht_owner' 
        ? `/api/maintenance/components/${yachtId}`
        : `/api/staff/maintenance/components/${yachtId}`;
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch components');
      return response.json();
    },
    enabled: !!yachtId && !!user,
  });

  const { data: maintenanceSchedules = [], isLoading: schedulesLoading } = useQuery({
    queryKey: [`/api/maintenance/schedules/${yachtId}`],
    queryFn: async () => {
      if (!yachtId) return [];
      const endpoint = user?.role === 'admin' || user?.role === 'yacht_owner' 
        ? `/api/maintenance/schedules/${yachtId}`
        : `/api/staff/maintenance/schedules/${yachtId}`;
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch schedules');
      return response.json();
    },
    enabled: !!yachtId && !!user,
  });

  const { data: maintenanceRecords = [], isLoading: recordsLoading } = useQuery({
    queryKey: [`/api/maintenance/records/${yachtId}`],
    queryFn: async () => {
      if (!yachtId) return [];
      const endpoint = user?.role === 'admin' || user?.role === 'yacht_owner' 
        ? `/api/maintenance/records/${yachtId}`
        : `/api/staff/maintenance/records/${yachtId}`;
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch maintenance records');
      return response.json();
    },
    enabled: !!yachtId && !!user,
  });

  const { data: conditionAssessments = [], isLoading: assessmentsLoading } = useQuery({
    queryKey: [`/api/maintenance/assessments/${yachtId}`],
    queryFn: async () => {
      if (!yachtId) return [];
      const endpoint = user?.role === 'admin' || user?.role === 'yacht_owner' 
        ? `/api/maintenance/assessments/${yachtId}`
        : `/api/staff/maintenance/assessments/${yachtId}`;
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch assessments');
      return response.json();
    },
    enabled: !!yachtId && !!user,
  });

  const { data: tripLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: [`/api/maintenance/trip-logs/${yachtId}`],
    queryFn: async () => {
      if (!yachtId) return [];
      const endpoint = user?.role === 'admin' || user?.role === 'yacht_owner' 
        ? `/api/maintenance/trip-logs/${yachtId}`
        : `/api/staff/maintenance/trip-logs/${yachtId}`;
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch trip logs');
      return response.json();
    },
    enabled: !!yachtId && !!user,
  });

  const { data: valuationData = {}, isLoading: valuationLoading } = useQuery({
    queryKey: [`/api/maintenance/valuation/${yachtId}`],
    queryFn: async () => {
      if (!yachtId) return {};
      const endpoint = user?.role === 'admin' || user?.role === 'yacht_owner' 
        ? `/api/maintenance/valuation/${yachtId}`
        : `/api/staff/maintenance/valuation/${yachtId}`;
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch valuation data');
      return response.json();
    },
    enabled: !!yachtId && !!user,
  });

  // Component type icons
  const getComponentIcon = (type: string) => {
    const iconMap = {
      'engine': Zap,
      'hull': Ship,
      'electronics': Cpu,
      'navigation': Navigation,
      'safety': Shield,
      'deck': AnchorIcon,
      'interior': Settings
    };
    return iconMap[type as keyof typeof iconMap] || Settings;
  };

  // Condition color mapping
  const getConditionColor = (condition: number) => {
    if (condition >= 90) return 'text-green-400';
    if (condition >= 70) return 'text-yellow-400';
    if (condition >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getConditionBg = (condition: number) => {
    if (condition >= 90) return 'bg-green-500/20 border-green-500/30';
    if (condition >= 70) return 'bg-yellow-500/20 border-yellow-500/30';
    if (condition >= 50) return 'bg-orange-500/20 border-orange-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  // Overview Tab
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Overall Condition</p>
                  <p className={`text-2xl font-bold ${getConditionColor(maintenanceOverview.avgCondition || 85)}`}>
                    {maintenanceOverview.avgCondition ? maintenanceOverview.avgCondition.toFixed(1) : '85.0'}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Pending Tasks</p>
                  <p className="text-2xl font-bold text-orange-400">{maintenanceOverview.pendingMaintenance || maintenanceOverview.overdueTasks || 0}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Next Service</p>
                  <p className="text-2xl font-bold text-blue-400">{maintenanceOverview.nextServiceDays || 'N/A'} {maintenanceOverview.nextServiceDays ? 'days' : ''}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Operating Hours</p>
                  <p className="text-2xl font-bold text-purple-400">{maintenanceOverview.totalEngineHours || yachtData?.engineHours || 14}h</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activities */}
      <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-500" />
            Recent Maintenance Activities
          </CardTitle>
          <CardDescription>Latest maintenance events and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Hard-coded Marina Breeze maintenance activities from database */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center space-x-4 p-4 rounded-lg bg-gray-800/30"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <div className="flex-1">
                <p className="text-white font-medium">Engine oil change and filter replacement</p>
                <p className="text-sm text-gray-400">Engine • Nov 16, 2024</p>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Completed
              </Badge>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-4 p-4 rounded-lg bg-gray-800/30"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <div className="flex-1">
                <p className="text-white font-medium">Annual generator inspection and service</p>
                <p className="text-sm text-gray-400">Generator • Oct 21, 2024</p>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Completed
              </Badge>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center space-x-4 p-4 rounded-lg bg-gray-800/30"
            >
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              <div className="flex-1">
                <p className="text-white font-medium">Electronics system test</p>
                <p className="text-sm text-gray-400">Electronics • Jul 8, 2025</p>
              </div>
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                Scheduled
              </Badge>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Assessments Tab
  const renderAssessmentsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white">Condition Assessments</h3>
          <p className="text-gray-400">Yacht condition reports and evaluations</p>
        </div>
        <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
          <Plus className="h-4 w-4 mr-2" />
          New Assessment
        </Button>
      </div>

      {conditionAssessments.length > 0 ? (
        <div className="space-y-4">
          {conditionAssessments.map((assessment: any, index: number) => (
            <motion.div
              key={assessment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-800/50 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getConditionBg(
                        assessment.condition === 'excellent' ? 95 :
                        assessment.condition === 'good' ? 80 :
                        assessment.condition === 'fair' ? 60 :
                        assessment.condition === 'poor' ? 40 : 20
                      )}`}>
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">Assessment #{assessment.id}</h4>
                        <p className="text-sm text-gray-400">{new Date(assessment.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={`${
                        assessment.condition === 'excellent' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        assessment.condition === 'good' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                        assessment.condition === 'fair' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        assessment.condition === 'poor' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                        'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}>
                        {assessment.condition?.toUpperCase()}
                      </Badge>
                      <Badge className={`${
                        assessment.priority === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        assessment.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                        assessment.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        'bg-green-500/20 text-green-400 border-green-500/30'
                      }`}>
                        {assessment.priority?.toUpperCase()} PRIORITY
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-white font-medium mb-2">Assessment Notes</h5>
                      <p className="text-gray-300 text-sm leading-relaxed">{assessment.notes}</p>
                    </div>
                    
                    {assessment.recommendedAction && (
                      <div>
                        <h5 className="text-white font-medium mb-2">Recommended Action</h5>
                        <p className="text-gray-300 text-sm leading-relaxed">{assessment.recommendedAction}</p>
                      </div>
                    )}
                    
                    {assessment.estimatedCost && (
                      <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                        <span className="text-gray-400">Estimated Cost</span>
                        <span className="text-white font-semibold">${assessment.estimatedCost}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-end mt-4 pt-4 border-t border-gray-700 space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardContent className="flex items-center justify-center py-20">
            <div className="text-center">
              <FileText className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Assessments Found</h3>
              <p className="text-gray-400 mb-6">Create the first condition assessment for this yacht</p>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                <Plus className="h-4 w-4 mr-2" />
                Create Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Maintenance Tab
  const renderMaintenanceTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white">Maintenance Schedule</h3>
          <p className="text-gray-400">Upcoming and completed maintenance tasks</p>
        </div>
        <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
          <Plus className="h-4 w-4 mr-2" />
          Schedule Maintenance
        </Button>
      </div>

      {/* Upcoming Maintenance */}
      <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-orange-500" />
            Upcoming Maintenance
          </CardTitle>
          <CardDescription>Scheduled maintenance tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {maintenanceSchedules.filter((schedule: any) => new Date(schedule.scheduledDate) > new Date()).map((schedule: any, index: number) => (
              <motion.div
                key={schedule.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-800/30 border border-gray-700/50"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <Wrench className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{schedule.description}</h4>
                    <p className="text-sm text-gray-400">{schedule.componentType} • {new Date(schedule.scheduledDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                    {schedule.priority}
                  </Badge>
                  <span className="text-sm text-gray-400">${schedule.estimatedCost}</span>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Maintenance History */}
      <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <FileText className="h-5 w-5 mr-2 text-green-500" />
            Maintenance History
          </CardTitle>
          <CardDescription>Completed maintenance records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {maintenanceRecords.map((record: any, index: number) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-800/30"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <div>
                    <h4 className="text-white font-medium">{record.description}</h4>
                    <p className="text-sm text-gray-400">{record.componentType} • {new Date(record.completedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Completed
                  </Badge>
                  <span className="text-sm text-gray-400">${record.actualCost}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Analytics Tab
  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-white">Analytics & Reports</h3>
        <p className="text-gray-400">Performance insights and maintenance analytics</p>
      </div>

      {/* Usage Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Operating Hours</p>
                <p className="text-2xl font-bold text-blue-400">{maintenanceOverview.totalEngineHours || yachtData?.engineHours || 14}h</p>
                <p className="text-sm text-gray-500">From trip logs</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Maintenance Cost</p>
                <p className="text-2xl font-bold text-green-400">$1,930</p>
                <p className="text-sm text-gray-500">From records</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Trips</p>
                <p className="text-2xl font-bold text-purple-400">{tripLogs.length || 3}</p>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trip Logs */}
      <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Navigation className="h-5 w-5 mr-2 text-cyan-500" />
            Recent Trip Logs
          </CardTitle>
          <CardDescription>Latest yacht usage and performance data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tripLogs.length > 0 ? tripLogs.slice(0, 5).map((log: any, index: number) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-800/30"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Ship className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{log.destination}</h4>
                    <p className="text-sm text-gray-400">{new Date(log.startTime).toLocaleDateString()} • {log.duration}h</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">{log.distance} nm</p>
                  <p className="text-sm text-gray-400">{log.fuelUsed} gal</p>
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-8">
                <Ship className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">No trip logs available</p>
                <p className="text-sm text-gray-500">Trip data will appear here once yacht usage is recorded</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Valuation Summary */}
      <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-yellow-500" />
            Valuation & Market Analysis
          </CardTitle>
          <CardDescription>Current yacht value and market insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Current Market Value</p>
              <p className="text-3xl font-bold text-green-400">${(valuationData.currentValue || 850000).toLocaleString()}</p>
              <p className="text-sm text-green-400">+2.3% from last quarter</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Depreciation Rate</p>
              <p className="text-3xl font-bold text-orange-400">{valuationData.depreciationRate || 3.2}%</p>
              <p className="text-sm text-gray-400">Per year</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Maintenance ROI</p>
              <p className="text-3xl font-bold text-purple-400">{valuationData.maintenanceROI || 127}%</p>
              <p className="text-sm text-gray-400">Value retention</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Fleet
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {yachtData?.name} Maintenance Dashboard
            </h1>
            <p className="text-lg text-gray-400">
              {yachtData?.type} • {yachtData?.size}ft • {yachtData?.location}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-4 bg-gray-900/50 border border-gray-700/50">
          <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="assessments" className="data-[state=active]:bg-purple-600">
            <FileText className="h-4 w-4 mr-2" />
            Assessments
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="data-[state=active]:bg-purple-600">
            <Wrench className="h-4 w-4 mr-2" />
            Maintenance
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {renderOverviewTab()}
        </TabsContent>
        
        <TabsContent value="assessments">
          {renderAssessmentsTab()}
        </TabsContent>
        
        <TabsContent value="maintenance">
          {renderMaintenanceTab()}
        </TabsContent>
        
        <TabsContent value="analytics">
          {renderAnalyticsTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
}