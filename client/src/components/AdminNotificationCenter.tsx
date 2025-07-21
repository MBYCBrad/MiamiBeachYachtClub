import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/services/notifications";
import { 
  Bell, 
  BellRing, 
  Dot, 
  Calendar, 
  Ship, 
  Sparkles, 
  CreditCard, 
  Users, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Star,
  Eye,
  X,
  Settings,
  Filter,
  SortDesc
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface AdminNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  actionUrl?: string;
  data?: {
    bookingId?: number;
    yachtId?: number;
    serviceId?: number;
    eventId?: number;
    userId?: number;
    paymentId?: string;
    amount?: number;
    yachtName?: string;
    serviceName?: string;
    eventTitle?: string;
    memberName?: string;
  };
  createdAt: string;
}

export default function AdminNotificationCenter() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');
  const { isConnected, unreadCount } = useNotifications();

  // Fetch admin notifications
  const { data: notifications = [], isLoading } = useQuery<AdminNotification[]>({
    queryKey: ['/api/admin/notifications'],
    enabled: !!user && user.role === 'admin',
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      return apiRequest('PATCH', `/api/admin/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/notifications'] });
    }
  });

  // Mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('PATCH', '/api/admin/notifications/mark-all-read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/notifications'] });
    }
  });

  // Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      return apiRequest('DELETE', `/api/admin/notifications/${notificationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/notifications'] });
    }
  });

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = priority === 'urgent' ? 'h-5 w-5 text-purple-400' : 
                     priority === 'high' ? 'h-5 w-5 text-purple-300' :
                     priority === 'medium' ? 'h-5 w-5 text-indigo-400' : 'h-5 w-5 text-blue-400';

    switch (type) {
      case 'booking_created':
      case 'booking_cancelled':
      case 'booking_updated':
        return <Calendar className={iconClass} />;
      case 'yacht_added':
      case 'yacht_updated':
        return <Ship className={iconClass} />;
      case 'service_booked':
      case 'service_added':
      case 'service_updated':
        return <Sparkles className={iconClass} />;
      case 'event_registered':
      case 'event_added':
      case 'event_updated':
        return <Star className={iconClass} />;
      case 'payment_processed':
      case 'payment_failed':
        return <CreditCard className={iconClass} />;
      case 'member_joined':
      case 'user_updated':
        return <Users className={iconClass} />;
      case 'message_received':
        return <MessageSquare className={iconClass} />;
      case 'system_alert':
        return <AlertCircle className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-purple-500 bg-gradient-to-r from-purple-500/10 to-indigo-500/10';
      case 'high':
        return 'border-l-purple-400 bg-gradient-to-r from-purple-400/10 to-blue-400/10';
      case 'medium':
        return 'border-l-indigo-400 bg-gradient-to-r from-indigo-400/10 to-purple-400/10';
      default:
        return 'border-l-blue-500 bg-gradient-to-r from-blue-500/10 to-indigo-500/10';
    }
  };

  const getActionLabel = (type: string) => {
    switch (type) {
      case 'booking_created':
      case 'booking_updated':
        return 'View Booking';
      case 'yacht_added':
      case 'yacht_updated':
        return 'View Yacht';
      case 'service_booked':
        return 'View Service';
      case 'event_registered':
        return 'View Event';
      case 'payment_processed':
        return 'View Payment';
      case 'member_joined':
        return 'View Member';
      case 'message_received':
        return 'View Message';
      default:
        return 'View Details';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'urgent':
        return notification.priority === 'urgent' || notification.priority === 'high';
      default:
        return true;
    }
  });

  const urgentCount = notifications.filter(n => !n.read && (n.priority === 'urgent' || n.priority === 'high')).length;
  const totalUnread = notifications.filter(n => !n.read).length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative"
        >
          <Button
            variant="ghost"
            size="sm"
            className="relative p-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/50"
          >
            {totalUnread > 0 ? (
              <BellRing className="h-5 w-5 text-purple-400" />
            ) : (
              <Bell className="h-5 w-5 text-gray-400" />
            )}
            
            {/* Connection Status Indicator */}
            <motion.div
              animate={{ 
                scale: isConnected ? [1, 1.2, 1] : 1,
                opacity: isConnected ? 1 : 0.5 
              }}
              transition={{ 
                repeat: isConnected ? Infinity : 0,
                duration: 2,
                ease: "easeInOut"
              }}
              className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-gray-500'
              }`}
            />

            {/* Notification Count Badge */}
            {totalUnread > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 font-semibold"
              >
                {totalUnread > 99 ? '99+' : totalUnread}
              </motion.div>
            )}
          </Button>
        </motion.div>
      </PopoverTrigger>

      <PopoverContent 
        className="w-96 p-0 bg-gray-950 backdrop-blur-xl border-gray-700/50" 
        align="end"
        sideOffset={10}
      >
        <Card className="border-0 bg-transparent">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-lg flex items-center">
                <BellRing className="h-5 w-5 mr-2 text-purple-400" />
                Admin Notifications
              </CardTitle>
              <div className="flex items-center space-x-2">
                {/* Filter Options */}
                <div className="flex rounded-lg bg-gray-800/50 p-1">
                  {(['all', 'unread', 'urgent'] as const).map((filterOption) => (
                    <Button
                      key={filterOption}
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilter(filterOption)}
                      className={`text-xs px-2 py-1 h-7 ${
                        filter === filterOption 
                          ? 'bg-purple-600 text-white' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {filterOption === 'all' ? 'All' : 
                       filterOption === 'unread' ? 'Unread' : 'Urgent'}
                    </Button>
                  ))}
                </div>

                {/* Mark All Read */}
                {totalUnread > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAllAsReadMutation.mutate()}
                    className="text-xs text-purple-400 hover:text-purple-300"
                    disabled={markAllAsReadMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Status Summary */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Dot className={`h-4 w-4 ${isConnected ? 'text-green-500' : 'text-gray-500'}`} />
                <span className="text-gray-400">
                  {isConnected ? 'Live' : 'Disconnected'}
                </span>
              </div>
              {urgentCount > 0 && (
                <Badge className="text-xs bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0">
                  {urgentCount} Urgent
                </Badge>
              )}
            </div>
          </CardHeader>

          <Separator className="bg-gray-700/50" />

          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {isLoading ? (
                <div className="p-4 text-center text-gray-400">
                  <Clock className="h-8 w-8 mx-auto mb-2 animate-spin" />
                  Loading notifications...
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-6 text-center text-gray-400">
                  <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">
                    {filter === 'all' ? 'No notifications' : 
                     filter === 'unread' ? 'No unread notifications' : 'No urgent notifications'}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 border-l-4 hover:bg-gray-800/50 transition-colors group ${
                        getPriorityColor(notification.priority)
                      } ${!notification.read ? 'bg-gray-800/30' : ''}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type, notification.priority)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-white mb-1">
                                {notification.title}
                              </h4>
                              <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">
                                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                </span>
                                {notification.priority === 'urgent' && (
                                  <Badge variant="destructive" className="text-xs px-1 py-0">
                                    Urgent
                                  </Badge>
                                )}
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {notification.actionUrl && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs text-purple-400 hover:text-purple-300 h-6 px-2"
                                  onClick={() => {
                                    // Handle navigation to action URL
                                    if (!notification.read) {
                                      markAsReadMutation.mutate(notification.id);
                                    }
                                    setIsOpen(false);
                                  }}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              )}
                              
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs text-gray-400 hover:text-white h-6 px-2"
                                  onClick={() => markAsReadMutation.mutate(notification.id)}
                                  disabled={markAsReadMutation.isPending}
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-gray-400 hover:text-red-400 h-6 px-2"
                                onClick={() => deleteNotificationMutation.mutate(notification.id)}
                                disabled={deleteNotificationMutation.isPending}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {filteredNotifications.length > 0 && (
              <>
                <Separator className="bg-gray-700/50" />
                <div className="p-3 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-purple-400 hover:text-purple-300"
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    View All in Dashboard
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}