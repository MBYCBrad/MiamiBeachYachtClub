import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { 
  Phone, 
  Search,
  PhoneCall,
  User,
  Clock,
  UserCheck,
  PhoneIncoming,
  PhoneOutgoing,
  Users,
  History,
  Calculator,
  Trash2,
  Volume2,
  PhoneMissed,
  Mail,
  MapPin,
  Calendar,
  MessageSquare,
  X,
  Info,
  Crown,
  Star,
  Anchor
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import type { PhoneCall as PhoneCallType, User as UserType } from "@shared/schema";

const keypadNumbers = [
  ['1', '2', '3'],
  ['4', '5', '6'], 
  ['7', '8', '9'],
  ['*', '0', '#']
];

interface CallSession {
  id: string;
  contact: UserType;
  startTime: Date;
  status: 'ringing' | 'connected' | 'on-hold';
  duration: number;
}

export default function CustomerServiceDashboard() {
  const [activeTab, setActiveTab] = useState<'contacts' | 'recents' | 'keypad'>('contacts');
  const [recentsSubTab, setRecentsSubTab] = useState<'all' | 'missed'>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [dialNumber, setDialNumber] = useState("");
  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
  const [selectedContact, setSelectedContact] = useState<UserType | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [callTimer, setCallTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch phone calls for recents
  const { data: phoneCalls = [], isLoading: callsLoading } = useQuery<PhoneCallType[]>({
    queryKey: ["/api/phone-calls"],
    staleTime: 30000,
    cacheTime: 300000
  });

  // Fetch all users for contacts
  const { data: users = [], isLoading: usersLoading } = useQuery<UserType[]>({
    queryKey: ["/api/admin/users"],
    staleTime: 60000,
    cacheTime: 300000
  });

  // Filter contacts based on search and exclude admin users
  const filteredContacts = users.filter(user => 
    user.role !== 'admin' &&
    (user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     user.membershipTier?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filter recent calls
  const filteredRecents = phoneCalls.filter(call => {
    const matchesSearch = call.memberName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         call.memberPhone?.includes(searchQuery);
    
    if (recentsSubTab === 'missed') {
      return matchesSearch && (call.status === 'missed' || call.status === 'no-answer');
    }
    return matchesSearch;
  });

  // Get contact call history
  const contactCallHistory = selectedContact ? phoneCalls.filter(call => 
    call.memberPhone === selectedContact.phone
  ) : [];

  // Call timer effect
  useEffect(() => {
    if (activeCall && activeCall.status === 'connected') {
      timerRef.current = setInterval(() => {
        setCallTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeCall]);

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const openContactModal = (contact: UserType) => {
    setSelectedContact(contact);
    setIsContactModalOpen(true);
  };

  const closeContactModal = () => {
    setSelectedContact(null);
    setIsContactModalOpen(false);
  };

  // Make call mutation
  const makeCallMutation = useMutation({
    mutationFn: async (data: { phoneNumber: string; memberName: string; memberId?: number }) => {
      const response = await fetch('/api/twilio/make-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phoneNumber: data.phoneNumber,
          memberName: data.memberName,
          memberId: data.memberId
        })
      });
      if (!response.ok) throw new Error('Failed to initiate call');
      return response.json();
    },
    onSuccess: (callData, variables) => {
      const contact = users.find(u => u.phone === variables.phoneNumber) || {
        id: 0,
        username: variables.memberName,
        phone: variables.phoneNumber,
        membershipTier: 'bronze'
      } as UserType;

      setActiveCall({
        id: callData.call_sid,
        contact,
        startTime: new Date(),
        status: 'ringing',
        duration: 0
      });
      
      setCallTimer(0);
      
      toast({
        title: "Call Initiated",
        description: `Calling ${variables.memberName}...`,
      });

      // Simulate call progression
      setTimeout(() => {
        setActiveCall(prev => prev ? { ...prev, status: 'connected' } : null);
        toast({
          title: "Call Connected",
          description: `Connected to ${variables.memberName}`,
        });
      }, 3000);

      // Refresh calls data
      queryClient.invalidateQueries({ queryKey: ["/api/phone-calls"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Call Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleKeypadPress = (key: string) => {
    if (key === '*' || key === '#') {
      setDialNumber(prev => prev + key);
    } else {
      setDialNumber(prev => prev + key);
    }
  };

  const clearDialNumber = () => {
    setDialNumber("");
  };

  const makeCall = (phoneNumber: string, memberName?: string, memberId?: number) => {
    if (!phoneNumber) {
      toast({
        title: "Invalid Number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    makeCallMutation.mutate({
      phoneNumber,
      memberName: memberName || phoneNumber,
      memberId
    });
  };

  const endCall = () => {
    if (activeCall) {
      // End call using Twilio API
      fetch(`/api/twilio/end-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          callSid: activeCall.id
        })
      }).catch(error => {
        console.error('Error ending call:', error);
      });

      toast({
        title: "Call Ended",
        description: `Call duration: ${formatCallDuration(callTimer)}`,
      });
    }

    setActiveCall(null);
    setCallTimer(0);
    queryClient.invalidateQueries({ queryKey: ["/api/phone-calls"] });
  };

  const getMembershipIcon = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'platinum': return <Crown className="h-4 w-4 text-purple-400" />;
      case 'gold': return <Star className="h-4 w-4 text-yellow-400" />;
      case 'silver': return <Anchor className="h-4 w-4 text-gray-400" />;
      default: return <User className="h-4 w-4 text-bronze-400" />;
    }
  };

  const getMembershipColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'platinum': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'gold': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'silver': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default: return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2"
          >
            Customer Service Center
          </motion.h1>
          <p className="text-gray-400">Premium yacht club member support system</p>
        </div>

        {/* Active Call Display */}
        <AnimatePresence>
          {activeCall && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-6"
            >
              <Card className="border-green-500/50 bg-green-500/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-green-400" />
                        </div>
                        {activeCall.status === 'connected' && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{activeCall.contact.username}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge className={getMembershipColor(activeCall.contact.membershipTier || 'bronze')}>
                            {getMembershipIcon(activeCall.contact.membershipTier || 'bronze')}
                            {activeCall.contact.membershipTier?.toUpperCase()}
                          </Badge>
                          <span className="text-gray-400 text-sm">{activeCall.contact.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-mono text-white mb-1">
                        {formatCallDuration(callTimer)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={activeCall.status === 'connected' ? 'default' : 'secondary'}>
                          {activeCall.status === 'ringing' && <Phone className="h-3 w-3 mr-1 animate-pulse" />}
                          {activeCall.status === 'connected' && <PhoneCall className="h-3 w-3 mr-1" />}
                          {activeCall.status.toUpperCase()}
                        </Badge>
                        <Button
                          onClick={endCall}
                          variant="destructive"
                          size="sm"
                          className="bg-red-500 hover:bg-red-600"
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          End Call
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Phone Interface */}
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Phone className="h-5 w-5 mr-2 text-purple-400" />
                Phone System
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Tab Navigation */}
              <div className="flex space-x-1 mb-6 bg-slate-900/50 p-1 rounded-lg">
                {[
                  { id: 'contacts', label: 'Contacts', icon: Users },
                  { id: 'recents', label: 'Recents', icon: History }, 
                  { id: 'keypad', label: 'Keypad', icon: Calculator }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`flex-1 flex items-center justify-center py-2 px-3 rounded-md transition-all ${
                      activeTab === id 
                        ? 'bg-purple-500 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              {activeTab !== 'keypad' && (
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={`Search ${activeTab}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-900/50 border-slate-600 text-white"
                  />
                </div>
              )}

              {/* Tab Content */}
              <div className="h-96 overflow-y-auto">
                {/* Contacts Tab */}
                {activeTab === 'contacts' && (
                  <div className="space-y-2">
                    {usersLoading ? (
                      <div className="text-center py-8 text-gray-400">Loading contacts...</div>
                    ) : filteredContacts.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">No contacts found</div>
                    ) : (
                      filteredContacts.map((contact) => (
                        <motion.div
                          key={contact.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg hover:bg-slate-700/50 transition-all cursor-pointer"
                          onClick={() => openContactModal(contact)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-purple-400" />
                            </div>
                            <div>
                              <h4 className="font-medium text-white">{contact.username}</h4>
                              <div className="flex items-center space-x-2">
                                <Badge className={getMembershipColor(contact.membershipTier || 'bronze')} variant="outline">
                                  {getMembershipIcon(contact.membershipTier || 'bronze')}
                                  {contact.membershipTier?.toUpperCase()}
                                </Badge>
                                {contact.phone && (
                                  <span className="text-xs text-gray-400">{contact.phone}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              makeCall(contact.phone || '', contact.username, contact.id);
                            }}
                            className="bg-green-500 hover:bg-green-600"
                            disabled={!contact.phone || makeCallMutation.isPending}
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}

                {/* Recents Tab */}
                {activeTab === 'recents' && (
                  <>
                    {/* Recents Sub-tabs */}
                    <div className="flex space-x-1 mb-4 bg-slate-900/50 p-1 rounded-lg">
                      <button
                        onClick={() => setRecentsSubTab('all')}
                        className={`flex-1 py-1 px-2 rounded text-sm transition-all ${
                          recentsSubTab === 'all' 
                            ? 'bg-slate-700 text-white' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        All Calls
                      </button>
                      <button
                        onClick={() => setRecentsSubTab('missed')}
                        className={`flex-1 py-1 px-2 rounded text-sm transition-all ${
                          recentsSubTab === 'missed' 
                            ? 'bg-slate-700 text-white' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Missed
                      </button>
                    </div>

                    <div className="space-y-2">
                      {callsLoading ? (
                        <div className="text-center py-8 text-gray-400">Loading call history...</div>
                      ) : filteredRecents.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">No recent calls</div>
                      ) : (
                        filteredRecents.map((call) => (
                          <motion.div
                            key={call.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg hover:bg-slate-700/50 transition-all"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="text-gray-400">
                                {call.direction === 'inbound' ? (
                                  call.status === 'missed' ? 
                                    <PhoneMissed className="h-5 w-5 text-red-400" /> :
                                    <PhoneIncoming className="h-5 w-5 text-green-400" />
                                ) : (
                                  <PhoneOutgoing className="h-5 w-5 text-blue-400" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium text-white">{call.memberName}</h4>
                                <div className="flex items-center space-x-2 text-xs text-gray-400">
                                  <span>{call.memberPhone}</span>
                                  <span>•</span>
                                  <span>{new Date(call.startTime).toLocaleDateString()}</span>
                                  {call.duration && (
                                    <>
                                      <span>•</span>
                                      <span>{formatCallDuration(call.duration)}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => makeCall(call.memberPhone, call.memberName)}
                              disabled={makeCallMutation.isPending}
                            >
                              <Phone className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </>
                )}

                {/* Keypad Tab */}
                {activeTab === 'keypad' && (
                  <div className="space-y-4">
                    {/* Display */}
                    <div className="bg-slate-900/50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-mono text-white min-h-[2rem] flex items-center justify-center">
                        {dialNumber || "Enter number"}
                      </div>
                    </div>

                    {/* Keypad */}
                    <div className="grid grid-cols-3 gap-3">
                      {keypadNumbers.flat().map((num) => (
                        <Button
                          key={num}
                          onClick={() => handleKeypadPress(num)}
                          className="h-12 text-xl font-bold bg-slate-700 hover:bg-slate-600 border-slate-600"
                          disabled={makeCallMutation.isPending}
                        >
                          {num}
                        </Button>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => makeCall(dialNumber)}
                        disabled={!dialNumber || makeCallMutation.isPending}
                        className="flex-1 bg-green-500 hover:bg-green-600"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                      <Button
                        onClick={clearDialNumber}
                        variant="outline"
                        className="border-slate-600 text-gray-300 hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="space-y-6">
            {/* Call Statistics */}
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Volume2 className="h-5 w-5 mr-2 text-blue-400" />
                  Call Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-slate-900/30 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">
                      {phoneCalls.filter(c => c.status === 'completed').length}
                    </div>
                    <div className="text-sm text-gray-400">Completed</div>
                  </div>
                  <div className="text-center p-4 bg-slate-900/30 rounded-lg">
                    <div className="text-2xl font-bold text-red-400">
                      {phoneCalls.filter(c => c.status === 'missed').length}
                    </div>
                    <div className="text-sm text-gray-400">Missed</div>
                  </div>
                  <div className="text-center p-4 bg-slate-900/30 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">
                      {phoneCalls.filter(c => c.direction === 'inbound').length}
                    </div>
                    <div className="text-sm text-gray-400">Inbound</div>
                  </div>
                  <div className="text-center p-4 bg-slate-900/30 rounded-lg">
                    <div className="text-2xl font-bold text-purple-400">
                      {phoneCalls.filter(c => c.direction === 'outbound').length}
                    </div>
                    <div className="text-sm text-gray-400">Outbound</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Member Tier Distribution */}
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <UserCheck className="h-5 w-5 mr-2 text-purple-400" />
                  Member Tiers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['platinum', 'gold', 'silver', 'bronze'].map((tier) => {
                    const count = filteredContacts.filter(c => c.membershipTier?.toLowerCase() === tier).length;
                    const percentage = filteredContacts.length > 0 ? (count / filteredContacts.length) * 100 : 0;
                    
                    return (
                      <div key={tier} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getMembershipIcon(tier)}
                          <span className="text-white capitalize">{tier}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${
                                tier === 'platinum' ? 'bg-purple-500' :
                                tier === 'gold' ? 'bg-yellow-500' :
                                tier === 'silver' ? 'bg-gray-500' : 'bg-orange-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-gray-300 text-sm min-w-[2rem]">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Details Modal */}
        <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-purple-400" />
                <span>Contact Details</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeContactModal}
                  className="ml-auto"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            
            {selectedContact && (
              <div className="space-y-6">
                {/* Contact Info */}
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{selectedContact.username}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getMembershipColor(selectedContact.membershipTier || 'bronze')}>
                        {getMembershipIcon(selectedContact.membershipTier || 'bronze')}
                        {selectedContact.membershipTier?.toUpperCase()} MEMBER
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                      {selectedContact.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{selectedContact.email}</span>
                        </div>
                      )}
                      {selectedContact.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{selectedContact.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>Joined {new Date(selectedContact.createdAt || '').toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Info className="h-4 w-4 text-gray-400" />
                        <span>ID: {selectedContact.id}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Call History */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <History className="h-4 w-4 mr-2 text-blue-400" />
                    Call History ({contactCallHistory.length})
                  </h4>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {contactCallHistory.length === 0 ? (
                      <p className="text-gray-400 text-sm">No call history</p>
                    ) : (
                      contactCallHistory.map((call) => (
                        <div key={call.id} className="flex items-center justify-between p-2 bg-slate-900/30 rounded">
                          <div className="flex items-center space-x-2">
                            {call.direction === 'inbound' ? (
                              <PhoneIncoming className="h-4 w-4 text-green-400" />
                            ) : (
                              <PhoneOutgoing className="h-4 w-4 text-blue-400" />
                            )}
                            <span className="text-sm">{new Date(call.startTime).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <Badge variant={call.status === 'completed' ? 'default' : 'secondary'}>
                              {call.status}
                            </Badge>
                            {call.duration && <span>{formatCallDuration(call.duration)}</span>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button
                    onClick={() => {
                      if (selectedContact.phone) {
                        makeCall(selectedContact.phone, selectedContact.username, selectedContact.id);
                        closeContactModal();
                      }
                    }}
                    disabled={!selectedContact.phone || makeCallMutation.isPending}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                  <Button variant="outline" className="border-slate-600">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}