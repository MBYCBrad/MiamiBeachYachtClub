import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Wrench, Settings, AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown,
  Anchor, Zap, Droplets, Fuel, Sun, Waves, Calendar, DollarSign, Target,
  Activity, BarChart3, PieChart, LineChart, Gauge, Timer, MapPin, Users, Lock
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

// Form schemas
const tripLogSchema = z.object({
  yachtId: z.number(),
  bookingId: z.number().optional(),
  startTime: z.string(),
  startLocation: z.string().min(1, "Start location is required"),
  crewSize: z.number().min(1).max(20),
  weatherConditions: z.string().min(1, "Weather conditions are required"),
  seaConditions: z.string().min(1, "Sea conditions are required"),
  startFuelLevel: z.number().min(0).max(100),
  startBatteryLevel: z.number().min(0).max(100),
  startWaterLevel: z.number().min(0).max(100),
  startWasteLevel: z.number().min(0).max(100),
  plannedRoute: z.string().optional(),
  specialInstructions: z.string().optional(),
});

const maintenanceRecordSchema = z.object({
  yachtId: z.number(),
  componentId: z.number().optional(),
  taskType: z.string().min(1, "Task type is required"),
  description: z.string().min(1, "Description is required"),
  scheduledDate: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  estimatedCost: z.number().min(0),
  assignedTo: z.string().optional(),
  beforeCondition: z.number().min(0).max(10),
  notes: z.string().optional(),
});

const conditionAssessmentSchema = z.object({
  yachtId: z.number(),
  componentId: z.number().optional(),
  assessmentType: z.string().min(1, "Assessment type is required"),
  conditionScore: z.number().min(0).max(10),
  findings: z.string().min(1, "Findings are required"),
  recommendations: z.string().optional(),
  assessedBy: z.string().min(1, "Assessor name is required"),
  nextAssessmentDate: z.string().optional(),
});

export default function YachtMaintenance() {
  const [selectedYacht, setSelectedYacht] = useState<number | null>(33); // Default to Marina Breeze
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Check user access - only yacht owners and admins can access maintenance
  if (!user || (user.role !== 'admin' && user.role !== 'yacht_owner')) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Access Restricted</h2>
          <p className="text-gray-400 mb-4">
            The Yacht Maintenance System is only accessible to yacht owners and administrators.
          </p>
          <p className="text-sm text-gray-500">
            Current role: {user?.role || 'Not authenticated'}
          </p>
        </div>
      </div>
    );
  }

  // Data queries
  const { data: yachts = [], isLoading: yachtsLoading } = useQuery({
    queryKey: ['/api/yachts'],
  });

  const { data: maintenanceOverview = {}, isLoading: overviewLoading } = useQuery({
    queryKey: ['/api/maintenance/overview', 33],
    queryFn: async () => {
      const response = await fetch(`/api/maintenance/overview/33`);
      if (!response.ok) throw new Error('Failed to fetch maintenance overview');
      return response.json();
    },
  });

  const { data: tripLogs = [], isLoading: tripsLoading } = useQuery({
    queryKey: ['/api/maintenance/trip-logs'],
  });

  const { data: maintenanceRecords = [], isLoading: maintenanceLoading } = useQuery({
    queryKey: ['/api/maintenance/records'],
  });

  const { data: conditionAssessments = [], isLoading: assessmentsLoading } = useQuery({
    queryKey: ['/api/maintenance/assessments'],
  });

  const { data: valuationData = {}, isLoading: valuationLoading } = useQuery({
    queryKey: ['/api/maintenance/valuation'],
  });

  const { data: usageMetrics = [], isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/maintenance/usage-metrics'],
  });

  const { data: yachtComponents = [], isLoading: componentsLoading } = useQuery({
    queryKey: ['/api/maintenance/components'],
  });

  const { data: maintenanceSchedules = [], isLoading: schedulesLoading } = useQuery({
    queryKey: ['/api/maintenance/schedules'],
  });

  // Forms
  const tripForm = useForm({
    resolver: zodResolver(tripLogSchema),
    defaultValues: {
      yachtId: selectedYacht || 0,
      startTime: new Date().toISOString().slice(0, 16),
      crewSize: 2,
      startFuelLevel: 100,
      startBatteryLevel: 100,
      startWaterLevel: 100,
      startWasteLevel: 0,
    }
  });

  const maintenanceForm = useForm({
    resolver: zodResolver(maintenanceRecordSchema),
    defaultValues: {
      yachtId: selectedYacht || 0,
      scheduledDate: new Date().toISOString().slice(0, 16),
      priority: 'medium' as const,
      estimatedCost: 0,
      beforeCondition: 5,
    }
  });

  const assessmentForm = useForm({
    resolver: zodResolver(conditionAssessmentSchema),
    defaultValues: {
      yachtId: selectedYacht || 0,
      conditionScore: 7,
    }
  });

  // Mutations
  const createTripLogMutation = useMutation({
    mutationFn: async (data: z.infer<typeof tripLogSchema>) => {
      const res = await apiRequest("POST", "/api/maintenance/trip-logs", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/maintenance'] });
      toast({ title: "Trip log created successfully" });
    },
  });

  const createMaintenanceMutation = useMutation({
    mutationFn: async (data: z.infer<typeof maintenanceRecordSchema>) => {
      const res = await apiRequest("POST", "/api/maintenance/records", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/maintenance'] });
      toast({ title: "Maintenance record created successfully" });
    },
  });

  const createAssessmentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof conditionAssessmentSchema>) => {
      const res = await apiRequest("POST", "/api/maintenance/assessments", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/maintenance'] });
      toast({ title: "Condition assessment created successfully" });
    },
  });

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
              <h1 className="text-5xl font-bold text-white mb-2 tracking-tight" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif', fontWeight: 700 }}>Yacht Maintenance System</h1>
              <p className="text-lg text-gray-400">Comprehensive yacht tracking, maintenance, and resale optimization</p>
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
            <p className="text-gray-400 mb-8">Choose a yacht below to view its maintenance dashboard</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {yachts.map((yacht: any) => (
                <motion.div
                  key={yacht.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gray-900/50 border-gray-700/50 rounded-lg border p-6 cursor-pointer hover:border-purple-500/50"
                  onClick={() => setSelectedYacht(yacht.id)}
                >
                  {yacht.images && yacht.images[0] && (
                    <img
                      src={yacht.images[0]}
                      alt={yacht.name}
                      className="w-full h-32 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h3 className="text-lg font-semibold text-white mb-2">{yacht.name}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{yacht.size}ft</span>
                    <span>{yacht.location}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Yacht Header */}
          <div className="bg-gray-900/50 rounded-lg border border-gray-700/50 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {selectedYachtData?.images?.[0] && (
                  <img
                    src={selectedYachtData.images[0]}
                    alt={selectedYachtData.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedYachtData?.name}</h2>
                  <div className="flex items-center gap-4 text-gray-400 mt-1">
                    <span>{selectedYachtData?.size}ft</span>
                    <span>•</span>
                    <span>{selectedYachtData?.location}</span>
                    <span>•</span>
                    <span>Capacity: {selectedYachtData?.capacity}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-gray-900/50 border border-gray-700/50">
              <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600">Overview</TabsTrigger>
              <TabsTrigger value="trips" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600">Trip Logs</TabsTrigger>
              <TabsTrigger value="maintenance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600">Maintenance</TabsTrigger>
              <TabsTrigger value="assessments" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600">Assessments</TabsTrigger>
              <TabsTrigger value="valuation" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600">Valuation</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/50/60 transition-all duration-500 hover:border-purple-500/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Engine Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">14.0h</div>
                    <p className="text-xs text-gray-500 mt-1">From 3 completed trips</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/50/60 transition-all duration-500 hover:border-purple-500/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Sun Exposure
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">11.2h</div>
                    <p className="text-xs text-gray-500 mt-1">UV exposure tracked</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/50/60 transition-all duration-500 hover:border-purple-500/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Overdue Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-400">{maintenanceOverview.overdueTasks || 0}</div>
                    <p className="text-xs text-gray-500 mt-1">Requires attention</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/50/60 transition-all duration-500 hover:border-purple-500/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <Gauge className="h-4 w-4" />
                      Condition Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-400">8.5/10</div>
                    <p className="text-xs text-gray-500 mt-1">From baseline assessments</p>
                  </CardContent>
                </Card>
              </div>

              {/* System Components Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/50/60 transition-all duration-500 hover:border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      System Components
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: "Main Engine", status: "operational", condition: 92, lastCheck: "2025-06-20" },
                        { name: "Navigation System", status: "operational", condition: 88, lastCheck: "2025-06-18" },
                        { name: "Hull Integrity", status: "good", condition: 85, lastCheck: "2025-06-15" },
                        { name: "Electrical System", status: "operational", condition: 90, lastCheck: "2025-06-19" }
                      ].map((component, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{component.name}</p>
                            <p className="text-xs text-gray-400">
                              Status: {component.status} • Last: {component.lastCheck}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={component.condition} className="w-20" />
                            <span className="text-sm text-white w-8">
                              {component.condition}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/50/60 transition-all duration-500 hover:border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          action: 'Trip completed',
                          details: 'Miami Beach → Key Biscayne • 5.5h engine time',
                          time: '6/23/2025, 10:00:00 AM',
                          icon: MapPin,
                          color: 'text-green-400'
                        },
                        {
                          action: 'Trip completed', 
                          details: 'Key Biscayne → Miami Beach • 4.0h engine time',
                          time: '6/22/2025, 2:00:00 PM',
                          icon: MapPin,
                          color: 'text-green-400'
                        },
                        {
                          action: 'Maintenance completed',
                          details: 'Engine service • $450',
                          time: '6/20/2025, 9:00:00 AM',
                          icon: CheckCircle,
                          color: 'text-green-400'
                        },
                        {
                          action: 'Trip completed',
                          details: 'Miami Beach → Fisher Island • 4.5h engine time', 
                          time: '6/21/2025, 11:00:00 AM',
                          icon: MapPin,
                          color: 'text-green-400'
                        }
                      ].map((activity, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="bg-purple-600/20 p-2 rounded-lg">
                            <activity.icon className={`h-4 w-4 ${activity.color || 'text-purple-400'}`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium">{activity.action}</p>
                            <p className="text-xs text-gray-400">{activity.details}</p>
                            <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Trip Logs Tab */}
            <TabsContent value="trips">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">Trip Logs</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <MapPin className="h-4 w-4 mr-2" />
                      Complete Trip
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/50/60 transition-all duration-500 hover:border-purple-500/30 max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-white">Complete Trip Log</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-gray-400">Complete the current active trip with end conditions and notes.</p>
                      {/* Complete trip form would go here */}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-6">
                {tripLogs.length > 0 ? tripLogs.map((trip: any) => (
                  <Card key={trip.id} className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/50/60 transition-all duration-500 hover:border-purple-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Badge variant={trip.status === 'completed' ? 'default' : 'secondary'}>
                            {trip.status}
                          </Badge>
                          <span className="text-white font-medium">
                            {new Date(trip.startTime).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Users className="h-4 w-4" />
                          <span>{trip.crewSize} crew</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Fuel className="h-4 w-4 text-blue-400" />
                          <div>
                            <p className="text-xs text-gray-400">Fuel</p>
                            <p className="text-white">{trip.startFuelLevel}% → {trip.endFuelLevel || '?'}%</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-yellow-400" />
                          <div>
                            <p className="text-xs text-gray-400">Battery</p>
                            <p className="text-white">{trip.startBatteryLevel}% → {trip.endBatteryLevel || '?'}%</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Droplets className="h-4 w-4 text-cyan-400" />
                          <div>
                            <p className="text-xs text-gray-400">Water</p>
                            <p className="text-white">{trip.startWaterLevel}% → {trip.endWaterLevel || '?'}%</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Waves className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-400">Waste</p>
                            <p className="text-white">{trip.startWasteLevel}% → {trip.endWasteLevel || '?'}%</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="text-gray-400">
                          Route: {trip.startLocation} → {trip.endLocation || 'In Progress'}
                        </div>
                        <div className="text-gray-400">
                          Duration: {trip.endTime ? 
                            `${Math.round((new Date(trip.endTime).getTime() - new Date(trip.startTime).getTime()) / (1000 * 60 * 60))}h` : 
                            'Ongoing'
                          }
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                    <CardContent className="p-6 text-center text-gray-400">
                      No trip logs found for this yacht
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Maintenance Tab */}
            <TabsContent value="maintenance">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">Maintenance Records</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Wrench className="h-4 w-4 mr-2" />
                      Schedule Maintenance
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/50/60 transition-all duration-500 hover:border-purple-500/30 max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-white">Schedule Maintenance</DialogTitle>
                    </DialogHeader>
                    <Form {...maintenanceForm}>
                      <form onSubmit={maintenanceForm.handleSubmit((data) => createMaintenanceMutation.mutate(data))}>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <FormField
                            control={maintenanceForm.control}
                            name="taskType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Task Type</FormLabel>
                                <FormControl>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger className="bg-gray-900/50 border-gray-600">
                                      <SelectValue placeholder="Select task type..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-900/50 border-gray-600">
                                      <SelectItem value="engine_service">Engine Service</SelectItem>
                                      <SelectItem value="hull_cleaning">Hull Cleaning</SelectItem>
                                      <SelectItem value="electronics_check">Electronics Check</SelectItem>
                                      <SelectItem value="rigging_inspection">Rigging Inspection</SelectItem>
                                      <SelectItem value="safety_equipment">Safety Equipment</SelectItem>
                                      <SelectItem value="preventive">Preventive Maintenance</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={maintenanceForm.control}
                            name="priority"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Priority</FormLabel>
                                <FormControl>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger className="bg-gray-900/50 border-gray-600">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-900/50 border-gray-600">
                                      <SelectItem value="low">Low</SelectItem>
                                      <SelectItem value="medium">Medium</SelectItem>
                                      <SelectItem value="high">High</SelectItem>
                                      <SelectItem value="critical">Critical</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={maintenanceForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem className="mb-4">
                              <FormLabel className="text-white">Description</FormLabel>
                              <FormControl>
                                <Textarea {...field} className="bg-gray-900/50 border-gray-600 text-white" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <FormField
                            control={maintenanceForm.control}
                            name="estimatedCost"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Estimated Cost ($)</FormLabel>
                                <FormControl>
                                  <Input {...field} type="number" className="bg-gray-900/50 border-gray-600 text-white" onChange={(e) => field.onChange(Number(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={maintenanceForm.control}
                            name="beforeCondition"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Current Condition (1-10)</FormLabel>
                                <FormControl>
                                  <Input {...field} type="number" min="0" max="10" className="bg-gray-900/50 border-gray-600 text-white" onChange={(e) => field.onChange(Number(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={createMaintenanceMutation.isPending}>
                          {createMaintenanceMutation.isPending ? "Scheduling..." : "Schedule Maintenance"}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-6">
                {maintenanceRecords.length > 0 ? maintenanceRecords.map((record: any) => (
                  <Card key={record.id} className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/50/60 transition-all duration-500 hover:border-purple-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Badge variant={
                            record.priority === 'critical' ? 'destructive' :
                            record.priority === 'high' ? 'secondary' : 'default'
                          }>
                            {record.priority}
                          </Badge>
                          <span className="text-white font-medium">{record.taskType.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-400" />
                          <span className="text-white">${record.estimatedCost}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 mb-4">{record.description}</p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-gray-400">
                          Scheduled: {new Date(record.scheduledDate).toLocaleDateString()}
                        </div>
                        <div className="text-gray-400">
                          Status: {record.status || 'Pending'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                    <CardContent className="p-6 text-center text-gray-400">
                      No maintenance records found for this yacht
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Assessments Tab */}
            <TabsContent value="assessments">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">Condition Assessments</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      New Assessment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/50/60 transition-all duration-500 hover:border-purple-500/30 max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-white">Condition Assessment</DialogTitle>
                    </DialogHeader>
                    <Form {...assessmentForm}>
                      <form onSubmit={assessmentForm.handleSubmit((data) => createAssessmentMutation.mutate(data))}>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <FormField
                            control={assessmentForm.control}
                            name="assessmentType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Assessment Type</FormLabel>
                                <FormControl>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger className="bg-gray-900/50 border-gray-600">
                                      <SelectValue placeholder="Select assessment type..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-900/50 border-gray-600">
                                      <SelectItem value="routine_inspection">Routine Inspection</SelectItem>
                                      <SelectItem value="pre_trip_check">Pre-Trip Check</SelectItem>
                                      <SelectItem value="post_trip_check">Post-Trip Check</SelectItem>
                                      <SelectItem value="annual_survey">Annual Survey</SelectItem>
                                      <SelectItem value="damage_assessment">Damage Assessment</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={assessmentForm.control}
                            name="conditionScore"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Condition Score (1-10)</FormLabel>
                                <FormControl>
                                  <Input {...field} type="number" min="0" max="10" className="bg-gray-900/50 border-gray-600 text-white" onChange={(e) => field.onChange(Number(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={assessmentForm.control}
                          name="findings"
                          render={({ field }) => (
                            <FormItem className="mb-4">
                              <FormLabel className="text-white">Findings</FormLabel>
                              <FormControl>
                                <Textarea {...field} className="bg-gray-900/50 border-gray-600 text-white" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={assessmentForm.control}
                          name="assessedBy"
                          render={({ field }) => (
                            <FormItem className="mb-6">
                              <FormLabel className="text-white">Assessed By</FormLabel>
                              <FormControl>
                                <Input {...field} className="bg-gray-900/50 border-gray-600 text-white" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={createAssessmentMutation.isPending}>
                          {createAssessmentMutation.isPending ? "Creating..." : "Create Assessment"}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-6">
                {conditionAssessments.length > 0 ? conditionAssessments.map((assessment: any) => (
                  <Card key={assessment.id} className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/50/60 transition-all duration-500 hover:border-purple-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="border-purple-500 text-purple-400">
                            {assessment.assessmentType.replace('_', ' ')}
                          </Badge>
                          <span className="text-white font-medium">Score: {assessment.conditionScore}/10</span>
                        </div>
                        <div className="text-gray-400 text-sm">
                          {new Date(assessment.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <p className="text-gray-300 mb-4">{assessment.findings}</p>
                      
                      {assessment.recommendations && (
                        <div className="bg-gray-900/50 rounded-lg p-3 mb-4">
                          <p className="text-yellow-400 font-medium mb-1">Recommendations:</p>
                          <p className="text-gray-300 text-sm">{assessment.recommendations}</p>
                        </div>
                      )}
                      
                      <div className="text-sm text-gray-400">
                        Assessed by: {assessment.assessedBy}
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                    <CardContent className="p-6 text-center text-gray-400">
                      No condition assessments found for this yacht
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Valuation Tab */}
            <TabsContent value="valuation">
              <div className="space-y-6">
                <Card className="bg-gradient-to-r from-green-900/20 to-red-900/20 border-green-500/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Sweet Spot Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-400 mb-2">
                          ${parseInt(valuationData.currentValue || 0).toLocaleString()}
                        </div>
                        <p className="text-gray-400">Current Market Value</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-400 mb-2">
                          ${parseInt(valuationData.repairCosts || 0).toLocaleString()}
                        </div>
                        <p className="text-gray-400">Projected Repair Costs</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-400 mb-2">
                          {valuationData.sweetSpotMonths || 0} months
                        </div>
                        <p className="text-gray-400">Optimal Sell Time</p>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
                      <p className="text-white font-medium mb-2">Recommendation:</p>
                      <p className="text-gray-300">
                        {valuationData.recommendation || "Based on current condition trends and maintenance costs, consider selling within the next 12-18 months for optimal return on investment."}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/50/60 transition-all duration-500 hover:border-purple-500/30">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <TrendingDown className="h-5 w-5" />
                        Depreciation Factors
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {valuationData.depreciationFactors ? 
                          Object.entries(valuationData.depreciationFactors).map(([factor, data]: [string, any]) => (
                            <div key={factor} className="flex items-center justify-between">
                              <div>
                                <p className="text-white font-medium">{factor.replace('_', ' ')}</p>
                                <p className="text-xs text-gray-400">{data.value || data.description || 'No data'}</p>
                              </div>
                              <div className="text-right">
                                <Badge variant={
                                  data.impact === 'high' ? 'destructive' :
                                  data.impact === 'medium' ? 'secondary' : 'default'
                                }>
                                  {data.impact || 'Unknown'}
                                </Badge>
                              </div>
                            </div>
                          )) :
                          <div className="text-center text-gray-400 py-8">
                            No depreciation data available
                          </div>
                        }
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/50/60 transition-all duration-500 hover:border-purple-500/30">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <LineChart className="h-5 w-5" />
                        Value Projection
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(() => {
                          const currentValue = valuationData.currentValue || 285000;
                          const projections = [
                            { period: "Current", value: currentValue, change: 0 },
                            { period: "6 months", value: Math.round(currentValue * 0.965), change: -3.5 },
                            { period: "12 months", value: Math.round(currentValue * 0.912), change: -8.8 },
                            { period: "18 months", value: Math.round(currentValue * 0.842), change: -15.8 },
                            { period: "24 months", value: Math.round(currentValue * 0.772), change: -22.8 },
                          ];
                          return projections.map((projection) => (
                            <div key={projection.period} className="flex items-center justify-between">
                              <span className="text-white">{projection.period}</span>
                              <div className="text-right">
                                <span className="text-white">${projection.value.toLocaleString()}</span>
                                {projection.change !== 0 && (
                                  <span className={`ml-2 text-xs ${projection.change < 0 ? 'text-red-400' : 'text-green-400'}`}>
                                    {projection.change > 0 ? '+' : ''}{projection.change}%
                                  </span>
                                )}
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}