import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  MessageCircle, 
  Phone, 
  Video,
  Search,
  MoreVertical,
  PhoneCall,
  Clock,
  Star,
  Send,
  Paperclip,
  Smile
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { MediaAsset } from '@shared/schema';

interface Message {
  id: number;
  name: string;
  role: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
  avatar: string;
  phone?: string;
}

interface MemberMessagesProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

const conversations: Message[] = [
  {
    id: 1,
    name: "Captain Rodriguez",
    role: "Yacht Captain",
    lastMessage: "Marina Breeze is ready for your booking tomorrow",
    timestamp: "2m ago",
    unread: 2,
    online: true,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    phone: "+1 (305) 555-0123"
  },
  {
    id: 2,
    name: "MBYC Concierge",
    role: "Premium Support",
    lastMessage: "Your VIP event tickets are confirmed",
    timestamp: "1h ago",
    unread: 1,
    online: true,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    phone: "+1 (305) 555-0100"
  },
  {
    id: 3,
    name: "Chef Martinez",
    role: "Executive Chef",
    lastMessage: "Menu selections look perfect for your event",
    timestamp: "3h ago",
    unread: 0,
    online: false,
    avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=150&h=150&fit=crop&crop=face",
    phone: "+1 (305) 555-0145"
  },
  {
    id: 4,
    name: "Marina Operations",
    role: "Dock Master",
    lastMessage: "Slip 12 is reserved for your arrival",
    timestamp: "5h ago",
    unread: 0,
    online: true,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    phone: "+1 (305) 555-0167"
  },
  {
    id: 5,
    name: "Event Coordinator",
    role: "Sarah Johnson",
    lastMessage: "Sunset cruise details attached",
    timestamp: "1d ago",
    unread: 0,
    online: false,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    phone: "+1 (305) 555-0189"
  }
];

export default function MemberMessages({ currentView, setCurrentView }: MemberMessagesProps) {
  const [selectedConversation, setSelectedConversation] = useState<Message | null>(null);
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [callType, setCallType] = useState<'voice' | 'video'>('voice');
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const { data: heroVideo } = useQuery<MediaAsset>({
    queryKey: ['/api/media/hero/active']
  });

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCall = (conversation: Message, type: 'voice' | 'video') => {
    setSelectedConversation(conversation);
    setCallType(type);
    setShowCallDialog(true);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    // Handle sending message
    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-auto pb-20">
      {/* Video Cover Header */}
      <div className="relative h-96 overflow-hidden">
        {/* Hero Video Background */}
        {heroVideo && (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={heroVideo.url} type="video/mp4" />
          </video>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/90" />

        {/* Header Content */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent mb-4"
            style={{
              textShadow: '0 0 30px rgba(96, 165, 250, 0.8), 0 0 60px rgba(147, 51, 234, 0.6), 0 0 90px rgba(59, 130, 246, 0.4)',
              filter: 'drop-shadow(0 0 20px rgba(96, 165, 250, 0.9)) drop-shadow(0 0 40px rgba(147, 51, 234, 0.7))'
            }}
          >
            Messages
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-200 max-w-2xl leading-relaxed"
          >
            Connect with yacht owners, service providers, and concierge
          </motion.p>
          
          {/* Stats overlay */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 flex space-x-6 text-center"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
              <div className="text-2xl font-bold text-white">{conversations.filter(c => c.unread > 0).length}</div>
              <div className="text-sm text-gray-300">Unread</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
              <div className="text-2xl font-bold text-white">{conversations.filter(c => c.online).length}</div>
              <div className="text-sm text-gray-300">Online</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
              <div className="text-2xl font-bold text-white">{conversations.length}</div>
              <div className="text-sm text-gray-300">Total</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder-gray-400 rounded-xl focus:border-purple-500 transition-all duration-300"
            />
          </div>
        </div>
      </motion.div>

      {!selectedConversation ? (
        /* Conversations List */
        <div className="px-6 py-4 space-y-3">
          <AnimatePresence>
            {filteredConversations.map((conversation, index) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ x: 4 }}
                onClick={() => setSelectedConversation(conversation)}
                className="cursor-pointer"
              >
                <Card className="bg-gray-900/50 border-gray-700/50 hover:bg-gray-800/50 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Avatar with Online Status */}
                      <div className="relative">
                        <Avatar className="h-14 w-14">
                          <AvatarImage src={conversation.avatar} />
                          <AvatarFallback className="bg-purple-600 text-white">
                            {conversation.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.online && (
                          <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-black rounded-full" />
                        )}
                      </div>

                      {/* Message Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-white truncate">
                            {conversation.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                              {conversation.timestamp}
                            </span>
                            {conversation.unread > 0 && (
                              <Badge className="bg-purple-600 text-white h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs">
                                {conversation.unread}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-400 mb-1">{conversation.role}</p>
                        <p className="text-sm text-gray-300 truncate">
                          {conversation.lastMessage}
                        </p>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCall(conversation, 'voice');
                          }}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-green-400 hover:bg-green-400/10 rounded-full"
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCall(conversation, 'video');
                          }}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-full"
                        >
                          <Video className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* Chat View */
        <div className="flex flex-col h-screen">
          {/* Chat Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 py-4 bg-gray-900/50 border-b border-gray-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedConversation(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ←
                </Button>
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedConversation.avatar} />
                    <AvatarFallback className="bg-purple-600 text-white text-sm">
                      {selectedConversation.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {selectedConversation.online && (
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-black rounded-full" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{selectedConversation.name}</h3>
                  <p className="text-xs text-gray-400">
                    {selectedConversation.online ? 'Online' : 'Last seen 2h ago'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCall(selectedConversation, 'voice')}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-green-400 hover:bg-green-400/10 rounded-full"
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCall(selectedConversation, 'video')}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-full"
                >
                  <Video className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Messages Area */}
          <div className="flex-1 px-6 py-4 space-y-4 overflow-y-auto">
            {/* Sample Messages */}
            <div className="flex justify-start">
              <div className="max-w-[80%] bg-gray-800 rounded-2xl rounded-bl-md px-4 py-2">
                <p className="text-white text-sm">{selectedConversation.lastMessage}</p>
                <span className="text-xs text-gray-400 mt-1 block">{selectedConversation.timestamp}</span>
              </div>
            </div>
            
            <div className="flex justify-end">
              <div className="max-w-[80%] bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl rounded-br-md px-4 py-2">
                <p className="text-white text-sm">Thank you! Looking forward to it.</p>
                <span className="text-xs text-purple-200 mt-1 block">Just now</span>
              </div>
            </div>
          </div>

          {/* Message Input */}
          <div className="px-6 py-4 bg-gray-900/50 border-t border-gray-800">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-white rounded-full"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              
              <div className="flex-1 relative">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-full pr-10"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-white rounded-full"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </div>
              
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="h-8 w-8 p-0 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-full"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Call Dialog */}
      <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">
              {callType === 'voice' ? 'Voice Call' : 'Video Call'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedConversation && (
            <div className="text-center space-y-6 py-8">
              <div className="relative mx-auto w-24 h-24">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={selectedConversation.avatar} />
                  <AvatarFallback className="bg-purple-600 text-white text-2xl">
                    {selectedConversation.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 border-4 border-green-500 rounded-full"
                />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white">{selectedConversation.name}</h3>
                <p className="text-gray-400">{selectedConversation.role}</p>
                <p className="text-sm text-gray-500 mt-1">{selectedConversation.phone}</p>
              </div>
              
              <div className="flex items-center justify-center gap-1 text-gray-400">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Connecting...</span>
              </div>
              
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => setShowCallDialog(false)}
                  className="bg-red-600 hover:bg-red-700 rounded-full h-12 w-12 p-0"
                >
                  <PhoneCall className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}