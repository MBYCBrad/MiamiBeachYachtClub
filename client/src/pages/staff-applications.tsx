import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Calendar, DollarSign, User, Phone, Mail, MapPin, Building, Filter, Eye } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { type Application } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function StaffApplications() {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ["/api/staff/applications"],
    refetchInterval: 30000, // Refresh every 30 seconds for real-time sync
    refetchOnWindowFocus: true, // Refresh when window regains focus
  });

  // Filter applications based on type
  const filteredApplications = useMemo(() => {
    if (typeFilter === "all") return applications;
    return applications.filter((app: Application) => app.applicationType === typeFilter);
  }, [applications, typeFilter]);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("PATCH", `/api/staff/applications/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff/applications"] });
      toast({
        title: "Success",
        description: "Application status updated successfully",
      });
      setSelectedApplication(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update application status",
        variant: "destructive",
      });
    },
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      case "under_review":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    // All status badges use unified purple-to-blue gradient
    return "from-purple-600 to-indigo-600";
  };

  const getTypeColor = (type: string) => {
    return "from-purple-600 to-indigo-600"; // Unified gradient for all badges
  };

  const formatApplicationType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mt-16">
        <h1 className="text-5xl font-bold text-white tracking-tight mb-2" style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>
          Applications
        </h1>
        <p className="text-lg text-gray-300">Review membership and partnership applications</p>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-400">Filter by:</span>
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px] bg-gray-900/50 border-gray-700/50">
            <SelectValue placeholder="Application type" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="member">Membership</SelectItem>
            <SelectItem value="yacht_partner">Yacht Partner</SelectItem>
            <SelectItem value="service_provider">Service Provider</SelectItem>
            <SelectItem value="event_provider">Event Provider</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredApplications.map((app) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            className="group"
          >
            <Card className="bg-gray-900/50 border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 cursor-pointer h-full"
                  onClick={() => setSelectedApplication(app)}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white text-lg font-semibold">
                      {app.fullName || `${app.firstName || ''} ${app.lastName || ''}`.trim()}
                    </CardTitle>
                    <CardDescription className="text-gray-400 text-sm">
                      {app.email}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={`bg-gradient-to-r ${getTypeColor(app.applicationType)} text-white border-0 text-xs`}>
                      {formatApplicationType(app.applicationType)}
                    </Badge>
                    <Badge 
                      className={`bg-gradient-to-r ${getStatusColor(app.status)} text-white border-0 text-xs`}
                    >
                      {app.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>Applied {format(new Date(app.createdAt), 'MMM dd, yyyy')}</span>
                  </div>
                  
                  {app.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Phone className="h-4 w-4" />
                      <span>{app.phone}</span>
                    </div>
                  )}
                  
                  {app.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <MapPin className="h-4 w-4" />
                      <span>{app.location}</span>
                    </div>
                  )}
                  
                  {app.membershipTier && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-white">{app.membershipTier} Membership</span>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      ID: #{app.id}
                    </span>
                    <Eye className="h-4 w-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredApplications.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Applications Found</h3>
          <p className="text-gray-400">
            {typeFilter === "all" 
              ? "No applications have been submitted yet." 
              : `No ${formatApplicationType(typeFilter)} applications found.`}
          </p>
        </div>
      )}

      {/* Application Details Dialog */}
      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Application Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedApplication && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6 pr-4">
                {/* Header Info */}
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedApplication.fullName || `${selectedApplication.firstName || ''} ${selectedApplication.lastName || ''}`.trim()}
                    </h3>
                    <p className="text-gray-400">{selectedApplication.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={`bg-gradient-to-r ${getTypeColor(selectedApplication.applicationType)} text-white`}>
                      {formatApplicationType(selectedApplication.applicationType)}
                    </Badge>
                    <Badge className={`bg-gradient-to-r ${getStatusColor(selectedApplication.status)} text-white`}>
                      {selectedApplication.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg">Contact Information</h4>
                    <div className="space-y-2">
                      {selectedApplication.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{selectedApplication.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{selectedApplication.email}</span>
                      </div>
                      {selectedApplication.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{selectedApplication.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg">Application Details</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>Applied {format(new Date(selectedApplication.createdAt), 'MMMM dd, yyyy')}</span>
                      </div>
                      {selectedApplication.membershipTier && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span>{selectedApplication.membershipTier} Membership</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Application Content */}
                {selectedApplication.content && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg">Application Content</h4>
                    <div className="bg-gray-800/30 p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm text-gray-300">
                        {selectedApplication.content}
                      </pre>
                    </div>
                  </div>
                )}

                <Separator className="bg-gray-700" />

                {/* Status Update */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Update Status</h4>
                  <div className="flex items-center gap-4">
                    <Select 
                      defaultValue={selectedApplication.status}
                      onValueChange={(value) => {
                        updateStatusMutation.mutate({ 
                          id: selectedApplication.id, 
                          status: value 
                        });
                      }}
                    >
                      <SelectTrigger className="w-[200px] bg-gray-800 border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {updateStatusMutation.isPending && (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full" />
                        <span className="text-sm text-gray-400">Updating...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}