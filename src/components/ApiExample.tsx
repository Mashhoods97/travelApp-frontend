import React, { useState } from 'react';
import { 
  useSignIn, 
  useAuth, 
  useSignOut, 
  useDestinations, 
  useHotels,
  useCreateBooking,
  SignInRequest 
} from '../lib/api';

/**
 * Example component demonstrating the API wrapper usage
 */
export const ApiExample: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [page, setPage] = useState(1);

  // Authentication hooks
  const signIn = useSignIn();
  const { data: user, isLoading: authLoading } = useAuth();
  const signOut = useSignOut();

  // Travel data hooks
  const { data: destinations, isLoading: destLoading } = useDestinations({ page, limit: 5 });
  const { data: hotels, isLoading: hotelsLoading } = useHotels({ page, limit: 5 });
  const createBooking = useCreateBooking();

  // Handle sign in
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      await signIn.mutateAsync({ username: email, password });
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut.mutateAsync();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  // Handle booking creation
  const handleCreateBooking = async (type: 'hotel' | 'flight', itemId: string) => {
    try {
      await createBooking.mutateAsync({
        type,
        itemId,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      alert('Booking created successfully!');
    } catch (error) {
      console.error('Booking creation failed:', error);
      alert('Failed to create booking');
    }
  };

  if (authLoading) {
    return <div className="p-4">Loading authentication...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">API Wrapper Example</h1>

      {/* Authentication Section */}
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Authentication</h2>
        
        {!user ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={signIn.isPending}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {signIn.isPending ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-green-100 rounded">
              <p><strong>Welcome, {user.firstName} {user.lastName}!</strong></p>
              <p>Email: {user.email}</p>
              <p>Role: {user.role}</p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={signOut.isPending}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              {signOut.isPending ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        )}
      </div>

      {/* Destinations Section */}
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Destinations</h2>
        
        {destLoading ? (
          <div>Loading destinations...</div>
        ) : (
          <div className="space-y-4">
            {destinations?.data?.map((destination) => (
              <div key={destination.id} className="p-3 border rounded">
                <h3 className="font-medium">{destination.name}</h3>
                <p className="text-sm text-gray-600">{destination.city}, {destination.country}</p>
                <p className="text-sm">{destination.description}</p>
                <p className="text-sm font-medium">Rating: {destination.rating}/5</p>
                <p className="text-sm font-medium">Price: ${destination.price}</p>
              </div>
            ))}
            
            {/* Pagination */}
            {destinations?.pagination && (
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span>
                  Page {page} of {destinations.pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= destinations.pagination.totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hotels Section */}
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Hotels</h2>
        
        {hotelsLoading ? (
          <div>Loading hotels...</div>
        ) : (
          <div className="space-y-4">
            {hotels?.data?.map((hotel) => (
              <div key={hotel.id} className="p-3 border rounded">
                <h3 className="font-medium">{hotel.name}</h3>
                <p className="text-sm text-gray-600">{hotel.city}, {hotel.country}</p>
                <p className="text-sm">{hotel.description}</p>
                <p className="text-sm font-medium">Rating: {hotel.rating}/5</p>
                <p className="text-sm font-medium">Price per night: ${hotel.pricePerNight}</p>
                <div className="mt-2">
                  <button
                    onClick={() => handleCreateBooking('hotel', hotel.id)}
                    disabled={createBooking.isPending}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    {createBooking.isPending ? 'Booking...' : 'Book Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* API Status */}
      <div className="p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">API Status</h2>
        <div className="space-y-2 text-sm">
          <p><strong>Base URL:</strong> http://localhost:8081/api</p>
          <p><strong>Authentication:</strong> {user ? 'Authenticated' : 'Not authenticated'}</p>
          <p><strong>Destinations loaded:</strong> {destinations?.data?.length || 0}</p>
          <p><strong>Hotels loaded:</strong> {hotels?.data?.length || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default ApiExample;
