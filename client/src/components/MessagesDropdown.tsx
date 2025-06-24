import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { MessageSquare, Send, Phone, Video, MoreHorizontal, Clock, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  receiverId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: number;
    username: string;
    role: string;
    avatar?: string;
  };
  receiver?: {
    id: number;
    username: string;
    role: string;
    avatar?: string;
  };
}

interface Conversation {
  id: number;
  participant1Id: number;
  participant2Id: number;
  lastMessage?: Message;
  unreadCount: number;
  participant?: {
    id: number;
    username: string;
    role: string;
    avatar?: string;
  };
}

interface MessagesDropdownProps {
  userId?: number;
}

const MessagesDropdown: React.FC<MessagesDropdownProps> = ({ userId }) => {
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);

  const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
    queryKey: ['/api/messages/conversations', userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await apiRequest('GET', `/api/messages/conversations?userId=${userId}`);
      return response.json();
    },
    enabled: !!userId,
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ['/api/messages', selectedConversation],
    queryFn: async () => {
      if (!selectedConversation) return [];
      const response = await apiRequest('GET', `/api/messages/${selectedConversation}`);
      return response.json();
    },
    enabled: !!selectedConversation,
    refetchInterval: 10000, // Refresh every 10 seconds when viewing conversation
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: number; content: string }) => {
      await apiRequest('POST', '/api/messages', {
        conversationId,
        content,
        senderId: userId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/conversations'] });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: number) => {
      await apiRequest('PUT', `/api/messages/${conversationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages/conversations'] });
    },
  });

  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'text-red-400';
      case 'yacht_owner':
        return 'text-blue-400';
      case 'service_provider':
        return 'text-green-400';
      case 'member':
        return 'text-purple-400';
      default:
        if (role.startsWith('Staff')) return 'text-orange-400';
        return 'text-gray-400';
    }
  };

  const getStatusDot = (role: string) => {
    // Simulate online status based on role
    const isOnline = Math.random() > 0.3; // 70% chance of being online
    return isOnline ? 'bg-green-500' : 'bg-gray-500';
  };

  if (selectedConversation) {
    const conversation = conversations.find(c => c.id === selectedConversation);
    
    return (
      <Card className="w-96 h-96 bg-gray-900/95 border-gray-700/50 backdrop-blur-xl shadow-2xl flex flex-col">
        <CardHeader className="pb-3 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedConversation(null)}
                className="text-gray-400 hover:text-white p-1"
              >
                ←
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src={conversation?.participant?.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-sm">
                  {conversation?.participant?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="text-white font-medium text-sm">
                  {conversation?.participant?.username}
                </h4>
                <p className={`text-xs ${getRoleColor(conversation?.participant?.role || '')}`}>
                  {conversation?.participant?.role}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-1">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-1">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-1">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isFromUser = message.senderId === userId;
              
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${isFromUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${isFromUser ? 'order-2' : 'order-1'}`}>
                    <div className={`p-3 rounded-2xl ${
                      isFromUser 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white ml-2' 
                        : 'bg-gray-800/60 text-gray-200 mr-2'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <div className={`flex items-center mt-1 text-xs text-gray-500 ${
                      isFromUser ? 'justify-end' : 'justify-start'
                    }`}>
                      <Clock className="h-3 w-3 mr-1" />
                      {message.createdAt ? formatDistanceToNow(new Date(message.createdAt), { addSuffix: true }) : 'Just now'}
                      {isFromUser && message.isRead && (
                        <CheckCheck className="h-3 w-3 ml-1 text-blue-400" />
                      )}
                    </div>
                  </div>
                  
                  {!isFromUser && (
                    <Avatar className="h-6 w-6 order-1">
                      <AvatarImage src={message.sender?.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-gray-600 to-gray-700 text-white text-xs">
                        {message.sender?.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="border-t border-gray-700/50 p-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  sendMessageMutation.mutate({
                    conversationId: selectedConversation,
                    content: e.currentTarget.value.trim(),
                  });
                  e.currentTarget.value = '';
                }
              }}
            />
            <Button
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-96 bg-gray-900/95 border-gray-700/50 backdrop-blur-xl shadow-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-blue-400" />
          Messages
          {totalUnreadCount > 0 && (
            <Badge className="ml-2 bg-blue-500 text-white text-xs">
              {totalUnreadCount}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-80">
          {isLoading ? (
            <div className="p-6 text-center text-gray-400">
              Loading conversations...
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              No conversations yet
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {conversations.map((conversation, index) => (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-3 rounded-xl bg-gray-800/30 hover:bg-gray-700/40 transition-all duration-300 cursor-pointer group"
                  onClick={() => {
                    setSelectedConversation(conversation.id);
                    if (conversation.unreadCount > 0) {
                      markAsReadMutation.mutate(conversation.id);
                    }
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.participant?.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                          {conversation.participant?.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusDot(conversation.participant?.role || '')} rounded-full border-2 border-gray-900`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-medium truncate">
                          {conversation.participant?.username}
                        </h4>
                        {conversation.unreadCount > 0 && (
                          <Badge className="bg-blue-500 text-white text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      
                      <p className={`text-xs mt-0.5 ${getRoleColor(conversation.participant?.role || '')}`}>
                        {conversation.participant?.role}
                      </p>
                      
                      {conversation.lastMessage && (
                        <p className="text-sm text-gray-400 truncate mt-1">
                          {conversation.lastMessage.content}
                        </p>
                      )}
                      
                      {conversation.lastMessage && (
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="border-t border-gray-700/50 p-4">
          <Button 
            variant="outline" 
            className="w-full border-gray-600 hover:border-blue-500 text-gray-300 hover:text-white"
          >
            View All Messages
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MessagesDropdown;