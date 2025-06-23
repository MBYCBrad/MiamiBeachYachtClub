import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Phone, PhoneCall, PhoneOff, Search, Users, MessageCircle,
  Clock, AlertTriangle, User, Mail, MapPin, Anchor
} from 'lucide-react';

interface CallableMember {
  id: number;
  memberName: string;
  phoneNumber: string;
  email: string;
  membershipTier: string;
  location: string;
  yachtName?: string;
  currentTrip?: boolean;
  bookingId?: number;
}

interface ActiveCall {
  phoneNumber: string;
  memberName?: string;
  memberId?: number;
  callSid?: string;
  startTime: Date;
  type: 'outbound' | 'inbound';
}

type CallStatus = 'idle' | 'ringing' | 'connected' | 'ended';

interface CustomerServiceStats {
  totalMembers: number;
  activeConversations: number;
  onlineAgents: number;
  callsInQueue: number;
}

export default function CustomerServiceDashboard() {
  // State management
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [selectedMember, setSelectedMember] = useState<CallableMember | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [manualPhoneNumber, setManualPhoneNumber] = useState('');
  const [notes, setNotes] = useState('');
  
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Fetch real-time customer service data
  const { data: callableMembers = [], isLoading: membersLoading } = useQuery({
    queryKey: ['/api/customer-service/members'],
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  const { data: customerServiceStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/customer-service/stats'],
    staleTime: 30 * 1000, // 30 seconds
  });

  // Emergency contacts (members currently on trips)
  const emergencyMembers = callableMembers.filter((member: any) => member.currentTrip);

  // Timer management functions
  const startCallTimer = () => {
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const stopCallTimer = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
  };

  // Twilio calling mutation
  const makeCallMutation = useMutation({
    mutationFn: async (callData: { phoneNumber: string; memberName: string; callType?: string }) => {
      const response = await apiRequest('POST', '/api/customer-service/call', callData);
      return await response.json();
    },
    onSuccess: (data) => {
      setCallStatus('ringing');
      setActiveCall({
        phoneNumber: selectedMember?.phoneNumber || manualPhoneNumber,
        memberName: selectedMember?.memberName || 'Manual Dial',
        memberId: selectedMember?.id,
        callSid: data.callSid,
        startTime: new Date(),
        type: 'outbound'
      });
      startCallTimer();
      
      toast({
        title: "Call Initiated",
        description: `Calling ${selectedMember?.memberName || manualPhoneNumber}...`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Call Failed",
        description: error.message || "Unable to initiate call",
        variant: "destructive",
      });
      setCallStatus('idle');
    }
  });

  // End call mutation
  const endCallMutation = useMutation({
    mutationFn: async (callSid: string) => {
      const response = await apiRequest('POST', '/api/customer-service/end-call', { callSid });
      return await response.json();
    },
    onSuccess: () => {
      setCallStatus('ended');
      stopCallTimer();
      
      toast({
        title: "Call Ended",
        description: "Call has been terminated successfully",
      });
      
      // Auto-reset after 3 seconds
      setTimeout(() => {
        setCallStatus('idle');
        setActiveCall(null);
        setSelectedMember(null);
        setCallDuration(0);
        setNotes('');
        setManualPhoneNumber('');
      }, 3000);
    },
    onError: (error: any) => {
      toast({
        title: "End Call Failed",
        description: error.message || "Failed to end call",
        variant: "destructive",
      });
    }
  });

  // Call management functions
  const handleCallMember = (member: any) => {
    if (callStatus !== 'idle') return;
    
    setSelectedMember(member);
    makeCallMutation.mutate({
      phoneNumber: member.phoneNumber,
      memberName: member.memberName,
      callType: 'outbound'
    });
  };

  const handleManualCall = () => {
    if (!manualPhoneNumber.trim() || callStatus !== 'idle') return;
    
    setSelectedMember(null);
    makeCallMutation.mutate({
      phoneNumber: manualPhoneNumber,
      memberName: "Manual Dial"
    });
  };

  const handleEndCall = () => {
    if (activeCall?.callSid) {
      endCallMutation.mutate(activeCall.callSid);
    } else {
      // Fallback if no call SID
      setCallStatus('ended');
      stopCallTimer();
      setTimeout(() => {
        setCallStatus('idle');
        setActiveCall(null);
        setSelectedMember(null);
        setCallDuration(0);
        setNotes('');
        setManualPhoneNumber('');
      }, 3000);
    }
  };

  // Simulate call status changes for ringing to connected
  useEffect(() => {
    if (callStatus === 'ringing') {
      const timeout = setTimeout(() => {
        setCallStatus('connected');
        toast({
          title: "Call Connected",
          description: "You are now connected with the member",
        });
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [callStatus]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, []);

  // Filter members based on search and tab
  const filteredMembers = callableMembers.filter((member: any) => {
    const matchesSearch = member.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.phoneNumber.includes(searchTerm) ||
                         (member.yachtName && member.yachtName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    switch (activeTab) {
      case 'emergency':
        return matchesSearch && member.currentTrip;
      case 'active':
        return matchesSearch && callStatus !== 'idle';
      case 'all':
        return matchesSearch;
      default:
        return matchesSearch;
    }
  });

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'platinum': return 'bg-purple-600';
      case 'gold': return 'bg-yellow-600';
      case 'silver': return 'bg-gray-500';
      case 'bronze': return 'bg-orange-600';
      default: return 'bg-gray-600';
    }
  };

  const getCallStatusColor = () => {
    switch (callStatus) {
      case 'ringing': return 'border-yellow-500 bg-yellow-500/10';
      case 'connected': return 'border-green-500 bg-green-500/10';
      case 'ended': return 'border-red-500 bg-red-500/10';
      default: return 'border-gray-600 bg-gray-800';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Use real-time stats with fallback
  const stats: CustomerServiceStats = customerServiceStats || {
    totalMembers: callableMembers.length,
    activeConversations: 0,
    onlineAgents: 3,
    callsInQueue: emergencyMembers.length
  };

  if (membersLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Customer Service Dashboard</h1>
        <p className="text-gray-400">Real-time member communication and support management</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Members</p>
                <p className="text-2xl font-bold text-white">{stats.totalMembers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Conversations</p>
                <p className="text-2xl font-bold text-white">{stats.activeConversations}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Online Agents</p>
                <p className="text-2xl font-bold text-white">{stats.onlineAgents}</p>
              </div>
              <User className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Calls in Queue</p>
                <p className="text-2xl font-bold text-white">{stats.callsInQueue}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Call Interface */}
        <div className="lg:col-span-2">
          <Card className={`bg-gray-900 border-2 transition-all duration-300 ${getCallStatusColor()}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Phone className="h-5 w-5" />
                Call Management
                {callStatus !== 'idle' && (
                  <Badge variant="outline" className="ml-auto text-white border-white">
                    {callStatus.toUpperCase()}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Manual Dial */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Manual Dial</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter phone number..."
                    value={manualPhoneNumber}
                    onChange={(e) => setManualPhoneNumber(e.target.value)}
                    className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    disabled={callStatus !== 'idle'}
                  />
                  <Button
                    onClick={handleManualCall}
                    disabled={!manualPhoneNumber.trim() || callStatus !== 'idle' || makeCallMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <PhoneCall className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Active Call Display */}
              {activeCall && (
                <div className="bg-gray-800 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-white">{activeCall.memberName}</h4>
                      <p className="text-gray-400">{activeCall.phoneNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-mono text-white">{formatDuration(callDuration)}</p>
                      <p className="text-sm text-gray-400">Duration</p>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      onClick={handleEndCall}
                      disabled={endCallMutation.isPending}
                      className="bg-red-600 hover:bg-red-700 text-white px-8"
                    >
                      <PhoneOff className="h-4 w-4 mr-2" />
                      End Call
                    </Button>
                  </div>

                  {/* Call Notes */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Call Notes</label>
                    <Textarea
                      placeholder="Add notes about this call..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Member Directory */}
        <div>
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Member Directory</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                  <TabsTrigger value="all" className="data-[state=active]:bg-purple-600 text-white">
                    All ({callableMembers.length})
                  </TabsTrigger>
                  <TabsTrigger value="emergency" className="data-[state=active]:bg-red-600 text-white">
                    Emergency ({emergencyMembers.length})
                  </TabsTrigger>
                  <TabsTrigger value="active" className="data-[state=active]:bg-green-600 text-white">
                    Active
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-4 space-y-3 max-h-96 overflow-y-auto">
                  {filteredMembers.map((member: any) => (
                    <Card 
                      key={member.id} 
                      className="bg-gray-800 border-gray-600 hover:border-purple-500 transition-colors cursor-pointer"
                      onClick={() => handleCallMember(member)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-white">{member.memberName}</h4>
                              <Badge className={`${getTierColor(member.membershipTier)} text-white`}>
                                {member.membershipTier}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-1 text-sm text-gray-400">
                              <Phone className="h-3 w-3" />
                              {member.phoneNumber}
                            </div>
                            
                            <div className="flex items-center gap-1 text-sm text-gray-400">
                              <Mail className="h-3 w-3" />
                              {member.email}
                            </div>
                            
                            <div className="flex items-center gap-1 text-sm text-gray-400">
                              <MapPin className="h-3 w-3" />
                              {member.location}
                            </div>

                            {member.currentTrip && (
                              <div className="flex items-center gap-1 text-sm text-orange-400">
                                <Anchor className="h-3 w-3" />
                                On Trip: {member.yachtName || 'Marina Breeze'}
                              </div>
                            )}
                          </div>

                          <Button
                            size="sm"
                            disabled={callStatus !== 'idle' || makeCallMutation.isPending}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCallMember(member);
                            }}
                          >
                            <PhoneCall className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredMembers.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      No members found matching your criteria
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}