import { useState } from 'react';
import { MessageSquare, Search, Send, User, Clock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: Date;
  isRead: boolean;
  senderName: string;
  receiverName: string;
}

interface Conversation {
  id: number;
  participants: string[];
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  otherPartyName: string;
  otherPartyRole: string;
}

export default function MessagesDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['/api/staff/conversations'],
    enabled: isOpen,
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/staff/messages', selectedConversation],
    enabled: selectedConversation !== null,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { conversationId: number; content: string }) => {
      return apiRequest('/api/staff/messages', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff/conversations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/staff/messages', selectedConversation] });
      setNewMessage('');
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: number) => {
      return apiRequest(`/api/staff/conversations/${conversationId}/read`, 'POST');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff/conversations'] });
    },
  });

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      sendMessageMutation.mutate({
        conversationId: selectedConversation,
        content: newMessage.trim(),
      });
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation.id);
    if (conversation.unreadCount > 0) {
      markAsReadMutation.mutate(conversation.id);
    }
  };

  const filteredConversations = (conversations as Conversation[]).filter((conv: Conversation) =>
    conv.otherPartyName && conv.otherPartyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUnreadCount = (conversations as Conversation[]).reduce((sum: number, conv: Conversation) => sum + conv.unreadCount, 0);

  const formatTime = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
      >
        <MessageSquare className="h-5 w-5" />
        {totalUnreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0 flex items-center justify-center">
            {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-gray-950 border border-gray-700/50 rounded-lg shadow-xl z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-700/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">Messages</h3>
              <Badge variant="outline" className="text-xs bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0">
                {totalUnreadCount} unread
              </Badge>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-900/50 border-gray-700/50 text-white placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex h-96">
            {/* Conversations List */}
            <div className="w-1/2 border-r border-gray-700/50">
              <ScrollArea className="h-96">
                {conversationsLoading ? (
                  <div className="p-4 text-center text-gray-400">
                    Loading conversations...
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No conversations</p>
                  </div>
                ) : (
                  filteredConversations.map((conversation: Conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => handleConversationSelect(conversation)}
                      className={`p-3 border-b border-gray-800/50 cursor-pointer transition-colors ${
                        selectedConversation === conversation.id 
                          ? 'bg-purple-500/10 border-l-2 border-l-purple-500' 
                          : 'hover:bg-gray-800/30'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-white truncate">
                              {conversation.otherPartyName}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <Badge className="h-4 w-4 p-0 text-xs bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0 flex items-center justify-center">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 capitalize">{conversation.otherPartyRole}</p>
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {conversation.lastMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </div>

            {/* Messages Panel */}
            <div className="w-1/2 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-3">
                    {messagesLoading ? (
                      <div className="text-center text-gray-400 mt-8">
                        Loading messages...
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center text-gray-400 mt-8">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No messages yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {messages.map((message: Message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.senderId === 1 ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] p-2 rounded-lg ${
                                message.senderId === 1
                                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                                  : 'bg-gray-800 text-white'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <div className="flex items-center justify-between text-xs opacity-70 mt-1">
                                <span>{message.senderName}</span>
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatTime(message.timestamp)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>

                  <Separator />

                  {/* Message Input */}
                  <div className="p-3">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="flex-1 bg-gray-900/50 border-gray-700/50 text-white placeholder-gray-400"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Select a conversation</p>
                    <p className="text-xs text-gray-500">Choose a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}