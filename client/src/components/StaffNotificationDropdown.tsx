import React, { useState, useRef, useEffect } from 'react';
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
  created_at: string;
  read: boolean;
  action_url?: string;
  data?: any;
}

export default function StaffNotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch staff notifications with real-time updates
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/staff/notifications'],
    enabled: !!user,
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) => 
      apiRequest(`/api/staff/notifications/${notificationId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff/notifications'] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => 
      apiRequest('/api/staff/notifications/mark-all-read'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff/notifications'] });
      toast({ title: "All notifications marked as read" });
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: number) => 
      fetch(`/api/staff/notifications/${notificationId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff/notifications'] });
      toast({ title: "Notification deleted" });
    },
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'important':
        return notification.priority === 'high' || notification.priority === 'urgent';
      default:
        return true;
    }
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_booking':
        return <Ship className="h-4 w-4 text-blue-400" />;
      case 'service_booking':
        return <Calendar className="h-4 w-4 text-green-400" />;
      case 'event_registration':
        return <Calendar className="h-4 w-4 text-purple-400" />;
      case 'payment':
        return <CreditCard className="h-4 w-4 text-yellow-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'from-red-600 to-red-500';
      case 'high':
        return 'from-orange-600 to-orange-500';
      case 'medium':
        return 'from-purple-600 to-indigo-600';
      default:
        return 'from-gray-600 to-gray-500';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-gray-800/50 hover:bg-purple-500/20 border border-gray-600/50 hover:border-purple-500/50 transition-all duration-300 group"
        title="Notifications"
      >
        <Bell className="h-4 w-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
        {/* Notification Badge */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">{unreadCount}</span>
          </div>
        )}
      </motion.button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 max-h-96 overflow-hidden bg-gray-950 border border-gray-700/50 rounded-xl shadow-2xl z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-700/50 bg-gray-900/50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Staff Notifications</h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAllAsReadMutation.mutate()}
                      className="text-xs text-purple-400 hover:text-purple-300"
                    >
                      Mark all read
                    </Button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-md hover:bg-gray-700/50 transition-colors"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex space-x-1 mt-3">
                {(['all', 'unread', 'important'] as const).map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={`px-3 py-1 text-xs rounded-md transition-all ${
                      filter === filterType
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                    {filterType === 'unread' && unreadCount > 0 && (
                      <span className="ml-1 text-xs">({unreadCount})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
                  <p className="text-gray-400 text-sm">Loading notifications...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400">No notifications</p>
                  <p className="text-gray-500 text-xs">All caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700/50">
                  {filteredNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 hover:bg-gray-800/50 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-gray-900/30' : ''
                      }`}
                      onClick={() => {
                        if (!notification.read) {
                          markAsReadMutation.mutate(notification.id);
                        }
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-sm font-medium ${
                              !notification.read ? 'text-white' : 'text-gray-300'
                            }`}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-1">
                              <Badge className={`bg-gradient-to-r ${getPriorityColor(notification.priority)} text-white text-xs`}>
                                {notification.priority}
                              </Badge>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </span>
                            <div className="flex space-x-1">
                              {!notification.read && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsReadMutation.mutate(notification.id);
                                  }}
                                  className="p-1 rounded hover:bg-gray-700/50 transition-colors"
                                  title="Mark as read"
                                >
                                  <Check className="h-3 w-3 text-green-400" />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotificationMutation.mutate(notification.id);
                                }}
                                className="p-1 rounded hover:bg-gray-700/50 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-3 w-3 text-red-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}