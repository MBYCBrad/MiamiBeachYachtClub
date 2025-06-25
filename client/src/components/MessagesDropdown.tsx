import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Search, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';

interface Conversation {
  id: string;
  memberId: number;
  memberName: string;
  lastMessage: string;
  unreadCount: number;
  lastActivity: string;
  status: 'active' | 'pending' | 'resolved';
  lastMessageTime: string;
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
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['/api/messages/conversations'],
    enabled: isOpen,
    staleTime: 30000, // 30 seconds
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/messages', selectedConversation],
    enabled: !!selectedConversation,
    staleTime: 10000, // 10 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { conversationId: string; content: string; senderId: number }) => {
      return apiRequest(`/api/messages`, {
        method: 'POST',
        body: JSON.stringify(messageData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages', selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/conversations'] });
      setNewMessage('');
    },
  });

  // Mark conversation as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      return apiRequest(`/api/messages/conversations/${conversationId}/read`, {
        method: 'PUT',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages/conversations'] });
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;
    
    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      content: newMessage.trim(),
      senderId: user.id,
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

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative text-white hover:bg-white/10 bg-gradient-to-br from-purple-500 to-blue-600 px-3 py-2 rounded-lg transition-all duration-200"
        >
          <MessageCircle className="h-4 w-4" />
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
              {totalUnread > 99 ? '99+' : totalUnread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-96 max-h-[80vh] overflow-hidden bg-gray-950 border border-purple-500/20 shadow-2xl"
        align="end"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-purple-500/20">
            <h3 className="text-lg font-semibold text-white">Messages</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">
                {conversations.length} conversations
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-purple-500/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-900 border-purple-500/30 text-white placeholder-gray-400 focus:border-purple-400"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {conversationsLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-purple-400">Loading conversations...</div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-gray-400">No conversations found</div>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredConversations.map((conversation: Conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => handleConversationSelect(conversation.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation === conversation.id
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600'
                        : 'hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-white truncate">
                            {conversation.memberName}
                          </div>
                          {conversation.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-400 truncate mt-1">
                          {conversation.lastMessage}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(conversation.lastMessageTime).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Conversation Messages */}
          {selectedConversation && (
            <div className="border-t border-purple-500/20 bg-gray-900">
              <div className="p-3 border-b border-purple-500/20">
                <div className="text-sm font-medium text-white">
                  Conversation with {filteredConversations.find(c => c.id === selectedConversation)?.memberName}
                </div>
              </div>
              
              <div className="max-h-60 overflow-y-auto p-3 space-y-2">
                {messagesLoading ? (
                  <div className="text-purple-400 text-sm">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-gray-400 text-sm">No messages yet</div>
                ) : (
                  messages.map((message: Message) => (
                    <div
                      key={message.id}
                      className={`p-2 rounded text-sm ${
                        message.senderId === user?.id
                          ? 'bg-purple-600 text-white ml-8'
                          : 'bg-gray-800 text-gray-200 mr-8'
                      }`}
                    >
                      <div>{message.content}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 border-t border-purple-500/20">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 bg-gray-800 border-purple-500/30 text-white placeholder-gray-400"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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