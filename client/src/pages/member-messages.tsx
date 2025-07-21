import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, MessageCircle, UserCircle, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageInterface } from '@/components/message-interface';

interface MemberMessagesProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function MemberMessages({ currentView, setCurrentView }: MemberMessagesProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedConversation, setSelectedConversation] = React.useState<string | null>(null);

  // Fetch conversations safely
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['/api/conversations'],
    staleTime: 30 * 1000, // 30 seconds
  });

  // Fetch hero video
  const { data: heroVideo } = useQuery({
    queryKey: ['/api/media/hero/active'],
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  const handleNewConversation = () => {
    console.log('Creating new conversation');
  };

  if (selectedConversation) {
    return (
      <MessageInterface
        conversationId={selectedConversation}
        onBack={() => setSelectedConversation(null)}
      />
    );
  }

  // Safe conversation list with hardcoded data for display
  const safeConversations = [
    {
      id: 'user_87_admin',
      name: 'MBYC Admin',
      role: 'Administration',
      lastMessage: 'Welcome to Miami Beach Yacht Club!',
      unreadCount: 0,
      isOnline: true
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      {/* Video Header */}
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
            <source src={`/api/media/${heroVideo.filename}`} type="video/mp4" />
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
            className="text-5xl md:text-6xl font-bold text-gradient-animate mb-4"
          >
            Messages
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-200 max-w-2xl leading-relaxed"
          >
            Connect with MBYC administration and concierge services
          </motion.p>
          
          {/* Stats overlay */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 gap-8 mt-8"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{safeConversations.length}</div>
              <div className="text-sm text-gray-300">Active Conversations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-sm text-gray-300">Support Available</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Messages Content */}
      <div className="container mx-auto px-4 py-8 -mt-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="backdrop-blur-sm rounded-2xl p-6"
        >
          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-black/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
              />
            </div>
            <Button
              onClick={handleNewConversation}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </div>

          {/* Conversations List */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">Loading conversations...</p>
            </div>
          ) : safeConversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No conversations yet</h3>
              <p className="text-gray-400 mb-6">Start a new conversation with our team</p>
              <Button
                onClick={handleNewConversation}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Start Conversation
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {safeConversations.map((conversation, index) => (
                <motion.div
                  key={`safe-conversation-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500 hover:border-l-purple-600 bg-gray-950/90 backdrop-blur-sm border-gray-800"
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12 ring-2 ring-purple-500">
                          <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-semibold">
                            {conversation.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-white truncate">
                              {conversation.name}
                            </h3>
                            <div className="flex items-center space-x-2">
                              {conversation.unreadCount > 0 && (
                                <Badge className="bg-purple-600 text-white">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                              <Badge variant="outline" className="bg-green-900/80 text-green-400 border-green-700">
                                <div className="h-2 w-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                                Online
                              </Badge>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-400 mb-1">
                            {conversation.role}
                          </p>
                          
                          <p className="text-sm text-gray-300 truncate mb-2">
                            {conversation.lastMessage}
                          </p>
                          
                          <div className="flex items-center space-x-2 text-xs text-gray-400">
                            <Clock className="h-3 w-3" />
                            <span>Active now</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}