import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import TravelService from '../services/travelService';
import { 
  Destination, 
  Hotel, 
  Flight, 
  Booking, 
  PaginationParams, 
  QueryParams 
} from '../types';

// Query keys
export const travelKeys = {
  all: ['travel'] as const,
  destinations: () => [...travelKeys.all, 'destinations'] as const,
  destination: (id: string) => [...travelKeys.destinations(), id] as const,
  hotels: () => [...travelKeys.all, 'hotels'] as const,
  hotel: (id: string) => [...travelKeys.hotels(), id] as const,
  flights: () => [...travelKeys.all, 'flights'] as const,
  flight: (id: string) => [...travelKeys.flights(), id] as const,
  bookings: () => [...travelKeys.all, 'bookings'] as const,
  packages: () => [...travelKeys.all, 'packages'] as const,
};

/**
 * Hook for fetching destinations with pagination
 */
export const useDestinations = (params: PaginationParams & QueryParams = { page: 1, limit: 10 }) => {
  return useQuery({
    queryKey: [...travelKeys.destinations(), params],
    queryFn: () => TravelService.getDestinations(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Hook for fetching a specific destination by ID
 */
export const useDestination = (id: string) => {
  return useQuery({
    queryKey: travelKeys.destination(id),
    queryFn: () => TravelService.getDestinationById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook for fetching hotels with pagination
 */
export const useHotels = (params: PaginationParams & QueryParams = { page: 1, limit: 10 }) => {
  return useQuery({
    queryKey: [...travelKeys.hotels(), params],
    queryFn: () => TravelService.getHotels(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Hook for fetching a specific hotel by ID
 */
export const useHotel = (id: string) => {
  return useQuery({
    queryKey: travelKeys.hotel(id),
    queryFn: () => TravelService.getHotelById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook for fetching flights with pagination
 */
export const useFlights = (params: PaginationParams & QueryParams = { page: 1, limit: 10 }) => {
  return useQuery({
    queryKey: [...travelKeys.flights(), params],
    queryFn: () => TravelService.getFlights(params),
    staleTime: 2 * 60 * 1000, // 2 minutes (flights change frequently)
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Hook for fetching a specific flight by ID
 */
export const useFlight = (id: string) => {
  return useQuery({
    queryKey: travelKeys.flight(id),
    queryFn: () => TravelService.getFlightById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for searching flights
 */
export const useFlightSearch = (searchParams: {
  from: string;
  to: string;
  departureDate: string;
  returnDate?: string;
  passengers?: number;
  class?: string;
}) => {
  return useQuery({
    queryKey: [...travelKeys.flights(), 'search', searchParams],
    queryFn: () => TravelService.searchFlights(searchParams),
    enabled: !!(searchParams.from && searchParams.to && searchParams.departureDate),
    staleTime: 1 * 60 * 1000, // 1 minute (search results are volatile)
  });
};

/**
 * Hook for fetching user bookings
 */
export const useBookings = (params: PaginationParams = { page: 1, limit: 10 }) => {
  return useQuery({
    queryKey: [...travelKeys.bookings(), params],
    queryFn: () => TravelService.getUserBookings(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Hook for creating a new booking
 */
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: TravelService.createBooking,
    onSuccess: (newBooking: Booking) => {
      // Invalidate and refetch bookings
      queryClient.invalidateQueries({ queryKey: travelKeys.bookings() });
      
      // Add new booking to cache
      queryClient.setQueryData(
        travelKeys.bookings(),
        (oldData: any) => {
          if (oldData?.data) {
            return {
              ...oldData,
              data: [newBooking, ...oldData.data],
              pagination: {
                ...oldData.pagination,
                total: oldData.pagination.total + 1,
              },
            };
          }
          return oldData;
        }
      );
    },
    onError: (error: Error) => {
      console.error('Create booking error:', error);
    },
  });
};

/**
 * Hook for canceling a booking
 */
export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: TravelService.cancelBooking,
    onSuccess: (_, bookingId: string) => {
      // Invalidate and refetch bookings
      queryClient.invalidateQueries({ queryKey: travelKeys.bookings() });
      
      // Remove canceled booking from cache
      queryClient.setQueryData(
        travelKeys.bookings(),
        (oldData: any) => {
          if (oldData?.data) {
            return {
              ...oldData,
              data: oldData.data.filter((booking: Booking) => booking.id !== bookingId),
              pagination: {
                ...oldData.pagination,
                total: Math.max(0, oldData.pagination.total - 1),
              },
            };
          }
          return oldData;
        }
      );
    },
    onError: (error: Error) => {
      console.error('Cancel booking error:', error);
    },
  });
};

/**
 * Hook for fetching travel packages
 */
export const usePackages = (params: PaginationParams & QueryParams = { page: 1, limit: 10 }) => {
  return useQuery({
    queryKey: [...travelKeys.packages(), params],
    queryFn: () => TravelService.getPackages(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    placeholderData: (previousData) => previousData,
  });
};
