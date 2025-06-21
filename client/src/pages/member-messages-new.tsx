import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Send, 
  Search, 
  Phone, 
  Video, 
  MoreVertical,
  ArrowLeft,
  Star,
  Clock,
  Check,
  CheckCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: Date;
  read: boolean;
  type: 'text' | 'system';
}

interface Conversation {
  id: number;
  participantId: number;
  participantName: string;
  participantRole: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
  avatar?: string;
}

interface MemberMessagesProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function MemberMessages({ currentView, setCurrentView }: MemberMessagesProps) {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock conversations data
  const conversations: Conversation[] = [
    {
      id: 1,
      participantId: 101,
      participantName: "Captain Marina Rodriguez",
      participantRole: "Yacht Owner",
      lastMessage: "Your booking for Marina Breeze is confirmed for next week!",
      lastMessageTime: new Date(Date.now() - 30 * 60 * 1000),
      unreadCount: 2,
      isOnline: true
    },
    {
      id: 2,
      participantId: 102,
      participantName: "Chef Alessandro",
      participantRole: "Service Provider",
      lastMessage: "I've prepared a special menu for your yacht dinner experience",
      lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      unreadCount: 0,
      isOnline: false
    },
    {
      id: 3,
      participantId: 103,
      participantName: "Event Coordinator Sarah",
      participantRole: "Event Host",
      lastMessage: "The sunset cocktail cruise event details are ready",
      lastMessageTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
      unreadCount: 1,
      isOnline: true
    },
    {
      id: 4,
      participantId: 104,
      participantName: "Concierge Service",
      participantRole: "Support",
      lastMessage: "How can we assist you with your yacht club experience?",
      lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
      unreadCount: 0,
      isOnline: true
    }
  ];

  // Mock messages for selected conversation
  const getMessagesForConversation = (conversationId: number): Message[] => {
    const baseMessages = [
      {
        id: 1,
        senderId: conversations.find(c => c.id === conversationId)?.participantId || 101,
        receiverId: user?.id || 1,
        content: "Hello! Thank you for your interest in our yacht services.",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: true,
        type: 'text' as const
      },
      {
        id: 2,
        senderId: user?.id || 1,
        receiverId: conversations.find(c => c.id === conversationId)?.participantId || 101,
        content: "I'm interested in booking the Marina Breeze for next weekend.",
        timestamp: new Date(Date.now() - 90 * 60 * 1000),
        read: true,
        type: 'text' as const
      },
      {
        id: 3,
        senderId: conversations.find(c => c.id === conversationId)?.participantId || 101,
        receiverId: user?.id || 1,
        content: "Perfect! I have availability for Saturday and Sunday. What time would work best for you?",
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        read: true,
        type: 'text' as const
      },
      {
        id: 4,
        senderId: conversations.find(c => c.id === conversationId)?.participantId || 101,
        receiverId: user?.id || 1,
        content: conversations.find(c => c.id === conversationId)?.lastMessage || "Latest message",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: false,
        type: 'text' as const
      }
    ];
    return baseMessages;
  };

  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (selectedConversation) {
      setMessages(getMessagesForConversation(selectedConversation));
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredConversations = conversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;

    const newMessage: Message = {
      id: messages.length + 1,
      senderId: user?.id || 1,
      receiverId: conversations.find(c => c.id === selectedConversation)?.participantId || 101,
      content: messageText,
      timestamp: new Date(),
      read: false,
      type: 'text'
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageText('');

    // Simulate response after 2 seconds
    setTimeout(() => {
      const responseMessage: Message = {
        id: messages.length + 2,
        senderId: conversations.find(c => c.id === selectedConversation)?.participantId || 101,
        receiverId: user?.id || 1,
        content: "Thank you for your message! I'll get back to you shortly.",
        timestamp: new Date(),
        read: false,
        type: 'text'
      };
      setMessages(prev => [...prev, responseMessage]);
    }, 2000);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Mobile: Show conversation list or chat */}
      <div className="md:hidden">
        {!selectedConversation ? (
          // Conversation List
          <>
            {/* Header */}
            <div className="pt-12 pb-6 px-4">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold text-gradient-animate mb-2"
              >
                Messages
              </motion.h1>
              <p className="text-gray-300">
                {conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)} unread messages
              </p>
            </div>

            {/* Search */}
            <div className="px-4 mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 rounded-xl"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="px-4 space-y-2">
              {filteredConversations.map((conversation, index) => (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:bg-gray-800/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold">
                          {conversation.participantName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-white truncate">
                          {conversation.participantName}
                        </h3>
                        <span className="text-xs text-gray-400">
                          {formatTime(conversation.lastMessageTime)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400 truncate flex-1">
                          {conversation.lastMessage}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <Badge className="bg-purple-600 text-white ml-2 min-w-[20px] h-5 text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-purple-400 mt-1">
                        {conversation.participantRole}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          // Chat View
          <div className="flex flex-col h-screen">
            {/* Chat Header */}
            <div className="bg-gray-900/50 border-b border-gray-800 p-4 pt-16">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedConversation(null)}
                  className="text-gray-400 hover:text-white p-2"
                >
                  <ArrowLeft size={20} />
                </Button>
                
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold">
                    {selectedConv?.participantName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{selectedConv?.participantName}</h3>
                  <p className="text-xs text-purple-400">{selectedConv?.participantRole}</p>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                    <Phone size={18} />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                    <Video size={18} />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                    <MoreVertical size={18} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-4 py-4">
              <div className="space-y-4">
                {messages.map((message, index) => {
                  const isOwn = message.senderId === user?.id;
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "flex",
                        isOwn ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-3",
                          isOwn
                            ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                            : "bg-gray-800 text-white"
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {isOwn && (
                            <div className="ml-2">
                              {message.read ? (
                                <CheckCheck size={12} className="text-blue-300" />
                              ) : (
                                <Check size={12} className="opacity-70" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="bg-gray-900/50 border-t border-gray-800 p-4">
              <div className="flex items-center space-x-3">
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-xl"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 rounded-xl p-3"
                >
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}