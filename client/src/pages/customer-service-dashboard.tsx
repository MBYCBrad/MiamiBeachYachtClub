import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  Phone, 
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  User,
  Clock,
  Search,
  Filter,
  MoreVertical,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Users,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  Settings,
  Archive,
  Trash2,
  Flag,
  ChevronDown,
  Sparkles,
  Ship,
  UserCheck,
  Timer,
  Crown,
  Play,
  Pause,
  Square,
  PhoneMissed
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";

// Types for phone calls and customer service
interface Call {
  id: string;
  memberId: number;
  memberName: string;
  memberPhone: string;
  membershipTier: string;
  callType: 'incoming' | 'outgoing' | 'missed';
  status: 'queued' | 'active' | 'completed' | 'missed' | 'voicemail';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reason: string;
  duration?: number;
  startTime: Date;
  endTime?: Date;
  notes?: string;
  assignedAgent?: string;
  currentTrip?: {
    id: number;
    yachtName: string;
    startTime: Date;
    endTime: Date;
    status: string;
  };
}

interface CallQueue {
  totalCalls: number;
  averageWaitTime: number;
  longestWait: number;
  activeAgents: number;
}

export default function CustomerServiceDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [selectedCall, setSelectedCall] = useState<string | null>(null);
  const [callFilter, setCallFilter] = useState<'all' | 'queued' | 'active' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentCallNotes, setCurrentCallNotes] = useState("");

  // Mock data for demonstration (in production, these would come from APIs)
  const mockCalls: Call[] = [
    {
      id: "call_1",
      memberId: 61,
      memberName: "demo_member",
      memberPhone: "+1 (555) 123-4567",
      membershipTier: "Gold",
      callType: "incoming",
      status: "queued",
      priority: "high",
      reason: "Yacht booking assistance",
      startTime: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      assignedAgent: "Customer Service",
      currentTrip: {
        id: 8,
        yachtName: "Marina Breeze",
        startTime: new Date("2025-06-23T10:00:00"),
        endTime: new Date("2025-06-23T18:00:00"),
        status: "confirmed"
      }
    },
    {
      id: "call_2",
      memberId: 62,
      memberName: "Sarah Johnson",
      memberPhone: "+1 (555) 987-6543",
      membershipTier: "Platinum",
      callType: "incoming",
      status: "active",
      priority: "urgent",
      reason: "Emergency yacht assistance",
      duration: 12,
      startTime: new Date(Date.now() - 12 * 60 * 1000), // 12 minutes ago
      assignedAgent: "Agent Smith"
    },
    {
      id: "call_3",
      memberId: 63,
      memberName: "Michael Chen",
      memberPhone: "+1 (555) 456-7890",
      membershipTier: "Silver",
      callType: "outgoing",
      status: "completed",
      priority: "medium",
      reason: "Service follow-up",
      duration: 8,
      startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      endTime: new Date(Date.now() - 22 * 60 * 1000),
      notes: "Member satisfied with spa service. Booking confirmed for next week."
    }
  ];

  const mockQueueStats: CallQueue = {
    totalCalls: 5,
    averageWaitTime: 3.5,
    longestWait: 8,
    activeAgents: 3
  };

  // Handle call actions
  const answerCallMutation = useMutation({
    mutationFn: async (callId: string) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast({ title: "Call answered", description: "You are now connected" });
    },
  });

  const endCallMutation = useMutation({
    mutationFn: async (callId: string) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: () => {
      setCurrentCallNotes("");
      setSelectedCall(null);
      toast({ title: "Call ended", description: "Call has been completed" });
    },
  });

  // Filter calls based on status and search
  const filteredCalls = mockCalls.filter(call => {
    const matchesFilter = callFilter === 'all' || call.status === callFilter;
    const matchesSearch = call.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         call.memberPhone.includes(searchTerm) ||
                         call.reason.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-green-400 bg-green-500/20 border-green-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'queued': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'completed': return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
      case 'missed': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'voicemail': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'platinum': return <Crown className="h-4 w-4 text-purple-400" />;
      case 'gold': return <Star className="h-4 w-4 text-yellow-400" />;
      case 'silver': return <UserCheck className="h-4 w-4 text-gray-400" />;
      default: return <User className="h-4 w-4 text-orange-400" />;
    }
  };

  const getCallTypeIcon = (type: string, status: string) => {
    if (status === 'missed') return <PhoneMissed className="h-4 w-4 text-red-400" />;
    switch (type) {
      case 'incoming': return <PhoneIncoming className="h-4 w-4 text-green-400" />;
      case 'outgoing': return <PhoneOutgoing className="h-4 w-4 text-blue-400" />;
      default: return <Phone className="h-4 w-4 text-gray-400" />;
    }
  };

  if (!user || (user.role !== 'admin' && !user.role?.startsWith('staff'))) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl p-8">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-gray-400">You don't have permission to access customer service tools.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 p-6"
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
                <PhoneCall className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Customer Service</h1>
                <p className="text-gray-400">Phone support and call queue management</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              {mockQueueStats.activeAgents} Agents Online
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              {mockQueueStats.totalCalls} Calls in Queue
            </Badge>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Queue Statistics */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Calls in Queue</p>
                      <p className="text-2xl font-bold text-white">{mockQueueStats.totalCalls}</p>
                    </div>
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <Phone className="h-5 w-5 text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Avg Wait Time</p>
                      <p className="text-2xl font-bold text-white">{mockQueueStats.averageWaitTime}m</p>
                    </div>
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                      <Timer className="h-5 w-5 text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Longest Wait</p>
                      <p className="text-2xl font-bold text-white">{mockQueueStats.longestWait}m</p>
                    </div>
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <Clock className="h-5 w-5 text-red-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Active Agents</p>
                      <p className="text-2xl font-bold text-white">{mockQueueStats.activeAgents}</p>
                    </div>
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Users className="h-5 w-5 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Call List */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-xl h-[600px]">
              <CardHeader className="border-b border-gray-700/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <PhoneCall className="h-5 w-5 text-purple-400" />
                    Call Queue
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={callFilter} onValueChange={setCallFilter}>
                      <SelectTrigger className="w-32 bg-gray-700/50 border-gray-600/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="all">All Calls</SelectItem>
                        <SelectItem value="queued">Queued</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search calls..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700/50 border-gray-600/50 text-white"
                  />
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="max-h-[500px] overflow-y-auto">
                  {filteredCalls.map((call) => (
                    <motion.div
                      key={call.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 border-b border-gray-700/50 cursor-pointer transition-all ${
                        selectedCall === call.id 
                          ? 'bg-purple-500/10 border-l-4 border-l-purple-500' 
                          : 'hover:bg-gray-700/30'
                      }`}
                      onClick={() => setSelectedCall(call.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {getCallTypeIcon(call.callType, call.status)}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-white">{call.memberName}</span>
                              {getTierIcon(call.membershipTier)}
                            </div>
                            <span className="text-sm text-gray-400">{call.memberPhone}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${getPriorityColor(call.priority)}`}>
                            {call.priority}
                          </Badge>
                          <Badge className={`text-xs ${getStatusColor(call.status)}`}>
                            {call.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{call.reason}</span>
                        <div className="flex items-center gap-4">
                          {call.duration && (
                            <span className="text-gray-400">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {call.duration}m
                            </span>
                          )}
                          <span className="text-gray-400">
                            {formatDistanceToNow(call.startTime, { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      
                      {call.currentTrip && (
                        <div className="mt-2 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                          <div className="flex items-center gap-2 text-xs text-blue-400">
                            <Ship className="h-3 w-3" />
                            <span>Active Trip: {call.currentTrip.yachtName}</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Call Controls */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            {selectedCall ? (
              <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-xl">
                <CardHeader className="border-b border-gray-700/50">
                  <CardTitle className="text-white text-lg">Call Controls</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {/* Call Action Buttons */}
                  <div className="space-y-3">
                    {filteredCalls.find(c => c.id === selectedCall)?.status === 'queued' && (
                      <Button 
                        onClick={() => answerCallMutation.mutate(selectedCall)}
                        disabled={answerCallMutation.isPending}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        <PhoneCall className="h-4 w-4 mr-2" />
                        Answer Call
                      </Button>
                    )}
                    
                    {filteredCalls.find(c => c.id === selectedCall)?.status === 'active' && (
                      <>
                        <Button 
                          onClick={() => endCallMutation.mutate(selectedCall)}
                          disabled={endCallMutation.isPending}
                          className="w-full bg-red-600 hover:bg-red-700 text-white"
                        >
                          <Square className="h-4 w-4 mr-2" />
                          End Call
                        </Button>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => setIsMuted(!isMuted)}
                            className={`flex-1 ${isMuted ? 'bg-red-500/20 border-red-500/30' : ''}`}
                          >
                            {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                          </Button>
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => setIsRecording(!isRecording)}
                            className={`flex-1 ${isRecording ? 'bg-red-500/20 border-red-500/30' : ''}`}
                          >
                            {isRecording ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Call Notes */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Call Notes
                    </label>
                    <Textarea
                      placeholder="Add notes about this call..."
                      value={currentCallNotes}
                      onChange={(e) => setCurrentCallNotes(e.target.value)}
                      className="bg-gray-700/50 border-gray-600/50 text-white h-32"
                    />
                  </div>

                  {/* Member Info */}
                  {(() => {
                    const call = filteredCalls.find(c => c.id === selectedCall);
                    return call ? (
                      <div className="space-y-3">
                        <div className="border-t border-gray-700/50 pt-3">
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Member Information</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Name:</span>
                              <span className="text-white">{call.memberName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Tier:</span>
                              <div className="flex items-center gap-1">
                                {getTierIcon(call.membershipTier)}
                                <span className="text-white">{call.membershipTier}</span>
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Phone:</span>
                              <span className="text-white">{call.memberPhone}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-xl">
                <CardContent className="p-8 text-center">
                  <PhoneCall className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">Select a Call</h3>
                  <p className="text-gray-400 text-sm">
                    Choose a call from the queue to view details and controls
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}