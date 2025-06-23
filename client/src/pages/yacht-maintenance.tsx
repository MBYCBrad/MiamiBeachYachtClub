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
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Yacht Maintenance System</h1>
              <p className="text-gray-400">Comprehensive yacht tracking, maintenance, and resale optimization</p>
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
            <motion.div
              className="h-16 w-16 mx-auto mb-6"
              animate={{
                y: [0, -8, 0],
                rotateY: [0, 5, 0, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ filter: 'drop-shadow(0 4px 8px rgba(139, 92, 246, 0.3))' }}
              >
                <defs>
                  <linearGradient id="yachtGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="50%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                  <linearGradient id="sailGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f8fafc" />
                    <stop offset="50%" stopColor="#e2e8f0" />
                    <stop offset="100%" stopColor="#cbd5e1" />
                  </linearGradient>
                </defs>
                
                {/* Water waves */}
                <motion.path
                  d="M8 48 Q16 44 24 48 T40 48 T56 48"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  fill="none"
                  opacity="0.6"
                  animate={{
                    d: [
                      "M8 48 Q16 44 24 48 T40 48 T56 48",
                      "M8 50 Q16 46 24 50 T40 50 T56 50",
                      "M8 48 Q16 44 24 48 T40 48 T56 48"
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Yacht hull */}
                <motion.ellipse
                  cx="32" cy="45" rx="18" ry="4"
                  fill="url(#yachtGradient)"
                  animate={{
                    rx: [18, 19, 18],
                    ry: [4, 4.5, 4]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Yacht cabin */}
                <rect x="26" y="36" width="12" height="9" rx="2" fill="url(#yachtGradient)" />
                
                {/* Main mast */}
                <line x1="32" y1="36" x2="32" y2="12" stroke="#64748b" strokeWidth="2" />
                
                {/* Main sail */}
                <motion.path
                  d="M32 12 Q44 16 44 28 Q44 32 38 36 L32 36 Z"
                  fill="url(#sailGradient)"
                  stroke="#94a3b8"
                  strokeWidth="1"
                  animate={{
                    d: [
                      "M32 12 Q44 16 44 28 Q44 32 38 36 L32 36 Z",
                      "M32 12 Q46 18 46 28 Q46 32 40 36 L32 36 Z",
                      "M32 12 Q44 16 44 28 Q44 32 38 36 L32 36 Z"
                    ]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Jib sail */}
                <motion.path
                  d="M32 12 Q20 16 20 28 L26 36 L32 24 Z"
                  fill="url(#sailGradient)"
                  stroke="#94a3b8"
                  strokeWidth="1"
                  opacity="0.9"
                  animate={{
                    d: [
                      "M32 12 Q20 16 20 28 L26 36 L32 24 Z",
                      "M32 12 Q18 18 18 28 L24 36 L32 24 Z",
                      "M32 12 Q20 16 20 28 L26 36 L32 24 Z"
                    ]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                />
                
                {/* Flag */}
                <motion.rect
                  x="32" y="12" width="8" height="5" 
                  fill="#ef4444"
                  animate={{
                    scaleX: [1, 1.2, 1],
                    scaleY: [1, 0.8, 1]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Sparkles around yacht */}
                <motion.circle
                  cx="20" cy="20" r="1"
                  fill="#fbbf24"
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 0
                  }}
                />
                <motion.circle
                  cx="48" cy="24" r="1"
                  fill="#fbbf24"
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 0.7
                  }}
                />
                <motion.circle
                  cx="52" cy="40" r="1"
                  fill="#fbbf24"
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 1.4
                  }}
                />
              </svg>
            </motion.div>
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
                {tripLogs.map((trip: any) => (
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
                ))}
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
                {maintenanceRecords.map((record: any) => (
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
                ))}
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
                {conditionAssessments.map((assessment: any) => (
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