import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Phone, 
  PhoneCall, 
  Search, 
  Grid3X3, 
  Clock, 
  Users, 
  MessageSquare, 
  Voicemail,
  Star,
  Battery,
  Wifi,
  Signal
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface User {
  id: number;
  username: string;
  fullName: string | null;
  role: string;
  phone: string | null;
  email: string | null;
  membershipTier?: string | null;
}

interface CallRecord {
  id: string;
  memberName: string;
  memberPhone: string;
  callType: string;
  direction: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: string;
  reason: string;
}

export default function CustomerServiceFixed() {
  // All hooks must be at the top level
  const [activeTab, setActiveTab] = useState<'favorites' | 'recents' | 'contacts' | 'keypad' | 'voicemail'>('contacts');
  const [contactsSubTab, setContactsSubTab] = useState<'all' | 'members' | 'staff'>('all');
  const [recentsSubTab, setRecentsSubTab] = useState<'all' | 'missed'>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [dialNumber, setDialNumber] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute for status bar
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Data fetching hooks
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/staff/users'],
    enabled: activeTab === 'contacts'
  });

  const { data: callHistory = [], isLoading: callsLoading } = useQuery<CallRecord[]>({
    queryKey: ['/api/staff/call-history'],
    enabled: activeTab === 'recents'
  });

  // Filter functions
  const getFilteredUsers = () => {
    if (!users) return [];
    
    let filtered = users;
    
    // Apply role filter
    if (contactsSubTab === 'members') {
      filtered = filtered.filter(user => ['Member', 'Yacht Owner', 'Service Provider'].includes(user.role));
    } else if (contactsSubTab === 'staff') {
      filtered = filtered.filter(user => user.role.startsWith('Staff'));
    }
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone?.includes(searchQuery)
      );
    }
    
    return filtered;
  };

  const getFilteredCalls = () => {
    if (!callHistory) return [];
    
    let filtered = callHistory;
    
    if (recentsSubTab === 'missed') {
      filtered = filtered.filter(call => call.status === 'missed');
    }
    
    if (searchQuery) {
      filtered = filtered.filter(call =>
        call.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        call.memberPhone.includes(searchQuery)
      );
    }
    
    return filtered;
  };

  const getRoleColor = (role: string) => {
    if (role === 'Member') return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (role === 'Yacht Owner') return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    if (role === 'Service Provider') return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (role.startsWith('Staff')) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleKeypadPress = (digit: string) => {
    if (dialNumber.length < 15) {
      setDialNumber(prev => prev + digit);
    }
  };

  const handleCall = () => {
    if (dialNumber) {
      console.log('Initiating call to:', dialNumber);
      // Here you would integrate with Twilio or other calling service
    }
  };

  const clearDialNumber = () => {
    setDialNumber(prev => prev.slice(0, -1));
  };

  const keypadNumbers = [
    [{ number: '1', letters: '' }, { number: '2', letters: 'ABC' }, { number: '3', letters: 'DEF' }],
    [{ number: '4', letters: 'GHI' }, { number: '5', letters: 'JKL' }, { number: '6', letters: 'MNO' }],
    [{ number: '7', letters: 'PQRS' }, { number: '8', letters: 'TUV' }, { number: '9', letters: 'WXYZ' }],
    [{ number: '*', letters: '' }, { number: '0', letters: '+' }, { number: '#', letters: '' }]
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* iPhone Status Bar */}
      <div className="flex justify-between items-center px-4 py-2 text-sm font-medium bg-black">
        <div className="flex items-center space-x-1">
          <span>{currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Signal className="w-4 h-4" />
          <Wifi className="w-4 h-4" />
          <Battery className="w-4 h-4" />
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-md mx-auto bg-black min-h-screen">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-center">Phone</h1>
        </div>

        {/* Search Bar (for contacts and recents) */}
        {(activeTab === 'contacts' || activeTab === 'recents') && (
          <div className="p-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder={activeTab === 'contacts' ? "Search contacts" : "Search call history"}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-400"
              />
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="flex-1 pb-20">
          {/* Contacts Tab */}
          {activeTab === 'contacts' && (
            <div>
              {/* Sub-tabs */}
              <div className="flex border-b border-gray-800">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'members', label: 'Members' },
                  { key: 'staff', label: 'Staff' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setContactsSubTab(tab.key as any)}
                    className={cn(
                      "flex-1 py-3 text-sm font-medium border-b-2 transition-colors",
                      contactsSubTab === tab.key
                        ? "border-blue-500 text-blue-400"
                        : "border-transparent text-gray-400 hover:text-gray-300"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Contacts List */}
              <div className="divide-y divide-gray-800">
                {usersLoading ? (
                  <div className="p-8 text-center text-gray-400">Loading contacts...</div>
                ) : getFilteredUsers().length === 0 ? (
                  <div className="p-8 text-center text-gray-400">No contacts found</div>
                ) : (
                  getFilteredUsers().map((user) => (
                    <div key={user.id} className="p-4 hover:bg-gray-900 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-white">
                              {user.fullName || user.username}
                            </h3>
                            <Badge className={cn("text-xs", getRoleColor(user.role))}>
                              {user.role}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400 mt-1">
                            {user.phone || 'No phone number'}
                          </p>
                          {user.email && (
                            <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                          )}
                        </div>
                        {user.phone && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-400 hover:text-blue-300"
                            onClick={() => console.log('Call', user.phone)}
                          >
                            <Phone className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Recents Tab */}
          {activeTab === 'recents' && (
            <div>
              {/* Sub-tabs */}
              <div className="flex border-b border-gray-800">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'missed', label: 'Missed' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setRecentsSubTab(tab.key as any)}
                    className={cn(
                      "flex-1 py-3 text-sm font-medium border-b-2 transition-colors",
                      recentsSubTab === tab.key
                        ? "border-red-500 text-red-400"
                        : "border-transparent text-gray-400 hover:text-gray-300"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Call History */}
              <div className="divide-y divide-gray-800">
                {callsLoading ? (
                  <div className="p-8 text-center text-gray-400">Loading call history...</div>
                ) : getFilteredCalls().length === 0 ? (
                  <div className="p-8 text-center text-gray-400">No calls found</div>
                ) : (
                  getFilteredCalls().map((call) => (
                    <div key={call.id} className="p-4 hover:bg-gray-900 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-white">{call.memberName}</h3>
                            {call.status === 'missed' && (
                              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                                Missed
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mt-1">
                            {call.memberPhone} • {call.reason}
                          </p>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                            <span>{formatTime(new Date(call.startTime))}</span>
                            <span>{formatDuration(call.duration)}</span>
                            <span className="capitalize">{call.direction}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-400 hover:text-blue-300"
                          onClick={() => console.log('Call back', call.memberPhone)}
                        >
                          <PhoneCall className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Keypad Tab */}
          {activeTab === 'keypad' && (
            <div className="p-6">
              {/* Display */}
              <div className="text-center mb-8">
                <div className="text-3xl font-light tracking-wider mb-4 min-h-[1.5em]">
                  {dialNumber || ""}
                </div>
                {dialNumber && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearDialNumber}
                    className="text-gray-400 hover:text-gray-300"
                  >
                    ⌫
                  </Button>
                )}
              </div>

              {/* Keypad Grid */}
              <div className="space-y-4 mb-8">
                {keypadNumbers.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex justify-center space-x-8">
                    {row.map((key) => (
                      <button
                        key={key.number}
                        onClick={() => handleKeypadPress(key.number)}
                        className="w-16 h-16 rounded-full bg-gray-800 hover:bg-gray-700 flex flex-col items-center justify-center transition-colors"
                      >
                        <span className="text-2xl font-light">{key.number}</span>
                        {key.letters && (
                          <span className="text-xs text-gray-400 mt-0.5">{key.letters}</span>
                        )}
                      </button>
                    ))}
                  </div>
                ))}
              </div>

              {/* Call Button */}
              {dialNumber && (
                <div className="text-center">
                  <button
                    onClick={handleCall}
                    className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-colors"
                  >
                    <Phone className="w-6 h-6 text-white" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div className="p-8 text-center text-gray-400">
              <Star className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p>No favorites yet</p>
              <p className="text-sm mt-2">Add contacts to favorites for quick access</p>
            </div>
          )}

          {/* Voicemail Tab */}
          {activeTab === 'voicemail' && (
            <div className="p-8 text-center text-gray-400">
              <Voicemail className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p>No voicemails</p>
              <p className="text-sm mt-2">Voicemails will appear here</p>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-black border-t border-gray-800">
          <div className="flex">
            {[
              { key: 'favorites', icon: Star, label: 'Favorites' },
              { key: 'recents', icon: Clock, label: 'Recents' },
              { key: 'contacts', icon: Users, label: 'Contacts' },
              { key: 'keypad', icon: Grid3X3, label: 'Keypad' },
              { key: 'voicemail', icon: Voicemail, label: 'Voicemail' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={cn(
                  "flex-1 py-3 flex flex-col items-center space-y-1 transition-colors",
                  activeTab === tab.key
                    ? "text-blue-400"
                    : "text-gray-400 hover:text-gray-300"
                )}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-xs">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}