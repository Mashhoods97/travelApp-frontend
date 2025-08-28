// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    SIGNIN: '/auth/signin',
    SIGNUP: '/auth/signup',
    SIGNOUT: '/auth/signout',
    REFRESH: '/auth/refresh',
    VERIFY: '/auth/verify',
  },
  // User endpoints
  USER: {
    PROFILE: '/users/profile',
    CREATE: '/users',
    UPDATE: (id: string | number) => `/users/${id}`,
    DELETE: (id: string | number) => `/users/${id}`,
    LIST_PAGED: '/users/paged',
  },
  ROLE: {
    LIST: '/roles/get',
  },
  // Travel endpoints (assuming this is a travel portal)
  TRAVEL: {
    DESTINATIONS: '/destinations',
    BOOKINGS: '/travel/bookings',
    HOTELS: '/hotels',
    FLIGHTS: '/travel/flights',
    PACKAGES: '/travel/packages',
  },
  // Master-data endpoints
  DESTINATION: {
    BASE: '/destinations',
    BY_ID: (id: string | number) => `/destinations/${id}`,
    PAGED: '/destinations/paged',
    GET_MAP: '/destinations/get',
  },
  HOTEL: {
    BASE: '/hotels',
    BY_ID: (id: string | number) => `/hotels/${id}`,
    PAGED: '/hotels/paged',
  },
} as const;

// User Types (static, globally reusable)
export const USER_TYPES = {
  OWNER: -1,
  RESELLER: 100,
  HEAD: 110,
  MANAGER: 120,
  SALES_MANAGER: 130,
  CLIENT: 140,
  CUSTOMER: 150,
} as const;

export type UserTypeKey = keyof typeof USER_TYPES;
export type UserTypeValue = typeof USER_TYPES[UserTypeKey];

export const USER_TYPE_OPTIONS: Array<{ label: UserTypeKey; value: UserTypeValue }> = (
  Object.keys(USER_TYPES) as UserTypeKey[]
).map((k) => ({ label: k, value: USER_TYPES[k] }));

export const getUserTypeLabel = (value?: number | null): UserTypeKey | 'UNKNOWN' => {
  if (value === undefined || value === null) return 'UNKNOWN';
  const entry = Object.entries(USER_TYPES).find(([, v]) => v === value) as [UserTypeKey, number] | undefined;
  return entry ? entry[0] : 'UNKNOWN';
};

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const;

// API Response Status
export const API_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  LOADING: 'loading',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  FORBIDDEN: 'Access forbidden.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Internal server error. Please try again later.',
  VALIDATION_ERROR: 'Validation error. Please check your input.',
  TIMEOUT: 'Request timeout. Please try again.',
} as const;

// Request Timeouts
export const TIMEOUTS = {
  DEFAULT: 10000,
  UPLOAD: 30000,
  DOWNLOAD: 60000,
} as const;
