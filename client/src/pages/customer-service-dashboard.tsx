import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
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
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import type { PhoneCall as PhoneCallType, User as UserType } from "@shared/schema";

export default function CustomerServiceDashboard() {
  const [activeTab, setActiveTab] = useState<'contacts' | 'recents' | 'keypad'>('contacts');
  const [recentsSubTab, setRecentsSubTab] = useState<'all' | 'missed'>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [dialNumber, setDialNumber] = useState("");
  const [isCallActive, setIsCallActive] = useState(false);
  const [selectedContact, setSelectedContact] = useState<UserType | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch phone calls for recents
  const { data: phoneCalls = [], isLoading: callsLoading } = useQuery<PhoneCallType[]>({
    queryKey: ["/api/phone-calls"],
  });

  // Fetch all users for contacts
  const { data: users = [], isLoading: usersLoading } = useQuery<UserType[]>({
    queryKey: ["/api/admin/users"],
  });

  // Filter contacts based on search
  const filteredContacts = users.filter(user => 
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter recent calls
  const filteredRecents = phoneCalls.filter(call => {
    const matchesSearch = call.caller_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         call.phone_number?.includes(searchQuery);
    
    if (recentsSubTab === 'missed') {
      return matchesSearch && call.status === 'missed';
    }
    return matchesSearch;
  });

  // Get contact call history
  const contactCallHistory = selectedContact ? phoneCalls.filter(call => 
    call.phone_number === selectedContact.phone
  ) : [];

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
    mutationFn: async (phoneNumber: string) => {
      const response = await fetch('/api/phone-calls/outbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone_number: phoneNumber,
          caller_name: 'Customer Service',
          reason: 'Outbound customer service call'
        })
      });
      if (!response.ok) throw new Error('Failed to make call');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/phone-calls"] });
      setDialNumber("");
      setIsCallActive(true);
      toast({
        title: "Call Connected",
        description: `Calling ${formatPhoneNumber(dialNumber)}...`,
      });
      // Auto-end call after 30 seconds for demo
      setTimeout(() => setIsCallActive(false), 30000);
    },
    onError: (error: Error) => {
      toast({
        title: "Call Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleKeypadPress = (digit: string) => {
    if (dialNumber.length < 15) {
      setDialNumber(prev => prev + digit);
    }
  };

  const handleKeypadDelete = () => {
    setDialNumber(prev => prev.slice(0, -1));
  };

  const formatPhoneNumber = (number: string) => {
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
    return number;
  };

  const getCallTypeIcon = (call: PhoneCallType) => {
    if (call.status === 'missed') return <PhoneMissed className="h-4 w-4 text-red-400" />;
    if (call.direction === 'inbound') return <PhoneIncoming className="h-4 w-4 text-green-400" />;
    return <PhoneOutgoing className="h-4 w-4 text-blue-400" />;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-400';
      case 'yacht_owner': return 'text-blue-400';
      case 'service_provider': return 'text-purple-400';
      case 'member': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const keypadButtons = [
    [{ digit: '1', letters: '' }, { digit: '2', letters: 'ABC' }, { digit: '3', letters: 'DEF' }],
    [{ digit: '4', letters: 'GHI' }, { digit: '5', letters: 'JKL' }, { digit: '6', letters: 'MNO' }],
    [{ digit: '7', letters: 'PQRS' }, { digit: '8', letters: 'TUV' }, { digit: '9', letters: 'WXYZ' }],
    [{ digit: '*', letters: '' }, { digit: '0', letters: '+' }, { digit: '#', letters: '' }]
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Customer Service Dashboard</h1>
              <p className="text-gray-400">Manage customer calls and communications</p>
            </div>
            {isCallActive && (
              <motion.div 
                className="flex items-center gap-3 bg-green-500/20 border border-green-500/30 rounded-lg px-4 py-2"
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Volume2 className="h-5 w-5 text-green-400" />
                <span className="text-green-400 font-medium">Call Active</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Main Interface Card */}
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Phone className="h-6 w-6 text-blue-400" />
              Communication Center
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {/* Tab Navigation */}
            <div className="flex space-x-2 mb-8 bg-gray-700/30 rounded-xl p-2">
              {[
                { key: 'contacts', label: 'Contacts', icon: Users, count: filteredContacts.length },
                { key: 'recents', label: 'Recent Calls', icon: History, count: filteredRecents.length },
                { key: 'keypad', label: 'Dial Pad', icon: Calculator, count: null }
              ].map(({ key, label, icon: Icon, count }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex-1 py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-3 relative ${
                    activeTab === key 
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-600/50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{label}</span>
                  {count !== null && (
                    <Badge variant="secondary" className="ml-2 bg-white/10 text-white">
                      {count}
                    </Badge>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Contacts Tab */}
                {activeTab === 'contacts' && (
                  <div className="space-y-6">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search contacts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
                      />
                    </div>

                    {/* Contact List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                      {usersLoading ? (
                        <div className="col-span-full text-center py-8 text-gray-400">Loading contacts...</div>
                      ) : filteredContacts.length === 0 ? (
                        <div className="col-span-full text-center py-8 text-gray-400">No contacts found</div>
                      ) : (
                        filteredContacts.map((user) => (
                          <Card 
                            key={user.id} 
                            className="bg-gray-700/30 border-gray-600 hover:bg-gray-700/50 transition-colors cursor-pointer"
                            onClick={() => openContactModal(user)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                    {user.username?.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-white font-medium">{user.username}</p>
                                    <p className={`text-sm capitalize ${getRoleColor(user.role || '')}`}>
                                      {user.role?.replace('_', ' ')}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    user.phone && makeCallMutation.mutate(user.phone);
                                  }}
                                  disabled={!user.phone || makeCallMutation.isPending}
                                  className="bg-green-500 hover:bg-green-600"
                                >
                                  <Phone className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Recents Tab */}
                {activeTab === 'recents' && (
                  <div className="space-y-6">
                    {/* Sub-tabs */}
                    <div className="flex space-x-2">
                      {[
                        { key: 'all', label: 'All Calls' },
                        { key: 'missed', label: 'Missed Calls' }
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => setRecentsSubTab(key as any)}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            recentsSubTab === key 
                              ? 'bg-blue-500 text-white' 
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search call history..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
                      />
                    </div>

                    {/* Call History */}
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {callsLoading ? (
                        <div className="text-center py-8 text-gray-400">Loading call history...</div>
                      ) : filteredRecents.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">No calls found</div>
                      ) : (
                        filteredRecents.map((call) => (
                          <Card key={call.id} className="bg-gray-700/30 border-gray-600">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  {getCallTypeIcon(call)}
                                  <div>
                                    <p className="text-white font-medium">{call.caller_name || 'Unknown'}</p>
                                    <p className="text-gray-400 text-sm">{formatPhoneNumber(call.phone_number || '')}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-gray-400 text-sm">
                                    {call.created_at ? new Date(call.created_at).toLocaleTimeString() : ''}
                                  </p>
                                  <Badge 
                                    variant={call.status === 'missed' ? 'destructive' : 'secondary'}
                                    className="mt-1"
                                  >
                                    {call.status}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Keypad Tab */}
                {activeTab === 'keypad' && (
                  <div className="max-w-md mx-auto space-y-8">
                    {/* Display */}
                    <div className="text-center">
                      <div className="bg-gray-700/50 rounded-lg p-6 mb-4">
                        <p className="text-2xl font-mono text-white mb-2">
                          {dialNumber || "Enter number"}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {dialNumber ? formatPhoneNumber(dialNumber) : "Use keypad to dial"}
                        </p>
                      </div>
                    </div>

                    {/* Keypad */}
                    <div className="grid grid-cols-3 gap-4">
                      {keypadButtons.flat().map(({ digit, letters }) => (
                        <Button
                          key={digit}
                          onClick={() => handleKeypadPress(digit)}
                          className="h-16 bg-gray-700/50 hover:bg-gray-600 border border-gray-600 text-white text-xl font-semibold flex flex-col items-center justify-center"
                        >
                          <span>{digit}</span>
                          {letters && <span className="text-xs text-gray-400">{letters}</span>}
                        </Button>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center space-x-4">
                      <Button
                        onClick={handleKeypadDelete}
                        disabled={!dialNumber}
                        variant="outline"
                        className="border-gray-600 text-gray-400 hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        onClick={() => makeCallMutation.mutate(dialNumber)}
                        disabled={!dialNumber || makeCallMutation.isPending}
                        className="bg-green-500 hover:bg-green-600 px-8"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Contact Detail Modal */}
        <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
          <DialogContent className="max-w-2xl bg-gray-900 border-gray-700 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                    {selectedContact?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <DialogTitle className="text-white text-xl">
                      {selectedContact?.username}
                    </DialogTitle>
                    <p className={`text-sm capitalize ${getRoleColor(selectedContact?.role || '')}`}>
                      {selectedContact?.role?.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={closeContactModal}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>

            {selectedContact && (
              <div className="space-y-6 mt-6">
                {/* Contact Information */}
                <Card className="bg-gray-700/30 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Info className="h-5 w-5 text-blue-400" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-gray-400 text-sm">Username</p>
                          <p className="text-white">{selectedContact.username}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-gray-400 text-sm">Phone</p>
                          <p className="text-white">{selectedContact.phone || 'Not provided'}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-gray-400 text-sm">Email</p>
                          <p className="text-white">{selectedContact.email || 'Not provided'}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-gray-400 text-sm">Location</p>
                          <p className="text-white">{selectedContact.location || 'Not provided'}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-gray-400 text-sm">Member Since</p>
                          <p className="text-white">
                            {selectedContact.createdAt 
                              ? new Date(selectedContact.createdAt).toLocaleDateString()
                              : 'Unknown'
                            }
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <UserCheck className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-gray-400 text-sm">Membership Tier</p>
                          <p className="text-white capitalize">
                            {selectedContact.membershipTier || 'Not specified'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Call History */}
                <Card className="bg-gray-700/30 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <History className="h-5 w-5 text-blue-400" />
                      Call History
                      <Badge variant="secondary" className="ml-2 bg-white/10 text-white">
                        {contactCallHistory.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {contactCallHistory.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        No call history found
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {contactCallHistory.map((call) => (
                          <div 
                            key={call.id} 
                            className="flex items-center justify-between p-3 bg-gray-600/30 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              {getCallTypeIcon(call)}
                              <div>
                                <p className="text-white text-sm">
                                  {call.direction === 'inbound' ? 'Incoming' : 'Outgoing'} Call
                                </p>
                                <p className="text-gray-400 text-xs">
                                  {call.created_at 
                                    ? new Date(call.created_at).toLocaleString()
                                    : 'Unknown time'
                                  }
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-gray-400 text-xs">Duration</p>
                              <p className="text-white text-sm">
                                {call.duration ? `${call.duration}s` : 'Unknown'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-gray-700/30 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={() => {
                          if (selectedContact.phone) {
                            makeCallMutation.mutate(selectedContact.phone);
                          }
                        }}
                        disabled={!selectedContact.phone || makeCallMutation.isPending}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call Now
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-600"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-600"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (selectedContact.phone) {
                            setDialNumber(selectedContact.phone);
                            setActiveTab('keypad');
                            closeContactModal();
                          }
                        }}
                        className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-600"
                      >
                        <Calculator className="h-4 w-4 mr-2" />
                        Add to Dialpad
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Notes */}
                <Card className="bg-gray-700/30 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white">Notes & Comments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-600/30 rounded-lg">
                        <p className="text-gray-400 text-sm">Last interaction</p>
                        <p className="text-white">
                          {contactCallHistory.length > 0 
                            ? `Last call: ${new Date(contactCallHistory[0].created_at!).toLocaleDateString()}`
                            : 'No previous interactions'
                          }
                        </p>
                      </div>
                      
                      <div className="p-3 bg-gray-600/30 rounded-lg">
                        <p className="text-gray-400 text-sm">Total calls</p>
                        <p className="text-white">{contactCallHistory.length} calls</p>
                      </div>
                      
                      {selectedContact.role === 'member' && (
                        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                          <p className="text-blue-400 text-sm">Member Status</p>
                          <p className="text-white">Active MBYC Member</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}