import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { 
  MessageSquare, 
  Send, 
  Search, 
  Phone,
  Video,
  MoreVertical,
  Archive,
  Star,
  Trash2,
  Eye,
  Clock,
  User,
  Settings,
  Filter,
  Check,
  CheckCheck,
  Circle,
  MessageCircle,
  Users,
  AlertCircle,
  Headphones
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow, format } from "date-fns";

interface Conversation {
  id: string;
  memberId: number;
  memberName: string;
  memberEmail?: string;
  memberRole?: string;
  lastMessage: string;
  unreadCount: number;
  lastActivity: string;
  status: 'active' | 'pending' | 'resolved';
  avatar?: string;
  isOnline?: boolean;
}

interface Message {
  id: number;
  senderId: number;
  recipientId?: number;
  conversationId: string;
  content: string;
  messageType: string;
  status: 'sent' | 'delivered' | 'read';
  createdAt: string;
  updatedAt?: string;
  senderName?: string;
  senderRole?: string;
  metadata?: {
    yachtId?: number;
    serviceId?: number;
    bookingId?: number;
    phoneNumber?: string;
  };
}

interface MessageStats {
  totalConversations: number;
  unreadMessages: number;
  activeToday: number;
  responseTime: string;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  
  // Only allow service providers and admins access
  if (!user || (user.role !== 'service_provider' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-gray-400">This messaging system is only available to service providers and administrators.</p>
        </div>
      </div>
    );
  }
  
  // Fetch message stats
  const { data: stats } = useQuery<MessageStats>({
    queryKey: ['/api/messages/stats'],
    enabled: !!user,
  });

  // Fetch conversations with real-time updates
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ['/api/conversations'],
    enabled: !!user,
    refetchInterval: 3000, // Real-time updates every 3 seconds
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ['/api/messages', selectedConversation],
    enabled: !!selectedConversation,
    refetchInterval: 2000, // Real-time message updates
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { conversationId: string; content: string; recipientId?: number }) => {
      const response = await apiRequest('POST', '/api/messages', messageData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages', selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      setNewMessage("");
    },
  });

  // Mark conversation as read
  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      await apiRequest('PUT', `/api/conversations/${conversationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
    },
  });

  // Filter conversations based on search and status
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || conv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    const selectedConv = conversations.find(c => c.id === selectedConversation);
    
    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      content: newMessage.trim(),
      recipientId: selectedConv?.memberId
    });
  };

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversation(conversationId);
    
    // Mark as read if has unread messages
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation && conversation.unreadCount > 0) {
      markAsReadMutation.mutate(conversationId);
    }
  };

  const selectedConversationData = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Video Header Background */}
      <div className="relative h-96 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-blue-900/20 to-black/50 z-10" />
        <video
          autoPlay
          muted
          loop
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.7)' }}
        >
          <source src="/api/media/video/MBYC_UPDATED_1751023212560.mp4" type="video/mp4" />
        </video>
        
        {/* Header Content */}
        <div className="relative z-20 h-full flex flex-col justify-center px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <motion.h1 
              className="text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Messages
            </motion.h1>
            <motion.p 
              className="text-xl lg:text-2xl text-gray-300 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              {user?.role === 'admin' ? 'Manage service provider communications and support requests' : 'Contact Miami Beach Yacht Club administration for support and coordination'}
            </motion.p>
          </motion.div>

          {/* Stats Overlay Cards */}
          <motion.div 
            className="flex flex-wrap gap-4 mt-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <div className="flex items-center space-x-3 bg-black/30 backdrop-blur-sm border border-purple-500/30 rounded-2xl px-6 py-3">
              <MessageCircle className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Active Conversations</p>
                <p className="text-2xl font-bold text-white">{stats?.totalConversations || conversations.length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-black/30 backdrop-blur-sm border border-blue-500/30 rounded-2xl px-6 py-3">
              <Headphones className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">24/7 Support</p>
                <p className="text-lg font-semibold text-white">Available</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Messages Interface */}
      <div className="container mx-auto px-6 py-12 -mt-32 relative z-30">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[800px]">
          
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card className="h-full bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
              <CardHeader className="border-b border-gray-700/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Users className="h-5 w-5 text-purple-400" />
                    <span>Conversations</span>
                  </CardTitle>
                  <Button variant="outline" size="sm" className="text-purple-400 border-purple-500/30">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Search and Filter */}
                <div className="space-y-3 mt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    {(['all', 'active', 'pending', 'resolved'] as const).map((status) => (
                      <Button
                        key={status}
                        variant={filterStatus === status ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterStatus(status)}
                        className={`text-xs ${
                          filterStatus === status 
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white" 
                            : "text-gray-300 border-gray-600 hover:bg-gray-700"
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  {conversationsLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-center p-6">
                      <MessageSquare className="h-12 w-12 text-gray-500 mb-2" />
                      <p className="text-gray-400">No conversations found</p>
                    </div>
                  ) : (
                    <div className="space-y-0">
                      {filteredConversations.map((conversation, index) => (
                        <motion.div
                          key={conversation.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-4 border-b border-gray-700/30 cursor-pointer transition-all duration-200 hover:bg-gray-800/50 ${
                            selectedConversation === conversation.id ? 'bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border-l-4 border-l-purple-500' : ''
                          }`}
                          onClick={() => handleConversationSelect(conversation.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="relative">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={conversation.avatar} />
                                <AvatarFallback className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                                  {conversation.memberName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              {conversation.isOnline && (
                                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-gray-900 rounded-full" />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="text-white font-medium truncate">{conversation.memberName}</h4>
                                <div className="flex items-center space-x-2">
                                  {conversation.unreadCount > 0 && (
                                    <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs px-2 py-1">
                                      {conversation.unreadCount}
                                    </Badge>
                                  )}
                                  <span className="text-xs text-gray-400">
                                    {formatDistanceToNow(new Date(conversation.lastActivity), { addSuffix: true })}
                                  </span>
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-400 truncate mt-1">{conversation.lastMessage}</p>
                              
                              <div className="flex items-center justify-between mt-2">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    conversation.status === 'active' ? 'border-green-500 text-green-400' :
                                    conversation.status === 'pending' ? 'border-yellow-500 text-yellow-400' :
                                    'border-gray-500 text-gray-400'
                                  }`}
                                >
                                  {conversation.status}
                                </Badge>
                                {conversation.memberRole && (
                                  <span className="text-xs text-gray-500">{conversation.memberRole}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Message Thread */}
          <div className="lg:col-span-2">
            <Card className="h-full bg-gray-900/50 border-gray-700/50 backdrop-blur-sm flex flex-col">
              {selectedConversation && selectedConversationData ? (
                <>
                  {/* Message Header */}
                  <CardHeader className="border-b border-gray-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={selectedConversationData.avatar} />
                          <AvatarFallback className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                            {selectedConversationData.memberName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-white font-semibold">{selectedConversationData.memberName}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs bg-green-50/10 text-green-400 border-green-500/30">
                              <div className="h-2 w-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                              Online
                            </Badge>
                            {selectedConversationData.memberRole && (
                              <span className="text-sm text-gray-400">{selectedConversationData.memberRole}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" className="text-purple-400 border-purple-500/30">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-blue-400 border-blue-500/30">
                          <Video className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-gray-400 border-gray-600">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Messages Area */}
                  <CardContent className="flex-1 p-0">
                    <ScrollArea className="h-[500px] p-4">
                      {messagesLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <MessageCircle className="h-16 w-16 text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-white mb-2">Start the conversation</h3>
                          <p className="text-gray-400 max-w-sm">
                            Send a message to begin your conversation with {selectedConversationData.memberName}.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages.map((message, index) => (
                            <motion.div
                              key={message.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                  message.senderId === user?.id
                                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white ml-12"
                                    : "bg-gray-800 text-white mr-12"
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-xs opacity-70">
                                    {format(new Date(message.createdAt), 'MMM d, h:mm a')}
                                  </span>
                                  {message.senderId === user?.id && (
                                    <div className="flex items-center space-x-1">
                                      {message.status === 'sent' && <Check className="h-3 w-3 opacity-70" />}
                                      {message.status === 'delivered' && <CheckCheck className="h-3 w-3 opacity-70" />}
                                      {message.status === 'read' && <CheckCheck className="h-3 w-3 text-blue-400" />}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>

                  {/* Message Input */}
                  <div className="border-t border-gray-700/50 p-4">
                    <div className="flex space-x-3">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 resize-none bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 min-h-[80px]"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        disabled={sendMessageMutation.isPending}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white self-end"
                      >
                        {sendMessageMutation.isPending ? (
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">Select a conversation</h3>
                    <p className="text-gray-400">Choose a conversation from the list to start messaging</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}