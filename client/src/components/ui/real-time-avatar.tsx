import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import { useEffect } from "react";

interface RealTimeAvatarProps {
  userId?: number;
  username?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showOnlineStatus?: boolean;
}

const sizeClasses = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm", 
  lg: "h-10 w-10 text-base",
  xl: "h-12 w-12 text-lg"
};

export function RealTimeAvatar({ 
  userId, 
  username, 
  size = "md", 
  className = "", 
  showOnlineStatus = false 
}: RealTimeAvatarProps) {
  const { user: currentUser } = useAuth();
  
  // Use current user if no userId provided
  const targetUserId = userId || currentUser?.id;
  const displayUsername = username || currentUser?.username;

  // Query for user profile data with aggressive caching and real-time updates
  const { data: userProfile, refetch } = useQuery({
    queryKey: [`/api/user/profile/${targetUserId}`],
    queryFn: async () => {
      if (!targetUserId) return null;
      const response = await fetch(`/api/user/profile/${targetUserId}`, {
        credentials: 'include'
      });
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!targetUserId,
    staleTime: 0, // Always fresh for profile pictures
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  // Listen for profile updates across the application
  useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      const { userId: updatedUserId } = event.detail;
      if (updatedUserId === targetUserId) {
        // Invalidate and refetch user profile
        queryClient.invalidateQueries({ queryKey: [`/api/user/profile/${targetUserId}`] });
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        refetch();
      }
    };

    // Listen for global profile update events
    window.addEventListener('profileUpdated', handleProfileUpdate as EventListener);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate as EventListener);
    };
  }, [targetUserId, refetch]);

  // Generate avatar URL with cache busting
  const avatarUrl = userProfile?.avatarUrl 
    ? `${userProfile.avatarUrl}?v=${Date.now()}` 
    : null;

  // Generate initials from username
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className={`relative ${className}`}>
      <Avatar className={`${sizeClasses[size]} ring-2 ring-purple-500/20 transition-all duration-300 hover:ring-purple-400/40`}>
        <AvatarImage 
          src={avatarUrl || undefined}
          alt={displayUsername || "User"}
          className="object-cover"
          key={avatarUrl} // Force re-render when URL changes
        />
        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white font-semibold">
          {displayUsername ? getInitials(displayUsername) : "U"}
        </AvatarFallback>
      </Avatar>
      
      {showOnlineStatus && (
        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-400 border-2 border-gray-900 animate-pulse" />
      )}
    </div>
  );
}

// Helper function to trigger profile updates globally
export function triggerProfileUpdate(userId: number) {
  // Dispatch custom event for real-time updates
  const event = new CustomEvent('profileUpdated', {
    detail: { userId }
  });
  window.dispatchEvent(event);
  
  // Also invalidate relevant queries immediately
  queryClient.invalidateQueries({ queryKey: [`/api/user/profile/${userId}`] });
  queryClient.invalidateQueries({ queryKey: ["/api/user"] });
  queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
  queryClient.invalidateQueries({ queryKey: ["/api/admin/staff"] });
}