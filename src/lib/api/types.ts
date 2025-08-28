// Common API Response structure
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode: number;
}

// Pagination interface
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Auth Types
export interface SignInRequest {
  username: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresIn?: number;
}

export interface User {
  id: string | number;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: 'user' | 'admin' | 'moderator' | string;
  roleId?: number;
  roleName?: string;
  username?: string;
  privileges?: string[];
  type?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Backend-specific sign-in payload shape (as provided)
export interface BackendSignInData {
  accessToken: string;
  id: number;
  username: string;
  email: string;
  type: number;
  privileges: string[];
  tokenType: string;
  roleId?: number;
  roleName?: string;
}

export interface BackendSignInResponse extends ApiResponse<BackendSignInData> {}

// Create User payload (as provided)
export interface CreateUserRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  roleId: number;
  password: string;
  type: number;
}

export interface UpdateUserRequest {
  active?: boolean;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  roleId?: number;
  type?: number;
}

// Role types
export interface Role {
  id: number;
  title: string;
}

// Travel Types
export interface Destination {
  id: string;
  name: string;
  slug?: string;
  country: string;
  region?: string;
  description: string;
  language?: string;
  currency?: string;
  imageUrl?: string;
  rating?: number;
  price?: number;
}

export interface CreateDestinationRequest {
  name: string;
  slug: string;
  country: string;
  region?: string;
  description: string;
  language?: string;
  currency?: string;
}

export interface UpdateDestinationRequest {
  name?: string;
  slug?: string;
  country?: string;
  region?: string;
  description?: string;
  language?: string;
  currency?: string;
}

export interface Hotel {
  id: string;
  name: string;
  slug?: string;
  address: string;
  phone?: string;
  description: string;
  destinationId?: string | number;
  starRating?: number;
  checkInTime?: string; // HH:mm
  checkOutTime?: string; // HH:mm
  amenities?: Record<string, any>;
  imageUrls?: string[];
}

export interface CreateHotelRequest {
  name: string;
  slug: string;
  address: string;
  phone?: string;
  description: string;
  destinationId: number | string;
  starRating: number;
  checkInTime: string; // HH:mm
  checkOutTime: string; // HH:mm
  amenities?: Record<string, any>;
}

export interface UpdateHotelRequest {
  name?: string;
  slug?: string;
  address?: string;
  phone?: string;
  description?: string;
  destinationId?: number | string;
  starRating?: number;
  checkInTime?: string; // HH:mm
  checkOutTime?: string; // HH:mm
  amenities?: Record<string, any>;
}

export interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  departure: {
    airport: string;
    city: string;
    time: string;
  };
  arrival: {
    airport: string;
    city: string;
    time: string;
  };
  price: number;
  currency: string;
  duration: number;
  stops: number;
}

export interface Booking {
  id: string;
  userId: string;
  type: 'hotel' | 'flight' | 'package';
  itemId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

// Error Types
export interface ApiError {
  message: string;
  statusCode: number;
  details?: any;
  timestamp: string;
}

// Request Headers
export interface RequestHeaders {
  Authorization?: string;
  'Content-Type'?: string;
  'Accept'?: string;
  [key: string]: string | undefined;
}

// Query Parameters
export interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}
