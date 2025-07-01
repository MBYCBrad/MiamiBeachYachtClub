import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { TourRequest, InsertTourRequest } from '@shared/schema';

// Query hook for fetching all tour requests (Admin/Staff only)
export function useTourRequests() {
  return useQuery({
    queryKey: ['/api/tour-requests'],
    queryFn: async (): Promise<TourRequest[]> => {
      const response = await apiRequest('GET', '/api/tour-requests');
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText || 'Failed to fetch tour requests'}`);
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Query hook for fetching a single tour request
export function useTourRequest(id: number) {
  return useQuery({
    queryKey: ['/api/tour-requests', id],
    queryFn: async (): Promise<TourRequest> => {
      const response = await apiRequest('GET', `/api/tour-requests/${id}`);
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText || 'Failed to fetch tour request'}`);
      }
      return response.json();
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

// Mutation hook for creating a tour request (Public)
export function useCreateTourRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tourRequestData: InsertTourRequest): Promise<TourRequest> => {
      const response = await apiRequest('POST', '/api/tour-requests', tourRequestData);
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText || 'Failed to create tour request'}`);
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch tour requests
      queryClient.invalidateQueries({ queryKey: ['/api/tour-requests'] });
    },
  });
}

// Mutation hook for updating a tour request (Admin/Staff only)
export function useUpdateTourRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertTourRequest> }): Promise<TourRequest> => {
      const response = await apiRequest('PUT', `/api/tour-requests/${id}`, data);
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText || 'Failed to update tour request'}`);
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate and refetch tour requests
      queryClient.invalidateQueries({ queryKey: ['/api/tour-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tour-requests', data.id] });
    },
  });
}

// Mutation hook for scheduling a tour request (Admin/Staff only)
export function useScheduleTourRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      scheduledDateTime, 
      assignedTo, 
      notes 
    }: { 
      id: number; 
      scheduledDateTime: string; 
      assignedTo?: number; 
      notes?: string; 
    }): Promise<TourRequest> => {
      const response = await apiRequest('PUT', `/api/tour-requests/${id}`, {
        status: 'confirmed',
        scheduledDateTime: new Date(scheduledDateTime).toISOString(),
        assignedTo,
        notes,
        confirmedAt: new Date().toISOString()
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText || 'Failed to schedule tour'}`);
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate and refetch tour requests
      queryClient.invalidateQueries({ queryKey: ['/api/tour-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tour-requests', data.id] });
    },
  });
}

// Mutation hook for deleting a tour request (Admin only)
export function useDeleteTourRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const response = await apiRequest('DELETE', `/api/tour-requests/${id}`);
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText || 'Failed to delete tour request'}`);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch tour requests
      queryClient.invalidateQueries({ queryKey: ['/api/tour-requests'] });
    },
  });
}