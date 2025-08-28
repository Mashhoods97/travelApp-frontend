import apiClient from '../client';
import { API_ENDPOINTS } from '../constants';
import { 
  Destination, 
  Hotel, 
  Flight, 
  Booking, 
  PaginationParams, 
  PaginatedResponse,
  ApiResponse,
  QueryParams,
  CreateDestinationRequest,
  UpdateDestinationRequest,
  CreateHotelRequest,
  UpdateHotelRequest
} from '../types';

export class TravelService {
  /**
   * Get destinations with pagination and filters
   */
  static async getDestinations(
    params: QueryParams = { page: 1, size: 10 }
  ): Promise<PaginatedResponse<Destination>> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(
        API_ENDPOINTS.DESTINATION.PAGED,
        { params }
      );
      const payload = response.data;
      if (payload.success && payload.data) {
        const page = payload.data;
        const content: Destination[] = (page.content || []).map((d: any) => ({
          id: String(d.id),
          name: d.name,
          slug: d.slug,
          country: d.country,
          region: d.region,
          description: d.description,
          language: d.language,
          currency: d.currency,
        }));
        const normalized: PaginatedResponse<Destination> = {
          success: true,
          statusCode: payload.status ?? 200,
          data: content,
          message: payload.message,
          pagination: {
            page: page.currentPage ?? params.page ?? 1,
            limit: page.pageSize ?? params.size ?? 10,
            total: page.totalElements ?? content.length,
            totalPages: page.totalPages ?? 1,
            hasNext: page.hasNext ?? false,
            hasPrev: page.hasPrevious ?? false,
          },
        };
        return normalized;
      }
      throw new Error(payload.message || 'Failed to fetch destinations');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch destinations');
    }
  }

  /**
   * Get destination by ID
   */
  static async getDestinationById(id: string): Promise<Destination> {
    try {
      const response = await apiClient.get<ApiResponse<Destination>>(
        API_ENDPOINTS.DESTINATION.BY_ID(id)
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Destination not found');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Destination not found');
    }
  }

  static async getDestinationMap(): Promise<Record<string, string>> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(
        API_ENDPOINTS.DESTINATION.GET_MAP
      );
      if (response.data.success && response.data.data) {
        return response.data.data as Record<string, string>;
      }
      throw new Error(response.data.message || 'Failed to fetch destinations map');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch destinations map');
    }
  }

  /**
   * Create destination (master-data)
   */
  static async createDestination(payload: CreateDestinationRequest): Promise<Destination> {
    try {
      const response = await apiClient.post<ApiResponse<Destination>>(
        API_ENDPOINTS.DESTINATION.BASE,
        payload
      );
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to create destination');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create destination');
    }
  }

  /**
   * Update destination
   */
  static async updateDestination(id: string | number, payload: UpdateDestinationRequest): Promise<Destination> {
    try {
      const response = await apiClient.put<ApiResponse<Destination>>(
        API_ENDPOINTS.DESTINATION.BY_ID(id),
        payload
      );
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to update destination');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update destination');
    }
  }

  /**
   * Archive (delete) destination
   */
  static async archiveDestination(id: string | number): Promise<boolean> {
    try {
      const response = await apiClient.delete<ApiResponse<null>>(
        API_ENDPOINTS.DESTINATION.BY_ID(id)
      );
      if (response.data.success) {
        return true;
      }
      throw new Error(response.data.message || 'Failed to delete destination');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete destination');
    }
  }

  /**
   * Get hotels with pagination and filters
   */
  static async getHotels(
    params: QueryParams = { page: 1, size: 10 }
  ): Promise<PaginatedResponse<Hotel>> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(
        API_ENDPOINTS.HOTEL.PAGED,
        { params }
      );
      const payload = response.data;
      if (payload.success && payload.data) {
        const page = payload.data;
        const content: Hotel[] = (page.content || []).map((h: any) => ({
          id: String(h.id),
          name: h.name,
          slug: h.slug,
          address: h.address,
          phone: h.phone,
          description: h.description,
          destinationId: h.destinationId,
          starRating: h.starRating,
          checkInTime: h.checkInTime,
          checkOutTime: h.checkOutTime,
          amenities: h.amenities,
        }));
        const normalized: PaginatedResponse<Hotel> = {
          success: true,
          statusCode: payload.status ?? 200,
          data: content,
          message: payload.message,
          pagination: {
            page: page.currentPage ?? params.page ?? 1,
            limit: page.pageSize ?? params.size ?? 10,
            total: page.totalElements ?? content.length,
            totalPages: page.totalPages ?? 1,
            hasNext: page.hasNext ?? false,
            hasPrev: page.hasPrevious ?? false,
          },
        };
        return normalized;
      }
      throw new Error(payload.message || 'Failed to fetch hotels');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch hotels');
    }
  }

  /**
   * Get hotel by ID
   */
  static async getHotelById(id: string): Promise<Hotel> {
    try {
      const response = await apiClient.get<ApiResponse<Hotel>>(
        API_ENDPOINTS.HOTEL.BY_ID(id)
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data as any;
      }
      
      throw new Error(response.data.message || 'Hotel not found');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Hotel not found');
    }
  }

  static async createHotel(payload: CreateHotelRequest): Promise<Hotel> {
    try {
      const response = await apiClient.post<ApiResponse<Hotel>>(
        API_ENDPOINTS.HOTEL.BASE,
        payload
      );
      if (response.data.success && response.data.data) {
        return response.data.data as any;
      }
      throw new Error(response.data.message || 'Failed to create hotel');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create hotel');
    }
  }

  static async updateHotel(id: string | number, payload: UpdateHotelRequest): Promise<Hotel> {
    try {
      const response = await apiClient.put<ApiResponse<Hotel>>(
        API_ENDPOINTS.HOTEL.BY_ID(id),
        payload
      );
      if (response.data.success && response.data.data) {
        return response.data.data as any;
      }
      throw new Error(response.data.message || 'Failed to update hotel');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update hotel');
    }
  }

  static async archiveHotel(id: string | number): Promise<boolean> {
    try {
      const response = await apiClient.delete<ApiResponse<null>>(
        API_ENDPOINTS.HOTEL.BY_ID(id)
      );
      if (response.data.success) {
        return true;
      }
      throw new Error(response.data.message || 'Failed to delete hotel');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete hotel');
    }
  }

  /**
   * Get flights with pagination and filters
   */
  static async getFlights(
    params: PaginationParams & QueryParams = { page: 1, limit: 10 }
  ): Promise<PaginatedResponse<Flight>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Flight>>(
        API_ENDPOINTS.TRAVEL.FLIGHTS,
        { params }
      );
      
      if (response.data.success) {
        return response.data;
      }
      
      throw new Error(response.data.message || 'Failed to fetch flights');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch flights');
    }
  }

  /**
   * Get flight by ID
   */
  static async getFlightById(id: string): Promise<Flight> {
    try {
      const response = await apiClient.get<ApiResponse<Flight>>(
        `${API_ENDPOINTS.TRAVEL.FLIGHTS}/${id}`
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Flight not found');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Flight not found');
    }
  }

  /**
   * Search flights with specific criteria
   */
  static async searchFlights(searchParams: {
    from: string;
    to: string;
    departureDate: string;
    returnDate?: string;
    passengers?: number;
    class?: string;
  }): Promise<Flight[]> {
    try {
      const response = await apiClient.get<ApiResponse<Flight[]>>(
        `${API_ENDPOINTS.TRAVEL.FLIGHTS}/search`,
        { params: searchParams }
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Flight search failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Flight search failed');
    }
  }

  /**
   * Get user bookings
   */
  static async getUserBookings(
    params: PaginationParams = { page: 1, limit: 10 }
  ): Promise<PaginatedResponse<Booking>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Booking>>(
        API_ENDPOINTS.TRAVEL.BOOKINGS,
        { params }
      );
      
      if (response.data.success) {
        return response.data;
      }
      
      throw new Error(response.data.message || 'Failed to fetch bookings');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch bookings');
    }
  }

  /**
   * Create a new booking
   */
  static async createBooking(bookingData: {
    type: 'hotel' | 'flight' | 'package';
    itemId: string;
    startDate: string;
    endDate: string;
    passengers?: number;
    specialRequests?: string;
  }): Promise<Booking> {
    try {
      const response = await apiClient.post<ApiResponse<Booking>>(
        API_ENDPOINTS.TRAVEL.BOOKINGS,
        bookingData
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to create booking');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create booking');
    }
  }

  /**
   * Cancel a booking
   */
  static async cancelBooking(bookingId: string): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse>(
        `${API_ENDPOINTS.TRAVEL.BOOKINGS}/${bookingId}`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to cancel booking');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to cancel booking');
    }
  }

  /**
   * Get travel packages
   */
  static async getPackages(
    params: PaginationParams & QueryParams = { page: 1, limit: 10 }
  ): Promise<PaginatedResponse<any>> {
    try {
      const response = await apiClient.get<PaginatedResponse<any>>(
        API_ENDPOINTS.TRAVEL.PACKAGES,
        { params }
      );
      
      if (response.data.success) {
        return response.data;
      }
      
      throw new Error(response.data.message || 'Failed to fetch packages');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch packages');
    }
  }
}

export default TravelService;
