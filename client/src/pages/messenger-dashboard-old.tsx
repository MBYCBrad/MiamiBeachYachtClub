import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
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
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Users,
  Star,
  AlertCircle,
  Settings,
  Timer,
  Crown,
  UserCheck,
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

interface PhoneCall {
  id: string;
  memberId: number;
  memberName: string;
  memberPhone: string;
  callType: 'inbound' | 'outbound';
  status: 'ringing' | 'active' | 'ended' | 'missed';
  duration?: number;
  startTime: Date;
  endTime?: Date;
  reason: 'trip_start' | 'trip_emergency' | 'trip_end' | 'general_inquiry' | 'concierge_request';
  tripId?: number;
  yachtId?: number;
  notes?: string;
  recordingUrl?: string;
}

const MessengerDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State management
  const [activeTab, setActiveTab] = useState<'messages' | 'calls' | 'queue'>('messages');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isRecording, setIsRecording] = useState(false);
  const [activeCalls, setActiveCalls] = useState<PhoneCall[]>([]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'new_message') {
        queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
        queryClient.invalidateQueries({ queryKey: ['/api/messages', data.conversationId] });
      } else if (data.type === 'incoming_call') {
        setActiveCalls(prev => [...prev, data.call]);
        toast({
          title: "Incoming Call",
          description: `${data.call.memberName} is calling`,
          variant: "default",
        });
      } else if (data.type === 'call_ended') {
        setActiveCalls(prev => prev.filter(call => call.id !== data.callId));
      }
    };

    return () => ws.close();
  }, [queryClient, toast]);

  // Fetch conversations
  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ['/api/conversations'],
    refetchInterval: 5000,
  });

  // Fetch messages for selected conversation
  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ['/api/messages', selectedConversation],
    enabled: !!selectedConversation,
    refetchInterval: 2000,
  });

  // Fetch recent calls
  const { data: recentCalls = [] } = useQuery<PhoneCall[]>({
    queryKey: ['/api/calls/recent'],
    refetchInterval: 10000,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content, messageType = 'text' }: {
      conversationId: string;
      content: string;
      messageType?: string;
    }) => {
      const response = await apiRequest('POST', '/api/messages', {
        conversationId,
        content,
        messageType,
        senderId: user?.id
      });
      return response.json();
    },
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages', selectedConversation] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Initiate call mutation
  const initiateCallMutation = useMutation({
    mutationFn: async ({ memberId, reason }: { memberId: number; reason: string }) => {
      const response = await apiRequest('POST', '/api/calls/initiate', {
        memberId,
        reason
      });
      return response.json();
    },
    onSuccess: (call) => {
      setActiveCalls(prev => [...prev, call]);
      toast({
        title: "Call Initiated",
        description: "Connecting to member...",
      });
    }
  });

  // Answer call mutation
  const answerCallMutation = useMutation({
    mutationFn: async (callId: string) => {
      const response = await apiRequest('POST', `/api/calls/${callId}/answer`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Call Connected",
        description: "You are now connected with the member",
      });
    }
  });

  // End call mutation
  const endCallMutation = useMutation({
    mutationFn: async ({ callId, notes }: { callId: string; notes?: string }) => {
      const response = await apiRequest('POST', `/api/calls/${callId}/end`, { notes });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calls/recent'] });
    }
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Filter conversations based on search and status
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || conv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Handle sending messages
  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;
    
    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      content: messageText.trim()
    });
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-green-400 bg-green-500/20';
    }
  };

  // Get call status color
  const getCallStatusColor = (status: string) => {
    switch (status) {
      case 'ringing': return 'text-blue-400 animate-pulse';
      case 'active': return 'text-green-400';
      case 'ended': return 'text-gray-400';
      case 'missed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const renderConversationsList = () => (
    <div className="space-y-2">
      {filteredConversations.map((conversation) => (
        <motion.div
          key={conversation.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: 5 }}
          onClick={() => setSelectedConversation(conversation.id)}
          className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
            selectedConversation === conversation.id
              ? 'bg-purple-500/20 border-purple-500/50'
              : 'bg-gray-800/50 hover:bg-gray-700/50 border-gray-700/50'
          } border backdrop-blur-sm`}
        >
          <div className="flex items-start space-x-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-semibold">
                  {conversation.memberName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {conversation.currentTrip && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-white truncate">{conversation.memberName}</h3>
                <span className="text-xs text-gray-400">
                  {new Date(conversation.lastMessageTime).toLocaleTimeString()}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 mb-2">
                <Badge className={`text-xs px-2 py-1 ${getPriorityColor(conversation.priority)}`}>
                  {conversation.priority.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {conversation.membershipTier}
                </Badge>
                {conversation.currentTrip && (
                  <Badge className="text-xs bg-green-500/20 text-green-400">
                    On Trip
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-gray-400 truncate mb-2">{conversation.lastMessage}</p>
              
              {conversation.currentTrip && (
                <div className="flex items-center text-xs text-blue-400">
                  <Ship className="h-3 w-3 mr-1" />
                  {conversation.currentTrip.yachtName}
                </div>
              )}
              
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-1">
                  {conversation.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 bg-gray-700 rounded-full text-gray-300">
                      {tag}
                    </span>
                  ))}
                </div>
                
                {conversation.unreadCount > 0 && (
                  <Badge className="bg-purple-500 text-white text-xs">
                    {conversation.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderMessageThread = () => {
    const conversation = conversations.find(c => c.id === selectedConversation);
    if (!conversation) return null;

    return (
      <div className="flex flex-col h-full">
        {/* Conversation Header */}
        <div className="p-4 border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-semibold">
                  {conversation.memberName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-white">{conversation.memberName}</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <span>{conversation.memberPhone}</span>
                  <span>•</span>
                  <span>{conversation.membershipTier}</span>
                  {conversation.currentTrip && (
                    <>
                      <span>•</span>
                      <span className="text-green-400">On {conversation.currentTrip.yachtName}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => initiateCallMutation.mutate({ 
                  memberId: conversation.memberId, 
                  reason: 'general_inquiry' 
                })}
                disabled={initiateCallMutation.isPending}
              >
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
              <Button size="sm" variant="ghost">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.senderId === user?.id
                  ? 'bg-purple-500 text-white'
                  : message.messageType === 'system'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : message.messageType === 'trip_alert'
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'bg-gray-700 text-white'
              }`}>
                <p className="text-sm">{message.content}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs opacity-70">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </span>
                  {message.senderId === user?.id && (
                    <div className="flex items-center space-x-1">
                      {message.status === 'read' && <CheckCircle className="h-3 w-3" />}
                      {message.status === 'delivered' && <CheckCircle className="h-3 w-3 opacity-50" />}
                      {message.status === 'sent' && <Clock className="h-3 w-3 opacity-50" />}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <Textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message..."
                className="resize-none bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                rows={2}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-white"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className={`${isRecording ? 'text-red-400' : 'text-gray-400'} hover:text-white`}
                onClick={() => setIsRecording(!isRecording)}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!messageText.trim() || sendMessageMutation.isPending}
              className="bg-purple-500 hover:bg-purple-600"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderCallsPanel = () => (
    <div className="space-y-6">
      {/* Active Calls */}
      {activeCalls.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Active Calls</h3>
          {activeCalls.map((call) => (
            <motion.div
              key={call.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-white font-semibold">
                        {call.memberName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{call.memberName}</h4>
                    <p className="text-sm text-gray-400">{call.memberPhone}</p>
                    <p className="text-sm text-green-400">{call.reason.replace('_', ' ').toUpperCase()}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300"
                    onClick={() => endCallMutation.mutate({ callId: call.id })}
                  >
                    <Phone className="h-4 w-4" />
                    End
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Recent Calls */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Recent Calls</h3>
        <div className="space-y-2">
          {recentCalls.map((call) => (
            <div
              key={call.id}
              className="p-4 bg-gray-800/50 border border-gray-700/50 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {call.callType === 'inbound' ? (
                      <PhoneIncoming className={`h-5 w-5 ${getCallStatusColor(call.status)}`} />
                    ) : (
                      <PhoneOutgoing className={`h-5 w-5 ${getCallStatusColor(call.status)}`} />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{call.memberName}</h4>
                    <p className="text-sm text-gray-400">{call.memberPhone}</p>
                    <p className="text-sm text-gray-500">{call.reason.replace('_', ' ')}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-400">
                    {new Date(call.startTime).toLocaleTimeString()}
                  </p>
                  {call.duration && (
                    <p className="text-sm text-gray-500">
                      {Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, '0')}
                    </p>
                  )}
                  <Badge className={`text-xs ${getCallStatusColor(call.status)}`}>
                    {call.status}
                  </Badge>
                </div>
              </div>
              
              {call.notes && (
                <div className="mt-3 p-2 bg-gray-700/50 rounded text-sm text-gray-300">
                  {call.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-700/50 bg-gray-900/50 backdrop-blur-xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">Communication Hub</h1>
            <Badge className="bg-purple-500/20 text-purple-400">Live</Badge>
          </div>
          
          {/* Search and Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700/50">
          {[
            { id: 'messages', label: 'Messages', icon: MessageSquare },
            { id: 'calls', label: 'Calls', icon: Phone },
            { id: 'queue', label: 'Queue', icon: Clock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'messages' && renderConversationsList()}
          {activeTab === 'calls' && renderCallsPanel()}
          {activeTab === 'queue' && (
            <div className="text-center text-gray-400 mt-8">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Queue management coming soon</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedConversation && activeTab === 'messages' ? (
          renderMessageThread()
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-900/30">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Welcome to MBYC Communication Hub
              </h3>
              <p className="text-gray-400 max-w-md">
                Select a conversation to start messaging with members, or monitor incoming calls and trip alerts.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessengerDashboard;