import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AuthService from '../services/authService';
import { SignInRequest, SignUpRequest, AuthResponse, User } from '../types';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  token: () => [...authKeys.all, 'token'] as const,
};

/**
 * Hook for user authentication status
 */
export const useAuth = () => {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: AuthService.verifyToken,
    enabled: AuthService.isAuthenticated(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for user sign in
 */
export const useSignIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: SignInRequest) => AuthService.signIn(credentials),
    onSuccess: (data: AuthResponse) => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      queryClient.setQueryData(authKeys.user(), data.user);
      
      // Store user data in query cache
      queryClient.setQueryData(authKeys.token(), data);
    },
    onError: (error: Error) => {
      console.error('Sign in error:', error);
    },
  });
};

/**
 * Hook for user sign up
 */
export const useSignUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: SignUpRequest) => AuthService.signUp(userData),
    onSuccess: (data: AuthResponse) => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      queryClient.setQueryData(authKeys.user(), data.user);
      
      // Store user data in query cache
      queryClient.setQueryData(authKeys.token(), {
        token: data.token,
        expiresIn: data.expiresIn,
      });
    },
    onError: (error: Error) => {
      console.error('Sign up error:', error);
    },
  });
};

/**
 * Hook for user sign out
 */
export const useSignOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AuthService.signOut,
    onSuccess: () => {
      // Clear all auth-related queries
      queryClient.removeQueries({ queryKey: authKeys.all });
      
      // Clear user data from cache
      queryClient.setQueryData(authKeys.user(), null);
      queryClient.setQueryData(authKeys.token(), null);
    },
    onError: (error: Error) => {
      console.error('Sign out error:', error);
    },
  });
};

/**
 * Hook for token refresh
 */
export const useRefreshToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AuthService.refreshToken,
    onSuccess: (data: AuthResponse) => {
      // Update token in cache
      queryClient.setQueryData(authKeys.token(), {
        token: data.token,
        expiresIn: data.expiresIn,
      });
    },
    onError: (error: Error) => {
      console.error('Token refresh error:', error);
      // If refresh fails, sign out the user
      queryClient.removeQueries({ queryKey: authKeys.all });
      queryClient.setQueryData(authKeys.user(), null);
      queryClient.setQueryData(authKeys.token(), null);
    },
  });
};

/**
 * Hook to get current user from localStorage
 */
export const useCurrentUser = (): User | null => {
  return AuthService.getCurrentUser();
};

/**
 * Hook to check if user is authenticated
 */
export const useIsAuthenticated = (): boolean => {
  return AuthService.isAuthenticated();
};

