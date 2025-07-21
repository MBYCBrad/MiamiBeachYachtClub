import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useYachtWebSocket() {
  const queryClient = useQueryClient();
  
  // Temporarily disabled to prevent WebSocket connection errors
  // TODO: Implement proper WebSocket channel handling on server side
  
  return null;
}