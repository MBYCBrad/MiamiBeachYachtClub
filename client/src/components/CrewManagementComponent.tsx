import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Ship, Clock, Users, UserCheck, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface CrewMember {
  id: number;
  username: string;
  role: string;
  rating?: number;
  status?: string;
}

interface Yacht {
  id: number;
  name: string;
  type: string;
  length: string;
  capacity: number;
}

interface Member {
  id: number;
  name: string;
}

interface Booking {
  id: number;
  startTime: string;
  endTime: string;
  guestCount: number;
  yacht?: Yacht;
  member?: Member;
}

interface AssignCrewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking;
  crew: CrewMember[];
  onAssign: (assignment: any) => void;
}

function AssignCrewDialog({ booking, crew, onAssign, open, onOpenChange }: AssignCrewDialogProps) {
  const [selectedCaptain, setSelectedCaptain] = useState<string>('');
  const [selectedFirstMate, setSelectedFirstMate] = useState<string>('');
  const [selectedCrew, setSelectedCrew] = useState<string[]>([]);

  // Early return if booking is not provided
  if (!booking) {
    return null;
  }

  // Fetch real staff data from database
  const { data: allStaff = [], isLoading } = useQuery<CrewMember[]>({
    queryKey: ['/api/admin/staff'],
  });

  // Get yacht details from booking
  const { data: yachtData } = useQuery({
    queryKey: ['/api/admin/yachts'],
  });

  const yacht = yachtData?.find((y: any) => y.id === booking.yacht?.id) || booking.yacht;

  // Filter real staff by roles using actual database roles
  const captains = allStaff.filter(member => 
    member.role?.toLowerCase().includes('captain') || 
    member.role === 'Yacht Captain'
  );
  
  const firstMates = allStaff.filter(member => 
    member.role?.toLowerCase().includes('mate') || 
    member.role === 'First Mate' ||
    member.role === 'Fleet Coordinator'
  );
  
  const crewMembers = allStaff.filter(member => 
    member.role?.toLowerCase().includes('crew') || 
    member.role === 'Crew Supervisor' ||
    member.role?.toLowerCase().includes('specialist') ||
    member.role?.toLowerCase().includes('coordinator')
  );

  const handleCrewToggle = (memberId: string) => {
    setSelectedCrew(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleAssign = () => {
    if (!booking) return;
    
    const assignment = {
      bookingId: booking.id,
      captainId: parseInt(selectedCaptain),
      firstMateId: selectedFirstMate ? parseInt(selectedFirstMate) : null,
      crewMembers: selectedCrew.map(id => parseInt(id)),
      briefingTime: new Date(new Date(booking.startTime).getTime() - 60 * 60 * 1000).toISOString(),
      assignmentNotes: `Crew assignment for ${yacht?.name || 'yacht'} charter`
    };
    onAssign(assignment);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-purple-500/30 shadow-2xl max-w-2xl max-h-[70vh] overflow-y-auto">
        <DialogHeader className="text-center border-b border-gray-700/50 pb-2">
          <DialogTitle className="text-lg font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Assign Crew to Charter
          </DialogTitle>
        </DialogHeader>
      
        <div className="p-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Left Side - Details */}
            <div className="space-y-3">
              {/* Yacht Details */}
              <div className="bg-gradient-to-br from-gray-800/80 via-gray-800/60 to-gray-900/80 rounded-lg p-2.5 border border-gray-700/40 shadow-xl backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-purple-500/20 p-1 rounded border border-purple-400/30">
                    <Ship className="w-3 h-3 text-purple-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Yacht Details</h3>
                </div>
                
                {/* Yacht Image */}
                <div className="mb-2 rounded overflow-hidden border border-gray-700/30">
                  <img 
                    src={yacht?.id ? `/api/media/yachts/${yacht.id}/image` : '/api/media/yachts/1/image'}
                    alt={yacht?.name || 'Yacht'}
                    className="w-full h-16 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0yMDAgMTAwTDE4MCA4MEgyMjBMMjAwIDEwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2Zz4K';
                    }}
                  />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center p-1 bg-gray-800/50 rounded text-xs border border-gray-700/30">
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white font-semibold">{yacht?.name || 'Royal Serenity'}</span>
                  </div>
                  <div className="flex justify-between items-center p-1 bg-gray-800/50 rounded text-xs border border-gray-700/30">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white font-semibold">{yacht?.type || 'Luxury Motor Yacht'}</span>
                  </div>
                  <div className="flex justify-between items-center p-1 bg-gray-800/50 rounded text-xs border border-gray-700/30">
                    <span className="text-gray-400">Length:</span>
                    <span className="text-white font-semibold">{yacht?.length || '65 ft'}</span>
                  </div>
                  <div className="flex justify-between items-center p-1 bg-gray-800/50 rounded text-xs border border-gray-700/30">
                    <span className="text-gray-400">Capacity:</span>
                    <span className="text-white font-semibold">{yacht?.capacity || 24} guests</span>
                  </div>
                </div>
              </div>

              {/* Charter Information */}
              <div className="bg-gradient-to-br from-gray-800/80 via-gray-800/60 to-gray-900/80 rounded-lg p-2.5 border border-gray-700/40">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-blue-500/20 p-1 rounded border border-blue-400/30">
                    <Calendar className="w-3 h-3 text-blue-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Charter Info</h3>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center p-1 bg-gray-800/50 rounded text-xs border border-gray-700/30">
                    <span className="text-gray-400">Date:</span>
                    <span className="text-white font-semibold">
                      {booking.startTime ? format(new Date(booking.startTime), 'MMM dd, yyyy') : 'Not specified'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-1 bg-gray-800/50 rounded text-xs border border-gray-700/30">
                    <span className="text-gray-400">Time:</span>
                    <span className="text-white font-semibold">
                      {booking.startTime && booking.endTime 
                        ? `${format(new Date(booking.startTime), 'HH:mm')} - ${format(new Date(booking.endTime), 'HH:mm')}`
                        : 'Not specified'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-1 bg-gray-800/50 rounded text-xs border border-gray-700/30">
                    <span className="text-gray-400">Guests:</span>
                    <span className="text-white font-semibold">{booking.guestCount || 0} people</span>
                  </div>
                  <div className="flex justify-between items-center p-1 bg-gray-800/50 rounded text-xs border border-gray-700/30">
                    <span className="text-gray-400">Member:</span>
                    <span className="text-white font-semibold">{booking.member?.name || 'VIP Member'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Crew Selection */}
            <div className="space-y-3">
              {/* Captain Selection */}
              <div className="bg-gradient-to-br from-gray-800/80 via-gray-800/60 to-gray-900/80 rounded-lg p-2.5 border border-gray-700/40">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-yellow-500/20 p-1 rounded border border-yellow-400/30">
                    <UserCheck className="w-3 h-3 text-yellow-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Captain</h3>
                  <span className="text-xs text-red-400">*Required</span>
                </div>
                
                <Select value={selectedCaptain} onValueChange={setSelectedCaptain}>
                  <SelectTrigger className="bg-gray-800/60 border-gray-600 text-white h-7 text-xs">
                    <SelectValue placeholder="Select Captain" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {isLoading ? (
                      <SelectItem value="loading" disabled className="text-gray-400 text-xs">Loading captains...</SelectItem>
                    ) : captains.length === 0 ? (
                      <SelectItem value="none" disabled className="text-gray-400 text-xs">No captains available</SelectItem>
                    ) : (
                      captains.map((captain) => (
                        <SelectItem key={captain.id} value={captain.id.toString()} className="text-white text-xs">
                          <div className="flex items-center justify-between w-full">
                            <span>{captain.username}</span>
                            <Badge variant="outline" className="ml-2 text-xs border-yellow-500 text-yellow-400">
                              {captain.role}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* First Mate Selection */}
              <div className="bg-gradient-to-br from-gray-800/80 via-gray-800/60 to-gray-900/80 rounded-lg p-2.5 border border-gray-700/40">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-green-500/20 p-1 rounded border border-green-400/30">
                    <Users className="w-3 h-3 text-green-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white">First Mate</h3>
                  <span className="text-xs text-gray-400">Optional</span>
                </div>
                
                <Select value={selectedFirstMate} onValueChange={setSelectedFirstMate}>
                  <SelectTrigger className="bg-gray-800/60 border-gray-600 text-white h-7 text-xs">
                    <SelectValue placeholder="Select First Mate" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="" className="text-gray-400 text-xs">None</SelectItem>
                    {isLoading ? (
                      <SelectItem value="loading" disabled className="text-gray-400 text-xs">Loading first mates...</SelectItem>
                    ) : firstMates.length === 0 ? (
                      <SelectItem value="none" disabled className="text-gray-400 text-xs">No first mates available</SelectItem>
                    ) : (
                      firstMates.map((mate) => (
                        <SelectItem key={mate.id} value={mate.id.toString()} className="text-white text-xs">
                          <div className="flex items-center justify-between w-full">
                            <span>{mate.username}</span>
                            <Badge variant="outline" className="ml-2 text-xs border-green-500 text-green-400">
                              {mate.role}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Crew */}
              <div className="bg-gradient-to-br from-gray-800/80 via-gray-800/60 to-gray-900/80 rounded-lg p-2.5 border border-gray-700/40">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-cyan-500/20 p-1 rounded border border-cyan-400/30">
                    <Users className="w-3 h-3 text-cyan-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Additional Crew</h3>
                  <span className="text-xs text-gray-400">Optional</span>
                </div>
                
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {isLoading ? (
                    <p className="text-gray-400 text-xs">Loading crew members...</p>
                  ) : crewMembers.length === 0 ? (
                    <p className="text-gray-400 text-xs">No additional crew available</p>
                  ) : (
                    crewMembers.map((member) => (
                      <div 
                        key={member.id}
                        onClick={() => handleCrewToggle(member.id.toString())}
                        className={`p-1.5 rounded cursor-pointer border text-xs transition-all ${
                          selectedCrew.includes(member.id.toString())
                            ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                            : 'bg-gray-800/50 border-gray-600/50 text-gray-300 hover:bg-gray-700/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{member.username}</span>
                          <Badge variant="outline" className="text-xs border-cyan-500 text-cyan-400">
                            {member.role}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {!isLoading && crewMembers.length === 0 && (
                  <p className="text-gray-400 text-xs">No additional crew members available</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-3 mt-3 border-t border-gray-700/50">
          <Button 
            onClick={() => onOpenChange(false)} 
            variant="outline" 
            className="border-gray-600 text-gray-300 hover:bg-gray-700 h-7 text-xs"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAssign}
            disabled={!selectedCaptain || isLoading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white h-7 text-xs"
          >
            Assign Crew
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { AssignCrewDialog };

export default AssignCrewDialog;