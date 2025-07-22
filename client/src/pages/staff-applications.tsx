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
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: applications = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/staff/applications"],
    refetchInterval: 30000, // Refresh every 30 seconds for real-time sync
    refetchOnWindowFocus: true, // Refresh when window regains focus
  });

  // Filter applications based on type
  const filteredApplications = useMemo(() => {
    if (typeFilter === "all") return applications;
    return applications.filter((app: any) => app.applicationType === typeFilter);
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
                      {app.personalInfo?.fullName || `${app.personalInfo?.firstName || ''} ${app.personalInfo?.lastName || ''}`.trim() || 'N/A'}
                    </CardTitle>
                    <CardDescription className="text-gray-400 text-sm">
                      {app.personalInfo?.email || 'No email provided'}
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
                  
                  {app.personalInfo?.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Phone className="h-4 w-4" />
                      <span>{app.personalInfo.phone}</span>
                    </div>
                  )}
                  
                  {app.personalInfo?.city && app.personalInfo?.state && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <MapPin className="h-4 w-4" />
                      <span>{app.personalInfo.city}, {app.personalInfo.state}</span>
                    </div>
                  )}
                  
                  {app.membershipInfo?.membershipTier && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-white">{app.membershipInfo.membershipTier.toUpperCase()} Membership</span>
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
                      {selectedApplication.personalInfo?.fullName || 'Application Details'}
                    </h3>
                    <p className="text-gray-400">{selectedApplication.personalInfo?.email}</p>
                    <p className="text-sm text-gray-500">Application #{selectedApplication.id}</p>
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

                {/* Complete Application Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-purple-400 border-b border-purple-400/20 pb-2">Personal Information</h4>
                    <div className="space-y-3 bg-gray-800/30 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-gray-400 uppercase">First Name</label>
                          <p className="text-white">{selectedApplication.personalInfo?.firstName || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 uppercase">Last Name</label>
                          <p className="text-white">{selectedApplication.personalInfo?.lastName || 'N/A'}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 uppercase">Email</label>
                        <p className="text-white">{selectedApplication.personalInfo?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 uppercase">Phone</label>
                        <p className="text-white">{selectedApplication.personalInfo?.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 uppercase">Date of Birth</label>
                        <p className="text-white">{selectedApplication.personalInfo?.dateOfBirth || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 uppercase">Address</label>
                        <p className="text-white">{selectedApplication.personalInfo?.address || 'N/A'}</p>
                        <p className="text-gray-400 text-sm">
                          {selectedApplication.personalInfo?.city}, {selectedApplication.personalInfo?.state} {selectedApplication.personalInfo?.zipCode}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-gray-400 uppercase">Occupation</label>
                          <p className="text-white">{selectedApplication.personalInfo?.occupation || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 uppercase">Employer</label>
                          <p className="text-white">{selectedApplication.personalInfo?.employer || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Membership Information */}
                  {selectedApplication.membershipInfo && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg text-purple-400 border-b border-purple-400/20 pb-2">Membership Details</h4>
                      <div className="space-y-3 bg-gray-800/30 p-4 rounded-lg">
                        <div>
                          <label className="text-xs text-gray-400 uppercase">Membership Tier</label>
                          <p className="text-white font-semibold">{selectedApplication.membershipInfo.membershipTier?.toUpperCase() || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 uppercase">Package Type</label>
                          <p className="text-white">{selectedApplication.membershipInfo.membershipPackage || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 uppercase">Preferred Location</label>
                          <p className="text-white">{selectedApplication.membershipInfo.preferredLocation || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 uppercase">Usage Frequency</label>
                          <p className="text-white">{selectedApplication.membershipInfo.expectedUsageFrequency || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 uppercase">Primary Use Case</label>
                          <p className="text-white">{selectedApplication.membershipInfo.primaryUseCase || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 uppercase">Group Size</label>
                          <p className="text-white">{selectedApplication.membershipInfo.groupSize || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Financial Information */}
                {selectedApplication.financialInfo && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-purple-400 border-b border-purple-400/20 pb-2">Financial Information</h4>
                    <div className="grid md:grid-cols-3 gap-4 bg-gray-800/30 p-4 rounded-lg">
                      <div>
                        <label className="text-xs text-gray-400 uppercase">Annual Income</label>
                        <p className="text-white">{selectedApplication.financialInfo.annualIncome || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 uppercase">Net Worth</label>
                        <p className="text-white">{selectedApplication.financialInfo.netWorth || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 uppercase">Liquid Assets</label>
                        <p className="text-white">{selectedApplication.financialInfo.liquidAssets || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 uppercase">Credit Score</label>
                        <p className="text-white">{selectedApplication.financialInfo.creditScore || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 uppercase">Bank Name</label>
                        <p className="text-white">{selectedApplication.financialInfo.bankName || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Experience & References */}
                {selectedApplication.experienceInfo && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-purple-400 border-b border-purple-400/20 pb-2">Boating Experience & References</h4>
                    <div className="bg-gray-800/30 p-4 rounded-lg space-y-3">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-gray-400 uppercase">Has Boating Experience</label>
                          <p className="text-white">{selectedApplication.experienceInfo.hasBoatingExperience ? 'Yes' : 'No'}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 uppercase">Years of Experience</label>
                          <p className="text-white">{selectedApplication.experienceInfo.boatingExperienceYears || 'N/A'}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 uppercase">Boating License Number</label>
                        <p className="text-white">{selectedApplication.experienceInfo.boatingLicenseNumber || 'N/A'}</p>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-gray-400 uppercase">Reference Source</label>
                          <p className="text-white">{selectedApplication.experienceInfo.referenceSource || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 uppercase">Referral Name</label>
                          <p className="text-white">{selectedApplication.experienceInfo.referralName || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Emergency Contact & Additional Info */}
                {selectedApplication.additionalInfo && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-purple-400 border-b border-purple-400/20 pb-2">Emergency Contact & Additional Information</h4>
                    <div className="bg-gray-800/30 p-4 rounded-lg space-y-3">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs text-gray-400 uppercase">Emergency Contact Name</label>
                          <p className="text-white">{selectedApplication.additionalInfo.emergencyContactName || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 uppercase">Emergency Phone</label>
                          <p className="text-white">{selectedApplication.additionalInfo.emergencyContactPhone || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 uppercase">Relationship</label>
                          <p className="text-white">{selectedApplication.additionalInfo.emergencyContactRelation || 'N/A'}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 uppercase">Special Requests</label>
                        <p className="text-white">{selectedApplication.additionalInfo.specialRequests || 'None'}</p>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-700">
                        <div>
                          <label className="text-xs text-gray-400 uppercase">Terms Agreement</label>
                          <p className={selectedApplication.additionalInfo.agreeToTerms ? 'text-green-400' : 'text-red-400'}>
                            {selectedApplication.additionalInfo.agreeToTerms ? '✓ Agreed' : '✗ Not Agreed'}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 uppercase">Background Check</label>
                          <p className={selectedApplication.additionalInfo.agreeToBackground ? 'text-green-400' : 'text-red-400'}>
                            {selectedApplication.additionalInfo.agreeToBackground ? '✓ Agreed' : '✗ Not Agreed'}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 uppercase">Marketing Opt-in</label>
                          <p className={selectedApplication.additionalInfo.marketingOptIn ? 'text-green-400' : 'text-gray-400'}>
                            {selectedApplication.additionalInfo.marketingOptIn ? '✓ Yes' : '✗ No'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Partner-specific Information */}
                {selectedApplication.partnerInfo && selectedApplication.applicationType !== 'member' && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-purple-400 border-b border-purple-400/20 pb-2">Partner Information</h4>
                    <div className="bg-gray-800/30 p-4 rounded-lg space-y-3">
                      {selectedApplication.partnerInfo.company && (
                        <div>
                          <label className="text-xs text-gray-400 uppercase">Company</label>
                          <p className="text-white">{selectedApplication.partnerInfo.company}</p>
                        </div>
                      )}
                      {selectedApplication.partnerInfo.message && (
                        <div>
                          <label className="text-xs text-gray-400 uppercase">Message</label>
                          <p className="text-white whitespace-pre-wrap">{selectedApplication.partnerInfo.message}</p>
                        </div>
                      )}
                      {selectedApplication.partnerInfo.details && (
                        <div>
                          <label className="text-xs text-gray-400 uppercase">Specific Details</label>
                          <div className="bg-gray-900/50 p-3 rounded text-sm">
                            <pre className="text-gray-300 whitespace-pre-wrap">{JSON.stringify(selectedApplication.partnerInfo.details, null, 2)}</pre>
                          </div>
                        </div>
                      )}
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