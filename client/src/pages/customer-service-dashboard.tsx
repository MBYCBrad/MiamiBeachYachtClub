import { useState, useEffect, useRef } from "react";
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
  Users,
  AlertTriangle,
  Headphones,
  Ship,
  Trash2,
  Timer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

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

interface CallHistoryItem extends ActiveCall {
  endTime: Date;
  duration: number;
  notes: string;
}

type CallStatus = 'idle' | 'ringing' | 'connected' | 'ended';

export default function CustomerServiceDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [activeTab, setActiveTab] = useState('members');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<CallableMember | null>(null);
  const [manualPhoneNumber, setManualPhoneNumber] = useState('');
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>([]);
  const [notes, setNotes] = useState('');
  
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch callable members
  const { data: callableMembers = [] } = useQuery<CallableMember[]>({
    queryKey: ['/api/admin/users'],
    select: (users: any[]) => users
      .filter(user => user.role === 'member' && user.phoneNumber)
      .map(user => ({
        id: user.id,
        memberName: user.username,
        phoneNumber: user.phoneNumber || '+1-555-0000',
        email: user.email,
        membershipTier: user.membershipTier || 'Bronze',
        location: user.location || 'Miami, FL',
        yachtName: 'Marina Breeze',
        currentTrip: Math.random() > 0.7,
        bookingId: user.id * 100
      }))
  });

  // Emergency contacts (members currently on trips)
  const emergencyMembers = callableMembers.filter(member => member.currentTrip);

  // Call management functions
  const handleCallMember = (member: CallableMember) => {
    if (callStatus !== 'idle') return;
    
    setSelectedMember(member);
    makeCallMutation.mutate({
      phoneNumber: member.phoneNumber,
      memberName: member.memberName,
      memberId: member.id
    });
  };

  const handleManualCall = () => {
    if (!manualPhoneNumber.trim() || callStatus !== 'idle') return;
    
    makeCallMutation.mutate({
      phoneNumber: manualPhoneNumber,
      memberName: "Manual Dial"
    });
  };

  const handleEndCall = () => {
    if (activeCall?.callSid) {
      endCallMutation.mutate(activeCall.callSid);
    }
  };

  // Twilio call mutation for outbound calls
  const makeCallMutation = useMutation({
    mutationFn: async (data: { phoneNumber: string; memberName?: string; memberId?: number }) => {
      const response = await apiRequest('POST', '/api/twilio/make-call', data);
      return response.json();
    },
    onSuccess: (data, variables) => {
      setCallStatus('ringing');
      setActiveCall({
        ...variables,
        callSid: data.callSid,
        startTime: new Date(),
        type: 'outbound'
      });
      toast({
        title: "Call Initiated",
        description: `Calling ${variables.memberName || variables.phoneNumber}...`,
      });
      
      // Start call timer
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Call Failed",
        description: error.message || "Failed to initiate call",
        variant: "destructive",
      });
      setCallStatus('idle');
    }
  });

  // End call mutation
  const endCallMutation = useMutation({
    mutationFn: async (callSid: string) => {
      const response = await apiRequest('POST', '/api/twilio/end-call', { callSid });
      return response.json();
    },
    onSuccess: () => {
      setCallStatus('ended');
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      
      // Add to call history
      if (activeCall) {
        setCallHistory(prev => [...prev, {
          ...activeCall,
          endTime: new Date(),
          duration: callDuration,
          notes: notes
        }]);
      }
      
      toast({
        title: "Call Ended",
        description: "Call has been terminated successfully",
      });
      
      // Reset state
      setTimeout(() => {
        setCallStatus('idle');
        setActiveCall(null);
        setCallDuration(0);
        setNotes('');
        setSelectedMember(null);
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "End Call Failed",
        description: error.message || "Failed to end call",
        variant: "destructive",
      });
    }
  });

  // Simulate call status changes
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

  // Filter members based on search and tab
  const filteredMembers = callableMembers.filter((member: CallableMember) => {
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
      default: return 'bg-orange-600';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Left Sidebar - Member List */}
      <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Headphones className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Customer Service</h1>
              <p className="text-sm text-gray-400">Phone support and call management</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-green-900/20 border border-green-800 rounded-lg">
              <div className="text-center">
                <p className="text-lg font-semibold text-green-400">3</p>
                <p className="text-xs text-green-300">Agents Online</p>
              </div>
            </div>
            <div className="p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
              <div className="text-center">
                <p className="text-lg font-semibold text-blue-400">5</p>
                <p className="text-xs text-blue-300">Calls in Queue</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800 mx-4 mt-4">
            <TabsTrigger value="members" className="text-xs">All Members</TabsTrigger>
            <TabsTrigger value="emergency" className="text-xs">Emergency</TabsTrigger>
            <TabsTrigger value="active" className="text-xs">Active</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="flex-1 px-4">
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {filteredMembers.map((member) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                      selectedMember?.id === member.id 
                        ? 'bg-purple-900/30 border-purple-600' 
                        : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                    }`}
                    onClick={() => setSelectedMember(member)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-blue-600">
                            {member.memberName.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.memberName}</p>
                          <p className="text-sm text-gray-400">{member.phoneNumber}</p>
                          <Badge className={`${getTierColor(member.membershipTier)} text-white text-xs mt-1`}>
                            {member.membershipTier}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCallMember(member);
                        }}
                        disabled={callStatus !== 'idle'}
                        className="bg-green-600 hover:bg-green-700 p-2 h-8 w-8"
                      >
                        <Phone className="h-3 w-3" />
                      </Button>
                    </div>
                    {member.currentTrip && (
                      <div className="mt-2 p-2 bg-red-900/20 rounded border-l-2 border-red-500">
                        <div className="flex items-center gap-2 text-red-400">
                          <Ship className="h-3 w-3" />
                          <span className="text-xs font-medium">ACTIVE TRIP</span>
                        </div>
                        <p className="text-xs text-gray-300 mt-1">{member.yachtName}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="emergency" className="flex-1 px-4">
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {emergencyMembers.map((member) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-900/20 border border-red-800 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-red-600">
                            {member.memberName.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-red-100">{member.memberName}</p>
                          <p className="text-sm text-red-300">{member.phoneNumber}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Ship className="h-3 w-3 text-red-400" />
                            <span className="text-xs text-red-400">{member.yachtName}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleCallMember(member)}
                        disabled={callStatus !== 'idle'}
                        className="bg-red-600 hover:bg-red-700 p-2 h-8 w-8"
                      >
                        <Phone className="h-3 w-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="active" className="flex-1 px-4">
            <ScrollArea className="h-full">
              {callStatus !== 'idle' && activeCall ? (
                <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-green-100">Active Call</h3>
                    <p className="text-green-300">{activeCall.memberName}</p>
                    <p className="text-sm text-green-400">{activeCall.phoneNumber}</p>
                    <div className="mt-4">
                      <div className="text-2xl font-mono text-green-200">
                        {formatDuration(callDuration)}
                      </div>
                      <Badge className="mt-2" variant={callStatus === 'connected' ? 'default' : 'secondary'}>
                        {callStatus}
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400">
                  <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active calls</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {callStatus !== 'idle' && activeCall ? (
          /* Active Call Interface */
          <div className="flex-1 flex flex-col justify-center items-center p-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center max-w-md"
            >
              <Avatar className="h-32 w-32 mx-auto mb-6">
                <AvatarFallback className="bg-blue-600 text-2xl">
                  {activeCall.memberName?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <h2 className="text-2xl font-semibold mb-2">{activeCall.memberName}</h2>
              <p className="text-gray-400 mb-2">{activeCall.phoneNumber}</p>
              
              <div className="mb-6">
                <div className="text-4xl font-mono mb-2">{formatDuration(callDuration)}</div>
                <Badge variant={callStatus === 'connected' ? 'default' : 'secondary'} className="text-sm">
                  {callStatus.toUpperCase()}
                </Badge>
              </div>

              <div className="flex gap-4 justify-center mb-6">
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={handleEndCall}
                  disabled={endCallMutation.isPending}
                >
                  <Phone className="h-5 w-5 mr-2" />
                  End Call
                </Button>
              </div>

              <div className="w-full">
                <Label htmlFor="call-notes" className="text-sm text-gray-400">Call Notes</Label>
                <Textarea
                  id="call-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this call..."
                  className="bg-gray-800 border-gray-600 mt-2"
                  rows={3}
                />
              </div>
            </motion.div>
          </div>
        ) : selectedMember ? (
          /* Member Details */
          <div className="flex-1 p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-blue-600 text-xl">
                    {selectedMember.memberName.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-semibold">{selectedMember.memberName}</h2>
                  <p className="text-gray-400">{selectedMember.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`${getTierColor(selectedMember.membershipTier)} text-white`}>
                      {selectedMember.membershipTier}
                    </Badge>
                    {selectedMember.currentTrip && (
                      <Badge className="bg-red-600">Active Trip</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-400">Phone</p>
                      <p className="font-medium">{selectedMember.phoneNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="font-medium">{selectedMember.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Location</p>
                      <p className="font-medium">{selectedMember.location}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Ship className="h-4 w-4" />
                      Trip Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-400">Current Status</p>
                      <p className="font-medium">
                        {selectedMember.currentTrip ? 'On Active Trip' : 'Available'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Yacht</p>
                      <p className="font-medium">{selectedMember.yachtName}</p>
                    </div>
                    {selectedMember.bookingId && (
                      <div>
                        <p className="text-sm text-gray-400">Booking ID</p>
                        <p className="font-medium">#{selectedMember.bookingId}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6">
                <Button
                  onClick={() => handleCallMember(selectedMember)}
                  disabled={callStatus !== 'idle'}
                  className="bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call {selectedMember.memberName}
                </Button>
              </div>
            </motion.div>
          </div>
        ) : (
          /* Default State - Dial Pad Interface */
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-4xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Dial Pad */}
                <div className="space-y-6">
                  <div className="text-center">
                    <Headphones className="h-16 w-16 mx-auto mb-4 text-blue-400" />
                    <h2 className="text-2xl font-semibold mb-2">Direct Dial</h2>
                    <p className="text-gray-400">Type a phone number to make an outbound call</p>
                  </div>

                  <Card className="bg-gray-900 border-gray-700">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="phone-input" className="text-sm text-gray-400">Phone Number</Label>
                          <Input
                            id="phone-input"
                            type="tel"
                            value={manualPhoneNumber}
                            onChange={(e) => setManualPhoneNumber(e.target.value)}
                            placeholder="+1 (555) 123-4567"
                            className="bg-gray-800 border-gray-600 text-lg text-center font-mono h-12"
                          />
                        </div>

                        {/* Dial Pad Grid */}
                        <div className="grid grid-cols-3 gap-3">
                          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
                            <Button
                              key={digit}
                              variant="outline"
                              className="h-12 text-lg font-semibold bg-gray-800 border-gray-600 hover:bg-gray-700"
                              onClick={() => setManualPhoneNumber(prev => prev + digit)}
                            >
                              {digit}
                            </Button>
                          ))}
                        </div>

                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            className="flex-1 bg-red-900 border-red-700 hover:bg-red-800"
                            onClick={() => setManualPhoneNumber('')}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 bg-yellow-900 border-yellow-700 hover:bg-yellow-800"
                            onClick={() => setManualPhoneNumber(prev => prev.slice(0, -1))}
                          >
                            ← Backspace
                          </Button>
                        </div>

                        <Button
                          className="w-full h-12 bg-green-600 hover:bg-green-700 text-lg font-semibold"
                          onClick={() => handleManualCall()}
                          disabled={!manualPhoneNumber || callStatus !== 'idle' || makeCallMutation.isPending}
                        >
                          <PhoneCall className="h-5 w-5 mr-2" />
                          {makeCallMutation.isPending ? 'Calling...' : 'Call Number'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Stats & Recent Activity */}
                <div className="space-y-6">
                  <div className="text-center">
                    <Users className="h-16 w-16 mx-auto mb-4 text-purple-400" />
                    <h2 className="text-2xl font-semibold mb-2">Service Overview</h2>
                    <p className="text-gray-400">Current member status and call activity</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <Card className="bg-gray-900 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Users className="h-8 w-8 text-blue-400" />
                            <div>
                              <p className="text-sm text-gray-400">Total Members</p>
                              <p className="text-xl font-semibold">{callableMembers.length}</p>
                            </div>
                          </div>
                          <Badge className="bg-blue-600">Available</Badge>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gray-900 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Ship className="h-8 w-8 text-red-400" />
                            <div>
                              <p className="text-sm text-gray-400">Emergency Contacts</p>
                              <p className="text-xl font-semibold">{emergencyMembers.length}</p>
                            </div>
                          </div>
                          <Badge className="bg-red-600">Active Trips</Badge>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gray-900 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Phone className="h-8 w-8 text-green-400" />
                            <div>
                              <p className="text-sm text-gray-400">Calls Today</p>
                              <p className="text-xl font-semibold">{callHistory.length}</p>
                            </div>
                          </div>
                          <Badge className="bg-green-600">Active</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Actions */}
                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-gray-800 border-gray-600"
                        onClick={() => setActiveTab('emergency')}
                      >
                        <AlertTriangle className="h-4 w-4 mr-2 text-red-400" />
                        View Emergency Contacts
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-gray-800 border-gray-600"
                        onClick={() => setActiveTab('members')}
                      >
                        <Users className="h-4 w-4 mr-2 text-blue-400" />
                        Browse All Members
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-gray-800 border-gray-600"
                        onClick={() => setActiveTab('active')}
                      >
                        <PhoneCall className="h-4 w-4 mr-2 text-green-400" />
                        View Active Calls
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}