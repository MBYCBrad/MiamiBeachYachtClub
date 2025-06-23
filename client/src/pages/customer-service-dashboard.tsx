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
  PhoneMissed,
  Anchor,
  MapPin,
  Shield,
  Headphones,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CustomerServiceDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [activeTab, setActiveTab] = useState<'members' | 'active' | 'emergency' | 'all'>('members');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [callStatus, setCallStatus] = useState<'idle' | 'ringing' | 'connected' | 'ended'>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(75);
  const [notes, setNotes] = useState("");
  const [manualPhoneNumber, setManualPhoneNumber] = useState("");
  const [isDialing, setIsDialing] = useState(false);
  const [callHistory, setCallHistory] = useState<any[]>([]);
  const [activeCall, setActiveCall] = useState<any>(null);

  // Refs for call timer
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch live members from database
  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/users');
      return response.json();
    }
  });

  // Fetch active bookings for trip context
  const { data: activeBookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['/api/admin/bookings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/bookings');
      return response.json();
    }
  });

  // Filter members with phone numbers for calling
  const callableMembers = members.filter((member: any) => 
    member.phone && member.role === 'member'
  ).map((member: any) => {
    const activeBooking = activeBookings.find((booking: any) => 
      booking.member?.name === member.username
    );
    
    return {
      id: member.id,
      memberName: member.username,
      membershipTier: member.membershipTier || 'bronze',
      phoneNumber: member.phone,
      email: member.email,
      priority: activeBooking ? 'high' : 'medium',
      reason: activeBooking ? `Active Trip - ${activeBooking.yacht?.name}` : 'Available for contact',
      yachtName: activeBooking?.yacht?.name || 'No active booking',
      location: activeBooking?.yacht?.location || member.location || 'Unknown',
      status: 'available',
      avatar: `/api/placeholder/32/32`,
      lastContact: member.updatedAt || member.createdAt,
      currentTrip: !!activeBooking,
      tripStatus: activeBooking ? 'active' : 'none',
      bookingId: activeBooking?.id
    };
  });

  // Emergency members (those currently on trips)
  const emergencyMembers = callableMembers.filter(member => member.currentTrip);

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
        setCallDuration(0);
        setActiveCall(null);
        setNotes("");
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to end call properly",
        variant: "destructive",
      });
    }
  });

  // Handle making calls to members
  const handleCallMember = (member: any) => {
    if (callStatus !== 'idle') return;
    
    setSelectedMember(member);
    makeCallMutation.mutate({
      phoneNumber: member.phoneNumber,
      memberName: member.memberName,
      memberId: member.id
    });
  };

  // Handle manual phone dialing
  const handleManualCall = () => {
    if (!manualPhoneNumber.trim() || callStatus !== 'idle') return;
    
    makeCallMutation.mutate({
      phoneNumber: manualPhoneNumber,
      memberName: "Manual Dial"
    });
  };

  // Handle ending calls
  const handleEndCall = () => {
    if (activeCall?.callSid) {
      endCallMutation.mutate(activeCall.callSid);
    }
  };

  // Simulate call status changes (in production, this would come from Twilio webhooks)
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
  const filteredMembers = callableMembers.filter(member => {
    const matchesSearch = member.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.phoneNumber.includes(searchTerm) ||
                         member.yachtName.toLowerCase().includes(searchTerm.toLowerCase());
    
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
    switch (tier) {
      case 'platinum': return 'bg-purple-500';
      case 'gold': return 'bg-yellow-500';
      case 'silver': return 'bg-gray-400';
      case 'bronze': return 'bg-orange-600';
      default: return 'bg-blue-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar - Member List */}
      <div className="w-80 border-r border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Headphones className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Customer Service</h1>
              <p className="text-sm text-gray-400">Live Phone Support</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-900 border-gray-700"
            />
          </div>

          {/* Manual Dial */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter phone number"
              value={manualPhoneNumber}
              onChange={(e) => setManualPhoneNumber(e.target.value)}
              className="bg-gray-900 border-gray-700"
            />
            <Button 
              onClick={handleManualCall}
              disabled={!manualPhoneNumber.trim() || callStatus !== 'idle'}
              className="px-3"
            >
              <Phone className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900 m-4">
            <TabsTrigger value="members">All Members</TabsTrigger>
            <TabsTrigger value="emergency" className="text-red-400">Emergency</TabsTrigger>
            <TabsTrigger value="active">Active Calls</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="flex-1 px-4">
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {filteredMembers.map((member) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
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
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getTierColor(member.membershipTier)} text-white text-xs`}>
                          {member.membershipTier}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCallMember(member);
                          }}
                          disabled={callStatus !== 'idle'}
                          className="p-2 h-8 w-8"
                        >
                          <Phone className="h-3 w-3" />
                        </Button>
                      </div>
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

      {/* Main Content - Call Interface */}
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
              <p className="text-gray-400 mb-1">{activeCall.phoneNumber}</p>
              
              <div className="text-3xl font-mono text-blue-400 mb-2">
                {formatDuration(callDuration)}
              </div>
              
              <Badge 
                className={callStatus === 'connected' ? 'bg-green-600' : 'bg-yellow-600'}
              >
                {callStatus === 'ringing' ? 'Connecting...' : 'Connected'}
              </Badge>

              {/* Call Controls */}
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant={isMuted ? "destructive" : "outline"}
                  size="lg"
                  onClick={() => setIsMuted(!isMuted)}
                  className="rounded-full p-4"
                >
                  {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </Button>
                
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={handleEndCall}
                  className="rounded-full p-6 bg-red-600 hover:bg-red-700"
                >
                  <Phone className="h-8 w-8 rotate-[135deg]" />
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full p-4"
                >
                  <Volume2 className="h-6 w-6" />
                </Button>
              </div>
            </motion.div>

            {/* Call Notes */}
            <div className="w-full max-w-md mt-8">
              <Textarea
                placeholder="Add call notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-gray-900 border-gray-700"
                rows={3}
              />
            </div>
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