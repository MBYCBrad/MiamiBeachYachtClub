import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useMessages } from "@/hooks/use-messages";
import { useAuth } from "@/hooks/use-auth";
import { useMessageWebSocket } from "@/hooks/use-message-websocket";
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
  recipientName = "MBYC Admin",
  className = "" 
}: MessageInterfaceProps) {
  const { user } = useAuth();
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize real-time message WebSocket
  useMessageWebSocket();
  
  const activeConversationId = conversationId || `user_${user?.id}_admin`;
  
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
        (msg: any) => msg.recipientId === user.id && msg.status === 'sent'
      );
      unreadMessages.forEach((msg: any) => {
        markAsRead(msg.id);
      });
    }
  }, [messages, user, markAsRead]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || isSending) return;
    
    try {
      await sendMessage({
        content: messageText,
        messageType: "text",
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
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{recipientName}</h3>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-400 dark:border-green-700">
                  <div className="h-2 w-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                  Online
                </Badge>
                <Button variant="outline" size="sm" className="text-purple-600 border-purple-200 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-600 dark:hover:bg-purple-900">
                  <Phone className="h-4 w-4 mr-1" />
                  Call
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">MBYC Administration</p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <MessageCircle className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Start the conversation</h3>
              <p className="text-gray-500 mb-6 max-w-sm">
                Send a message to begin your conversation with {recipientName}. We're here to help with any questions about your yacht club experience.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message: any, index: number) => (
                <div key={message.id || index} className={`flex ${getMessageAlignment(message)}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${getMessageBubbleClass(message)}`}>
                    <p className="text-sm">{message.content}</p>
                    <div className="flex items-center justify-end space-x-1 mt-1">
                      <Clock className="h-3 w-3 opacity-70" />
                      <span className="text-xs opacity-70">
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </CardContent>

      <div className="border-t p-4">
        <div className="flex space-x-2">
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1"
            disabled={isSending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || isSending}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            {isSending ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}