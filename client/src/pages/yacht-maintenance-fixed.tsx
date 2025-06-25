import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/use-auth';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from '../lib/queryClient';
import { Lock, Anchor, ChevronRight } from 'lucide-react';

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
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-800/50 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">{yacht.name}</h3>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <p className="text-gray-400 text-sm mb-2">{yacht.location}</p>
                <p className="text-gray-500 text-sm">{yacht.type} • {yacht.length}ft • {yacht.capacity} guests</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              {selectedYachtData?.name} Maintenance Dashboard
            </h2>
            <p className="text-gray-400">
              This feature is currently under development. Please check back soon for comprehensive maintenance tracking.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}