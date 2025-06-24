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
  Activity, BarChart3, PieChart, LineChart, Gauge, Timer, MapPin, Users
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
  const [selectedYacht, setSelectedYacht] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Data queries
  const { data: yachts = [], isLoading: yachtsLoading } = useQuery({
    queryKey: ['/api/yachts'],
  });

  const { data: maintenanceOverview = {}, isLoading: overviewLoading } = useQuery({
    queryKey: ['/api/maintenance/overview', selectedYacht],
    enabled: !!selectedYacht,
  });

  const { data: tripLogs = [], isLoading: tripsLoading } = useQuery({
    queryKey: ['/api/maintenance/trip-logs', selectedYacht],
    enabled: !!selectedYacht,
  });

  const { data: maintenanceRecords = [], isLoading: maintenanceLoading } = useQuery({
    queryKey: ['/api/maintenance/records', selectedYacht],
    enabled: !!selectedYacht,
  });

  const { data: conditionAssessments = [], isLoading: assessmentsLoading } = useQuery({
    queryKey: ['/api/maintenance/assessments', selectedYacht],
    enabled: !!selectedYacht,
  });

  const { data: valuationData = {}, isLoading: valuationLoading } = useQuery({
    queryKey: ['/api/maintenance/valuation', selectedYacht],
    enabled: !!selectedYacht,
  });

  const { data: usageMetrics = [], isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/usage-metrics', { yachtId: selectedYacht }],
    enabled: !!selectedYacht,
  });

  const { data: yachtComponents = [], isLoading: componentsLoading } = useQuery({
    queryKey: ['/api/yacht-components', { yachtId: selectedYacht }],
    enabled: !!selectedYacht,
  });

  const { data: maintenanceSchedules = [], isLoading: schedulesLoading } = useQuery({
    queryKey: ['/api/maintenance-schedules', { yachtId: selectedYacht }],
    enabled: !!selectedYacht,
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
            <div className="flex items-center gap-4">
              <Select value={selectedYacht?.toString() || ""} onValueChange={(value) => setSelectedYacht(Number(value))}>
                <SelectTrigger className="w-64 bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/50/60 transition-all duration-500 hover:border-purple-500/30">
                  <SelectValue placeholder="Select a yacht..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/50/60 transition-all duration-500 hover:border-purple-500/30">
                  {yachts.map((yacht: any) => (
                    <SelectItem key={yacht.id} value={yacht.id.toString()}>
                      {yacht.name} ({yacht.size}ft)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <p className="text-gray-400 mb-8">Choose a yacht from the dropdown above to view its maintenance dashboard</p>
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
              <div className="flex items-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <MapPin className="h-4 w-4 mr-2" />
                      Start Trip
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/50/60 transition-all duration-500 hover:border-purple-500/30 max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-white">Start New Trip Log</DialogTitle>
                    </DialogHeader>
                    <Form {...tripForm}>
                      <form onSubmit={tripForm.handleSubmit((data) => createTripLogMutation.mutate(data))}>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <FormField
                            control={tripForm.control}
                            name="startLocation"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Start Location</FormLabel>
                                <FormControl>
                                  <Input {...field} className="bg-gray-900/50 border-gray-600 text-white" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={tripForm.control}
                            name="crewSize"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Crew Size</FormLabel>
                                <FormControl>
                                  <Input {...field} type="number" className="bg-gray-900/50 border-gray-600 text-white" onChange={(e) => field.onChange(Number(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={tripForm.control}
                            name="weatherConditions"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Weather Conditions</FormLabel>
                                <FormControl>
                                  <Input {...field} className="bg-gray-900/50 border-gray-600 text-white" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={tripForm.control}
                            name="seaConditions"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Sea Conditions</FormLabel>
                                <FormControl>
                                  <Input {...field} className="bg-gray-900/50 border-gray-600 text-white" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-4 gap-4 mb-6">
                          <FormField
                            control={tripForm.control}
                            name="startFuelLevel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Fuel Level (%)</FormLabel>
                                <FormControl>
                                  <Input {...field} type="number" className="bg-gray-900/50 border-gray-600 text-white" onChange={(e) => field.onChange(Number(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={tripForm.control}
                            name="startBatteryLevel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Battery Level (%)</FormLabel>
                                <FormControl>
                                  <Input {...field} type="number" className="bg-gray-900/50 border-gray-600 text-white" onChange={(e) => field.onChange(Number(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={tripForm.control}
                            name="startWaterLevel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Water Level (%)</FormLabel>
                                <FormControl>
                                  <Input {...field} type="number" className="bg-gray-900/50 border-gray-600 text-white" onChange={(e) => field.onChange(Number(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={tripForm.control}
                            name="startWasteLevel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Waste Level (%)</FormLabel>
                                <FormControl>
                                  <Input {...field} type="number" className="bg-gray-900/50 border-gray-600 text-white" onChange={(e) => field.onChange(Number(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={createTripLogMutation.isPending}>
                          {createTripLogMutation.isPending ? "Starting..." : "Start Trip"}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-gray-900/50 border border-gray-700/50">
              <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">Overview</TabsTrigger>
              <TabsTrigger value="trips" className="data-[state=active]:bg-purple-600">Trip Logs</TabsTrigger>
              <TabsTrigger value="maintenance" className="data-[state=active]:bg-purple-600">Maintenance</TabsTrigger>
              <TabsTrigger value="assessments" className="data-[state=active]:bg-purple-600">Assessments</TabsTrigger>
              <TabsTrigger value="valuation" className="data-[state=active]:bg-purple-600">Valuation</TabsTrigger>
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
                    <div className="text-2xl font-bold text-white">{maintenanceOverview.totalEngineHours || 0}h</div>
                    <p className="text-xs text-gray-500 mt-1">+12h this month</p>
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
                    <div className="text-2xl font-bold text-white">{maintenanceOverview.totalSunExposure || 0}h</div>
                    <p className="text-xs text-gray-500 mt-1">UV Index avg: {maintenanceOverview.avgUvIndex || 0}</p>
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
                    <div className="text-2xl font-bold text-green-400">{maintenanceOverview.avgCondition || 0}/10</div>
                    <p className="text-xs text-gray-500 mt-1">Overall condition</p>
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
                        { name: "Engine", condition: 8.5, nextMaintenance: "2024-07-15" },
                        { name: "Hull", condition: 7.2, nextMaintenance: "2024-08-01" },
                        { name: "Electronics", condition: 9.1, nextMaintenance: "2024-06-30" },
                        { name: "Rigging", condition: 6.8, nextMaintenance: "2024-07-01" },
                      ].map((component) => (
                        <div key={component.name} className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{component.name}</p>
                            <p className="text-xs text-gray-400">Next: {component.nextMaintenance}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={component.condition * 10} className="w-20" />
                            <span className="text-sm text-white w-8">{component.condition}</span>
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
                        { action: "Trip completed", details: "4.5h cruise to Key Biscayne", time: "2 hours ago", icon: MapPin },
                        { action: "Maintenance scheduled", details: "Engine oil change", time: "1 day ago", icon: Wrench },
                        { action: "Condition assessment", details: "Hull inspection completed", time: "3 days ago", icon: CheckCircle },
                        { action: "System alert", details: "Battery level monitoring", time: "1 week ago", icon: Zap },
                      ].map((activity, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="bg-purple-600/20 p-2 rounded-lg">
                            <activity.icon className="h-4 w-4 text-purple-400" />
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

            {/* Trip Logs Tab - Comprehensive Implementation */}
            <TabsContent value="trips">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">Trip Logs</h3>
                <div className="flex gap-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <MapPin className="h-4 w-4 mr-2" />
                        Start New Trip
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900/95 border-gray-700/50 backdrop-blur-xl max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-white">Start New Trip Log</DialogTitle>
                      </DialogHeader>
                      <Form {...tripForm}>
                        <form onSubmit={tripForm.handleSubmit((data) => createTripLogMutation.mutate(data))} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={tripForm.control}
                              name="startLocation"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Start Location</FormLabel>
                                  <FormControl>
                                    <Input {...field} className="bg-gray-800 border-gray-600 text-white" placeholder="Miami Marina" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={tripForm.control}
                              name="crewSize"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Crew Size</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="number" className="bg-gray-800 border-gray-600 text-white" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={tripForm.control}
                              name="weatherConditions"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Weather Conditions</FormLabel>
                                  <FormControl>
                                    <Input {...field} className="bg-gray-800 border-gray-600 text-white" placeholder="Clear, light breeze" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={tripForm.control}
                              name="seaConditions"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Sea Conditions</FormLabel>
                                  <FormControl>
                                    <Input {...field} className="bg-gray-800 border-gray-600 text-white" placeholder="Calm, 1-2ft waves" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-4 gap-4">
                            <FormField
                              control={tripForm.control}
                              name="startFuelLevel"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Fuel %</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="number" min="0" max="100" className="bg-gray-800 border-gray-600 text-white" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={tripForm.control}
                              name="startBatteryLevel"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Battery %</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="number" min="0" max="100" className="bg-gray-800 border-gray-600 text-white" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={tripForm.control}
                              name="startWaterLevel"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Water %</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="number" min="0" max="100" className="bg-gray-800 border-gray-600 text-white" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={tripForm.control}
                              name="startWasteLevel"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Waste %</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="number" min="0" max="100" className="bg-gray-800 border-gray-600 text-white" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={tripForm.control}
                            name="plannedRoute"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Planned Route (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea {...field} className="bg-gray-800 border-gray-600 text-white" placeholder="Miami to Key Biscayne via Stiltsville..." />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex justify-end gap-3">
                            <DialogTrigger asChild>
                              <Button variant="outline" type="button">Cancel</Button>
                            </DialogTrigger>
                            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={createTripLogMutation.isPending}>
                              {createTripLogMutation.isPending ? 'Starting...' : 'Start Trip'}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" className="border-purple-500/50 text-purple-400 hover:bg-purple-950/30">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Trip Analytics
                  </Button>
                </div>
              </div>

              {tripsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-900/50 rounded-lg h-40 animate-pulse" />
                  ))}
                </div>
              ) : tripLogs.length === 0 ? (
                <Card className="bg-gray-900/50 border-gray-700/50">
                  <CardContent className="p-12 text-center">
                    <MapPin className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Trip Logs Yet</h3>
                    <p className="text-gray-400 mb-6">Start tracking yacht trips with detailed logging and analytics</p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700">
                          <MapPin className="h-4 w-4 mr-2" />
                          Start First Trip
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Trip Logs Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-200 text-sm">Total Trips</p>
                            <p className="text-2xl font-bold text-white">{tripLogs.length}</p>
                          </div>
                          <MapPin className="h-8 w-8 text-blue-400" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-200 text-sm">Active Trips</p>
                            <p className="text-2xl font-bold text-white">{tripLogs.filter((t: any) => t.status === 'active').length}</p>
                          </div>
                          <Activity className="h-8 w-8 text-green-400" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-200 text-sm">Total Hours</p>
                            <p className="text-2xl font-bold text-white">
                              {tripLogs.reduce((acc: number, trip: any) => {
                                if (trip.endTime) {
                                  const hours = (new Date(trip.endTime).getTime() - new Date(trip.startTime).getTime()) / (1000 * 60 * 60);
                                  return acc + hours;
                                }
                                return acc;
                              }, 0).toFixed(1)}
                            </p>
                          </div>
                          <Timer className="h-8 w-8 text-purple-400" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/50 border-orange-700/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-orange-200 text-sm">Avg Fuel Usage</p>
                            <p className="text-2xl font-bold text-white">
                              {tripLogs.filter((t: any) => t.endFuelLevel).length > 0 
                                ? Math.round(tripLogs.reduce((acc: number, trip: any) => {
                                    if (trip.endFuelLevel) {
                                      return acc + (trip.startFuelLevel - trip.endFuelLevel);
                                    }
                                    return acc;
                                  }, 0) / tripLogs.filter((t: any) => t.endFuelLevel).length) : 0}%
                            </p>
                          </div>
                          <Fuel className="h-8 w-8 text-orange-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Trip Log Entries */}
                  {tripLogs.map((trip: any) => (
                    <motion.div
                      key={trip.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group"
                    >
                      <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/60 transition-all duration-500 hover:border-purple-500/30">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Badge variant={trip.status === 'completed' ? 'default' : trip.status === 'active' ? 'secondary' : 'destructive'} className="px-3 py-1">
                                {trip.status}
                              </Badge>
                              <span className="text-white font-medium">
                                {new Date(trip.startTime).toLocaleDateString()} • {new Date(trip.startTime).toLocaleTimeString()}
                              </span>
                              {trip.endTime && (
                                <span className="text-gray-400 text-sm">
                                  Duration: {((new Date(trip.endTime).getTime() - new Date(trip.startTime).getTime()) / (1000 * 60 * 60)).toFixed(1)}h
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 text-gray-400">
                                <Users className="h-4 w-4" />
                                <span>{trip.crewSize} crew</span>
                              </div>
                              {trip.status === 'active' && (
                                <Button size="sm" className="bg-red-600 hover:bg-red-700">
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Complete Trip
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <Fuel className="h-4 w-4 text-blue-400" />
                              <div>
                                <p className="text-xs text-gray-400">Fuel Level</p>
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
                              <AlertTriangle className="h-4 w-4 text-orange-400" />
                              <div>
                                <p className="text-xs text-gray-400">Waste</p>
                                <p className="text-white">{trip.startWasteLevel}% → {trip.endWasteLevel || '?'}%</p>
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-gray-700/50 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-400 mb-1">Route</p>
                                <p className="text-white">{trip.startLocation} → {trip.endLocation || 'In Progress'}</p>
                                {trip.plannedRoute && (
                                  <p className="text-xs text-gray-500 mt-1">{trip.plannedRoute}</p>
                                )}
                              </div>
                              <div>
                                <p className="text-sm text-gray-400 mb-1">Conditions</p>
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="flex items-center gap-1">
                                    <Sun className="h-3 w-3 text-yellow-400" />
                                    {trip.weatherConditions}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Waves className="h-3 w-3 text-blue-400" />
                                    {trip.seaConditions}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {trip.crewNotes && (
                              <div className="mt-4">
                                <p className="text-sm text-gray-400 mb-1">Crew Notes</p>
                                <p className="text-white text-sm bg-gray-800/50 rounded p-2">{trip.crewNotes}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Maintenance Records Tab - Comprehensive Implementation */}
            <TabsContent value="maintenance">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">Maintenance Records</h3>
                <div className="flex gap-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-orange-600 hover:bg-orange-700">
                        <Wrench className="h-4 w-4 mr-2" />
                        Schedule Maintenance
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900/95 border-gray-700/50 backdrop-blur-xl max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-white">Schedule Maintenance Task</DialogTitle>
                      </DialogHeader>
                      <Form {...maintenanceForm}>
                        <form onSubmit={maintenanceForm.handleSubmit((data) => createMaintenanceMutation.mutate(data))} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={maintenanceForm.control}
                              name="taskType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Task Type</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                        <SelectValue placeholder="Select task type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-800 border-gray-600">
                                      <SelectItem value="engine_service">Engine Service</SelectItem>
                                      <SelectItem value="hull_inspection">Hull Inspection</SelectItem>
                                      <SelectItem value="electrical_check">Electrical Check</SelectItem>
                                      <SelectItem value="safety_inspection">Safety Inspection</SelectItem>
                                      <SelectItem value="cleaning">Deep Cleaning</SelectItem>
                                      <SelectItem value="preventive">Preventive Maintenance</SelectItem>
                                      <SelectItem value="repair">Repair Work</SelectItem>
                                      <SelectItem value="replacement">Component Replacement</SelectItem>
                                    </SelectContent>
                                  </Select>
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
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                        <SelectValue placeholder="Select priority" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-800 border-gray-600">
                                      <SelectItem value="low">Low</SelectItem>
                                      <SelectItem value="medium">Medium</SelectItem>
                                      <SelectItem value="high">High</SelectItem>
                                      <SelectItem value="critical">Critical</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={maintenanceForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Description</FormLabel>
                                <FormControl>
                                  <Textarea {...field} className="bg-gray-800 border-gray-600 text-white" placeholder="Detailed description of maintenance task..." />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={maintenanceForm.control}
                              name="scheduledDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Scheduled Date</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="datetime-local" className="bg-gray-800 border-gray-600 text-white" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={maintenanceForm.control}
                              name="estimatedCost"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Estimated Cost</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="number" step="0.01" className="bg-gray-800 border-gray-600 text-white" placeholder="0.00" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={maintenanceForm.control}
                            name="assignedTo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Assigned To (Optional)</FormLabel>
                                <FormControl>
                                  <Input {...field} className="bg-gray-800 border-gray-600 text-white" placeholder="Technician or crew member name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex justify-end gap-3">
                            <DialogTrigger asChild>
                              <Button variant="outline" type="button">Cancel</Button>
                            </DialogTrigger>
                            <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={createMaintenanceMutation.isPending}>
                              {createMaintenanceMutation.isPending ? 'Scheduling...' : 'Schedule Task'}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" className="border-orange-500/50 text-orange-400 hover:bg-orange-950/30">
                    <Calendar className="h-4 w-4 mr-2" />
                    Maintenance Calendar
                  </Button>
                </div>
              </div>

              {maintenanceLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-900/50 rounded-lg h-32 animate-pulse" />
                  ))}
                </div>
              ) : maintenanceRecords.length === 0 ? (
                <Card className="bg-gray-900/50 border-gray-700/50">
                  <CardContent className="p-12 text-center">
                    <Wrench className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Maintenance Records</h3>
                    <p className="text-gray-400 mb-6">Start tracking maintenance tasks and service history</p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-orange-600 hover:bg-orange-700">
                          <Wrench className="h-4 w-4 mr-2" />
                          Schedule First Task
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Maintenance Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/50 border-orange-700/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-orange-200 text-sm">Total Tasks</p>
                            <p className="text-2xl font-bold text-white">{maintenanceRecords.length}</p>
                          </div>
                          <Wrench className="h-8 w-8 text-orange-400" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-red-900/50 to-red-800/50 border-red-700/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-red-200 text-sm">Overdue</p>
                            <p className="text-2xl font-bold text-white">
                              {maintenanceRecords.filter((r: any) => 
                                r.status === 'pending' && new Date(r.scheduledDate) < new Date()
                              ).length}
                            </p>
                          </div>
                          <AlertTriangle className="h-8 w-8 text-red-400" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 border-yellow-700/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-yellow-200 text-sm">Pending</p>
                            <p className="text-2xl font-bold text-white">
                              {maintenanceRecords.filter((r: any) => r.status === 'pending').length}
                            </p>
                          </div>
                          <Clock className="h-8 w-8 text-yellow-400" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-200 text-sm">Completed</p>
                            <p className="text-2xl font-bold text-white">
                              {maintenanceRecords.filter((r: any) => r.status === 'completed').length}
                            </p>
                          </div>
                          <CheckCircle className="h-8 w-8 text-green-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Maintenance Records List */}
                  {maintenanceRecords.map((record: any) => {
                    const isOverdue = record.status === 'pending' && new Date(record.scheduledDate) < new Date();
                    const priorityColors = {
                      low: 'text-gray-400 bg-gray-900/50',
                      medium: 'text-yellow-400 bg-yellow-900/50',
                      high: 'text-orange-400 bg-orange-900/50',
                      critical: 'text-red-400 bg-red-900/50'
                    };

                    return (
                      <motion.div
                        key={record.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group"
                      >
                        <Card className={`bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/60 transition-all duration-500 ${
                          isOverdue ? 'border-red-500/50 hover:border-red-500/70' : 'hover:border-purple-500/30'
                        }`}>
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <Badge variant={record.status === 'completed' ? 'default' : record.status === 'in_progress' ? 'secondary' : 'destructive'} className="px-3 py-1">
                                  {record.status}
                                </Badge>
                                <Badge className={`px-2 py-1 ${priorityColors[record.priority as keyof typeof priorityColors]}`}>
                                  {record.priority}
                                </Badge>
                                <span className="text-white font-medium">{record.taskType.replace('_', ' ').toUpperCase()}</span>
                                {isOverdue && (
                                  <Badge variant="destructive" className="animate-pulse">
                                    OVERDUE
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-gray-400 text-sm">
                                  {new Date(record.scheduledDate).toLocaleDateString()}
                                </span>
                                {record.status === 'pending' && (
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Mark Complete
                                  </Button>
                                )}
                              </div>
                            </div>

                            <p className="text-white mb-4">{record.description}</p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <p className="text-sm text-gray-400 mb-1">Estimated Cost</p>
                                <p className="text-white font-medium">${record.estimatedCost?.toFixed(2) || '0.00'}</p>
                              </div>
                              {record.assignedTo && (
                                <div>
                                  <p className="text-sm text-gray-400 mb-1">Assigned To</p>
                                  <p className="text-white">{record.assignedTo}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-sm text-gray-400 mb-1">Condition Before</p>
                                <div className="flex items-center gap-2">
                                  <Progress value={record.beforeCondition * 10} className="w-20" />
                                  <span className="text-white">{record.beforeCondition}/10</span>
                                </div>
                              </div>
                            </div>

                            {record.notes && (
                              <div className="border-t border-gray-700/50 pt-4">
                                <p className="text-sm text-gray-400 mb-1">Notes</p>
                                <p className="text-white text-sm bg-gray-800/50 rounded p-2">{record.notes}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Maintenance Records Tab - Comprehensive Implementation */}
            <TabsContent value="maintenance">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">Maintenance Records</h3>
                <div className="flex gap-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-orange-600 hover:bg-orange-700">
                        <Wrench className="h-4 w-4 mr-2" />
                        Schedule Maintenance
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900/95 border-gray-700/50 backdrop-blur-xl max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-white">Schedule Maintenance Task</DialogTitle>
                      </DialogHeader>
                      <Form {...maintenanceForm}>
                        <form onSubmit={maintenanceForm.handleSubmit((data) => createMaintenanceMutation.mutate(data))} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={maintenanceForm.control}
                              name="taskType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Task Type</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                        <SelectValue placeholder="Select task type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-800 border-gray-600">
                                      <SelectItem value="engine_service">Engine Service</SelectItem>
                                      <SelectItem value="hull_inspection">Hull Inspection</SelectItem>
                                      <SelectItem value="electrical_check">Electrical Check</SelectItem>
                                      <SelectItem value="safety_inspection">Safety Inspection</SelectItem>
                                      <SelectItem value="cleaning">Deep Cleaning</SelectItem>
                                      <SelectItem value="preventive">Preventive Maintenance</SelectItem>
                                      <SelectItem value="repair">Repair Work</SelectItem>
                                      <SelectItem value="replacement">Component Replacement</SelectItem>
                                    </SelectContent>
                                  </Select>
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
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                        <SelectValue placeholder="Select priority" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-800 border-gray-600">
                                      <SelectItem value="low">Low</SelectItem>
                                      <SelectItem value="medium">Medium</SelectItem>
                                      <SelectItem value="high">High</SelectItem>
                                      <SelectItem value="critical">Critical</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={maintenanceForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Description</FormLabel>
                                <FormControl>
                                  <Textarea {...field} className="bg-gray-800 border-gray-600 text-white" placeholder="Detailed description of maintenance task..." />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={maintenanceForm.control}
                              name="scheduledDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Scheduled Date</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="datetime-local" className="bg-gray-800 border-gray-600 text-white" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={maintenanceForm.control}
                              name="estimatedCost"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Estimated Cost</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="number" step="0.01" className="bg-gray-800 border-gray-600 text-white" placeholder="0.00" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={maintenanceForm.control}
                            name="assignedTo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Assigned To (Optional)</FormLabel>
                                <FormControl>
                                  <Input {...field} className="bg-gray-800 border-gray-600 text-white" placeholder="Technician or crew member name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex justify-end gap-3">
                            <DialogTrigger asChild>
                              <Button variant="outline" type="button">Cancel</Button>
                            </DialogTrigger>
                            <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={createMaintenanceMutation.isPending}>
                              {createMaintenanceMutation.isPending ? 'Scheduling...' : 'Schedule Task'}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" className="border-orange-500/50 text-orange-400 hover:bg-orange-950/30">
                    <Calendar className="h-4 w-4 mr-2" />
                    Maintenance Calendar
                  </Button>
                </div>
              </div>

              {maintenanceLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-900/50 rounded-lg h-32 animate-pulse" />
                  ))}
                </div>
              ) : maintenanceRecords.length === 0 ? (
                <Card className="bg-gray-900/50 border-gray-700/50">
                  <CardContent className="p-12 text-center">
                    <Wrench className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Maintenance Records</h3>
                    <p className="text-gray-400 mb-6">Start tracking maintenance tasks and service history</p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-orange-600 hover:bg-orange-700">
                          <Wrench className="h-4 w-4 mr-2" />
                          Schedule First Task
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Maintenance Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/50 border-orange-700/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-orange-200 text-sm">Total Tasks</p>
                            <p className="text-2xl font-bold text-white">{maintenanceRecords.length}</p>
                          </div>
                          <Wrench className="h-8 w-8 text-orange-400" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-red-900/50 to-red-800/50 border-red-700/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-red-200 text-sm">Overdue</p>
                            <p className="text-2xl font-bold text-white">
                              {maintenanceRecords.filter((r: any) => 
                                r.status === 'pending' && new Date(r.scheduledDate) < new Date()
                              ).length}
                            </p>
                          </div>
                          <AlertTriangle className="h-8 w-8 text-red-400" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 border-yellow-700/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-yellow-200 text-sm">Pending</p>
                            <p className="text-2xl font-bold text-white">
                              {maintenanceRecords.filter((r: any) => r.status === 'pending').length}
                            </p>
                          </div>
                          <Clock className="h-8 w-8 text-yellow-400" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-200 text-sm">Completed</p>
                            <p className="text-2xl font-bold text-white">
                              {maintenanceRecords.filter((r: any) => r.status === 'completed').length}
                            </p>
                          </div>
                          <CheckCircle className="h-8 w-8 text-green-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Maintenance Records List */}
                  {maintenanceRecords.map((record: any) => {
                    const isOverdue = record.status === 'pending' && new Date(record.scheduledDate) < new Date();
                    const priorityColors = {
                      low: 'text-gray-400 bg-gray-900/50',
                      medium: 'text-yellow-400 bg-yellow-900/50',
                      high: 'text-orange-400 bg-orange-900/50',
                      critical: 'text-red-400 bg-red-900/50'
                    };

                    return (
                      <motion.div
                        key={record.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group"
                      >
                        <Card className={`bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/60 transition-all duration-500 ${
                          isOverdue ? 'border-red-500/50 hover:border-red-500/70' : 'hover:border-purple-500/30'
                        }`}>
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <Badge variant={record.status === 'completed' ? 'default' : record.status === 'in_progress' ? 'secondary' : 'destructive'} className="px-3 py-1">
                                  {record.status}
                                </Badge>
                                <Badge className={`px-2 py-1 ${priorityColors[record.priority as keyof typeof priorityColors]}`}>
                                  {record.priority}
                                </Badge>
                                <span className="text-white font-medium">{record.taskType.replace('_', ' ').toUpperCase()}</span>
                                {isOverdue && (
                                  <Badge variant="destructive" className="animate-pulse">
                                    OVERDUE
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-gray-400 text-sm">
                                  {new Date(record.scheduledDate).toLocaleDateString()}
                                </span>
                                {record.status === 'pending' && (
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Mark Complete
                                  </Button>
                                )}
                              </div>
                            </div>

                            <p className="text-white mb-4">{record.description}</p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <p className="text-sm text-gray-400 mb-1">Estimated Cost</p>
                                <p className="text-white font-medium">${record.estimatedCost?.toFixed(2) || '0.00'}</p>
                              </div>
                              {record.assignedTo && (
                                <div>
                                  <p className="text-sm text-gray-400 mb-1">Assigned To</p>
                                  <p className="text-white">{record.assignedTo}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-sm text-gray-400 mb-1">Condition Before</p>
                                <div className="flex items-center gap-2">
                                  <Progress value={record.beforeCondition * 10} className="w-20" />
                                  <span className="text-white">{record.beforeCondition}/10</span>
                                </div>
                              </div>
                            </div>

                            {record.notes && (
                              <div className="border-t border-gray-700/50 pt-4">
                                <p className="text-sm text-gray-400 mb-1">Notes</p>
                                <p className="text-white text-sm bg-gray-800/50 rounded p-2">{record.notes}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Condition Assessments Tab - Comprehensive Implementation */}
            <TabsContent value="assessments">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">Condition Assessments</h3>
                <div className="flex gap-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Target className="h-4 w-4 mr-2" />
                        New Assessment
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900/95 border-gray-700/50 backdrop-blur-xl max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-white">Condition Assessment</DialogTitle>
                      </DialogHeader>
                      <Form {...assessmentForm}>
                        <form onSubmit={assessmentForm.handleSubmit((data) => createAssessmentMutation.mutate(data))} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={assessmentForm.control}
                              name="assessmentType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Assessment Type</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                        <SelectValue placeholder="Select assessment type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-800 border-gray-600">
                                      <SelectItem value="hull_inspection">Hull Inspection</SelectItem>
                                      <SelectItem value="engine_assessment">Engine Assessment</SelectItem>
                                      <SelectItem value="electrical_system">Electrical System</SelectItem>
                                      <SelectItem value="safety_equipment">Safety Equipment</SelectItem>
                                      <SelectItem value="interior_condition">Interior Condition</SelectItem>
                                      <SelectItem value="structural_integrity">Structural Integrity</SelectItem>
                                      <SelectItem value="navigation_systems">Navigation Systems</SelectItem>
                                      <SelectItem value="annual_survey">Annual Survey</SelectItem>
                                    </SelectContent>
                                  </Select>
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
                                    <Input {...field} type="number" min="1" max="10" className="bg-gray-800 border-gray-600 text-white" />
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
                              <FormItem>
                                <FormLabel className="text-white">Assessment Findings</FormLabel>
                                <FormControl>
                                  <Textarea {...field} className="bg-gray-800 border-gray-600 text-white" placeholder="Detailed findings from the assessment..." rows={4} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={assessmentForm.control}
                            name="recommendations"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Recommendations (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea {...field} className="bg-gray-800 border-gray-600 text-white" placeholder="Recommendations for maintenance or repairs..." rows={3} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={assessmentForm.control}
                              name="assessedBy"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Assessed By</FormLabel>
                                  <FormControl>
                                    <Input {...field} className="bg-gray-800 border-gray-600 text-white" placeholder="Inspector/Surveyor name" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={assessmentForm.control}
                              name="nextAssessmentDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Next Assessment Date (Optional)</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="date" className="bg-gray-800 border-gray-600 text-white" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="flex justify-end gap-3">
                            <DialogTrigger asChild>
                              <Button variant="outline" type="button">Cancel</Button>
                            </DialogTrigger>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={createAssessmentMutation.isPending}>
                              {createAssessmentMutation.isPending ? 'Creating...' : 'Create Assessment'}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-950/30">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Assessment Report
                  </Button>
                </div>
              </div>

              {assessmentsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-900/50 rounded-lg h-32 animate-pulse" />
                  ))}
                </div>
              ) : conditionAssessments.length === 0 ? (
                <Card className="bg-gray-900/50 border-gray-700/50">
                  <CardContent className="p-12 text-center">
                    <Target className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Condition Assessments</h3>
                    <p className="text-gray-400 mb-6">Start tracking yacht condition with detailed assessments</p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <Target className="h-4 w-4 mr-2" />
                          Create First Assessment
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Assessment Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-200 text-sm">Total Assessments</p>
                            <p className="text-2xl font-bold text-white">{conditionAssessments.length}</p>
                          </div>
                          <Target className="h-8 w-8 text-blue-400" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-200 text-sm">Average Score</p>
                            <p className="text-2xl font-bold text-white">
                              {conditionAssessments.length > 0 
                                ? (conditionAssessments.reduce((acc: number, assessment: any) => acc + assessment.conditionScore, 0) / conditionAssessments.length).toFixed(1)
                                : '0.0'}
                            </p>
                          </div>
                          <Gauge className="h-8 w-8 text-green-400" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-200 text-sm">Recent Assessments</p>
                            <p className="text-2xl font-bold text-white">
                              {conditionAssessments.filter((a: any) => {
                                const assessmentDate = new Date(a.assessmentDate);
                                const thirtyDaysAgo = new Date();
                                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                                return assessmentDate >= thirtyDaysAgo;
                              }).length}
                            </p>
                          </div>
                          <Calendar className="h-8 w-8 text-purple-400" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 border-yellow-700/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-yellow-200 text-sm">Needs Attention</p>
                            <p className="text-2xl font-bold text-white">
                              {conditionAssessments.filter((a: any) => a.conditionScore < 6).length}
                            </p>
                          </div>
                          <AlertTriangle className="h-8 w-8 text-yellow-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Overall Condition Summary */}
                  <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Gauge className="h-5 w-5" />
                        Overall Yacht Condition
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-300">Overall Health Score</span>
                            <span className="text-2xl font-bold text-white">
                              {conditionAssessments.length > 0 
                                ? (conditionAssessments.reduce((acc: number, assessment: any) => acc + assessment.conditionScore, 0) / conditionAssessments.length).toFixed(1)
                                : '0.0'}/10
                            </span>
                          </div>
                          <Progress 
                            value={conditionAssessments.length > 0 
                              ? (conditionAssessments.reduce((acc: number, assessment: any) => acc + assessment.conditionScore, 0) / conditionAssessments.length) * 10
                              : 0
                            } 
                            className="w-full h-3" 
                          />
                        </div>
                        <div className="space-y-3">
                          {['hull_inspection', 'engine_assessment', 'electrical_system', 'safety_equipment'].map((type) => {
                            const assessments = conditionAssessments.filter((a: any) => a.assessmentType === type);
                            const avgScore = assessments.length > 0 
                              ? assessments.reduce((acc: number, a: any) => acc + a.conditionScore, 0) / assessments.length 
                              : 0;
                            return (
                              <div key={type} className="flex items-center justify-between">
                                <span className="text-gray-400 capitalize">{type.replace('_', ' ')}</span>
                                <div className="flex items-center gap-2">
                                  <Progress value={avgScore * 10} className="w-16 h-2" />
                                  <span className="text-white text-sm w-8">{avgScore.toFixed(1)}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Assessment Records List */}
                  {conditionAssessments.map((assessment: any) => {
                    const scoreColor = assessment.conditionScore >= 8 ? 'text-green-400' : 
                                     assessment.conditionScore >= 6 ? 'text-yellow-400' : 'text-red-400';
                    const scoreBg = assessment.conditionScore >= 8 ? 'bg-green-900/50' : 
                                   assessment.conditionScore >= 6 ? 'bg-yellow-900/50' : 'bg-red-900/50';

                    return (
                      <motion.div
                        key={assessment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group"
                      >
                        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/60 transition-all duration-500 hover:border-purple-500/30">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className={`px-3 py-2 rounded-lg ${scoreBg}`}>
                                  <span className={`text-lg font-bold ${scoreColor}`}>
                                    {assessment.conditionScore}/10
                                  </span>
                                </div>
                                <div>
                                  <h4 className="text-white font-medium capitalize">
                                    {assessment.assessmentType.replace('_', ' ')}
                                  </h4>
                                  <p className="text-gray-400 text-sm">
                                    {new Date(assessment.assessmentDate).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-gray-400 text-sm">Assessed by</p>
                                <p className="text-white">{assessment.assessedBy}</p>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <h5 className="text-white font-medium mb-2">Findings</h5>
                                <p className="text-gray-300 bg-gray-800/50 rounded p-3">{assessment.findings}</p>
                              </div>

                              {assessment.recommendations && (
                                <div>
                                  <h5 className="text-white font-medium mb-2">Recommendations</h5>
                                  <p className="text-gray-300 bg-gray-800/50 rounded p-3">{assessment.recommendations}</p>
                                </div>
                              )}

                              {assessment.nextAssessmentDate && (
                                <div className="border-t border-gray-700/50 pt-4">
                                  <p className="text-sm text-gray-400">
                                    Next assessment scheduled: {new Date(assessment.nextAssessmentDate).toLocaleDateString()}
                                  </p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Condition Assessments Tab - Comprehensive Implementation */}
            <TabsContent value="assessments">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">Condition Assessments</h3>
                <div className="flex gap-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Target className="h-4 w-4 mr-2" />
                        New Assessment
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900/95 border-gray-700/50 backdrop-blur-xl max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-white">Condition Assessment</DialogTitle>
                      </DialogHeader>
                      <Form {...assessmentForm}>
                        <form onSubmit={assessmentForm.handleSubmit((data) => createAssessmentMutation.mutate(data))} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={assessmentForm.control}
                              name="assessmentType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Assessment Type</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                                        <SelectValue placeholder="Select assessment type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-800 border-gray-600">
                                      <SelectItem value="hull_inspection">Hull Inspection</SelectItem>
                                      <SelectItem value="engine_assessment">Engine Assessment</SelectItem>
                                      <SelectItem value="electrical_system">Electrical System</SelectItem>
                                      <SelectItem value="safety_equipment">Safety Equipment</SelectItem>
                                      <SelectItem value="interior_condition">Interior Condition</SelectItem>
                                      <SelectItem value="structural_integrity">Structural Integrity</SelectItem>
                                      <SelectItem value="navigation_systems">Navigation Systems</SelectItem>
                                      <SelectItem value="annual_survey">Annual Survey</SelectItem>
                                    </SelectContent>
                                  </Select>
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
                                    <Input {...field} type="number" min="1" max="10" className="bg-gray-800 border-gray-600 text-white" />
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
                              <FormItem>
                                <FormLabel className="text-white">Assessment Findings</FormLabel>
                                <FormControl>
                                  <Textarea {...field} className="bg-gray-800 border-gray-600 text-white" placeholder="Detailed findings from the assessment..." rows={4} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={assessmentForm.control}
                            name="recommendations"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Recommendations (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea {...field} className="bg-gray-800 border-gray-600 text-white" placeholder="Recommendations for maintenance or repairs..." rows={3} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={assessmentForm.control}
                              name="assessedBy"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Assessed By</FormLabel>
                                  <FormControl>
                                    <Input {...field} className="bg-gray-800 border-gray-600 text-white" placeholder="Inspector/Surveyor name" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={assessmentForm.control}
                              name="nextAssessmentDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">Next Assessment Date (Optional)</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="date" className="bg-gray-800 border-gray-600 text-white" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="flex justify-end gap-3">
                            <DialogTrigger asChild>
                              <Button variant="outline" type="button">Cancel</Button>
                            </DialogTrigger>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={createAssessmentMutation.isPending}>
                              {createAssessmentMutation.isPending ? 'Creating...' : 'Create Assessment'}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-950/30">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Assessment Report
                  </Button>
                </div>
              </div>

              {assessmentsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-900/50 rounded-lg h-32 animate-pulse" />
                  ))}
                </div>
              ) : conditionAssessments.length === 0 ? (
                <Card className="bg-gray-900/50 border-gray-700/50">
                  <CardContent className="p-12 text-center">
                    <Target className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Condition Assessments</h3>
                    <p className="text-gray-400 mb-6">Start tracking yacht condition with detailed assessments</p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <Target className="h-4 w-4 mr-2" />
                          Create First Assessment
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Assessment Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-200 text-sm">Total Assessments</p>
                            <p className="text-2xl font-bold text-white">{conditionAssessments.length}</p>
                          </div>
                          <Target className="h-8 w-8 text-blue-400" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-200 text-sm">Average Score</p>
                            <p className="text-2xl font-bold text-white">
                              {conditionAssessments.length > 0 
                                ? (conditionAssessments.reduce((acc: number, assessment: any) => acc + assessment.conditionScore, 0) / conditionAssessments.length).toFixed(1)
                                : '0.0'}
                            </p>
                          </div>
                          <Gauge className="h-8 w-8 text-green-400" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-200 text-sm">Recent Assessments</p>
                            <p className="text-2xl font-bold text-white">
                              {conditionAssessments.filter((a: any) => {
                                const assessmentDate = new Date(a.assessmentDate);
                                const thirtyDaysAgo = new Date();
                                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                                return assessmentDate >= thirtyDaysAgo;
                              }).length}
                            </p>
                          </div>
                          <Calendar className="h-8 w-8 text-purple-400" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 border-yellow-700/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-yellow-200 text-sm">Needs Attention</p>
                            <p className="text-2xl font-bold text-white">
                              {conditionAssessments.filter((a: any) => a.conditionScore < 6).length}
                            </p>
                          </div>
                          <AlertTriangle className="h-8 w-8 text-yellow-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Overall Condition Summary */}
                  <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Gauge className="h-5 w-5" />
                        Overall Yacht Condition
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-300">Overall Health Score</span>
                            <span className="text-2xl font-bold text-white">
                              {conditionAssessments.length > 0 
                                ? (conditionAssessments.reduce((acc: number, assessment: any) => acc + assessment.conditionScore, 0) / conditionAssessments.length).toFixed(1)
                                : '0.0'}/10
                            </span>
                          </div>
                          <Progress 
                            value={conditionAssessments.length > 0 
                              ? (conditionAssessments.reduce((acc: number, assessment: any) => acc + assessment.conditionScore, 0) / conditionAssessments.length) * 10
                              : 0
                            } 
                            className="w-full h-3" 
                          />
                        </div>
                        <div className="space-y-3">
                          {['hull_inspection', 'engine_assessment', 'electrical_system', 'safety_equipment'].map((type) => {
                            const assessments = conditionAssessments.filter((a: any) => a.assessmentType === type);
                            const avgScore = assessments.length > 0 
                              ? assessments.reduce((acc: number, a: any) => acc + a.conditionScore, 0) / assessments.length 
                              : 0;
                            return (
                              <div key={type} className="flex items-center justify-between">
                                <span className="text-gray-400 capitalize">{type.replace('_', ' ')}</span>
                                <div className="flex items-center gap-2">
                                  <Progress value={avgScore * 10} className="w-16 h-2" />
                                  <span className="text-white text-sm w-8">{avgScore.toFixed(1)}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Assessment Records List */}
                  {conditionAssessments.map((assessment: any) => {
                    const scoreColor = assessment.conditionScore >= 8 ? 'text-green-400' : 
                                     assessment.conditionScore >= 6 ? 'text-yellow-400' : 'text-red-400';
                    const scoreBg = assessment.conditionScore >= 8 ? 'bg-green-900/50' : 
                                   assessment.conditionScore >= 6 ? 'bg-yellow-900/50' : 'bg-red-900/50';

                    return (
                      <motion.div
                        key={assessment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group"
                      >
                        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/60 transition-all duration-500 hover:border-purple-500/30">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className={`px-3 py-2 rounded-lg ${scoreBg}`}>
                                  <span className={`text-lg font-bold ${scoreColor}`}>
                                    {assessment.conditionScore}/10
                                  </span>
                                </div>
                                <div>
                                  <h4 className="text-white font-medium capitalize">
                                    {assessment.assessmentType.replace('_', ' ')}
                                  </h4>
                                  <p className="text-gray-400 text-sm">
                                    {new Date(assessment.assessmentDate).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-gray-400 text-sm">Assessed by</p>
                                <p className="text-white">{assessment.assessedBy}</p>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <h5 className="text-white font-medium mb-2">Findings</h5>
                                <p className="text-gray-300 bg-gray-800/50 rounded p-3">{assessment.findings}</p>
                              </div>

                              {assessment.recommendations && (
                                <div>
                                  <h5 className="text-white font-medium mb-2">Recommendations</h5>
                                  <p className="text-gray-300 bg-gray-800/50 rounded p-3">{assessment.recommendations}</p>
                                </div>
                              )}

                              {assessment.nextAssessmentDate && (
                                <div className="border-t border-gray-700/50 pt-4">
                                  <p className="text-sm text-gray-400">
                                    Next assessment scheduled: {new Date(assessment.nextAssessmentDate).toLocaleDateString()}
                                  </p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Valuation Tab - Keep existing implementation */}
            <TabsContent value="valuation">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/50/60 transition-all duration-500 hover:border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Current Market Valuation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-white mb-2">
                          ${valuationData.currentValue?.toLocaleString() || '0'}
                        </p>
                        <p className="text-gray-400">Current Market Value</p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Condition Score</span>
                          <span className="text-white">{valuationData.conditionScore || 0}/10</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Repair Costs</span>
                          <span className="text-red-400">${valuationData.repairCosts?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Sweet Spot</span>
                          <span className="text-purple-400">{valuationData.sweetSpotMonths || 0} months</span>
                        </div>
                      </div>

                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">Recommendation</h4>
                        <p className="text-gray-300 text-sm">{valuationData.recommendation || 'No recommendation available'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/50/60 transition-all duration-500 hover:border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Value Projections
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { period: "6 months", value: 285000, change: -5.3 },
                        { period: "12 months", value: 270000, change: -10.0 },
                        { period: "18 months", value: 245000, change: -18.3 },
                        { period: "24 months", value: 220000, change: -22.8 },
                      ].map((projection) => (
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
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
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

              {maintenanceRecords.length === 0 ? (
                <Card className="bg-gray-900/50 border-gray-700/50">
                  <CardContent className="p-12 text-center">
                    <Wrench className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Maintenance Records</h3>
                    <p className="text-gray-400 mb-6">Start tracking maintenance tasks and service history</p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-orange-600 hover:bg-orange-700">
                          <Wrench className="h-4 w-4 mr-2" />
                          Schedule First Task
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {maintenanceRecords.map((record: any) => (
                    <Card key={record.id} className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/60 transition-all duration-500 hover:border-purple-500/30">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Badge variant={record.status === 'completed' ? 'default' : record.status === 'in_progress' ? 'secondary' : 'destructive'} className="px-3 py-1">
                              {record.status}
                            </Badge>
                            <span className="text-white font-medium">{record.taskType.replace('_', ' ').toUpperCase()}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-gray-400 text-sm">
                              {new Date(record.scheduledDate).toLocaleDateString()}
                            </span>
                            {record.status === 'pending' && (
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark Complete
                              </Button>
                            )}
                          </div>
                        </div>

                        <p className="text-white mb-4">{record.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Estimated Cost</p>
                            <p className="text-white font-medium">${record.estimatedCost?.toFixed(2) || '0.00'}</p>
                          </div>
                          {record.assignedTo && (
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Assigned To</p>
                              <p className="text-white">{record.assignedTo}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Priority</p>
                            <Badge className={`px-2 py-1 ${
                              record.priority === 'critical' ? 'text-red-400 bg-red-900/50' :
                              record.priority === 'high' ? 'text-orange-400 bg-orange-900/50' :
                              record.priority === 'medium' ? 'text-yellow-400 bg-yellow-900/50' :
                              'text-gray-400 bg-gray-900/50'
                            }`}>
                              {record.priority}
                            </Badge>
                          </div>
                        </div>

                        {record.notes && (
                          <div className="border-t border-gray-700/50 pt-4">
                            <p className="text-sm text-gray-400 mb-1">Notes</p>
                            <p className="text-white text-sm bg-gray-800/50 rounded p-2">{record.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
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

              {conditionAssessments.length === 0 ? (
                <Card className="bg-gray-900/50 border-gray-700/50">
                  <CardContent className="p-12 text-center">
                    <Target className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Condition Assessments</h3>
                    <p className="text-gray-400 mb-6">Start tracking yacht condition with detailed assessments</p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <Target className="h-4 w-4 mr-2" />
                          Create First Assessment
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {conditionAssessments.map((assessment: any) => (
                    <Card key={assessment.id} className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl hover:bg-gray-900/60 transition-all duration-500 hover:border-purple-500/30">
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
                ))}
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
                          ${valuationData.currentValue || 0}
                        </div>
                        <p className="text-gray-400">Current Market Value</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-400 mb-2">
                          ${valuationData.repairCosts || 0}
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
                        {[
                          { factor: "Engine Hours", impact: "High", value: "850 hours", trend: "increasing" },
                          { factor: "Sun Damage", impact: "Medium", value: "UV exposure", trend: "moderate" },
                          { factor: "Salt Exposure", impact: "Medium", value: "Coastal use", trend: "ongoing" },
                          { factor: "Maintenance History", impact: "Low", value: "Well maintained", trend: "positive" },
                        ].map((factor) => (
                          <div key={factor.factor} className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">{factor.factor}</p>
                              <p className="text-xs text-gray-400">{factor.value}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant={
                                factor.impact === 'High' ? 'destructive' :
                                factor.impact === 'Medium' ? 'secondary' : 'default'
                              }>
                                {factor.impact}
                              </Badge>
                            </div>
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
                          { period: "Current", value: 285000, change: 0 },
                          { period: "6 months", value: 275000, change: -3.5 },
                          { period: "12 months", value: 260000, change: -8.8 },
                          { period: "18 months", value: 240000, change: -15.8 },
                          { period: "24 months", value: 220000, change: -22.8 },
                        ].map((projection) => (
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