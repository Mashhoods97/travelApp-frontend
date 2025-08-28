# API Wrapper Documentation

This API wrapper provides a comprehensive solution for interacting with your Java backend API using React Query, Axios, and TypeScript.

## 🚀 Features

- **Type-safe API calls** with TypeScript interfaces
- **React Query integration** for caching, background updates, and optimistic updates
- **Automatic authentication** with JWT token management
- **Error handling** with centralized error management
- **Request/response interceptors** for common operations
- **Pagination support** for list endpoints
- **Retry logic** with exponential backoff
- **Utility functions** for common operations

## 📁 Project Structure

```
src/lib/api/
├── client.ts              # Axios client with interceptors
├── config.ts              # Environment configuration
├── constants.ts           # API endpoints and constants
├── types.ts               # TypeScript interfaces
├── utils.ts               # Utility functions
├── queryClient.ts         # React Query configuration
├── services/              # API service classes
│   ├── authService.ts     # Authentication operations
│   └── travelService.ts   # Travel-related operations
├── hooks/                 # React Query hooks
│   ├── useAuth.ts         # Authentication hooks
│   └── useTravel.ts       # Travel-related hooks
└── index.ts               # Main exports
```

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install @tanstack/react-query axios
```

### 2. Environment Configuration

Copy `env.example` to `.env` and configure your API settings:

```env
VITE_API_BASE_URL=http://localhost:8081/api
VITE_API_TIMEOUT=10000
VITE_NODE_ENV=development
```

### 3. Setup React Query Provider

In your main App component or entry point:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import queryClient from './lib/api/queryClient';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app components */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

## 📖 Usage Examples

### Authentication

```tsx
import { useSignIn, useSignOut, useAuth } from '@/lib/api';

function LoginForm() {
  const signIn = useSignIn();
  
  const handleSubmit = async (credentials: { email: string; password: string }) => {
    try {
      await signIn.mutateAsync(credentials);
      // Redirect or show success message
    } catch (error) {
      // Handle error
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
    </form>
  );
}

function UserProfile() {
  const { data: user, isLoading, error } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>Welcome, {user?.firstName}!</h1>
      <p>Email: {user?.email}</p>
    </div>
  );
}
```

### Travel Operations

```tsx
import { useDestinations, useHotels, useCreateBooking } from '@/lib/api';

function DestinationsList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useDestinations({ page, limit: 10 });
  
  if (isLoading) return <div>Loading destinations...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {data?.data.map(destination => (
        <DestinationCard key={destination.id} destination={destination} />
      ))}
      
      {/* Pagination */}
      <Pagination 
        currentPage={page}
        totalPages={data?.pagination.totalPages || 1}
        onPageChange={setPage}
      />
    </div>
  );
}

function HotelBooking({ hotelId }: { hotelId: string }) {
  const createBooking = useCreateBooking();
  
  const handleBooking = async (bookingData: any) => {
    try {
      await createBooking.mutateAsync({
        type: 'hotel',
        itemId: hotelId,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
      });
      // Show success message
    } catch (error) {
      // Handle error
    }
  };
  
  return (
    <button 
      onClick={handleBooking}
      disabled={createBooking.isPending}
    >
      {createBooking.isPending ? 'Booking...' : 'Book Now'}
    </button>
  );
}
```

### Direct Service Usage

```tsx
import { AuthService, TravelService } from '@/lib/api';

// Direct service calls (useful for non-React contexts)
async function handleLogout() {
  try {
    await AuthService.signOut();
    // Handle successful logout
  } catch (error) {
    // Handle error
  }
}

async function searchFlights(searchParams: any) {
  try {
    const flights = await TravelService.searchFlights(searchParams);
    return flights;
  } catch (error) {
    throw error;
  }
}
```

## 🔧 Configuration

### Customizing API Client

```tsx
import apiClient from '@/lib/api/client';

// Add custom headers
apiClient.defaults.headers.common['X-Custom-Header'] = 'value';

// Add request interceptor
apiClient.interceptors.request.use((config) => {
  // Custom logic here
  return config;
});
```

### Customizing React Query

```tsx
import { queryClient } from '@/lib/api/queryClient';

// Set default options
queryClient.setDefaultOptions({
  queries: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  },
});
```

## 🚨 Error Handling

The API wrapper provides centralized error handling:

```tsx
import { formatApiError } from '@/lib/api/utils';

try {
  await someApiCall();
} catch (error) {
  const formattedError = formatApiError(error);
  console.error(formattedError.message);
  console.error(formattedError.statusCode);
}
```

## 📱 Pagination

All list endpoints support pagination:

```tsx
const { data, isLoading } = useDestinations({
  page: 1,
  limit: 20,
  sortBy: 'name',
  sortOrder: 'asc'
});

// Access pagination info
const { total, totalPages, hasNext, hasPrev } = data?.pagination || {};
```

## 🔐 Authentication

The wrapper automatically handles:

- JWT token storage in localStorage
- Automatic token inclusion in requests
- Token refresh on expiration
- Automatic logout on authentication failure

## 🧪 Testing

### Mock API Responses

```tsx
import { queryClient } from '@/lib/api/queryClient';

// Set mock data for testing
queryClient.setQueryData(['travel', 'destinations'], {
  data: mockDestinations,
  pagination: mockPagination,
  success: true,
  statusCode: 200,
});
```

## 📚 API Reference

### Hooks

- `useAuth()` - Get current user authentication status
- `useSignIn()` - Sign in user
- `useSignUp()` - Sign up user
- `useSignOut()` - Sign out user
- `useDestinations()` - Get destinations list
- `useHotels()` - Get hotels list
- `useFlights()` - Get flights list
- `useBookings()` - Get user bookings
- `useCreateBooking()` - Create new booking
- `useCancelBooking()` - Cancel booking

### Services

- `AuthService` - Authentication operations
- `TravelService` - Travel-related operations

### Utilities

- `formatApiError()` - Format API errors
- `buildQueryString()` - Build query parameters
- `debounce()` - Debounce function calls
- `throttle()` - Throttle function calls
- `retryWithBackoff()` - Retry with exponential backoff

## 🔄 Migration from Existing Code

If you have existing API calls, you can gradually migrate:

1. Replace direct fetch/axios calls with service methods
2. Replace useState + useEffect with React Query hooks
3. Update error handling to use the centralized error system
4. Add TypeScript interfaces for your data

## 🆘 Troubleshooting

### Common Issues

1. **CORS errors**: Ensure your backend allows requests from your frontend domain
2. **Authentication errors**: Check that tokens are being sent correctly
3. **Type errors**: Verify that your backend response matches the TypeScript interfaces

### Debug Mode

Enable logging by setting in your `.env`:

```env
VITE_ENABLE_LOGGING=true
```

This will log all API requests, responses, and errors to the console.

## 🤝 Contributing

When adding new endpoints:

1. Add endpoint to `constants.ts`
2. Create TypeScript interfaces in `types.ts`
3. Add service methods in appropriate service file
4. Create React Query hooks in appropriate hooks file
5. Export from `index.ts`
6. Update this documentation

## 📄 License

This API wrapper is part of your Travel Portal Application project.
