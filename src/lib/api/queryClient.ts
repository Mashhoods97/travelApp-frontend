import { QueryClient } from '@tanstack/react-query';
import { API_CONFIG } from './config';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default stale time for queries
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Default cache time
      gcTime: 10 * 60 * 1000, // 10 minutes
      
      // Retry configuration
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch on window focus (only in production)
      refetchOnWindowFocus: API_CONFIG.NODE_ENV === 'production',
      
      // Refetch on reconnect
      refetchOnReconnect: true,
      
      // Refetch on mount
      refetchOnMount: true,
    },
    mutations: {
      // Retry mutations on network errors
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        
        // Retry up to 2 times for network errors
        return failureCount < 2;
      },
      
      // Retry delay for mutations
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      
      // Global error handler for mutations
      onError: (error: any) => {
        if (API_CONFIG.ENABLE_LOGGING) {
          console.error('Mutation error:', error);
        }
      },
    },
  },
});

export default queryClient;
