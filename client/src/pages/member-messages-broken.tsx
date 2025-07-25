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
  const { conversations, isLoading, error } = useConversations();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");



  // Fetch active hero video
  const { data: heroVideo } = useQuery<any>({
    queryKey: ['/api/media/hero/active'],
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  // Create safe conversation list with error handling
  const filteredConversations = React.useMemo(() => {
    console.log('Raw conversations data:', conversations);
    
    if (!conversations || !Array.isArray(conversations)) {
      console.log('No valid conversations array, returning empty list');
      return [];
    }
    
    try {
      return conversations.filter((conv: any) => {
        // Basic safety checks
        if (!conv || typeof conv !== 'object') {
          console.log('Skipping invalid conversation:', conv);
          return false;
        }
        
        // Search filtering if needed
        if (searchQuery && searchQuery.trim()) {
          try {
            const searchLower = searchQuery.toLowerCase();
            const conversationId = String(conv.id || conv.conversationId || '');
            const conversationName = getConversationName(conversationId);
            
            return conversationName.toLowerCase().includes(searchLower) ||
                   conversationId.toLowerCase().includes(searchLower);
          } catch (error) {
            console.error('Error during search filtering:', error);
            return false;
          }
        }
        
        return true;
      });
    } catch (error) {
      console.error('Error filtering conversations:', error);
      return [];
    }
  }, [conversations, searchQuery]);

  const handleNewConversation = () => {
    const adminConversationId = `user_${user?.id}_admin`;
    setSelectedConversation(adminConversationId);
  };

  const getConversationName = (conversationId: string | null | undefined) => {
    if (!conversationId || typeof conversationId !== 'string') return 'Customer Support';
    
    if (conversationId.includes('_admin')) {
      return 'MBYC Admin';
    } else if (conversationId.includes('_concierge')) {
      return 'MBYC Concierge';
    } else if (conversationId.includes('_support')) {
      return 'Customer Support';
    }
    return 'Customer Support';
  };

  const getConversationRole = (conversationId: string | null | undefined) => {
    if (!conversationId || typeof conversationId !== 'string') return 'Customer Support';
    
    if (conversationId.includes('_admin')) {
      return 'Club Administrator';
    } else if (conversationId.includes('_concierge')) {
      return 'Premium Concierge Service';
    } else if (conversationId.includes('_support')) {
      return 'Customer Support';
    }
    return 'Customer Support';
  };

  if (isLoading || !conversations) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
          <p className="text-sm text-gray-400">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error loading conversations</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            Retry
          </Button>
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
            className="mt-8 flex space-x-8 text-center"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
              <div className="text-2xl font-bold text-white">{filteredConversations?.length || 0}</div>
              <div className="text-sm text-gray-300">Active Conversations</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-sm text-gray-300">Support Available</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Search and New Message Controls */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 relative mr-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800/80 backdrop-blur-sm border-gray-700 text-white placeholder-gray-400"
            />
          </div>
          <Button
            onClick={handleNewConversation}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="px-4">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              Ready to connect with MBYC
            </h3>
            <p className="text-gray-400 mb-6 max-w-sm mx-auto">
              Start your conversation with MBYC Admin. We're here 24/7 to assist with your yacht club experience.
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
            {filteredConversations.map((conversation: any, index: number) => {
              // Ultra-safe conversation rendering
              try {
                if (!conversation || typeof conversation !== 'object') {
                  return null;
                }
                
                const conversationId = String(conversation.id || conversation.conversationId || `conv-${index}`);
                const conversationName = conversationId.includes('admin') ? 'MBYC Admin' : 'Support Team';
                const conversationRole = conversationId.includes('admin') ? 'Administration' : 'Customer Support';
                
                return (
                  <motion.div
                    key={`safe-${conversationId}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500 hover:border-l-purple-600 bg-gray-900/90 backdrop-blur-sm border-gray-800"
                      onClick={() => {
                        try {
                          setSelectedConversation(conversationId);
                        } catch (error) {
                          console.error('Click error:', error);
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-12 w-12 ring-2 ring-purple-500">
                            <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-semibold">
                              {conversationName.charAt(0) || 'C'}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-white truncate">
                                {conversationName}
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
                              {conversationRole}
                            </p>
                            
                            {conversation.lastMessage && conversation.lastMessage.content && (
                              <>
                                <p className="text-sm text-gray-300 truncate mb-2">
                                  {String(conversation.lastMessage.content)}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-gray-400">
                              <Clock className="h-3 w-3" />
                              <span>
                                {(() => {
                                  try {
                                    const date = new Date(conversation.lastMessage.createdAt);
                                    if (isNaN(date.getTime())) {
                                      return 'Recently';
                                    }
                                    return formatDistanceToNow(date, { addSuffix: true });
                                  } catch (error) {
                                    return 'Recently';
                                  }
                                })()}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
                );
              } catch (renderError) {
                console.error('Error rendering conversation:', renderError, conversation);
                return null;
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
}