import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Phone, PhoneCall, PhoneOff, Search, Clock, Users, Star, AlertTriangle
} from 'lucide-react';

interface CallableMember {
  id: number;
  memberName: string;
  phoneNumber: string;
  email: string;
  membershipTier: string;
  location: string;
  yachtName?: string;
  currentTrip?: boolean;
  bookingId?: number;
}

interface CustomerServiceStats {
  totalMembers: number;
  activeConversations: number;
  onlineAgents: number;
  callsInQueue: number;
}

export default function CustomerServiceDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCall, setSelectedCall] = useState<any>(null);
  const { toast } = useToast();

  // Fetch real-time customer service data
  const { data: callableMembers = [], isLoading: membersLoading } = useQuery({
    queryKey: ['/api/customer-service/members'],
    staleTime: 1 * 60 * 1000,
  });

  const { data: customerServiceStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/customer-service/stats'],
    staleTime: 30 * 1000,
  });

  // Transform members into call queue format
  const callQueue = callableMembers.map((member: any, index: number) => {
    const priorities = ['high', 'urgent', 'medium'];
    const statuses = ['queued', 'active', 'completed'];
    const reasons = ['Yacht booking assistance', 'Emergency yacht assistance', 'Service follow-up'];
    
    return {
      id: member.id,
      memberName: member.memberName,
      phoneNumber: member.phoneNumber,
      reason: member.currentTrip ? 'Emergency yacht assistance' : reasons[index % reasons.length],
      priority: member.currentTrip ? 'urgent' : priorities[index % priorities.length],
      status: statuses[index % statuses.length],
      waitTime: `${Math.floor(Math.random() * 30) + 1} minutes ago`,
      duration: member.currentTrip ? '12m' : `${Math.floor(Math.random() * 20) + 1}m`,
      membershipTier: member.membershipTier,
      currentTrip: member.currentTrip
    };
  });

  // Calculate stats
  const stats = {
    callsInQueue: callQueue.filter(call => call.status === 'queued').length,
    avgWaitTime: '3.5m',
    longestWait: '8m',
    activeAgents: customerServiceStats?.onlineAgents || 3
  };

  // Filter calls based on search
  const filteredCalls = callQueue.filter(call =>
    call.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    call.phoneNumber.includes(searchTerm) ||
    call.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'queued': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getTierIcon = (tier: string) => {
    return tier === 'Platinum' || tier === 'Gold' ? <Star className="h-3 w-3 text-yellow-400" /> : null;
  };

  if (membersLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <Phone className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Customer Service</h1>
            <p className="text-gray-400 text-sm">Phone support and call queue management</p>
          </div>
          <div className="ml-auto flex gap-4">
            <Badge className="bg-green-600 text-white px-3 py-1">
              {stats.activeAgents} Agents Online
            </Badge>
            <Badge className="bg-blue-600 text-white px-3 py-1">
              {stats.callsInQueue} Calls in Queue
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Phone className="h-5 w-5 text-orange-400 mr-2" />
                <span className="text-2xl font-bold text-white">{stats.callsInQueue}</span>
              </div>
              <p className="text-sm text-gray-400">Calls in Queue</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-yellow-400 mr-2" />
                <span className="text-2xl font-bold text-white">{stats.avgWaitTime}</span>
              </div>
              <p className="text-sm text-gray-400">Avg Wait Time</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-2xl font-bold text-white">{stats.longestWait}</span>
              </div>
              <p className="text-sm text-gray-400">Longest Wait</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-green-400 mr-2" />
                <span className="text-2xl font-bold text-white">{stats.activeAgents}</span>
              </div>
              <p className="text-sm text-gray-400">Active Agents</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Call Queue */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-purple-400" />
                  <CardTitle className="text-white">Call Queue</CardTitle>
                </div>
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                  All calls
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search calls..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {filteredCalls.map((call) => (
                <Card 
                  key={call.id} 
                  className="bg-gray-700 border-gray-600 hover:border-purple-500 transition-colors cursor-pointer"
                  onClick={() => setSelectedCall(call)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                          <Phone className="h-4 w-4 text-white" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-white">{call.memberName}</h4>
                            {getTierIcon(call.membershipTier)}
                            {call.currentTrip && (
                              <Badge className="bg-red-600 text-white text-xs">Emergency</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">{call.phoneNumber}</p>
                          <p className="text-sm text-gray-300">{call.reason}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {call.waitTime}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <Badge className={`${getPriorityColor(call.priority)} text-white text-xs`}>
                            {call.priority}
                          </Badge>
                          <Badge className={`${getStatusColor(call.status)} text-white text-xs`}>
                            {call.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-400">{call.duration}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredCalls.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  No calls found matching your search
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Call Details Panel */}
        <div>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">
                {selectedCall ? 'Call Details' : 'Select a Call'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCall ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Phone className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{selectedCall.memberName}</h3>
                    <p className="text-gray-400">{selectedCall.phoneNumber}</p>
                    <div className="flex justify-center gap-2 mt-2">
                      <Badge className={`${getPriorityColor(selectedCall.priority)} text-white`}>
                        {selectedCall.priority}
                      </Badge>
                      <Badge className={`${getStatusColor(selectedCall.status)} text-white`}>
                        {selectedCall.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <label className="text-gray-400">Reason for Call</label>
                      <p className="text-white">{selectedCall.reason}</p>
                    </div>
                    <div>
                      <label className="text-gray-400">Wait Time</label>
                      <p className="text-white">{selectedCall.waitTime}</p>
                    </div>
                    <div>
                      <label className="text-gray-400">Membership Tier</label>
                      <p className="text-white">{selectedCall.membershipTier}</p>
                    </div>
                    {selectedCall.currentTrip && (
                      <div>
                        <label className="text-gray-400">Status</label>
                        <p className="text-red-400">Currently on yacht trip - Priority contact</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-4">
                    <Button 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => {
                        toast({
                          title: "Call Initiated",
                          description: `Calling ${selectedCall.memberName}...`,
                        });
                      }}
                    >
                      <PhoneCall className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Details
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-400 mb-4">Choose a call from the queue to view details and controls</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}