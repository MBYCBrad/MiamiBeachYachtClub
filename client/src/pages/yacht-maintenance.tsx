import { useState } from "react";
import React from "react";
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
  Activity, BarChart3, PieChart, LineChart, Gauge, Timer, MapPin, Users, Lock,
  ChevronRight, Home, Plus
} from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { insertMaintenanceRecordSchema } from "@shared/schema";

// Form schemas
// Use the proper schema from shared/schema.ts
const maintenanceRecordSchema = insertMaintenanceRecordSchema;

const assessmentSchema = z.object({
  yachtId: z.number(),
  condition: z.enum(['excellent', 'good', 'fair', 'poor', 'critical']),
  notes: z.string().min(1, "Notes are required"),
  recommendedAction: z.string().optional(),
  estimatedCost: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
});

export default function YachtMaintenance() {
  const [selectedYacht, setSelectedYacht] = useState<number | null>(33); // Default to Marina Breeze
  const [activeTab, setActiveTab] = useState("overview");
  const [scheduleMaintenanceOpen, setScheduleMaintenanceOpen] = useState(false);
  const [createAssessmentOpen, setCreateAssessmentOpen] = useState(false);
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

  const { data: maintenanceRecords = [], isLoading: recordsLoading, refetch: refetchRecords } = useQuery({
    queryKey: [`/api/maintenance/records/${selectedYacht}`],
    enabled: !!selectedYacht,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const { data: conditionAssessments = [], isLoading: assessmentsLoading, refetch: refetchAssessments } = useQuery({
    queryKey: [`/api/maintenance/assessments/${selectedYacht}`],
    enabled: !!selectedYacht,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
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

  const { data: maintenanceSchedules = [], isLoading: schedulesLoading, refetch: refetchSchedules } = useQuery({
    queryKey: ['/api/maintenance/schedules'],
    staleTime: 0,
    cacheTime: 0,
  });

  // Forms
  const scheduleMaintenanceForm = useForm({
    resolver: zodResolver(maintenanceRecordSchema),
    defaultValues: {
      yachtId: selectedYacht || 33,
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
      yachtId: selectedYacht || 33,
      condition: "good" as const,
      notes: "",
      recommendedAction: "",
      estimatedCost: "0",
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
      // Force immediate refresh of maintenance data with cache bypass
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
      // Force immediate refresh of assessment data
      queryClient.removeQueries({ queryKey: [`/api/maintenance/assessments/${selectedYacht}`] });
      refetchAssessments();
      createAssessmentForm.reset();
      setCreateAssessmentOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create assessment",
        variant: "destructive",
      });
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
              
              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 mt-4 text-sm">
                <Link href="/admin-dashboard" className="text-gray-400 hover:text-purple-400 transition-colors">
                  All Yachts
                </Link>
                <ChevronRight className="h-4 w-4 text-gray-500" />
                <span className="text-white">Marina Breeze Maintenance</span>
              </div>
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
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white">Trip Logs</h3>
                <p className="text-gray-400 mt-2">Historical trip data for maintenance tracking and engine hours monitoring</p>
              </div>

              <div className="grid gap-6">
                {[
                  {
                    id: 1,
                    status: 'completed',
                    startTime: '2025-06-23T10:00:00Z',
                    endTime: '2025-06-23T18:00:00Z',
                    startLocation: 'Miami Beach Marina',
                    endLocation: 'Key Biscayne',
                    engineHours: '5.5',
                    crewSize: 4,
                    weatherConditions: 'Clear',
                    seaConditions: 'Calm',
                    startFuelLevel: 100,
                    endFuelLevel: 85,
                    startBatteryLevel: 100,
                    endBatteryLevel: 92,
                    startWaterLevel: 100,
                    endWaterLevel: 75,
                    startWasteLevel: 0,
                    endWasteLevel: 25,
                    notes: 'Perfect day for cruising. Guests enjoyed swimming and snorkeling at Key Biscayne.'
                  },
                  {
                    id: 2,
                    status: 'completed',
                    startTime: '2025-06-22T14:00:00Z',
                    endTime: '2025-06-22T18:00:00Z',
                    startLocation: 'Key Biscayne',
                    endLocation: 'Miami Beach Marina',
                    engineHours: '4.0',
                    crewSize: 2,
                    weatherConditions: 'Partly Cloudy',
                    seaConditions: 'Moderate',
                    startFuelLevel: 85,
                    endFuelLevel: 70,
                    startBatteryLevel: 92,
                    endBatteryLevel: 88,
                    startWaterLevel: 75,
                    endWaterLevel: 60,
                    startWasteLevel: 25,
                    endWasteLevel: 40,
                    notes: 'Return trip with excellent sunset views. Minor engine maintenance recommended.'
                  },
                  {
                    id: 3,
                    status: 'completed',
                    startTime: '2025-06-21T11:00:00Z',
                    endTime: '2025-06-21T15:30:00Z',
                    startLocation: 'Miami Beach Marina',
                    endLocation: 'Fisher Island',
                    engineHours: '4.5',
                    crewSize: 6,
                    weatherConditions: 'Clear',
                    seaConditions: 'Calm',
                    startFuelLevel: 100,
                    endFuelLevel: 82,
                    startBatteryLevel: 100,
                    endBatteryLevel: 94,
                    startWaterLevel: 100,
                    endWaterLevel: 70,
                    startWasteLevel: 0,
                    endWasteLevel: 30,
                    notes: 'Corporate event charter. All systems performed excellently.'
                  }
                ].map((trip: any) => (
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
                            <p className="text-white">{trip.startFuelLevel}% → {trip.endFuelLevel}%</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-yellow-400" />
                          <div>
                            <p className="text-xs text-gray-400">Battery</p>
                            <p className="text-white">{trip.startBatteryLevel}% → {trip.endBatteryLevel}%</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Droplets className="h-4 w-4 text-cyan-400" />
                          <div>
                            <p className="text-xs text-gray-400">Water</p>
                            <p className="text-white">{trip.startWaterLevel}% → {trip.endWaterLevel}%</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Waves className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-400">Waste</p>
                            <p className="text-white">{trip.startWasteLevel}% → {trip.endWasteLevel}%</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-400">Route</span>
                          <span className="text-white">{trip.startLocation} → {trip.endLocation}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-400">Engine Hours</span>
                          <span className="text-white font-semibold">{trip.engineHours}h</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Conditions</span>
                          <span className="text-white">{trip.weatherConditions} • {trip.seaConditions}</span>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Notes</p>
                        <p className="text-white text-sm">{trip.notes}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Maintenance Tab */}
            <TabsContent value="maintenance">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">Maintenance Records</h3>
                <Dialog open={scheduleMaintenanceOpen} onOpenChange={setScheduleMaintenanceOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                      <Wrench className="h-4 w-4 mr-2" />
                      Schedule Maintenance
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/50/60 transition-all duration-500 hover:border-purple-500/30 max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-white">Schedule Maintenance</DialogTitle>
                    </DialogHeader>
                    <Form {...scheduleMaintenanceForm}>
                      <form onSubmit={scheduleMaintenanceForm.handleSubmit((data) => scheduleMaintenanceMutation.mutate(data))} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={scheduleMaintenanceForm.control}
                            name="taskType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Task Type</FormLabel>
                                <FormControl>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                                      <SelectValue placeholder="Select task type" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-800 border-gray-700">
                                      <SelectItem value="preventive" className="text-white data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-purple-600 data-[highlighted]:to-blue-600 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600">Preventive</SelectItem>
                                      <SelectItem value="corrective" className="text-white data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-purple-600 data-[highlighted]:to-blue-600 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600">Corrective</SelectItem>
                                      <SelectItem value="emergency" className="text-white data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-purple-600 data-[highlighted]:to-blue-600 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600">Emergency</SelectItem>
                                      <SelectItem value="inspection" className="text-white data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-purple-600 data-[highlighted]:to-blue-600 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600">Inspection</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={scheduleMaintenanceForm.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Category</FormLabel>
                                <FormControl>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-800 border-gray-700">
                                      <SelectItem value="engine" className="text-white data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-purple-600 data-[highlighted]:to-blue-600 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600">Engine</SelectItem>
                                      <SelectItem value="hull" className="text-white data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-purple-600 data-[highlighted]:to-blue-600 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600">Hull</SelectItem>
                                      <SelectItem value="electronics" className="text-white data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-purple-600 data-[highlighted]:to-blue-600 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600">Electronics</SelectItem>
                                      <SelectItem value="safety" className="text-white data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-purple-600 data-[highlighted]:to-blue-600 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600">Safety</SelectItem>
                                      <SelectItem value="cosmetic" className="text-white data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-purple-600 data-[highlighted]:to-blue-600 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600">Cosmetic</SelectItem>
                                      <SelectItem value="plumbing" className="text-white data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-purple-600 data-[highlighted]:to-blue-600 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600">Plumbing</SelectItem>
                                      <SelectItem value="electrical" className="text-white data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-purple-600 data-[highlighted]:to-blue-600 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600">Electrical</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={scheduleMaintenanceForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  className="bg-gray-800 border-gray-700 text-white" 
                                  placeholder="Describe the maintenance task..."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={scheduleMaintenanceForm.control}
                          name="scheduledDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Scheduled Date</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="date" 
                                  className="bg-gray-800 border-gray-700 text-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={scheduleMaintenanceForm.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Priority</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-gray-800 border-gray-700">
                                    <SelectItem value="low" className="text-white data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-purple-600 data-[highlighted]:to-blue-600 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600">Low</SelectItem>
                                    <SelectItem value="medium" className="text-white data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-purple-600 data-[highlighted]:to-blue-600 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600">Medium</SelectItem>
                                    <SelectItem value="high" className="text-white data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-purple-600 data-[highlighted]:to-blue-600 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600">High</SelectItem>
                                    <SelectItem value="critical" className="text-white data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-purple-600 data-[highlighted]:to-blue-600 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600">Critical</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={scheduleMaintenanceForm.control}
                            name="estimatedCost"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Est. Cost ($)</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    min="0"
                                    step="1"
                                    className="bg-gray-800 border-gray-700 text-white"
                                    placeholder="5000"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={scheduleMaintenanceForm.control}
                            name="estimatedDuration"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Est. Hours</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    min="0"
                                    step="1"
                                    className="bg-gray-800 border-gray-700 text-white"
                                    onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={scheduleMaintenanceForm.control}
                          name="assignedTo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Assigned To (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  className="bg-gray-800 border-gray-700 text-white" 
                                  placeholder="Technician name or company"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-3 pt-4">
                          <Button 
                            type="submit" 
                            disabled={scheduleMaintenanceMutation.isPending}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                          >
                            {scheduleMaintenanceMutation.isPending ? "Scheduling..." : "Schedule Maintenance"}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setScheduleMaintenanceOpen(false)}
                            className="border-gray-600 text-gray-300 hover:bg-gray-800"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-6">



                {maintenanceRecords && Array.isArray(maintenanceRecords) && maintenanceRecords.length > 0 ? maintenanceRecords.map((record: any) => (
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
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div className="text-gray-400">
                          <span className="font-medium">Scheduled:</span> {new Date(record.scheduledDate).toLocaleDateString()}
                        </div>
                        <div className="text-gray-400">
                          <span className="font-medium">Status:</span> <span className="capitalize">{record.status || 'Pending'}</span>
                        </div>
                        <div className="text-gray-400">
                          <span className="font-medium">Assigned to:</span> {record.assignedTo || 'Not assigned'}
                        </div>
                        <div className="text-gray-400">
                          <span className="font-medium">Duration:</span> {record.estimatedDuration || 'TBD'} hours
                        </div>
                      </div>
                      {record.workNotes && (
                        <div className="mt-4 p-3 bg-gray-800/50 rounded">
                          <span className="text-gray-400 text-sm font-medium">Work Notes:</span>
                          <p className="text-gray-300 text-sm mt-1">{record.workNotes}</p>
                        </div>
                      )}
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
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      New Assessment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/50/60 transition-all duration-500 hover:border-purple-500/30 max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-white">Condition Assessment</DialogTitle>
                    </DialogHeader>
                    <Form {...createAssessmentForm}>
                      <form onSubmit={createAssessmentForm.handleSubmit((data) => createAssessmentMutation.mutate(data))} className="space-y-4">
                        <FormField
                          control={createAssessmentForm.control}
                          name="condition"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Component Condition</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-gray-800 border-gray-700">
                                    <SelectItem value="excellent" className="text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600">Excellent</SelectItem>
                                    <SelectItem value="good" className="text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600">Good</SelectItem>
                                    <SelectItem value="fair" className="text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600">Fair</SelectItem>
                                    <SelectItem value="poor" className="text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600">Poor</SelectItem>
                                    <SelectItem value="critical" className="text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600">Critical</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={createAssessmentForm.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Assessment Notes</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  className="bg-gray-800 border-gray-700 text-white" 
                                  placeholder="Detailed assessment notes..."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={createAssessmentForm.control}
                          name="recommendedAction"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Recommended Action</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  className="bg-gray-800 border-gray-700 text-white" 
                                  placeholder="Recommended maintenance or repairs..."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={createAssessmentForm.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Priority</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-gray-800 border-gray-700">
                                    <SelectItem value="low" className="text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600">Low</SelectItem>
                                    <SelectItem value="medium" className="text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600">Medium</SelectItem>
                                    <SelectItem value="high" className="text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600">High</SelectItem>
                                    <SelectItem value="critical" className="text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600">Critical</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={createAssessmentForm.control}
                          name="estimatedCost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Estimated Cost ($)</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  min="0"
                                  step="0.01"
                                  className="bg-gray-800 border-gray-700 text-white"
                                  onChange={e => field.onChange(e.target.value)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-3 pt-4">
                          <Button 
                            type="submit" 
                            disabled={createAssessmentMutation.isPending}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                          >
                            {createAssessmentMutation.isPending ? "Creating..." : "Create Assessment"}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setCreateAssessmentOpen(false)}
                            className="border-gray-600 text-gray-300 hover:bg-gray-800"
                          >
                            Cancel
                          </Button>
                        </div>
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
                            {assessment.assessmentType?.replace('_', ' ') || 'Condition Assessment'}
                          </Badge>
                          <span className="text-white font-medium">Score: {assessment.overallScore || assessment.conditionScore || 'N/A'}/10</span>
                        </div>
                        <div className="text-gray-400 text-sm">
                          {assessment.createdAt ? new Date(assessment.createdAt).toLocaleDateString() : new Date(assessment.assessmentDate).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <p className="text-gray-300 mb-4">{assessment.findings || assessment.recommendations || 'No detailed findings recorded'}</p>
                      
                      {assessment.recommendations && (
                        <div className="bg-gray-900/50 rounded-lg p-3 mb-4">
                          <p className="text-yellow-400 font-medium mb-1">Recommendations:</p>
                          <p className="text-gray-300 text-sm">{assessment.recommendations}</p>
                        </div>
                      )}
                      
                      <div className="text-sm text-gray-400">
                        Assessed by: {assessment.assessedBy || `User ${assessment.assessorId}` || 'System'}
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
                        <div className="text-3xl font-bold text-green-400 mb-2">$285,000</div>
                        <p className="text-gray-400">Current Market Value</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-400 mb-2">$12,500</div>
                        <p className="text-gray-400">Projected Repair Costs</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-400 mb-2">12-18 months</div>
                        <p className="text-gray-400">Optimal Sell Time</p>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
                      <p className="text-white font-medium mb-2">Recommendation:</p>
                      <p className="text-gray-300">
                        Based on current condition trends and maintenance costs, consider selling within the next 12-18 months for optimal return on investment. The yacht is in excellent condition with minimal depreciation expected.
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
                        {[
                          { factor: 'Age (3 years)', impact: '-2.5%/year' },
                          { factor: 'Engine Hours (14h)', impact: 'Minimal' },
                          { factor: 'Market Demand', impact: 'High (+1.2%)' },
                          { factor: 'Condition Score (8.5/10)', impact: 'Excellent' },
                          { factor: 'Location (Miami)', impact: 'Premium (+3%)' }
                        ].map((factor: any, index: number) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-gray-300">{factor.factor}</span>
                            <span className={`${factor.impact.includes('+') ? 'text-green-400' : factor.impact === 'Minimal' || factor.impact === 'Excellent' ? 'text-yellow-400' : 'text-red-400'}`}>
                              {factor.impact}
                            </span>
                          </div>
                        ))}
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
                        {[
                          { timeframe: 'Current', value: '285,000', change: 0 },
                          { timeframe: '6 months', value: '275,025', change: -3.5 },
                          { timeframe: '12 months', value: '265,500', change: -6.8 },
                          { timeframe: '18 months', value: '258,200', change: -9.4 },
                          { timeframe: '24 months', value: '250,800', change: -12.0 }
                        ].map((projection: any, index: number) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-gray-300">{projection.timeframe}</span>
                            <div className="text-right">
                              <div className="text-white font-semibold">${projection.value}</div>
                              {projection.change !== 0 && (
                                <div className={`text-xs ${projection.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {projection.change > 0 ? '+' : ''}{projection.change}%
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
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