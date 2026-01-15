// API Configuration
export const API_CONFIG = {
  // Base URL from environment variable, fallback to localhost
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api',
  
  // Timeout from environment variable, fallback to default
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  
  // Environment
  NODE_ENV: import.meta.env.VITE_NODE_ENV || 'development',
  
  // Feature flags
  ENABLE_LOGGING: import.meta.env.VITE_ENABLE_LOGGING === 'true' || true, // Always enable logging for debugging
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  
  // External services
  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
} as const;

// Log configuration on load
console.log('[API Config] Base URL:', API_CONFIG.BASE_URL);
console.log('[API Config] Timeout:', API_CONFIG.TIMEOUT);
console.log('[API Config] Logging Enabled:', API_CONFIG.ENABLE_LOGGING);

// Validate required configuration
export const validateConfig = () => {
  if (!API_CONFIG.BASE_URL) {
    throw new Error('VITE_API_BASE_URL is required');
  }
  
  if (API_CONFIG.NODE_ENV === 'production' && !API_CONFIG.STRIPE_PUBLISHABLE_KEY) {
    console.warn('Stripe key is recommended for production');
  }
};

// Export default config
export default API_CONFIG;
