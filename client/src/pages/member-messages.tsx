import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MessageInterface } from '@/components/message-interface';
import { useConversations } from '@/hooks/use-messages';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { 
  MessageCircle, 
  Phone, 
  Video,
  Search,
  Plus,
  Clock,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface MemberMessagesProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function MemberMessages({ currentView, setCurrentView }: MemberMessagesProps) {
  const { user } = useAuth();
  const { conversations, isLoading } = useConversations();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch active hero video
  const { data: heroVideo } = useQuery({
    queryKey: ['/api/media/hero/active'],
    staleTime: 15 * 60 * 1000, // 15 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
  });

  const filteredConversations = conversations?.filter(conv => 
    conv.conversationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.conversationId.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleNewConversation = () => {
    const adminConversationId = `user_${user?.id}_admin`;
    setSelectedConversation(adminConversationId);
  };

  const getConversationName = (conversationId: string) => {
    if (conversationId.includes('_admin')) {
      return 'MBYC Admin';
    } else if (conversationId.includes('_concierge')) {
      return 'MBYC Concierge';
    } else if (conversationId.includes('_support')) {
      return 'Customer Support';
    }
    return 'Customer Support';
  };

  const getConversationRole = (conversationId: string) => {
    if (conversationId.includes('_admin')) {
      return 'Club Administrator';
    } else if (conversationId.includes('_concierge')) {
      return 'Premium Concierge Service';
    } else if (conversationId.includes('_support')) {
      return 'Customer Support';
    }
    return 'Customer Support';
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
          <p className="text-sm text-gray-400">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (selectedConversation) {
    return (
      <div className="h-screen bg-black">
        <div className="h-full flex flex-col">
          <div className="bg-gray-900 border-b border-gray-800 p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setSelectedConversation(null)}
                className="text-gray-400 hover:text-white"
              >
                ← Back to Messages
              </Button>
              <h1 className="text-xl font-semibold text-white">
                {getConversationName(selectedConversation)}
              </h1>
              <div className="w-20" />
            </div>
          </div>
          
          <div className="flex-1 p-4">
            <MessageInterface
              conversationId={selectedConversation}
              recipientName={getConversationName(selectedConversation)}
              className="h-full"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black relative overflow-hidden">
      {/* Video Background Header */}
      {heroVideo && (
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.3)' }}
          >
            <source src={`/api/media/${heroVideo.filename}`} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />
        </div>
      )}

      {/* Floating particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full opacity-30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
      
      <div className="h-full flex flex-col relative z-20">
        <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">Messages</h1>
            <Button
              onClick={handleNewConversation}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800/80 backdrop-blur-sm border-gray-700 text-white placeholder-gray-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                No conversations yet
              </h3>
              <p className="text-gray-400 mb-6 max-w-sm mx-auto">
                Start your first conversation with MBYC Admin. We're here 24/7 to assist with your yacht club experience.
              </p>
              <Button
                onClick={handleNewConversation}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Start Conversation
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredConversations.map((conversation: any, index: number) => (
                <motion.div
                  key={conversation.conversationId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500 hover:border-l-purple-600 bg-gray-900/90 backdrop-blur-sm border-gray-800"
                    onClick={() => setSelectedConversation(conversation.conversationId)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12 ring-2 ring-purple-500">
                          <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-semibold">
                            {getConversationName(conversation.conversationId).charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-white truncate">
                              {getConversationName(conversation.conversationId)}
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
                            {getConversationRole(conversation.conversationId)}
                          </p>
                          
                          {conversation.lastMessage && (
                            <>
                              <p className="text-sm text-gray-300 truncate mb-2">
                                {conversation.lastMessage.content}
                              </p>
                              <div className="flex items-center space-x-2 text-xs text-gray-400">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}