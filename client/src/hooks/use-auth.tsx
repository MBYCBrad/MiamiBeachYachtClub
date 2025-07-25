import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type AuthContextType = {
  user: SelectUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: 0, // No retries for instant response
    staleTime: 0, // Always fresh data to ensure profile image updates
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnMount: true,
    refetchOnWindowFocus: true, // Refetch on window focus to get latest data
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username}!`,
      });
      
      // Instant client-side navigation without page reload
      if (user.role === "admin") {
        setLocation("/admin");
      } else if (user.role === "yacht_owner") {
        setLocation("/yacht-owner");
      } else if (user.role === "service_provider") {
        setLocation("/service-provider");
      } else if (user.role === "staff") {
        setLocation("/staff-portal");
      } else if (user.role === "member") {
        setLocation("/member");
      } else {
        setLocation("/");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: `Welcome to MBYC, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Clear user data immediately when logout is triggered
      queryClient.setQueryData(["/api/user"], null);
      queryClient.clear(); // Clear all cached data
      
      // Call logout endpoint to destroy session
      await fetch('/api/logout', { method: 'GET' });
    },
    onSuccess: () => {
      // Ensure user state is null and invalidate any remaining cache
      queryClient.setQueryData(["/api/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
      // Navigate to home page immediately
      setLocation('/');
    },
    onError: (error: Error) => {
      // If logout fails, still clear frontend state for security
      queryClient.setQueryData(["/api/user"], null);
      queryClient.clear();
      setLocation('/');
      
      toast({
        title: "Logged out",
        description: "You have been logged out locally.",
        variant: "default",
      });
    },
  });

  const isLoadingAuth = isLoading || loginMutation.isPending || logoutMutation.isPending || registerMutation.isPending;

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isAuthenticated: !!user,
        isLoading: isLoadingAuth,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}