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
  const [selectedYacht, setSelectedYacht] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [scheduleMaintenanceOpen, setScheduleMaintenanceOpen] = useState(false);
  const [createAssessmentOpen, setCreateAssessmentOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Check user access - allow admins, yacht owners, and staff with yacht management permissions
  const hasYachtAccess = user && (
    user.role === 'admin' || 
    user.role === 'yacht_owner' || 
    (user.role === 'staff' && user.permissions?.includes('yachts'))
  );

  if (!user || !hasYachtAccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Access Restricted</h2>
          <p className="text-gray-400 mb-4">
            The Yacht Maintenance System is only accessible to yacht owners, administrators, and staff with yacht management permissions.
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

  // Get selected yacht data
  const selectedYachtData = selectedYacht ? yachts.find((yacht: any) => yacht.id === selectedYacht) : null;

  const { data: maintenanceOverview = {}, isLoading: overviewLoading } = useQuery({
    queryKey: ['/api/maintenance/overview', selectedYacht],
    queryFn: async () => {
      if (!selectedYacht) return {};
      const response = await fetch(`/api/maintenance/overview/${selectedYacht}`);
      if (!response.ok) throw new Error('Failed to fetch maintenance overview');
      return response.json();
    },
    enabled: !!selectedYacht,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const { data: tripLogs = [], isLoading: tripsLoading } = useQuery({
    queryKey: ['/api/maintenance/trip-logs'],
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const maintenanceRecords = useQuery({
    queryKey: [`/api/maintenance/records/${selectedYacht}`],
    enabled: !!selectedYacht,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const conditionAssessments = useQuery({
    queryKey: [`/api/maintenance/assessments/${selectedYacht}`],
    enabled: !!selectedYacht,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const { data: valuationData = {}, isLoading: valuationLoading } = useQuery({
    queryKey: [`/api/maintenance/valuation/${selectedYacht}`],
    enabled: !!selectedYacht,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const { data: usageMetrics = [], isLoading: metricsLoading } = useQuery({
    queryKey: [`/api/maintenance/usage-metrics/${selectedYacht}`],
    enabled: !!selectedYacht,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const { data: yachtComponents = [], isLoading: componentsLoading } = useQuery({
    queryKey: [`/api/maintenance/components/${selectedYacht}`],
    enabled: !!selectedYacht,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const { data: maintenanceSchedules = [], isLoading: schedulesLoading, refetch: refetchSchedules } = useQuery({
    queryKey: [`/api/maintenance/schedules/${selectedYacht}`],
    enabled: !!selectedYacht,
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
      // Force immediate refresh of maintenance data with cache bypass
      queryClient.removeQueries({ queryKey: [`/api/maintenance/records/${selectedYacht}`] });
      queryClient.removeQueries({ queryKey: [`/api/maintenance/schedules/${selectedYacht}`] });
      maintenanceRecords.refetch();
      queryClient.invalidateQueries({ queryKey: [`/api/maintenance/schedules/${selectedYacht}`] });
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
      conditionAssessments.refetch();
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-transparent">
        <div className="max-w-7xl mx-auto px-6 py-8 mt-16">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold text-white mb-2 tracking-tight" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif', fontWeight: 700 }}>Yacht Maintenance System</h1>
              <p className="text-lg text-gray-400">Comprehensive yacht tracking, maintenance, and resale optimization</p>
              
              {/* Breadcrumbs - only show when yacht is selected */}
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
              <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600">Analytics</TabsTrigger>
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
                    <div className="text-2xl font-bold text-white">
                      {maintenanceOverview.totalEngineHours || 0}h
                    </div>
                    <p className="text-xs text-gray-500 mt-1">From {maintenanceOverview.totalTrips || 0} completed trips</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/50/60 transition-all duration-500 hover:border-purple-500/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Active Components
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{maintenanceOverview.activeComponents || 0}</div>
                    <p className="text-xs text-gray-500 mt-1">Systems monitored</p>
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
                    <div className="text-2xl font-bold text-green-400">
                      {maintenanceOverview.averageCondition ? `${maintenanceOverview.averageCondition}/10` : 'N/A'}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">From recent assessments</p>
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
                      {yachtComponents.isLoading ? (
                        <div className="text-gray-400">Loading components...</div>
                      ) : yachtComponents.data && yachtComponents.data.length > 0 ? (
                        yachtComponents.data.map((component: any) => (
                          <div key={component.id} className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">{component.name}</p>
                              <p className="text-xs text-gray-400">
                                Status: {component.status} • Type: {component.componentType}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress value={component.conditionScore || 0} className="w-20" />
                              <span className="text-sm text-white w-8">
                                {component.conditionScore || 0}%
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-400">No components found</div>
                      )}
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
                      {tripLogs.isLoading ? (
                        <div className="text-gray-400">Loading recent activity...</div>
                      ) : tripLogs.data && tripLogs.data.length > 0 ? (
                        tripLogs.data.slice(0, 4).map((trip: any) => (
                          <div key={trip.id} className="flex items-start gap-3">
                            <div className="bg-purple-600/20 p-2 rounded-lg">
                              <MapPin className="h-4 w-4 text-green-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-medium">Trip completed</p>
                              <p className="text-xs text-gray-400">
                                {trip.startLocation} → {trip.endLocation} • {trip.engineHours || 'N/A'}h engine time
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(trip.startTime).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-400">No recent trips found</div>
                      )}
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
                {tripLogs.isLoading ? (
                  <div className="text-gray-400">Loading trip logs...</div>
                ) : tripLogs.data && tripLogs.data.length > 0 ? (
                  tripLogs.data.map((trip: any) => (
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
                          <span>{trip.guestCount || 0} guests</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Fuel className="h-4 w-4 text-blue-400" />
                          <div>
                            <p className="text-xs text-gray-400">Fuel</p>
                            <p className="text-white">{trip.fuelLevel || 'N/A'}%</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-yellow-400" />
                          <div>
                            <p className="text-xs text-gray-400">Battery</p>
                            <p className="text-white">{trip.batteryLevel || 'N/A'}%</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Droplets className="h-4 w-4 text-cyan-400" />
                          <div>
                            <p className="text-xs text-gray-400">Water</p>
                            <p className="text-white">{trip.waterLevel || 'N/A'}%</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Waves className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-400">Waste</p>
                            <p className="text-white">{trip.wasteLevel || 'N/A'}%</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-400">Route</span>
                          <span className="text-white">{trip.startLocation} → {trip.endLocation || 'In Progress'}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-400">Engine Hours</span>
                          <span className="text-white font-semibold">{trip.engineHours || 'N/A'}h</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Guest Count</span>
                          <span className="text-white">{trip.guestCount || 'N/A'}</span>
                        </div>
                      </div>

                      {trip.notes && (
                        <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Notes</p>
                          <p className="text-white text-sm">{trip.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  ))
                ) : (
                  <div className="text-gray-400">No trip logs found</div>
                )}
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
                {maintenanceRecords.isLoading ? (
                  <div className="text-gray-400">Loading maintenance records...</div>
                ) : maintenanceRecords.data && maintenanceRecords.data.length > 0 ? (
                  maintenanceRecords.data.map((record: any) => (
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
                          <Badge variant="outline" className="border-blue-500 text-blue-400">
                            {record.taskType && typeof record.taskType === 'string' ? record.taskType.replace('_', ' ') : 'Maintenance Task'}
                          </Badge>
                          {record.component && (
                            <Badge variant="outline" className="border-green-500 text-green-400">
                              {record.component}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-400" />
                          <span className="text-white">${record.estimatedCost || record.cost || '0.00'}</span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="text-white font-medium mb-2">{record.title || 'Maintenance Task'}</h4>
                        <p className="text-gray-300">{record.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div className="text-gray-400">
                          <span className="font-medium">Scheduled:</span> {new Date(record.scheduledDate).toLocaleDateString()}
                        </div>
                        <div className="text-gray-400">
                          <span className="font-medium">Status:</span> 
                          <Badge variant="outline" className={`ml-2 ${
                            record.status === 'completed' ? 'border-green-500 text-green-400' :
                            record.status === 'in_progress' ? 'border-yellow-500 text-yellow-400' :
                            record.status === 'overdue' ? 'border-red-500 text-red-400' :
                            'border-gray-500 text-gray-400'
                          }`}>
                            {record.status && typeof record.status === 'string' ? record.status.replace('_', ' ') : 'Scheduled'}
                          </Badge>
                        </div>
                        <div className="text-gray-400">
                          <span className="font-medium">Assigned to:</span> {record.assignedTo || 'Not assigned'}
                        </div>
                        <div className="text-gray-400">
                          <span className="font-medium">Duration:</span> {record.estimatedDuration || record.duration || 'TBD'} hours
                        </div>
                      </div>

                      {record.category && (
                        <div className="mb-3">
                          <span className="text-gray-400 font-medium">Category: </span>
                          <Badge variant="outline" className="border-purple-500 text-purple-400">
                            {record.category && typeof record.category === 'string' ? record.category.replace('_', ' ') : 'General'}
                          </Badge>
                        </div>
                      )}

                      {record.workNotes && (
                        <div className="mt-4 p-3 bg-gray-800/50 rounded">
                          <span className="text-gray-400 text-sm font-medium">Work Notes:</span>
                          <p className="text-gray-300 text-sm mt-1">{record.workNotes}</p>
                        </div>
                      )}

                      {record.notes && record.notes !== record.workNotes && (
                        <div className="mt-4 p-3 bg-gray-800/50 rounded">
                          <span className="text-gray-400 text-sm font-medium">Additional Notes:</span>
                          <p className="text-gray-300 text-sm mt-1">{record.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  ))
                ) : (
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
                      Add Assessment
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
                {conditionAssessments.isLoading ? (
                  <div className="text-gray-400">Loading condition assessments...</div>
                ) : conditionAssessments.data && conditionAssessments.data.length > 0 ? (
                  conditionAssessments.data.map((assessment: any) => (
                  <Card key={assessment.id} className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/50/60 transition-all duration-500 hover:border-purple-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="border-purple-500 text-purple-400">
                            Condition Assessment
                          </Badge>
                          <Badge variant={
                            assessment.priority === 'critical' ? 'destructive' :
                            assessment.priority === 'high' ? 'secondary' : 'default'
                          }>
                            {assessment.priority || 'medium'}
                          </Badge>
                          <span className="text-white font-medium">Score: {assessment.overallScore || assessment.conditionScore || 'N/A'}/10</span>
                        </div>
                        <div className="flex items-center gap-4">
                          {assessment.estimatedCost && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-green-400" />
                              <span className="text-white">${assessment.estimatedCost}</span>
                            </div>
                          )}
                          <div className="text-gray-400 text-sm">
                            {assessment.createdAt ? new Date(assessment.createdAt).toLocaleDateString() : new Date(assessment.assessmentDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      {assessment.condition && (
                        <div className="mb-4">
                          <span className="text-gray-400 font-medium">Component Condition: </span>
                          <Badge variant={
                            assessment.condition === 'excellent' ? 'default' :
                            assessment.condition === 'good' ? 'secondary' :
                            assessment.condition === 'fair' ? 'outline' :
                            assessment.condition === 'poor' ? 'secondary' : 'destructive'
                          } className={
                            assessment.condition === 'excellent' ? 'bg-green-600 text-white' :
                            assessment.condition === 'good' ? 'bg-blue-600 text-white' :
                            assessment.condition === 'fair' ? 'bg-yellow-600 text-white' :
                            assessment.condition === 'poor' ? 'bg-orange-600 text-white' :
                            'bg-red-600 text-white'
                          }>
                            {assessment.condition.charAt(0).toUpperCase() + assessment.condition.slice(1)}
                          </Badge>
                        </div>
                      )}

                      {assessment.notes && (
                        <div className="mb-4">
                          <p className="text-gray-400 font-medium mb-2">Assessment Notes:</p>
                          <p className="text-gray-300 bg-gray-800/50 rounded p-3">{assessment.notes}</p>
                        </div>
                      )}
                      
                      {assessment.recommendedAction && (
                        <div className="mb-4">
                          <p className="text-yellow-400 font-medium mb-2">Recommended Action:</p>
                          <p className="text-gray-300 bg-gray-800/50 rounded p-3">{assessment.recommendedAction}</p>
                        </div>
                      )}

                      {assessment.recommendations && assessment.recommendedAction !== assessment.recommendations && (
                        <div className="mb-4">
                          <p className="text-yellow-400 font-medium mb-2">Additional Recommendations:</p>
                          <p className="text-gray-300 bg-gray-800/50 rounded p-3">{assessment.recommendations}</p>
                        </div>
                      )}
                      
                      <div className="text-sm text-gray-400">
                        Assessed by: {assessment.assessedBy || `User ${assessment.assessorId}` || 'System'}
                      </div>
                    </CardContent>
                  </Card>
                  ))
                ) : (
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

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white">Maintenance Analytics</h3>
                <p className="text-gray-400 mt-2">Cost analysis, performance metrics, and operational insights</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Cost Analysis */}
                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/50/60 transition-all duration-500 hover:border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Cost Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">This Year</span>
                        <span className="text-white font-bold text-xl">$4,750</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Last Year</span>
                        <span className="text-white font-bold">$3,200</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Average Monthly</span>
                        <span className="text-white font-bold">$396</span>
                      </div>
                      <div className="pt-4 border-t border-gray-700">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Preventive</span>
                          <span className="text-green-400">65%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Corrective</span>
                          <span className="text-yellow-400">25%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Emergency</span>
                          <span className="text-red-400">10%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Metrics */}
                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/50/60 transition-all duration-500 hover:border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Gauge className="h-5 w-5" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Uptime</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold">96.8%</span>
                          <div className="w-12 h-2 bg-gray-700 rounded-full">
                            <div className="w-11 h-2 bg-gradient-to-r from-green-500 to-green-400 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Efficiency</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold">92.3%</span>
                          <div className="w-12 h-2 bg-gray-700 rounded-full">
                            <div className="w-11 h-2 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Health Score</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold">94.0%</span>
                          <div className="w-12 h-2 bg-gray-700 rounded-full">
                            <div className="w-11 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-gray-700">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Scheduled Compliance</span>
                          <span className="text-green-400">98%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Emergency Response</span>
                          <span className="text-blue-400">&lt; 2hrs</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Maintenance Trends */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/50/60 transition-all duration-500 hover:border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Work Orders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white mb-2">24</div>
                    <div className="text-sm text-gray-400 mb-4">This month</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Completed</span>
                        <span className="text-green-400">18</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">In Progress</span>
                        <span className="text-yellow-400">4</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Overdue</span>
                        <span className="text-red-400">2</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/50/60 transition-all duration-500 hover:border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Response Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white mb-2">1.2hrs</div>
                    <div className="text-sm text-gray-400 mb-4">Average response</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Critical</span>
                        <span className="text-red-400">&lt; 30min</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">High</span>
                        <span className="text-orange-400">&lt; 2hrs</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Standard</span>
                        <span className="text-green-400">&lt; 24hrs</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/50/60 transition-all duration-500 hover:border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Efficiency Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white mb-2">8.7/10</div>
                    <div className="text-sm text-gray-400 mb-4">Overall rating</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">First Fix Rate</span>
                        <span className="text-green-400">89%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Schedule Adherence</span>
                        <span className="text-blue-400">94%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Cost Variance</span>
                        <span className="text-purple-400">-2.3%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Component Health Overview */}
              <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/50/60 transition-all duration-500 hover:border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Component Health Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { component: 'Engine Systems', health: 92, status: 'excellent', color: 'from-green-500 to-green-400' },
                      { component: 'Electrical', health: 87, status: 'good', color: 'from-blue-500 to-blue-400' },
                      { component: 'Hull & Structure', health: 95, status: 'excellent', color: 'from-green-500 to-green-400' },
                      { component: 'Navigation', health: 89, status: 'good', color: 'from-blue-500 to-blue-400' },
                      { component: 'Safety Equipment', health: 98, status: 'excellent', color: 'from-green-500 to-green-400' },
                      { component: 'Propulsion', health: 84, status: 'good', color: 'from-blue-500 to-blue-400' },
                      { component: 'HVAC Systems', health: 76, status: 'fair', color: 'from-yellow-500 to-yellow-400' },
                      { component: 'Hydraulics', health: 91, status: 'excellent', color: 'from-green-500 to-green-400' }
                    ].map((item, index) => (
                      <div key={index} className="text-center">
                        <div className="relative w-20 h-20 mx-auto mb-3">
                          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 40 40">
                            <circle
                              cx="20"
                              cy="20"
                              r="16"
                              stroke="#374151"
                              strokeWidth="3"
                              fill="none"
                              strokeDasharray="100.53"
                              strokeDashoffset="0"
                            />
                            <circle
                              cx="20"
                              cy="20"
                              r="16"
                              stroke="url(#gradient-${index})"
                              strokeWidth="3"
                              fill="none"
                              strokeDasharray="100.53"
                              strokeDashoffset={100.53 - (item.health / 100) * 100.53}
                              strokeLinecap="round"
                            />
                            <defs>
                              <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" className={`stop-color-gradient-start ${item.color && typeof item.color === 'string' ? item.color.split(' ')[0]?.replace('from-', '') || 'purple-600' : 'purple-600'}`} />
                                <stop offset="100%" className={`stop-color-gradient-end ${item.color && typeof item.color === 'string' ? item.color.split(' ')[2]?.replace('to-', '') || 'indigo-600' : 'indigo-600'}`} />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{item.health}%</span>
                          </div>
                        </div>
                        <div className="text-white text-sm font-medium mb-1">{item.component}</div>
                        <Badge 
                          variant="outline" 
                          className={`border-${item.color.split('-')[1]}-500 text-${item.color.split('-')[1]}-400 text-xs`}
                        >
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}