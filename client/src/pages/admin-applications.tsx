import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Calendar, DollarSign, User, Phone, Mail, MapPin, Building, Filter } from "lucide-react";
import { format } from "date-fns";
import { type Application } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminApplications() {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["/api/admin/applications"],
  });

  // Filter applications based on type
  const filteredApplications = useMemo(() => {
    if (typeFilter === "all") return applications;
    return applications.filter(app => app.applicationType === typeFilter);
  }, [applications, typeFilter]);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest(`/api/admin/applications/${id}`, {
        method: "PATCH",
        body: { status },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/applications"] });
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
    switch (status) {
      case "approved":
        return "from-green-600 to-emerald-600";
      case "rejected":
        return "from-red-600 to-rose-600";
      case "under_review":
        return "from-yellow-600 to-orange-600";
      default:
        return "from-purple-600 to-indigo-600";
    }
  };

  const getApplicationTypeColor = (applicationType: string) => {
    switch (applicationType) {
      case "member":
        return "from-blue-600 to-cyan-600";
      case "yacht_partner":
        return "from-indigo-600 to-purple-600";
      case "service_provider":
        return "from-pink-600 to-rose-600";
      case "event_provider":
        return "from-emerald-600 to-teal-600";
      default:
        return "from-gray-600 to-slate-600";
    }
  };

  const getApplicationTypeLabel = (applicationType: string) => {
    switch (applicationType) {
      case "member":
        return "MEMBER";
      case "yacht_partner":
        return "YACHT PARTNER";
      case "service_provider":
        return "SERVICE PARTNER";
      case "event_provider":
        return "EVENT PARTNER";
      default:
        return "UNKNOWN";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 mt-16">
          <h1 
            className="text-5xl font-bold tracking-tight mb-2"
            style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif' }}
          >
            Applications Management
          </h1>
          <p className="text-lg text-gray-400">
            Review and manage membership and partner applications
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-purple-400" />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px] bg-gray-900/50 border-gray-700/50">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="all">All Applications</SelectItem>
                <SelectItem value="member">Member Applications</SelectItem>
                <SelectItem value="yacht_partner">Yacht Partners</SelectItem>
                <SelectItem value="service_provider">Service Partners</SelectItem>
                <SelectItem value="event_provider">Event Partners</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-gray-400">
            Showing {filteredApplications.length} of {applications.length} applications
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Applications</p>
                  <p className="text-2xl font-bold">{applications.length}</p>
                </div>
                <FileText className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Member Applications</p>
                  <p className="text-2xl font-bold">
                    {applications.filter(app => app.applicationType === "member").length}
                  </p>
                </div>
                <User className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Partner Applications</p>
                  <p className="text-2xl font-bold">
                    {applications.filter(app => app.applicationType !== "member").length}
                  </p>
                </div>
                <Building className="h-8 w-8 text-indigo-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Pending Review</p>
                  <p className="text-2xl font-bold">
                    {applications.filter(app => app.status === "pending").length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Approved</p>
                  <p className="text-2xl font-bold">
                    {applications.filter(app => app.status === "approved").length}
                  </p>
                </div>
                <User className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Under Review</p>
                  <p className="text-2xl font-bold">
                    {applications.filter(app => app.status === "under_review").length}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.map((application: Application) => (
            <Card 
              key={application.id} 
              className="bg-gray-900/50 border-gray-700/50 hover:bg-gray-800/50 transition-colors cursor-pointer"
              onClick={() => setSelectedApplication(application)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {application.firstName?.[0]}{application.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {application.firstName} {application.lastName}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {application.email}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {format(new Date(application.createdAt!), "MMM dd, yyyy")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge 
                      className={`bg-gradient-to-r ${getStatusColor(application.status)} text-white border-none`}
                    >
                      {application.status?.replace("_", " ").toUpperCase()}
                    </Badge>
                    <Badge 
                      className={`bg-gradient-to-r ${getApplicationTypeColor(application.applicationType)} text-white border-none`}
                    >
                      {getApplicationTypeLabel(application.applicationType)}
                    </Badge>
                    <Badge variant="outline" className="border-purple-500 text-purple-400">
                      {application.membershipTier?.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {applications.length === 0 && (
          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Applications Found</h3>
              <p className="text-gray-400">
                New membership applications will appear here when submitted.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Application Detail Modal */}
      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Application Details - {selectedApplication?.firstName} {selectedApplication?.lastName}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[70vh] pr-4">
            {selectedApplication && (
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2 text-purple-400" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Name</p>
                      <p className="font-medium">{selectedApplication.firstName} {selectedApplication.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="font-medium">{selectedApplication.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Phone</p>
                      <p className="font-medium">{selectedApplication.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Date of Birth</p>
                      <p className="font-medium">{selectedApplication.dateOfBirth}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Occupation</p>
                      <p className="font-medium">{selectedApplication.occupation}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Employer</p>
                      <p className="font-medium">{selectedApplication.employer}</p>
                    </div>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                {/* Address Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-purple-400" />
                    Address
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <p className="text-sm text-gray-400">Street Address</p>
                      <p className="font-medium">{selectedApplication.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">City</p>
                      <p className="font-medium">{selectedApplication.city}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">State</p>
                      <p className="font-medium">{selectedApplication.state}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">ZIP Code</p>
                      <p className="font-medium">{selectedApplication.zipCode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Country</p>
                      <p className="font-medium">{selectedApplication.country}</p>
                    </div>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                {/* Membership Preferences */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Building className="w-5 h-5 mr-2 text-purple-400" />
                    Membership Preferences
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Membership Tier</p>
                      <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                        {selectedApplication.membershipTier?.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Preferred Location</p>
                      <p className="font-medium">{selectedApplication.preferredLocation}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Expected Usage</p>
                      <p className="font-medium">{selectedApplication.expectedUsageFrequency}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Primary Use Case</p>
                      <p className="font-medium">{selectedApplication.primaryUseCase}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Group Size</p>
                      <p className="font-medium">{selectedApplication.groupSize}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Reference Source</p>
                      <p className="font-medium">{selectedApplication.referenceSource}</p>
                    </div>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                {/* Financial Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-purple-400" />
                    Financial Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Annual Income</p>
                      <p className="font-medium">{selectedApplication.annualIncome}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Net Worth</p>
                      <p className="font-medium">{selectedApplication.netWorth}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Liquid Assets</p>
                      <p className="font-medium">{selectedApplication.liquidAssets}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Credit Score</p>
                      <p className="font-medium">{selectedApplication.creditScore}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Bank Name</p>
                      <p className="font-medium">{selectedApplication.bankName}</p>
                    </div>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                {/* Boating Experience */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Boating Experience</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Has Experience</p>
                      <p className="font-medium">{selectedApplication.hasBoatingExperience ? "Yes" : "No"}</p>
                    </div>
                    {selectedApplication.hasBoatingExperience && (
                      <>
                        <div>
                          <p className="text-sm text-gray-400">Years of Experience</p>
                          <p className="font-medium">{selectedApplication.boatingExperienceYears}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">License Number</p>
                          <p className="font-medium">{selectedApplication.boatingLicenseNumber}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                {/* Emergency Contact */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Phone className="w-5 h-5 mr-2 text-purple-400" />
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Name</p>
                      <p className="font-medium">{selectedApplication.emergencyContactName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Phone</p>
                      <p className="font-medium">{selectedApplication.emergencyContactPhone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Relation</p>
                      <p className="font-medium">{selectedApplication.emergencyContactRelation}</p>
                    </div>
                  </div>
                </div>

                {selectedApplication.specialRequests && (
                  <>
                    <Separator className="bg-gray-700" />
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Special Requests</h3>
                      <p className="text-gray-300 bg-gray-800 p-4 rounded-lg">
                        {selectedApplication.specialRequests}
                      </p>
                    </div>
                  </>
                )}

                <Separator className="bg-gray-700" />

                {/* Status Management */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Status Management</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-2">Current Status</p>
                      <Badge className={`bg-gradient-to-r ${getStatusColor(selectedApplication.status)} text-white`}>
                        {selectedApplication.status?.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-2">Update Status</p>
                      <Select
                        onValueChange={(status) => {
                          updateStatusMutation.mutate({ id: selectedApplication.id, status });
                        }}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-600">
                          <SelectValue placeholder="Select new status" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="under_review">Under Review</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}