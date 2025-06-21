import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  Check, 
  X, 
  Clock, 
  Calendar, 
  Star, 
  MessageCircle, 
  CreditCard,
  Anchor,
  Trash2,
  Settings,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: number;
  type: 'booking' | 'payment' | 'message' | 'system' | 'reminder' | 'promotion';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  metadata?: any;
}

interface MemberNotificationsProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function MemberNotifications({ currentView, setCurrentView }: MemberNotificationsProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock real-time notifications data
  const mockNotifications: Notification[] = [
    {
      id: 1,
      type: 'booking',
      title: 'Booking Confirmed',
      message: 'Your yacht booking for Marina Breeze on June 25th has been confirmed. Captain Rodriguez is excited to welcome you aboard!',
      timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      read: false,
      priority: 'high',
      actionUrl: '/trips',
      metadata: { bookingId: 1, yachtName: 'Marina Breeze' }
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment Processed',
      message: 'Payment of $2,500 for your yacht charter has been successfully processed. Receipt sent to your email.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: false,
      priority: 'medium',
      actionUrl: '/trips',
      metadata: { amount: 2500, paymentId: 'pay_123' }
    },
    {
      id: 3,
      type: 'message',
      title: 'New Message from Chef Alessandro',
      message: 'Your private chef has sent you the finalized menu for tomorrow\'s dinner cruise. Please review and confirm.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: true,
      priority: 'medium',
      actionUrl: '/messages',
      metadata: { senderId: 102, senderName: 'Chef Alessandro' }
    },
    {
      id: 4,
      type: 'reminder',
      title: 'Yacht Departure Reminder',
      message: 'Your yacht charter departs in 24 hours from Marina Bay. Check-in begins at 2:00 PM. Weather forecast: Perfect sailing conditions!',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      read: true,
      priority: 'high',
      actionUrl: '/trips',
      metadata: { departureTime: '3:00 PM', location: 'Marina Bay' }
    },
    {
      id: 5,
      type: 'promotion',
      title: 'Exclusive Summer Package',
      message: 'Limited time offer: Save 25% on weekend yacht charters in July. Book your summer escape with premium amenities included.',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      read: false,
      priority: 'low',
      actionUrl: '/explore',
      metadata: { discount: 25, validUntil: '2025-07-31' }
    },
    {
      id: 6,
      type: 'system',
      title: 'Profile Verification Complete',
      message: 'Your Gold membership verification has been completed. You now have access to premium yachts and exclusive events.',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      read: true,
      priority: 'medium',
      actionUrl: '/profile',
      metadata: { membershipTier: 'gold' }
    },
    {
      id: 7,
      type: 'booking',
      title: 'Service Booking Request',
      message: 'Spa therapist Maria has accepted your massage booking for the yacht charter. Session scheduled for 4:00 PM on deck.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
      priority: 'medium',
      actionUrl: '/trips',
      metadata: { serviceType: 'spa', provider: 'Maria' }
    }
  ];

  useEffect(() => {
    setNotifications(mockNotifications);
    
    // Simulate real-time notifications
    const interval = setInterval(() => {
      const newNotification: Notification = {
        id: Date.now(),
        type: 'system',
        title: 'Real-time Update',
        message: `Live notification received at ${new Date().toLocaleTimeString()}`,
        timestamp: new Date(),
        read: false,
        priority: 'medium'
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      
      // Show toast for new notification
      toast({
        title: newNotification.title,
        description: newNotification.message,
        duration: 5000,
      });
    }, 30000); // New notification every 30 seconds
    
    return () => clearInterval(interval);
  }, [toast]);

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      return await apiRequest('PATCH', `/api/notifications/${notificationId}/read`);
    },
    onSuccess: (_, notificationId) => {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      return await apiRequest('DELETE', `/api/notifications/${notificationId}`);
    },
    onSuccess: (_, notificationId) => {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast({
        title: "Notification deleted",
        description: "The notification has been removed",
      });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('PATCH', '/api/notifications/mark-all-read');
    },
    onSuccess: () => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast({
        title: "All notifications marked as read",
        description: "Your notifications have been updated",
      });
    }
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking': return <Anchor size={20} className="text-blue-400" />;
      case 'payment': return <CreditCard size={20} className="text-green-400" />;
      case 'message': return <MessageCircle size={20} className="text-purple-400" />;
      case 'reminder': return <Clock size={20} className="text-yellow-400" />;
      case 'promotion': return <Star size={20} className="text-pink-400" />;
      case 'system': return <Settings size={20} className="text-gray-400" />;
      default: return <Bell size={20} className="text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-500/5';
      case 'high': return 'border-l-orange-500 bg-orange-500/5';
      case 'medium': return 'border-l-blue-500 bg-blue-500/5';
      case 'low': return 'border-l-gray-500 bg-gray-500/5';
      default: return 'border-l-gray-500 bg-gray-500/5';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.read;
    if (activeTab === 'important') return notification.priority === 'high' || notification.priority === 'urgent';
    return notification.type === activeTab;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }
    
    if (notification.actionUrl) {
      const route = notification.actionUrl.replace('/', '');
      if (route && route !== currentView) {
        setCurrentView(route);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <div className="pt-12 pb-6 px-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-gradient-animate mb-2"
            >
              Notifications
            </motion.h1>
            <p className="text-gray-300">
              {unreadCount} unread notifications
            </p>
          </div>
          
          {unreadCount > 0 && (
            <Button
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              size="sm"
              className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-600/30 rounded-xl"
            >
              <Check size={16} className="mr-2" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 rounded-xl">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg"
            >
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger 
              value="unread" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg relative"
            >
              Unread
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-red-500 text-white text-xs min-w-[20px] h-5">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="important" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg"
            >
              Important
            </TabsTrigger>
            <TabsTrigger 
              value="booking" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg"
            >
              Bookings
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell size={48} className="mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                  No notifications
                </h3>
                <p className="text-gray-500">
                  {activeTab === 'unread' ? 'All caught up!' : 'No notifications in this category'}
                </p>
              </div>
            ) : (
              <div className="px-4 space-y-3">
                <AnimatePresence>
                  {filteredNotifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        "bg-gray-900/50 border border-gray-800 rounded-xl p-4 cursor-pointer transition-all duration-200 border-l-4",
                        getPriorityColor(notification.priority),
                        !notification.read ? 'hover:bg-gray-800/70' : 'opacity-75 hover:bg-gray-800/50'
                      )}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className={cn(
                              "font-semibold truncate",
                              !notification.read ? 'text-white' : 'text-gray-300'
                            )}>
                              {notification.title}
                            </h3>
                            <div className="flex items-center space-x-2 ml-2">
                              <span className="text-xs text-gray-400 whitespace-nowrap">
                                {formatTimeAgo(notification.timestamp)}
                              </span>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex justify-between items-center">
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs capitalize",
                                notification.type === 'booking' ? 'border-blue-500/30 text-blue-400' :
                                notification.type === 'payment' ? 'border-green-500/30 text-green-400' :
                                notification.type === 'message' ? 'border-purple-500/30 text-purple-400' :
                                notification.type === 'reminder' ? 'border-yellow-500/30 text-yellow-400' :
                                notification.type === 'promotion' ? 'border-pink-500/30 text-pink-400' :
                                'border-gray-500/30 text-gray-400'
                              )}
                            >
                              {notification.type}
                            </Badge>
                            
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotificationMutation.mutate(notification.id);
                              }}
                              variant="ghost"
                              size="sm"
                              className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 p-1 h-auto"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}