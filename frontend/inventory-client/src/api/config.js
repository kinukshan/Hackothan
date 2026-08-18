// Toggle between mock data and real API calls.
// Set VITE_USE_MOCK in .env to 'false' to use real backend.
export const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? 'false') === 'true';
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5080';
