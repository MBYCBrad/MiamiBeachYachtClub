import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { 
  Phone, 
  Search,
  PhoneCall,
  MessageSquare,
  User,
  Star,
  Clock,
  UserCheck,
  Mic,
  Info,
  PhoneIncoming,
  PhoneOutgoing,
  Users,
  History,
  Calculator,
  Trash2,
  Volume2
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
    if (call.status === 'missed') return <PhoneIncoming className="h-4 w-4 text-red-400" />;
    return <PhoneCall className="h-4 w-4 text-green-400" />;
  };

  const getCallTime = (call: PhoneCallType) => {
    const callDate = new Date(call.created_at);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - callDate.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return "9:22 AM";
    if (diffHours < 24) return "Yesterday";
    return callDate.toLocaleDateString();
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'member': return 'text-blue-400';
      case 'yacht_owner': return 'text-purple-400';
      case 'service_provider': return 'text-green-400';
      case 'admin': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col max-w-md mx-auto">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-6 py-2 text-sm font-medium">
        <span>9:30</span>
        <div className="flex items-center space-x-1">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
          </div>
          <div className="ml-2 flex items-center space-x-1">
            <div className="w-4 h-2 border border-white rounded-sm">
              <div className="w-full h-full bg-green-500 rounded-sm"></div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <span>100%</span>
          <div className="w-6 h-3 border border-white rounded-sm">
            <div className="w-full h-full bg-green-500 rounded-sm"></div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" className="text-blue-400 p-0 hover:bg-transparent">
          ← Lists
        </Button>
        <h1 className="text-lg font-semibold">
          {activeTab === 'contacts' && 'Contacts'}
          {activeTab === 'recents' && 'Recents'}
          {activeTab === 'keypad' && 'Keypad'}
        </h1>
        {activeTab === 'contacts' && (
          <Button variant="ghost" size="sm" className="text-blue-400 p-0 hover:bg-transparent">
            +
          </Button>
        )}
        {activeTab === 'recents' && (
          <Button variant="ghost" size="sm" className="text-blue-400 p-0 hover:bg-transparent">
            Edit
          </Button>
        )}
        {activeTab === 'keypad' && <div className="w-8"></div>}
      </div>

      {/* Content Area */}
      <div className="flex-1 px-6 pb-6">
        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 bg-gray-800/30 border-0 rounded-xl text-white placeholder-gray-400 h-12 focus:ring-0 focus:outline-none"
              />
              <Mic className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>

            {/* User Profile Card */}
            <Card className="bg-gray-800/30 border-0 rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">CS</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Customer Service</h3>
                    <p className="text-sm text-gray-400">My Card</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alphabet Index */}
            <div className="fixed right-2 top-1/2 transform -translate-y-1/2 z-10">
              <div className="flex flex-col space-y-1 text-xs font-semibold text-blue-400">
                {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '#'].map(letter => (
                  <div key={letter} className="text-center">{letter}</div>
                ))}
              </div>
            </div>

            {/* Contacts List */}
            <div className="space-y-1">
              {/* Section Headers */}
              <div className="text-2xl font-bold text-gray-300 mb-3">A</div>
              
              {usersLoading ? (
                <div className="text-center text-gray-400 py-8">Loading contacts...</div>
              ) : (
                filteredContacts.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="py-3 border-b border-gray-800/50 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-white">
                            {user.username?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{user.username}</h3>
                          <p className={`text-sm capitalize ${getRoleColor(user.role || '')}`}>
                            {user.role?.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-400 hover:bg-transparent p-1"
                        onClick={() => makeCallMutation.mutate('+1-555-' + String(user.id).padStart(4, '0'))}
                        disabled={makeCallMutation.isPending}
                      >
                        <Info className="h-5 w-5" />
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Recents Tab */}
        {activeTab === 'recents' && (
          <div className="space-y-6">
            {/* Sub-tabs */}
            <div className="flex space-x-1 bg-gray-800/30 rounded-xl p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRecentsSubTab('all')}
                className={`flex-1 rounded-lg h-8 text-sm font-medium ${
                  recentsSubTab === 'all' 
                    ? 'bg-white text-black hover:bg-white/90' 
                    : 'text-gray-400 hover:bg-transparent hover:text-white'
                }`}
              >
                All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRecentsSubTab('missed')}
                className={`flex-1 rounded-lg h-8 text-sm font-medium ${
                  recentsSubTab === 'missed' 
                    ? 'bg-gray-600 text-white hover:bg-gray-600/90' 
                    : 'text-gray-400 hover:bg-transparent hover:text-white'
                }`}
              >
                Missed
              </Button>
            </div>

            {/* Recent Calls List */}
            <div className="space-y-4">
              {callsLoading ? (
                <div className="text-center text-gray-400 py-8">Loading recents...</div>
              ) : filteredRecents.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  {recentsSubTab === 'missed' ? 'No missed calls' : 'No recent calls'}
                </div>
              ) : (
                filteredRecents.map((call) => (
                  <motion.div
                    key={call.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-white">
                          {call.caller_name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className={`font-medium ${call.status === 'missed' ? 'text-red-400' : 'text-white'}`}>
                            {call.caller_name || 'Unknown'}
                          </h3>
                          {call.status === 'missed' && <span className="text-yellow-400 text-xs font-bold">+</span>}
                        </div>
                        <div className="flex items-center space-x-1">
                          {getCallTypeIcon(call)}
                          <p className="text-sm text-gray-400">phone</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">{getCallTime(call)}</span>
                      <Button variant="ghost" size="sm" className="text-blue-400 p-1 hover:bg-transparent">
                        <Info className="h-5 w-5" />
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Keypad Tab */}
        {activeTab === 'keypad' && (
          <div className="flex flex-col items-center space-y-8 py-8">
            {/* Display */}
            <div className="text-center min-h-[60px] flex items-center">
              <span className="text-3xl font-light">
                {dialNumber ? formatPhoneNumber(dialNumber) : ''}
              </span>
            </div>

            {/* Keypad Grid */}
            <div className="grid grid-cols-3 gap-6 w-full max-w-xs">
              {/* Row 1 */}
              <Button
                variant="ghost"
                size="lg"
                onClick={() => handleKeypadPress('1')}
                className="w-20 h-20 rounded-full bg-gray-700 hover:bg-gray-600 text-3xl font-light text-white hover:text-white"
              >
                1
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => handleKeypadPress('2')}
                className="w-20 h-20 rounded-full bg-gray-700 hover:bg-gray-600 text-white hover:text-white flex flex-col items-center justify-center"
              >
                <span className="text-3xl font-light">2</span>
                <span className="text-xs font-normal">ABC</span>
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => handleKeypadPress('3')}
                className="w-20 h-20 rounded-full bg-gray-700 hover:bg-gray-600 text-white hover:text-white flex flex-col items-center justify-center"
              >
                <span className="text-3xl font-light">3</span>
                <span className="text-xs font-normal">DEF</span>
              </Button>

              {/* Row 2 */}
              <Button
                variant="ghost"
                size="lg"
                onClick={() => handleKeypadPress('4')}
                className="w-20 h-20 rounded-full bg-gray-700 hover:bg-gray-600 text-white hover:text-white flex flex-col items-center justify-center"
              >
                <span className="text-3xl font-light">4</span>
                <span className="text-xs font-normal">GHI</span>
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => handleKeypadPress('5')}
                className="w-20 h-20 rounded-full bg-gray-700 hover:bg-gray-600 text-white hover:text-white flex flex-col items-center justify-center"
              >
                <span className="text-3xl font-light">5</span>
                <span className="text-xs font-normal">JKL</span>
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => handleKeypadPress('6')}
                className="w-20 h-20 rounded-full bg-gray-700 hover:bg-gray-600 text-white hover:text-white flex flex-col items-center justify-center"
              >
                <span className="text-3xl font-light">6</span>
                <span className="text-xs font-normal">MNO</span>
              </Button>

              {/* Row 3 */}
              <Button
                variant="ghost"
                size="lg"
                onClick={() => handleKeypadPress('7')}
                className="w-20 h-20 rounded-full bg-gray-700 hover:bg-gray-600 text-white hover:text-white flex flex-col items-center justify-center"
              >
                <span className="text-3xl font-light">7</span>
                <span className="text-xs font-normal">PQRS</span>
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => handleKeypadPress('8')}
                className="w-20 h-20 rounded-full bg-gray-700 hover:bg-gray-600 text-white hover:text-white flex flex-col items-center justify-center"
              >
                <span className="text-3xl font-light">8</span>
                <span className="text-xs font-normal">TUV</span>
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => handleKeypadPress('9')}
                className="w-20 h-20 rounded-full bg-gray-700 hover:bg-gray-600 text-white hover:text-white flex flex-col items-center justify-center"
              >
                <span className="text-3xl font-light">9</span>
                <span className="text-xs font-normal">WXYZ</span>
              </Button>

              {/* Row 4 */}
              <Button
                variant="ghost"
                size="lg"
                onClick={() => handleKeypadPress('*')}
                className="w-20 h-20 rounded-full bg-gray-700 hover:bg-gray-600 text-3xl font-light text-white hover:text-white"
              >
                *
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => handleKeypadPress('0')}
                className="w-20 h-20 rounded-full bg-gray-700 hover:bg-gray-600 text-white hover:text-white flex flex-col items-center justify-center"
              >
                <span className="text-3xl font-light">0</span>
                <span className="text-xs font-normal">+</span>
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => handleKeypadPress('#')}
                className="w-20 h-20 rounded-full bg-gray-700 hover:bg-gray-600 text-3xl font-light text-white hover:text-white"
              >
                #
              </Button>
            </div>

            {/* Call and Delete Buttons */}
            <div className="flex flex-col items-center space-y-4">
              {dialNumber && (
                <>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Button
                      onClick={() => makeCallMutation.mutate(dialNumber)}
                      disabled={makeCallMutation.isPending}
                      className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white border-0"
                    >
                      <Phone className="h-6 w-6" />
                    </Button>
                  </motion.div>
                  <Button
                    variant="ghost"
                    onClick={handleKeypadDelete}
                    className="text-gray-400 hover:text-white hover:bg-transparent text-lg"
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Tab Bar */}
      <div className="border-t border-gray-800/50 bg-black/95 backdrop-blur">
        <div className="flex justify-around py-3">
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center space-y-1 text-gray-500 hover:bg-transparent hover:text-gray-300"
          >
            <Star className="h-5 w-5" />
            <span className="text-xs">Favorites</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('recents')}
            className={`flex flex-col items-center space-y-1 hover:bg-transparent ${
              activeTab === 'recents' ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Clock className="h-5 w-5" />
            <span className="text-xs">Recents</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('contacts')}
            className={`flex flex-col items-center space-y-1 hover:bg-transparent ${
              activeTab === 'contacts' ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <UserCheck className="h-5 w-5" />
            <span className="text-xs">Contacts</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('keypad')}
            className={`flex flex-col items-center space-y-1 hover:bg-transparent ${
              activeTab === 'keypad' ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <div className="grid grid-cols-3 gap-0.5 w-5 h-5">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="w-1 h-1 bg-current rounded-full"></div>
              ))}
            </div>
            <span className="text-xs">Keypad</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center space-y-1 text-gray-500 hover:bg-transparent hover:text-gray-300"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs">Voicemail</span>
          </Button>
        </div>
        
        {/* Home Indicator */}
        <div className="flex justify-center pb-2">
          <div className="w-32 h-1 bg-gray-600 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}