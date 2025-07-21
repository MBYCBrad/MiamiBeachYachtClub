import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Bell, 
  Check, 
  X, 
  Clock, 
  AlertCircle, 
  Info, 
  CheckCircle,
  Settings,
  Filter,
  Search,
  MoreVertical,
  Calendar,
  CreditCard
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  metadata?: any;
  createdAt: string;
  updatedAt?: string;
}

interface NotificationStats {
  total: number;
  unread: number;
  highPriority: number;
  todayCount: number;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch notifications
  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });

  // Fetch notification stats
  const { data: stats, isLoading: statsLoading } = useQuery<NotificationStats>({
    queryKey: ["/api/notifications/stats"],
    enabled: !!user,
  });

  const filteredNotifications = notifications.filter((notification: Notification) => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (selectedFilter) {
      case "unread":
        return !notification.isRead;
      case "read":
        return notification.isRead;
      case "high":
        return notification.priority === 'high' || notification.priority === 'urgent';
      default:
        return true;
    }
  });

  const getPriorityColor = (priority: string) => {
    return 'bg-gradient-to-r from-purple-600 to-indigo-600';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'booking': return <Calendar className="h-5 w-5" />;
      case 'payment': return <CreditCard className="h-5 w-5" />;
      case 'system': return <Settings className="h-5 w-5" />;
      case 'alert': return <AlertCircle className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  const markAsRead = async (notificationId: number) => {
    // TODO: Implement mark as read functionality
    console.log('Mark as read:', notificationId);
  };

  const deleteNotification = async (notificationId: number) => {
    // TODO: Implement delete notification functionality
    console.log('Delete notification:', notificationId);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Section */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Notifications
            </motion.h1>
            <motion.p 
              className="text-lg lg:text-xl text-gray-300 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Stay updated with important alerts and system notifications
            </motion.p>

            {/* Stats Cards */}
            <motion.div 
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <div className="flex items-center space-x-3 bg-black/30 backdrop-blur-sm border border-purple-500/30 rounded-2xl px-6 py-3">
                <Bell className="h-6 w-6 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-400">Total Notifications</p>
                  <p className="text-xl font-bold text-white">{stats?.total || notifications.length}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-black/30 backdrop-blur-sm border border-purple-500/30 rounded-2xl px-6 py-3">
                <AlertCircle className="h-6 w-6 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-400">Unread</p>
                  <p className="text-xl font-bold text-white">{stats?.unread || 0}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-black/30 backdrop-blur-sm border border-purple-500/30 rounded-2xl px-6 py-3">
                <Clock className="h-6 w-6 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-400">High Priority</p>
                  <p className="text-xl font-bold text-white">{stats?.highPriority || 0}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Notifications Interface */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Controls */}
          <Card className="mb-6 bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-400"
                  />
                </div>

                {/* Filter */}
                <div className="flex items-center gap-3">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                    <SelectTrigger className="w-[180px] bg-gray-800/50 border-gray-600/50 text-white">
                      <SelectValue placeholder="Filter notifications" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="all">All Notifications</SelectItem>
                      <SelectItem value="unread">Unread Only</SelectItem>
                      <SelectItem value="read">Read Only</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" size="sm" className="text-purple-400 border-purple-500/30">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          <div className="space-y-4">
            {notificationsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No notifications found</h3>
                  <p className="text-gray-400">
                    {searchTerm || selectedFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria' 
                      : 'You\'re all caught up! No new notifications at this time.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification: Notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className={`bg-gray-900/50 border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/50 transition-colors ${
                    !notification.isRead ? 'border-l-4 border-l-purple-500' : ''
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Priority Indicator */}
                        <div className={`w-3 h-3 rounded-full mt-2 ${getPriorityColor(notification.priority)}`} />
                        
                        {/* Type Icon */}
                        <div className="text-purple-400 mt-1">
                          {getTypeIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className={`font-semibold ${notification.isRead ? 'text-gray-300' : 'text-white'}`}>
                                {notification.title}
                              </h3>
                              <p className={`mt-1 ${notification.isRead ? 'text-gray-400' : 'text-gray-300'}`}>
                                {notification.message}
                              </p>
                              
                              <div className="flex items-center gap-3 mt-3">
                                <Badge variant="outline" className="text-xs">
                                  {notification.type}
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className="text-xs border-purple-500 text-purple-400"
                                >
                                  {notification.priority}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 ml-4">
                              {!notification.isRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-green-400 hover:text-green-300 hover:bg-green-400/10"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-400 hover:text-gray-300"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>

          {/* Load More Button */}
          {filteredNotifications.length > 0 && (
            <div className="text-center mt-8">
              <Button variant="outline" className="text-purple-400 border-purple-500/30 hover:bg-purple-500/10">
                Load More Notifications
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}