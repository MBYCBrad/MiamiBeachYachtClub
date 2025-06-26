import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, User, Clock, ChevronRight, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface StaffMessage {
  id: number;
  content: string;
  sender_id: number;
  created_at: string;
  read_at: string | null;
  sender_name: string;
  sender_email: string;
}

interface StaffConversation {
  id: number;
  participant1_id: number;
  participant2_id: number;
  participant1_name: string;
  participant1_email: string;
  participant2_name: string;
  participant2_email: string;
  last_message: string;
  last_sender_id: number;
  last_message_at: string;
  created_at: string;
}

export default function StaffMessagesDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<StaffConversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  // Fetch staff conversations with real-time database integration
  const { data: staffConversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['/api/staff/conversations'],
    queryFn: async () => {
      const response = await fetch('/api/staff/conversations');
      if (!response.ok) {
        throw new Error('Failed to fetch staff conversations');
      }
      return response.json() as Promise<StaffConversation[]>;
    },
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
    staleTime: 5000,
  });

  // Fetch messages for selected conversation
  const { data: staffMessages, isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/staff/messages', selectedConversation?.id],
    queryFn: async () => {
      if (!selectedConversation) return [];
      const response = await fetch(`/api/staff/messages/${selectedConversation.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch staff messages');
      }
      return response.json() as Promise<StaffMessage[]>;
    },
    enabled: !!selectedConversation,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time messages
    staleTime: 2000,
  });

  const filteredConversations = staffConversations?.filter(conversation =>
    conversation.participant1_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.participant2_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.last_message?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await fetch('/api/staff/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: newMessage.trim()
        })
      });

      if (response.ok) {
        setNewMessage("");
        // Invalidate queries to refresh the data
        queryClient.invalidateQueries({ queryKey: ['/api/staff/messages', selectedConversation.id] });
        queryClient.invalidateQueries({ queryKey: ['/api/staff/conversations'] });
      }
    } catch (error) {
      console.error('Error sending staff message:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
      >
        <MessageSquare className="h-5 w-5 text-purple-400" />
        {staffConversations && staffConversations.length > 0 && (
          <div className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"></div>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            className="absolute top-full right-0 mt-2 w-96 bg-gray-950 border border-gray-700/50 rounded-lg shadow-xl z-50"
          >
            <div className="p-4 border-b border-gray-700/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">Staff Messages</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-900/50 border-gray-700/50 text-white"
              />
            </div>
            
            <ScrollArea className="h-80">
              {conversationsLoading ? (
                <div className="p-4 text-center text-gray-400">Loading conversations...</div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-gray-400">No conversations found</div>
              ) : (
                <div className="space-y-2 p-2">
                  {filteredConversations.map((conversation) => (
                    <motion.div
                      key={conversation.id}
                      whileHover={{ backgroundColor: 'rgba(75, 85, 99, 0.3)' }}
                      onClick={() => setSelectedConversation(conversation)}
                      className="p-3 rounded-lg cursor-pointer transition-colors border border-gray-700/30"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {conversation.participant1_name} ↔ {conversation.participant2_name}
                            </p>
                            <p className="text-xs text-gray-400 truncate mt-1">
                              {conversation.last_message || 'No messages yet'}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Clock className="h-3 w-3 text-gray-500" />
                              <span className="text-xs text-gray-500">
                                {conversation.last_message_at ? formatTimeAgo(conversation.last_message_at) : 'No activity'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedConversation} onOpenChange={() => setSelectedConversation(null)}>
        <DialogContent className="bg-gray-950 border-gray-700/50 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              Conversation: {selectedConversation?.participant1_name} ↔ {selectedConversation?.participant2_name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <ScrollArea className="h-96 border border-gray-700/50 rounded-lg p-4">
              {messagesLoading ? (
                <div className="text-center text-gray-400">Loading messages...</div>
              ) : staffMessages && staffMessages.length > 0 ? (
                <div className="space-y-3">
                  {staffMessages.map((message) => (
                    <div key={message.id} className="flex flex-col space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-purple-400">
                          {message.sender_name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(message.created_at)}
                        </span>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/30">
                        <p className="text-white text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400">No messages in this conversation</div>
              )}
            </ScrollArea>
            
            <div className="flex space-x-2">
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="bg-gray-900/50 border-gray-700/50 text-white resize-none"
                rows={2}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}