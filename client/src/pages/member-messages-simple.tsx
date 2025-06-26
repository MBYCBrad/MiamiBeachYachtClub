import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Search, 
  Phone, 
  Video, 
  MessageCircle,
  ArrowLeft,
  User
} from 'lucide-react';
import { motion } from 'framer-motion';

interface MemberMessagesProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function MemberMessages({ currentView, setCurrentView }: MemberMessagesProps) {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  const conversations = [
    {
      id: 1,
      participantName: "Captain Marina Rodriguez",
      participantRole: "Yacht Owner",
      lastMessage: "Your booking for Marina Breeze is confirmed for next week!",
      lastMessageTime: "30m ago",
      unreadCount: 2,
      isOnline: true
    },
    {
      id: 2,
      participantName: "Chef Alessandro",
      participantRole: "Service Provider",
      lastMessage: "I've prepared a special menu for your yacht dinner experience",
      lastMessageTime: "2h ago",
      unreadCount: 0,
      isOnline: false
    },
    {
      id: 3,
      participantName: "Event Coordinator Sarah",
      participantRole: "Event Host",
      lastMessage: "The sunset cocktail cruise event details are ready",
      lastMessageTime: "4h ago",
      unreadCount: 1,
      isOnline: true
    },
    {
      id: 4,
      participantName: "Concierge Service",
      participantRole: "Support",
      lastMessage: "How can we assist you with your yacht club experience?",
      lastMessageTime: "1d ago",
      unreadCount: 0,
      isOnline: true
    }
  ];

  const mockMessages = [
    {
      id: 1,
      senderId: 101,
      content: "Hello! Thank you for your interest in our yacht services.",
      timestamp: "2:30 PM",
      isOwn: false
    },
    {
      id: 2,
      senderId: user?.id || 1,
      content: "I'm interested in booking the Marina Breeze for next weekend.",
      timestamp: "2:45 PM",
      isOwn: true
    },
    {
      id: 3,
      senderId: 101,
      content: "Perfect! I have availability for Saturday and Sunday. What time would work best for you?",
      timestamp: "3:00 PM",
      isOwn: false
    },
    {
      id: 4,
      senderId: 101,
      content: "Your booking for Marina Breeze is confirmed for next week!",
      timestamp: "3:15 PM",
      isOwn: false
    }
  ];

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    setMessageText('');
  };

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="min-h-screen bg-black text-white pb-20">
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
            {conversations.map((conversation, index) => (
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
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                      <User size={20} className="text-white" />
                    </div>
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
                        {conversation.lastMessageTime}
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
              
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              
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
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 px-4 py-4 overflow-y-auto">
            <div className="space-y-4">
              {mockMessages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.isOwn
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                        : "bg-gray-800 text-white"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs opacity-70">
                        {message.timestamp}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

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
  );
}