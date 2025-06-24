import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Bell, X, Clock, User, Phone, Calendar, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: {
    yachtId?: number;
    bookingId?: number;
    serviceId?: number;
    eventId?: number;
    messageId?: number;
    paymentId?: number;
    amount?: number;
    yachtName?: string;
    serviceName?: string;
    eventTitle?: string;
    senderName?: string;
  };
}

interface AdminNotificationCenterProps {
  userId?: number;
}

const AdminNotificationCenter: React.FC<AdminNotificationCenterProps> = ({ userId }) => {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications', userId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/notifications?userId=${userId}`);
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      await apiRequest('PUT', `/api/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      await apiRequest('DELETE', `/api/notifications/${notificationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('PUT', `/api/notifications/mark-all-read?userId=${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return Calendar;
      case 'call':
        return Phone;
      case 'message':
        return User;
      case 'alert':
        return AlertTriangle;
      case 'system':
        return Bell;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking':
        return 'from-blue-500 to-cyan-500';
      case 'call':
        return 'from-green-500 to-emerald-500';
      case 'message':
        return 'from-purple-500 to-indigo-500';
      case 'alert':
        return 'from-red-500 to-orange-500';
      case 'system':
        return 'from-gray-500 to-slate-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Card className="w-96 bg-gray-900/95 border-gray-700/50 backdrop-blur-xl shadow-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <Bell className="h-5 w-5 mr-2 text-purple-400" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-red-500 text-white text-xs">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              className="text-gray-400 hover:text-white"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <AnimatePresence>
            {isLoading ? (
              <div className="p-6 text-center text-gray-400">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                No notifications yet
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {notifications.map((notification, index) => {
                  const Icon = getNotificationIcon(notification.type);
                  const colorGradient = getNotificationColor(notification.type);
                  
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-xl transition-all duration-300 cursor-pointer group relative overflow-hidden ${
                        notification.isRead 
                          ? 'bg-gray-800/30 hover:bg-gray-700/40' 
                          : 'bg-gray-800/50 hover:bg-gray-700/60 border border-purple-500/20'
                      }`}
                      onClick={() => {
                        if (!notification.isRead) {
                          markAsReadMutation.mutate(notification.id);
                        }
                      }}
                    >
                      <div className="flex items-start space-x-3 relative z-10">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${colorGradient} flex-shrink-0`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-medium truncate ${
                              notification.isRead ? 'text-gray-300' : 'text-white'
                            }`}>
                              {notification.title}
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto w-auto text-gray-400 hover:text-red-400"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotificationMutation.mutate(notification.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <p className={`text-sm mt-1 line-clamp-2 ${
                            notification.isRead ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                      
                      {!notification.isRead && (
                        <div className="absolute top-4 right-4 w-2 h-2 bg-purple-500 rounded-full" />
                      )}
                      
                      {/* Subtle background gradient for unread */}
                      {!notification.isRead && (
                        <div className={`absolute inset-0 bg-gradient-to-r ${colorGradient} opacity-2`} />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
        
        {notifications.length > 0 && (
          <div className="border-t border-gray-700/50 p-4">
            <Button 
              variant="outline" 
              className="w-full border-gray-600 hover:border-purple-500 text-gray-300 hover:text-white"
            >
              View All Notifications
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminNotificationCenter;