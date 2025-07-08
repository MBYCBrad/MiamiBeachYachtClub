import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, PhoneCall, PhoneOff, Clock, User, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface PhoneCall {
  id: string;
  memberId: number;
  memberName: string;
  memberPhone: string;
  agentId?: number;
  callType: string;
  status: string;
  direction: string;
  duration?: number;
  startTime: string;
  endTime?: string;
  reason: string;
  notes?: string;
  metadata?: any;
}

export function CallCenterInterface() {
  const { toast } = useToast();
  const [incomingCallAudio] = useState(() => {
    const audio = new Audio();
    audio.src = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkiGz2V3P7JeSsFJHzN8j+SNwkJaLvt559NAsM=";
    audio.loop = true;
    return audio;
  });

  // Fetch all phone calls
  const { data: phoneCalls = [], isLoading } = useQuery({
    queryKey: ["/api/phone-calls"],
    refetchInterval: 2000, // Poll every 2 seconds for real-time updates
  });

  // Get incoming/ringing calls
  const incomingCalls = phoneCalls.filter((call: PhoneCall) => 
    call.status === "ringing" || call.status === "incoming"
  );

  // Get active calls
  const activeCalls = phoneCalls.filter((call: PhoneCall) => 
    call.status === "in_progress" || call.status === "connected"
  );

  // Get recent calls (completed, missed, etc.)
  const recentCalls = phoneCalls.filter((call: PhoneCall) => 
    call.status === "completed" || call.status === "missed" || call.status === "declined"
  ).slice(0, 10);

  // Answer call mutation
  const answerCallMutation = useMutation({
    mutationFn: async (callId: string) => {
      return await apiRequest("PATCH", `/api/phone-calls/${callId}`, {
        status: "in_progress",
        agentId: 60, // Simon Librati admin ID
      });
    },
    onSuccess: (updatedCall) => {
      toast({
        title: "Call Answered",
        description: `Connected to ${updatedCall.memberName}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/phone-calls"] });
      incomingCallAudio.pause();
    },
  });

  // Decline call mutation
  const declineCallMutation = useMutation({
    mutationFn: async (callId: string) => {
      return await apiRequest("PATCH", `/api/phone-calls/${callId}`, {
        status: "declined",
        endTime: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      toast({
        title: "Call Declined",
        description: "Call has been declined",
        variant: "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/phone-calls"] });
      incomingCallAudio.pause();
    },
  });

  // End call mutation
  const endCallMutation = useMutation({
    mutationFn: async (callId: string) => {
      return await apiRequest("PATCH", `/api/phone-calls/${callId}`, {
        status: "completed",
        endTime: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      toast({
        title: "Call Ended",
        description: "Call has been completed",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/phone-calls"] });
    },
  });

  // Play incoming call sound
  useEffect(() => {
    if (incomingCalls.length > 0) {
      incomingCallAudio.play().catch(console.error);
    } else {
      incomingCallAudio.pause();
    }

    return () => {
      incomingCallAudio.pause();
    };
  }, [incomingCalls.length, incomingCallAudio]);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ringing":
      case "incoming":
        return "bg-gradient-to-r from-red-500 to-red-600 animate-pulse";
      case "in_progress":
      case "connected":
        return "bg-gradient-to-r from-green-500 to-green-600";
      case "completed":
        return "bg-gradient-to-r from-blue-500 to-blue-600";
      case "missed":
        return "bg-gradient-to-r from-orange-500 to-orange-600";
      case "declined":
        return "bg-gradient-to-r from-red-500 to-red-600";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600";
    }
  };

  if (isLoading) {
    return (
      <Card className="h-full bg-gray-900/50 border-gray-700/50">
        <CardContent className="flex items-center justify-center h-full">
          <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full space-y-4">
      {/* Incoming Calls - Priority Display */}
      <AnimatePresence>
        {incomingCalls.map((call: PhoneCall) => (
          <motion.div
            key={call.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative"
          >
            <Card className="bg-gradient-to-r from-red-900/20 to-red-800/20 border-red-500/50 shadow-lg shadow-red-500/25">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center animate-pulse">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">
                        {call.memberName}
                      </CardTitle>
                      <p className="text-red-300 text-sm">{call.memberPhone}</p>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse">
                    INCOMING CALL
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">{call.reason}</p>
                <div className="flex space-x-3">
                  <Button
                    onClick={() => answerCallMutation.mutate(call.id)}
                    disabled={answerCallMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                  >
                    <PhoneCall className="w-4 h-4 mr-2" />
                    Answer
                  </Button>
                  <Button
                    onClick={() => declineCallMutation.mutate(call.id)}
                    disabled={declineCallMutation.isPending}
                    variant="destructive"
                    className="flex-1"
                  >
                    <PhoneOff className="w-4 h-4 mr-2" />
                    Decline
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Active Calls */}
      {activeCalls.length > 0 && (
        <Card className="bg-gray-900/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <PhoneCall className="w-5 h-5 mr-2 text-green-500" />
              Active Calls ({activeCalls.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeCalls.map((call: PhoneCall) => (
              <div
                key={call.id}
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{call.memberName}</p>
                    <p className="text-gray-400 text-sm">{call.memberPhone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center text-green-400">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="text-sm">{formatDuration(call.duration)}</span>
                  </div>
                  <Button
                    onClick={() => endCallMutation.mutate(call.id)}
                    disabled={endCallMutation.isPending}
                    variant="destructive"
                    size="sm"
                  >
                    <PhoneOff className="w-4 h-4 mr-1" />
                    End Call
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Calls */}
      <Card className="bg-gray-900/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-purple-500" />
            Recent Calls
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentCalls.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No recent calls</p>
          ) : (
            <div className="space-y-2">
              {recentCalls.map((call: PhoneCall) => (
                <div
                  key={call.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-800/30 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-300" />
                    </div>
                    <div>
                      <p className="text-white text-sm">{call.memberName}</p>
                      <p className="text-gray-400 text-xs">{call.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(call.status)}>
                      {call.status.toUpperCase()}
                    </Badge>
                    <span className="text-gray-400 text-xs">
                      {new Date(call.startTime).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* No Calls State */}
      {incomingCalls.length === 0 && activeCalls.length === 0 && recentCalls.length === 0 && (
        <Card className="bg-gray-900/50 border-gray-700/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Phone className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-white text-lg font-medium mb-2">Customer Service Ready</h3>
            <p className="text-gray-400 text-center">
              Waiting for incoming calls from members...
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}