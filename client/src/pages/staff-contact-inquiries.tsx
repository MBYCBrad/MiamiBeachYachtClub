import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, Search, Filter, Clock, User, Phone, AlertCircle, CheckCircle, XCircle, MessageSquare, Eye, Edit } from 'lucide-react';
import { apiRequest } from "@/lib/queryClient";

interface ContactMessage {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message: string;
  inquiryType: string;
  status: string;
  priority: string;
  createdAt: string;
}

export default function StaffContactInquiries() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedContactInquiry, setSelectedContactInquiry] = useState<ContactMessage | null>(null);
  const queryClient = useQueryClient();

  // Fetch contact messages using staff endpoint
  const { data: contactMessages = [], isLoading } = useQuery({
    queryKey: ['/api/staff/contact-messages'],
    refetchInterval: 30000, // Refresh every 30 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Update contact message mutation
  const updateContactMessageMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number, updates: any }) => {
      const response = await apiRequest('PATCH', `/api/staff/contact-messages/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff/contact-messages'] });
    },
  });

  // Filter messages based on search and filters
  const filteredMessages = contactMessages.filter((message: ContactMessage) => {
    const matchesSearch = searchTerm === '' || 
      message.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || message.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleStatusUpdate = (id: number, status: string) => {
    updateContactMessageMutation.mutate({ id, updates: { status } });
  };

  const handlePriorityUpdate = (id: number, priority: string) => {
    updateContactMessageMutation.mutate({ id, updates: { priority } });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <AlertCircle className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'in_progress':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'resolved':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full"></div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 mt-16"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-5xl font-bold text-white tracking-tight mb-2">Contact Inquiries</h1>
          <p className="text-lg text-gray-400">Manage website contact form submissions and customer inquiries</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gray-900/50 border-gray-700/50">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or message content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-[180px] bg-gray-800/50 border-gray-600 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full lg:w-[180px] bg-gray-800/50 border-gray-600 text-white">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contact Messages List */}
      <Card className="bg-gray-900/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Mail className="h-5 w-5 mr-2 text-purple-500" />
            Contact Messages ({filteredMessages.length})
          </CardTitle>
          <CardDescription>Manage customer inquiries and contact form submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            {filteredMessages.length > 0 ? (
              <div className="space-y-4">
                {filteredMessages.map((message: ContactMessage, index: number) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 rounded-xl bg-gray-800/30 hover:bg-gray-700/40 transition-all duration-300 border border-gray-700/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {message.firstName} {message.lastName}
                            </h3>
                            <p className="text-gray-400">{message.email}</p>
                            {message.phone && (
                              <div className="flex items-center mt-1">
                                <Phone className="h-4 w-4 text-gray-500 mr-1" />
                                <p className="text-gray-400 text-sm">{message.phone}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                          <div>
                            <p className="text-gray-400 text-sm">Inquiry Type</p>
                            <p className="text-white capitalize">
                              {message.inquiryType?.replace(/_/g, ' ') || 'General'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Priority</p>
                            <Select
                              value={message.priority}
                              onValueChange={(value) => handlePriorityUpdate(message.id, value)}
                            >
                              <SelectTrigger className="h-8 bg-transparent border-none p-0 text-white">
                                <Badge className={getPriorityColor(message.priority)}>
                                  {message.priority?.charAt(0).toUpperCase() + message.priority?.slice(1) || 'Normal'}
                                </Badge>
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-600">
                                <SelectItem value="low">Low Priority</SelectItem>
                                <SelectItem value="medium">Medium Priority</SelectItem>
                                <SelectItem value="high">High Priority</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Submitted</p>
                            <p className="text-white text-sm">
                              {new Date(message.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-gray-900/50 rounded-lg mb-4">
                          <p className="text-gray-400 text-sm mb-1">Message</p>
                          <p className="text-white">{message.message}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2 ml-4">
                        <Select
                          value={message.status}
                          onValueChange={(value) => handleStatusUpdate(message.id, value)}
                        >
                          <SelectTrigger className="w-auto bg-transparent border-none p-0">
                            <Badge className={`${getStatusColor(message.status)} flex items-center space-x-1`}>
                              {getStatusIcon(message.status)}
                              <span>
                                {message.status?.charAt(0).toUpperCase() + message.status?.slice(1).replace(/_/g, ' ') || 'New'}
                              </span>
                            </Badge>
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600">
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-400 hover:text-white hover:bg-purple-500/20"
                          onClick={() => setSelectedContactInquiry(message)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Mail className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <p className="text-xl text-gray-400 mb-2">No contact inquiries found</p>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                    ? 'Try adjusting your filters'
                    : 'Contact form submissions will appear here'
                  }
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Contact Inquiry View Dialog */}
      <Dialog open={!!selectedContactInquiry} onOpenChange={(open) => !open && setSelectedContactInquiry(null)}>
        <DialogContent className="bg-gray-950 border-gray-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Contact Inquiry Details</DialogTitle>
            <DialogDescription className="text-gray-400">
              Complete information for this contact form submission
            </DialogDescription>
          </DialogHeader>
          
          {selectedContactInquiry && (
            <div className="space-y-6">
              {/* Basic Information Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-400">First Name</label>
                  <p className="text-white font-medium mt-1">
                    {selectedContactInquiry.firstName}
                  </p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-400">Last Name</label>
                  <p className="text-white font-medium mt-1">
                    {selectedContactInquiry.lastName}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-400">Email</label>
                  <p className="text-white font-medium mt-1">
                    {selectedContactInquiry.email}
                  </p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-400">Phone</label>
                  <p className="text-white font-medium mt-1">
                    {selectedContactInquiry.phone || 'Not provided'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-400">Inquiry Type</label>
                  <p className="text-white font-medium mt-1 capitalize">
                    {selectedContactInquiry.inquiryType?.replace(/_/g, ' ') || 'General'}
                  </p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-400">Priority</label>
                  <Badge className={`${getPriorityColor(selectedContactInquiry.priority)} mt-1`}>
                    {selectedContactInquiry.priority?.charAt(0).toUpperCase() + selectedContactInquiry.priority?.slice(1) || 'Normal'}
                  </Badge>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-400">Status</label>
                  <Badge className={`${getStatusColor(selectedContactInquiry.status)} mt-1`}>
                    {selectedContactInquiry.status?.charAt(0).toUpperCase() + selectedContactInquiry.status?.slice(1).replace(/_/g, ' ') || 'New'}
                  </Badge>
                </div>
              </div>

              {/* Message */}
              <div className="bg-gray-900/50 rounded-lg p-4">
                <label className="text-sm font-medium text-gray-400">Message</label>
                <p className="text-white mt-2 leading-relaxed">
                  {selectedContactInquiry.message}
                </p>
              </div>

              {/* Submit Date */}
              <div className="bg-gray-900/50 rounded-lg p-4">
                <label className="text-sm font-medium text-gray-400">Submitted</label>
                <p className="text-white font-medium mt-1">
                  {selectedContactInquiry.createdAt ? 
                    new Date(selectedContactInquiry.createdAt).toLocaleString() : 'Unknown'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => setSelectedContactInquiry(null)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Close
                </Button>
                <Button 
                  variant="outline"
                  className="border-yellow-600 text-yellow-400 hover:bg-yellow-800/20"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Update Status
                </Button>
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                  <Mail className="w-4 h-4 mr-2" />
                  Reply
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}