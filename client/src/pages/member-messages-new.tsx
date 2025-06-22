import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MessageInterface } from '@/components/message-interface';
import { useConversations } from '@/hooks/use-messages';
import { useAuth } from '@/hooks/use-auth';
import { 
  MessageCircle, 
  Phone, 
  Video,
  Search,
  Plus,
  Clock,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface MemberMessagesProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function MemberMessagesNew({ currentView, setCurrentView }: MemberMessagesProps) {
  const { user } = useAuth();
  const { conversations, isLoading } = useConversations();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter conversations based on search
  const filteredConversations = conversations.filter((conv: any) =>
    conv.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.conversationId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewConversation = () => {
    // Start a new conversation with concierge
    const conciergeConversationId = `user_${user?.id}_concierge`;
    setSelectedConversation(conciergeConversationId);
  };

  const getConversationName = (conversationId: string) => {
    if (conversationId.includes('concierge')) {
      return 'MBYC Concierge';
    }
    return 'Support Team';
  };

  const getConversationRole = (conversationId: string) => {
    if (conversationId.includes('concierge')) {
      return 'Premium Concierge Service';
    }
    return 'Customer Support';
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
          <p className="text-sm text-gray-500">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (selectedConversation) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="h-full flex flex-col">
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setSelectedConversation(null)}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                ← Back to Messages
              </Button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {getConversationName(selectedConversation)}
              </h1>
              <div className="w-20" /> {/* Spacer for centering */}
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
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
            <Button
              onClick={handleNewConversation}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No conversations yet
              </h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Start your first conversation with our premium concierge service. We're here 24/7 to assist with your yacht club experience.
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
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500 hover:border-l-purple-600"
                    onClick={() => setSelectedConversation(conversation.conversationId)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12 ring-2 ring-purple-100 dark:ring-purple-900">
                          <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-semibold">
                            {getConversationName(conversation.conversationId).charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                              {getConversationName(conversation.conversationId)}
                            </h3>
                            <div className="flex items-center space-x-2">
                              {conversation.unreadCount > 0 && (
                                <Badge className="bg-purple-600 text-white">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <div className="h-2 w-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                                Online
                              </Badge>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-500 mb-1">
                            {getConversationRole(conversation.conversationId)}
                          </p>
                          
                          {conversation.lastMessage && (
                            <>
                              <p className="text-sm text-gray-700 dark:text-gray-300 truncate mb-2">
                                {conversation.lastMessage.content}
                              </p>
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-center space-y-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                          >
                            <Video className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>24/7 Concierge Support</span>
            </div>
            <div className="flex items-center space-x-1">
              <Phone className="h-4 w-4" />
              <span>+1 (305) 555-MBYC</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>Premium Member Services</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}