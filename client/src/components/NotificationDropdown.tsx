import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, X, Check, Clock, AlertCircle, Trash2, Ship, Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: number;
  type: 'new_booking' | 'service_booking' | 'event_registration' | 'system' | 'payment';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  actionRequired?: boolean;
  metadata?: any;
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch notifications with real-time updates - use member notifications for members
  const notificationsEndpoint = user?.role === 'admin' || user?.role?.includes('staff') 
    ? '/api/staff/notifications' 
    : '/api/notifications';
    
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: [notificationsEndpoint],
    enabled: !!user && isOpen,
    staleTime: 10000, // 10 seconds
    refetchInterval: isOpen ? 30000 : false, // Refetch every 30 seconds when open
  });

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) => 
      apiRequest('POST', `${notificationsEndpoint.replace('/notifications', '')}/notifications/${notificationId}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [notificationsEndpoint] });
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: number) => 
      apiRequest('DELETE', `${notificationsEndpoint.replace('/notifications', '')}/notifications/${notificationId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [notificationsEndpoint] });
      toast({ title: "Notification deleted" });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => apiRequest('POST', `${notificationsEndpoint.replace('/notifications', '')}/notifications/mark-all-read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff/notifications'] });
      toast({ title: "All notifications marked as read" });
    },
  });

  const filteredNotifications = (notifications || []).filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'important') return ['high', 'urgent'].includes(notification.priority);
    return true;
  });

  const unreadCount = (notifications || []).filter(n => !n.read).length;

  const getNotificationIcon = (type: string, priority: string) => {
    if (priority === 'urgent') return <AlertCircle className="h-5 w-5 text-red-400" />;
    
    switch (type) {
      case 'new_booking':
      case 'service_booking':
        return <Ship className="h-5 w-5 text-blue-400" />;
      case 'event_registration':
        return <Calendar className="h-5 w-5 text-purple-400" />;
      case 'payment':
        return <CreditCard className="h-5 w-5 text-green-400" />;
      default:
        return <Bell className="h-5 w-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500/50 bg-red-500/10';
      case 'high': return 'border-orange-500/50 bg-orange-500/10';
      case 'medium': return 'border-yellow-500/50 bg-yellow-500/10';
      default: return 'border-gray-500/50 bg-gray-500/10';
    }
  };

  const handleMarkAsRead = (notificationId: number) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleDelete = (notificationId: number) => {
    deleteNotificationMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="fixed bottom-20 right-4 left-4 max-w-md mx-auto z-[60] md:right-6 md:left-auto"
      >
        <Card className="bg-gray-950/95 backdrop-blur-xl border-gray-700/50 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-purple-400" />
              <div>
                <h3 className="font-semibold text-white">Staff Notifications</h3>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  Connected
                </div>
              </div>
              {unreadCount > 0 && (
                <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 p-4 border-b border-gray-700/50">
            {['all', 'unread', 'important'].map((filterType) => (
              <Button
                key={filterType}
                variant={filter === filterType ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter(filterType as any)}
                className={filter === filterType 
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white" 
                  : "text-gray-400 hover:text-white"
                }
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </Button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto"></div>
                <p className="text-gray-400 text-sm mt-2">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No notifications</p>
                <p className="text-gray-500 text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="p-2">
                {filteredNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-lg border mb-2 ${getPriorityColor(notification.priority)} ${
                      !notification.read ? 'border-l-4 border-l-purple-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {getNotificationIcon(notification.type, notification.priority)}
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium text-sm ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                            {notification.title}
                          </h4>
                          <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                            {notification.actionRequired && (
                              <Badge variant="destructive" className="text-xs">
                                Action Required
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="h-6 w-6 text-gray-400 hover:text-white"
                            title="Mark as read"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(notification.id)}
                          className="h-6 w-6 text-gray-400 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-700/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                className="w-full text-gray-400 hover:text-white"
              >
                Mark All as Read
              </Button>
            </div>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}