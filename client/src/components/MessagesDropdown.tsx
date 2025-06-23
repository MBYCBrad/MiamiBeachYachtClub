import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { 
  MessageSquare, 
  Send, 
  Dot, 
  Clock,
  User,
  ChevronDown,
  Reply,
  Eye,
  X,
  Search,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  memberId: number;
  memberName: string;
  lastMessage: string;
  unreadCount: number;
  lastActivity: string;
  status: 'active' | 'pending' | 'resolved';
}

interface Message {
  id: number;
  senderId: number;
  content: string;
  status: string;
  createdAt: string;
  senderName?: string;
}

export default function MessagesDropdown() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ['/api/conversations'],
    enabled: !!user && (user.role === 'admin' || user.role?.startsWith('staff')),
    refetchInterval: 5000, // Real-time updates every 5 seconds
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ['/api/messages', selectedConversation],
    enabled: !!selectedConversation,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { conversationId: string; content: string }) => {
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

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      content: newMessage.trim()
    });
  };

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversation(conversationId);
    markAsReadMutation.mutate(conversationId);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  if (!user || (user.role !== 'admin' && !user.role?.startsWith('staff'))) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-9 w-9 p-0 hover:bg-purple-500/10 transition-colors"
        >
          <MessageSquare className="h-5 w-5 text-purple-300" />
          {totalUnread > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
            >
              {totalUnread > 99 ? '99+' : totalUnread}
            </motion.div>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-96 p-0 bg-gray-900/95 backdrop-blur-xl border-purple-500/20"
        align="end"
      >
        <div className="flex h-[500px]">
          {/* Conversations List */}
          <div className={`${selectedConversation ? 'w-1/3' : 'w-full'} border-r border-purple-500/20 transition-all`}>
            <div className="p-4 border-b border-purple-500/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-purple-400" />
                  Messages
                </h3>
                {selectedConversation && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedConversation(null)}
                    className="h-6 w-6 p-0 hover:bg-purple-500/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-purple-500/20 text-white placeholder-gray-400"
                />
              </div>
            </div>
            
            <ScrollArea className="h-[400px]">
              {conversationsLoading ? (
                <div className="p-4 text-center text-gray-400">
                  <Clock className="h-8 w-8 mx-auto mb-2 animate-spin" />
                  Loading conversations...
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-gray-400">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No conversations found
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredConversations.map((conversation) => (
                    <motion.div
                      key={conversation.id}
                      whileHover={{ backgroundColor: "rgba(168, 85, 247, 0.1)" }}
                      className={`p-3 cursor-pointer border-l-4 transition-all ${
                        selectedConversation === conversation.id
                          ? 'border-l-purple-500 bg-purple-500/10'
                          : 'border-l-transparent hover:border-l-purple-400'
                      }`}
                      onClick={() => handleConversationSelect(conversation.id)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-white text-sm">
                          {conversation.memberName}
                        </span>
                        <div className="flex items-center gap-2">
                          {conversation.unreadCount > 0 && (
                            <Badge className="bg-purple-500 text-white text-xs h-5 px-2">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                          <span className="text-xs text-gray-400">
                            {conversation.lastActivity ? formatDistanceToNow(new Date(conversation.lastActivity), { addSuffix: true }) : 'Just now'}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-400 truncate">
                        {conversation.lastMessage}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <Badge 
                          variant={conversation.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {conversation.status}
                        </Badge>
                        <Dot className={`h-4 w-4 ${
                          conversation.status === 'active' ? 'text-green-400' :
                          conversation.status === 'pending' ? 'text-yellow-400' : 'text-gray-400'
                        }`} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
          
          {/* Message Thread */}
          {selectedConversation && (
            <div className="w-2/3 flex flex-col">
              <div className="p-4 border-b border-purple-500/20">
                <h4 className="font-medium text-white">
                  {conversations.find(c => c.id === selectedConversation)?.memberName}
                </h4>
                <p className="text-xs text-gray-400">
                  Conversation ID: {selectedConversation}
                </p>
              </div>
              
              <ScrollArea className="flex-1 p-4">
                {messagesLoading ? (
                  <div className="text-center text-gray-400">
                    <Clock className="h-6 w-6 mx-auto mb-2 animate-spin" />
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-400">
                    <MessageSquare className="h-6 w-6 mx-auto mb-2 opacity-50" />
                    No messages yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] p-3 rounded-lg ${
                          message.senderId === user.id
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-800 text-gray-200'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              
              <div className="p-4 border-t border-purple-500/20">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 bg-gray-800/50 border-purple-500/20 text-white placeholder-gray-400 resize-none"
                    rows={2}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}