import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useMessages } from "@/hooks/use-messages";
import { useAuth } from "@/hooks/use-auth";
import { Send, Phone, MessageCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Message } from "@shared/schema";

interface MessageInterfaceProps {
  conversationId?: string;
  recipientId?: number;
  recipientName?: string;
  className?: string;
}

export function MessageInterface({ 
  conversationId, 
  recipientId, 
  recipientName = "Concierge",
  className = "" 
}: MessageInterfaceProps) {
  const { user } = useAuth();
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const activeConversationId = conversationId || `user_${user?.id}_concierge`;
  
  const { 
    messages, 
    sendMessage, 
    markAsRead, 
    isSending, 
    isLoadingMessages 
  } = useMessages(activeConversationId);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark unread messages as read
  useEffect(() => {
    if (messages.length > 0 && user) {
      const unreadMessages = messages.filter(
        msg => msg.recipientId === user.id && msg.status === 'sent'
      );
      
      unreadMessages.forEach(msg => {
        markAsRead(msg.id).catch(() => {}); // Silent fail for UX
      });
    }
  }, [messages, user, markAsRead]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !user) return;

    try {
      await sendMessage({
        conversationId: activeConversationId,
        recipientId: recipientId || null,
        content: messageText.trim(),
        messageType: "text",
        status: "sent",
        metadata: {
          yachtId: null,
          serviceId: null,
          bookingId: null,
          phoneNumber: user.phone,
          smsStatus: "pending"
        }
      });
      
      setMessageText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageAlignment = (message: Message) => {
    return message.senderId === user?.id ? "justify-end" : "justify-start";
  };

  const getMessageBubbleClass = (message: Message) => {
    return message.senderId === user?.id
      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white ml-12"
      : "bg-gray-100 dark:bg-gray-800 mr-12";
  };

  if (isLoadingMessages) {
    return (
      <Card className={`h-full ${className}`}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
            <p className="text-sm text-gray-500">Loading messages...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <CardTitle className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              {recipientName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">{recipientName}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <MessageCircle className="h-3 w-3" />
              <span>Miami Beach Yacht Club Concierge</span>
            </div>
          </div>
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            <div className="h-2 w-2 bg-green-500 rounded-full mr-1 animate-pulse" />
            Online
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Welcome to Concierge Services
                </h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  Our premium concierge team is here 24/7 to assist with your yacht club experience. 
                  Send a message to get started.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`flex ${getMessageAlignment(message)}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${getMessageBubbleClass(message)}`}>
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    <div className={`flex items-center justify-end mt-2 space-x-1 text-xs ${
                      message.senderId === user?.id ? "text-purple-100" : "text-gray-500"
                    }`}>
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(message.createdAt!), { addSuffix: true })}
                      </span>
                      {message.senderId === user?.id && (
                        <Badge 
                          variant="outline" 
                          className={`ml-2 text-xs ${
                            message.status === 'read' 
                              ? 'bg-green-100 text-green-800 border-green-300' 
                              : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                          }`}
                        >
                          {message.status === 'read' ? 'Read' : 'Sent'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <div className="border-t p-4 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex space-x-2">
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message to the concierge..."
              className="flex-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-purple-500 focus:border-purple-500"
              disabled={isSending}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={isSending || !messageText.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6"
            >
              {isSending ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 flex items-center">
            <MessageCircle className="h-3 w-3 mr-1" />
            Messages are monitored 24/7 and typically responded to within 15 minutes
          </p>
        </div>
      </CardContent>
    </Card>
  );
}