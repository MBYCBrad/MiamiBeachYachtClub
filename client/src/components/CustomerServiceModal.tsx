import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, MessageCircle, HeadphonesIcon, Send, PhoneCall, PhoneOff, Mic, MicOff, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface CustomerServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CallState {
  isActive: boolean;
  isMuted: boolean;
  duration: number;
  callSid?: string;
  callStatus: 'connecting' | 'ringing' | 'in-progress' | 'ended';
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  type: 'text' | 'system';
}

export default function CustomerServiceModal({ isOpen, onClose }: CustomerServiceModalProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'call' | 'help'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [callState, setCallState] = useState<CallState>({
    isActive: false,
    isMuted: false,
    duration: 0,
    callStatus: 'ended'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Call timer
  useEffect(() => {
    if (callState.isActive && callState.callStatus === 'in-progress') {
      callTimerRef.current = setInterval(() => {
        setCallState(prev => ({
          ...prev,
          duration: prev.duration + 1
        }));
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [callState.isActive, callState.callStatus]);

  // Initialize chat on open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        text: `Hello ${user?.username}! I'm here to help you with any questions about your yacht club experience. How can I assist you today?`,
        sender: 'agent',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, user?.username, messages.length]);

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsAgentTyping(true);

    try {
      // Simulate agent response delay
      setTimeout(() => {
        const agentResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "Thank you for your message. A member of our concierge team will respond shortly. In the meantime, you can also call us directly for immediate assistance.",
          sender: 'agent',
          timestamp: new Date(),
          type: 'text'
        };
        setMessages(prev => [...prev, agentResponse]);
        setIsAgentTyping(false);
      }, 2000);
    } catch (error) {
      setIsAgentTyping(false);
      toast({
        title: "Message Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStartCall = async () => {
    setIsLoading(true);
    setCallState({
      isActive: true,
      isMuted: false,
      duration: 0,
      callStatus: 'connecting'
    });

    try {
      // Simulate call initiation
      setTimeout(() => {
        setCallState(prev => ({ ...prev, callStatus: 'ringing' }));
      }, 1000);

      setTimeout(() => {
        setCallState(prev => ({ ...prev, callStatus: 'in-progress' }));
        setIsLoading(false);
      }, 3000);

      toast({
        title: "Connecting Call",
        description: "Connecting you to our concierge team...",
      });
    } catch (error) {
      setIsLoading(false);
      setCallState({
        isActive: false,
        isMuted: false,
        duration: 0,
        callStatus: 'ended'
      });
      toast({
        title: "Call Failed",
        description: "Unable to connect call. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEndCall = () => {
    setCallState({
      isActive: false,
      isMuted: false,
      duration: 0,
      callStatus: 'ended'
    });
    toast({
      title: "Call Ended",
      description: "Thank you for calling Miami Beach Yacht Club.",
    });
  };

  const toggleMute = () => {
    setCallState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  };

  const helpTopics = [
    { title: "Yacht Bookings", description: "Help with reservations and availability" },
    { title: "Concierge Services", description: "Assistance with premium services" },
    { title: "Membership Benefits", description: "Information about your tier benefits" },
    { title: "Event Registration", description: "Help with upcoming events" },
    { title: "Billing & Payments", description: "Account and payment questions" },
    { title: "Technical Support", description: "App and website assistance" }
  ];

  const renderChatTab = () => (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <HeadphonesIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Concierge Chat</h3>
            <p className="text-gray-400 text-sm">Available 24/7</p>
          </div>
          <Badge className="ml-auto bg-green-500/20 text-green-400 border-green-500/30">
            Online
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                  : 'bg-gray-700/50 text-gray-100'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className={`text-xs mt-1 opacity-70`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </motion.div>
        ))}
        
        {isAgentTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gray-700/50 text-gray-100 p-3 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-700/50">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderCallTab = () => (
    <div className="flex flex-col h-full">
      {/* Call Header */}
      <div className="p-6 text-center">
        <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <HeadphonesIcon className="h-12 w-12 text-white" />
        </div>
        <h3 className="text-white text-xl font-semibold mb-2">Concierge Support</h3>
        <p className="text-gray-400">Available 24/7 for all members</p>
      </div>

      {/* Call Status */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {!callState.isActive ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <Button
              onClick={handleStartCall}
              disabled={isLoading}
              className="w-20 h-20 rounded-full bg-green-500 hover:bg-green-600 text-white mb-4"
            >
              <PhoneCall className="h-8 w-8" />
            </Button>
            <p className="text-white text-lg font-medium">Call Concierge</p>
            <p className="text-gray-400 text-sm mt-2">
              Connect instantly with our team
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center w-full"
          >
            <div className="mb-6">
              <p className="text-white text-xl font-semibold capitalize">
                {callState.callStatus.replace('-', ' ')}
              </p>
              {callState.callStatus === 'in-progress' && (
                <p className="text-gray-400 text-lg mt-2">
                  {formatCallDuration(callState.duration)}
                </p>
              )}
            </div>

            {/* Call Controls */}
            <div className="flex justify-center space-x-6">
              <Button
                onClick={toggleMute}
                className={`w-14 h-14 rounded-full ${
                  callState.isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {callState.isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>
              
              <Button
                onClick={handleEndCall}
                className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600"
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
              
              <Button className="w-14 h-14 rounded-full bg-gray-600 hover:bg-gray-700">
                <Volume2 className="h-6 w-6" />
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );

  const renderHelpTab = () => (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-white text-xl font-semibold mb-2">How can we help?</h3>
        <p className="text-gray-400">Choose a topic or start a conversation</p>
      </div>

      <div className="space-y-3">
        {helpTopics.map((topic, index) => (
          <motion.button
            key={topic.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => {
              setActiveTab('chat');
              const helpMessage: Message = {
                id: Date.now().toString(),
                text: `I need help with: ${topic.title}`,
                sender: 'user',
                timestamp: new Date(),
                type: 'text'
              };
              setMessages(prev => [...prev, helpMessage]);
            }}
            className="w-full p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-200 text-left group"
          >
            <h4 className="text-white font-medium group-hover:text-purple-400 transition-colors">
              {topic.title}
            </h4>
            <p className="text-gray-400 text-sm mt-1">{topic.description}</p>
          </motion.button>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20">
        <h4 className="text-white font-medium mb-2">Emergency Support</h4>
        <p className="text-gray-400 text-sm mb-3">
          For urgent yacht-related emergencies, call our 24/7 hotline
        </p>
        <Button
          onClick={() => setActiveTab('call')}
          className="w-full bg-red-500 hover:bg-red-600 text-white"
        >
          <Phone className="h-4 w-4 mr-2" />
          Emergency Call
        </Button>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md h-[600px] bg-gray-900/95 backdrop-blur-xl rounded-t-3xl border border-gray-700/50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
              <h2 className="text-white text-lg font-semibold">Customer Service</h2>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-gray-700/50"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Tab Navigation */}
            <div className="flex bg-gray-800/50">
              {[
                { id: 'chat', label: 'Chat', icon: MessageCircle },
                { id: 'call', label: 'Call', icon: Phone },
                { id: 'help', label: 'Help', icon: HeadphonesIcon },
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 p-3 flex items-center justify-center space-x-2 transition-colors ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border-b-2 border-purple-500'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'chat' && renderChatTab()}
              {activeTab === 'call' && renderCallTab()}
              {activeTab === 'help' && renderHelpTab()}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}